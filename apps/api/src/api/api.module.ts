import { Module } from '@nestjs/common';
import { AdminPermissionModule } from './admin-permission/admin-permission.module';
import { AdminRoleModule } from './admin-role/admin-role.module';
import { AdminUserModule } from './admin-user/admin-user.module';
import { AuditLogModule } from './audit-log/audit-log.module';
import { AuthModule } from './auth/auth.module';
import { CmsPageModule } from './cms-page/cms-page.module';
import { EmailModule } from './email/email.module';
import { FileModule } from './file/file.module';
import { HomeModule } from './home/home.module';
import { LocationModule } from './location/location.module';
import { SettingsModule } from './settings/settings.module';
import { TagModule } from './tag/tag.module';
import { UserModule } from './user/user.module';
import { WhiteLabelModule } from './white-label/white-label.module';
import { CosplayerModule } from './cosplayer/cosplayer.module';
import { PostModule } from './post/post.module';
import { SocialModule } from './social/social.module';
import { CollectionModule } from './collection/collection.module';
import { EventModule } from './event/event.module';
import { RankingModule } from './ranking/ranking.module';
import { SpotlightModule } from './spotlight/spotlight.module';
import { NotificationModule } from './notification/notification.module';
import { ContentReportModule } from './content-report/content-report.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { CosplayerApplicationModule } from './cosplayer-application/cosplayer-application.module';
import { CronJobModule } from './cron-job/cron-job.module';

@Module({
  imports: [
    UserModule,
    AdminPermissionModule,
    AdminRoleModule,
    AuthModule,
    AdminUserModule,
    AuditLogModule,
    SettingsModule,
    FileModule,
    EmailModule,
    WhiteLabelModule,
    CmsPageModule,
    LocationModule,
    HomeModule,
    TagModule,
    CosplayerModule,
    PostModule,
    SocialModule,
    CollectionModule,
    EventModule,
    RankingModule,
    SpotlightModule,
    NotificationModule,
    ContentReportModule,
    AnalyticsModule,
    CosplayerApplicationModule,
    CronJobModule,
  ],
  exports: [
    UserModule,
    AdminPermissionModule,
    AdminRoleModule,
    AuthModule,
    AdminUserModule,
    AuditLogModule,
    SettingsModule,
    FileModule,
    EmailModule,
    WhiteLabelModule,
    CmsPageModule,
    LocationModule,
    HomeModule,
    TagModule,
    CosplayerModule,
    PostModule,
    SocialModule,
    CollectionModule,
    EventModule,
    RankingModule,
    SpotlightModule,
    NotificationModule,
    ContentReportModule,
    AnalyticsModule,
    CosplayerApplicationModule,
    CronJobModule,
  ],
})
export class ApiModule {}
