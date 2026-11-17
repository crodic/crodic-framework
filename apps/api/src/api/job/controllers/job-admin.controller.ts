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
  CreateJobReqDto,
  UpdateJobReqDto,
  UpdateJobStatusReqDto,
} from '../dto/job-req.dto';
import { JobDetailResDto, JobSummaryResDto } from '../dto/job-res.dto';
import { JobService } from '../services/job.service';

@ApiTags('Admin Job & Casting Management')
@Controller({ path: 'admin/jobs', version: '1' })
@UseGuards(AdminAuthGuard, PoliciesGuard)
export class JobAdminController {
  constructor(private readonly jobService: JobService) {}

  @Get()
  @ApiAuth({
    type: JobSummaryResDto,
    summary: 'List all jobs with filters and search for Admin',
    isQueryBuilder: true,
    queryBuilderOptions: {
      filters: [
        'title',
        'brandName',
        'locationLabel',
        'search',
        AllowedFilter.exact('categoryCode'),
        AllowedFilter.exact('locationFilterCode'),
        AllowedFilter.exact('cityId'),
        AllowedFilter.exact('brandId'),
        AllowedFilter.exact('status'),
        AllowedFilter.exact('isFeatured'),
      ],
      sorts: ['createdAt', 'applicationsCount', 'deadlineAt'],
      defaultSort: '-createdAt',
    },
  })
  @CheckPolicies((ability: AppAbility) =>
    ability.can(AppActions.Read, AppSubjects.Job),
  )
  findAll(@Query() query: QueryParams) {
    return this.jobService.findAll(query);
  }

  @Post()
  @ApiAuth({
    type: JobDetailResDto,
    summary: 'Create a new job posting as admin',
    statusCode: HttpStatus.CREATED,
  })
  @CheckPolicies((ability: AppAbility) =>
    ability.can(AppActions.Create, AppSubjects.Job),
  )
  create(
    @CurrentUser('id') adminId: AutoIncrementID,
    @Body() dto: CreateJobReqDto,
  ) {
    return this.jobService.create(adminId, dto);
  }

  @Get(':id')
  @ApiAuth({ type: JobDetailResDto, summary: 'Get job details by ID' })
  @ApiParam({ name: 'id', type: 'String' })
  @CheckPolicies((ability: AppAbility) =>
    ability.can(AppActions.Read, AppSubjects.Job),
  )
  findOne(@Param('id') id: AutoIncrementID) {
    return this.jobService.findById(id);
  }

  @Put(':id')
  @ApiAuth({ type: JobDetailResDto, summary: 'Update job details' })
  @ApiParam({ name: 'id', type: 'String' })
  @CheckPolicies((ability: AppAbility) =>
    ability.can(AppActions.Update, AppSubjects.Job),
  )
  update(@Param('id') id: AutoIncrementID, @Body() dto: UpdateJobReqDto) {
    return this.jobService.updateAdmin(id, dto);
  }

  @Patch(':id/status')
  @ApiAuth({
    type: JobDetailResDto,
    summary: 'Update job status and featured flag',
  })
  @ApiParam({ name: 'id', type: 'String' })
  @CheckPolicies((ability: AppAbility) =>
    ability.can(AppActions.Publish, AppSubjects.Job),
  )
  updateStatus(
    @Param('id') id: AutoIncrementID,
    @Body() dto: UpdateJobStatusReqDto,
  ) {
    return this.jobService.updateStatusAdmin(id, dto);
  }

  @Delete(':id')
  @ApiAuth({
    summary: 'Delete job posting',
    statusCode: HttpStatus.NO_CONTENT,
  })
  @ApiParam({ name: 'id', type: 'String' })
  @CheckPolicies((ability: AppAbility) =>
    ability.can(AppActions.Delete, AppSubjects.Job),
  )
  remove(@Param('id') id: AutoIncrementID) {
    return this.jobService.deleteAdmin(id);
  }
}
