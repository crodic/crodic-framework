import { AutoIncrementID } from '../../../common/types/common.type';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CosplayerProfileEntity } from '../../cosplayer/entities/cosplayer-profile.entity';
import { UserEntity } from '../../user/entities/user.entity';
import { SpotlightBannerEntity } from '../entities/spotlight-banner.entity';
import { SpotlightService } from './spotlight.service';

const id = (val: string) => val as unknown as AutoIncrementID;

describe('SpotlightService', () => {
  let service: SpotlightService;
  let bannerRepo: any;
  let profileRepo: any;
  let userRepo: any;

  beforeEach(async () => {
    bannerRepo = {
      find: jest.fn().mockResolvedValue([
        {
          id: id('1'),
          badge: 'TOP 1',
          tagline: 'Professional cosplayer',
          bannerImageUrl: 'https://img.jpg',
          sortOrder: 1,
          cosplayerUserId: id('100'),
          cosplayerUser: { id: id('100'), fullName: 'Kiriko User' },
          isActive: true,
          createdAt: new Date(),
        },
      ]),
    };

    profileRepo = {
      find: jest.fn().mockResolvedValue([
        {
          userId: id('100'),
          displayName: 'KIRIKO',
          slug: 'kiriko',
          isVerified: true,
        },
      ]),
      findOne: jest.fn(),
    };

    userRepo = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SpotlightService,
        {
          provide: getRepositoryToken(SpotlightBannerEntity),
          useValue: bannerRepo,
        },
        {
          provide: getRepositoryToken(CosplayerProfileEntity),
          useValue: profileRepo,
        },
        {
          provide: getRepositoryToken(UserEntity),
          useValue: userRepo,
        },
      ],
    }).compile();

    service = module.get<SpotlightService>(SpotlightService);
  });

  it('getActiveBanners returns mapped banners sorted', async () => {
    const banners = await service.getActiveBanners();
    expect(banners.length).toBe(1);
    expect(banners[0].name).toBe('KIRIKO');
    expect(banners[0].isVerified).toBe(true);
    expect(banners[0].portfolioHref).toBe('/cosplayer/kiriko');
    expect(banners[0].badge).toBe('TOP 1');
    expect(bannerRepo.find).toHaveBeenCalledWith({
      where: { isActive: true },
      relations: ['cosplayerUser'],
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
    });
  });
});
