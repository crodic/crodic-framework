import {
  AllowedFilter,
  AllowedSort,
  QueryParams,
} from '../../../common/query-builder';
import { ApiPublic } from '../../../decorators/http.decorators';
import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import {
  CosplayerCharacterResDto,
  CosplayerDetailResDto,
  CosplayerSummaryResDto,
} from '../dto/cosplayer-res.dto';
import { CosplayerService } from '../services/cosplayer.service';

@ApiTags('Public Cosplayers')
@Controller({ path: 'public/cosplayers', version: '1' })
export class CosplayerPublicController {
  constructor(private readonly cosplayerService: CosplayerService) {}

  @Get()
  @ApiPublic({
    type: CosplayerSummaryResDto,
    summary: 'Browse and search cosplayer directory',
    isQueryBuilder: true,
    queryBuilderOptions: {
      filters: [
        'displayName',
        'slug',
        'workArea',
        'search',
        AllowedFilter.exact('cityId'),
        AllowedFilter.exact('countryId'),
        AllowedFilter.exact('isVerified'),
        AllowedFilter.exact('isCraftingCreator'),
      ],
      sorts: [
        'rankingScore',
        'totalLikesCount',
        AllowedSort.field('followersCount', 'user.followersCount'),
        'albumsCount',
        'createdAt',
      ],
      defaultSort: '-rankingScore',
    },
  })
  findAll(@Query() query: QueryParams) {
    return this.cosplayerService.findAll(query);
  }

  @Get(':slug')
  @ApiPublic({
    type: CosplayerDetailResDto,
    summary: 'Get full public cosplayer portfolio by slug or handle',
  })
  @ApiParam({ name: 'slug', type: String, example: 'kiriko-cos' })
  findBySlug(@Param('slug') slug: string) {
    return this.cosplayerService.findBySlugOrHandle(slug);
  }

  @Get(':slug/characters')
  @ApiPublic({
    type: CosplayerCharacterResDto,
    summary: 'Get showcased cosplay characters of a cosplayer',
  })
  @ApiParam({ name: 'slug', type: String, example: 'kiriko-cos' })
  async getCharacters(@Param('slug') slug: string) {
    const profile = await this.cosplayerService.findBySlugOrHandle(slug);
    return profile.characters;
  }
}
