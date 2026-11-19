import { AutoIncrementID } from '../../../common/types/common.type';
import { UserAuthGuard } from '../../../guards/user-auth.guard';
import { Test, TestingModule } from '@nestjs/testing';
import { PostPublicController } from './post-public.controller';
import { PostService } from '../services/post.service';

const id = (val: string) => val as unknown as AutoIncrementID;

describe('PostPublicController', () => {
  let controller: PostPublicController;
  let service: Partial<Record<keyof PostService, jest.Mock>>;

  beforeEach(async () => {
    service = {
      findAll: jest.fn().mockResolvedValue({ data: [], meta: {} }),
      findBySlug: jest
        .fn()
        .mockResolvedValue({ id: id('1'), slug: 'acheron', title: 'Acheron' }),
      findComments: jest.fn().mockResolvedValue({ data: [], meta: {} }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostPublicController],
      providers: [{ provide: PostService, useValue: service }],
    })
      .overrideGuard(UserAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<PostPublicController>(PostPublicController);
  });

  it('findAll delegates to service', async () => {
    await controller.findAll({}, id('100'));
    expect(service.findAll).toHaveBeenCalledWith({}, id('100'));
  });

  it('findBySlug delegates to service', async () => {
    const res = await controller.findBySlug('acheron', id('100'));
    expect(res.slug).toBe('acheron');
    expect(service.findBySlug).toHaveBeenCalledWith('acheron', id('100'));
  });

  it('findComments delegates to service', async () => {
    await controller.findComments(id('1'), {}, id('100'));
    expect(service.findComments).toHaveBeenCalledWith(id('1'), {}, id('100'));
  });
});
