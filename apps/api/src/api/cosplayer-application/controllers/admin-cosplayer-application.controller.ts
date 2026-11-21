import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import {
  FilterOperator,
  Paginate,
  Paginated,
  PaginateQuery,
} from 'nestjs-paginate';
import { AutoIncrementID } from '../../../common/types/common.type';
import { CurrentUser } from '../../../decorators/current-user.decorator';
import { ApiAuth } from '../../../decorators/http.decorators';
import { CheckPolicies } from '../../../decorators/policies.decorator';
import { AdminAuthGuard } from '../../../guards/admin-auth.guard';
import { PoliciesGuard } from '../../../guards/policies.guard';
import { AppAbility } from '../../../shared/casl/ability.factory';
import { AppActions, AppSubjects } from '../../../utils/permissions.constant';
import { CosplayerApplicationService } from '../cosplayer-application.service';
import { ReviewCosplayerApplicationReqDto } from '../dto/review-cosplayer-application.req.dto';
import { CosplayerApplicationResDto } from '../dto/cosplayer-application.res.dto';

@ApiTags('Cosplayer Applications (Admin)')
@Controller({ path: 'admin/cosplayer-applications', version: '1' })
@UseGuards(AdminAuthGuard, PoliciesGuard)
export class AdminCosplayerApplicationController {
  constructor(
    private readonly applicationService: CosplayerApplicationService,
  ) {}

  @Get()
  @ApiAuth({
    type: CosplayerApplicationResDto,
    summary: 'Get paginated list of cosplayer applications',
    isPaginated: true,
    paginateOptions: {
      searchableColumns: ['stageName', 'bio'],
      sortableColumns: ['id', 'createdAt', 'updatedAt', 'status', 'stageName'],
      defaultSortBy: [['id', 'DESC']],
      relations: ['user', 'reviewedBy'],
      filterableColumns: {
        status: [FilterOperator.EQ, FilterOperator.IN],
        createdAt: [FilterOperator.GTE, FilterOperator.LTE, FilterOperator.BTW],
      },
    },
  })
  @CheckPolicies((ability: AppAbility) =>
    ability.can(AppActions.Read, AppSubjects.User),
  )
  findAll(
    @Paginate() query: PaginateQuery,
  ): Promise<Paginated<CosplayerApplicationResDto>> {
    return this.applicationService.findAll(query);
  }

  @Get(':id')
  @ApiAuth({
    type: CosplayerApplicationResDto,
    summary: 'Find cosplayer application by id',
  })
  @ApiParam({ name: 'id', type: 'String' })
  @CheckPolicies((ability: AppAbility) =>
    ability.can(AppActions.Read, AppSubjects.User),
  )
  findOne(
    @Param('id') id: AutoIncrementID,
  ): Promise<CosplayerApplicationResDto> {
    return this.applicationService.findOne(id);
  }

  @Patch(':id/review')
  @ApiAuth({
    type: CosplayerApplicationResDto,
    summary: 'Review (approve/reject) a cosplayer application',
    statusCode: HttpStatus.OK,
  })
  @ApiParam({ name: 'id', type: 'String' })
  @CheckPolicies((ability: AppAbility) =>
    ability.can(AppActions.Update, AppSubjects.User),
  )
  review(
    @Param('id') id: AutoIncrementID,
    @CurrentUser('id') adminId: AutoIncrementID,
    @Body() dto: ReviewCosplayerApplicationReqDto,
  ): Promise<CosplayerApplicationResDto> {
    return this.applicationService.review(id, adminId, dto);
  }
}
