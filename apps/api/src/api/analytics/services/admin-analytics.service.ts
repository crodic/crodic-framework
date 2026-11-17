import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BookingRequestEntity } from '../../booking/entities/booking-request.entity';
import { EBookingRequestStatus } from '../../booking/constants/booking.constant';
import { ContentReportEntity } from '../../content-report/entities/content-report.entity';
import { EReportStatus } from '../../content-report/constants/content-report.constant';
import { CosplayerProfileEntity } from '../../cosplayer/entities/cosplayer-profile.entity';
import { EventEntity } from '../../event/entities/event.entity';
import { JobEntity } from '../../job/entities/job.entity';
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
    @InjectRepository(BookingRequestEntity)
    private readonly bookingRepo: Repository<BookingRequestEntity>,
    @InjectRepository(EventEntity)
    private readonly eventRepo: Repository<EventEntity>,
    @InjectRepository(JobEntity)
    private readonly jobRepo: Repository<JobEntity>,
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
      totalBookings,
      completedBookings,
      pendingBookings,
      activeEvents,
      openJobs,
      pendingReports,
      categoryCounts,
      bookingStatusCounts,
    ] = await Promise.all([
      this.userRepo.count(),
      this.profileRepo.count(),
      this.profileRepo.count({ where: { isVerified: true } }),
      this.postRepo.count(),
      this.postRepo.count({ where: { isFeaturedWork: true } }),
      this.postRepo.count({ where: { status: EPostStatus.PENDING_REVIEW } }),
      this.bookingRepo.count(),
      this.bookingRepo.count({
        where: { status: EBookingRequestStatus.COMPLETED },
      }),
      this.bookingRepo.count({
        where: { status: EBookingRequestStatus.PENDING },
      }),
      this.eventRepo.count(),
      this.jobRepo.count(),
      this.reportRepo.count({ where: { status: EReportStatus.PENDING } }),
      this.postRepo
        .createQueryBuilder('p')
        .select('p.albumCategory', 'category')
        .addSelect('COUNT(*)', 'count')
        .groupBy('p.albumCategory')
        .getRawMany<{ category: string; count: string }>(),
      this.bookingRepo
        .createQueryBuilder('b')
        .select('b.status', 'status')
        .addSelect('COUNT(*)', 'count')
        .groupBy('b.status')
        .getRawMany<{ status: string; count: string }>(),
    ]);

    return {
      kpi: {
        totalUsers,
        totalCosplayers,
        verifiedCosplayers,
        totalPosts,
        featuredPosts,
        totalBookings,
        completedBookings,
        activeEvents,
        openJobs,
        pendingReports,
        pendingPosts,
        pendingBookings,
      },
      postCategories: categoryCounts.map((r) => ({
        category: r.category,
        count: Number(r.count || 0),
      })),
      bookingStatuses: bookingStatusCounts.map((r) => ({
        status: r.status,
        count: Number(r.count || 0),
      })),
    };
  }
}
