import {
  AllowedFilter,
  QueryBuilder,
  QueryParams,
} from '../../../common/query-builder';
import { Paginated } from '../../../common/dto/offset-pagination/paginated.dto';
import { AutoIncrementID } from '../../../common/types/common.type';
import { slugifyAscii } from '../../../common/utils/slug.util';
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
import { CosplayerProfileUtil } from '../../cosplayer/utils/cosplayer-profile.util';
import {
  EEventApplicationStatus,
  EEventStatus,
} from '../constants/event.constant';
import {
  CreateEventApplicationReqDto,
  CreateEventReqDto,
  ParticipateEventReqDto,
  UpdateEventReqDto,
  UpdateEventStatusReqDto,
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
    @InjectRepository(CosplayerProfileEntity)
    private readonly profileRepo: Repository<CosplayerProfileEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
  ) {}

  /**
   * Browse events / festivals directory with QueryBuilder support.
   */
  async findAll(
    query: QueryParams,
    currentUserId?: AutoIncrementID,
    options?: { publicOnly?: boolean },
  ): Promise<Paginated<EventSummaryResDto>> {
    const baseQb = this.eventRepo.createQueryBuilder('event');

    if (options?.publicOnly) {
      baseQb.andWhere('event.status != :draftStatus', {
        draftStatus: EEventStatus.DRAFT,
      });
    }

    const paginated = await QueryBuilder.for(baseQb, query)
      .allowedFilters([
        AllowedFilter.exact('cityId'),
        AllowedFilter.exact('status'),
        AllowedFilter.exact('isRecruiting'),
        AllowedFilter.exact('isFeaturedFestival'),
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
    let verifiedParticipantEventIds = new Set<string>();
    const participantsPreviewMap = new Map<string, EventParticipantResDto[]>();

    if (eventIds.length > 0) {
      const [interests, userParticipants, participantPreviews, verifiedEvents] =
        await Promise.all([
          currentUserId
            ? this.interestRepo.find({
                where: { userId: currentUserId, eventId: In(eventIds) },
              })
            : Promise.resolve([]),
          currentUserId
            ? this.participantRepo.find({
                where: { userId: currentUserId, eventId: In(eventIds) },
              })
            : Promise.resolve([]),
          this.findParticipantPreviews(eventIds),
          this.findVerifiedParticipantEventIds(eventIds),
        ]);
      verifiedParticipantEventIds = verifiedEvents;

      interestedSet = new Set(interests.map((i) => String(i.eventId)));
      participatingSet = new Set(
        userParticipants.map((p) => String(p.eventId)),
      );

      const enriched = await this.enrichParticipants(participantPreviews);
      for (const p of enriched) {
        const key = String(p.eventId);
        const bucket = participantsPreviewMap.get(key) ?? [];
        bucket.push(p);
        participantsPreviewMap.set(key, bucket);
      }
    }

    const mapped = paginated.data.map((event) =>
      this.toSummaryDto(
        event,
        interestedSet.has(String(event.id)),
        participatingSet.has(String(event.id)),
        participantsPreviewMap.get(String(event.id)) ?? [],
        verifiedParticipantEventIds.has(String(event.id)),
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
    if (!event || event.status === EEventStatus.DRAFT) {
      throw new NotFoundException(`Event "${slug}" not found`);
    }

    const [interest, participant] = await Promise.all([
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
    ]);

    return this.toDetailDto(event, Boolean(interest), Boolean(participant));
  }

  async getPublicParticipants(
    slug: string,
    query: QueryParams,
  ): Promise<Paginated<EventParticipantResDto>> {
    const event = await this.eventRepo.findOne({ where: { slug } });
    if (!event || event.status === EEventStatus.DRAFT) {
      throw new NotFoundException(`Event "${slug}" not found`);
    }
    return this.paginateParticipants(event.id, query);
  }

  async getAdminParticipants(
    eventId: AutoIncrementID,
    query: QueryParams,
  ): Promise<Paginated<EventParticipantResDto>> {
    const eventExists = await this.eventRepo.exists({ where: { id: eventId } });
    if (!eventExists) {
      throw new NotFoundException(`Event #${eventId} not found`);
    }
    return this.paginateParticipants(eventId, query);
  }

  private async paginateParticipants(
    eventId: AutoIncrementID,
    query: QueryParams,
  ): Promise<Paginated<EventParticipantResDto>> {
    const paginated = await QueryBuilder.for(
      this.participantRepo
        .createQueryBuilder('participant')
        .where('participant.eventId = :eventId', { eventId }),
      query,
    )
      .allowedSorts(['sortOrder', 'id'])
      .allowedFilters([])
      .allowedIncludes([])
      .defaultSort('sortOrder,id')
      .setLimit(20, 100)
      .paginate();

    const participants = await this.enrichParticipants(paginated.data);
    return new Paginated(participants, paginated.meta, paginated.links);
  }

  private async findParticipantPreviews(
    eventIds: AutoIncrementID[],
  ): Promise<EventParticipantEntity[]> {
    return this.participantRepo
      .createQueryBuilder('participant')
      .where(
        `participant.id IN (
          SELECT ranked.id
          FROM (
            SELECT ep.id,
              ROW_NUMBER() OVER (
                PARTITION BY ep.event_id
                ORDER BY ep.sort_order ASC, ep.id ASC
              ) AS participant_rank
            FROM event_participants ep
            WHERE ep.event_id IN (:...eventIds)
          ) ranked
          WHERE ranked.participant_rank <= 3
        )`,
        { eventIds },
      )
      .orderBy('participant.eventId', 'ASC')
      .addOrderBy('participant.sortOrder', 'ASC')
      .addOrderBy('participant.id', 'ASC')
      .getMany();
  }

  private async findVerifiedParticipantEventIds(
    eventIds: AutoIncrementID[],
  ): Promise<Set<string>> {
    const rows = await this.participantRepo
      .createQueryBuilder('participant')
      .innerJoin(
        CosplayerProfileEntity,
        'profile',
        'profile.userId = participant.userId AND profile.isVerified = true AND profile.deletedAt IS NULL',
      )
      .select('participant.eventId', 'eventId')
      .where('participant.eventId IN (:...eventIds)', { eventIds })
      .groupBy('participant.eventId')
      .getRawMany<{ eventId: string }>();

    return new Set(rows.map((row) => String(row.eventId)));
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

    await this.dataSource.transaction(async (em) => {
      let participant = await em.findOne(EventParticipantEntity, {
        where: { userId, eventId },
      });
      if (!participant) {
        const profile = await em.findOne(CosplayerProfileEntity, {
          where: { userId },
        });

        participant = em.create(EventParticipantEntity, {
          userId,
          eventId,
          roleLabel: profile?.roleBadge || 'Cosplayer',
          sortOrder: 0,
        });
        await em.save(EventParticipantEntity, participant);
        await em.increment(
          EventEntity,
          { id: eventId },
          'participantsCount',
          1,
        );
      }
    });

    return { participating: true };
  }

  /**
   * Cancel participation.
   */
  async cancelParticipation(
    userId: AutoIncrementID,
    eventId: AutoIncrementID,
  ): Promise<void> {
    await this.dataSource.transaction(async (em) => {
      const participant = await em.findOne(EventParticipantEntity, {
        where: { userId, eventId },
      });
      if (!participant) {
        return;
      }
      await em.delete(EventParticipantEntity, { id: participant.id });
      await em.decrement(EventEntity, { id: eventId }, 'participantsCount', 1);
    });
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

    return await this.dataSource.transaction(async (em) => {
      const saved = await em.save(EventApplicationEntity, app);
      await em.increment(EventEntity, { id: eventId }, 'applicationsCount', 1);
      return this.toApplicationDto(saved);
    });
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

  async findById(eventId: AutoIncrementID): Promise<EventDetailResDto> {
    const event = await this.eventRepo.findOne({ where: { id: eventId } });
    if (!event) {
      throw new NotFoundException(`Event #${eventId} not found`);
    }
    return this.toDetailDto(event, false, false);
  }

  async createEvent(
    adminId: AutoIncrementID,
    dto: CreateEventReqDto,
  ): Promise<EventDetailResDto> {
    let slugCandidate = slugifyAscii(dto.title);

    if (!slugCandidate) {
      slugCandidate = `event-${Date.now().toString(36)}`;
    }
    const slugCollision = await this.eventRepo.count({
      where: { slug: slugCandidate },
    });
    if (slugCollision > 0) {
      slugCandidate = `${slugCandidate}-${Date.now().toString(36).slice(-4)}`;
    }

    const event = this.eventRepo.create({
      slug: slugCandidate,
      title: dto.title,
      startAt: dto.startAt,
      endAt: dto.endAt ?? null,
      locationLabel: dto.locationLabel,
      cityId: dto.cityId ?? null,
      organizerUserId: dto.organizerUserId ?? null,
      organizerName: dto.organizerName ?? null,
      venue: dto.venue,
      imageUrl: dto.imageUrl,
      bannerImageUrl: dto.bannerImageUrl ?? null,
      description: dto.description,
      ticketPriceAmount: dto.ticketPriceAmount ?? null,
      isRecruiting: dto.isRecruiting ?? false,
      isFeaturedFestival: dto.isFeaturedFestival ?? false,
      schedule: dto.schedule || [],
      categories: dto.categories || [],
      status: dto.status ?? EEventStatus.UPCOMING,
      createdByAdminId: adminId,
      participantsCount: 0,
      applicationsCount: 0,
      interestedCount: 0,
    });

    const saved = await this.eventRepo.save(event);
    return this.toDetailDto(saved, false, false);
  }

  async updateEvent(
    eventId: AutoIncrementID,
    dto: UpdateEventReqDto,
  ): Promise<EventDetailResDto> {
    const event = await this.eventRepo.findOne({ where: { id: eventId } });
    if (!event) {
      throw new NotFoundException(`Event #${eventId} not found`);
    }

    if (dto.title !== undefined) event.title = dto.title;
    if (dto.startAt !== undefined) event.startAt = dto.startAt;
    if (dto.endAt !== undefined) event.endAt = dto.endAt;
    if (dto.locationLabel !== undefined)
      event.locationLabel = dto.locationLabel;
    if (dto.cityId !== undefined) event.cityId = dto.cityId;
    if (dto.organizerUserId !== undefined)
      event.organizerUserId = dto.organizerUserId;
    if (dto.organizerName !== undefined)
      event.organizerName = dto.organizerName;
    if (dto.venue !== undefined) event.venue = dto.venue;
    if (dto.imageUrl !== undefined) event.imageUrl = dto.imageUrl;
    if (dto.bannerImageUrl !== undefined)
      event.bannerImageUrl = dto.bannerImageUrl;
    if (dto.description !== undefined) event.description = dto.description;
    if (dto.ticketPriceAmount !== undefined)
      event.ticketPriceAmount = dto.ticketPriceAmount;
    if (dto.isRecruiting !== undefined) event.isRecruiting = dto.isRecruiting;
    if (dto.isFeaturedFestival !== undefined)
      event.isFeaturedFestival = dto.isFeaturedFestival;
    if (dto.schedule !== undefined) event.schedule = dto.schedule;
    if (dto.categories !== undefined) event.categories = dto.categories;
    if (dto.status !== undefined) event.status = dto.status;

    const saved = await this.eventRepo.save(event);
    return this.toDetailDto(saved, false, false);
  }

  async updateEventStatus(
    eventId: AutoIncrementID,
    dto: UpdateEventStatusReqDto,
  ): Promise<EventDetailResDto> {
    const event = await this.eventRepo.findOne({ where: { id: eventId } });
    if (!event) {
      throw new NotFoundException(`Event #${eventId} not found`);
    }

    event.status = dto.status;
    if (dto.isFeaturedFestival !== undefined) {
      event.isFeaturedFestival = dto.isFeaturedFestival;
    }
    if (dto.isRecruiting !== undefined) {
      event.isRecruiting = dto.isRecruiting;
    }

    const saved = await this.eventRepo.save(event);
    return this.toDetailDto(saved, false, false);
  }

  async deleteEvent(eventId: AutoIncrementID): Promise<void> {
    const event = await this.eventRepo.findOne({ where: { id: eventId } });
    if (!event) {
      throw new NotFoundException(`Event #${eventId} not found`);
    }
    await this.eventRepo.softDelete({ id: eventId });
  }

  // =================== MAPPERS ===================

  private formatDateLabels(
    startAt: Date,
    endAt?: Date | null,
  ): {
    dayLabel: string;
    monthLabel: string;
    yearLabel: string;
    dateString: string;
  } {
    const start = new Date(startAt);
    const day = start.getDate();
    const month = start.getMonth() + 1;
    const year = start.getFullYear();
    const dayLabel = String(day).padStart(2, '0');
    const monthLabel = `Tháng ${month}`;
    const yearLabel = String(year);

    let dateString = `${dayLabel} Tháng ${month}, ${yearLabel}`;
    if (endAt) {
      const end = new Date(endAt);
      const endDay = String(end.getDate()).padStart(2, '0');
      const endMonth = end.getMonth() + 1;
      const endYear = end.getFullYear();
      if (day !== end.getDate() || month !== endMonth || year !== endYear) {
        dateString =
          month === endMonth && year === endYear
            ? `${dayLabel} - ${endDay} Tháng ${month}, ${yearLabel}`
            : `${dayLabel}/${String(month).padStart(2, '0')} - ${endDay}/${String(endMonth).padStart(2, '0')}/${endYear}`;
      }
    }

    return { dayLabel, monthLabel, yearLabel, dateString };
  }

  private formatTicketPriceLabel(amount?: number | null): string | null {
    if (amount === null || amount === undefined) {
      return null;
    }
    if (Number(amount) <= 0) {
      return 'Miễn phí';
    }
    return `${Number(amount).toLocaleString('vi-VN')}đ`;
  }

  private async enrichParticipants(
    participants: EventParticipantEntity[],
  ): Promise<EventParticipantResDto[]> {
    if (participants.length === 0) {
      return [];
    }

    const userIds = Array.from(
      new Set(participants.map((p) => p.userId).filter(Boolean)),
    );
    const profileMap =
      userIds.length > 0
        ? await CosplayerProfileUtil.loadProfilesMap(this.profileRepo, userIds)
        : new Map<string, CosplayerProfileEntity>();
    const users =
      userIds.length > 0
        ? await this.userRepo.find({ where: { id: In(userIds) } })
        : [];

    const userMap = new Map(users.map((u) => [String(u.id), u]));

    return participants.map((p) => {
      const key = String(p.userId);
      const profile = profileMap.get(key);
      const user = userMap.get(key);
      const display = CosplayerProfileUtil.formatDisplay(profile, user);
      return {
        id: p.id,
        eventId: p.eventId,
        userId: p.userId,
        name: display.displayName || `User #${p.userId}`,
        avatarUrl: display.avatarUrl ?? user?.avatar ?? null,
        isVerified: display.isVerified,
        roleLabel: p.roleLabel ?? display.roleBadge ?? null,
        sortOrder: p.sortOrder,
      };
    });
  }

  private toSummaryDto(
    e: EventEntity,
    isInterested = false,
    isParticipating = false,
    participantsPreview?: EventParticipantResDto[],
    hasVerifiedParticipant?: boolean,
  ): EventSummaryResDto {
    const dateInfo = this.formatDateLabels(e.startAt, e.endAt);
    return {
      id: e.id,
      slug: e.slug,
      title: e.title,
      dayLabel: dateInfo.dayLabel,
      monthLabel: dateInfo.monthLabel,
      yearLabel: dateInfo.yearLabel,
      dateString: dateInfo.dateString,
      startAt: e.startAt,
      endAt: e.endAt ?? null,
      locationLabel: e.locationLabel,
      cityId: e.cityId ?? null,
      organizerUserId: e.organizerUserId ?? null,
      organizerName: e.organizerName ?? null,
      venue: e.venue,
      imageUrl: e.imageUrl,
      bannerImageUrl: e.bannerImageUrl ?? null,
      description: e.description,
      ticketPriceLabel: this.formatTicketPriceLabel(e.ticketPriceAmount),
      ticketPriceAmount: e.ticketPriceAmount ?? null,
      isRecruiting: e.isRecruiting,
      isFeaturedFestival: e.isFeaturedFestival,
      categories: e.categories || [],
      status: e.status,
      participantsCount: Number(e.participantsCount || 0),
      interestedCount: Number(e.interestedCount || 0),
      applicationsCount: Number(e.applicationsCount || 0),
      ...(participantsPreview !== undefined ? { participantsPreview } : {}),
      ...(hasVerifiedParticipant !== undefined
        ? { hasVerifiedParticipant }
        : {}),
      isInterestedByCurrentUser: isInterested,
      isParticipatingByCurrentUser: isParticipating,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
    };
  }

  private toDetailDto(
    e: EventEntity,
    isInterested = false,
    isParticipating = false,
  ): EventDetailResDto {
    return {
      ...this.toSummaryDto(e, isInterested, isParticipating),
      description: e.description,
      schedule: e.schedule || [],
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
