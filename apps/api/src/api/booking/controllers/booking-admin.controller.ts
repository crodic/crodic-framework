import { AllowedFilter, QueryParams } from '../../../common/query-builder';
import { AutoIncrementID } from '../../../common/types/common.type';
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
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { UpdateBookingStatusAdminReqDto } from '../dto/booking-req.dto';
import { BookingRequestResDto } from '../dto/booking-res.dto';
import { BookingService } from '../services/booking.service';

@ApiTags('Admin Bookings & Dispute Resolution')
@Controller({ path: 'admin/bookings', version: '1' })
@UseGuards(AdminAuthGuard, PoliciesGuard)
export class BookingAdminController {
  constructor(private readonly bookingService: BookingService) {}

  @Get()
  @ApiAuth({
    type: BookingRequestResDto,
    summary: 'List all booking requests on platform for Admin',
    isQueryBuilder: true,
    queryBuilderOptions: {
      filters: [
        AllowedFilter.exact('status'),
        AllowedFilter.exact('targetCosplayerId'),
        AllowedFilter.exact('requesterUserId'),
        AllowedFilter.partial('bookingType'),
        AllowedFilter.partial('fullName'),
        'search',
      ],
      sorts: ['createdAt', 'status', 'targetDateLabel'],
      defaultSort: '-createdAt',
    },
  })
  @CheckPolicies((ability: AppAbility) =>
    ability.can(AppActions.Read, AppSubjects.Booking),
  )
  findAll(@Query() query: QueryParams) {
    return this.bookingService.findAllAdmin(query);
  }

  @Get(':id')
  @ApiAuth({
    type: BookingRequestResDto,
    summary: 'Get booking request details by ID',
  })
  @ApiParam({ name: 'id', type: String })
  @CheckPolicies((ability: AppAbility) =>
    ability.can(AppActions.Read, AppSubjects.Booking),
  )
  findOne(@Param('id') id: AutoIncrementID) {
    return this.bookingService.findOneAdmin(id);
  }

  @Patch(':id/status')
  @ApiAuth({
    type: BookingRequestResDto,
    summary: 'Moderate or intervene in booking status and dispute note',
  })
  @ApiParam({ name: 'id', type: String })
  @CheckPolicies((ability: AppAbility) =>
    ability.can(AppActions.Update, AppSubjects.Booking),
  )
  updateStatus(
    @Param('id') id: AutoIncrementID,
    @Body() dto: UpdateBookingStatusAdminReqDto,
  ) {
    return this.bookingService.updateStatusAdmin(id, dto);
  }

  @Delete(':id')
  @ApiAuth({
    summary: 'Soft-delete a booking request record',
    statusCode: HttpStatus.NO_CONTENT,
  })
  @ApiParam({ name: 'id', type: String })
  @CheckPolicies((ability: AppAbility) =>
    ability.can(AppActions.Delete, AppSubjects.Booking),
  )
  async delete(@Param('id') id: AutoIncrementID) {
    await this.bookingService.deleteAdmin(id);
  }
}
