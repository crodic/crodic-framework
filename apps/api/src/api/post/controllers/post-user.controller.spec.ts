import { AutoIncrementID } from '../../../common/types/common.type';
import { UserAuthGuard } from '../../../guards/user-auth.guard';
import { Test, TestingModule } from '@nestjs/testing';
import { PostUserController } from './post-user.controller';
import { PostService } from '../services/post.service';

const id = (val: string) => val as unknown as AutoIncrementID;

describe('PostUserController', () => {
  let controller: PostUserController;
  let service: Partial<Record<keyof PostService, jest.Mock>>;

  beforeEach(async () => {
    service = {
      create: jest.fn().mockResolvedValue({ id: id('1'), title: 'Created' }),
      getFeed: jest
        .fn()
        .mockResolvedValue({ data: [{ id: id('1') }], meta: {} }),
      update: jest.fn().mockResolvedValue({ id: id('1'), title: 'Updated' }),
      delete: jest.fn().mockResolvedValue(undefined),
      toggleLike: jest.fn().mockResolvedValue({ liked: true, likesCount: 5 }),
      addComment: jest
        .fn()
        .mockResolvedValue({ id: id('40'), content: 'Nice!' }),
      deleteComment: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostUserController],
      providers: [{ provide: PostService, useValue: service }],
    })
      .overrideGuard(UserAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<PostUserController>(PostUserController);
  });

  it('getFeed delegates to service', async () => {
    const query = { page: 1, limit: 10 };
    const res = await controller.getFeed(id('100'), query);
    expect(res.data).toHaveLength(1);
    expect(service.getFeed).toHaveBeenCalledWith(id('100'), query);
  });

  it('create delegates to service', async () => {
    const res = await controller.create(id('100'), {
      title: 'Created',
      coverImageUrl: 'url',
      media: [],
    });
    expect(res.title).toBe('Created');
    expect(service.create).toHaveBeenCalledWith(id('100'), {
      title: 'Created',
      coverImageUrl: 'url',
      media: [],
    });
  });

  it('update delegates to service', async () => {
    const res = await controller.update(id('100'), id('1'), {
      title: 'Updated',
    });
    expect(res.title).toBe('Updated');
    expect(service.update).toHaveBeenCalledWith(id('100'), id('1'), {
      title: 'Updated',
    });
  });

  it('delete delegates to service', async () => {
    await controller.delete(id('100'), id('1'));
    expect(service.delete).toHaveBeenCalledWith(id('100'), id('1'));
  });

  it('toggleLike delegates to service', async () => {
    const res = await controller.toggleLike(id('100'), id('1'));
    expect(res.liked).toBe(true);
    expect(service.toggleLike).toHaveBeenCalledWith(id('100'), id('1'));
  });

  it('addComment delegates to service', async () => {
    const res = await controller.addComment(id('100'), id('1'), {
      content: 'Nice!',
    });
    expect(res.content).toBe('Nice!');
    expect(service.addComment).toHaveBeenCalledWith(id('100'), id('1'), {
      content: 'Nice!',
    });
  });

  it('deleteComment delegates to service', async () => {
    await controller.deleteComment(id('100'), id('40'));
    expect(service.deleteComment).toHaveBeenCalledWith(id('100'), id('40'));
  });
});
