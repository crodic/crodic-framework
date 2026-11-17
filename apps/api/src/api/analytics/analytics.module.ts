import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingRequestEntity } from '../booking/entities/booking-request.entity';
import { ContentReportEntity } from '../content-report/entities/content-report.entity';
import { CosplayerProfileEntity } from '../cosplayer/entities/cosplayer-profile.entity';
import { EventEntity } from '../event/entities/event.entity';
import { JobEntity } from '../job/entities/job.entity';
import { PostEntity } from '../post/entities/post.entity';
import { UserEntity } from '../user/entities/user.entity';
import { AdminAnalyticsController } from './controllers/admin-analytics.controller';
import { AdminAnalyticsService } from './services/admin-analytics.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      CosplayerProfileEntity,
      PostEntity,
      BookingRequestEntity,
      EventEntity,
      JobEntity,
      ContentReportEntity,
    ]),
  ],
  controllers: [AdminAnalyticsController],
  providers: [AdminAnalyticsService],
  exports: [AdminAnalyticsService],
})
export class AnalyticsModule {}
