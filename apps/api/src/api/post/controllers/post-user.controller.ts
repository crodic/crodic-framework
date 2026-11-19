import { AutoIncrementID } from '../../../common/types/common.type';
import { CurrentUser } from '../../../decorators/current-user.decorator';
import { ApiAuth } from '../../../decorators/http.decorators';
import { UserAuthGuard } from '../../../guards/user-auth.guard';
import {
  Body,
  Controller,
  Delete,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import {
  CreatePostCommentReqDto,
  CreatePostReqDto,
  UpdatePostReqDto,
} from '../dto/post-req.dto';
import {
  PostCommentResDto,
  PostDetailResDto,
  ToggleLikeResDto,
} from '../dto/post-res.dto';
import { PostService } from '../services/post.service';

@ApiTags('User Posts & Social Interactions')
@Controller({ path: 'posts', version: '1' })
@UseGuards(UserAuthGuard)
export class PostUserController {
  constructor(private readonly postService: PostService) {}

  @Post()
  @ApiAuth({
    type: PostDetailResDto,
    summary: 'Publish new post or album from Studio Upload Form',
    statusCode: HttpStatus.CREATED,
  })
  create(
    @CurrentUser('id') authorId: AutoIncrementID,
    @Body() dto: CreatePostReqDto,
  ) {
    return this.postService.create(authorId, dto);
  }

  @Patch(':id')
  @ApiAuth({
    type: PostDetailResDto,
    summary: 'Update post content, media, or visibility',
  })
  @ApiParam({ name: 'id', type: String })
  update(
    @CurrentUser('id') authorId: AutoIncrementID,
    @Param('id') postId: AutoIncrementID,
    @Body() dto: UpdatePostReqDto,
  ) {
    return this.postService.update(authorId, postId, dto);
  }

  @Delete(':id')
  @ApiAuth({
    summary: 'Soft-delete a post',
    statusCode: HttpStatus.NO_CONTENT,
  })
  @ApiParam({ name: 'id', type: String })
  async delete(
    @CurrentUser('id') authorId: AutoIncrementID,
    @Param('id') postId: AutoIncrementID,
  ) {
    await this.postService.delete(authorId, postId);
  }

  @Post(':id/like')
  @ApiAuth({
    type: ToggleLikeResDto,
    summary: 'Toggle like on post',
  })
  @ApiParam({ name: 'id', type: String })
  toggleLike(
    @CurrentUser('id') userId: AutoIncrementID,
    @Param('id') postId: AutoIncrementID,
  ) {
    return this.postService.toggleLike(userId, postId);
  }

  @Post(':id/comments')
  @ApiAuth({
    type: PostCommentResDto,
    summary: 'Add a comment to post',
    statusCode: HttpStatus.CREATED,
  })
  @ApiParam({ name: 'id', type: String })
  addComment(
    @CurrentUser('id') userId: AutoIncrementID,
    @Param('id') postId: AutoIncrementID,
    @Body() dto: CreatePostCommentReqDto,
  ) {
    return this.postService.addComment(userId, postId, dto);
  }

  @Delete('comments/:commentId')
  @ApiAuth({
    summary: 'Delete own comment',
    statusCode: HttpStatus.NO_CONTENT,
  })
  @ApiParam({ name: 'commentId', type: String })
  async deleteComment(
    @CurrentUser('id') userId: AutoIncrementID,
    @Param('commentId') commentId: AutoIncrementID,
  ) {
    await this.postService.deleteComment(userId, commentId);
  }
}
