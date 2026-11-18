import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CosplayerProfileEntity } from '../cosplayer/entities/cosplayer-profile.entity';
import { NotificationUserController } from './controllers/notification-user.controller';
import { NotificationEntity } from './entities/notification.entity';
import { NotificationService } from './services/notification.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([NotificationEntity, CosplayerProfileEntity]),
  ],
  controllers: [NotificationUserController],
  providers: [NotificationService],
  exports: [TypeOrmModule, NotificationService],
})
export class NotificationModule {}
