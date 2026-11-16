import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostEntity } from './entities/post.entity';
import { PostMediaEntity } from './entities/post-media.entity';
import { PostLikeEntity } from './entities/post-like.entity';
import { PostCommentEntity } from './entities/post-comment.entity';
import { PostCommentLikeEntity } from './entities/post-comment-like.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PostEntity,
      PostMediaEntity,
      PostLikeEntity,
      PostCommentEntity,
      PostCommentLikeEntity,
    ]),
  ],
  exports: [TypeOrmModule],
})
export class PostModule {}
