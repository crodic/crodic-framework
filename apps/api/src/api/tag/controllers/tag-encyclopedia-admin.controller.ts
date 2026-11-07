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
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { UpsertTagEncyclopediaReqDto } from '../dto/tag-req.dto';
import { TagEncyclopediaResDto } from '../dto/tag-res.dto';
import { TagEncyclopediaService } from '../services/tag-encyclopedia.service';

@ApiTags('Admin Tag Encyclopedias')
@Controller({ path: 'tag-encyclopedias', version: '1' })
@UseGuards(AdminAuthGuard, PoliciesGuard)
export class TagEncyclopediaAdminController {
  constructor(private readonly encyclopediaService: TagEncyclopediaService) {}

  @Get()
  @ApiAuth({
    type: TagEncyclopediaResDto,
    summary: 'List localized tag encyclopedia wiki articles',
    isQueryBuilder: true,
    queryBuilderOptions: {
      filters: [
        'search',
        AllowedFilter.exact('locale'),
        AllowedFilter.exact('isEditLocked'),
        AllowedFilter.exact('tagId'),
      ],
      sorts: ['id', 'viewCount', 'currentRevision', 'updatedAt'],
      defaultSort: '-updatedAt',
    },
  })
  @CheckPolicies((ability: AppAbility) =>
    ability.can(AppActions.Read, AppSubjects.TagEncyclopedia),
  )
  findAll(@Query() query: QueryParams, @Query('locale') locale?: string) {
    return this.encyclopediaService.findAllAdmin(query, locale || 'en');
  }

  @Get('by-tag/:tagId')
  @ApiAuth({
    type: TagEncyclopediaResDto,
    summary: 'Get encyclopedia wiki article and revisions by tag ID and locale',
  })
  @ApiParam({ name: 'tagId', type: 'String' })
  @CheckPolicies((ability: AppAbility) =>
    ability.can(AppActions.Read, AppSubjects.TagEncyclopedia),
  )
  findByTag(
    @Param('tagId') tagId: AutoIncrementID,
    @Query('locale') locale?: string,
  ) {
    return this.encyclopediaService.findByTagIdAndLocale(tagId, locale || 'en');
  }

  @Put('by-tag/:tagId')
  @ApiAuth({
    type: TagEncyclopediaResDto,
    summary: 'Create or update localized encyclopedia article as administrator',
  })
  @ApiParam({ name: 'tagId', type: 'String' })
  @CheckPolicies(
    (ability: AppAbility) =>
      ability.can(AppActions.Update, AppSubjects.TagEncyclopedia) ||
      ability.can(AppActions.Create, AppSubjects.TagEncyclopedia),
  )
  upsertByTag(
    @Param('tagId') tagId: AutoIncrementID,
    @Body() dto: UpsertTagEncyclopediaReqDto,
    @CurrentUser('id') adminId: AutoIncrementID,
  ) {
    return this.encyclopediaService.upsert(tagId, dto, { adminId });
  }

  @Post(':id/revisions/:revisionNumber/rollback')
  @ApiAuth({
    type: TagEncyclopediaResDto,
    summary: 'Rollback encyclopedia article to a prior revision snapshot',
  })
  @ApiParam({ name: 'id', type: 'String' })
  @ApiParam({ name: 'revisionNumber', type: 'Number' })
  @CheckPolicies((ability: AppAbility) =>
    ability.can(AppActions.Update, AppSubjects.TagEncyclopedia),
  )
  rollback(
    @Param('id') id: AutoIncrementID,
    @Param('revisionNumber', ParseIntPipe) revisionNumber: number,
    @CurrentUser('id') adminId: AutoIncrementID,
  ) {
    return this.encyclopediaService.rollbackToRevision(
      id,
      revisionNumber,
      adminId,
    );
  }
}
