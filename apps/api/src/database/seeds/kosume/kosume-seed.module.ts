import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../../../api/user/entities/user.entity';
import { UserAccountEntity } from '../../../api/user/entities/user-account.entity';
import { CosplayerProfileEntity } from '../../../api/cosplayer/entities/cosplayer-profile.entity';
import { CosplayerServiceEntity } from '../../../api/cosplayer/entities/cosplayer-service.entity';
import { CosplayerCharacterEntity } from '../../../api/cosplayer/entities/cosplayer-character.entity';
import { PostEntity } from '../../../api/post/entities/post.entity';
import { PostMediaEntity } from '../../../api/post/entities/post-media.entity';
import { PostLikeEntity } from '../../../api/post/entities/post-like.entity';
import { PostCommentEntity } from '../../../api/post/entities/post-comment.entity';
import { UserFollowEntity } from '../../../api/social/entities/user-follow.entity';
import { CollectionEntity } from '../../../api/collection/entities/collection.entity';
import { CollectionItemEntity } from '../../../api/collection/entities/collection-item.entity';
import { BrandEntity } from '../../../api/brand/entities/brand.entity';
import { JobEntity } from '../../../api/job/entities/job.entity';
import { EventEntity } from '../../../api/event/entities/event.entity';
import { EventParticipantEntity } from '../../../api/event/entities/event-participant.entity';
import { SpotlightBannerEntity } from '../../../api/spotlight/entities/spotlight-banner.entity';
import { LeaderboardSnapshotEntity } from '../../../api/ranking/entities/leaderboard-snapshot.entity';
import { NotificationEntity } from '../../../api/notification/entities/notification.entity';
import { FileEntity } from '../../../api/file/entities/file.entity';
import { FileFolderEntity } from '../../../api/file/entities/file-folder.entity';
import { KosumeSeedService } from './kosume-seed.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FileEntity,
      FileFolderEntity,
      UserEntity,
      UserAccountEntity,
      CosplayerProfileEntity,
      CosplayerServiceEntity,
      CosplayerCharacterEntity,
      PostEntity,
      PostMediaEntity,
      PostLikeEntity,
      PostCommentEntity,
      UserFollowEntity,
      CollectionEntity,
      CollectionItemEntity,
      BrandEntity,
      JobEntity,
      EventEntity,
      EventParticipantEntity,
      SpotlightBannerEntity,
      LeaderboardSnapshotEntity,
      NotificationEntity,
    ]),
  ],
  providers: [KosumeSeedService],
  exports: [KosumeSeedService],
})
export class KosumeSeedModule {}
