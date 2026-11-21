import { AutoIncrementID } from '../../common/types/common.type';
import { CurrentUser } from '../../decorators/current-user.decorator';
import { ApiAuth } from '../../decorators/http.decorators';
import { CheckPolicies } from '../../decorators/policies.decorator';
import { AdminAuthGuard } from '../../guards/admin-auth.guard';
import { PoliciesGuard } from '../../guards/policies.guard';
import { AppAbility } from '../../shared/casl/ability.factory';
import { AppActions, AppSubjects } from '../../utils/permissions.constant';
import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import {
  FilterOperator,
  Paginate,
  Paginated,
  PaginateQuery,
} from 'nestjs-paginate';
import { CronJobService } from './cron-job.service';
import { CronJobResDto } from './dto/cron-job.res.dto';
import { CronJobLogResDto } from './dto/cron-job-log.res.dto';
import { TriggerCronJobResDto } from './dto/trigger-cron-job.res.dto';
import { ECronJobTriggerType } from './entities/cron-job-log.entity';

@ApiTags('Cron Jobs Management')
@Controller({ path: 'cron-jobs', version: '1' })
@UseGuards(AdminAuthGuard, PoliciesGuard)
export class CronJobController {
  constructor(private readonly cronJobService: CronJobService) {}

  @Get()
  @ApiAuth({
    type: CronJobResDto,
    statusCode: 200,
    summary: 'Get all registered scheduled cron jobs with latest status',
  })
  @CheckPolicies((ability: AppAbility) =>
    ability.can(AppActions.Read, AppSubjects.CronJob),
  )
  async getRegisteredJobs(): Promise<CronJobResDto[]> {
    return this.cronJobService.getRegisteredJobs();
  }

  @Get('logs')
  @ApiAuth({
    type: CronJobLogResDto,
    statusCode: 200,
    summary: 'Get paginated cron job execution logs',
    isPaginated: true,
    paginateOptions: {
      sortableColumns: [
        'id',
        'startedAt',
        'finishedAt',
        'durationMs',
        'status',
        'triggerType',
        'jobKey',
      ],
      defaultSortBy: [['id', 'DESC']],
      filterableColumns: {
        status: [FilterOperator.EQ, FilterOperator.IN],
        jobKey: [FilterOperator.EQ, FilterOperator.IN],
        triggerType: [FilterOperator.EQ],
        startedAt: [FilterOperator.BTW, FilterOperator.GTE, FilterOperator.LTE],
      },
      searchableColumns: ['jobKey', 'jobName', 'summary', 'errorMessage'],
    },
  })
  @CheckPolicies((ability: AppAbility) =>
    ability.can(AppActions.Read, AppSubjects.CronJob),
  )
  async getLogs(
    @Paginate() query: PaginateQuery,
  ): Promise<Paginated<CronJobLogResDto>> {
    return this.cronJobService.findAllLogs(query);
  }

  @Get('logs/:id')
  @ApiAuth({
    type: CronJobLogResDto,
    statusCode: 200,
    summary: 'Get single cron job execution log by ID',
  })
  @ApiParam({ name: 'id', type: 'String' })
  @CheckPolicies((ability: AppAbility) =>
    ability.can(AppActions.Read, AppSubjects.CronJob),
  )
  async getLogDetail(
    @Param('id') id: AutoIncrementID,
  ): Promise<CronJobLogResDto> {
    return this.cronJobService.findOneLog(id);
  }

  @Post(':jobKey/trigger')
  @HttpCode(HttpStatus.OK)
  @ApiAuth({
    type: TriggerCronJobResDto,
    statusCode: 200,
    summary: 'Manually trigger a cron job execution immediately',
  })
  @ApiParam({ name: 'jobKey', type: 'String', example: 'purge-expired-users' })
  @CheckPolicies((ability: AppAbility) =>
    ability.can(AppActions.Manage, AppSubjects.CronJob),
  )
  async triggerJob(
    @Param('jobKey') jobKey: string,
    @CurrentUser('id') adminId: AutoIncrementID,
  ): Promise<TriggerCronJobResDto> {
    return this.cronJobService.runJob(
      jobKey,
      ECronJobTriggerType.MANUAL,
      adminId,
    );
  }
}
