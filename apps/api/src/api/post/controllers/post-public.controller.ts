import { AllowedFilter, QueryParams } from '../../../common/query-builder';
import { CurrentUser } from '../../../decorators/current-user.decorator';
import { ApiAuthOptional } from '../../../decorators/http.decorators';
import { AutoIncrementID } from '../../../common/types/common.type';
import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { UserAuthGuard } from '../../../guards/user-auth.guard';
import {
  PostCommentResDto,
  PostDetailResDto,
  PostSummaryResDto,
} from '../dto/post-res.dto';
import { PostService } from '../services/post.service';

@ApiTags('Public Posts & Studio Feed')
@Controller({ path: 'public/posts', version: '1' })
@UseGuards(UserAuthGuard)
export class PostPublicController {
  constructor(private readonly postService: PostService) {}

  @Get()
  @ApiAuthOptional({
    type: PostSummaryResDto,
    summary: 'Browse and search posts / studio albums feed',
    isQueryBuilder: true,
    queryBuilderOptions: {
      filters: [
        'title',
        'characterName',
        'fandomName',
        'search',
        AllowedFilter.exact('postType'),
        AllowedFilter.exact('albumCategory'),
        AllowedFilter.exact('authorId'),
        AllowedFilter.exact('isPublic'),
        AllowedFilter.exact('status'),
        AllowedFilter.exact('isFeaturedWork'),
        AllowedFilter.exact('copyrightTagId'),
        AllowedFilter.exact('characterTagId'),
      ],
      sorts: [
        'publishedAt',
        'trendingScore',
        'likesCount',
        'viewsCount',
        'commentsCount',
        'createdAt',
      ],
      defaultSort: '-publishedAt',
    },
  })
  findAll(
    @Query() query: QueryParams,
    @CurrentUser('id') currentUserId?: AutoIncrementID,
  ) {
    return this.postService.findAll(query, currentUserId);
  }

  @Get(':slug')
  @ApiAuthOptional({
    type: PostDetailResDto,
    summary: 'Get full post details by slug (includes media array and author)',
  })
  @ApiParam({
    name: 'slug',
    type: String,
    example: 'acheron-loi-than-khoi-nguyen',
  })
  findBySlug(
    @Param('slug') slug: string,
    @CurrentUser('id') currentUserId?: AutoIncrementID,
  ) {
    return this.postService.findBySlug(slug, currentUserId);
  }

  @Get(':id/comments')
  @ApiAuthOptional({
    type: PostCommentResDto,
    summary: 'Get paginated comments for a post',
    isQueryBuilder: true,
    queryBuilderOptions: {
      sorts: ['createdAt', 'likesCount'],
      defaultSort: 'createdAt',
    },
  })
  @ApiParam({ name: 'id', type: String })
  findComments(
    @Param('id') postId: AutoIncrementID,
    @Query() query: QueryParams,
    @CurrentUser('id') currentUserId?: AutoIncrementID,
  ) {
    return this.postService.findComments(postId, query, currentUserId);
  }
}
