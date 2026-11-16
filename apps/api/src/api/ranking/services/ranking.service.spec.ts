import { AutoIncrementID } from '../../../common/types/common.type';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  ERankingFilterCategory,
  ERankingTrend,
} from '../constants/ranking.constant';
import { LeaderboardSnapshotEntity } from '../entities/leaderboard-snapshot.entity';
import { RankingService } from './ranking.service';

const id = (val: string) => val as unknown as AutoIncrementID;

describe('RankingService', () => {
  let service: RankingService;
  let snapshotRepo: any;

  beforeEach(async () => {
    snapshotRepo = {
      createQueryBuilder: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RankingService,
        {
          provide: getRepositoryToken(LeaderboardSnapshotEntity),
          useValue: snapshotRepo,
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
      postId: null,
      displayName: 'KIRIKO',
      handle: 'kiriko-cos',
      roleLabel: 'Pro Cosplayer',
      avatarUrl: 'https://img.jpg',
      isVerified: true,
      likesCount: '15000',
      followersCount: '48000',
      score: '98.5',
      featuredProjects: ['Acheron'],
      portfolioHref: '/cosplayer/kiriko-cos',
      filterCategory: ERankingFilterCategory.MONTH,
      periodKey: '2024-10',
    };

    const dto = (service as any).toLeaderboardDto(raw);
    expect(dto.rank).toBe(1);
    expect(dto.trend).toBe(ERankingTrend.UP);
    expect(dto.likesCount).toBe(15000);
    expect(dto.followersCount).toBe(48000);
    expect(dto.score).toBe(98.5);
    expect(dto.featuredProjects).toEqual(['Acheron']);
  });
});
