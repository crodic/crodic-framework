import { AutoIncrementID } from '../../../common/types/common.type';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CosplayerProfileEntity } from '../../cosplayer/entities/cosplayer-profile.entity';
import {
  ERankingFilterCategory,
  ERankingTrend,
} from '../constants/ranking.constant';
import { LeaderboardSnapshotEntity } from '../entities/leaderboard-snapshot.entity';
import { RankingService } from './ranking.service';
import { UserFollowEntity } from '../../social/entities/user-follow.entity';
import { PostEntity } from '../../post/entities/post.entity';
import { SettingsService } from '../../settings/settings.service';
import { DEFAULT_RANKING_SETTINGS } from '../dto/ranking-settings.dto';

const id = (val: string) => val as unknown as AutoIncrementID;

describe('RankingService', () => {
  let service: RankingService;
  let snapshotRepo: any;
  let profileRepo: any;
  let followRepo: any;
  let postRepo: any;
  let settingsService: any;
  let dataSource: any;

  beforeEach(async () => {
    snapshotRepo = {
      createQueryBuilder: jest.fn(),
      find: jest.fn().mockResolvedValue([]),
      update: jest.fn().mockResolvedValue({ affected: 0 }),
      create: jest.fn((val) => val),
      save: jest.fn().mockResolvedValue([]),
    };
    profileRepo = {
      find: jest.fn().mockResolvedValue([]),
      createQueryBuilder: jest.fn().mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      }),
    };
    followRepo = {
      createQueryBuilder: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([]),
      }),
    };
    postRepo = {
      createQueryBuilder: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      }),
    };
    settingsService = {
      get: jest.fn().mockResolvedValue(DEFAULT_RANKING_SETTINGS),
      set: jest.fn().mockResolvedValue(true),
    };
    const transactionManager = {
      find: jest.fn().mockResolvedValue([]),
      update: jest.fn().mockResolvedValue({ affected: 0 }),
      create: jest.fn((_, values) => values),
      save: jest.fn().mockResolvedValue([]),
    };
    dataSource = {
      transaction: jest.fn((callback) => callback(transactionManager)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RankingService,
        { provide: DataSource, useValue: dataSource },
        {
          provide: getRepositoryToken(LeaderboardSnapshotEntity),
          useValue: snapshotRepo,
        },
        {
          provide: getRepositoryToken(CosplayerProfileEntity),
          useValue: profileRepo,
        },
        {
          provide: getRepositoryToken(UserFollowEntity),
          useValue: followRepo,
        },
        {
          provide: getRepositoryToken(PostEntity),
          useValue: postRepo,
        },
        {
          provide: SettingsService,
          useValue: settingsService,
        },
      ],
    }).compile();

    service = module.get<RankingService>(RankingService);
  });

  it('toLeaderboardDto maps properties correctly', () => {
    const raw: any = {
      id: id('1'),
      rank: 1,
      previousRank: 2,
      trend: ERankingTrend.UP,
      userId: id('100'),
      postId: id('50'),
      filterCategory: ERankingFilterCategory.WEEK,
      periodKey: '2026-W46',
      likesCount: 100,
      followersCount: 50,
      score: 450,
      featuredProjects: ['http://example.com/p1.jpg'],
      user: {
        id: id('100'),
        fullName: 'Test User',
        username: 'testuser',
        avatar: 'http://example.com/a.jpg',
      },
    };

    const dto = (service as any).toLeaderboardDto(raw);
    expect(dto.rank).toBe(1);
    expect(dto.trend).toBe(ERankingTrend.UP);
    expect(dto.displayName).toBe('Test User');
    expect(dto.handle).toBe('@testuser');
    expect(dto.likesCount).toBe(100);
    expect(dto.followersCount).toBe(50);
  });

  it('getSettings returns default ranking settings', async () => {
    const settings = await service.getSettings();
    expect(settings.likesWeight).toBe(2);
    expect(settings.followersWeight).toBe(5);
    expect(settings.enableCronJob).toBe(true);
  });

  it('updateSettings updates ranking weights', async () => {
    const updated = await service.updateSettings({
      likesWeight: 3,
      followersWeight: 6,
      enableCronJob: false,
      enableFallbackRealtime: true,
    });
    expect(updated.likesWeight).toBe(3);
    expect(updated.followersWeight).toBe(6);
    expect(updated.enableCronJob).toBe(false);
    expect(settingsService.set).toHaveBeenCalled();
  });

  it('reports category failures and marks the snapshot run failed', async () => {
    jest
      .spyOn(service as any, 'computeRealtimeLeaderboard')
      .mockResolvedValue({ data: [] });
    dataSource.transaction.mockRejectedValueOnce(
      new Error('snapshot write failed'),
    );

    const result = await service.triggerSnapshotRecalculate();

    expect(result.failedCategories).toEqual([ERankingFilterCategory.WEEK]);
    expect(result.processedCategories).toHaveLength(4);
    expect(settingsService.set).toHaveBeenLastCalledWith(
      expect.any(String),
      expect.objectContaining({ lastSnapshotStatus: 'failed' }),
    );
  });
});
