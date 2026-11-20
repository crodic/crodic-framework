import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CosplayerProfileEntity } from '../cosplayer/entities/cosplayer-profile.entity';
import { UserEntity } from '../user/entities/user.entity';
import { PostEntity } from '../post/entities/post.entity';
import { UserFollowEntity } from '../social/entities/user-follow.entity';
import { RankingPublicController } from './controllers/ranking-public.controller';
import { RankingAdminController } from './controllers/ranking-admin.controller';
import { LeaderboardSnapshotEntity } from './entities/leaderboard-snapshot.entity';
import { RankingService } from './services/ranking.service';
import { RankingCronService } from './services/ranking-cron.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LeaderboardSnapshotEntity,
      CosplayerProfileEntity,
      UserEntity,
      PostEntity,
      UserFollowEntity,
    ]),
  ],
  controllers: [RankingPublicController, RankingAdminController],
  providers: [RankingService, RankingCronService],
  exports: [TypeOrmModule, RankingService],
})
export class RankingModule {}
