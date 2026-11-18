import {
  AllowedFilter,
  QueryBuilder,
  QueryParams,
} from '../../../common/query-builder';
import { Paginated } from '../../../common/dto/offset-pagination/paginated.dto';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, In, Repository } from 'typeorm';
import { CosplayerProfileEntity } from '../../cosplayer/entities/cosplayer-profile.entity';
import { CosplayerProfileUtil } from '../../cosplayer/utils/cosplayer-profile.util';
import { LeaderboardItemResDto } from '../dto/ranking-res.dto';
import { LeaderboardSnapshotEntity } from '../entities/leaderboard-snapshot.entity';

@Injectable()
export class RankingService {
  constructor(
    @InjectRepository(LeaderboardSnapshotEntity)
    private readonly snapshotRepo: Repository<LeaderboardSnapshotEntity>,
    @InjectRepository(CosplayerProfileEntity)
    private readonly profileRepo: Repository<CosplayerProfileEntity>,
  ) {}

  /**
   * Get current leaderboard rankings with filtering by category (week, month, all, etc.).
   */
  async getLeaderboard(
    query: QueryParams,
  ): Promise<Paginated<LeaderboardItemResDto>> {
    const baseQb = this.snapshotRepo
      .createQueryBuilder('snap')
      .leftJoinAndSelect('snap.user', 'user')
      .leftJoin(
        CosplayerProfileEntity,
        'cosplayer',
        'cosplayer.userId = snap.userId',
      )
      .where('snap.isCurrent = true');

    const paginated = await QueryBuilder.for(baseQb, query)
      .allowedFilters([
        AllowedFilter.exact('filterCategory'),
        AllowedFilter.exact('periodKey'),
        AllowedFilter.callback('search', (qb, value) => {
          const term = Array.isArray(value) ? String(value[0]) : String(value);
          const normalized = term.trim().toLowerCase();
          if (!normalized) return;
          qb.andWhere(
            new Brackets((b) => {
              b.where('LOWER(cosplayer.displayName) LIKE :sTerm', {
                sTerm: `%${normalized}%`,
              })
                .orWhere('LOWER(cosplayer.slug) LIKE :sTerm', {
                  sTerm: `%${normalized}%`,
                })
                .orWhere('LOWER(user.fullName) LIKE :sTerm', {
                  sTerm: `%${normalized}%`,
                });
            }),
          );
        }),
      ])
      .allowedSorts(['rank', 'score', 'likesCount', 'followersCount'])
      .defaultSort('rank')
      .paginate();

    const userIds = Array.from(
      new Set(paginated.data.map((item) => item.userId)),
    );
    const profileMap = await CosplayerProfileUtil.loadProfilesMap(
      this.profileRepo,
      userIds,
    );

    const mapped = paginated.data.map((item) =>
      this.toLeaderboardDto(item, profileMap.get(String(item.userId))),
    );
    return new Paginated(mapped, paginated.meta, paginated.links);
  }

  private toLeaderboardDto(
    item: LeaderboardSnapshotEntity,
    profile?: CosplayerProfileEntity,
  ): LeaderboardItemResDto {
    const display = CosplayerProfileUtil.formatDisplay(profile, item.user);
    const displayName = display.displayName || `User #${item.userId}`;
    const handle =
      display.handle ||
      (item.user?.username ? `@${item.user.username}` : `@user${item.userId}`);
    const portfolioHref = display.portfolioHref || `/cosplayer/${item.userId}`;

    return {
      id: item.id,
      rank: item.rank,
      previousRank: item.previousRank ?? null,
      trend: item.trend,
      userId: item.userId,
      postId: item.postId ?? null,
      displayName,
      handle,
      roleLabel: display.roleBadge || 'Cosplayer',
      avatarUrl: display.avatarUrl || item.user?.avatar || '',
      isVerified: display.isVerified,
      likesCount: Number(item.likesCount || 0),
      followersCount: Number(item.followersCount || 0),
      score: Number(item.score || 0),
      featuredProjects: item.featuredProjects || [],
      portfolioHref,
      filterCategory: item.filterCategory,
      periodKey: item.periodKey,
    };
  }
}
