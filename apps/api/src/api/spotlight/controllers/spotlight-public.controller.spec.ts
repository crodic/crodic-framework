import { AutoIncrementID } from '../../../common/types/common.type';
import { Test, TestingModule } from '@nestjs/testing';
import { SpotlightPublicController } from './spotlight-public.controller';
import { SpotlightService } from '../services/spotlight.service';

const id = (val: string) => val as unknown as AutoIncrementID;

describe('SpotlightPublicController', () => {
  let controller: SpotlightPublicController;
  let service: Partial<Record<keyof SpotlightService, jest.Mock>>;

  beforeEach(async () => {
    service = {
      getActiveBanners: jest
        .fn()
        .mockResolvedValue([{ id: id('1'), name: 'KIRIKO' }]),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SpotlightPublicController],
      providers: [{ provide: SpotlightService, useValue: service }],
    }).compile();

    controller = module.get<SpotlightPublicController>(
      SpotlightPublicController,
    );
  });

  it('getSpotlightBanners delegates to service', async () => {
    const banners = await controller.getSpotlightBanners();
    expect(banners.length).toBe(1);
    expect(service.getActiveBanners).toHaveBeenCalled();
  });
});
