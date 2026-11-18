import { AutoIncrementID } from '../../../common/types/common.type';
import { UserAuthGuard } from '../../../guards/user-auth.guard';
import { Test, TestingModule } from '@nestjs/testing';
import {
  EReportStatus,
  EReportTargetType,
} from '../constants/content-report.constant';
import { ContentReportUserController } from './content-report-user.controller';
import { ContentReportService } from '../services/content-report.service';

const id = (val: string) => val as unknown as AutoIncrementID;

describe('ContentReportUserController', () => {
  let controller: ContentReportUserController;
  let service: Partial<Record<keyof ContentReportService, jest.Mock>>;

  beforeEach(async () => {
    service = {
      createReport: jest.fn().mockResolvedValue({
        id: id('1'),
        targetType: EReportTargetType.POST,
        status: EReportStatus.PENDING,
      }),
      getMyReports: jest.fn().mockResolvedValue({ data: [], meta: {} }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContentReportUserController],
      providers: [{ provide: ContentReportService, useValue: service }],
    })
      .overrideGuard(UserAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ContentReportUserController>(
      ContentReportUserController,
    );
  });

  it('create delegates to service', async () => {
    const dto: any = {
      targetType: EReportTargetType.POST,
      targetId: id('5'),
      reason: 'Spam',
    };
    const res = await controller.create(id('100'), dto);
    expect(res.id).toBe(id('1'));
    expect(service.createReport).toHaveBeenCalledWith(id('100'), dto);
  });

  it('getMyReports delegates to service', async () => {
    const query: any = {};
    await controller.getMyReports(id('100'), query);
    expect(service.getMyReports).toHaveBeenCalledWith(id('100'), query);
  });
});
