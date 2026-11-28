import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AutoIncrementID } from '../../../common/types/common.type';
import { TagCategoryEntity } from '../entities/tag-category.entity';
import { TagEntity } from '../entities/tag.entity';
import { TagCacheService } from './tag-cache.service';
import { TagCategoryService } from './tag-category.service';
import { TagNormalizationService } from './tag-normalization.service';

describe('TagCategoryService', () => {
  const asId = (v: string) => v as AutoIncrementID;
  let service: TagCategoryService;
  let categoryRepo: any;
  let tagRepo: any;
  let cacheService: any;
  let normalizationService: TagNormalizationService;

  beforeEach(async () => {
    categoryRepo = {
      count: jest.fn(),
      create: jest.fn((dto) => ({
        ...dto,
        id: '1',
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
      save: jest.fn(async (entity) => ({
        ...entity,
        id: entity.id || '1',
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
      findOne: jest.fn(),
      find: jest.fn(),
      softDelete: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    tagRepo = {
      count: jest.fn(),
      update: jest.fn(),
    };

    cacheService = {
      getJson: jest.fn(),
      setJson: jest.fn(),
      bumpVersion: jest.fn(),
    };

    normalizationService = new TagNormalizationService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TagCategoryService,
        {
          provide: getRepositoryToken(TagCategoryEntity),
          useValue: categoryRepo,
        },
        { provide: getRepositoryToken(TagEntity), useValue: tagRepo },
        { provide: TagCacheService, useValue: cacheService },
        { provide: TagNormalizationService, useValue: normalizationService },
      ],
    }).compile();

    service = module.get<TagCategoryService>(TagCategoryService);
  });

  it('seeds default categories when database is empty', async () => {
    categoryRepo.count.mockResolvedValue(0);

    await service.seedDefaultCategories();

    expect(categoryRepo.save).toHaveBeenCalledTimes(8);
  });

  it('skips seeding when categories already exist', async () => {
    categoryRepo.count.mockResolvedValue(5);

    await service.seedDefaultCategories();

    expect(categoryRepo.save).not.toHaveBeenCalled();
  });

  it('returns cached active list when present in redis', async () => {
    const cached = [{ id: '1', slug: 'character', name: 'Character' }];
    cacheService.getJson.mockResolvedValue(cached);

    const result = await service.findActiveList();

    expect(result).toEqual(cached);
    expect(categoryRepo.find).not.toHaveBeenCalled();
  });

  it('queries database and caches result when cache is empty', async () => {
    cacheService.getJson.mockResolvedValue(null);
    categoryRepo.find.mockResolvedValue([
      {
        id: '1',
        slug: 'character',
        name: 'Character',
        color: '#3b82f6',
        icon: 'User',
        sortOrder: 2,
        isSystem: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    const result = await service.findActiveList();

    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe('character');
    expect(cacheService.setJson).toHaveBeenCalled();
  });

  it('finds category by slug', async () => {
    categoryRepo.findOne.mockResolvedValue({
      id: '2',
      slug: 'character',
      name: 'Character',
      color: '#3b82f6',
      icon: 'User',
      sortOrder: 2,
      isSystem: true,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    tagRepo.count.mockResolvedValue(15);

    const result = await service.findBySlug('character');

    expect(result.slug).toBe('character');
    expect(result.tagCount).toBe(15);
  });

  it('throws NotFoundException when slug does not exist', async () => {
    categoryRepo.findOne.mockResolvedValue(null);

    await expect(service.findBySlug('nonexistent')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('creates a new custom category with normalized slug', async () => {
    categoryRepo.findOne.mockResolvedValue(null);

    const result = await service.create({
      name: 'Props & Accessories',
      color: '#06b6d4',
      icon: 'Wand2',
    });

    expect(result.slug).toBe('props-and-accessories');
    expect(result.name).toBe('Props & Accessories');
    expect(cacheService.bumpVersion).toHaveBeenCalled();
  });

  it('throws ConflictException when creating category with duplicate slug', async () => {
    categoryRepo.findOne.mockResolvedValue({ id: '1', slug: 'props' });

    await expect(
      service.create({ name: 'Props', slug: 'props' }),
    ).rejects.toThrow(ConflictException);
  });

  it('prevents modifying slug of built-in system category', async () => {
    categoryRepo.findOne.mockResolvedValue({
      id: '1',
      slug: 'general',
      isSystem: true,
    });

    await expect(
      service.update(asId('1'), { slug: 'custom-general' }),
    ).rejects.toThrow(BadRequestException);
  });

  it('prevents deleting built-in system category', async () => {
    categoryRepo.findOne.mockResolvedValue({
      id: asId('1'),
      slug: 'character',
      isSystem: true,
    });

    await expect(service.delete(asId('1'))).rejects.toThrow(
      BadRequestException,
    );
  });

  it('soft deletes custom category and reassigns tags to general', async () => {
    categoryRepo.findOne
      .mockResolvedValueOnce({
        id: asId('10'),
        slug: 'temporary',
        isSystem: false,
      })
      .mockResolvedValueOnce({
        id: asId('1'),
        slug: 'general',
      });

    await service.delete(asId('10'));

    expect(categoryRepo.softDelete).toHaveBeenCalledWith(asId('10'));
    expect(tagRepo.update).toHaveBeenCalledWith(
      { categoryId: asId('10') },
      { categoryId: asId('1'), category: 'general' },
    );
    expect(cacheService.bumpVersion).toHaveBeenCalled();
  });
});
