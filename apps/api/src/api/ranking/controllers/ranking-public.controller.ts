import { AllowedFilter, QueryParams } from '../../../common/query-builder';
import { ApiPublic } from '../../../decorators/http.decorators';
import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { LeaderboardItemResDto } from '../dto/ranking-res.dto';
import { RankingService } from '../services/ranking.service';

@ApiTags('Public Cosplayer Rankings & Leaderboard')
@Controller({ path: 'public/rankings', version: '1' })
export class RankingPublicController {
  constructor(private readonly rankingService: RankingService) {}

  @Get()
  @ApiPublic({
    type: LeaderboardItemResDto,
    summary:
      'Get leaderboard rankings with category filters (week, month, all, projects, crafting)',
    isQueryBuilder: true,
    queryBuilderOptions: {
      filters: [
        'search',
        AllowedFilter.exact('filterCategory'),
        AllowedFilter.exact('periodKey'),
      ],
      sorts: ['rank', 'score', 'likesCount', 'followersCount'],
      defaultSort: 'rank',
    },
  })
  getLeaderboard(@Query() query: QueryParams) {
    return this.rankingService.getLeaderboard(query);
  }
}
