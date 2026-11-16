import { AutoIncrementID } from '../../../common/types/common.type';
import { Test, TestingModule } from '@nestjs/testing';
import { BrandPublicController } from './brand-public.controller';
import { BrandService } from '../services/brand.service';

const id = (val: string) => val as unknown as AutoIncrementID;

describe('BrandPublicController', () => {
  let controller: BrandPublicController;
  let service: Partial<Record<keyof BrandService, jest.Mock>>;

  beforeEach(async () => {
    service = {
      findAll: jest.fn().mockResolvedValue({ data: [], meta: {} }),
      findBySlug: jest
        .fn()
        .mockResolvedValue({ id: id('1'), name: 'HoYoverse' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BrandPublicController],
      providers: [{ provide: BrandService, useValue: service }],
    }).compile();

    controller = module.get<BrandPublicController>(BrandPublicController);
  });

  it('findAll delegates to service', async () => {
    const query: any = {};
    await controller.findAll(query);
    expect(service.findAll).toHaveBeenCalledWith(query);
  });

  it('findBySlug delegates to service', async () => {
    const res = await controller.findBySlug('hoyoverse');
    expect(res.name).toBe('HoYoverse');
    expect(service.findBySlug).toHaveBeenCalledWith('hoyoverse');
  });
});
