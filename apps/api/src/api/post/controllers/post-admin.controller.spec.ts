import { AutoIncrementID } from '../../../common/types/common.type';
import { AdminAuthGuard } from '../../../guards/admin-auth.guard';
import { PoliciesGuard } from '../../../guards/policies.guard';
import { Test, TestingModule } from '@nestjs/testing';
import { EPostStatus } from '../constants/post.constant';
import { PostAdminController } from './post-admin.controller';
import { PostService } from '../services/post.service';

const id = (val: string) => val as unknown as AutoIncrementID;

describe('PostAdminController', () => {
  let controller: PostAdminController;
  let service: Partial<Record<keyof PostService, jest.Mock>>;

  beforeEach(async () => {
    service = {
      findAllAdmin: jest.fn().mockResolvedValue({ data: [], meta: {} }),
      findOneAdmin: jest
        .fn()
        .mockResolvedValue({ id: id('1'), title: 'Cosplay Photoset' }),
      toggleFeatureAdmin: jest
        .fn()
        .mockResolvedValue({ id: id('1'), isFeaturedWork: true }),
      updateStatusAdmin: jest
        .fn()
        .mockResolvedValue({ id: id('1'), status: EPostStatus.PUBLISHED }),
      deleteAdmin: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostAdminController],
      providers: [{ provide: PostService, useValue: service }],
    })
      .overrideGuard(AdminAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(PoliciesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<PostAdminController>(PostAdminController);
  });

  it('findAll delegates to service.findAllAdmin', async () => {
    const query: any = {};
    await controller.findAll(query);
    expect(service.findAllAdmin).toHaveBeenCalledWith(query);
  });

  it('findOne delegates to service.findOneAdmin', async () => {
    await controller.findOne(id('1'));
    expect(service.findOneAdmin).toHaveBeenCalledWith(id('1'));
  });

  it('toggleFeature delegates to service.toggleFeatureAdmin', async () => {
    await controller.toggleFeature(id('1'), { isFeatured: true });
    expect(service.toggleFeatureAdmin).toHaveBeenCalledWith(id('1'), true);
  });

  it('updateStatus delegates to service.updateStatusAdmin', async () => {
    await controller.updateStatus(id('1'), {
      status: EPostStatus.HIDDEN,
      isPublic: false,
      reason: 'Vi phạm tiêu chuẩn cosplay',
    });
    expect(service.updateStatusAdmin).toHaveBeenCalledWith(
      id('1'),
      EPostStatus.HIDDEN,
      false,
      'Vi phạm tiêu chuẩn cosplay',
    );
  });

  it('delete delegates to service.deleteAdmin', async () => {
    await controller.delete(id('1'));
    expect(service.deleteAdmin).toHaveBeenCalledWith(id('1'));
  });
});
