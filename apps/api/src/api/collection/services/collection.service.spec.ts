import { AutoIncrementID } from '../../../common/types/common.type';
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken, getRepositoryToken } from '@nestjs/typeorm';
import { PostEntity } from '../../post/entities/post.entity';
import { UserEntity } from '../../user/entities/user.entity';
import { CollectionItemEntity } from '../entities/collection-item.entity';
import { CollectionEntity } from '../entities/collection.entity';
import { CollectionService } from './collection.service';

const id = (val: string) => val as unknown as AutoIncrementID;

describe('CollectionService', () => {
  let service: CollectionService;
  let collectionRepo: any;
  let itemRepo: any;
  let postRepo: any;
  let userRepo: any;
  let dataSource: any;

  beforeEach(async () => {
    collectionRepo = {
      createQueryBuilder: jest.fn(),
      findOne: jest.fn(),
      count: jest.fn().mockResolvedValue(0),
      create: jest.fn().mockImplementation((dto) => ({
        ...dto,
        id: id('1'),
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
      save: jest.fn().mockImplementation(async (item) => ({
        ...item,
        id: id('1'),
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
      softDelete: jest.fn().mockResolvedValue({ affected: 1 }),
      increment: jest.fn().mockResolvedValue(undefined),
      decrement: jest.fn().mockResolvedValue(undefined),
    };

    itemRepo = {
      createQueryBuilder: jest.fn(),
      find: jest.fn().mockResolvedValue([]),
      findOne: jest.fn(),
      create: jest.fn().mockImplementation((dto) => ({
        ...dto,
        id: id('10'),
        createdAt: new Date(),
      })),
      save: jest.fn().mockImplementation(async (item) => ({
        ...item,
        id: id('10'),
        createdAt: new Date(),
      })),
      delete: jest.fn().mockResolvedValue({ affected: 1 }),
    };

    postRepo = {
      findOne: jest.fn(),
    };

    userRepo = {
      findOne: jest
        .fn()
        .mockResolvedValue({ id: id('100'), collectionsCount: 1 }),
      increment: jest.fn().mockResolvedValue(undefined),
      decrement: jest.fn().mockResolvedValue(undefined),
    };

    dataSource = {
      transaction: jest.fn().mockImplementation(async (cb) => {
        const em = {
          create: jest
            .fn()
            .mockImplementation((_, dto) => ({ ...dto, id: id('10') })),
          save: jest
            .fn()
            .mockImplementation(async (_, item) => ({ ...item, id: id('10') })),
          delete: jest.fn().mockResolvedValue({}),
          softDelete: jest.fn().mockResolvedValue({}),
          findOne: jest
            .fn()
            .mockResolvedValue({ id: id('1'), collectionsCount: 1 }),
          increment: jest.fn().mockResolvedValue({}),
          decrement: jest.fn().mockResolvedValue({}),
        };
        return cb(em);
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CollectionService,
        { provide: getDataSourceToken(), useValue: dataSource },
        {
          provide: getRepositoryToken(CollectionEntity),
          useValue: collectionRepo,
        },
        {
          provide: getRepositoryToken(CollectionItemEntity),
          useValue: itemRepo,
        },
        { provide: getRepositoryToken(PostEntity), useValue: postRepo },
        { provide: getRepositoryToken(UserEntity), useValue: userRepo },
      ],
    }).compile();

    service = module.get<CollectionService>(CollectionService);
  });

  describe('createCollection', () => {
    it('creates collection and returns dto', async () => {
      const res = await service.createCollection(id('100'), {
        title: 'My Favorites',
        description: 'Best posts',
      });

      expect(res.title).toBe('My Favorites');
      expect(res.slug).toBe('my-favorites');
      expect(dataSource.transaction).toHaveBeenCalled();
    });
  });

  describe('deleteCollection', () => {
    it('deletes collection within transaction', async () => {
      collectionRepo.findOne.mockResolvedValue({
        id: id('1'),
        userId: id('100'),
      });
      await service.deleteCollection(id('100'), id('1'));
      expect(dataSource.transaction).toHaveBeenCalled();
    });
  });

  describe('getCollectionDetail', () => {
    it('returns detail if public or owned', async () => {
      collectionRepo.findOne.mockResolvedValue({
        id: id('1'),
        userId: id('100'),
        title: 'Public Col',
        slug: 'public-col',
        isPublic: true,
        itemsCount: 0,
        previewThumbnails: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const res = await service.getCollectionDetail(id('100'), '1');
      expect(res.title).toBe('Public Col');
    });

    it('throws ForbiddenException if private and not owner', async () => {
      collectionRepo.findOne.mockResolvedValue({
        id: id('1'),
        userId: id('999'),
        title: 'Private Col',
        slug: 'private-col',
        isPublic: false,
      });

      await expect(service.getCollectionDetail(id('100'), '1')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('getMyCollections', () => {
    it('loads only the first four non-empty cover previews per collection', async () => {
      const collection = {
        id: id('1'),
        userId: id('100'),
        title: 'Favorites',
        slug: 'favorites',
        itemsCount: 6,
      };
      const baseQueryBuilder = {
        alias: 'col',
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[collection], 1]),
      };
      collectionRepo.createQueryBuilder.mockReturnValue(baseQueryBuilder);

      const rankedBuilder = {
        innerJoin: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getQuery: jest.fn().mockReturnValue('SELECT ranked preview rows'),
        getParameters: jest.fn().mockReturnValue({ colIds: [id('1')] }),
      };
      const previewRows = [1, 2, 3, 4].map((n) => ({
        collectionId: id('1'),
        coverImageUrl: `cover-${n}`,
      }));
      const previewsBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        setParameters: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue(previewRows),
      };
      itemRepo.createQueryBuilder
        .mockReturnValueOnce(rankedBuilder)
        .mockReturnValueOnce(previewsBuilder);

      const result = await service.getMyCollections(id('100'), {});

      expect(result.data[0]?.previewThumbnails).toEqual([
        'cover-1',
        'cover-2',
        'cover-3',
        'cover-4',
      ]);
      expect(rankedBuilder.andWhere).toHaveBeenNthCalledWith(
        1,
        'post.coverImageUrl IS NOT NULL',
      );
      expect(rankedBuilder.andWhere).toHaveBeenNthCalledWith(
        2,
        "post.coverImageUrl <> ''",
      );
      expect(previewsBuilder.where).toHaveBeenCalledWith(
        'preview.row_number <= 4',
      );
    });
  });

  describe('addItem', () => {
    it('adds post to collection and increments count', async () => {
      collectionRepo.findOne.mockResolvedValue({
        id: id('1'),
        userId: id('100'),
        itemsCount: 0,
      });
      itemRepo.findOne.mockResolvedValue(null);
      postRepo.findOne.mockResolvedValue({
        id: id('50'),
        title: 'Post Title',
        slug: 'post-title',
      });

      const res = await service.addItem(id('100'), id('1'), {
        postId: id('50'),
      });
      expect(res.postId).toBe(id('50'));
      expect(dataSource.transaction).toHaveBeenCalled();
    });

    it('throws ConflictException if already added', async () => {
      collectionRepo.findOne.mockResolvedValue({
        id: id('1'),
        userId: id('100'),
      });
      itemRepo.findOne.mockResolvedValue({ id: id('99') });

      await expect(
        service.addItem(id('100'), id('1'), { postId: id('50') }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('removeItem', () => {
    it('removes item and decrements count', async () => {
      collectionRepo.findOne.mockResolvedValue({
        id: id('1'),
        userId: id('100'),
      });
      itemRepo.findOne.mockResolvedValue({ id: id('10') });

      await service.removeItem(id('100'), id('1'), id('10'));
      expect(dataSource.transaction).toHaveBeenCalled();
    });
  });
});
