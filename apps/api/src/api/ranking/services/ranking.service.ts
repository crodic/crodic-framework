import {
  AllowedFilter,
  QueryBuilder,
  QueryParams,
} from '../../../common/query-builder';
import {
  Paginated,
  PaginatedLinks,
  PaginatedMeta,
} from '../../../common/dto/offset-pagination/paginated.dto';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, In, Repository } from 'typeorm';
import { CosplayerProfileEntity } from '../../cosplayer/entities/cosplayer-profile.entity';
import { CosplayerProfileUtil } from '../../cosplayer/utils/cosplayer-profile.util';
import { LeaderboardItemResDto } from '../dto/ranking-res.dto';
import { LeaderboardSnapshotEntity } from '../entities/leaderboard-snapshot.entity';
import { SettingsService } from '../../settings/settings.service';
import { SettingKeys } from '../../settings/enums/setting-keys';
import {
  DEFAULT_RANKING_SETTINGS,
  RankingSettingsDto,
  TriggerSnapshotResDto,
  UpdateRankingSettingsReqDto,
} from '../dto/ranking-settings.dto';
import {
  ERankingFilterCategory,
  ERankingTrend,
} from '../constants/ranking.constant';
import { UserFollowEntity } from '../../social/entities/user-follow.entity';
import { PostEntity } from '../../post/entities/post.entity';
import { AutoIncrementID } from '../../../common/types/common.type';

@Injectable()
export class RankingService {
  private readonly logger = new Logger(RankingService.name);

  constructor(
    @InjectRepository(LeaderboardSnapshotEntity)
    private readonly snapshotRepo: Repository<LeaderboardSnapshotEntity>,
    @InjectRepository(CosplayerProfileEntity)
    private readonly profileRepo: Repository<CosplayerProfileEntity>,
    @InjectRepository(UserFollowEntity)
    private readonly followRepo: Repository<UserFollowEntity>,
    @InjectRepository(PostEntity)
    private readonly postRepo: Repository<PostEntity>,
    private readonly settingsService: SettingsService,
  ) {}

  /**
   * Get ranking settings (formula weights, cron options, etc.)
   */
  async getSettings(): Promise<RankingSettingsDto> {
    return this.settingsService.get<RankingSettingsDto>(
      SettingKeys.RANKING,
      DEFAULT_RANKING_SETTINGS,
    );
  }

  /**
   * Update ranking settings from Admin Portal
   */
  async updateSettings(
    dto: UpdateRankingSettingsReqDto,
  ): Promise<RankingSettingsDto> {
    const current = await this.getSettings();
    const updated: RankingSettingsDto = {
      ...current,
      likesWeight: dto.likesWeight,
      followersWeight: dto.followersWeight,
      enableCronJob: dto.enableCronJob,
      enableFallbackRealtime: dto.enableFallbackRealtime,
    };
    await this.settingsService.set(SettingKeys.RANKING, updated);
    return updated;
  }

