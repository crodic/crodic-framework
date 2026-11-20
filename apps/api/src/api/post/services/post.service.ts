import {
  AllowedFilter,
  QueryBuilder,
  QueryParams,
} from '../../../common/query-builder';
import { Paginated } from '../../../common/dto/offset-pagination/paginated.dto';
import { AutoIncrementID } from '../../../common/types/common.type';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Brackets, DataSource, In, Repository } from 'typeorm';
import { UserEntity } from '../../user/entities/user.entity';
import { CosplayerProfileEntity } from '../../cosplayer/entities/cosplayer-profile.entity';
import {
  EAlbumCategory,
  EMediaType,
  EPostStatus,
} from '../constants/post.constant';
import {
  CreatePostCommentReqDto,
  CreatePostReqDto,
  UpdatePostReqDto,
} from '../dto/post-req.dto';
import {
  PostCommentResDto,
  PostDetailResDto,
  PostMediaResDto,
  PostSummaryResDto,
} from '../dto/post-res.dto';
import { PostCommentLikeEntity } from '../entities/post-comment-like.entity';
import { PostCommentEntity } from '../entities/post-comment.entity';
import { PostLikeEntity } from '../entities/post-like.entity';
import { PostMediaEntity } from '../entities/post-media.entity';
import { PostEntity } from '../entities/post.entity';
import { CollectionItemEntity } from '../../collection/entities/collection-item.entity';
import { ETaggableEntityType } from '../../tag/constants/tag.constant';
import { EntityTagEntity } from '../../tag/entities/entity-tag.entity';
import { EntityTaggingService } from '../../tag/services/entity-tagging.service';

function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 150)
    .replace(/-+$/g, '');
}

