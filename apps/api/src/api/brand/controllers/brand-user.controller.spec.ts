import { AutoIncrementID } from '../../../common/types/common.type';
import { UserAuthGuard } from '../../../guards/user-auth.guard';
import { Test, TestingModule } from '@nestjs/testing';
import { BrandUserController } from './brand-user.controller';
import { BrandService } from '../services/brand.service';

const id = (val: string) => val as unknown as AutoIncrementID;

describe('BrandUserController', () => {
  let controller: BrandUserController;
  let service: Partial<Record<keyof BrandService, jest.Mock>>;

  beforeEach(async () => {
    service = {
      create: jest.fn().mockResolvedValue({ id: id('1'), name: 'Studio A' }),
      update: jest.fn().mockResolvedValue({ id: id('1'), name: 'Studio B' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BrandUserController],
      providers: [{ provide: BrandService, useValue: service }],
    })
      .overrideGuard(UserAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<BrandUserController>(BrandUserController);
  });

  it('create delegates to service', async () => {
    const dto: any = { name: 'Studio A' };
    const res = await controller.create(id('100'), dto);
    expect(res.name).toBe('Studio A');
    expect(service.create).toHaveBeenCalledWith(id('100'), dto);
  });

  it('update delegates to service', async () => {
    const dto: any = { name: 'Studio B' };
    const res = await controller.update(id('100'), id('1'), dto);
    expect(res.name).toBe('Studio B');
    expect(service.update).toHaveBeenCalledWith(id('100'), id('1'), dto);
  });
});
