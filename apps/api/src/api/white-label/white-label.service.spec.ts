import { AutoIncrementID } from '../../common/types/common.type';
import { EWhiteLabelTarget } from '../../common/constants/entity.enum';
import { FilesystemService } from '../../filesystem/filesystem.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateWhiteLabelReqDto } from './dto/create-white-label.req.dto';
import { REQUIRED_WHITE_LABEL_STYLE_KEYS } from './dto/white-label-style.dto';
import { WhiteLabelEntity } from './entities/white-label.entity';
import { WhiteLabelService } from './white-label.service';

describe('WhiteLabelService', () => {
  let service: WhiteLabelService;
  let whiteLabelRepositoryValue: Record<string, jest.Mock>;
  let filesystemServiceMock: {
    put: jest.Mock;
    delete: jest.Mock;
    url?: jest.Mock;
    disk?: jest.Mock;
  };
  let dataSourceMock: {
    createQueryRunner: jest.Mock;
  };
  let cacheManagerMock: {
    get: jest.Mock;
    set: jest.Mock;
    del: jest.Mock;
  };

  const sampleStyles = {
    light: { primary: 'oklch(0.5 0.2 240)' },
    dark: { primary: 'oklch(0.6 0.2 240)' },
  };

  beforeAll(async () => {
    whiteLabelRepositoryValue = {
      findOne: jest.fn(),
      findOneBy: jest.fn(),
      findOneOrFail: jest.fn(),
      save: jest.fn(),
      softRemove: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    const diskMock = {
      put: jest.fn(),
      delete: jest.fn(),
      url: jest.fn(),
    };
    filesystemServiceMock = {
      ...diskMock,
      disk: jest.fn().mockReturnValue(diskMock),
    };

    dataSourceMock = {
      createQueryRunner: jest.fn(),
    };

    cacheManagerMock = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WhiteLabelService,
        {
          provide: getRepositoryToken(WhiteLabelEntity),
          useValue: whiteLabelRepositoryValue,
        },
        {
          provide: FilesystemService,
          useValue: filesystemServiceMock,
        },
        {
          provide: DataSource,
          useValue: dataSourceMock,
        },
        {
          provide: CACHE_MANAGER,
          useValue: cacheManagerMock,
        },
      ],
    }).compile();

    service = module.get<WhiteLabelService>(WhiteLabelService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getActiveWhiteLabel', () => {
    it('returns cached active white label when present in cache', async () => {
      const cachedData = {
        id: '1',
        name: 'Cached Blue',
        slug: 'cached-blue',
        target: EWhiteLabelTarget.ADMIN,
      };
      cacheManagerMock.get.mockResolvedValue(cachedData);

      const result = await service.getActiveWhiteLabel(EWhiteLabelTarget.ADMIN);

      expect(cacheManagerMock.get).toHaveBeenCalledWith(
        'white-label:active:admin',
      );
      expect(whiteLabelRepositoryValue.findOne).not.toHaveBeenCalled();
      expect(result).toEqual(cachedData);
    });

    it('returns active white label and caches it when cache miss', async () => {
      const activeRecord = new WhiteLabelEntity({
        id: '1' as AutoIncrementID,
        name: 'Default Blue',
        slug: 'default-blue',
        target: EWhiteLabelTarget.ADMIN,
        isActive: true,
        styles: sampleStyles as any,
      });

      cacheManagerMock.get.mockResolvedValue(null);
      whiteLabelRepositoryValue.findOne.mockResolvedValue(activeRecord);

      const result = await service.getActiveWhiteLabel(EWhiteLabelTarget.ADMIN);

      expect(cacheManagerMock.get).toHaveBeenCalledWith(
        'white-label:active:admin',
      );
      expect(whiteLabelRepositoryValue.findOne).toHaveBeenCalledWith({
        where: {
          target: EWhiteLabelTarget.ADMIN,
          isActive: true,
        },
      });
      expect(cacheManagerMock.set).toHaveBeenCalledWith(
        'white-label:active:admin',
        expect.objectContaining({
          id: '1',
          slug: 'default-blue',
          target: EWhiteLabelTarget.ADMIN,
        }),
        86400000,
      );
      expect(result).toEqual(
        expect.objectContaining({
          id: '1',
          slug: 'default-blue',
          target: EWhiteLabelTarget.ADMIN,
        }),
      );
    });

    it('returns null when no active white label exists', async () => {
      cacheManagerMock.get.mockResolvedValue(null);
      whiteLabelRepositoryValue.findOne.mockResolvedValue(null);

      const result = await service.getActiveWhiteLabel(EWhiteLabelTarget.ADMIN);

      expect(result).toBeNull();
    });
  });

  describe('findOne', () => {
    it('returns the found white label entity dto', async () => {
      const item = new WhiteLabelEntity({
        id: '1' as AutoIncrementID,
        name: 'Default Blue',
        slug: 'default-blue',
        target: EWhiteLabelTarget.ADMIN,
        isActive: true,
        styles: sampleStyles as any,
      });

      whiteLabelRepositoryValue.findOneOrFail.mockResolvedValue(item);

      const result = await service.findOne('1' as AutoIncrementID);

      expect(whiteLabelRepositoryValue.findOneOrFail).toHaveBeenCalledWith({
        where: { id: '1' as AutoIncrementID },
      });
      expect(result.id).toBe('1');
    });
  });

  describe('remove', () => {
    it('soft removes the white label entity and invalidates cache', async () => {
      const item = new WhiteLabelEntity({
        id: '1' as AutoIncrementID,
        name: 'To Delete',
        slug: 'to-delete',
        target: EWhiteLabelTarget.ADMIN,
        isActive: false,
        styles: sampleStyles as any,
      });

      whiteLabelRepositoryValue.findOneOrFail.mockResolvedValue(item);
      whiteLabelRepositoryValue.softRemove.mockResolvedValue(item);

      await service.remove('1' as AutoIncrementID);

      expect(whiteLabelRepositoryValue.softRemove).toHaveBeenCalledWith(item);
      expect(cacheManagerMock.del).toHaveBeenCalledWith(
        'white-label:active:admin',
      );
      expect(cacheManagerMock.del).toHaveBeenCalledWith(
        'white-label:active:client',
      );
    });
  });

  describe('CreateWhiteLabelReqDto with ValidationPipe', () => {
    it('preserves and parses stringified styles when whitelist and transform are enabled', async () => {
      const pipe = new ValidationPipe({
        whitelist: true,
        transform: true,
      });

      const fullModeStyles = Object.fromEntries(
        REQUIRED_WHITE_LABEL_STYLE_KEYS.map((key) => [
          key,
          'oklch(0.5 0.2 240)',
        ]),
      );
      const rawPayload = {
        name: 'asd',
        target: 'admin',
        isActive: 'false',
        styles: JSON.stringify({
          light: { ...fullModeStyles, spacing: '0.25rem' },
          dark: { ...fullModeStyles, spacing: '0.25rem' },
        }),
        remove_site_logo: 'false',
      };

      const transformed = (await pipe.transform(rawPayload, {
        type: 'body',
        metatype: CreateWhiteLabelReqDto,
      })) as CreateWhiteLabelReqDto;

      expect(transformed.styles).toBeDefined();
      expect(transformed.styles.light.primary).toBe('oklch(0.5 0.2 240)');
      expect(transformed.isActive).toBe(false);
    });
  });
});
