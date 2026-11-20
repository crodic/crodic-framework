import {
  AllowedFilter,
  QueryBuilder,
  QueryParams,
} from '../../../common/query-builder';
import { AutoIncrementID } from '../../../common/types/common.type';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import {
  CreateTagCategoryReqDto,
  UpdateTagCategoryReqDto,
} from '../dto/tag-category-req.dto';
import { TagCategoryResDto } from '../dto/tag-category-res.dto';
import { TagCategoryEntity } from '../entities/tag-category.entity';
import { TagEntity } from '../entities/tag.entity';
import { TagCacheService } from './tag-cache.service';
import { TagNormalizationService } from './tag-normalization.service';

const ACTIVE_CATEGORIES_CACHE_KEY = 'tag_categories:active:list';

export const DEFAULT_TAG_CATEGORIES: Array<{
  slug: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  sortOrder: number;
  isSystem: boolean;
}> = [
  {
    slug: 'general',
    name: 'General',
    description: 'General concepts, themes, actions, and objects',
    color: '#64748b',
    icon: 'Tag',
    sortOrder: 1,
    isSystem: true,
  },
  {
    slug: 'character',
    name: 'Character',
    description: 'Named fictional or historical characters',
    color: '#3b82f6',
    icon: 'User',
    sortOrder: 2,
    isSystem: true,
  },
  {
    slug: 'copyright',
    name: 'Copyright / Series',
    description: 'Original franchises, games, anime, and media series',
    color: '#a855f7',
    icon: 'Sparkles',
    sortOrder: 3,
    isSystem: true,
  },
  {
    slug: 'artist',
    name: 'Artist / Creator',
    description: 'Illustrators, photographers, cosplayers, and studios',
    color: '#ec4899',
    icon: 'Palette',
    sortOrder: 4,
    isSystem: true,
  },
  {
    slug: 'meta',
    name: 'Meta / Taxonomy',
    description: 'Technical, resolution, and administrative metadata',
    color: '#eab308',
    icon: 'Info',
    sortOrder: 5,
    isSystem: true,
  },
  {
    slug: 'system',
    name: 'System Marker',
    description: 'Platform flags, safety indicators, and AI markers',
    color: '#ef4444',
    icon: 'Shield',
    sortOrder: 6,
    isSystem: true,
  },
  {
    slug: 'costume',
    name: 'Costume / Outfit',
    description: 'Outfits, wigs, props, makeup styles, and cosplay attire',
    color: '#06b6d4',
    icon: 'Shirt',
    sortOrder: 7,
    isSystem: false,
  },
  {
    slug: 'event',
    name: 'Event / Gathering',
    description: 'Conventions, expos, fan-gatherings, and festivals',
    color: '#10b981',
    icon: 'Calendar',
    sortOrder: 8,
    isSystem: false,
  },
];

@Injectable()
export class TagCategoryService implements OnModuleInit {
  private readonly logger = new Logger(TagCategoryService.name);

  constructor(
    @InjectRepository(TagCategoryEntity)
    private readonly categoryRepository: Repository<TagCategoryEntity>,
    @InjectRepository(TagEntity)
    private readonly tagRepository: Repository<TagEntity>,
    private readonly cacheService: TagCacheService,
    private readonly normalizationService: TagNormalizationService,
  ) {}

