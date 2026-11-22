import { QueryBuilder, QueryParams } from '../../../common/query-builder';
import { Paginated } from '../../../common/dto/offset-pagination/paginated.dto';
import { AutoIncrementID } from '../../../common/types/common.type';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { UserEntity } from '../../user/entities/user.entity';
import { CosplayerProfileEntity } from '../../cosplayer/entities/cosplayer-profile.entity';
import {
  ENotificationCategory,
  ENotificationType,
} from '../../notification/constants/notification.constant';
import { NotificationEntity } from '../../notification/entities/notification.entity';
import { FollowToggleResDto, FollowUserResDto } from '../dto/social-res.dto';
import { UserFollowEntity } from '../entities/user-follow.entity';

@Injectable()
export class SocialService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(UserFollowEntity)
    private readonly followRepo: Repository<UserFollowEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
  ) {}

  /**
   * Follow or unfollow a user / cosplayer atomically.
   */
  async toggleFollow(
    followerId: AutoIncrementID,
    followingId: AutoIncrementID,
  ): Promise<FollowToggleResDto> {
    if (String(followerId) === String(followingId)) {
      throw new BadRequestException('You cannot follow yourself');
    }

    return this.dataSource.transaction(async (em) => {
      const existing = await em.findOne(UserFollowEntity, {
        where: { followerId, followingId },
      });

      let isFollowingNow: boolean;

      if (existing) {
        await em.delete(UserFollowEntity, { id: existing.id });
        await em.decrement(
          UserEntity,
          { id: followingId },
          'followersCount',
          1,
        );
        await em.decrement(UserEntity, { id: followerId }, 'followingCount', 1);
        isFollowingNow = false;
      } else {
        const newFollow = em.create(UserFollowEntity, {
          followerId,
          followingId,
        });
        await em.save(newFollow);
        await em.increment(
          UserEntity,
          { id: followingId },
          'followersCount',
          1,
        );
        await em.increment(UserEntity, { id: followerId }, 'followingCount', 1);
        isFollowingNow = true;

        const followerProfile = await em.findOne(CosplayerProfileEntity, {
          where: { userId: followerId },
        });
        const notification = em.create(NotificationEntity, {
          recipientUserId: followingId,
          actorUserId: followerId,
          category: ENotificationCategory.SOCIAL,
          type: ENotificationType.FOLLOW,
          title: 'đã bắt đầu theo dõi bạn',
          description: 'Hãy ghé thăm hồ sơ của họ!',
          actionUrl: `/cosplayer/${followerProfile?.slug || followerId}`,
          subjectType: 'user',
          subjectId: followerId,
        });
        await em.save(NotificationEntity, notification);
      }

      const targetUser = await em.findOne(UserEntity, {
        where: { id: followingId },
      });
      const followersCount = Number(targetUser?.followersCount || 0);

      return {
        following: isFollowingNow,
        followersCount: Math.max(0, followersCount),
      };
    });
  }

  /**
   * Check if user is following target user.
   */
  async checkIsFollowing(
    followerId: AutoIncrementID,
    followingId: AutoIncrementID,
  ): Promise<boolean> {
    const count = await this.followRepo.count({
      where: { followerId, followingId },
    });
    return count > 0;
  }

  /**
   * Get list of followers for a user.
   */
  async getFollowers(
    userId: AutoIncrementID,
    query: QueryParams,
  ): Promise<Paginated<FollowUserResDto>> {
    const baseQb = this.followRepo
      .createQueryBuilder('uf')
      .leftJoinAndSelect('uf.follower', 'follower')
      .where('uf.followingId = :userId', { userId });

    const paginated = await QueryBuilder.for(baseQb, query)
      .allowedSorts(['createdAt'])
      .defaultSort('-createdAt')
      .paginate();

    const mapped: FollowUserResDto[] = paginated.data.map((item) => ({
      id: item.followerId,
      displayName:
        item.follower?.fullName ||
        item.follower?.username ||
        item.follower?.firstName ||
        'User',
      handle: item.follower?.username ?? null,
      avatarUrl: item.follower?.avatar ?? null,
      followedAt: item.createdAt,
    }));

    return new Paginated(mapped, paginated.meta, paginated.links);
  }

  /**
   * Get list of users followed by a user.
   */
  async getFollowing(
    userId: AutoIncrementID,
    query: QueryParams,
  ): Promise<Paginated<FollowUserResDto>> {
    const baseQb = this.followRepo
      .createQueryBuilder('uf')
      .leftJoinAndSelect('uf.following', 'following')
      .where('uf.followerId = :userId', { userId });

    const paginated = await QueryBuilder.for(baseQb, query)
      .allowedSorts(['createdAt'])
      .defaultSort('-createdAt')
      .paginate();

    const mapped: FollowUserResDto[] = paginated.data.map((item) => ({
      id: item.followingId,
      displayName:
        item.following?.fullName ||
        item.following?.username ||
        item.following?.firstName ||
        'User',
      handle: item.following?.username ?? null,
      avatarUrl: item.following?.avatar ?? null,
      followedAt: item.createdAt,
    }));

    return new Paginated(mapped, paginated.meta, paginated.links);
  }
}
