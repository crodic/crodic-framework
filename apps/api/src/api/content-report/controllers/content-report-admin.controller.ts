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
  Get,
  Param,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { ResolveContentReportReqDto } from '../dto/content-report-req.dto';
import { ContentReportAdminResDto } from '../dto/content-report-res.dto';
import { ContentReportService } from '../services/content-report.service';

@ApiTags('Admin Content Moderation & Reports')
@Controller({ path: 'admin/content-reports', version: '1' })
@UseGuards(AdminAuthGuard, PoliciesGuard)
export class ContentReportAdminController {
  constructor(private readonly reportService: ContentReportService) {}

  @Get()
  @ApiAuth({
    type: ContentReportAdminResDto,
    summary: 'List all violation reports with filtering and search',
    isQueryBuilder: true,
    queryBuilderOptions: {
      filters: [
        AllowedFilter.exact('targetType'),
        AllowedFilter.exact('status'),
        AllowedFilter.exact('reporterUserId'),
        AllowedFilter.partial('reason'),
        'search',
      ],
      sorts: ['createdAt', 'updatedAt', 'status'],
      defaultSort: '-createdAt',
    },
  })
  @CheckPolicies((ability: AppAbility) =>
    ability.can(AppActions.Read, AppSubjects.ContentReport),
  )
  findAll(@Query() query: QueryParams) {
    return this.reportService.findAllAdmin(query);
  }

  @Get(':id')
  @ApiAuth({
    type: ContentReportAdminResDto,
    summary: 'Get report details by ID',
  })
  @ApiParam({ name: 'id', type: 'String' })
  @CheckPolicies((ability: AppAbility) =>
    ability.can(AppActions.Read, AppSubjects.ContentReport),
  )
  findOne(@Param('id') id: AutoIncrementID) {
    return this.reportService.findOneAdmin(id);
  }

  @Put(':id/resolve')
  @ApiAuth({
    type: ContentReportAdminResDto,
    summary: 'Resolve or dismiss a violation report',
  })
  @ApiParam({ name: 'id', type: 'String' })
  @CheckPolicies((ability: AppAbility) =>
    ability.can(AppActions.Update, AppSubjects.ContentReport),
  )
  resolve(
    @Param('id') id: AutoIncrementID,
    @CurrentUser('id') adminId: AutoIncrementID,
    @Body() dto: ResolveContentReportReqDto,
  ) {
    return this.reportService.resolveReport(id, adminId, dto);
  }
}
