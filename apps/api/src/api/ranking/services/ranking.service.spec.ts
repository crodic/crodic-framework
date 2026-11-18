import { AutoIncrementID } from '../../../common/types/common.type';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CosplayerProfileEntity } from '../../cosplayer/entities/cosplayer-profile.entity';
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
  let profileRepo: any;

  beforeEach(async () => {
    snapshotRepo = {
      createQueryBuilder: jest.fn(),
    };
    profileRepo = {
      find: jest.fn().mockResolvedValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RankingService,
        {
          provide: getRepositoryToken(LeaderboardSnapshotEntity),
          useValue: snapshotRepo,
        },
        {
          provide: getRepositoryToken(CosplayerProfileEntity),
          useValue: profileRepo,
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
      likesCount: '15000',
      followersCount: '48000',
      score: '98.5',
      featuredProjects: ['Acheron'],
      filterCategory: ERankingFilterCategory.MONTH,
      periodKey: '2024-10',
    };
    const profile: any = {
      userId: id('100'),
      displayName: 'KIRIKO',
      slug: 'kiriko-cos',
      roleBadge: 'Pro Cosplayer',
      avatarUrl: 'https://img.jpg',
      isVerified: true,
    };

    const dto = (service as any).toLeaderboardDto(raw, profile);
    expect(dto.rank).toBe(1);
    expect(dto.trend).toBe(ERankingTrend.UP);
    expect(dto.displayName).toBe('KIRIKO');
    expect(dto.handle).toBe('@kiriko-cos');
    expect(dto.portfolioHref).toBe('/cosplayer/kiriko-cos');
    expect(dto.likesCount).toBe(15000);
    expect(dto.followersCount).toBe(48000);
    expect(dto.score).toBe(98.5);
    expect(dto.featuredProjects).toEqual(['Acheron']);
  });
});
