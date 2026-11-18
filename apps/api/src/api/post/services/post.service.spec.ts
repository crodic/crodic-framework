import { AutoIncrementID } from '../../../common/types/common.type';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CosplayerProfileEntity } from '../../cosplayer/entities/cosplayer-profile.entity';
import { UserEntity } from '../../user/entities/user.entity';
import {
  EAlbumCategory,
  EMediaType,
  EPostStatus,
  EPostType,
} from '../constants/post.constant';
import { PostCommentLikeEntity } from '../entities/post-comment-like.entity';
import { PostCommentEntity } from '../entities/post-comment.entity';
import { PostLikeEntity } from '../entities/post-like.entity';
import { PostMediaEntity } from '../entities/post-media.entity';
import { PostEntity } from '../entities/post.entity';
import { PostService } from './post.service';

const id = (val: string) => val as unknown as AutoIncrementID;

describe('PostService', () => {
  let service: PostService;
  let postRepo: any;
  let mediaRepo: any;
  let likeRepo: any;
  let commentRepo: any;
  let commentLikeRepo: any;
  let userRepo: any;
  let profileRepo: any;
  let dataSource: any;

  beforeEach(async () => {
    postRepo = {
      createQueryBuilder: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn().mockImplementation((dto) => ({ ...dto, id: id('1') })),
      save: jest.fn().mockImplementation(async (item) => ({
        ...item,
        id: item.id || id('1'),
        updatedAt: new Date(),
      })),
      update: jest.fn().mockResolvedValue({ affected: 1 }),
      softDelete: jest.fn().mockResolvedValue({ affected: 1 }),
      increment: jest.fn().mockResolvedValue(undefined),
      decrement: jest.fn().mockResolvedValue(undefined),
      count: jest.fn().mockResolvedValue(0),
    };

    mediaRepo = {
      find: jest.fn().mockResolvedValue([]),
      create: jest.fn().mockImplementation((dto) => ({ ...dto, id: id('10') })),
      save: jest
        .fn()
        .mockImplementation(async (items) =>
          Array.isArray(items) ? items : [items],
        ),
      delete: jest.fn().mockResolvedValue({ affected: 1 }),
    };

    likeRepo = {
      find: jest.fn().mockResolvedValue([]),
      findOne: jest.fn(),
      create: jest.fn().mockImplementation((dto) => ({ ...dto, id: id('30') })),
      save: jest.fn().mockResolvedValue({ id: id('30') }),
      delete: jest.fn().mockResolvedValue({ affected: 1 }),
    };

    commentRepo = {
      createQueryBuilder: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn().mockImplementation((dto) => ({
        ...dto,
        id: id('40'),
        createdAt: new Date(),
      })),
      save: jest.fn().mockImplementation(async (item) => ({
        ...item,
        id: item.id || id('40'),
        createdAt: new Date(),
      })),
      delete: jest.fn().mockResolvedValue({ affected: 1 }),
    };

    commentLikeRepo = {
      find: jest.fn().mockResolvedValue([]),
    };

    userRepo = {
      findOne: jest
        .fn()
        .mockResolvedValue({ id: id('100'), fullName: 'Test User' }),
    };

    profileRepo = {
      findOne: jest.fn().mockResolvedValue({
        id: id('1'),
        userId: id('100'),
        slug: 'kiriko',
        displayName: 'KIRIKO',
        albumsCount: 5,
      }),
      find: jest.fn().mockResolvedValue([]),
      increment: jest.fn().mockResolvedValue(undefined),
      decrement: jest.fn().mockResolvedValue(undefined),
    };

    dataSource = {
      transaction: jest.fn().mockImplementation(async (cb) => {
        const em = {
          findOne: jest.fn(),
          findOneOrFail: jest
            .fn()
            .mockResolvedValue({ id: id('1'), likesCount: 1 }),
          create: jest.fn().mockImplementation((_, dto) => dto),
          save: jest
            .fn()
            .mockImplementation(async (_, item) =>
              Array.isArray(item) ? item : { ...item, id: id('1') },
            ),
          delete: jest.fn().mockResolvedValue({}),
          softDelete: jest.fn().mockResolvedValue({ affected: 1 }),
          increment: jest.fn().mockResolvedValue({}),
          decrement: jest.fn().mockResolvedValue({}),
        };
        return cb(em);
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostService,
        { provide: DataSource, useValue: dataSource },
        { provide: getRepositoryToken(PostEntity), useValue: postRepo },
        { provide: getRepositoryToken(PostMediaEntity), useValue: mediaRepo },
        { provide: getRepositoryToken(PostLikeEntity), useValue: likeRepo },
        {
          provide: getRepositoryToken(PostCommentEntity),
          useValue: commentRepo,
        },
        {
          provide: getRepositoryToken(PostCommentLikeEntity),
          useValue: commentLikeRepo,
        },
        { provide: getRepositoryToken(UserEntity), useValue: userRepo },
        {
          provide: getRepositoryToken(CosplayerProfileEntity),
          useValue: profileRepo,
        },
      ],
    }).compile();

    service = module.get<PostService>(PostService);
  });

  describe('findBySlug', () => {
    it('returns post detail with media', async () => {
      postRepo.findOne.mockResolvedValue({
        id: id('1'),
        slug: 'acheron',
        authorId: id('100'),
        title: 'Acheron',
        postType: EPostType.PHOTOSET,
        albumCategory: EAlbumCategory.SERIES,
        coverImageUrl: 'url',
        photosCount: 1,
        publishedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mediaRepo.find.mockResolvedValue([
        {
          id: id('10'),
          postId: id('1'),
          url: 'url',
          mediaType: EMediaType.IMAGE,
          sortOrder: 0,
          isCover: true,
        },
      ]);

      const res = await service.findBySlug('acheron');

      expect(res.slug).toBe('acheron');
      expect(res.media).toHaveLength(1);
    });

    it('throws NotFoundException when slug does not exist', async () => {
      postRepo.findOne.mockResolvedValue(null);

      await expect(service.findBySlug('unknown')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('creates post and media, increments author albumsCount', async () => {
      const res = await service.create(id('100'), {
        title: 'New Photoset',
        coverImageUrl: 'url',
        media: [{ mediaUrl: 'url1', mediaType: EMediaType.IMAGE }],
      });

      expect(dataSource.transaction).toHaveBeenCalled();
      expect(res.title).toBe('New Photoset');
    });
  });

  describe('delete', () => {
    it('throws ForbiddenException if not post author', async () => {
      postRepo.findOne.mockResolvedValue({ id: id('1'), authorId: id('999') });

      await expect(service.delete(id('100'), id('1'))).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('soft deletes post and decrements albumsCount in transaction', async () => {
      postRepo.findOne.mockResolvedValue({ id: id('1'), authorId: id('100') });

      await service.delete(id('100'), id('1'));

      expect(dataSource.transaction).toHaveBeenCalled();
    });
  });

  describe('toggleLike', () => {
    it('delegates to transaction and returns like state', async () => {
      postRepo.findOne.mockResolvedValue({ id: id('1'), authorId: id('100') });

      const res = await service.toggleLike(id('100'), id('1'));

      expect(dataSource.transaction).toHaveBeenCalled();
      expect(res).toBeDefined();
    });
  });

  describe('comments', () => {
    it('adds a comment and increments post commentsCount', async () => {
      postRepo.findOne.mockResolvedValue({ id: id('1') });

      const res = await service.addComment(id('100'), id('1'), {
        content: 'Tuyệt vời!',
      });

      expect(commentRepo.save).toHaveBeenCalled();
      expect(postRepo.increment).toHaveBeenCalledWith(
        { id: id('1') },
        'commentsCount',
        1,
      );
      expect(res.content).toBe('Tuyệt vời!');
    });
  });
});
