import { AllowedFilter, QueryParams } from '../../../common/query-builder';
import { AuthOptional } from '../../../decorators/auth-optional.decorator';
import { CurrentUser } from '../../../decorators/current-user.decorator';
import { ApiPublic } from '../../../decorators/http.decorators';
import { AutoIncrementID } from '../../../common/types/common.type';
import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { EventDetailResDto, EventSummaryResDto } from '../dto/event-res.dto';
import { EventService } from '../services/event.service';

@ApiTags('Public Events & Festivals')
@Controller({ path: 'public/events', version: '1' })
export class EventPublicController {
  constructor(private readonly eventService: EventService) {}

  @Get()
  @AuthOptional()
  @ApiPublic({
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
    return this.eventService.findAll(query, currentUserId);
  }

  @Get(':slug')
  @AuthOptional()
  @ApiPublic({
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
