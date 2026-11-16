import {
  AllowedFilter,
  QueryBuilder,
  QueryParams,
} from '../../../common/query-builder';
import { Paginated } from '../../../common/dto/offset-pagination/paginated.dto';
import { AutoIncrementID } from '../../../common/types/common.type';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { UserEntity } from '../../user/entities/user.entity';
import { EBookingRequestStatus } from '../constants/booking.constant';
import {
  CreateBookingRequestReqDto,
  SendDirectMessageReqDto,
  UpdateBookingStatusReqDto,
} from '../dto/booking-req.dto';
import {
  BookingRequestResDto,
  ConversationSummaryResDto,
  DirectMessageResDto,
} from '../dto/booking-res.dto';
import { BookingRequestEntity } from '../entities/booking-request.entity';
import { DirectMessageEntity } from '../entities/direct-message.entity';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(BookingRequestEntity)
    private readonly bookingRepo: Repository<BookingRequestEntity>,
    @InjectRepository(DirectMessageEntity)
    private readonly messageRepo: Repository<DirectMessageEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
  ) {}

  // =================== BOOKING REQUESTS ===================

  async createBookingRequest(
    userId: AutoIncrementID,
    dto: CreateBookingRequestReqDto,
  ): Promise<BookingRequestResDto> {
    if (String(userId) === String(dto.targetCosplayerId)) {
      throw new BadRequestException(
        'You cannot send a booking request to yourself',
      );
    }

    const targetUser = await this.userRepo.findOne({
      where: { id: dto.targetCosplayerId },
    });
    if (!targetUser) {
      throw new NotFoundException(
        `Target cosplayer #${dto.targetCosplayerId} not found`,
      );
    }

    const booking = this.bookingRepo.create({
      targetCosplayerId: dto.targetCosplayerId,
      requesterUserId: userId,
      bookingType: dto.bookingType,
      fullName: dto.fullName,
      contactInfo: dto.contactInfo,
      targetDateLabel: dto.targetDateLabel,
      budgetLabel: dto.budgetLabel,
      details: dto.details,
      status: EBookingRequestStatus.PENDING,
    });

    const saved = await this.bookingRepo.save(booking);
    return this.toBookingDto(saved);
  }

  async getMySentBookings(
    userId: AutoIncrementID,
    query: QueryParams,
  ): Promise<Paginated<BookingRequestResDto>> {
    const baseQb = this.bookingRepo
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.targetCosplayer', 'targetCosplayer')
      .where('booking.requesterUserId = :userId', { userId });

    const paginated = await QueryBuilder.for(baseQb, query)
      .allowedFilters([
        AllowedFilter.exact('status'),
        AllowedFilter.partial('bookingType'),
      ])
      .allowedSorts(['createdAt', 'status'])
      .defaultSort('-createdAt')
      .paginate();

    const mapped = paginated.data.map((item) => this.toBookingDto(item));
    return new Paginated(mapped, paginated.meta, paginated.links);
  }

  async getMyReceivedBookings(
    userId: AutoIncrementID,
    query: QueryParams,
  ): Promise<Paginated<BookingRequestResDto>> {
    const baseQb = this.bookingRepo
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.requesterUser', 'requesterUser')
      .where('booking.targetCosplayerId = :userId', { userId });

    const paginated = await QueryBuilder.for(baseQb, query)
      .allowedFilters([
        AllowedFilter.exact('status'),
        AllowedFilter.partial('bookingType'),
      ])
      .allowedSorts(['createdAt', 'status'])
      .defaultSort('-createdAt')
      .paginate();

    const mapped = paginated.data.map((item) => this.toBookingDto(item));
    return new Paginated(mapped, paginated.meta, paginated.links);
  }

  async updateBookingStatus(
    userId: AutoIncrementID,
    bookingId: AutoIncrementID,
    dto: UpdateBookingStatusReqDto,
  ): Promise<BookingRequestResDto> {
    const booking = await this.bookingRepo.findOne({
      where: { id: bookingId },
      relations: ['targetCosplayer', 'requesterUser'],
    });

    if (!booking) {
      throw new NotFoundException(`Booking request #${bookingId} not found`);
    }

    const isTarget = String(booking.targetCosplayerId) === String(userId);
    const isRequester = String(booking.requesterUserId) === String(userId);

    if (!isTarget && !isRequester) {
      throw new ForbiddenException(
        'You do not have access to this booking request',
      );
    }

    if (
      dto.status === EBookingRequestStatus.CANCELLED &&
      !isRequester &&
      !isTarget
    ) {
      throw new ForbiddenException(
        'Only the requester or target can cancel the booking',
      );
    }

    if (
      (dto.status === EBookingRequestStatus.ACCEPTED ||
        dto.status === EBookingRequestStatus.DECLINED ||
        dto.status === EBookingRequestStatus.COMPLETED) &&
      !isTarget
    ) {
      throw new ForbiddenException(
        'Only the cosplayer can accept, decline, or complete bookings',
      );
    }

    booking.status = dto.status;
    if (dto.responseNote !== undefined) {
      booking.responseNote = dto.responseNote;
    }
    booking.respondedAt = new Date();

    const saved = await this.bookingRepo.save(booking);
    return this.toBookingDto(saved);
  }

  // =================== DIRECT MESSAGES ===================

  async sendMessage(
    senderId: AutoIncrementID,
    dto: SendDirectMessageReqDto,
  ): Promise<DirectMessageResDto> {
    if (String(senderId) === String(dto.recipientId)) {
      throw new BadRequestException(
        'You cannot send a direct message to yourself',
      );
    }

    const recipient = await this.userRepo.findOne({
      where: { id: dto.recipientId },
    });
    if (!recipient) {
      throw new NotFoundException(`Recipient #${dto.recipientId} not found`);
    }

    const message = this.messageRepo.create({
      senderId,
      recipientId: dto.recipientId,
      content: dto.content,
      isRead: false,
    });

    const saved = await this.messageRepo.save(message);
    return this.toMessageDto(saved);
  }

  async getConversation(
    userId: AutoIncrementID,
    partnerId: AutoIncrementID,
    query: QueryParams,
  ): Promise<Paginated<DirectMessageResDto>> {
    const baseQb = this.messageRepo
      .createQueryBuilder('msg')
      .leftJoinAndSelect('msg.sender', 'sender')
      .leftJoinAndSelect('msg.recipient', 'recipient')
      .where(
        new Brackets((b) => {
          b.where('msg.senderId = :userId AND msg.recipientId = :partnerId', {
            userId,
            partnerId,
          }).orWhere(
            'msg.senderId = :partnerId AND msg.recipientId = :userId',
            {
              userId,
              partnerId,
            },
          );
        }),
      );

    const paginated = await QueryBuilder.for(baseQb, query)
      .allowedSorts(['createdAt'])
      .defaultSort('-createdAt')
      .paginate();

    const mapped = paginated.data.map((msg) => this.toMessageDto(msg));
    return new Paginated(mapped, paginated.meta, paginated.links);
  }

  async getConversations(
    userId: AutoIncrementID,
  ): Promise<ConversationSummaryResDto[]> {
    // Fetch recent direct messages involving this user
    const recentMessages = await this.messageRepo
      .createQueryBuilder('msg')
      .leftJoinAndSelect('msg.sender', 'sender')
      .leftJoinAndSelect('msg.recipient', 'recipient')
      .where('msg.senderId = :userId OR msg.recipientId = :userId', { userId })
      .orderBy('msg.createdAt', 'DESC')
      .limit(200)
      .getMany();

    const conversationsMap = new Map<string, ConversationSummaryResDto>();

    for (const msg of recentMessages) {
      const isSender = String(msg.senderId) === String(userId);
      const partnerUser = isSender ? msg.recipient : msg.sender;
      const partnerId = isSender
        ? String(msg.recipientId)
        : String(msg.senderId);

      if (!conversationsMap.has(partnerId)) {
        conversationsMap.set(partnerId, {
          partnerUserId: partnerId as unknown as AutoIncrementID,
          partnerDisplayName:
            partnerUser?.fullName ||
            partnerUser?.username ||
            partnerUser?.firstName ||
            `User #${partnerId}`,
          partnerAvatarUrl: partnerUser?.avatar || null,
          lastMessage: msg.content,
          lastMessageAt: msg.createdAt,
          unreadCount: 0,
        });
      }

      if (!isSender && !msg.isRead) {
        const conv = conversationsMap.get(partnerId)!;
        conv.unreadCount += 1;
      }
    }

    return Array.from(conversationsMap.values());
  }

  async markAsRead(
    userId: AutoIncrementID,
    partnerId: AutoIncrementID,
  ): Promise<void> {
    await this.messageRepo
      .createQueryBuilder()
      .update(DirectMessageEntity)
      .set({ isRead: true, readAt: new Date() })
      .where(
        'recipientId = :userId AND senderId = :partnerId AND isRead = false',
        {
          userId,
          partnerId,
        },
      )
      .execute();
  }

  // =================== MAPPERS ===================

  private toBookingDto(b: BookingRequestEntity): BookingRequestResDto {
    return {
      id: b.id,
      targetCosplayerId: b.targetCosplayerId,
      targetCosplayer: b.targetCosplayer
        ? {
            id: b.targetCosplayer.id,
            displayName:
              b.targetCosplayer.fullName ||
              b.targetCosplayer.username ||
              b.targetCosplayer.firstName ||
              'Cosplayer',
            avatarUrl: b.targetCosplayer.avatar ?? null,
          }
        : undefined,
      requesterUserId: b.requesterUserId,
      requesterUser: b.requesterUser
        ? {
            id: b.requesterUser.id,
            displayName:
              b.requesterUser.fullName ||
              b.requesterUser.username ||
              b.requesterUser.firstName ||
              'User',
            avatarUrl: b.requesterUser.avatar ?? null,
          }
        : undefined,
      bookingType: b.bookingType,
      fullName: b.fullName,
      contactInfo: b.contactInfo,
      targetDateLabel: b.targetDateLabel,
      budgetLabel: b.budgetLabel,
      details: b.details,
      status: b.status,
      responseNote: b.responseNote ?? null,
      respondedAt: b.respondedAt ?? null,
      createdAt: b.createdAt,
    };
  }

  private toMessageDto(m: DirectMessageEntity): DirectMessageResDto {
    return {
      id: m.id,
      senderId: m.senderId,
      sender: m.sender
        ? {
            id: m.sender.id,
            displayName:
              m.sender.fullName ||
              m.sender.username ||
              m.sender.firstName ||
              'User',
            avatarUrl: m.sender.avatar ?? null,
          }
        : undefined,
      recipientId: m.recipientId,
      recipient: m.recipient
        ? {
            id: m.recipient.id,
            displayName:
              m.recipient.fullName ||
              m.recipient.username ||
              m.recipient.firstName ||
              'User',
            avatarUrl: m.recipient.avatar ?? null,
          }
        : undefined,
      content: m.content,
      isRead: m.isRead,
      readAt: m.readAt ?? null,
      createdAt: m.createdAt,
    };
  }
}
