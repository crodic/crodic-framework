import { AutoIncrementID } from '../../../common/types/common.type';
import { AuthOptional } from '../../../decorators/auth-optional.decorator';
import { CurrentUser } from '../../../decorators/current-user.decorator';
import { ApiAuth, ApiPublic } from '../../../decorators/http.decorators';
import { UserAuthGuard } from '../../../guards/user-auth.guard';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseEnumPipe,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { ETaggableEntityType } from '../constants/tag.constant';
import {
  AttachEntityTagReqDto,
  UpdateEntityTagGovernanceReqDto,
  UpsertMutedTagReqDto,
  UpsertTagEncyclopediaReqDto,
} from '../dto/tag-req.dto';
import {
  EntityTagListResDto,
  EntityTagLogResDto,
  MutedTagItemResDto,
  TagEncyclopediaResDto,
} from '../dto/tag-res.dto';
import { EntityTaggingService } from '../services/entity-tagging.service';
import { TagEncyclopediaService } from '../services/tag-encyclopedia.service';
import { TagMuteService } from '../services/tag-mute.service';

@ApiTags('Collaborative Entity Tagging & User Tag Preferences')
@Controller({ version: '1' })
@UseGuards(UserAuthGuard)
export class TagUserController {
  constructor(
    private readonly entityTaggingService: EntityTaggingService,
    private readonly tagMuteService: TagMuteService,
    private readonly encyclopediaService: TagEncyclopediaService,
  ) {}

  @Get('entity-tags/:entityType/:entityId')
  @AuthOptional()
  @ApiPublic({
    type: EntityTagListResDto,
    summary:
      'List Pixiv-style entity tags with per-viewer deletable/locked/author flags',
  })
  @ApiParam({ name: 'entityType', enum: ETaggableEntityType })
  @ApiParam({ name: 'entityId', type: 'String' })
  listEntityTags(
    @Param('entityType', new ParseEnumPipe(ETaggableEntityType))
    entityType: ETaggableEntityType,
    @Param('entityId') entityId: AutoIncrementID,
    @Query('locale') locale?: string,
    @CurrentUser('id') userId?: AutoIncrementID,
  ) {
    return this.entityTaggingService.listEntityTags(
      entityType,
      entityId,
      locale || 'en',
      { userId: userId ?? null },
    );
  }

  @Post('entity-tags/:entityType/:entityId')
  @ApiAuth({
    type: EntityTagListResDto,
    summary: 'Attach a folksonomy or author tag (max 10 tags per item)',
  })
  @ApiParam({ name: 'entityType', enum: ETaggableEntityType })
  @ApiParam({ name: 'entityId', type: 'String' })
  attachEntityTag(
    @Param('entityType', new ParseEnumPipe(ETaggableEntityType))
    entityType: ETaggableEntityType,
    @Param('entityId') entityId: AutoIncrementID,
    @Body() dto: AttachEntityTagReqDto,
    @CurrentUser('id') userId: AutoIncrementID,
    @Query('locale') locale?: string,
  ) {
    return this.entityTaggingService.attachTag(
      entityType,
      entityId,
      dto,
      { userId },
      locale || 'en',
    );
  }

  @Delete('entity-tags/:entityType/:entityId/:tagId')
  @ApiAuth({
    type: EntityTagListResDto,
    summary: 'Remove an unlocked folksonomy tag (or any tag if owner)',
  })
  @ApiParam({ name: 'entityType', enum: ETaggableEntityType })
  @ApiParam({ name: 'entityId', type: 'String' })
  @ApiParam({ name: 'tagId', type: 'String' })
  detachEntityTag(
    @Param('entityType', new ParseEnumPipe(ETaggableEntityType))
    entityType: ETaggableEntityType,
    @Param('entityId') entityId: AutoIncrementID,
    @Param('tagId') tagId: AutoIncrementID,
    @CurrentUser('id') userId: AutoIncrementID,
    @Query('locale') locale?: string,
  ) {
    return this.entityTaggingService.detachTag(
      entityType,
      entityId,
      tagId,
      { userId },
      locale || 'en',
    );
  }

  @Patch('entity-tags/:entityType/:entityId/governance')
  @ApiAuth({
    type: EntityTagListResDto,
    summary: 'Creator controls: toggle per-tag lock, work-level lock, or order',
  })
  @ApiParam({ name: 'entityType', enum: ETaggableEntityType })
  @ApiParam({ name: 'entityId', type: 'String' })
  updateGovernance(
    @Param('entityType', new ParseEnumPipe(ETaggableEntityType))
    entityType: ETaggableEntityType,
    @Param('entityId') entityId: AutoIncrementID,
    @Body() dto: UpdateEntityTagGovernanceReqDto,
    @CurrentUser('id') userId: AutoIncrementID,
    @Query('locale') locale?: string,
  ) {
    return this.entityTaggingService.updateGovernance(
      entityType,
      entityId,
      dto,
      { userId },
      locale || 'en',
    );
  }

  @Get('entity-tags/:entityType/:entityId/logs')
  @AuthOptional()
  @ApiPublic({
    type: EntityTagLogResDto,
    summary: 'View tag addition/removal/lock audit history for an item',
  })
  @ApiParam({ name: 'entityType', enum: ETaggableEntityType })
  @ApiParam({ name: 'entityId', type: 'String' })
  listEntityTagLogs(
    @Param('entityType', new ParseEnumPipe(ETaggableEntityType))
    entityType: ETaggableEntityType,
    @Param('entityId') entityId: AutoIncrementID,
  ) {
    return this.entityTaggingService.listLogs(entityType, entityId);
  }

  @Get('user/muted-tags')
  @ApiAuth({
    type: MutedTagItemResDto,
    summary: 'List personal muted NG tags',
  })
  listMutedTags(
    @CurrentUser('id') userId: AutoIncrementID,
    @Query('locale') locale?: string,
  ) {
    return this.tagMuteService.listUserMutedTags(userId, locale || 'en');
  }

  @Post('user/muted-tags')
  @ApiAuth({
    type: MutedTagItemResDto,
    summary: 'Add or update a personal muted NG tag',
  })
  upsertMutedTag(
    @CurrentUser('id') userId: AutoIncrementID,
    @Body() dto: UpsertMutedTagReqDto,
    @Query('locale') locale?: string,
  ) {
    return this.tagMuteService.upsertMutedTag(userId, dto, locale || 'en');
  }

  @Delete('user/muted-tags/:tagId')
  @ApiAuth({ summary: 'Unmute a previously muted NG tag' })
  @ApiParam({ name: 'tagId', type: 'String' })
  removeMutedTag(
    @CurrentUser('id') userId: AutoIncrementID,
    @Param('tagId') tagId: AutoIncrementID,
  ) {
    return this.tagMuteService.removeMutedTag(userId, tagId);
  }

  @Put('user/tags/:tagId/encyclopedia')
  @ApiAuth({
    type: TagEncyclopediaResDto,
    summary:
      'Contribute a community wiki edit to an unlocked tag encyclopedia article',
  })
  @ApiParam({ name: 'tagId', type: 'String' })
  contributeEncyclopedia(
    @Param('tagId') tagId: AutoIncrementID,
    @Body() dto: UpsertTagEncyclopediaReqDto,
    @CurrentUser('id') userId: AutoIncrementID,
  ) {
    return this.encyclopediaService.upsert(tagId, dto, { userId });
  }
}
