import { AutoIncrementID } from '../../../common/types/common.type';
import { UserAuthGuard } from '../../../guards/user-auth.guard';
import { Test, TestingModule } from '@nestjs/testing';
import { CollectionUserController } from './collection-user.controller';
import { CollectionService } from '../services/collection.service';

const id = (val: string) => val as unknown as AutoIncrementID;

describe('CollectionUserController', () => {
  let controller: CollectionUserController;
  let service: Partial<Record<keyof CollectionService, jest.Mock>>;

  beforeEach(async () => {
    service = {
      getMyCollections: jest.fn().mockResolvedValue({ data: [], meta: {} }),
      createCollection: jest
        .fn()
        .mockResolvedValue({ id: id('1'), title: 'My Col' }),
      getCollectionDetail: jest
        .fn()
        .mockResolvedValue({ id: id('1'), title: 'My Col' }),
      deleteCollection: jest.fn().mockResolvedValue(undefined),
      getItems: jest.fn().mockResolvedValue({ data: [], meta: {} }),
      addItem: jest.fn().mockResolvedValue({ id: id('10'), postId: id('5') }),
      removeItem: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CollectionUserController],
      providers: [{ provide: CollectionService, useValue: service }],
    })
      .overrideGuard(UserAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<CollectionUserController>(CollectionUserController);
  });

  it('getMyCollections delegates to service', async () => {
    const query: any = {};
    await controller.getMyCollections(id('100'), query);
    expect(service.getMyCollections).toHaveBeenCalledWith(id('100'), query);
  });

  it('create delegates to service', async () => {
    const dto: any = { title: 'My Col' };
    const res = await controller.create(id('100'), dto);
    expect(res.title).toBe('My Col');
    expect(service.createCollection).toHaveBeenCalledWith(id('100'), dto);
  });

  it('getCollectionDetail delegates to service', async () => {
    const res = await controller.getCollectionDetail(id('100'), '1');
    expect(res.title).toBe('My Col');
    expect(service.getCollectionDetail).toHaveBeenCalledWith(id('100'), '1');
  });

  it('delete delegates to service', async () => {
    await controller.delete(id('100'), id('1'));
    expect(service.deleteCollection).toHaveBeenCalledWith(id('100'), id('1'));
  });

  it('getItems delegates to service', async () => {
    const query: any = {};
    await controller.getItems(id('1'), query);
    expect(service.getItems).toHaveBeenCalledWith(id('1'), query);
  });

  it('addItem delegates to service', async () => {
    const dto: any = { postId: id('5') };
    const res = await controller.addItem(id('100'), id('1'), dto);
    expect(res.postId).toBe(id('5'));
    expect(service.addItem).toHaveBeenCalledWith(id('100'), id('1'), dto);
  });

  it('removeItem delegates to service', async () => {
    await controller.removeItem(id('100'), id('1'), id('10'));
    expect(service.removeItem).toHaveBeenCalledWith(
      id('100'),
      id('1'),
      id('10'),
    );
  });
});
