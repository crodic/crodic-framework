import { AutoIncrementID } from '../../../common/types/common.type';
import { Test, TestingModule } from '@nestjs/testing';
import { JobPublicController } from './job-public.controller';
import { JobService } from '../services/job.service';

const id = (val: string) => val as unknown as AutoIncrementID;

describe('JobPublicController', () => {
  let controller: JobPublicController;
  let service: Partial<Record<keyof JobService, jest.Mock>>;

  beforeEach(async () => {
    service = {
      findAll: jest.fn().mockResolvedValue({ data: [], meta: {} }),
      findBySlug: jest
        .fn()
        .mockResolvedValue({ id: id('1'), slug: 'hoyoverse-job' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [JobPublicController],
      providers: [{ provide: JobService, useValue: service }],
    }).compile();

    controller = module.get<JobPublicController>(JobPublicController);
  });

  it('findAll delegates to service', async () => {
    const query = { page: 1, limit: 10 };
    await controller.findAll(query as any, id('100'));
    expect(service.findAll).toHaveBeenCalledWith(query, id('100'));
  });

  it('findBySlug delegates to service', async () => {
    const res = await controller.findBySlug('hoyoverse-job', id('100'));
    expect(res.slug).toBe('hoyoverse-job');
    expect(service.findBySlug).toHaveBeenCalledWith('hoyoverse-job', id('100'));
  });
});
