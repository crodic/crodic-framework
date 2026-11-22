import { AllowedFilter, QueryParams } from '../../../common/query-builder';
import { AutoIncrementID } from '../../../common/types/common.type';
import { CurrentUser } from '../../../decorators/current-user.decorator';
import { ApiAuth } from '../../../decorators/http.decorators';
import { UserAuthGuard } from '../../../guards/user-auth.guard';
import {
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import {
  NotificationResDto,
  UnreadCountResDto,
} from '../dto/notification-res.dto';
import { NotificationService } from '../services/notification.service';

@ApiTags('User Notifications Inbox')
@Controller({ path: 'notifications', version: '1' })
@UseGuards(UserAuthGuard)
export class NotificationUserController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @ApiAuth({
    type: NotificationResDto,
    summary:
      'Get paginated notifications with filters (category, type, isRead)',
    isQueryBuilder: true,
    queryBuilderOptions: {
      filters: [
        AllowedFilter.exact('category'),
        AllowedFilter.exact('type'),
        AllowedFilter.exact('isRead'),
      ],
      sorts: ['createdAt'],
      defaultSort: '-createdAt',
    },
  })
  getMyNotifications(
    @CurrentUser('id') userId: AutoIncrementID,
    @Query() query: QueryParams,
  ) {
    return this.notificationService.getMyNotifications(userId, query);
  }

  @Get('unread-count')
  @ApiAuth({
    type: UnreadCountResDto,
    summary: 'Get total unread notifications count for badge counter',
  })
  getUnreadCount(@CurrentUser('id') userId: AutoIncrementID) {
    return this.notificationService.getUnreadCount(userId);
  }

  @Patch(':id/read')
  @ApiAuth({
    summary: 'Mark a notification as read',
    statusCode: HttpStatus.NO_CONTENT,
  })
  @ApiParam({ name: 'id', type: String })
  async markAsRead(
    @CurrentUser('id') userId: AutoIncrementID,
    @Param('id') notificationId: AutoIncrementID,
  ) {
    await this.notificationService.markAsRead(userId, notificationId);
  }

  @Patch('read-all')
  @ApiAuth({
    summary: 'Mark all notifications as read',
    statusCode: HttpStatus.NO_CONTENT,
  })
  async markAllAsRead(@CurrentUser('id') userId: AutoIncrementID) {
    await this.notificationService.markAllAsRead(userId);
  }

  @Delete(':id')
  @ApiAuth({
    summary: 'Delete a notification',
    statusCode: HttpStatus.NO_CONTENT,
  })
  @ApiParam({ name: 'id', type: String })
  async deleteNotification(
    @CurrentUser('id') userId: AutoIncrementID,
    @Param('id') notificationId: AutoIncrementID,
  ) {
    await this.notificationService.deleteNotification(userId, notificationId);
  }
}
