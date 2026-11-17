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
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import {
  CreateSpotlightBannerReqDto,
  UpdateSpotlightBannerReqDto,
} from '../dto/spotlight-req.dto';
import { SpotlightBannerAdminResDto } from '../dto/spotlight-res.dto';
import { SpotlightService } from '../services/spotlight.service';

@ApiTags('Admin Spotlight Banners Management')
@Controller({ path: 'admin/spotlight-banners', version: '1' })
@UseGuards(AdminAuthGuard, PoliciesGuard)
export class SpotlightAdminController {
  constructor(private readonly spotlightService: SpotlightService) {}

  @Get()
  @ApiAuth({
    type: SpotlightBannerAdminResDto,
    summary: 'List all spotlight banners with filters and sorting for Admin',
    isQueryBuilder: true,
    queryBuilderOptions: {
      filters: ['name', 'badge', AllowedFilter.exact('isActive')],
      sorts: ['sortOrder', 'createdAt', 'updatedAt'],
      defaultSort: 'sortOrder',
    },
  })
  @CheckPolicies((ability: AppAbility) =>
    ability.can(AppActions.Read, AppSubjects.Spotlight),
  )
  findAll(@Query() query: QueryParams) {
    return this.spotlightService.findAllAdmin(query);
  }

  @Post()
  @ApiAuth({
    type: SpotlightBannerAdminResDto,
    summary: 'Create a new spotlight hero banner',
    statusCode: HttpStatus.CREATED,
  })
  @CheckPolicies((ability: AppAbility) =>
    ability.can(AppActions.Create, AppSubjects.Spotlight),
  )
  create(@Body() dto: CreateSpotlightBannerReqDto) {
    return this.spotlightService.createBanner(dto);
  }

  @Get(':id')
  @ApiAuth({
    type: SpotlightBannerAdminResDto,
    summary: 'Get spotlight banner by ID',
  })
  @ApiParam({ name: 'id', type: 'String' })
  @CheckPolicies((ability: AppAbility) =>
    ability.can(AppActions.Read, AppSubjects.Spotlight),
  )
  findOne(@Param('id') id: AutoIncrementID) {
    return this.spotlightService.findById(id);
  }

  @Put(':id')
  @ApiAuth({
    type: SpotlightBannerAdminResDto,
    summary: 'Update spotlight banner details',
  })
  @ApiParam({ name: 'id', type: 'String' })
  @CheckPolicies((ability: AppAbility) =>
    ability.can(AppActions.Update, AppSubjects.Spotlight),
  )
  update(
    @Param('id') id: AutoIncrementID,
    @Body() dto: UpdateSpotlightBannerReqDto,
  ) {
    return this.spotlightService.updateBanner(id, dto);
  }

  @Patch(':id/toggle')
  @ApiAuth({
    type: SpotlightBannerAdminResDto,
    summary: 'Toggle spotlight banner active state',
  })
  @ApiParam({ name: 'id', type: 'String' })
  @CheckPolicies((ability: AppAbility) =>
    ability.can(AppActions.Update, AppSubjects.Spotlight),
  )
  toggle(@Param('id') id: AutoIncrementID) {
    return this.spotlightService.toggleBanner(id);
  }

  @Delete(':id')
  @ApiAuth({
    summary: 'Delete spotlight banner',
    statusCode: HttpStatus.NO_CONTENT,
  })
  @ApiParam({ name: 'id', type: 'String' })
  @CheckPolicies((ability: AppAbility) =>
    ability.can(AppActions.Delete, AppSubjects.Spotlight),
  )
  remove(@Param('id') id: AutoIncrementID) {
    return this.spotlightService.deleteBanner(id);
  }
}
