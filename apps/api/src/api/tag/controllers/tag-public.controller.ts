import { AllowedFilter, QueryParams } from '../../../common/query-builder';
import { AutoIncrementID } from '../../../common/types/common.type';
import { AuthOptional } from '../../../decorators/auth-optional.decorator';
import { CurrentUser } from '../../../decorators/current-user.decorator';
import { ApiPublic } from '../../../decorators/http.decorators';
import { UserAuthGuard } from '../../../guards/user-auth.guard';
import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { ETaggableEntityType } from '../constants/tag.constant';
import { AutocompleteTagQueryDto } from '../dto/tag-req.dto';
import {
  TagAutocompleteItemDto,
  TagDetailResDto,
  TagEncyclopediaResDto,
  TagSummaryResDto,
  TagTooltipResDto,
} from '../dto/tag-res.dto';
import { TagQueryFilterHelper } from '../helpers/tag-query-filter.helper';
import { EntityTaggingService } from '../services/entity-tagging.service';
import { TagAutocompleteService } from '../services/tag-autocomplete.service';
import { TagEncyclopediaService } from '../services/tag-encyclopedia.service';
import { TagService } from '../services/tag.service';

@ApiTags('Public Tags & Encyclopedia')
@Controller({ path: 'public/tags', version: '1' })
export class TagPublicController {
  constructor(
    private readonly tagService: TagService,
    private readonly autocompleteService: TagAutocompleteService,
    private readonly encyclopediaService: TagEncyclopediaService,
    private readonly tagQueryFilterHelper: TagQueryFilterHelper,
    private readonly entityTaggingService: EntityTaggingService,
  ) {}

  @Get()
  @ApiPublic({
    type: TagSummaryResDto,
    summary: 'Browse active canonical tags',
    isQueryBuilder: true,
    queryBuilderOptions: {
      filters: [
        'name',
        'slug',
        'search',
        AllowedFilter.exact('category'),
        AllowedFilter.exact('safetyRating'),
        AllowedFilter.exact('isOfficial'),
      ],
      sorts: ['name', 'usageCount', 'trendingScore', 'createdAt'],
      defaultSort: '-usageCount',
    },
  })
  findAll(@Query() query: QueryParams, @Query('locale') locale?: string) {
    return this.tagService.findAll(query, locale || 'en', true);
  }

  @Get('autocomplete')
  @ApiPublic({
    type: TagAutocompleteItemDto,
    summary: 'Multilingual & orthographic-alias tag autocomplete',
  })
  autocomplete(@Query() queryDto: AutocompleteTagQueryDto) {
    return this.autocompleteService.autocomplete(queryDto);
  }

  @Get('trending')
  @ApiPublic({
    type: TagSummaryResDto,
    summary: 'Get real-time trending tags',
  })
  getTrending(
    @Query('locale') locale?: string,
    @Query('limit') limit?: string,
  ) {
    return this.tagService.getTrendingTags(
      locale || 'en',
      limit ? Number(limit) : 16,
    );
  }

  @Get('search-content')
  @UseGuards(UserAuthGuard)
  @AuthOptional()
  @ApiPublic({
    summary:
      'Evaluate Pixiv boolean tag expression (AND, OR, -NOT, DAG hierarchy expansion, and user NG-tag mutes)',
  })
  async searchTaggedContent(
    @Query('tagQuery') tagQuery?: string,
    @Query('entityType') entityType?: ETaggableEntityType,
    @Query('expandHierarchy') expandHierarchy?: string,
    @Query('locale') locale?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @CurrentUser('id') currentUserId?: AutoIncrementID,
  ) {
    const cleanLocale = locale || 'en';
    const pageNum = Math.max(Number(page) || 1, 1);
    const take = Math.min(Math.max(Number(limit) || 12, 1), 50);

    const evaluation =
      await this.tagQueryFilterHelper.evaluateStandaloneBooleanSearch({
        tagQuery,
        entityType,
        expandHierarchy: expandHierarchy !== 'false',
        currentUserId: currentUserId ?? null,
        page: pageNum,
        limit: take,
      });

    const matchedTags = await Promise.all(
      evaluation.matchedTagIds
        .slice(0, 24)
        .map((id) =>
          this.tagService.findOneById(id, cleanLocale).catch(() => null),
        ),
    );

    const data = await Promise.all(
      evaluation.matchedEntityKeys.map(async (entry) => {
        const tagInfo = await this.entityTaggingService.listEntityTags(
          entry.entityType,
          entry.entityId,
          cleanLocale,
        );
        return {
          entityType: entry.entityType,
          entityId: entry.entityId,
          tags: tagInfo.tags,
        };
      }),
    );

    return {
      parsed: evaluation.parsed,
      matchedTags: matchedTags.filter((item) => item !== null),
      data,
      meta: {
        total: evaluation.totalEntities,
        page: pageNum,
        limit: take,
        totalPages: Math.max(Math.ceil(evaluation.totalEntities / take), 1),
      },
    };
  }

  @Get('by-slug/:slug')
  @UseGuards(UserAuthGuard)
  @AuthOptional()
  @ApiPublic({
    type: TagDetailResDto,
    summary:
      'Resolve canonical tag by slug or alias with semantic DAG neighborhood',
  })
  @ApiParam({ name: 'slug', type: 'String' })
  findBySlug(
    @Param('slug') slug: string,
    @Query('locale') locale?: string,
    @CurrentUser('id') currentUserId?: AutoIncrementID,
  ) {
    return this.tagService.findBySlugOrAlias(
      slug,
      locale || 'en',
      currentUserId ?? null,
    );
  }

  @Get('by-slug/:slug/tooltip')
  @ApiPublic({
    type: TagTooltipResDto,
    summary: 'Get lightweight cached tooltip card metadata for a tag',
  })
  @ApiParam({ name: 'slug', type: 'String' })
  getTooltip(@Param('slug') slug: string, @Query('locale') locale?: string) {
    return this.tagService.getTooltipBySlug(slug, locale || 'en');
  }

  @Get('encyclopedia/:slug')
  @ApiPublic({
    type: TagEncyclopediaResDto,
    summary: 'Read localized Pixiv-style tag encyclopedia article',
  })
  @ApiParam({ name: 'slug', type: 'String' })
  getEncyclopedia(
    @Param('slug') slug: string,
    @Query('locale') locale?: string,
  ) {
    return this.encyclopediaService.findByTagSlug(slug, locale || 'en', true);
  }
}
