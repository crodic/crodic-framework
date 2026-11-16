import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeaderboardSnapshotEntity } from './entities/leaderboard-snapshot.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LeaderboardSnapshotEntity])],
  exports: [TypeOrmModule],
})
export class RankingModule {}