  /**
   * Get current leaderboard rankings with filtering by category (week, month, all, etc.).
   * If snapshot data is empty and fallback is enabled, dynamically computes rankings.
   */
  async getLeaderboard(
    query: QueryParams,
  ): Promise<Paginated<LeaderboardItemResDto>> {
    const baseQb = this.snapshotRepo
      .createQueryBuilder('snap')
      .innerJoinAndSelect('snap.user', 'user', 'user.deletedAt IS NULL')
      .innerJoin(
        CosplayerProfileEntity,
        'cosplayer',
        'cosplayer.userId = snap.userId AND cosplayer.deletedAt IS NULL',
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

    // If snapshot has data, map and return
    if (paginated.data.length > 0) {
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

    // Real-time fallback if no snapshot exists
    const settings = await this.getSettings();
    if (settings.enableFallbackRealtime) {
      const categoryParam = query?.filter?.filterCategory;
      const category = (
        Array.isArray(categoryParam) ? categoryParam[0] : categoryParam
      ) as ERankingFilterCategory;
      const searchParam = query?.filter?.search;
      const searchTerm = Array.isArray(searchParam)
        ? searchParam[0]
        : searchParam;

      return this.computeRealtimeLeaderboard(
        category || ERankingFilterCategory.WEEK,
        searchTerm,
        settings,
      );
    }

    return new Paginated([], paginated.meta, paginated.links);
  }

  /**
   * Real-time dynamic calculation of leaderboard based on formula:
   * Score = (Likes * likesWeight) + (Followers * followersWeight)
   */
  async computeRealtimeLeaderboard(
    category: ERankingFilterCategory,
    searchTerm?: string,
    settings?: RankingSettingsDto,
  ): Promise<Paginated<LeaderboardItemResDto>> {
    const config = settings || (await this.getSettings());
    const likesWeight = config.likesWeight ?? 2;
    const followersWeight = config.followersWeight ?? 5;

    const qb = this.profileRepo
      .createQueryBuilder('cosplayer')
      .innerJoinAndSelect('cosplayer.user', 'user', 'user.deletedAt IS NULL')
      .where('cosplayer.deletedAt IS NULL');

    if (category === ERankingFilterCategory.CRAFTING) {
      qb.andWhere('cosplayer.isCraftingCreator = true');
    }

    if (searchTerm && searchTerm.trim()) {
      const normalized = searchTerm.trim().toLowerCase();
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
    }

    const profiles = await qb.take(50).getMany();

    if (profiles.length === 0) {
      const meta = Object.assign(new PaginatedMeta(), {
        itemsPerPage: 20,
        totalItems: 0,
        currentPage: 1,
        totalPages: 0,
        sortBy: [['score', 'DESC']] as [string, 'ASC' | 'DESC'][],
      });
      return new Paginated([], meta);
    }

    const userIds = profiles.map((p) => String(p.userId));

    // Get followers count per user (excluding soft-deleted followers)
    const followersCountsRaw = await this.followRepo
      .createQueryBuilder('f')
      .innerJoin('f.follower', 'follower', 'follower.deletedAt IS NULL')
      .select('f.followingId', 'userId')
      .addSelect('COUNT(f.id)', 'count')
      .where('f.followingId IN (:...userIds)', { userIds })
      .groupBy('f.followingId')
      .getRawMany<{ userId: string; count: string }>();

    const followersMap = new Map<string, number>();
    followersCountsRaw.forEach((row) => {
      followersMap.set(String(row.userId), parseInt(row.count, 10) || 0);
    });

    // Get up to 3 featured post covers per user (excluding soft-deleted posts)
    const postsRaw = await this.postRepo
      .createQueryBuilder('p')
      .select(['p.authorId', 'p.coverImageUrl', 'p.createdAt'])
      .where('p.authorId IN (:...userIds)', { userIds })
      .andWhere('p.coverImageUrl IS NOT NULL')
      .andWhere('p.deletedAt IS NULL')
      .orderBy('p.createdAt', 'DESC')
      .getMany();

    const featuredProjectsMap = new Map<string, string[]>();
    postsRaw.forEach((p) => {
      const uId = String(p.authorId);
      const list = featuredProjectsMap.get(uId) || [];
      if (list.length < 3 && p.coverImageUrl) {
        list.push(p.coverImageUrl);
        featuredProjectsMap.set(uId, list);
      }
    });

    // Compute scores and sort
    const scoredList = profiles.map((profile) => {
      const uId = String(profile.userId);
      const likesCount = Number(profile.totalLikesCount || 0);
      const followersCount = followersMap.get(uId) || 0;
      const score = likesCount * likesWeight + followersCount * followersWeight;

      return {
        profile,
        likesCount,
        followersCount,
        score,
        featuredProjects: featuredProjectsMap.get(uId) || [],
      };
    });

    // Sort descending by score
    scoredList.sort((a, b) => b.score - a.score);

    const periodKey = this.generatePeriodKey(category);

    const items: LeaderboardItemResDto[] = scoredList.map((item, index) => {
      const rank = index + 1;
      const display = CosplayerProfileUtil.formatDisplay(
        item.profile,
        item.profile.user,
      );
      const displayName = display.displayName || `User #${item.profile.userId}`;
      const handle =
        display.handle ||
        (item.profile.user?.username
          ? `@${item.profile.user.username}`
          : `@user${item.profile.userId}`);
      const portfolioHref =
        display.portfolioHref || `/cosplayer/${item.profile.userId}`;

      return {
        id: item.profile.id,
        rank,
        previousRank: rank,
        trend: ERankingTrend.SAME,
        userId: item.profile.userId,
        postId: null,
        displayName,
        handle,
        roleLabel: display.roleBadge || 'Cosplayer',
        avatarUrl: display.avatarUrl || item.profile.user?.avatar || '',
        isVerified: display.isVerified,
        likesCount: item.likesCount,
        followersCount: item.followersCount,
        score: item.score,
        featuredProjects: item.featuredProjects,
        portfolioHref,
        filterCategory: category,
        periodKey,
      };
    });

    const meta = Object.assign(new PaginatedMeta(), {
      itemsPerPage: items.length || 20,
      totalItems: items.length,
      currentPage: 1,
      totalPages: 1,
      sortBy: [['score', 'DESC']] as [string, 'ASC' | 'DESC'][],
    });
    return new Paginated(items, meta);
  }

  /**
   * Trigger recalculation and take snapshots for all categories
   */
  async triggerSnapshotRecalculate(): Promise<TriggerSnapshotResDto> {
    this.logger.log('Starting snapshot recalculation across all categories...');
    const settings = await this.getSettings();
    const categories = [
      ERankingFilterCategory.WEEK,
      ERankingFilterCategory.MONTH,
      ERankingFilterCategory.ALL,
      ERankingFilterCategory.CRAFTING,
    ];

    const processedCategories: string[] = [];

    for (const cat of categories) {
      try {
        const paginated = await this.computeRealtimeLeaderboard(
          cat,
          undefined,
          settings,
        );
        const currentItems = paginated.data;

        // Fetch previous active snapshots to calculate previousRank and trend
        const prevSnapshots = await this.snapshotRepo.find({
          where: { filterCategory: cat, isCurrent: true },
        });
        const prevRankMap = new Map<string, number>();
        prevSnapshots.forEach((s) => prevRankMap.set(String(s.userId), s.rank));

        // Mark old snapshots as not current
        await this.snapshotRepo.update(
          { filterCategory: cat, isCurrent: true },
          { isCurrent: false },
        );

        const periodKey = this.generatePeriodKey(cat);

        // Save new snapshots
        const newSnapshots = currentItems.map((item) => {
          const prevRank = prevRankMap.get(String(item.userId)) ?? null;
          let trend = ERankingTrend.SAME;
          if (prevRank !== null) {
            if (item.rank < prevRank) trend = ERankingTrend.UP;
            else if (item.rank > prevRank) trend = ERankingTrend.DOWN;
          }

          return this.snapshotRepo.create({
            filterCategory: cat,
            periodKey,
            isCurrent: true,
            rank: item.rank,
            previousRank: prevRank,
            trend,
            userId: item.userId,
            likesCount: item.likesCount,
            followersCount: item.followersCount,
            score: item.score,
            featuredProjects: item.featuredProjects,
          });
        });

        if (newSnapshots.length > 0) {
          await this.snapshotRepo.save(newSnapshots);
        }

        processedCategories.push(cat);
      } catch (err: any) {
        this.logger.error(
          `Failed to recalculate snapshot for category ${cat}: ${err.message}`,
          err.stack,
        );
      }
    }

    const timestamp = new Date().toISOString();
    await this.settingsService.set(SettingKeys.RANKING, {
      ...settings,
      lastSnapshotAt: timestamp,
      lastSnapshotStatus: 'success',
    });

    this.logger.log('Snapshot recalculation completed successfully.');
    return {
      message: 'Recalculated ranking snapshots successfully',
      processedCategories,
      timestamp,
    };
  }

  /**
   * Preview top cosplayers with current weights for portal
   */
  async getPreviewRanking(): Promise<LeaderboardItemResDto[]> {
    const paginated = await this.computeRealtimeLeaderboard(
      ERankingFilterCategory.ALL,
    );
    return paginated.data.slice(0, 10);
  }

  private generatePeriodKey(category: ERankingFilterCategory): string {
    const now = new Date();
    const year = now.getFullYear();
    if (category === ERankingFilterCategory.MONTH) {
      const month = String(now.getMonth() + 1).padStart(2, '0');
      return `${year}-M${month}`;
    }
    if (category === ERankingFilterCategory.ALL) {
      return 'all-time';
    }
    // Week calculation
    const oneJan = new Date(year, 0, 1);
    const numberOfDays = Math.floor(
      (now.getTime() - oneJan.getTime()) / (24 * 60 * 60 * 1000),
    );
    const weekNumber = Math.ceil((numberOfDays + oneJan.getDay() + 1) / 7);
    return `${year}-W${String(weekNumber).padStart(2, '0')}`;
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
