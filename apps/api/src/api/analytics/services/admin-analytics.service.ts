import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContentReportEntity } from '../../content-report/entities/content-report.entity';
import { EReportStatus } from '../../content-report/constants/content-report.constant';
import { CosplayerProfileEntity } from '../../cosplayer/entities/cosplayer-profile.entity';
import { EventEntity } from '../../event/entities/event.entity';
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
      totalCosplayers,
      verifiedCosplayers,
      totalPosts,
      featuredPosts,
      pendingPosts,
      activeEvents,
      pendingReports,
      categoryCounts,
    ] = await Promise.all([
      this.userRepo.count(),
      this.profileRepo.count(),
      this.profileRepo.count({ where: { isVerified: true } }),
      this.postRepo.count(),
      this.postRepo.count({ where: { isFeaturedWork: true } }),
      this.postRepo.count({ where: { status: EPostStatus.DRAFT } }),
      this.eventRepo.count(),
      this.reportRepo.count({ where: { status: EReportStatus.PENDING } }),
      this.postRepo
        .createQueryBuilder('p')
        .select('p.albumCategory', 'category')
        .addSelect('COUNT(*)', 'count')
        .groupBy('p.albumCategory')
        .getRawMany<{ category: string; count: string }>(),
    ]);

    return {
      kpi: {
        totalUsers,
        totalCosplayers,
        verifiedCosplayers,
        totalPosts,
        featuredPosts,
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