  async onModuleInit(): Promise<void> {
    try {
      await this.seedDefaultCategories();
    } catch (err) {
      this.logger.warn(
        `Failed to seed default tag categories on init: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  async seedDefaultCategories(): Promise<void> {
    const count = await this.categoryRepository.count();
    if (count > 0) return;

    this.logger.log('Seeding default tag categories into database...');
    for (const item of DEFAULT_TAG_CATEGORIES) {
      const entity = this.categoryRepository.create({
        ...item,
        isActive: true,
      });
      await this.categoryRepository.save(entity);
    }
    this.logger.log('Default tag categories successfully seeded.');
  }

  toDto(category: TagCategoryEntity, tagCount?: number): TagCategoryResDto {
    return {
      id: category.id,
      slug: category.slug,
      name: category.name,
      description: category.description ?? null,
      color: category.color,
      icon: category.icon,
      sortOrder: category.sortOrder,
      isSystem: category.isSystem,
      isActive: category.isActive,
      tagCount: tagCount !== undefined ? tagCount : undefined,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  }

  /**
   * Monorepo QueryBuilder listing for Admin management
   */
  async findAll(query: QueryParams) {
    const qb = this.categoryRepository
      .createQueryBuilder('category')
      .loadRelationCountAndMap('category.tagCount', 'category.tags');

    const paginated = await QueryBuilder.for(qb, query)
      .allowedFilters([
        'name',
        'slug',
        AllowedFilter.exact('isActive'),
        AllowedFilter.exact('isSystem'),
        AllowedFilter.trashed(),
        AllowedFilter.callback('search', (categoryQb, value) => {
          const term = Array.isArray(value) ? String(value[0]) : String(value);
          if (!term) return;
          categoryQb.andWhere(
            new Brackets((b) => {
              b.where('category.name ILIKE :s', { s: `%${term}%` })
                .orWhere('category.slug ILIKE :s', { s: `%${term}%` })
                .orWhere('category.description ILIKE :s', { s: `%${term}%` });
            }),
          );
        }),
      ])
      .allowedSorts(['sortOrder', 'name', 'createdAt', 'updatedAt'])
      .paginate();

    return {
      ...paginated,
      data: paginated.data.map((cat: any) =>
        this.toDto(cat, Number(cat.tagCount || 0)),
      ),
    };
  }

  /**
   * Fast, cached active categories for client dropdowns and badges
   */
  async findActiveList(): Promise<TagCategoryResDto[]> {
    const cached = await this.cacheService.getJson<TagCategoryResDto[]>(
      ACTIVE_CATEGORIES_CACHE_KEY,
    );
    if (cached) return cached;

    const categories = await this.categoryRepository.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC', name: 'ASC' },
    });

    const dtos = categories.map((cat) => this.toDto(cat));
    await this.cacheService.setJson(ACTIVE_CATEGORIES_CACHE_KEY, dtos, 600);
    return dtos;
  }

  async findById(id: AutoIncrementID): Promise<TagCategoryResDto> {
    const category = await this.categoryRepository.findOne({
      where: { id },
    });
    if (!category) {
      throw new NotFoundException(`Tag category with id ${id} not found`);
    }

    const tagCount = await this.tagRepository.count({
      where: { categoryId: id },
    });

    return this.toDto(category, tagCount);
  }

  async findBySlug(slug: string): Promise<TagCategoryResDto> {
    const category = await this.categoryRepository.findOne({
      where: { slug: slug.trim().toLowerCase(), isActive: true },
    });
    if (!category) {
      throw new NotFoundException(`Tag category "${slug}" not found`);
    }

    const tagCount = await this.tagRepository.count({
      where: { categoryId: category.id },
    });

    return this.toDto(category, tagCount);
  }

  generateSlug(input: string): string {
    const slug = input
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .toLowerCase()
      .replace(/&/g, 'and')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60);

    return slug || `cat-${Date.now().toString(36)}`;
  }

  async create(dto: CreateTagCategoryReqDto): Promise<TagCategoryResDto> {
    const slug = dto.slug
      ? this.generateSlug(dto.slug)
      : this.generateSlug(dto.name);

    if (!slug) {
      throw new BadRequestException(
        'A valid category name or slug is required',
      );
    }

    const existing = await this.categoryRepository.findOne({
      where: { slug },
      withDeleted: true,
    });
    if (existing) {
      throw new ConflictException(
        `Tag category with slug "${slug}" already exists`,
      );
    }

    const entity = this.categoryRepository.create({
      name: dto.name.trim(),
      slug,
      description: dto.description?.trim() ?? null,
      color: dto.color ?? '#64748b',
      icon: dto.icon ?? 'Tag',
      sortOrder: dto.sortOrder ?? 0,
      isActive: dto.isActive ?? true,
      isSystem: false,
    });

    const saved = await this.categoryRepository.save(entity);
    await this.clearCategoryCache();
    return this.toDto(saved, 0);
  }

  async update(
    id: AutoIncrementID,
    dto: UpdateTagCategoryReqDto,
  ): Promise<TagCategoryResDto> {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException(`Tag category with id ${id} not found`);
    }

    let slugChanged = false;
    let oldSlug = category.slug;

    if (dto.slug !== undefined || dto.name !== undefined) {
      const candidate = dto.slug
        ? this.generateSlug(dto.slug)
        : dto.name
          ? this.generateSlug(dto.name)
          : category.slug;

      if (candidate !== category.slug) {
        if (category.isSystem) {
          throw new BadRequestException(
            'Cannot change slug of a built-in system category',
          );
        }

        const conflict = await this.categoryRepository.findOne({
          where: { slug: candidate },
          withDeleted: true,
        });
        if (conflict && conflict.id !== id) {
          throw new ConflictException(
            `Tag category with slug "${candidate}" already exists`,
          );
        }

        oldSlug = category.slug;
        category.slug = candidate;
        slugChanged = true;
      }
    }

    if (dto.name !== undefined) category.name = dto.name.trim();
    if (dto.description !== undefined)
      category.description = dto.description?.trim() ?? null;
    if (dto.color !== undefined) category.color = dto.color;
    if (dto.icon !== undefined) category.icon = dto.icon;
    if (dto.sortOrder !== undefined) category.sortOrder = dto.sortOrder;
    if (dto.isActive !== undefined) category.isActive = dto.isActive;

    const saved = await this.categoryRepository.save(category);

    if (slugChanged) {
      // Sync tags.category string column to match the updated slug
      await this.tagRepository.update(
        { categoryId: id },
        { category: saved.slug },
      );
    }

    await this.clearCategoryCache();

    const tagCount = await this.tagRepository.count({
      where: { categoryId: id },
    });

    return this.toDto(saved, tagCount);
  }

  async delete(id: AutoIncrementID): Promise<void> {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException(`Tag category with id ${id} not found`);
    }

    if (category.isSystem) {
      throw new BadRequestException('Cannot delete built-in system categories');
    }

    // Soft delete category
    await this.categoryRepository.softDelete(id);

    // Reassign existing tags pointing to this category to 'general' category
    const generalCat = await this.categoryRepository.findOne({
      where: { slug: 'general' },
    });
    if (generalCat) {
      await this.tagRepository.update(
        { categoryId: id },
        { categoryId: generalCat.id, category: generalCat.slug },
      );
    }

    await this.clearCategoryCache();
  }

  private async clearCategoryCache(): Promise<void> {
    await this.cacheService.bumpVersion();
  }
}
