import {
  AllowedFilter,
  QueryBuilder,
  QueryParams,
} from '../../../common/query-builder';
import { Paginated } from '../../../common/dto/offset-pagination/paginated.dto';
import { AutoIncrementID } from '../../../common/types/common.type';
import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostEntity } from '../../post/entities/post.entity';
import {
  AddCollectionItemReqDto,
  CreateCollectionReqDto,
} from '../dto/collection-req.dto';
import {
  CollectionItemResDto,
  CollectionResDto,
} from '../dto/collection-res.dto';
import { CollectionItemEntity } from '../entities/collection-item.entity';
import { CollectionEntity } from '../entities/collection.entity';

function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

@Injectable()
export class CollectionService {
  constructor(
    @InjectRepository(CollectionEntity)
    private readonly collectionRepo: Repository<CollectionEntity>,
    @InjectRepository(CollectionItemEntity)
    private readonly itemRepo: Repository<CollectionItemEntity>,
    @InjectRepository(PostEntity)
    private readonly postRepo: Repository<PostEntity>,
  ) {}

  /**
   * Get user's collections with QueryBuilder.
   */
  async getMyCollections(
    userId: AutoIncrementID,
    query: QueryParams,
  ): Promise<Paginated<CollectionResDto>> {
    const baseQb = this.collectionRepo
      .createQueryBuilder('col')
      .where('col.userId = :userId', { userId });

    const paginated = await QueryBuilder.for(baseQb, query)
      .allowedFilters([AllowedFilter.partial('title')])
      .allowedSorts(['createdAt', 'updatedAt', 'itemsCount'])
      .defaultSort('-updatedAt')
      .paginate();

    const mapped = paginated.data.map((item) => this.toCollectionDto(item));
    return new Paginated(mapped, paginated.meta, paginated.links);
  }

  /**
   * Create a new collection.
   */
  async createCollection(
    userId: AutoIncrementID,
    dto: CreateCollectionReqDto,
  ): Promise<CollectionResDto> {
    let slugCandidate = slugify(dto.title);
    if (!slugCandidate) {
      slugCandidate = `col-${Date.now().toString(36)}`;
    }
    const collision = await this.collectionRepo.count({
      where: { userId, slug: slugCandidate },
    });
    if (collision > 0) {
      slugCandidate = `${slugCandidate}-${Date.now().toString(36).slice(-4)}`;
    }

    const col = this.collectionRepo.create({
      userId,
      title: dto.title,
      slug: slugCandidate,
      description: dto.description ?? null,
      isDefault: false,
      isPublic: dto.isPublic ?? true,
      itemsCount: 0,
      previewThumbnails: [],
    });

    const saved = await this.collectionRepo.save(col);
    return this.toCollectionDto(saved);
  }

  /**
   * Get collection detail.
   */
  async getCollectionDetail(
    userId: AutoIncrementID,
    slugOrId: string,
  ): Promise<CollectionResDto> {
    const isId = /^\d+$/.test(slugOrId);
    const col = await this.collectionRepo.findOne({
      where: isId
        ? { id: slugOrId as unknown as AutoIncrementID }
        : { slug: slugOrId },
    });

    if (!col) {
      throw new NotFoundException(`Collection "${slugOrId}" not found`);
    }

    if (!col.isPublic && String(col.userId) !== String(userId)) {
      throw new ForbiddenException('This collection is private');
    }

    return this.toCollectionDto(col);
  }

  /**
   * Delete collection.
   */
  async deleteCollection(
    userId: AutoIncrementID,
    collectionId: AutoIncrementID,
  ): Promise<void> {
    const col = await this.collectionRepo.findOne({
      where: { id: collectionId },
    });
    if (!col) {
      throw new NotFoundException(`Collection #${collectionId} not found`);
    }
    if (String(col.userId) !== String(userId)) {
      throw new ForbiddenException('You do not own this collection');
    }
    await this.collectionRepo.softDelete({ id: collectionId });
  }

