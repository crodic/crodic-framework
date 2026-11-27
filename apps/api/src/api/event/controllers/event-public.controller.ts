import { AllowedFilter, QueryParams } from '../../../common/query-builder';
import { CurrentUser } from '../../../decorators/current-user.decorator';
import { ApiAuthOptional } from '../../../decorators/http.decorators';
import { AutoIncrementID } from '../../../common/types/common.type';
import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { UserAuthGuard } from '../../../guards/user-auth.guard';
import {
  EventDetailResDto,
  EventParticipantResDto,
  EventSummaryResDto,
} from '../dto/event-res.dto';
import { EventService } from '../services/event.service';

@ApiTags('Public Events & Festivals')
@Controller({ path: 'public/events', version: '1' })
@UseGuards(UserAuthGuard)
export class EventPublicController {
  constructor(private readonly eventService: EventService) {}

  @Get()
  @ApiAuthOptional({
    type: EventSummaryResDto,
    summary: 'Browse events and cosplay festivals directory',
    isQueryBuilder: true,
    queryBuilderOptions: {
      filters: [
        'title',
        'locationName',
        'organizer',
        'search',
        AllowedFilter.exact('cityId'),
        AllowedFilter.exact('status'),
        AllowedFilter.exact('isRecruiting'),
        AllowedFilter.exact('isFeaturedFestival'),
      ],
      sorts: ['startAt', 'participantsCount', 'interestedCount', 'createdAt'],
      defaultSort: 'startAt',
    },
  })
  findAll(
    @Query() query: QueryParams,
    @CurrentUser('id') currentUserId?: AutoIncrementID,
  ) {
    return this.eventService.findAll(query, currentUserId, {
      publicOnly: true,
    });
  }

  @Get(':slug/participants')
  @ApiAuthOptional({
    type: EventParticipantResDto,
    summary: 'Get paginated participants for a public event',
    isQueryBuilder: true,
    queryBuilderOptions: {
      filters: [],
      sorts: ['sortOrder', 'id'],
      includes: [],
      defaultSort: 'sortOrder,id',
      defaultLimit: 20,
      maxLimit: 100,
    },
  })
  @ApiParam({ name: 'slug', type: String })
  getParticipants(@Param('slug') slug: string, @Query() query: QueryParams) {
    return this.eventService.getPublicParticipants(slug, query);
  }

  @Get(':slug')
  @ApiAuthOptional({
    type: EventDetailResDto,
    summary: 'Get full festival details, schedule and guest lineup by slug',
  })
  @ApiParam({ name: 'slug', type: String, example: 'winter-cosplay-fest-2024' })
  findBySlug(
    @Param('slug') slug: string,
    @CurrentUser('id') currentUserId?: AutoIncrementID,
  ) {
    return this.eventService.findBySlug(slug, currentUserId);
  }
}
