import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventAdminController } from './controllers/event-admin.controller';
import { EventPublicController } from './controllers/event-public.controller';
import { EventUserController } from './controllers/event-user.controller';
import { EventApplicationEntity } from './entities/event-application.entity';
import { EventInterestEntity } from './entities/event-interest.entity';
import { EventParticipantEntity } from './entities/event-participant.entity';
import { EventEntity } from './entities/event.entity';
import { EventService } from './services/event.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EventEntity,
      EventParticipantEntity,
      EventApplicationEntity,
      EventInterestEntity,
    ]),
  ],
  controllers: [
    EventAdminController,
    EventPublicController,
    EventUserController,
  ],
  providers: [EventService],
  exports: [TypeOrmModule, EventService],
})
export class EventModule {}
