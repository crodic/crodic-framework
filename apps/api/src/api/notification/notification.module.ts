import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationUserController } from './controllers/notification-user.controller';
import { NotificationEntity } from './entities/notification.entity';
import { NotificationService } from './services/notification.service';

@Module({
  imports: [TypeOrmModule.forFeature([NotificationEntity])],
  controllers: [NotificationUserController],
  providers: [NotificationService],
  exports: [TypeOrmModule, NotificationService],
})
export class NotificationModule {}
