import { AutoIncrementID } from '../../../common/types/common.type';
import { CurrentUser } from '../../../decorators/current-user.decorator';
import { ApiAuth } from '../../../decorators/http.decorators';
import { UserAuthGuard } from '../../../guards/user-auth.guard';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import {
  CreateEventApplicationReqDto,
  ParticipateEventReqDto,
} from '../dto/event-req.dto';
import { EventApplicationResDto } from '../dto/event-res.dto';
import { EventService } from '../services/event.service';

@ApiTags('User Events & RSVPs')
@Controller({ path: 'events', version: '1' })
@UseGuards(UserAuthGuard)
export class EventUserController {
  constructor(private readonly eventService: EventService) {}

  @Post(':id/interest')
  @ApiAuth({
    summary: 'Toggle interest for an event',
  })
  @ApiParam({ name: 'id', type: String })
  toggleInterest(
    @CurrentUser('id') userId: AutoIncrementID,
    @Param('id') eventId: AutoIncrementID,
  ) {
    return this.eventService.toggleInterest(userId, eventId);
  }

  @Post(':id/participate')
  @ApiAuth({
    summary: 'RSVP / Register participation for an event',
  })
  @ApiParam({ name: 'id', type: String })
  participate(
    @CurrentUser('id') userId: AutoIncrementID,
    @Param('id') eventId: AutoIncrementID,
    @Body() dto: ParticipateEventReqDto,
  ) {
    return this.eventService.participate(userId, eventId, dto);
  }

  @Delete(':id/participate')
  @ApiAuth({
    summary: 'Cancel RSVP participation for an event',
    statusCode: HttpStatus.NO_CONTENT,
  })
  @ApiParam({ name: 'id', type: String })
  async cancelParticipation(
    @CurrentUser('id') userId: AutoIncrementID,
    @Param('id') eventId: AutoIncrementID,
  ) {
    await this.eventService.cancelParticipation(userId, eventId);
  }

  @Post(':id/apply')
  @ApiAuth({
    type: EventApplicationResDto,
    summary: 'Apply for guest/staff/recruiting role in an event',
    statusCode: HttpStatus.CREATED,
  })
  @ApiParam({ name: 'id', type: String })
  apply(
    @CurrentUser('id') userId: AutoIncrementID,
    @Param('id') eventId: AutoIncrementID,
    @Body() dto: CreateEventApplicationReqDto,
  ) {
    return this.eventService.apply(userId, eventId, dto);
  }

  @Get('me/applications')
  @ApiAuth({
    type: EventApplicationResDto,
    summary: 'Get all event applications submitted by current user',
  })
  getMyApplications(@CurrentUser('id') userId: AutoIncrementID) {
    return this.eventService.getMyApplications(userId);
  }
}
