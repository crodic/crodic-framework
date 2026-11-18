import { AutoIncrementID } from '../../../common/types/common.type';
import { AdminAuthGuard } from '../../../guards/admin-auth.guard';
import { PoliciesGuard } from '../../../guards/policies.guard';
import { Test, TestingModule } from '@nestjs/testing';
import {
  EReportStatus,
  EReportTargetType,
} from '../constants/content-report.constant';
import { ContentReportAdminController } from './content-report-admin.controller';
import { ContentReportService } from '../services/content-report.service';

const id = (val: string) => val as unknown as AutoIncrementID;

describe('ContentReportAdminController', () => {
  let controller: ContentReportAdminController;
  let service: Partial<Record<keyof ContentReportService, jest.Mock>>;

  beforeEach(async () => {
    service = {
      findAllAdmin: jest.fn().mockResolvedValue({ data: [], meta: {} }),
      findOneAdmin: jest.fn().mockResolvedValue({
        id: id('1'),
        targetType: EReportTargetType.POST,
        status: EReportStatus.PENDING,
      }),
      resolveReport: jest.fn().mockResolvedValue({
        id: id('1'),
        targetType: EReportTargetType.POST,
        status: EReportStatus.RESOLVED,
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContentReportAdminController],
      providers: [{ provide: ContentReportService, useValue: service }],
    })
      .overrideGuard(AdminAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(PoliciesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ContentReportAdminController>(
      ContentReportAdminController,
    );
  });

  it('findAll delegates to service', async () => {
    const query: any = {};
    await controller.findAll(query);
    expect(service.findAllAdmin).toHaveBeenCalledWith(query);
  });

  it('findOne delegates to service', async () => {
    await controller.findOne(id('1'));
    expect(service.findOneAdmin).toHaveBeenCalledWith(id('1'));
  });

  it('resolve delegates to service', async () => {
    const dto = { status: EReportStatus.RESOLVED, resolutionNote: 'Resolved' };
    await controller.resolve(id('1'), id('99'), dto);
    expect(service.resolveReport).toHaveBeenCalledWith(id('1'), id('99'), dto);
  });
});
