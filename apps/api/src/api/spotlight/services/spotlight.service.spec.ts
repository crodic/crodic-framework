import { AutoIncrementID } from '../../../common/types/common.type';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SpotlightBannerEntity } from '../entities/spotlight-banner.entity';
import { SpotlightService } from './spotlight.service';

const id = (val: string) => val as unknown as AutoIncrementID;

describe('SpotlightService', () => {
  let service: SpotlightService;
  let bannerRepo: any;

  beforeEach(async () => {
    bannerRepo = {
      find: jest.fn().mockResolvedValue([
        {
          id: id('1'),
          name: 'KIRIKO',
          isVerified: true,
          badge: 'TOP 1',
          tagline: 'Professional cosplayer',
          bannerImageUrl: 'https://img.jpg',
          portfolioHref: '/cosplayer/kiriko',
          bookingHref: '/booking',
          sortOrder: 1,
          cosplayerUserId: id('100'),
          isActive: true,
          createdAt: new Date(),
        },
      ]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SpotlightService,
        {
          provide: getRepositoryToken(SpotlightBannerEntity),
          useValue: bannerRepo,
        },
      ],
    }).compile();

    service = module.get<SpotlightService>(SpotlightService);
  });

  it('getActiveBanners returns mapped banners sorted', async () => {
    const banners = await service.getActiveBanners();
    expect(banners.length).toBe(1);
    expect(banners[0].name).toBe('KIRIKO');
    expect(banners[0].badge).toBe('TOP 1');
    expect(bannerRepo.find).toHaveBeenCalledWith({
      where: { isActive: true },
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
    });
  });
});
