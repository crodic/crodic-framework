import { QueryParams } from '../../../common/query-builder';
import { AutoIncrementID } from '../../../common/types/common.type';
import { CurrentUser } from '../../../decorators/current-user.decorator';
import { ApiAuth } from '../../../decorators/http.decorators';
import { UserAuthGuard } from '../../../guards/user-auth.guard';
import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { SendDirectMessageReqDto } from '../dto/booking-req.dto';
import {
  ConversationSummaryResDto,
  DirectMessageResDto,
} from '../dto/booking-res.dto';
import { BookingService } from '../services/booking.service';

@ApiTags('User Direct Messages & Chat')
@Controller({ path: 'messages', version: '1' })
@UseGuards(UserAuthGuard)
export class DirectMessageUserController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  @ApiAuth({
    type: DirectMessageResDto,
    summary: 'Send a direct message to another user or cosplayer',
    statusCode: HttpStatus.CREATED,
  })
  sendMessage(
    @CurrentUser('id') userId: AutoIncrementID,
    @Body() dto: SendDirectMessageReqDto,
  ) {
    return this.bookingService.sendMessage(userId, dto);
  }

  @Get('conversations')
  @ApiAuth({
    type: ConversationSummaryResDto,
    summary:
      'Get all active conversations with partner previews and unread counts',
  })
  getConversations(@CurrentUser('id') userId: AutoIncrementID) {
    return this.bookingService.getConversations(userId);
  }

  @Get('conversation/:partnerId')
  @ApiAuth({
    type: DirectMessageResDto,
    summary: 'Get paginated chat messages with a specific partner',
    isQueryBuilder: true,
    queryBuilderOptions: {
      sorts: ['createdAt'],
      defaultSort: '-createdAt',
    },
  })
  @ApiParam({ name: 'partnerId', type: String })
  getConversation(
    @CurrentUser('id') userId: AutoIncrementID,
    @Param('partnerId') partnerId: AutoIncrementID,
    @Query() query: QueryParams,
  ) {
    return this.bookingService.getConversation(userId, partnerId, query);
  }

  @Patch('conversation/:partnerId/read')
  @ApiAuth({
    summary: 'Mark all unread messages from a partner as read',
    statusCode: HttpStatus.NO_CONTENT,
  })
  @ApiParam({ name: 'partnerId', type: String })
  async markAsRead(
    @CurrentUser('id') userId: AutoIncrementID,
    @Param('partnerId') partnerId: AutoIncrementID,
  ) {
    await this.bookingService.markAsRead(userId, partnerId);
  }
}
