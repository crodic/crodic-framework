import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CosplayerApplicationEntity } from './entities/cosplayer-application.entity';
import { UserEntity } from '../user/entities/user.entity';
import { CosplayerProfileEntity } from '../cosplayer/entities/cosplayer-profile.entity';
import { NotificationEntity } from '../notification/entities/notification.entity';
import { CosplayerApplicationService } from './cosplayer-application.service';
import { CosplayerApplicationController } from './controllers/cosplayer-application.controller';
import { AdminCosplayerApplicationController } from './controllers/admin-cosplayer-application.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CosplayerApplicationEntity,
      UserEntity,
      CosplayerProfileEntity,
      NotificationEntity,
    ]),
  ],
  controllers: [
    CosplayerApplicationController,
    AdminCosplayerApplicationController,
  ],
  providers: [CosplayerApplicationService],
  exports: [CosplayerApplicationService],
})
export class CosplayerApplicationModule {}
