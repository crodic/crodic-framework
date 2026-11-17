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
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Brackets, DataSource, In, Repository } from 'typeorm';
import { UserEntity } from '../../user/entities/user.entity';
import { CosplayerProfileEntity } from '../../cosplayer/entities/cosplayer-profile.entity';
import { EPostStatus } from '../constants/post.constant';
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
      .leftJoinAndSelect('post.author', 'author');

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
                })
                .orWhere('post.tagNamesCache::text ILIKE :sTerm', {
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

    if (currentUserId && postIds.length > 0) {
      const likes = await this.likeRepo.find({
        where: { userId: currentUserId, postId: In(postIds) },
      });
      likedPostIds = new Set(likes.map((l) => String(l.postId)));
    }

    // Load author profiles for avatar & badges
    const authorIds = Array.from(
      new Set(paginated.data.map((p) => p.authorId)),
    );
    const profiles =
      authorIds.length > 0
        ? await this.profileRepo.find({ where: { userId: In(authorIds) } })
        : [];
    const profileMap = new Map(profiles.map((p) => [String(p.userId), p]));

    const mapped = paginated.data.map((post) => {
      const profile = profileMap.get(String(post.authorId));
      return this.toSummaryDto(
        post,
        profile,
        likedPostIds.has(String(post.id)),
      );
    });

    return new Paginated(mapped, paginated.meta, paginated.links);
  }

  /**
   * Find post detail by slug.
   */
  async findBySlug(
    slug: string,
    currentUserId?: AutoIncrementID,
  ): Promise<PostDetailResDto> {
    const post = await this.postRepo.findOne({
      where: { slug },
      relations: ['author'],
    });

    if (!post) {
      throw new NotFoundException(`Post "${slug}" not found`);
    }

    // Increment views count asynchronously
    this.postRepo
      .increment({ id: post.id }, 'viewsCount', 1)
      .catch(() => undefined);

    const [mediaList, profile, likeRecord] = await Promise.all([
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
    ]);

    return this.toDetailDto(post, mediaList, profile, Boolean(likeRecord));
  }

  /**
   * Create post / studio album.
   */
  async create(
    authorId: AutoIncrementID,
    dto: CreatePostReqDto,
  ): Promise<PostDetailResDto> {
    let slugCandidate = slugify(dto.title);
    if (!slugCandidate) {
      slugCandidate = `post-${Date.now().toString(36)}`;
    }
    const slugCollision = await this.postRepo.count({
      where: { slug: slugCandidate },
    });
    if (slugCollision > 0) {
      slugCandidate = `${slugCandidate}-${Date.now().toString(36).slice(-4)}`;
    }

    return await this.dataSource.transaction(async (em) => {
      const post = em.create(PostEntity, {
        authorId,
        slug: slugCandidate,
        title: dto.title,
        caption: dto.caption ?? null,
        postType: dto.postType,
        albumCategory: dto.albumCategory,
        albumCategoryLabel: dto.albumCategoryLabel ?? null,
        characterName: dto.characterName ?? null,
        fandomName: dto.fandomName ?? null,
        cosplayerCharacterId: dto.cosplayerCharacterId ?? null,
        characterTagId: dto.characterTagId ?? null,
        copyrightTagId: dto.copyrightTagId ?? null,
        coverImageUrl: dto.coverImageUrl,
        isCollage: dto.isCollage ?? false,
        collagePreviewUrls:
          dto.collagePreviewUrls ||
          dto.media?.slice(0, 4).map((m) => m.mediaUrl) ||
          [],
        tagNamesCache: dto.tagNamesCache || [],
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

      const profile = await em.findOne(CosplayerProfileEntity, {
        where: { userId: authorId },
      });
      return this.toDetailDto(savedPost, savedMedia, profile, false);
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
      if (dto.albumCategoryLabel !== undefined)
        post.albumCategoryLabel = dto.albumCategoryLabel;
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
      if (dto.isCollage !== undefined) post.isCollage = dto.isCollage;
      if (dto.collagePreviewUrls !== undefined)
        post.collagePreviewUrls = dto.collagePreviewUrls;
      if (dto.tagNamesCache !== undefined)
        post.tagNamesCache = dto.tagNamesCache;
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

      const [mediaList, profile] = await Promise.all([
        em.find(PostMediaEntity, {
          where: { postId },
          order: { sortOrder: 'ASC', id: 'ASC' },
        }),
        em.findOne(CosplayerProfileEntity, { where: { userId: authorId } }),
      ]);

      return this.toDetailDto(savedPost, mediaList, profile, false);
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
        return { liked: false, likesCount: Number(updated.likesCount) };
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
        return { liked: true, likesCount: Number(updated.likesCount) };
      }
    });
  }

  // =================== COMMENTS ===================

  async findComments(
    postId: AutoIncrementID,
    query: QueryParams,
    currentUserId?: AutoIncrementID,
  ): Promise<Paginated<PostCommentResDto>> {
    const baseQb = this.commentRepo
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.author', 'author')
      .where('comment.postId = :postId', { postId });

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
          handle: profile?.handle || `@user${c.authorId}`,
          avatarUrl: profile?.avatarUrl ?? null,
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

    const saved = await this.commentRepo.save(comment);
    await this.postRepo.increment({ id: postId }, 'commentsCount', 1);

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
        handle: profile?.handle || `@user${userId}`,
        avatarUrl: profile?.avatarUrl ?? null,
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

    await this.commentRepo.delete({ id: commentId });
    await this.postRepo.decrement({ id: comment.postId }, 'commentsCount', 1);
  }

  // =================== MAPPERS ===================

  private toSummaryDto(
    post: PostEntity,
    profile?: CosplayerProfileEntity | null,
    isLiked = false,
  ): PostSummaryResDto {
    return {
      id: post.id,
      slug: post.slug,
      title: post.title,
      caption: post.caption ?? null,
      postType: post.postType,
      albumCategory: post.albumCategory,
      albumCategoryLabel: post.albumCategoryLabel ?? null,
      characterName: post.characterName ?? null,
      fandomName: post.fandomName ?? null,
      coverImageUrl: post.coverImageUrl,
      isCollage: post.isCollage,
      collagePreviewUrls: post.collagePreviewUrls || [],
      tagNamesCache: post.tagNamesCache || [],
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
        handle: profile?.handle || `@author${post.authorId}`,
        avatarUrl: profile?.avatarUrl ?? null,
        isVerified: profile?.isVerified ?? false,
        role: post.author?.role,
      },
      isLikedByCurrentUser: isLiked,
      isSavedByCurrentUser: false,
    };
  }

  private toDetailDto(
    post: PostEntity,
    media: PostMediaEntity[],
    profile?: CosplayerProfileEntity | null,
    isLiked = false,
  ): PostDetailResDto {
    return {
      ...this.toSummaryDto(post, profile, isLiked),
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
