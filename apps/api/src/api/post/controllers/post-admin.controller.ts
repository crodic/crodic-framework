import { AllowedFilter, QueryParams } from '../../../common/query-builder';
import { AutoIncrementID } from '../../../common/types/common.type';
import { ApiAuth } from '../../../decorators/http.decorators';
import { CheckPolicies } from '../../../decorators/policies.decorator';
import { AdminAuthGuard } from '../../../guards/admin-auth.guard';
import { PoliciesGuard } from '../../../guards/policies.guard';
import { AppAbility } from '../../../shared/casl/ability.factory';
import { AppActions, AppSubjects } from '../../../utils/permissions.constant';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import {
  TogglePostFeaturedReqDto,
  UpdatePostStatusReqDto,
} from '../dto/post-req.dto';
import { PostDetailResDto, PostSummaryResDto } from '../dto/post-res.dto';
import { PostService } from '../services/post.service';

@ApiTags('Admin Posts & Studio Feeds')
@Controller({ path: 'admin/posts', version: '1' })
@UseGuards(AdminAuthGuard, PoliciesGuard)
export class PostAdminController {
  constructor(private readonly postService: PostService) {}

  @Get()
  @ApiAuth({
    type: PostSummaryResDto,
    summary: 'List all posts/albums with filtering for Admin',
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
        'id',
        'title',
        'status',
        'publishedAt',
        'createdAt',
        'trendingScore',
        'likesCount',
        'viewsCount',
        'commentsCount',
        'photosCount',
      ],
      defaultSort: '-createdAt',
    },
  })
  @CheckPolicies((ability: AppAbility) =>
    ability.can(AppActions.Read, AppSubjects.Post),
  )
  findAll(@Query() query: QueryParams) {
    return this.postService.findAllAdmin(query);
  }

  @Get(':id')
  @ApiAuth({
    type: PostDetailResDto,
    summary: 'Get full post details including media list and tags',
  })
  @ApiParam({ name: 'id', type: String })
  @CheckPolicies((ability: AppAbility) =>
    ability.can(AppActions.Read, AppSubjects.Post),
  )
  findOne(@Param('id') id: AutoIncrementID) {
    return this.postService.findOneAdmin(id);
  }

  @Patch(':id/feature')
  @ApiAuth({
    type: PostDetailResDto,
    summary: 'Toggle featured work spotlight placement',
  })
  @ApiParam({ name: 'id', type: String })
  @CheckPolicies((ability: AppAbility) =>
    ability.can(AppActions.Publish, AppSubjects.Post),
  )
  toggleFeature(
    @Param('id') id: AutoIncrementID,
    @Body() dto: TogglePostFeaturedReqDto,
  ) {
    return this.postService.toggleFeatureAdmin(id, dto.isFeatured);
  }

  @Patch(':id/status')
  @ApiAuth({
    type: PostDetailResDto,
    summary: 'Update post moderation status and visibility',
  })
  @ApiParam({ name: 'id', type: String })
  @CheckPolicies((ability: AppAbility) =>
    ability.can(AppActions.Update, AppSubjects.Post),
  )
  updateStatus(
    @Param('id') id: AutoIncrementID,
    @Body() dto: UpdatePostStatusReqDto,
  ) {
    return this.postService.updateStatusAdmin(id, dto.status, dto.isPublic);
  }

  @Delete(':id')
  @ApiAuth({
    summary: 'Soft-delete an infringing or inappropriate post',
    statusCode: HttpStatus.NO_CONTENT,
  })
  @ApiParam({ name: 'id', type: String })
  @CheckPolicies((ability: AppAbility) =>
    ability.can(AppActions.Delete, AppSubjects.Post),
  )
  async delete(@Param('id') id: AutoIncrementID) {
    await this.postService.deleteAdmin(id);
  }
}