  /**
   * Add post to collection.
   */
  async addItem(
    userId: AutoIncrementID,
    collectionId: AutoIncrementID,
    dto: AddCollectionItemReqDto,
  ): Promise<CollectionItemResDto> {
    const col = await this.collectionRepo.findOne({
      where: { id: collectionId },
    });
    if (!col) {
      throw new NotFoundException(`Collection #${collectionId} not found`);
    }
    if (String(col.userId) !== String(userId)) {
      throw new ForbiddenException('You do not own this collection');
    }

    const existing = await this.itemRepo.findOne({
      where: { collectionId, postId: dto.postId },
    });
    if (existing) {
      throw new ConflictException('Post is already saved in this collection');
    }

    const post = await this.postRepo.findOne({ where: { id: dto.postId } });
    if (!post) {
      throw new NotFoundException(`Post #${dto.postId} not found`);
    }

    const item = this.itemRepo.create({
      collectionId,
      postId: dto.postId,
      postMediaId: dto.postMediaId ?? null,
      sortOrder: col.itemsCount,
    });
    const saved = await this.itemRepo.save(item);

    // Update collection items count & thumbnail preview
    await this.collectionRepo.increment({ id: collectionId }, 'itemsCount', 1);

    return this.toItemDto(saved, post);
  }

  /**
   * Remove item from collection.
   */
  async removeItem(
    userId: AutoIncrementID,
    collectionId: AutoIncrementID,
    itemId: AutoIncrementID,
  ): Promise<void> {
    const col = await this.collectionRepo.findOne({
      where: { id: collectionId },
    });
    if (!col) {
      throw new NotFoundException(`Collection #${collectionId} not found`);
    }
    if (String(col.userId) !== String(userId)) {
      throw new ForbiddenException('You do not own this collection');
    }

    const item = await this.itemRepo.findOne({
      where: { id: itemId, collectionId },
    });
    if (!item) {
      throw new NotFoundException(`Item #${itemId} not found in collection`);
    }

    await this.itemRepo.delete({ id: itemId });
    await this.collectionRepo.decrement({ id: collectionId }, 'itemsCount', 1);
  }

  /**
   * Get paginated items in collection.
   */
  async getItems(
    collectionId: AutoIncrementID,
    query: QueryParams,
  ): Promise<Paginated<CollectionItemResDto>> {
    const baseQb = this.itemRepo
      .createQueryBuilder('item')
      .leftJoinAndSelect('item.post', 'post')
      .where('item.collectionId = :collectionId', { collectionId });

    const paginated = await QueryBuilder.for(baseQb, query)
      .allowedSorts(['createdAt', 'sortOrder'])
      .defaultSort('sortOrder')
      .paginate();

    const mapped = paginated.data.map((item) =>
      this.toItemDto(item, item.post),
    );
    return new Paginated(mapped, paginated.meta, paginated.links);
  }

  // =================== MAPPERS ===================

  private toCollectionDto(c: CollectionEntity): CollectionResDto {
    return {
      id: c.id,
      userId: c.userId,
      title: c.title,
      slug: c.slug,
      description: c.description ?? null,
      isDefault: c.isDefault,
      isPublic: c.isPublic,
      itemsCount: Number(c.itemsCount || 0),
      previewThumbnails: c.previewThumbnails || [],
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    };
  }

  private toItemDto(
    item: CollectionItemEntity,
    post?: PostEntity,
  ): CollectionItemResDto {
    return {
      id: item.id,
      collectionId: item.collectionId,
      postId: item.postId,
      post: post
        ? {
            id: post.id,
            title: post.title,
            slug: post.slug,
            coverUrl: post.coverImageUrl ?? null,
          }
        : undefined,
      postMediaId: item.postMediaId ?? null,
      sortOrder: item.sortOrder,
      createdAt: item.createdAt,
    };
  }
}
