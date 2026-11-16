import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingRequestEntity } from './entities/booking-request.entity';
import { DirectMessageEntity } from './entities/direct-message.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([BookingRequestEntity, DirectMessageEntity]),
  ],
  exports: [TypeOrmModule],
})
export class BookingModule {}
