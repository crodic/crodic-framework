import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CosplayerProfileEntity } from '../cosplayer/entities/cosplayer-profile.entity';
import { UserEntity } from '../user/entities/user.entity';
import { CityEntity } from '../location/entities/city.entity';
import { PostEntity } from '../post/entities/post.entity';
import { PostMediaEntity } from '../post/entities/post-media.entity';
import { EventAdminController } from './controllers/event-admin.controller';
import { EventPublicController } from './controllers/event-public.controller';
import { EventUserController } from './controllers/event-user.controller';
import { EventApplicationEntity } from './entities/event-application.entity';
import { EventInterestEntity } from './entities/event-interest.entity';
import { EventParticipantEntity } from './entities/event-participant.entity';
import { EventEntity } from './entities/event.entity';
import { EventService } from './services/event.service';
import { AiEventCrawlerService } from './services/ai-event-crawler.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EventEntity,
      EventParticipantEntity,
      EventApplicationEntity,
      EventInterestEntity,
      CosplayerProfileEntity,
      UserEntity,
      CityEntity,
      PostEntity,
      PostMediaEntity,
    ]),
  ],
  controllers: [
    EventAdminController,
    EventPublicController,
    EventUserController,
  ],
  providers: [EventService, AiEventCrawlerService],
  exports: [TypeOrmModule, EventService, AiEventCrawlerService],
})
export class EventModule {}