@Injectable()
export class PostService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(PostEntity)
    private readonly postRepo: Repository<PostEntity>,
    @InjectRepository(PostMediaEntity)
    private readonly mediaRepo: Repository<PostMediaEntity>,
    @InjectRepository(PostLikeEntity)
    private readonly likeRepo: Repository<PostLikeEntity>,
    @InjectRepository(PostCommentEntity)
    private readonly commentRepo: Repository<PostCommentEntity>,
    @InjectRepository(PostCommentLikeEntity)
    private readonly commentLikeRepo: Repository<PostCommentLikeEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(CosplayerProfileEntity)
    private readonly profileRepo: Repository<CosplayerProfileEntity>,
    @InjectRepository(EntityTagEntity)
    private readonly entityTagRepo: Repository<EntityTagEntity>,
    @Optional()
    private readonly entityTaggingService?: EntityTaggingService,
  ) {}

  /**
   * Browse published posts and studio albums with QueryBuilder support.
   */
  async findAll(
    query: QueryParams,
    currentUserId?: AutoIncrementID,
  ): Promise<Paginated<PostSummaryResDto>> {
    const baseQb = this.postRepo
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .where('author.deletedAt IS NULL');

    const paginated = await QueryBuilder.for(baseQb, query)
      .allowedFilters([
        AllowedFilter.exact('postType'),
        AllowedFilter.exact('albumCategory'),
        AllowedFilter.exact('authorId'),
        AllowedFilter.exact('isPublic'),
        AllowedFilter.exact('status'),
        AllowedFilter.exact('isFeaturedWork'),
        AllowedFilter.exact('copyrightTagId'),
        AllowedFilter.exact('characterTagId'),
        AllowedFilter.partial('title'),
        AllowedFilter.partial('characterName'),
        AllowedFilter.partial('fandomName'),
        AllowedFilter.callback('search', (qb, value) => {
          const term = Array.isArray(value) ? String(value[0]) : String(value);
          const normalized = term.trim().toLowerCase();
          if (!normalized) return;
          qb.andWhere(
            new Brackets((b) => {
              b.where('LOWER(post.title) LIKE :sTerm', {
                sTerm: `%${normalized}%`,
              })
                .orWhere('LOWER(post.caption) LIKE :sTerm', {
                  sTerm: `%${normalized}%`,
                })
                .orWhere('LOWER(post.characterName) LIKE :sTerm', {
                  sTerm: `%${normalized}%`,
                })
                .orWhere('LOWER(post.fandomName) LIKE :sTerm', {
                  sTerm: `%${normalized}%`,
                });
            }),
          );
        }),
      ])
      .allowedSorts([
        'publishedAt',
        'trendingScore',
        'likesCount',
        'viewsCount',
        'commentsCount',
        'createdAt',
      ])
      .defaultSort('-publishedAt')
      .paginate();

    const postIds = paginated.data.map((p) => p.id);
    let likedPostIds = new Set<string>();
    let savedPostIds = new Set<string>();

    if (currentUserId && postIds.length > 0) {
      const [likes, savedItems] = await Promise.all([
        this.likeRepo.find({
          where: { userId: currentUserId, postId: In(postIds) },
        }),
        this.dataSource
          .getRepository(CollectionItemEntity)
          .createQueryBuilder('item')
          .innerJoin('item.collection', 'col')
          .where('col.userId = :userId', { userId: currentUserId })
          .andWhere('item.postId IN (:...postIds)', { postIds })
          .select(['item.postId AS "postId"'])
          .getRawMany(),
      ]);
      likedPostIds = new Set(likes.map((l) => String(l.postId)));
      savedPostIds = new Set(savedItems.map((s) => String(s.postId)));
    }

    const authorIds = Array.from(
      new Set(paginated.data.map((p) => p.authorId)),
    );
    const [profileMap, mediaByPostId, tagsByPostId] = await Promise.all([
      this.loadProfileMap(authorIds),
      this.loadMediaPreviewsByPostIds(postIds),
      this.loadTagsByPostIds(postIds),
    ]);

    const mapped = paginated.data.map((post) => {
      const profile = profileMap.get(String(post.authorId));
      const mediaSummary = mediaByPostId.get(String(post.id));
      const tags = tagsByPostId.get(String(post.id));
      return this.toSummaryDto(
        post,
        profile,
        likedPostIds.has(String(post.id)),
        mediaSummary?.previews,
        savedPostIds.has(String(post.id)),
        tags,
        mediaSummary?.videoUrl,
      );
    });

    return new Paginated(mapped, paginated.meta, paginated.links);
  }

  /**
   * Get personalized following feed for current user.
   * Returns posts from creators that current user follows, plus user's own posts.
   */
  async getFeed(
    currentUserId: AutoIncrementID,
    query: QueryParams,
  ): Promise<Paginated<PostSummaryResDto>> {
    const baseQb = this.postRepo
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .where('post.status = :publishedStatus', {
        publishedStatus: EPostStatus.PUBLISHED,
      })
      .andWhere('author.deletedAt IS NULL')
      .andWhere(
        new Brackets((b) => {
          b.where('post.isPublic = true').orWhere(
            'post.authorId = :currentUserId',
            { currentUserId },
          );
        }),
      )
      .andWhere(
        new Brackets((b) => {
          b.where('post.authorId = :currentUserId', { currentUserId }).orWhere(
            'EXISTS (SELECT 1 FROM user_follows uf WHERE uf.follower_id = :currentUserId AND uf.following_id = post.author_id)',
            { currentUserId },
          );
        }),
      );

    const paginated = await QueryBuilder.for(baseQb, query)
      .allowedFilters([
        AllowedFilter.exact('postType'),
        AllowedFilter.exact('albumCategory'),
        AllowedFilter.exact('authorId'),
        AllowedFilter.exact('isFeaturedWork'),
        AllowedFilter.partial('title'),
        AllowedFilter.partial('characterName'),
        AllowedFilter.partial('fandomName'),
      ])
      .allowedSorts([
        'publishedAt',
        'trendingScore',
        'likesCount',
        'viewsCount',
        'commentsCount',
        'createdAt',
      ])
      .defaultSort('-publishedAt')
      .paginate();

    const postIds = paginated.data.map((p) => p.id);
    let likedPostIds = new Set<string>();
    let savedPostIds = new Set<string>();

    if (currentUserId && postIds.length > 0) {
      const [likes, savedItems] = await Promise.all([
        this.likeRepo.find({
          where: { userId: currentUserId, postId: In(postIds) },
        }),
        this.dataSource
          .getRepository(CollectionItemEntity)
          .createQueryBuilder('item')
          .innerJoin('item.collection', 'col')
          .where('col.userId = :userId', { userId: currentUserId })
          .andWhere('item.postId IN (:...postIds)', { postIds })
          .select(['item.postId AS "postId"'])
          .getRawMany(),
      ]);
      likedPostIds = new Set(likes.map((l) => String(l.postId)));
      savedPostIds = new Set(savedItems.map((s) => String(s.postId)));
    }

    const authorIds = Array.from(
      new Set(paginated.data.map((p) => p.authorId)),
    );
    const [profileMap, mediaByPostId, tagsByPostId] = await Promise.all([
      this.loadProfileMap(authorIds),
      this.loadMediaPreviewsByPostIds(postIds),
      this.loadTagsByPostIds(postIds),
    ]);

    const mapped = paginated.data.map((post) => {
      const profile = profileMap.get(String(post.authorId));
      const mediaSummary = mediaByPostId.get(String(post.id));
      const tags = tagsByPostId.get(String(post.id));
      return this.toSummaryDto(
        post,
        profile,
        likedPostIds.has(String(post.id)),
        mediaSummary?.previews,
        savedPostIds.has(String(post.id)),
        tags,
        mediaSummary?.videoUrl,
      );
    });

    return new Paginated(mapped, paginated.meta, paginated.links);
  }

  /**
   * Find post detail by slug or numeric ID fallback.
   */
  async findBySlug(
    slugOrId: string,
    currentUserId?: AutoIncrementID,
  ): Promise<PostDetailResDto> {
    let post = await this.postRepo.findOne({
      where: { slug: slugOrId },
      relations: ['author'],
    });

    if (!post && /^\d+$/.test(String(slugOrId))) {
      post = await this.postRepo.findOne({
        where: { id: slugOrId as unknown as AutoIncrementID },
        relations: ['author'],
      });
    }

    if (!post || post.author === null || post.author?.deletedAt) {
      throw new NotFoundException(`Post "${slugOrId}" not found`);
    }

    // Increment views count asynchronously
    this.postRepo
      .increment({ id: post.id }, 'viewsCount', 1)
      .catch(() => undefined);

    const [mediaList, profile, likeRecord, savedItem, tagsByPostId] =
      await Promise.all([
        this.mediaRepo.find({
          where: { postId: post.id },
          order: { sortOrder: 'ASC', id: 'ASC' },
        }),
        this.profileRepo.findOne({ where: { userId: post.authorId } }),
        currentUserId
          ? this.likeRepo.findOne({
              where: { userId: currentUserId, postId: post.id },
            })
          : null,
        currentUserId
          ? this.dataSource
              .getRepository(CollectionItemEntity)
              .createQueryBuilder('item')
              .innerJoin('item.collection', 'col')
              .where('col.userId = :userId', { userId: currentUserId })
              .andWhere('item.postId = :postId', { postId: post.id })
              .getOne()
          : null,
        this.loadTagsByPostIds([post.id]),
      ]);

    return this.toDetailDto(
      post,
      mediaList,
      profile,
      Boolean(likeRecord),
      Boolean(savedItem),
      tagsByPostId.get(String(post.id)),
    );
  }

  private async generateUniqueSlug(dto: CreatePostReqDto): Promise<string> {
    let baseSlug = slugify(dto.title);
    if (!baseSlug) {
      baseSlug =
        slugify(dto.characterName || dto.fandomName || '') || 'cosplay-post';
    }

    for (let attempt = 0; attempt < 5; attempt++) {
      const shortHash = Math.random().toString(36).slice(2, 8).padEnd(6, '0');
      const candidate = `${baseSlug}-${shortHash}`;
      const existingCount = await this.postRepo.count({
        where: { slug: candidate },
      });
      if (existingCount === 0) {
        return candidate;
      }
    }

    return `${baseSlug}-${Date.now().toString(36)}`;
  }

  /**
   * Create post / studio album.
   */
  async create(
    authorId: AutoIncrementID,
    dto: CreatePostReqDto,
  ): Promise<PostDetailResDto> {
    const slugCandidate = await this.generateUniqueSlug(dto);

    return await this.dataSource.transaction(async (em) => {
      const post = em.create(PostEntity, {
        authorId,
        slug: slugCandidate,
        title: dto.title,
        caption: dto.caption ?? null,
        postType: dto.postType,
        albumCategory: dto.albumCategory,
        characterName: dto.characterName ?? null,
        fandomName: dto.fandomName ?? null,
        cosplayerCharacterId: dto.cosplayerCharacterId ?? null,
        characterTagId: dto.characterTagId ?? null,
        copyrightTagId: dto.copyrightTagId ?? null,
        coverImageUrl: dto.coverImageUrl,
        collaborators: dto.collaborators || [],
        isPublic: dto.isPublic ?? true,
        enableWatermark: dto.enableWatermark ?? false,
        status: dto.status ?? EPostStatus.PUBLISHED,
        photosCount: dto.media?.length || 1,
        likesCount: 0,
        commentsCount: 0,
        savesCount: 0,
        sharesCount: 0,
        viewsCount: 0,
        trendingScore: 0,
      });

      const savedPost = await em.save(PostEntity, post);

      const mediaEntities = (dto.media || []).map((m, idx) =>
        em.create(PostMediaEntity, {
          postId: savedPost.id,
          url: m.mediaUrl,
          mediaType: m.mediaType,
          fileId: m.fileId ?? null,
          width: m.width ?? null,
          height: m.height ?? null,
          sortOrder: m.sortOrder ?? idx,
          isCover: m.isCover ?? idx === 0,
          altText: m.caption ?? null,
        }),
      );

      const savedMedia =
        mediaEntities.length > 0
          ? await em.save(PostMediaEntity, mediaEntities)
          : [];

      // Increment author's albumsCount atomically
      await em.increment(
        CosplayerProfileEntity,
        { userId: authorId },
        'albumsCount',
        1,
      );

      // Sync tags with Tag Management system
      if (dto.tags && dto.tags.length > 0 && this.entityTaggingService) {
        try {
          await this.entityTaggingService.syncAuthorTags(
            ETaggableEntityType.POST,
            savedPost.id,
            { tagNames: dto.tags, ownerUserId: authorId },
            { userId: authorId },
          );
        } catch {
          // Ignore if tag sync fails gracefully
        }
      }

      const profile = await em.findOne(CosplayerProfileEntity, {
        where: { userId: authorId },
      });
      return this.toDetailDto(
        savedPost,
        savedMedia,
        profile,
        false,
        false,
        dto.tags,
      );
    });
  }

  /**
   * Update post.
   */
  async update(
    authorId: AutoIncrementID,
    postId: AutoIncrementID,
    dto: UpdatePostReqDto,
  ): Promise<PostDetailResDto> {
    const post = await this.postRepo.findOne({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException(`Post #${postId} not found`);
    }
    if (String(post.authorId) !== String(authorId)) {
      throw new ForbiddenException(
        'You do not have permission to edit this post',
      );
    }

    return await this.dataSource.transaction(async (em) => {
      if (dto.title !== undefined) post.title = dto.title;
      if (dto.caption !== undefined) post.caption = dto.caption;
      if (dto.postType !== undefined) post.postType = dto.postType;
      if (dto.albumCategory !== undefined)
        post.albumCategory = dto.albumCategory;
      if (dto.characterName !== undefined)
        post.characterName = dto.characterName;
      if (dto.fandomName !== undefined) post.fandomName = dto.fandomName;
      if (dto.cosplayerCharacterId !== undefined)
        post.cosplayerCharacterId = dto.cosplayerCharacterId;
      if (dto.characterTagId !== undefined)
        post.characterTagId = dto.characterTagId;
      if (dto.copyrightTagId !== undefined)
        post.copyrightTagId = dto.copyrightTagId;
      if (dto.coverImageUrl !== undefined)
        post.coverImageUrl = dto.coverImageUrl;
      if (dto.collaborators !== undefined)
        post.collaborators = dto.collaborators;
      if (dto.isPublic !== undefined) post.isPublic = dto.isPublic;
      if (dto.enableWatermark !== undefined)
        post.enableWatermark = dto.enableWatermark;
      if (dto.status !== undefined) post.status = dto.status;

      if (dto.media !== undefined) {
        await em.delete(PostMediaEntity, { postId });
        const newMedia = dto.media.map((m, idx) =>
          em.create(PostMediaEntity, {
            postId,
            url: m.mediaUrl,
            mediaType: m.mediaType,
            fileId: m.fileId ?? null,
            width: m.width ?? null,
            height: m.height ?? null,
            sortOrder: m.sortOrder ?? idx,
            isCover: m.isCover ?? idx === 0,
            altText: m.caption ?? null,
          }),
        );
        if (newMedia.length > 0) {
          await em.save(PostMediaEntity, newMedia);
        }
        post.photosCount = newMedia.length;
      }

      const savedPost = await em.save(PostEntity, post);

      if (dto.tags !== undefined && this.entityTaggingService) {
        try {
          await this.entityTaggingService.syncAuthorTags(
            ETaggableEntityType.POST,
            savedPost.id,
            { tagNames: dto.tags, ownerUserId: authorId },
            { userId: authorId },
          );
        } catch {
          // Gracefully continue
        }
      }

      const [mediaList, profile] = await Promise.all([
        em.find(PostMediaEntity, {
          where: { postId },
          order: { sortOrder: 'ASC', id: 'ASC' },
        }),
        em.findOne(CosplayerProfileEntity, { where: { userId: authorId } }),
      ]);

      return this.toDetailDto(
        savedPost,
        mediaList,
        profile,
        false,
        false,
        dto.tags,
      );
    });
  }

  /**
   * Delete post.
   */
  async delete(
    authorId: AutoIncrementID,
    postId: AutoIncrementID,
  ): Promise<void> {
    const post = await this.postRepo.findOne({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException(`Post #${postId} not found`);
    }
    if (String(post.authorId) !== String(authorId)) {
      throw new ForbiddenException(
        'You do not have permission to delete this post',
      );
    }

    await this.dataSource.transaction(async (em) => {
      await em.softDelete(PostEntity, { id: postId });

      const profile = await em.findOne(CosplayerProfileEntity, {
        where: { userId: authorId },
      });
      if (profile && profile.albumsCount > 0) {
        await em.decrement(
          CosplayerProfileEntity,
          { userId: authorId },
          'albumsCount',
          1,
        );
      }
    });
  }

  /**
   * Admin: List posts and studio albums with rich QueryBuilder filtering.
   */
  async findAllAdmin(
    query: QueryParams,
  ): Promise<Paginated<PostSummaryResDto>> {
    const baseQb = this.postRepo
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .where('author.deletedAt IS NULL');

    const paginated = await QueryBuilder.for(baseQb, query)
      .allowedFilters([
        AllowedFilter.exact('postType'),
        AllowedFilter.exact('albumCategory'),
        AllowedFilter.exact('authorId'),
        AllowedFilter.exact('isPublic'),
        AllowedFilter.exact('status'),
        AllowedFilter.exact('isFeaturedWork'),
        AllowedFilter.exact('copyrightTagId'),
        AllowedFilter.exact('characterTagId'),
        AllowedFilter.partial('title'),
        AllowedFilter.partial('characterName'),
        AllowedFilter.partial('fandomName'),
        AllowedFilter.callback('search', (qb, value) => {
          const term = Array.isArray(value) ? String(value[0]) : String(value);
          const normalized = term.trim().toLowerCase();
          if (!normalized) return;
          qb.andWhere(
            new Brackets((b) => {
              b.where('LOWER(post.title) LIKE :sTerm', {
                sTerm: `%${normalized}%`,
              })
                .orWhere('LOWER(post.characterName) LIKE :sTerm', {
                  sTerm: `%${normalized}%`,
                })
                .orWhere('LOWER(post.fandomName) LIKE :sTerm', {
                  sTerm: `%${normalized}%`,
                });
            }),
          );
        }),
      ])
      .allowedSorts([
        'publishedAt',
        'createdAt',
        'trendingScore',
        'likesCount',
        'viewsCount',
        'commentsCount',
        'photosCount',
      ])
      .defaultSort('-createdAt')
      .paginate();

    const postIds = paginated.data.map((p) => p.id);
    const authorIds = Array.from(
      new Set(paginated.data.map((p) => p.authorId)),
    );
    const [profileMap, mediaByPostId, tagsByPostId] = await Promise.all([
      this.loadProfileMap(authorIds),
      this.loadMediaPreviewsByPostIds(postIds),
      this.loadTagsByPostIds(postIds),
    ]);

    const mapped = paginated.data.map((post) => {
      const mediaSummary = mediaByPostId.get(String(post.id));
      return this.toSummaryDto(
        post,
        profileMap.get(String(post.authorId)),
        false,
        mediaSummary?.previews,
        false,
        tagsByPostId.get(String(post.id)),
        mediaSummary?.videoUrl,
      );
    });

    return new Paginated(mapped, paginated.meta, paginated.links);
  }

  /**
   * Admin: Get post detail by ID.
   */
  async findOneAdmin(postId: AutoIncrementID): Promise<PostDetailResDto> {
    const post = await this.postRepo.findOne({
      where: { id: postId },
      relations: ['author'],
    });
    if (!post) {
      throw new NotFoundException(`Post #${postId} not found`);
    }

    const [media, profile] = await Promise.all([
      this.mediaRepo.find({
        where: { postId },
        order: { sortOrder: 'ASC', id: 'ASC' },
      }),
      this.profileRepo.findOne({ where: { userId: post.authorId } }),
    ]);

    return this.toDetailDto(post, media, profile, false);
  }

  /**
   * Admin: Toggle featured work placement.
   */
  async toggleFeatureAdmin(
    postId: AutoIncrementID,
    isFeatured?: boolean,
  ): Promise<PostDetailResDto> {
    const post = await this.postRepo.findOne({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException(`Post #${postId} not found`);
    }

    post.isFeaturedWork =
      isFeatured !== undefined ? isFeatured : !post.isFeaturedWork;
    const saved = await this.postRepo.save(post);
    return this.findOneAdmin(saved.id);
  }

  /**
   * Admin: Update post status and public visibility.
   */
  async updateStatusAdmin(
    postId: AutoIncrementID,
    status: EPostStatus,
    isPublic?: boolean,
  ): Promise<PostDetailResDto> {
    const post = await this.postRepo.findOne({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException(`Post #${postId} not found`);
    }

    post.status = status;
    if (isPublic !== undefined) {
      post.isPublic = isPublic;
    }
    const saved = await this.postRepo.save(post);
    return this.findOneAdmin(saved.id);
  }

  /**
   * Admin: Delete post and decrement counters.
   */
  async deleteAdmin(postId: AutoIncrementID): Promise<void> {
    const post = await this.postRepo.findOne({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException(`Post #${postId} not found`);
    }

    await this.dataSource.transaction(async (em) => {
      await em.softDelete(PostEntity, { id: postId });

      const profile = await em.findOne(CosplayerProfileEntity, {
        where: { userId: post.authorId },
      });
      if (profile && profile.albumsCount > 0) {
        await em.decrement(
          CosplayerProfileEntity,
          { userId: post.authorId },
          'albumsCount',
          1,
        );
      }
    });
  }

  /**
   * Toggle like on post.
   */
  async toggleLike(
    userId: AutoIncrementID,
    postId: AutoIncrementID,
  ): Promise<{ liked: boolean; likesCount: number }> {
    const post = await this.postRepo.findOne({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException(`Post #${postId} not found`);
    }

    return await this.dataSource.transaction(async (em) => {
      const existing = await em.findOne(PostLikeEntity, {
        where: { userId, postId },
      });

      if (existing) {
        await em.delete(PostLikeEntity, { id: existing.id });
        await em.decrement(PostEntity, { id: postId }, 'likesCount', 1);
        await em.decrement(
          CosplayerProfileEntity,
          { userId: post.authorId },
          'totalLikesCount',
          1,
        );
        const updated = await em.findOneOrFail(PostEntity, {
          where: { id: postId },
        });
        const safeCount = Math.max(0, Number(updated.likesCount));
        if (Number(updated.likesCount) < 0) {
          await em.update(PostEntity, { id: postId }, { likesCount: 0 });
        }
        return { liked: false, likesCount: safeCount };
      } else {
        const like = em.create(PostLikeEntity, { userId, postId });
        await em.save(like);
        await em.increment(PostEntity, { id: postId }, 'likesCount', 1);
        await em.increment(
          CosplayerProfileEntity,
          { userId: post.authorId },
          'totalLikesCount',
          1,
        );
        const updated = await em.findOneOrFail(PostEntity, {
          where: { id: postId },
        });
        return {
          liked: true,
          likesCount: Math.max(0, Number(updated.likesCount)),
        };
      }
    });
  }

  // =================== COMMENTS ===================

  async findComments(
    postIdOrSlug: AutoIncrementID,
    query: QueryParams,
    currentUserId?: AutoIncrementID,
  ): Promise<Paginated<PostCommentResDto>> {
    let resolvedPostId = postIdOrSlug;
    if (!/^\d+$/.test(String(postIdOrSlug))) {
      const post = await this.postRepo.findOne({
        where: { slug: String(postIdOrSlug) },
      });
      resolvedPostId = (post ? post.id : '0') as unknown as AutoIncrementID;
    }

    const baseQb = this.commentRepo
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.author', 'author')
      .where('comment.postId = :postId', { postId: resolvedPostId });

    const paginated = await QueryBuilder.for(baseQb, query)
      .allowedSorts(['createdAt', 'likesCount'])
      .defaultSort('createdAt')
      .paginate();

    const commentIds = paginated.data.map((c) => c.id);
    let likedCommentIds = new Set<string>();

    if (currentUserId && commentIds.length > 0) {
      const likes = await this.commentLikeRepo.find({
        where: { userId: currentUserId, commentId: In(commentIds) },
      });
      likedCommentIds = new Set(likes.map((l) => String(l.commentId)));
    }

    const userIds = Array.from(new Set(paginated.data.map((c) => c.authorId)));
    const profiles =
      userIds.length > 0
        ? await this.profileRepo.find({ where: { userId: In(userIds) } })
        : [];
    const profileMap = new Map(profiles.map((p) => [String(p.userId), p]));

    const mapped = paginated.data.map((c) => {
      const profile = profileMap.get(String(c.authorId));
      return {
        id: c.id,
        postId: c.postId,
        userId: c.authorId,
        parentCommentId: c.parentId ?? null,
        content: c.content,
        likesCount: Number(c.likesCount || 0),
        author: {
          id: c.authorId,
          displayName:
            profile?.displayName || c.author?.fullName || `User #${c.authorId}`,
          handle: profile
            ? `@${profile.slug}`
            : c.author?.username
              ? `@${c.author.username}`
              : `@user${c.authorId}`,
          avatarUrl: profile?.avatarUrl ?? c.author?.avatar ?? null,
          isVerified: profile?.isVerified ?? false,
          role: c.author?.role,
        },
        isLikedByCurrentUser: likedCommentIds.has(String(c.id)),
        createdAt: c.createdAt,
      };
    });

    return new Paginated(mapped, paginated.meta, paginated.links);
  }

  async addComment(
    userId: AutoIncrementID,
    postId: AutoIncrementID,
    dto: CreatePostCommentReqDto,
  ): Promise<PostCommentResDto> {
    const post = await this.postRepo.findOne({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException(`Post #${postId} not found`);
    }

    const comment = this.commentRepo.create({
      postId,
      authorId: userId,
      content: dto.content,
      parentId: dto.parentCommentId ?? null,
      likesCount: 0,
    });

    const saved = await this.dataSource.transaction(async (em) => {
      const savedComment = await em.save(PostCommentEntity, comment);
      await em.increment(PostEntity, { id: postId }, 'commentsCount', 1);
      return savedComment;
    });

    const [user, profile] = await Promise.all([
      this.userRepo.findOne({ where: { id: userId } }),
      this.profileRepo.findOne({ where: { userId } }),
    ]);

    return {
      id: saved.id,
      postId: saved.postId,
      userId: saved.authorId,
      parentCommentId: saved.parentId ?? null,
      content: saved.content,
      likesCount: 0,
      author: {
        id: userId,
        displayName:
          profile?.displayName || user?.fullName || `User #${userId}`,
        handle: profile
          ? `@${profile.slug}`
          : user?.username
            ? `@${user.username}`
            : `@user${userId}`,
        avatarUrl: profile?.avatarUrl ?? user?.avatar ?? null,
        isVerified: profile?.isVerified ?? false,
        role: user?.role,
      },
      isLikedByCurrentUser: false,
      createdAt: saved.createdAt,
    };
  }

  async deleteComment(
    userId: AutoIncrementID,
    commentId: AutoIncrementID,
  ): Promise<void> {
    const comment = await this.commentRepo.findOne({
      where: { id: commentId },
    });
    if (!comment) {
      throw new NotFoundException(`Comment #${commentId} not found`);
    }
    if (String(comment.authorId) !== String(userId)) {
      throw new ForbiddenException(
        'You do not have permission to delete this comment',
      );
    }

    await this.dataSource.transaction(async (em) => {
      await em.delete(PostCommentEntity, { id: commentId });
      await em.decrement(
        PostEntity,
        { id: comment.postId },
        'commentsCount',
        1,
      );
    });
  }

  async toggleCommentLike(
    userId: AutoIncrementID,
    commentId: AutoIncrementID,
  ): Promise<{ liked: boolean; likesCount: number }> {
    const comment = await this.commentRepo.findOne({
      where: { id: commentId },
    });
    if (!comment) {
      throw new NotFoundException(`Comment #${commentId} not found`);
    }

    return await this.dataSource.transaction(async (em) => {
      const existing = await em.findOne(PostCommentLikeEntity, {
        where: { userId, commentId },
      });

      if (existing) {
        await em.delete(PostCommentLikeEntity, { id: existing.id });
        await em.decrement(
          PostCommentEntity,
          { id: commentId },
          'likesCount',
          1,
        );
        const updated = await em.findOneOrFail(PostCommentEntity, {
          where: { id: commentId },
        });
        const safeCount = Math.max(0, Number(updated.likesCount));
        if (Number(updated.likesCount) < 0) {
          await em.update(
            PostCommentEntity,
            { id: commentId },
            { likesCount: 0 },
          );
        }
        return { liked: false, likesCount: safeCount };
      } else {
        const like = em.create(PostCommentLikeEntity, { userId, commentId });
        await em.save(like);
        await em.increment(
          PostCommentEntity,
          { id: commentId },
          'likesCount',
          1,
        );
        const updated = await em.findOneOrFail(PostCommentEntity, {
          where: { id: commentId },
        });
        return {
          liked: true,
          likesCount: Math.max(0, Number(updated.likesCount)),
        };
      }
    });
  }

  // =================== MAPPERS ===================

  private async loadProfileMap(
    userIds: AutoIncrementID[],
  ): Promise<Map<string, CosplayerProfileEntity>> {
    if (userIds.length === 0) {
      return new Map();
    }
    const profiles = await this.profileRepo.find({
      where: { userId: In(userIds) },
    });
    return new Map(profiles.map((p) => [String(p.userId), p]));
  }

  private async loadMediaPreviewsByPostIds(
    postIds: AutoIncrementID[],
  ): Promise<Map<string, { previews: string[]; videoUrl: string | null }>> {
    const mediaByPostId = new Map<
      string,
      { previews: string[]; videoUrl: string | null }
    >();
    if (postIds.length === 0) {
      return mediaByPostId;
    }
    const mediaRows = await this.mediaRepo.find({
      where: { postId: In(postIds) },
      order: { sortOrder: 'ASC', id: 'ASC' },
    });
    for (const item of mediaRows) {
      const key = String(item.postId);
      const existing = mediaByPostId.get(key) ?? {
        previews: [],
        videoUrl: null,
      };
      if (item.mediaType === EMediaType.VIDEO) {
        if (!existing.videoUrl) {
          existing.videoUrl = item.url;
        }
      } else if (existing.previews.length < 4) {
        existing.previews.push(item.url);
      }
      mediaByPostId.set(key, existing);
    }
    return mediaByPostId;
  }

  private async loadTagsByPostIds(
    postIds: (AutoIncrementID | string)[],
  ): Promise<Map<string, string[]>> {
    const map = new Map<string, string[]>();
    if (!postIds || postIds.length === 0) return map;

    try {
      const entityTags = await this.entityTagRepo.find({
        where: {
          entityType: ETaggableEntityType.POST,
          entityId: In(postIds.map((id) => Number(id))),
        },
        relations: ['tag'],
        order: { sortOrder: 'ASC' },
      });

      for (const et of entityTags) {
        if (et.tag?.name) {
          const key = String(et.entityId);
          const existing = map.get(key) || [];
          existing.push(et.tag.name);
          map.set(key, existing);
        }
      }
    } catch {
      // Ignore if entity_tags table is not populated yet
    }
    return map;
  }

  private toSummaryDto(
    post: PostEntity,
    profile?: CosplayerProfileEntity | null,
    isLiked = false,
    previewUrls?: string[],
    isSaved = false,
    tagsFromManagement?: string[],
    videoUrl?: string | null,
  ): PostSummaryResDto {
    const collagePreviewUrls =
      previewUrls && previewUrls.length > 0
        ? previewUrls.slice(0, 4)
        : post.coverImageUrl
          ? [post.coverImageUrl]
          : [];
    const tagNamesCache = Array.from(
      new Set(
        [
          ...(tagsFromManagement || []),
          post.characterName,
          post.fandomName,
        ].filter(
          (v): v is string => typeof v === 'string' && v.trim().length > 0,
        ),
      ),
    );

    return {
      id: post.id,
      slug: post.slug,
      title: post.title,
      caption: post.caption ?? null,
      postType: post.postType,
      albumCategory: post.albumCategory,
      characterName: post.characterName ?? null,
      fandomName: post.fandomName ?? null,
      coverImageUrl: post.coverImageUrl,
      videoUrl: videoUrl ?? null,
      isCollage: collagePreviewUrls.length >= 2,
      collagePreviewUrls,
      tagNamesCache,
      collaborators: post.collaborators || [],
      isPublic: post.isPublic,
      status: post.status,
      isFeaturedWork: post.isFeaturedWork,
      photosCount: post.photosCount,
      likesCount: Number(post.likesCount || 0),
      commentsCount: Number(post.commentsCount || 0),
      savesCount: Number(post.savesCount || 0),
      sharesCount: Number(post.sharesCount || 0),
      viewsCount: Number(post.viewsCount || 0),
      trendingScore: Number(post.trendingScore || 0),
      publishedAt: post.publishedAt,
      author: {
        id: post.authorId,
        displayName:
          profile?.displayName ||
          post.author?.fullName ||
          `Author #${post.authorId}`,
        handle: profile
          ? `@${profile.slug}`
          : post.author?.username
            ? `@${post.author.username}`
            : `@author${post.authorId}`,
        avatarUrl: profile?.avatarUrl ?? post.author?.avatar ?? null,
        isVerified: profile?.isVerified ?? false,
        role: post.author?.role,
      },
      isLikedByCurrentUser: isLiked,
      isSavedByCurrentUser: isSaved,
    };
  }

  private toDetailDto(
    post: PostEntity,
    media: PostMediaEntity[],
    profile?: CosplayerProfileEntity | null,
    isLiked = false,
    isSaved = false,
    tagsFromManagement?: string[],
  ): PostDetailResDto {
    const previewUrls = media
      .filter((m) => m.mediaType !== EMediaType.VIDEO)
      .slice(0, 4)
      .map((m) => m.url);
    const videoUrl =
      media.find((m) => m.mediaType === EMediaType.VIDEO)?.url ?? null;
    return {
      ...this.toSummaryDto(
        post,
        profile,
        isLiked,
        previewUrls,
        isSaved,
        tagsFromManagement,
        videoUrl,
      ),
      enableWatermark: post.enableWatermark,
      cosplayerCharacterId: post.cosplayerCharacterId ?? null,
      characterTagId: post.characterTagId ?? null,
      copyrightTagId: post.copyrightTagId ?? null,
      media: media.map((m) => this.toMediaDto(m)),
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    };
  }

  private toMediaDto(m: PostMediaEntity): PostMediaResDto {
    return {
      id: m.id,
      postId: m.postId,
      fileId: m.fileId ?? null,
      mediaUrl: m.url,
      mediaType: m.mediaType,
      width: m.width ?? null,
      height: m.height ?? null,
      sortOrder: m.sortOrder,
      isCover: m.isCover,
      caption: m.altText ?? null,
    };
  }
}
