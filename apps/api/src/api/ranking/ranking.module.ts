import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RankingPublicController } from './controllers/ranking-public.controller';
import { LeaderboardSnapshotEntity } from './entities/leaderboard-snapshot.entity';
import { RankingService } from './services/ranking.service';

@Module({
  imports: [TypeOrmModule.forFeature([LeaderboardSnapshotEntity])],
  controllers: [RankingPublicController],
  providers: [RankingService],
  exports: [TypeOrmModule, RankingService],
})
export class RankingModule {}
