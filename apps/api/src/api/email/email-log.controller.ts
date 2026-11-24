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
import { EmailLogResDto } from './dto/email-log.res.dto';
import { EmailService } from './email.service';

@ApiTags('Email Logs')
@Controller({ path: 'email-logs', version: '1' })
@UseGuards(AdminAuthGuard, PoliciesGuard)
export class EmailLogController {
  constructor(private readonly emailService: EmailService) {}

  @Get()
  @ApiAuth({
    type: EmailLogResDto,
    summary: 'Get paginated email logs',
    isQueryBuilder: true,
    queryBuilderOptions: {
      sorts: ['id', 'createdAt', 'scheduledAt', 'sentAt', 'status'],
      defaultSort: '-createdAt',
      filters: [
        'status',
        'source',
        'subject',
        'createdByAdminId',
        'to',
        'search',
        AllowedFilter.exact('status'),
        AllowedFilter.exact('source'),
        AllowedFilter.exact('createdByAdminId'),
        AllowedFilter.partial('subject'),
      ],
    },
  })
  @CheckPolicies((ability: AppAbility) =>
    ability.can(AppActions.Read, AppSubjects.EmailLog),
  )
  findAll(@Query() query: QueryParams): Promise<Paginated<EmailLogResDto>> {
    return this.emailService.findAll(query);
  }

  @Get(':id')
  @ApiAuth({ type: EmailLogResDto, summary: 'Get email log detail' })
  @ApiParam({ name: 'id', type: 'String' })
  @CheckPolicies((ability: AppAbility) =>
    ability.can(AppActions.Read, AppSubjects.EmailLog),
  )
  findOne(@Param('id') id: AutoIncrementID): Promise<EmailLogResDto> {
    return this.emailService.findOne(id);
  }
}
