import { AutoIncrementID } from '../../../common/types/common.type';
import { AdminAuthGuard } from '../../../guards/admin-auth.guard';
import { PoliciesGuard } from '../../../guards/policies.guard';
import { Test, TestingModule } from '@nestjs/testing';
import { EJobStatus } from '../constants/job.constant';
import { JobAdminController } from './job-admin.controller';
import { JobService } from '../services/job.service';

const id = (val: string) => val as unknown as AutoIncrementID;

describe('JobAdminController', () => {
  let controller: JobAdminController;
  let service: Partial<Record<keyof JobService, jest.Mock>>;

  beforeEach(async () => {
    service = {
      findAll: jest.fn().mockResolvedValue({ data: [], meta: {} }),
      findById: jest
        .fn()
        .mockResolvedValue({ id: id('1'), title: 'Cosplay Job' }),
      create: jest
        .fn()
        .mockResolvedValue({ id: id('1'), title: 'Cosplay Job' }),
      updateAdmin: jest
        .fn()
        .mockResolvedValue({ id: id('1'), title: 'Updated' }),
      updateStatusAdmin: jest
        .fn()
        .mockResolvedValue({ id: id('1'), status: EJobStatus.OPEN }),
      deleteAdmin: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [JobAdminController],
      providers: [{ provide: JobService, useValue: service }],
    })
      .overrideGuard(AdminAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(PoliciesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<JobAdminController>(JobAdminController);
  });

  it('findAll delegates to service', async () => {
    const query: any = {};
    await controller.findAll(query);
    expect(service.findAll).toHaveBeenCalledWith(query);
  });

  it('findOne delegates to service', async () => {
    await controller.findOne(id('1'));
    expect(service.findById).toHaveBeenCalledWith(id('1'));
  });

  it('create delegates to service', async () => {
    const dto: any = { title: 'Cosplay Job' };
    await controller.create(id('99'), dto);
    expect(service.create).toHaveBeenCalledWith(id('99'), dto);
  });

  it('update delegates to service', async () => {
    const dto: any = { title: 'Updated' };
    await controller.update(id('1'), dto);
    expect(service.updateAdmin).toHaveBeenCalledWith(id('1'), dto);
  });

  it('updateStatus delegates to service', async () => {
    const dto = { status: EJobStatus.OPEN };
    await controller.updateStatus(id('1'), dto);
    expect(service.updateStatusAdmin).toHaveBeenCalledWith(id('1'), dto);
  });

  it('remove delegates to service', async () => {
    await controller.remove(id('1'));
    expect(service.deleteAdmin).toHaveBeenCalledWith(id('1'));
  });
});
