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
  Param,
  ParseEnumPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import {
  ETaggableEntityType,
  ETagRelationType,
} from '../constants/tag.constant';
import {
  AddTagRelationReqDto,
  CreateTagReqDto,
  MergeTagReqDto,
  SyncEntityTagsReqDto,
  UpdateTagReqDto,
} from '../dto/tag-req.dto';
import {
  EntityTagListResDto,
  EntityTagLogResDto,
  MergeTagPreviewResDto,
  TagDetailResDto,
  TagSummaryResDto,
} from '../dto/tag-res.dto';
import { EntityTaggingService } from '../services/entity-tagging.service';
import { TagHierarchyService } from '../services/tag-hierarchy.service';
import { TagQueueService } from '../services/tag-queue.service';
import { TagService } from '../services/tag.service';

@ApiTags('Admin Tags')
@Controller({ path: 'tags', version: '1' })
@UseGuards(AdminAuthGuard, PoliciesGuard)
export class TagAdminController {
  constructor(
    private readonly tagService: TagService,
    private readonly hierarchyService: TagHierarchyService,
    private readonly entityTaggingService: EntityTaggingService,
    private readonly tagQueueService: TagQueueService,
  ) {}

  @Get()
  @ApiAuth({
    type: TagSummaryResDto,
    summary: 'List all tags with whitelist filtering and sorting',
    isQueryBuilder: true,
    queryBuilderOptions: {
      filters: [
        'name',
        'slug',
        'search',
        AllowedFilter.exact('category'),
        AllowedFilter.exact('safetyRating'),
        AllowedFilter.exact('status'),
        AllowedFilter.exact('isOfficial'),
        AllowedFilter.exact('isSystem'),
        AllowedFilter.trashed(),
      ],
      sorts: [
        'id',
        'name',
        'category',
        'safetyRating',
        'status',
        'usageCount',
        'trendingScore',
        'createdAt',
        'updatedAt',
      ],
      defaultSort: '-usageCount',
    },
  })
  @CheckPolicies((ability: AppAbility) =>
    ability.can(AppActions.Read, AppSubjects.Tag),
  )
  findAll(@Query() query: QueryParams, @Query('locale') locale?: string) {
    return this.tagService.findAll(query, locale || 'en', false);
  }

  @Get('audit-logs')
  @ApiAuth({
    type: EntityTagLogResDto,
    summary:
      'Get recent tag governance and folksonomy audit logs with whitelist filtering and pagination',
    isQueryBuilder: true,
    queryBuilderOptions: {
      filters: [
        AllowedFilter.exact('action'),
        AllowedFilter.exact('entityType'),
        AllowedFilter.exact('entityId'),
        AllowedFilter.exact('tagId'),
        'tagNameSnapshot',
      ],
      sorts: ['createdAt', 'action', 'entityType'],
      defaultSort: '-createdAt',
    },
  })
  @CheckPolicies((ability: AppAbility) =>
    ability.can(AppActions.Read, AppSubjects.Tag),
  )
  listAuditLogs(@Query() query: QueryParams) {
    return this.entityTaggingService.listRecentGlobalLogs(query);
  }

  @Post()
  @ApiAuth({
    type: TagDetailResDto,
    summary: 'Create a canonical tag with translations and aliases',
  })
  @CheckPolicies((ability: AppAbility) =>
    ability.can(AppActions.Create, AppSubjects.Tag),
  )
  create(
    @Body() dto: CreateTagReqDto,
    @CurrentUser('id') adminId: AutoIncrementID,
  ) {
    return this.tagService.create(dto, adminId);
  }

  @Get(':id')
  @ApiAuth({
    type: TagDetailResDto,
    summary: 'Get tag details including translations, aliases, and DAG graph',
  })
  @ApiParam({ name: 'id', type: 'String' })
  @CheckPolicies((ability: AppAbility) =>
    ability.can(AppActions.Read, AppSubjects.Tag),
  )
  findOne(@Param('id') id: AutoIncrementID, @Query('locale') locale?: string) {
    return this.tagService.findOneById(id, locale || 'en');
  }

  @Put(':id')
  @ApiAuth({
    type: TagDetailResDto,
    summary: 'Update tag metadata and aliases',
  })
  @ApiParam({ name: 'id', type: 'String' })
  @CheckPolicies((ability: AppAbility) =>
    ability.can(AppActions.Update, AppSubjects.Tag),
  )
  update(@Param('id') id: AutoIncrementID, @Body() dto: UpdateTagReqDto) {
    return this.tagService.update(id, dto);
  }

