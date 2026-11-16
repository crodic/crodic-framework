import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEntity } from './entities/event.entity';
import { EventParticipantEntity } from './entities/event-participant.entity';
import { EventApplicationEntity } from './entities/event-application.entity';
import { EventInterestEntity } from './entities/event-interest.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EventEntity,
      EventParticipantEntity,
      EventApplicationEntity,
      EventInterestEntity,
    ]),
  ],
  exports: [TypeOrmModule],
})
export class EventModule {}
