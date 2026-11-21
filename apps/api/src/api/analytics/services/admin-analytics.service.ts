import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Not, Repository } from 'typeorm';
import { ContentReportEntity } from '../../content-report/entities/content-report.entity';
import { EReportStatus } from '../../content-report/constants/content-report.constant';
import { CosplayerProfileEntity } from '../../cosplayer/entities/cosplayer-profile.entity';
import { EventEntity } from '../../event/entities/event.entity';
import { EEventStatus } from '../../event/constants/event.constant';
import { PostEntity } from '../../post/entities/post.entity';
import { EPostStatus } from '../../post/constants/post.constant';
import { UserEntity } from '../../user/entities/user.entity';
import { AdminAnalyticsOverviewResDto } from '../dto/admin-analytics.res.dto';

@Injectable()
export class AdminAnalyticsService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(CosplayerProfileEntity)
    private readonly profileRepo: Repository<CosplayerProfileEntity>,
    @InjectRepository(PostEntity)
    private readonly postRepo: Repository<PostEntity>,
    @InjectRepository(EventEntity)
    private readonly eventRepo: Repository<EventEntity>,
    @InjectRepository(ContentReportEntity)
    private readonly reportRepo: Repository<ContentReportEntity>,
  ) {}

  async getOverview(): Promise<AdminAnalyticsOverviewResDto> {
    const [
      totalUsers,
      verifiedUsers,
      totalCosplayers,
      verifiedCosplayers,
      totalPosts,
      featuredPosts,
      pendingPosts,
      totalEvents,
      activeEvents,
      pendingReports,
      categoryCounts,
    ] = await Promise.all([
      this.userRepo.count({ where: { deletedAt: IsNull() } }),
      this.userRepo.count({
        where: { verifiedAt: Not(IsNull()), deletedAt: IsNull() },
      }),
      this.profileRepo
        .createQueryBuilder('p')
        .innerJoin('p.user', 'u', 'u.deletedAt IS NULL')
        .where('p.deletedAt IS NULL')
        .getCount(),
      this.profileRepo
        .createQueryBuilder('p')
        .innerJoin('p.user', 'u', 'u.deletedAt IS NULL')
        .where('p.deletedAt IS NULL AND p.isVerified = true')
        .getCount(),
      this.postRepo
        .createQueryBuilder('p')
        .innerJoin('p.author', 'a', 'a.deletedAt IS NULL')
        .where('p.deletedAt IS NULL')
        .getCount(),
      this.postRepo
        .createQueryBuilder('p')
        .innerJoin('p.author', 'a', 'a.deletedAt IS NULL')
        .where('p.deletedAt IS NULL AND p.isFeaturedWork = true')
        .getCount(),
      this.postRepo
        .createQueryBuilder('p')
        .innerJoin('p.author', 'a', 'a.deletedAt IS NULL')
        .where('p.deletedAt IS NULL AND p.status = :status', {
          status: EPostStatus.DRAFT,
        })
        .getCount(),
      this.eventRepo.count({ where: { deletedAt: IsNull() } }),
      this.eventRepo.count({
        where: {
          status: In([EEventStatus.UPCOMING, EEventStatus.ONGOING]),
          deletedAt: IsNull(),
        },
      }),
      this.reportRepo.count({ where: { status: EReportStatus.PENDING } }),
      this.postRepo
        .createQueryBuilder('p')
        .innerJoin('p.author', 'a', 'a.deletedAt IS NULL')
        .select('p.albumCategory', 'category')
        .addSelect('COUNT(*)', 'count')
        .where('p.deletedAt IS NULL')
        .groupBy('p.albumCategory')
        .getRawMany<{ category: string; count: string }>(),
    ]);

    return {
      kpi: {
        totalUsers,
        verifiedUsers,
        totalCosplayers,
        verifiedCosplayers,
        totalPosts,
        featuredPosts,
        totalEvents,
        activeEvents,
        pendingReports,
        pendingPosts,
      },
      postCategories: categoryCounts.map((r) => ({
        category: r.category,
        count: Number(r.count || 0),
      })),
    };
  }
}
