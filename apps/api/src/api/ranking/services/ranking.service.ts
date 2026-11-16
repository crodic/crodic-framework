import {
  AllowedFilter,
  QueryBuilder,
  QueryParams,
} from '../../../common/query-builder';
import { Paginated } from '../../../common/dto/offset-pagination/paginated.dto';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LeaderboardItemResDto } from '../dto/ranking-res.dto';
import { LeaderboardSnapshotEntity } from '../entities/leaderboard-snapshot.entity';

@Injectable()
export class RankingService {
  constructor(
    @InjectRepository(LeaderboardSnapshotEntity)
    private readonly snapshotRepo: Repository<LeaderboardSnapshotEntity>,
  ) {}

  /**
   * Get current leaderboard rankings with filtering by category (week, month, all, etc.).
   */
  async getLeaderboard(
    query: QueryParams,
  ): Promise<Paginated<LeaderboardItemResDto>> {
    const baseQb = this.snapshotRepo
      .createQueryBuilder('snap')
      .where('snap.isCurrent = true');

    const paginated = await QueryBuilder.for(baseQb, query)
      .allowedFilters([
        AllowedFilter.exact('filterCategory'),
        AllowedFilter.exact('periodKey'),
        AllowedFilter.partial('displayName'),
        AllowedFilter.partial('handle'),
      ])
      .allowedSorts(['rank', 'score', 'likesCount', 'followersCount'])
      .defaultSort('rank')
      .paginate();

    const mapped = paginated.data.map((item) => this.toLeaderboardDto(item));
    return new Paginated(mapped, paginated.meta, paginated.links);
  }

  private toLeaderboardDto(
    item: LeaderboardSnapshotEntity,
  ): LeaderboardItemResDto {
    return {
      id: item.id,
      rank: item.rank,
      previousRank: item.previousRank ?? null,
      trend: item.trend,
      userId: item.userId,
      postId: item.postId ?? null,
      displayName: item.displayName,
      handle: item.handle,
      roleLabel: item.roleLabel,
      avatarUrl: item.avatarUrl,
      isVerified: item.isVerified,
      likesCount: Number(item.likesCount || 0),
      followersCount: Number(item.followersCount || 0),
      score: Number(item.score || 0),
      featuredProjects: item.featuredProjects || [],
      portfolioHref: item.portfolioHref,
      filterCategory: item.filterCategory,
      periodKey: item.periodKey,
    };
  }
}