  @Delete(':id')
  @ApiAuth({ summary: 'Soft-delete a non-system tag' })
  @ApiParam({ name: 'id', type: 'String' })
  @CheckPolicies((ability: AppAbility) =>
    ability.can(AppActions.Delete, AppSubjects.Tag),
  )
  remove(@Param('id') id: AutoIncrementID) {
    return this.tagService.remove(id);
  }

  @Delete()
  @ApiAuth({ summary: 'Bulk soft-delete non-system tags' })
  @CheckPolicies((ability: AppAbility) =>
    ability.can(AppActions.Delete, AppSubjects.Tag),
  )
  removeMany(@Body() body: { ids: AutoIncrementID[] }) {
    return this.tagService.removeMany(body.ids || []);
  }

  @Post(':id/relations')
  @ApiAuth({
    type: TagDetailResDto,
    summary: 'Link a child, related, or disambiguation tag in the DAG',
  })
  @ApiParam({ name: 'id', type: 'String' })
  @CheckPolicies((ability: AppAbility) =>
    ability.can(AppActions.Update, AppSubjects.Tag),
  )
  async addRelation(
    @Param('id') id: AutoIncrementID,
    @Body() dto: AddTagRelationReqDto,
  ) {
    await this.hierarchyService.addRelation(
      id,
      dto.targetTagId,
      dto.relationType ?? ETagRelationType.HIERARCHY,
      dto.sortOrder ?? 0,
    );
    return this.tagService.findOneById(id);
  }

  @Delete(':id/relations/:targetTagId')
  @ApiAuth({
    type: TagDetailResDto,
    summary: 'Remove a directed relation between two tags',
  })
  @ApiParam({ name: 'id', type: 'String' })
  @ApiParam({ name: 'targetTagId', type: 'String' })
  @ApiQuery({ name: 'relationType', enum: ETagRelationType, required: false })
  @CheckPolicies((ability: AppAbility) =>
    ability.can(AppActions.Update, AppSubjects.Tag),
  )
  async removeRelation(
    @Param('id') id: AutoIncrementID,
    @Param('targetTagId') targetTagId: AutoIncrementID,
    @Query('relationType') relationType?: ETagRelationType,
  ) {
    await this.hierarchyService.removeRelation(
      id,
      targetTagId,
      relationType ?? ETagRelationType.HIERARCHY,
    );
    return this.tagService.findOneById(id);
  }

  @Get(':id/merge-preview/:targetTagId')
  @ApiAuth({
    type: MergeTagPreviewResDto,
    summary: 'Preview impact counts before merging source tag into target tag',
  })
  @ApiParam({ name: 'id', type: 'String' })
  @ApiParam({ name: 'targetTagId', type: 'String' })
  @CheckPolicies((ability: AppAbility) =>
    ability.can(AppActions.Update, AppSubjects.Tag),
  )
  previewMerge(
    @Param('id') id: AutoIncrementID,
    @Param('targetTagId') targetTagId: AutoIncrementID,
    @Query('locale') locale?: string,
  ) {
    return this.tagService.previewMerge(id, targetTagId, locale || 'en');
  }

  @Post(':id/merge')
  @ApiAuth({
    summary: 'Merge source tag into target canonical tag safely via BullMQ',
  })
  @ApiParam({ name: 'id', type: 'String' })
  @CheckPolicies((ability: AppAbility) =>
    ability.can(AppActions.Update, AppSubjects.Tag),
  )
  mergeTag(
    @Param('id') id: AutoIncrementID,
    @Body() dto: MergeTagReqDto,
    @CurrentUser('id') adminId: AutoIncrementID,
  ) {
    return this.tagQueueService.dispatchMerge({
      sourceTagId: id,
      targetTagId: dto.targetTagId,
      adminId,
    });
  }

  @Put('entity-sync/:entityType/:entityId')
  @ApiAuth({
    type: EntityTagListResDto,
    summary: 'Synchronize author tags for a target content entity',
  })
  @ApiParam({ name: 'entityType', enum: ETaggableEntityType })
  @ApiParam({ name: 'entityId', type: 'String' })
  @CheckPolicies((ability: AppAbility) =>
    ability.can(AppActions.Update, AppSubjects.Tag),
  )
  syncEntityTags(
    @Param('entityType', new ParseEnumPipe(ETaggableEntityType))
    entityType: ETaggableEntityType,
    @Param('entityId') entityId: AutoIncrementID,
    @Body() dto: SyncEntityTagsReqDto,
    @CurrentUser('id') adminId: AutoIncrementID,
  ) {
    return this.entityTaggingService.syncAuthorTags(entityType, entityId, dto, {
      adminId,
    });
  }
}
