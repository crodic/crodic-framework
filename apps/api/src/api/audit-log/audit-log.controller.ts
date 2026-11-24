import { AutoIncrementID } from '../../common/types/common.type';
import { ApiAuth } from '../../decorators/http.decorators';
import { CheckPolicies } from '../../decorators/policies.decorator';
import { AdminAuthGuard } from '../../guards/admin-auth.guard';
import { PoliciesGuard } from '../../guards/policies.guard';
import { AppAbility } from '../../shared/casl/ability.factory';
import { AppActions, AppSubjects } from '../../utils/permissions.constant';
import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import {
  AllowedFilter,
  Paginated,
  QueryParams,
} from '../../common/query-builder';
import { AuditLogService } from './audit-log.service';
import { AuditLogResDto } from './dto/audit-log.res.dto';

@ApiTags('Audit & Activity Logs')
@Controller({ path: ['audit-logs', 'activity-logs'], version: '1' })
@UseGuards(AdminAuthGuard, PoliciesGuard)
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  @ApiAuth({
    type: AuditLogResDto,
    statusCode: 200,
    summary: 'Get paginated audit and activity logs',
    isQueryBuilder: true,
    queryBuilderOptions: {
      sorts: [
        'id',
        'createdAt',
        'logName',
        'event',
        'subjectType',
        'causerType',
      ],
      defaultSort: '-createdAt',
      filters: [
        'event',
        'logName',
        'subjectType',
        'subjectId',
        'causerType',
        'causerId',
        'batchUuid',
        'description',
        'search',
        AllowedFilter.exact('event'),
        AllowedFilter.exact('logName'),
        AllowedFilter.exact('subjectId'),
        AllowedFilter.exact('causerId'),
        AllowedFilter.exact('batchUuid'),
        AllowedFilter.partial('subjectType'),
        AllowedFilter.partial('causerType'),
        AllowedFilter.partial('description'),
      ],
    },
  })
  @CheckPolicies((ability: AppAbility) =>
    ability.can(AppActions.Read, AppSubjects.Log),
  )
  findAll(@Query() query: QueryParams): Promise<Paginated<AuditLogResDto>> {
    return this.auditLogService.findAll(query);
  }

  @Get(':id')
  @ApiAuth({ type: AuditLogResDto, summary: 'Find audit log by id' })
  @ApiParam({ name: 'id', type: 'String' })
  @CheckPolicies((ability: AppAbility) =>
    ability.can(AppActions.Read, AppSubjects.Log),
  )
  async findOne(@Param('id') id: AutoIncrementID): Promise<AuditLogResDto> {
    return await this.auditLogService.findOne(id);
  }
}
