import {
  AllowedFilter,
  QueryBuilder,
  QueryParams,
} from '../../../common/query-builder';
import { Paginated } from '../../../common/dto/offset-pagination/paginated.dto';
import { AutoIncrementID } from '../../../common/types/common.type';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Brackets, DataSource, In, Repository } from 'typeorm';
import { CosplayerProfileEntity } from '../../cosplayer/entities/cosplayer-profile.entity';
import { UserEntity } from '../../user/entities/user.entity';
import { EEventApplicationStatus } from '../constants/event.constant';
import {
  CreateEventApplicationReqDto,
  ParticipateEventReqDto,
} from '../dto/event-req.dto';
import {
  EventApplicationResDto,
  EventDetailResDto,
  EventParticipantResDto,
  EventSummaryResDto,
} from '../dto/event-res.dto';
import { EventApplicationEntity } from '../entities/event-application.entity';
import { EventInterestEntity } from '../entities/event-interest.entity';
import { EventParticipantEntity } from '../entities/event-participant.entity';
import { EventEntity } from '../entities/event.entity';

@Injectable()
export class EventService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(EventEntity)
    private readonly eventRepo: Repository<EventEntity>,
    @InjectRepository(EventParticipantEntity)
    private readonly participantRepo: Repository<EventParticipantEntity>,
    @InjectRepository(EventApplicationEntity)
    private readonly applicationRepo: Repository<EventApplicationEntity>,
    @InjectRepository(EventInterestEntity)
    private readonly interestRepo: Repository<EventInterestEntity>,
  ) {}

  /**
   * Browse events / festivals directory with QueryBuilder support.
   */
  async findAll(
    query: QueryParams,
    currentUserId?: AutoIncrementID,
  ): Promise<Paginated<EventSummaryResDto>> {
    const baseQb = this.eventRepo.createQueryBuilder('event');

    const paginated = await QueryBuilder.for(baseQb, query)
      .allowedFilters([
        AllowedFilter.exact('cityId'),
        AllowedFilter.exact('status'),
        AllowedFilter.exact('isRecruiting'),
        AllowedFilter.exact('isFeaturedFestival'),
        AllowedFilter.exact('locationFilterCode'),
        AllowedFilter.partial('title'),
        AllowedFilter.partial('venue'),
        AllowedFilter.partial('locationLabel'),
        AllowedFilter.callback('search', (qb, value) => {
          const term = Array.isArray(value) ? String(value[0]) : String(value);
          const normalized = term.trim().toLowerCase();
          if (!normalized) return;
          qb.andWhere(
            new Brackets((b) => {
              b.where('LOWER(event.title) LIKE :sTerm', {
                sTerm: `%${normalized}%`,
              })
                .orWhere('LOWER(event.venue) LIKE :sTerm', {
                  sTerm: `%${normalized}%`,
                })
                .orWhere('LOWER(event.locationLabel) LIKE :sTerm', {
                  sTerm: `%${normalized}%`,
                })
                .orWhere('event.categories::text ILIKE :sTerm', {
                  sTerm: `%${normalized}%`,
                })
                .orWhere('event.filterTags::text ILIKE :sTerm', {
                  sTerm: `%${normalized}%`,
                });
            }),
          );
        }),
      ])
      .allowedSorts([
        'startAt',
        'participantsCount',
        'interestedCount',
        'createdAt',
      ])
      .defaultSort('startAt')
      .paginate();

    const eventIds = paginated.data.map((e) => e.id);
    let interestedSet = new Set<string>();
    let participatingSet = new Set<string>();

    if (currentUserId && eventIds.length > 0) {
      const [interests, participants] = await Promise.all([
        this.interestRepo.find({
          where: { userId: currentUserId, eventId: In(eventIds) },
        }),
        this.participantRepo.find({
          where: { userId: currentUserId, eventId: In(eventIds) },
        }),
      ]);
      interestedSet = new Set(interests.map((i) => String(i.eventId)));
      participatingSet = new Set(participants.map((p) => String(p.eventId)));
    }

    const mapped = paginated.data.map((event) =>
      this.toSummaryDto(
        event,
        interestedSet.has(String(event.id)),
        participatingSet.has(String(event.id)),
      ),
    );

    return new Paginated(mapped, paginated.meta, paginated.links);
  }

  /**
   * Get event detail by slug.
   */
  async findBySlug(
    slug: string,
    currentUserId?: AutoIncrementID,
  ): Promise<EventDetailResDto> {
    const event = await this.eventRepo.findOne({ where: { slug } });
    if (!event) {
      throw new NotFoundException(`Event "${slug}" not found`);
    }

    const [interest, participant, participantsList] = await Promise.all([
      currentUserId
        ? this.interestRepo.findOne({
            where: { userId: currentUserId, eventId: event.id },
          })
        : null,
      currentUserId
        ? this.participantRepo.findOne({
            where: { userId: currentUserId, eventId: event.id },
          })
        : null,
      this.participantRepo.find({
        where: { eventId: event.id },
        order: { sortOrder: 'ASC', id: 'ASC' },
      }),
    ]);

    return this.toDetailDto(
      event,
      participantsList,
      Boolean(interest),
      Boolean(participant),
    );
  }

  /**
   * Toggle event interest.
   */
  async toggleInterest(
    userId: AutoIncrementID,
    eventId: AutoIncrementID,
  ): Promise<{ interested: boolean; interestedCount: number }> {
    const event = await this.eventRepo.findOne({ where: { id: eventId } });
    if (!event) {
      throw new NotFoundException(`Event #${eventId} not found`);
    }

    return await this.dataSource.transaction(async (em) => {
      const existing = await em.findOne(EventInterestEntity, {
        where: { userId, eventId },
      });

      if (existing) {
        await em.delete(EventInterestEntity, { id: existing.id });
        await em.decrement(EventEntity, { id: eventId }, 'interestedCount', 1);
        const updated = await em.findOneOrFail(EventEntity, {
          where: { id: eventId },
        });
        return {
          interested: false,
          interestedCount: Number(updated.interestedCount),
        };
      } else {
        const item = em.create(EventInterestEntity, { userId, eventId });
        await em.save(item);
        await em.increment(EventEntity, { id: eventId }, 'interestedCount', 1);
        const updated = await em.findOneOrFail(EventEntity, {
          where: { id: eventId },
        });
        return {
          interested: true,
          interestedCount: Number(updated.interestedCount),
        };
      }
    });
  }

  /**
   * RSVP / participate in event.
   */
  async participate(
    userId: AutoIncrementID,
    eventId: AutoIncrementID,
    _dto: ParticipateEventReqDto,
  ): Promise<{ participating: boolean }> {
    const event = await this.eventRepo.findOne({ where: { id: eventId } });
    if (!event) {
      throw new NotFoundException(`Event #${eventId} not found`);
    }

    let participant = await this.participantRepo.findOne({
      where: { userId, eventId },
    });
    if (!participant) {
      const profile = await this.dataSource
        .getRepository(CosplayerProfileEntity)
        .findOne({ where: { userId } });
      const user = await this.dataSource
        .getRepository(UserEntity)
        .findOne({ where: { id: userId } });

      participant = this.participantRepo.create({
        userId,
        eventId,
        name: profile?.displayName || user?.fullName || `User #${userId}`,
        avatarUrl:
          profile?.avatarUrl ||
          user?.avatar ||
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500',
        isVerified: profile?.isVerified ?? false,
        roleLabel: profile?.roleBadge || 'Cosplayer',
        sortOrder: 0,
      });
      await this.participantRepo.save(participant);
      await this.eventRepo.increment({ id: eventId }, 'participantsCount', 1);
    }

    return { participating: true };
  }

  /**
   * Cancel participation.
   */
  async cancelParticipation(
    userId: AutoIncrementID,
    eventId: AutoIncrementID,
  ): Promise<void> {
    const participant = await this.participantRepo.findOne({
      where: { userId, eventId },
    });
    if (!participant) {
      return;
    }
    await this.participantRepo.delete({ id: participant.id });
    await this.eventRepo.decrement({ id: eventId }, 'participantsCount', 1);
  }

  /**
   * Apply for event guest/staff/recruiting role.
   */
  async apply(
    userId: AutoIncrementID,
    eventId: AutoIncrementID,
    dto: CreateEventApplicationReqDto,
  ): Promise<EventApplicationResDto> {
    const event = await this.eventRepo.findOne({ where: { id: eventId } });
    if (!event) {
      throw new NotFoundException(`Event #${eventId} not found`);
    }
    if (!event.isRecruiting) {
      throw new BadRequestException(
        'This festival is currently not accepting applications',
      );
    }

    const existing = await this.applicationRepo.findOne({
      where: { eventId, applicantUserId: userId, category: dto.category },
    });
    if (existing) {
      throw new ConflictException(
        `You have already submitted an application for category "${dto.category}"`,
      );
    }

    const app = this.applicationRepo.create({
      eventId,
      applicantUserId: userId,
      fullName: dto.fullName,
      stageName: dto.stageName,
      category: dto.category,
      phone: dto.phone,
      characterPlanned: dto.characterPlanned,
      portfolioUrl: dto.portfolioUrl ?? null,
      notes: dto.notes ?? null,
      status: EEventApplicationStatus.PENDING,
    });

    const saved = await this.applicationRepo.save(app);
    await this.eventRepo.increment({ id: eventId }, 'applicationsCount', 1);

    return this.toApplicationDto(saved);
  }

  /**
   * Get applications of user.
   */
  async getMyApplications(
    userId: AutoIncrementID,
  ): Promise<EventApplicationResDto[]> {
    const list = await this.applicationRepo.find({
      where: { applicantUserId: userId },
      order: { createdAt: 'DESC' },
    });
    return list.map((item) => this.toApplicationDto(item));
  }

  // =================== MAPPERS ===================

  private toSummaryDto(
    e: EventEntity,
    isInterested = false,
    isParticipating = false,
  ): EventSummaryResDto {
    return {
      id: e.id,
      slug: e.slug,
      title: e.title,
      dayLabel: e.dayLabel,
      monthLabel: e.monthLabel,
      yearLabel: e.yearLabel ?? null,
      dateString: e.dateString,
      startAt: e.startAt,
      endAt: e.endAt ?? null,
      locationLabel: e.locationLabel,
      locationFilterCode: e.locationFilterCode,
      cityId: e.cityId ?? null,
      venue: e.venue,
      imageUrl: e.imageUrl,
      bannerImageUrl: e.bannerImageUrl ?? null,
      ticketPriceLabel: e.ticketPriceLabel ?? null,
      ticketPriceAmount: e.ticketPriceAmount ?? null,
      isRecruiting: e.isRecruiting,
      isFeaturedFestival: e.isFeaturedFestival,
      registrationCta: e.registrationCta ?? null,
      categories: e.categories || [],
      filterTags: e.filterTags || [],
      status: e.status,
      participantsCount: Number(e.participantsCount || 0),
      interestedCount: Number(e.interestedCount || 0),
      applicationsCount: Number(e.applicationsCount || 0),
      isInterestedByCurrentUser: isInterested,
      isParticipatingByCurrentUser: isParticipating,
    };
  }

  private toDetailDto(
    e: EventEntity,
    participants: EventParticipantEntity[],
    isInterested = false,
    isParticipating = false,
  ): EventDetailResDto {
    return {
      ...this.toSummaryDto(e, isInterested, isParticipating),
      description: e.description,
      schedule: e.schedule || [],
      participants: participants.map((p) => this.toParticipantDto(p)),
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
    };
  }

  private toParticipantDto(p: EventParticipantEntity): EventParticipantResDto {
    return {
      id: p.id,
      eventId: p.eventId,
      userId: p.userId ?? null,
      name: p.name,
      avatarUrl: p.avatarUrl,
      isVerified: p.isVerified,
      roleLabel: p.roleLabel ?? null,
      sortOrder: p.sortOrder,
    };
  }

  private toApplicationDto(a: EventApplicationEntity): EventApplicationResDto {
    return {
      id: a.id,
      eventId: a.eventId,
      applicantUserId: a.applicantUserId,
      fullName: a.fullName,
      stageName: a.stageName,
      category: a.category,
      phone: a.phone,
      characterPlanned: a.characterPlanned,
      portfolioUrl: a.portfolioUrl ?? null,
      notes: a.notes ?? null,
      status: a.status,
      createdAt: a.createdAt,
    };
  }
}
