import {
  AllowedFilter,
  QueryBuilder,
  QueryParams,
} from '../../../common/query-builder';
import { Paginated } from '../../../common/dto/offset-pagination/paginated.dto';
import { AutoIncrementID } from '../../../common/types/common.type';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CosplayerProfileEntity } from '../../cosplayer/entities/cosplayer-profile.entity';
import {
  NotificationResDto,
  UnreadCountResDto,
} from '../dto/notification-res.dto';
import { NotificationEntity } from '../entities/notification.entity';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(NotificationEntity)
    private readonly notificationRepo: Repository<NotificationEntity>,
    @InjectRepository(CosplayerProfileEntity)
    private readonly profileRepo: Repository<CosplayerProfileEntity>,
  ) {}

  /**
   * Get paginated notifications for current user.
   */
  async getMyNotifications(
    userId: AutoIncrementID,
    query: QueryParams,
  ): Promise<Paginated<NotificationResDto>> {
    const baseQb = this.notificationRepo
      .createQueryBuilder('noti')
      .leftJoinAndSelect('noti.actorUser', 'actorUser')
      .where('noti.recipientUserId = :userId', { userId });

    const paginated = await QueryBuilder.for(baseQb, query)
      .allowedFilters([
        AllowedFilter.exact('category'),
        AllowedFilter.exact('type'),
        AllowedFilter.exact('isRead'),
      ])
      .allowedSorts(['createdAt'])
      .defaultSort('-createdAt')
      .paginate();

    const actorIds = Array.from(
      new Set(
        paginated.data
          .map((item) => item.actorUserId)
          .filter((v): v is AutoIncrementID => Boolean(v)),
      ),
    );
    const profiles =
      actorIds.length > 0
        ? await this.profileRepo.find({ where: { userId: In(actorIds) } })
        : [];
    const profileMap = new Map(profiles.map((p) => [String(p.userId), p]));

    const mapped = paginated.data.map((item) =>
      this.toNotificationDto(
        item,
        item.actorUserId ? profileMap.get(String(item.actorUserId)) : undefined,
      ),
    );
    return new Paginated(mapped, paginated.meta, paginated.links);
  }

  /**
   * Get unread notifications count for badge display.
   */
  async getUnreadCount(userId: AutoIncrementID): Promise<UnreadCountResDto> {
    const unreadCount = await this.notificationRepo.count({
      where: { recipientUserId: userId, isRead: false },
    });
    return { unreadCount };
  }

  /**
   * Mark single notification as read.
   */
  async markAsRead(
    userId: AutoIncrementID,
    notificationId: AutoIncrementID,
  ): Promise<void> {
    const noti = await this.notificationRepo.findOne({
      where: { id: notificationId, recipientUserId: userId },
    });
    if (!noti) {
      throw new NotFoundException(`Notification #${notificationId} not found`);
    }

    if (!noti.isRead) {
      noti.isRead = true;
      noti.readAt = new Date();
      await this.notificationRepo.save(noti);
    }
  }

  /**
   * Mark all unread notifications as read.
   */
  async markAllAsRead(userId: AutoIncrementID): Promise<void> {
    await this.notificationRepo
      .createQueryBuilder()
      .update(NotificationEntity)
      .set({ isRead: true, readAt: new Date() })
      .where('recipientUserId = :userId AND isRead = false', { userId })
      .execute();
  }

  private toNotificationDto(
    n: NotificationEntity,
    profile?: CosplayerProfileEntity,
  ): NotificationResDto {
    const actorName = n.actorUserId
      ? profile?.displayName || n.actorUser?.fullName || null
      : null;
    const actorAvatarUrl = n.actorUserId
      ? (profile?.avatarUrl ?? n.actorUser?.avatar ?? null)
      : null;
    const actorRole = n.actorUserId
      ? profile?.roleBadge || n.actorUser?.role || null
      : null;

    return {
      id: n.id,
      recipientUserId: n.recipientUserId,
      category: n.category,
      type: n.type,
      actorUserId: n.actorUserId ?? null,
      actorName,
      actorAvatarUrl,
      actorRole,
      actorIsVerified: profile?.isVerified ?? false,
      title: n.title,
      description: n.description,
      actionUrl: n.actionUrl ?? null,
      previewImageUrl: n.previewImageUrl ?? null,
      subjectType: n.subjectType ?? null,
      subjectId: n.subjectId ?? null,
      isRead: n.isRead,
      readAt: n.readAt ?? null,
      createdAt: n.createdAt,
    };
  }
}
