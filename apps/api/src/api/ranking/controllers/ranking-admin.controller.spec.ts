import { Test, TestingModule } from '@nestjs/testing';
import { RankingAdminController } from './ranking-admin.controller';
import { RankingService } from '../services/ranking.service';
import { DEFAULT_RANKING_SETTINGS } from '../dto/ranking-settings.dto';
import { AdminAuthGuard } from '../../../guards/admin-auth.guard';
import { PoliciesGuard } from '../../../guards/policies.guard';

describe('RankingAdminController', () => {
  let controller: RankingAdminController;
  let service: any;

  beforeEach(async () => {
    service = {
      getSettings: jest.fn().mockResolvedValue(DEFAULT_RANKING_SETTINGS),
      updateSettings: jest.fn().mockResolvedValue(DEFAULT_RANKING_SETTINGS),
      triggerSnapshotRecalculate: jest.fn().mockResolvedValue({
        message: 'Success',
        processedCategories: ['week'],
        failedCategories: [],
        timestamp: '2026-11-20T00:00:00Z',
      }),
      getPreviewRanking: jest.fn().mockResolvedValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RankingAdminController],
      providers: [
        {
          provide: RankingService,
          useValue: service,
        },
      ],
    })
      .overrideGuard(AdminAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(PoliciesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<RankingAdminController>(RankingAdminController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('getSettings should delegate to rankingService', async () => {
    const res = await controller.getSettings();
    expect(res).toEqual(DEFAULT_RANKING_SETTINGS);
    expect(service.getSettings).toHaveBeenCalled();
  });

  it('updateSettings should delegate to rankingService', async () => {
    const dto = {
      likesWeight: 3,
      followersWeight: 6,
      enableCronJob: true,
      enableFallbackRealtime: true,
    };
    await controller.updateSettings(dto);
    expect(service.updateSettings).toHaveBeenCalledWith(dto);
  });

  it('triggerRecalculate should delegate to rankingService', async () => {
    const res = await controller.triggerRecalculate();
    expect(res.message).toBe('Success');
    expect(service.triggerSnapshotRecalculate).toHaveBeenCalled();
  });

  it('getPreview should delegate to rankingService', async () => {
    const res = await controller.getPreview();
    expect(res).toEqual([]);
    expect(service.getPreviewRanking).toHaveBeenCalled();
  });
});
