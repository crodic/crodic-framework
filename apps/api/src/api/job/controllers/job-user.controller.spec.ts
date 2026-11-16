import { AutoIncrementID } from '../../../common/types/common.type';
import { UserAuthGuard } from '../../../guards/user-auth.guard';
import { Test, TestingModule } from '@nestjs/testing';
import { JobUserController } from './job-user.controller';
import { JobService } from '../services/job.service';

const id = (val: string) => val as unknown as AutoIncrementID;

describe('JobUserController', () => {
  let controller: JobUserController;
  let service: Partial<Record<keyof JobService, jest.Mock>>;

  beforeEach(async () => {
    service = {
      create: jest.fn().mockResolvedValue({ id: id('1'), title: 'New Job' }),
      update: jest
        .fn()
        .mockResolvedValue({ id: id('1'), title: 'Updated Job' }),
      delete: jest.fn().mockResolvedValue(undefined),
      apply: jest.fn().mockResolvedValue({ id: id('10'), status: 'pending' }),
      getMyApplications: jest.fn().mockResolvedValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [JobUserController],
      providers: [{ provide: JobService, useValue: service }],
    })
      .overrideGuard(UserAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<JobUserController>(JobUserController);
  });

  it('create delegates to service', async () => {
    const dto: any = { title: 'New Job' };
    const res = await controller.create(id('100'), dto);
    expect(res.title).toBe('New Job');
    expect(service.create).toHaveBeenCalledWith(id('100'), dto);
  });

  it('update delegates to service', async () => {
    const dto: any = { title: 'Updated Job' };
    const res = await controller.update(id('100'), id('1'), dto);
    expect(res.title).toBe('Updated Job');
    expect(service.update).toHaveBeenCalledWith(id('100'), id('1'), dto);
  });

  it('delete delegates to service', async () => {
    await controller.delete(id('100'), id('1'));
    expect(service.delete).toHaveBeenCalledWith(id('100'), id('1'));
  });

  it('apply delegates to service', async () => {
    const dto: any = { fullName: 'A', stageName: 'B' };
    const res = await controller.apply(id('100'), id('1'), dto);
    expect(res.status).toBe('pending');
    expect(service.apply).toHaveBeenCalledWith(id('100'), id('1'), dto);
  });

  it('getMyApplications delegates to service', async () => {
    const res = await controller.getMyApplications(id('100'));
    expect(res).toEqual([]);
    expect(service.getMyApplications).toHaveBeenCalledWith(id('100'));
  });
});
