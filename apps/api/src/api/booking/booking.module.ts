import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../user/entities/user.entity';
import { BookingUserController } from './controllers/booking-user.controller';
import { DirectMessageUserController } from './controllers/direct-message-user.controller';
import { BookingRequestEntity } from './entities/booking-request.entity';
import { DirectMessageEntity } from './entities/direct-message.entity';
import { BookingService } from './services/booking.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BookingRequestEntity,
      DirectMessageEntity,
      UserEntity,
    ]),
  ],
  controllers: [BookingUserController, DirectMessageUserController],
  providers: [BookingService],
  exports: [TypeOrmModule, BookingService],
})
export class BookingModule {}
