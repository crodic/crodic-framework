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
import { EntityTagEntity } from '../../tag/entities/entity-tag.entity';
import { ETaggableEntityType } from '../../tag/constants/tag.constant';
import { EntityTaggingService } from '../../tag/services/entity-tagging.service';
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
  let entityTagRepo: any;
  let entityTaggingService: any;
  let dataSource: any;
  let mockEm: any;

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

    entityTagRepo = {
      find: jest.fn().mockResolvedValue([]),
    };
    entityTaggingService = {
      syncAuthorTagsInTransaction: jest.fn().mockResolvedValue(undefined),
      invalidateCache: jest.fn().mockResolvedValue(undefined),
    };

    mockEm = {
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
      find: jest.fn().mockResolvedValue([]),
      query: jest.fn().mockResolvedValue([]),
    };

    dataSource = {
      transaction: jest.fn().mockImplementation(async (cb) => cb(mockEm)),
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
        {
          provide: getRepositoryToken(EntityTagEntity),
          useValue: entityTagRepo,
        },
        { provide: EntityTaggingService, useValue: entityTaggingService },
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

    it('falls back to numeric id when slug lookup returns null', async () => {
      postRepo.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce({
        id: id('42'),
        slug: 'bronya-a1b2c3',
        authorId: id('100'),
        title: 'Bronya',
        postType: EPostType.PHOTOSET,
        albumCategory: EAlbumCategory.SERIES,
        coverImageUrl: 'url',
        photosCount: 1,
        publishedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mediaRepo.find.mockResolvedValue([]);

      const res = await service.findBySlug('42');

      expect(res.id).toBe(id('42'));
      expect(postRepo.findOne).toHaveBeenNthCalledWith(2, {
        where: { id: '42' },
        relations: ['author'],
      });
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
      expect(res.slug).toMatch(/^new-photoset-[a-z0-9]{6}$/);
    });

    it('retries slug generation on collision and falls back for non-Latin titles', async () => {
      postRepo.count.mockResolvedValueOnce(1).mockResolvedValueOnce(0);

      const res = await service.create(id('100'), {
        title: '葬送のフリーレン',
        characterName: 'Frieren',
        coverImageUrl: 'url',
        media: [{ mediaUrl: 'url1', mediaType: EMediaType.IMAGE }],
      });

      expect(postRepo.count).toHaveBeenCalledTimes(2);
      expect(res.slug).toMatch(/^frieren-[a-z0-9]{6}$/);
    });

    it('automatically creates or updates cosplayer character when characterName is provided', async () => {
      const res = await service.create(id('100'), {
        title: 'Acheron photoshoot',
        characterName: 'Acheron',
        fandomName: 'Honkai: Star Rail',
        coverImageUrl: 'http://cdn.test/cover.jpg',
        media: [
          { mediaUrl: 'http://cdn.test/1.jpg', mediaType: EMediaType.IMAGE },
          { mediaUrl: 'http://cdn.test/2.jpg', mediaType: EMediaType.IMAGE },
        ],
      });

      expect(dataSource.transaction).toHaveBeenCalled();
      expect(res.characterName).toBe('Acheron');
    });

    it('rolls back post creation when author tag synchronization fails', async () => {
      const error = new Error('Tag synchronization failed');
      entityTaggingService.syncAuthorTagsInTransaction.mockRejectedValue(error);

      await expect(
        service.create(id('100'), {
          title: 'Tagged Post',
          coverImageUrl: 'url',
          tags: ['cosplay'],
        }),
      ).rejects.toBe(error);

      expect(
        entityTaggingService.syncAuthorTagsInTransaction,
      ).toHaveBeenCalledWith(
        mockEm,
        ETaggableEntityType.POST,
        id('1'),
        { tagNames: ['cosplay'], ownerUserId: id('100') },
        { userId: id('100') },
      );
      expect(entityTaggingService.invalidateCache).not.toHaveBeenCalled();
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

      expect(dataSource.transaction).toHaveBeenCalled();
      expect(mockEm.save).toHaveBeenCalled();
      expect(mockEm.increment).toHaveBeenCalledWith(
        PostEntity,
        { id: id('1') },
        'commentsCount',
        1,
      );
      expect(res.content).toBe('Tuyệt vời!');
    });

    it('resolves slug to numeric postId in findComments before querying comments', async () => {
      postRepo.findOne.mockResolvedValue({
        id: id('77'),
        slug: 'bronya-x9y8z7',
      });
      const qb = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
        clone: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(0),
        getMany: jest.fn().mockResolvedValue([]),
      };
      commentRepo.createQueryBuilder.mockReturnValue(qb);

      const res = await service.findComments(id('bronya-x9y8z7'), {});

      expect(postRepo.findOne).toHaveBeenCalledWith({
        where: { slug: 'bronya-x9y8z7' },
      });
      expect(qb.where).toHaveBeenCalledWith('comment.postId = :postId', {
        postId: id('77'),
      });
      expect(res.data).toEqual([]);
    });
  });

  describe('updateStatusAdmin & Moderation Notifications', () => {
    it('notifies author when post is approved to PUBLISHED', async () => {
      const mockPost = {
        id: id('10'),
        authorId: id('200'),
        title: 'Cosplay Raiden Shogun',
        status: EPostStatus.HIDDEN,
        slug: 'raiden-shogun',
      };
      postRepo.findOne.mockResolvedValue({ ...mockPost });

      const notifRepoMock = {
        create: jest.fn().mockImplementation((d) => d),
        save: jest.fn().mockImplementation(async (d) => d),
      };
      (service as any).notificationRepo = notifRepoMock;

      jest.spyOn(service, 'findOneAdmin').mockResolvedValue({
        id: id('10'),
        status: EPostStatus.PUBLISHED,
      } as any);

      await service.updateStatusAdmin(id('10'), EPostStatus.PUBLISHED, true);

      expect(notifRepoMock.create).toHaveBeenCalledWith(
        expect.objectContaining({
          recipientUserId: id('200'),
          title: expect.stringContaining('phê duyệt'),
        }),
      );
      expect(notifRepoMock.save).toHaveBeenCalled();
    });

    it('notifies author with rejection reason when post is set to HIDDEN', async () => {
      const mockPost = {
        id: id('11'),
        authorId: id('201'),
        title: 'Casual Outfit',
        status: EPostStatus.HIDDEN,
      };
      postRepo.findOne.mockResolvedValue({ ...mockPost });

      const notifRepoMock = {
        create: jest.fn().mockImplementation((d) => d),
        save: jest.fn().mockImplementation(async (d) => d),
      };
      (service as any).notificationRepo = notifRepoMock;

      jest.spyOn(service, 'findOneAdmin').mockResolvedValue({
        id: id('11'),
        status: EPostStatus.HIDDEN,
      } as any);

      await service.updateStatusAdmin(
        id('11'),
        EPostStatus.ARCHIVED,
        false,
        'Ảnh không phải nhân vật cosplay',
      );

      expect(notifRepoMock.create).toHaveBeenCalledWith(
        expect.objectContaining({
          recipientUserId: id('201'),
          description: expect.stringContaining(
            'Ảnh không phải nhân vật cosplay',
          ),
        }),
      );
      expect(notifRepoMock.save).toHaveBeenCalled();
    });
  });

  describe('sendDailyPendingPostsDigest', () => {
    it('skips sending email when pending posts count is 10 or less', async () => {
      postRepo.count.mockResolvedValue(8);
      const emailQueueMock = { sendMail: jest.fn() };
      (service as any).emailQueueService = emailQueueMock;

      const res = await service.sendDailyPendingPostsDigest();

      expect(res).toContain('chưa vượt ngưỡng > 10');
      expect(emailQueueMock.sendMail).not.toHaveBeenCalled();
    });

    it('sends 1 consolidated email (to + cc) when pending posts count > 10', async () => {
      postRepo.count.mockResolvedValue(15);
      const adminRepoMock = {
        find: jest.fn().mockResolvedValue([
          { email: 'admin1@kosume.com', notifications: { email: true } },
          { email: 'admin2@kosume.com', notifications: { email: true } },
          { email: 'admin3@kosume.com', notifications: { email: false } }, // opt-out
        ]),
      };
      const emailQueueMock = { sendMail: jest.fn().mockResolvedValue({}) };
      (service as any).adminUserRepo = adminRepoMock;
      (service as any).emailQueueService = emailQueueMock;

      const res = await service.sendDailyPendingPostsDigest();

      expect(res).toContain('Đã gửi 1 email digest');
      expect(emailQueueMock.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'admin1@kosume.com',
          cc: ['admin2@kosume.com'],
          template: 'admin-pending-posts-digest',
          context: expect.objectContaining({ pendingCount: 15 }),
        }),
      );
    });
  });
});
