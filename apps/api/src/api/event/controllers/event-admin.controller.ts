import { AllowedFilter, QueryParams } from '../../../common/query-builder';
import { AutoIncrementID } from '../../../common/types/common.type';
import { CurrentUser } from '../../../decorators/current-user.decorator';
import { ApiAuth } from '../../../decorators/http.decorators';
import { CheckPolicies } from '../../../decorators/policies.decorator';
import { AdminAuthGuard } from '../../../guards/admin-auth.guard';
import { PoliciesGuard } from '../../../guards/policies.guard';
import { AppAbility } from '../../../shared/casl/ability.factory';
import { AppActions, AppSubjects } from '../../../utils/permissions.constant';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import {
  CreateEventReqDto,
  UpdateEventReqDto,
  UpdateEventStatusReqDto,
} from '../dto/event-req.dto';
import { EventDetailResDto, EventSummaryResDto } from '../dto/event-res.dto';
import { EventService } from '../services/event.service';
import { AiEventCrawlerService } from '../services/ai-event-crawler.service';

@ApiTags('Admin Events & Conventions Management')
@Controller({ path: 'admin/events', version: '1' })
@UseGuards(AdminAuthGuard, PoliciesGuard)
export class EventAdminController {
  constructor(
    private readonly eventService: EventService,
    private readonly aiCrawlerService: AiEventCrawlerService,
  ) {}

  @Get()
  @ApiAuth({
    type: EventSummaryResDto,
    summary: 'List all events for Admin with filtering and search',
    isQueryBuilder: true,
    queryBuilderOptions: {
      filters: [
        'title',
        'venue',
        'locationLabel',
        'search',
        AllowedFilter.exact('status'),
        AllowedFilter.exact('cityId'),
        AllowedFilter.exact('isFeaturedFestival'),
        AllowedFilter.exact('isRecruiting'),
      ],
      sorts: ['startAt', 'createdAt', 'interestedCount', 'participantsCount'],
      defaultSort: '-startAt',
    },
  })
  @CheckPolicies((ability: AppAbility) =>
    ability.can(AppActions.Read, AppSubjects.Event),
  )
  findAll(@Query() query: QueryParams) {
    return this.eventService.findAll(query);
  }

  @Post()
  @ApiAuth({
    type: EventDetailResDto,
    summary: 'Create a new cosplay event/convention as admin',
    statusCode: HttpStatus.CREATED,
  })
  @CheckPolicies((ability: AppAbility) =>
    ability.can(AppActions.Create, AppSubjects.Event),
  )
  create(
    @CurrentUser('id') adminId: AutoIncrementID,
    @Body() dto: CreateEventReqDto,
  ) {
    return this.eventService.createEvent(adminId, dto);
  }

  @Get(':id')
  @ApiAuth({ type: EventDetailResDto, summary: 'Get event details by ID' })
  @ApiParam({ name: 'id', type: 'String' })
  @CheckPolicies((ability: AppAbility) =>
    ability.can(AppActions.Read, AppSubjects.Event),
  )
  findOne(@Param('id') id: AutoIncrementID) {
    return this.eventService.findById(id);
  }

  @Put(':id')
  @ApiAuth({ type: EventDetailResDto, summary: 'Update event details' })
  @ApiParam({ name: 'id', type: 'String' })
  @CheckPolicies((ability: AppAbility) =>
    ability.can(AppActions.Update, AppSubjects.Event),
  )
  update(@Param('id') id: AutoIncrementID, @Body() dto: UpdateEventReqDto) {
    return this.eventService.updateEvent(id, dto);
  }

  @Patch(':id/status')
  @ApiAuth({
    type: EventDetailResDto,
    summary: 'Update event status, featured and recruitment flags',
  })
  @ApiParam({ name: 'id', type: 'String' })
  @CheckPolicies((ability: AppAbility) =>
    ability.can(AppActions.Publish, AppSubjects.Event),
  )
  updateStatus(
    @Param('id') id: AutoIncrementID,
    @Body() dto: UpdateEventStatusReqDto,
  ) {
    return this.eventService.updateEventStatus(id, dto);
  }

  @Delete(':id')
  @ApiAuth({
    summary: 'Delete event',
    statusCode: HttpStatus.NO_CONTENT,
  })
  @ApiParam({ name: 'id', type: 'String' })
  @CheckPolicies((ability: AppAbility) =>
    ability.can(AppActions.Delete, AppSubjects.Event),
  )
  remove(@Param('id') id: AutoIncrementID) {
    return this.eventService.deleteEvent(id);
  }

  @Post('ai-crawl')
  @ApiAuth({
    summary: 'Trigger AI Cosplay Event crawl manually from Admin',
    statusCode: HttpStatus.OK,
  })
  @CheckPolicies((ability: AppAbility) =>
    ability.can(AppActions.Create, AppSubjects.Event),
  )
  async triggerAiCrawl() {
    return this.aiCrawlerService.crawlAndSyncEvents();
  }
}
