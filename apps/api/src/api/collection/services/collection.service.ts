import {
  AllowedFilter,
  QueryBuilder,
  QueryParams,
} from '../../../common/query-builder';
import { Paginated } from '../../../common/dto/offset-pagination/paginated.dto';
import { AutoIncrementID } from '../../../common/types/common.type';
import { slugifyAscii } from '../../../common/utils/slug.util';
import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, IsNull, Repository } from 'typeorm';
import { PostEntity } from '../../post/entities/post.entity';
import { UserEntity } from '../../user/entities/user.entity';
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

@Injectable()
export class CollectionService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(CollectionEntity)
    private readonly collectionRepo: Repository<CollectionEntity>,
    @InjectRepository(CollectionItemEntity)
    private readonly itemRepo: Repository<CollectionItemEntity>,
    @InjectRepository(PostEntity)
    private readonly postRepo: Repository<PostEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
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

    const colIds = paginated.data.map((col) => col.id);
    const thumbsMap = new Map<string, string[]>();
    if (colIds.length > 0) {
      const rankedItems = this.itemRepo
        .createQueryBuilder('item')
        .innerJoin('item.post', 'post')
        .select('item.collectionId', 'collection_id')
        .addSelect('post.coverImageUrl', 'cover_image_url')
        .addSelect(
          'ROW_NUMBER() OVER (PARTITION BY item.collectionId ORDER BY item.sortOrder ASC, item.id ASC)',
          'row_number',
        )
        .where('item.collectionId IN (:...colIds)', { colIds })
        .andWhere('post.coverImageUrl IS NOT NULL')
        .andWhere("post.coverImageUrl <> ''");

      const previews = await this.itemRepo
        .createQueryBuilder()
        .select('preview.collection_id', 'collectionId')
        .addSelect('preview.cover_image_url', 'coverImageUrl')
        .from(`(${rankedItems.getQuery()})`, 'preview')
        .setParameters(rankedItems.getParameters())
        .where('preview.row_number <= 4')
        .orderBy('preview.collection_id', 'ASC')
        .addOrderBy('preview.row_number', 'ASC')
        .getRawMany<{ collectionId: AutoIncrementID; coverImageUrl: string }>();

      for (const preview of previews) {
        const key = String(preview.collectionId);
        const thumbnails = thumbsMap.get(key) ?? [];
        if (
          preview.coverImageUrl &&
          !thumbnails.includes(preview.coverImageUrl) &&
          thumbnails.length < 4
        ) {
          thumbnails.push(preview.coverImageUrl);
          thumbsMap.set(key, thumbnails);
        }
      }
    }

    const mapped = paginated.data.map((item) =>
      this.toCollectionDto(item, thumbsMap.get(String(item.id)) ?? []),
    );
    return new Paginated(mapped, paginated.meta, paginated.links);
  }

  /**
   * Create a new collection.
   */
  async createCollection(
    userId: AutoIncrementID,
    dto: CreateCollectionReqDto,
  ): Promise<CollectionResDto> {
    let slugCandidate = slugifyAscii(dto.title);
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
    });

    const saved = await this.dataSource.transaction(async (em) => {
      const inserted = await em.save(CollectionEntity, col);
      await em.increment(UserEntity, { id: userId }, 'collectionsCount', 1);
      return inserted;
    });
    return this.toCollectionDto(saved, []);
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

    const previewItems = await this.itemRepo.find({
      where: { collectionId: col.id },
      relations: ['post'],
      order: { sortOrder: 'ASC', id: 'ASC' },
      take: 4,
    });
    const previewThumbnails = previewItems
      .map((item) => item.post?.coverImageUrl)
      .filter((url): url is string => Boolean(url));

    return this.toCollectionDto(col, previewThumbnails);
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
    await this.dataSource.transaction(async (em) => {
      await em.softDelete(CollectionEntity, { id: collectionId });
      const owner = await em.findOne(UserEntity, { where: { id: userId } });
      if (owner && Number(owner.collectionsCount) > 0) {
        await em.decrement(UserEntity, { id: userId }, 'collectionsCount', 1);
      }
    });
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
      where: {
        collectionId,
        postId: dto.postId,
        postMediaId: dto.postMediaId ? dto.postMediaId : IsNull(),
      },
    });
    if (existing) {
      throw new ConflictException(
        dto.postMediaId
          ? 'Tấm ảnh này đã có trong bộ sưu tập'
          : 'Album này đã có trong bộ sưu tập',
      );
    }

    const post = await this.postRepo.findOne({ where: { id: dto.postId } });
    if (!post) {
      throw new NotFoundException(`Post #${dto.postId} not found`);
    }

    return await this.dataSource.transaction(async (em) => {
      const item = em.create(CollectionItemEntity, {
        collectionId,
        postId: dto.postId,
        postMediaId: dto.postMediaId ?? null,
        sortOrder: col.itemsCount,
      });
      const saved = await em.save(CollectionItemEntity, item);

      // Update collection items count atomically
      await em.increment(
        CollectionEntity,
        { id: collectionId },
        'itemsCount',
        1,
      );

      // Update post saves count atomically
      await em.increment(PostEntity, { id: dto.postId }, 'savesCount', 1);

      return this.toItemDto(saved, post);
    });
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

    await this.dataSource.transaction(async (em) => {
      await em.delete(CollectionItemEntity, { id: itemId });
      await em.decrement(
        CollectionEntity,
        { id: collectionId },
        'itemsCount',
        1,
      );
      if (item.postId) {
        await em.decrement(PostEntity, { id: item.postId }, 'savesCount', 1);
      }
    });
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
      .leftJoinAndSelect('item.postMedia', 'postMedia')
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

  private toCollectionDto(
    c: CollectionEntity,
    previewThumbnails: string[] = [],
  ): CollectionResDto {
    return {
      id: c.id,
      userId: c.userId,
      title: c.title,
      slug: c.slug,
      description: c.description ?? null,
      isDefault: c.isDefault,
      isPublic: c.isPublic,
      itemsCount: Number(c.itemsCount || 0),
      previewThumbnails,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    };
  }

  private toItemDto(
    item: CollectionItemEntity,
    post?: PostEntity,
  ): CollectionItemResDto {
    const resolvedMediaUrl = item.postMedia?.url ?? post?.coverImageUrl ?? null;
    return {
      id: item.id,
      collectionId: item.collectionId,
      postId: item.postId,
      post: post
        ? {
            id: post.id,
            title: post.title,
            slug: post.slug,
            coverUrl: resolvedMediaUrl,
            postType: post.postType,
          }
        : undefined,
      postMediaId: item.postMediaId ?? null,
      mediaUrl: resolvedMediaUrl,
      sortOrder: item.sortOrder,
      createdAt: item.createdAt,
    };
  }
}
