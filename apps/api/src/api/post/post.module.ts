import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CosplayerCharacterEntity } from '../cosplayer/entities/cosplayer-character.entity';
import { CosplayerProfileEntity } from '../cosplayer/entities/cosplayer-profile.entity';
import { EntityTagEntity } from '../tag/entities/entity-tag.entity';
import { TagModule } from '../tag/tag.module';
import { UserEntity } from '../user/entities/user.entity';
import { AdminUserEntity } from '../admin-user/entities/admin-user.entity';
import { NotificationEntity } from '../notification/entities/notification.entity';
import { EmailQueueModule } from '../../background/queues/email-queue/email-queue.module';
import { PostAdminController } from './controllers/post-admin.controller';
import { PostPublicController } from './controllers/post-public.controller';
import { PostUserController } from './controllers/post-user.controller';
import { PostCommentLikeEntity } from './entities/post-comment-like.entity';
import { PostCommentEntity } from './entities/post-comment.entity';
import { PostLikeEntity } from './entities/post-like.entity';
import { PostMediaEntity } from './entities/post-media.entity';
import { PostEntity } from './entities/post.entity';
import { PostService } from './services/post.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PostEntity,
      PostMediaEntity,
      PostLikeEntity,
      PostCommentEntity,
      PostCommentLikeEntity,
      UserEntity,
      CosplayerProfileEntity,
      CosplayerCharacterEntity,
      EntityTagEntity,
      NotificationEntity,
      AdminUserEntity,
    ]),
    TagModule,
    EmailQueueModule,
  ],
  controllers: [PostPublicController, PostUserController, PostAdminController],
  providers: [PostService],
  exports: [TypeOrmModule, PostService],
})
export class PostModule {}
