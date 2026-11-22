import { AutoIncrementID } from '../../../common/types/common.type';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken, getRepositoryToken } from '@nestjs/typeorm';
import { UserEntity } from '../../user/entities/user.entity';
import { CosplayerCharacterEntity } from '../entities/cosplayer-character.entity';
import { CosplayerProfileEntity } from '../entities/cosplayer-profile.entity';
import { CosplayerService } from './cosplayer.service';
import { FilesystemService } from '../../../filesystem/filesystem.service';

const id = (val: string) => val as unknown as AutoIncrementID;

describe('CosplayerService', () => {
  let service: CosplayerService;
  let profileRepo: any;
  let characterRepo: any;
  let userRepo: any;
  let dataSource: any;
  let filesystemService: any;
  let diskMock: any;

  beforeEach(async () => {
    diskMock = {
      put: jest.fn().mockResolvedValue(undefined),
      url: jest.fn().mockReturnValue('http://cdn.kosume.test/photo.jpg'),
    };
    filesystemService = {
      disk: jest.fn().mockReturnValue(diskMock),
    };
    profileRepo = {
      createQueryBuilder: jest.fn(),
      findOne: jest.fn(),
      findOneOrFail: jest.fn(),
      count: jest.fn(),
      create: jest.fn().mockImplementation((dto) => ({ ...dto, id: id('1') })),
      save: jest.fn().mockImplementation(async (item) => ({
        ...item,
        id: item.id || id('1'),
        updatedAt: new Date(),
      })),
      increment: jest.fn().mockResolvedValue(undefined),
      decrement: jest.fn().mockResolvedValue(undefined),
    };

    characterRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn().mockImplementation((dto) => ({ ...dto, id: id('20') })),
      save: jest.fn().mockImplementation(async (item) => ({
        ...item,
        id: item.id || id('20'),
        updatedAt: new Date(),
      })),
      delete: jest.fn().mockResolvedValue({ affected: 1 }),
    };

    userRepo = {
      findOne: jest.fn(),
      update: jest.fn().mockResolvedValue({ affected: 1 }),
    };

    dataSource = {
      transaction: jest.fn().mockImplementation(async (cb) => {
        const em = {
          findOne: jest
            .fn()
            .mockResolvedValue({ id: id('1'), charactersCount: 1 }),
          create: jest
            .fn()
            .mockImplementation((_, dto) => ({ ...dto, id: id('20') })),
          save: jest
            .fn()
            .mockImplementation(async (_, item) => ({ ...item, id: id('20') })),
          delete: jest.fn().mockResolvedValue({}),
          increment: jest.fn().mockResolvedValue({}),
          decrement: jest.fn().mockResolvedValue({}),
        };
        return cb(em);
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CosplayerService,
        { provide: getDataSourceToken(), useValue: dataSource },
        {
          provide: getRepositoryToken(CosplayerProfileEntity),
          useValue: profileRepo,
        },
        {
          provide: getRepositoryToken(CosplayerCharacterEntity),
          useValue: characterRepo,
        },
        { provide: getRepositoryToken(UserEntity), useValue: userRepo },
        { provide: FilesystemService, useValue: filesystemService },
      ],
    }).compile();

    service = module.get<CosplayerService>(CosplayerService);
  });

  describe('findBySlugOrHandle', () => {
    it('returns detail when found by slug', async () => {
      profileRepo.findOne.mockResolvedValue({
        id: id('1'),
        userId: id('100'),
        slug: 'kiriko-cos',
        displayName: 'KIRIKO',
        roleBadge: 'Cosplayer',
        skills: ['Crafting'],
        specialties: ['Genshin Impact'],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      characterRepo.find.mockResolvedValue([
        {
          id: id('20'),
          userId: id('100'),
          characterName: 'Raiden Shogun',
          seriesName: 'Genshin Impact',
          coverImageUrl: 'url',
          albumsCount: 2,
          photosCount: 15,
          sortOrder: 0,
        },
      ]);

      const res = await service.findBySlugOrHandle('kiriko-cos');

      expect(res.slug).toBe('kiriko-cos');
      expect(res.handle).toBe('@kiriko-cos');
      expect(res.displayName).toBe('KIRIKO');
      expect(res.characters).toHaveLength(1);
    });

    it('throws NotFoundException when cosplayer not found', async () => {
      profileRepo.findOne.mockResolvedValue(null);

      await expect(service.findBySlugOrHandle('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getMyProfile', () => {
    it('creates profile on-the-fly if not found', async () => {
      profileRepo.findOne.mockResolvedValueOnce(null);
      userRepo.findOne.mockResolvedValue({
        id: id('100'),
        username: 'newcosplayer',
        firstName: 'New',
        lastName: 'Cos',
      });
      profileRepo.count.mockResolvedValue(0);
      characterRepo.find.mockResolvedValue([]);

      const res = await service.getMyProfile(id('100'));

      expect(profileRepo.create).toHaveBeenCalled();
      expect(res.handle).toBe('@newcosplayer');
    });
  });

  describe('updateProfile', () => {
    it('throws ConflictException if new handle is taken by another user', async () => {
      profileRepo.findOne
        .mockResolvedValueOnce({
          id: id('1'),
          userId: id('100'),
          slug: 'kiriko',
        })
        .mockResolvedValueOnce({
          id: id('2'),
          userId: id('999'),
          slug: 'taken',
        });

      await expect(
        service.updateProfile(id('100'), { handle: 'taken' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('Character CRUD', () => {
    it('increments profile charactersCount on adding character', async () => {
      await service.addCharacter(id('100'), {
        characterName: 'Acheron',
        seriesName: 'Honkai: Star Rail',
        coverImageUrl: 'http://img.com',
      });

      expect(dataSource.transaction).toHaveBeenCalled();
    });
  });

  describe('getSuggested', () => {
    it('returns suggested cosplayers and excludes soft-deleted records', async () => {
      const qbMock: any = {
        innerJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([
          {
            id: id('1'),
            userId: id('101'),
            slug: 'enakorin',
            displayName: 'Enako',
            roleBadge: 'Cosplayer',
            isVerified: true,
            rankingScore: 100,
            user: { id: id('101'), deletedAt: null },
          },
        ]),
      };
      profileRepo.createQueryBuilder.mockReturnValue(qbMock);

      const res = await service.getSuggested(id('100'), 4);

      expect(profileRepo.createQueryBuilder).toHaveBeenCalledWith('profile');
      expect(qbMock.innerJoinAndSelect).toHaveBeenCalledWith(
        'profile.user',
        'user',
        'user.deletedAt IS NULL',
      );
      expect(qbMock.where).toHaveBeenCalledWith('profile.deletedAt IS NULL');
      expect(qbMock.andWhere).toHaveBeenCalledWith('user.deletedAt IS NULL');
      expect(qbMock.andWhere).toHaveBeenCalledWith(
        'profile.userId != :currentUserId',
        { currentUserId: id('100') },
      );
      expect(res).toHaveLength(1);
      expect(res[0].displayName).toBe('Enako');
    });
  });

  describe('uploadMedia', () => {
    it('uploads unwatermarked image directly when watermark is false', async () => {
      const mockFile = {
        buffer: Buffer.from('raw-image-data'),
        mimetype: 'image/jpeg',
        size: 14,
        originalname: 'photo.jpg',
      } as Express.Multer.File;

      const res = await service.uploadMedia(
        id('100'),
        mockFile,
        'posts',
        false,
      );

      expect(diskMock.put).toHaveBeenCalledWith(
        expect.stringContaining('posts/user-100-'),
        mockFile.buffer,
        { mimeType: 'image/jpeg' },
      );
      expect(res.url).toBe('http://cdn.kosume.test/photo.jpg');
      expect(res.size).toBe(14);
    });

    it('processes watermark when watermark is true and image is provided', async () => {
      profileRepo.findOne.mockResolvedValue({
        id: id('1'),
        userId: id('100'),
        displayName: 'Yurisa',
      });

      const mockFile = {
        buffer: Buffer.from('image-data'),
        mimetype: 'image/jpeg',
        size: 10,
        originalname: 'photo.jpg',
      } as Express.Multer.File;

      const res = await service.uploadMedia(id('100'), mockFile, 'posts', true);

      expect(profileRepo.findOne).toHaveBeenCalledWith({
        where: { userId: id('100') },
        relations: ['user'],
      });
      expect(diskMock.put).toHaveBeenCalled();
      expect(res.url).toBe('http://cdn.kosume.test/photo.jpg');
    });
  });
});
