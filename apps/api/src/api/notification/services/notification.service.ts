import {
  AllowedFilter,
  QueryBuilder,
  QueryParams,
} from '../../../common/query-builder';
import { Paginated } from '../../../common/dto/offset-pagination/paginated.dto';
import { AutoIncrementID } from '../../../common/types/common.type';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

    const mapped = paginated.data.map((item) => this.toNotificationDto(item));
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

  private toNotificationDto(n: NotificationEntity): NotificationResDto {
    return {
      id: n.id,
      recipientUserId: n.recipientUserId,
      category: n.category,
      type: n.type,
      actorUserId: n.actorUserId ?? null,
      actorName: n.actorName ?? null,
      actorAvatarUrl: n.actorAvatarUrl ?? null,
      actorRole: n.actorRole ?? null,
      actorIsVerified: n.actorIsVerified,
      title: n.title,
      description: n.description,
      actionUrl: n.actionUrl ?? null,
      actionLabel: n.actionLabel ?? null,
      secondaryActionLabel: n.secondaryActionLabel ?? null,
      previewImageUrl: n.previewImageUrl ?? null,
      subjectType: n.subjectType ?? null,
      subjectId: n.subjectId ?? null,
      isRead: n.isRead,
      readAt: n.readAt ?? null,
      createdAt: n.createdAt,
    };
  }
}
