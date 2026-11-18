import { AutoIncrementID } from '../../../common/types/common.type';
import { UserAuthGuard } from '../../../guards/user-auth.guard';
import { Test, TestingModule } from '@nestjs/testing';
import { SocialUserController } from './social-user.controller';
import { SocialService } from '../services/social.service';

const id = (val: string) => val as unknown as AutoIncrementID;

describe('SocialUserController', () => {
  let controller: SocialUserController;
  let service: Partial<Record<keyof SocialService, jest.Mock>>;

  beforeEach(async () => {
    service = {
      toggleFollow: jest
        .fn()
        .mockResolvedValue({ following: true, followersCount: 10 }),
      checkIsFollowing: jest.fn().mockResolvedValue(true),
      getFollowers: jest.fn().mockResolvedValue({ data: [], meta: {} }),
      getFollowing: jest.fn().mockResolvedValue({ data: [], meta: {} }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SocialUserController],
      providers: [{ provide: SocialService, useValue: service }],
    })
      .overrideGuard(UserAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<SocialUserController>(SocialUserController);
  });

  it('toggleFollow delegates to service', async () => {
    const res = await controller.toggleFollow(id('100'), id('200'));
    expect(res.following).toBe(true);
    expect(service.toggleFollow).toHaveBeenCalledWith(id('100'), id('200'));
  });

  it('checkIsFollowing delegates to service', async () => {
    const res = await controller.checkIsFollowing(id('100'), id('200'));
    expect(res.isFollowing).toBe(true);
    expect(service.checkIsFollowing).toHaveBeenCalledWith(id('100'), id('200'));
  });

  it('getFollowers delegates to service', async () => {
    const query: any = {};
    await controller.getFollowers(id('200'), query);
    expect(service.getFollowers).toHaveBeenCalledWith(id('200'), query);
  });

  it('getFollowing delegates to service', async () => {
    const query: any = {};
    await controller.getFollowing(id('200'), query);
    expect(service.getFollowing).toHaveBeenCalledWith(id('200'), query);
  });
});
