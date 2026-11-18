import { AdminAuthGuard } from '../../../guards/admin-auth.guard';
import { Test, TestingModule } from '@nestjs/testing';
import { AdminAnalyticsController } from './admin-analytics.controller';
import { AdminAnalyticsService } from '../services/admin-analytics.service';

describe('AdminAnalyticsController', () => {
  let controller: AdminAnalyticsController;
  let service: Partial<Record<keyof AdminAnalyticsService, jest.Mock>>;

  beforeEach(async () => {
    service = {
      getOverview: jest.fn().mockResolvedValue({
        kpi: {
          totalUsers: 100,
          verifiedUsers: 80,
          totalCosplayers: 30,
          verifiedCosplayers: 10,
          totalPosts: 50,
          featuredPosts: 8,
          totalEvents: 6,
          activeEvents: 4,
          pendingReports: 2,
          pendingPosts: 3,
        },
        postCategories: [{ category: 'series', count: 35 }],
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminAnalyticsController],
      providers: [{ provide: AdminAnalyticsService, useValue: service }],
    })
      .overrideGuard(AdminAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AdminAnalyticsController>(AdminAnalyticsController);
  });

  it('getOverview delegates to service.getOverview', async () => {
    const res = await controller.getOverview();
    expect(service.getOverview).toHaveBeenCalled();
    expect(res.kpi.totalUsers).toBe(100);
    expect(res.kpi.totalCosplayers).toBe(30);
  });
});
