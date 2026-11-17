import { ApiAuth } from '../../../decorators/http.decorators';
import { AdminAuthGuard } from '../../../guards/admin-auth.guard';
import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AdminAnalyticsOverviewResDto } from '../dto/admin-analytics.res.dto';
import { AdminAnalyticsService } from '../services/admin-analytics.service';

@ApiTags('Admin Analytics & Kosume Platform Overview')
@Controller({ path: 'admin/analytics', version: '1' })
@UseGuards(AdminAuthGuard)
export class AdminAnalyticsController {
  constructor(private readonly analyticsService: AdminAnalyticsService) {}

  @Get('overview')
  @ApiAuth({
    type: AdminAnalyticsOverviewResDto,
    summary: 'Get consolidated business KPI metrics and distributions',
  })
  getOverview() {
    return this.analyticsService.getOverview();
  }
}
