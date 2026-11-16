import { AllowedFilter, QueryParams } from '../../../common/query-builder';
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
import {
  CreateBookingRequestReqDto,
  UpdateBookingStatusReqDto,
} from '../dto/booking-req.dto';
import { BookingRequestResDto } from '../dto/booking-res.dto';
import { BookingService } from '../services/booking.service';

@ApiTags('User Cosplay Booking Requests')
@Controller({ path: 'bookings', version: '1' })
@UseGuards(UserAuthGuard)
export class BookingUserController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  @ApiAuth({
    type: BookingRequestResDto,
    summary: 'Send a booking request to a cosplayer',
    statusCode: HttpStatus.CREATED,
  })
  create(
    @CurrentUser('id') userId: AutoIncrementID,
    @Body() dto: CreateBookingRequestReqDto,
  ) {
    return this.bookingService.createBookingRequest(userId, dto);
  }

  @Get('sent')
  @ApiAuth({
    type: BookingRequestResDto,
    summary: 'Get booking requests sent by the current user',
    isQueryBuilder: true,
    queryBuilderOptions: {
      filters: ['bookingType', AllowedFilter.exact('status')],
      sorts: ['createdAt', 'status'],
      defaultSort: '-createdAt',
    },
  })
  getMySentBookings(
    @CurrentUser('id') userId: AutoIncrementID,
    @Query() query: QueryParams,
  ) {
    return this.bookingService.getMySentBookings(userId, query);
  }

  @Get('received')
  @ApiAuth({
    type: BookingRequestResDto,
    summary: 'Get booking requests received by current user (as cosplayer)',
    isQueryBuilder: true,
    queryBuilderOptions: {
      filters: ['bookingType', AllowedFilter.exact('status')],
      sorts: ['createdAt', 'status'],
      defaultSort: '-createdAt',
    },
  })
  getMyReceivedBookings(
    @CurrentUser('id') userId: AutoIncrementID,
    @Query() query: QueryParams,
  ) {
    return this.bookingService.getMyReceivedBookings(userId, query);
  }

  @Patch(':id/status')
  @ApiAuth({
    type: BookingRequestResDto,
    summary: 'Accept, decline, or complete a booking request',
  })
  @ApiParam({ name: 'id', type: String })
  updateStatus(
    @CurrentUser('id') userId: AutoIncrementID,
    @Param('id') bookingId: AutoIncrementID,
    @Body() dto: UpdateBookingStatusReqDto,
  ) {
    return this.bookingService.updateBookingStatus(userId, bookingId, dto);
  }
}
