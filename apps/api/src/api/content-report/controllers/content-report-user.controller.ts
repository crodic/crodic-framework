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
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateContentReportReqDto } from '../dto/content-report-req.dto';
import { ContentReportResDto } from '../dto/content-report-res.dto';
import { ContentReportService } from '../services/content-report.service';

@ApiTags('User Content Reports & Moderation')
@Controller({ path: 'reports', version: '1' })
@UseGuards(UserAuthGuard)
export class ContentReportUserController {
  constructor(private readonly reportService: ContentReportService) {}

  @Post()
  @ApiAuth({
    type: ContentReportResDto,
    summary: 'Submit a report for violation, abuse or inappropriate content',
    statusCode: HttpStatus.CREATED,
  })
  create(
    @CurrentUser('id') userId: AutoIncrementID,
    @Body() dto: CreateContentReportReqDto,
  ) {
    return this.reportService.createReport(userId, dto);
  }

  @Get('me')
  @ApiAuth({
    type: ContentReportResDto,
    summary: 'Get moderation status of reports submitted by current user',
    isQueryBuilder: true,
    queryBuilderOptions: {
      filters: [
        AllowedFilter.exact('targetType'),
        AllowedFilter.exact('status'),
      ],
      sorts: ['createdAt'],
      defaultSort: '-createdAt',
    },
  })
  getMyReports(
    @CurrentUser('id') userId: AutoIncrementID,
    @Query() query: QueryParams,
  ) {
    return this.reportService.getMyReports(userId, query);
  }
}
