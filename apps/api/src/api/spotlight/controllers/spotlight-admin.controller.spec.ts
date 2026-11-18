import { AutoIncrementID } from '../../../common/types/common.type';
import { AdminAuthGuard } from '../../../guards/admin-auth.guard';
import { PoliciesGuard } from '../../../guards/policies.guard';
import { Test, TestingModule } from '@nestjs/testing';
import { SpotlightAdminController } from './spotlight-admin.controller';
import { SpotlightService } from '../services/spotlight.service';

const id = (val: string) => val as unknown as AutoIncrementID;

describe('SpotlightAdminController', () => {
  let controller: SpotlightAdminController;
  let service: Partial<Record<keyof SpotlightService, jest.Mock>>;

  beforeEach(async () => {
    service = {
      findAllAdmin: jest.fn().mockResolvedValue({ data: [], meta: {} }),
      findById: jest.fn().mockResolvedValue({ id: id('1'), name: 'Banner 1' }),
      createBanner: jest
        .fn()
        .mockResolvedValue({ id: id('1'), name: 'Banner 1' }),
      updateBanner: jest
        .fn()
        .mockResolvedValue({ id: id('1'), name: 'Updated' }),
      toggleBanner: jest
        .fn()
        .mockResolvedValue({ id: id('1'), isActive: false }),
      deleteBanner: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SpotlightAdminController],
      providers: [{ provide: SpotlightService, useValue: service }],
    })
      .overrideGuard(AdminAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(PoliciesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<SpotlightAdminController>(SpotlightAdminController);
  });

  it('findAll delegates to service', async () => {
    const query: any = {};
    await controller.findAll(query);
    expect(service.findAllAdmin).toHaveBeenCalledWith(query);
  });

  it('findOne delegates to service', async () => {
    await controller.findOne(id('1'));
    expect(service.findById).toHaveBeenCalledWith(id('1'));
  });

  it('create delegates to service', async () => {
    const dto: any = {
      cosplayerUserId: id('100'),
      badge: 'TOP 1',
      tagline: 'Banner tagline',
      bannerImageUrl: 'https://example.com/banner.jpg',
    };
    await controller.create(dto);
    expect(service.createBanner).toHaveBeenCalledWith(dto);
  });

  it('update delegates to service', async () => {
    const dto: any = { badge: 'Updated' };
    await controller.update(id('1'), dto);
    expect(service.updateBanner).toHaveBeenCalledWith(id('1'), dto);
  });

  it('toggle delegates to service', async () => {
    await controller.toggle(id('1'));
    expect(service.toggleBanner).toHaveBeenCalledWith(id('1'));
  });

  it('remove delegates to service', async () => {
    await controller.remove(id('1'));
    expect(service.deleteBanner).toHaveBeenCalledWith(id('1'));
  });
});
