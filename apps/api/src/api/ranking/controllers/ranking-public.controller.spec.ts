import { Test, TestingModule } from '@nestjs/testing';
import { RankingPublicController } from './ranking-public.controller';
import { RankingService } from '../services/ranking.service';

describe('RankingPublicController', () => {
  let controller: RankingPublicController;
  let service: Partial<Record<keyof RankingService, jest.Mock>>;

  beforeEach(async () => {
    service = {
      getLeaderboard: jest.fn().mockResolvedValue({ data: [], meta: {} }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RankingPublicController],
      providers: [{ provide: RankingService, useValue: service }],
    }).compile();

    controller = module.get<RankingPublicController>(RankingPublicController);
  });

  it('getLeaderboard delegates to service', async () => {
    const query: any = { filterCategory: 'month' };
    await controller.getLeaderboard(query);
    expect(service.getLeaderboard).toHaveBeenCalledWith(query);
  });
});
