import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AutoIncrementID } from '../../../common/types/common.type';
import {
  ERankingFilterCategory,
  ERankingTrend,
} from '../constants/ranking.constant';

export class LeaderboardItemResDto {
  @ApiProperty({ type: String, example: '1' })
  id!: AutoIncrementID;

  @ApiProperty({ example: 1 })
  rank!: number;

  @ApiPropertyOptional({ example: 2 })
  previousRank?: number | null;

  @ApiProperty({ enum: ERankingTrend, example: ERankingTrend.UP })
  trend!: ERankingTrend;

  @ApiProperty({ type: String, example: '100' })
  userId!: AutoIncrementID;

  @ApiPropertyOptional({ type: String, example: '1' })
  postId?: AutoIncrementID | null;

  @ApiProperty({ example: 'KIRIKO' })
  displayName!: string;

  @ApiProperty({ example: 'kiriko-cos' })
  handle!: string;

  @ApiProperty({ example: 'Pro Cosplayer' })
  roleLabel!: string;

  @ApiProperty({
    example:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
  })
  avatarUrl!: string;

  @ApiProperty({ example: true })
  isVerified!: boolean;

  @ApiProperty({ example: 14500 })
  likesCount!: number;

  @ApiProperty({ example: 48200 })
  followersCount!: number;

  @ApiProperty({ example: 98.5 })
  score!: number;

  @ApiProperty({ type: [String], example: ['Acheron', 'Raiden Shogun'] })
  featuredProjects!: string[];

  @ApiProperty({ example: '/cosplayer/kiriko-cos' })
  portfolioHref!: string;

  @ApiProperty({
    enum: ERankingFilterCategory,
    example: ERankingFilterCategory.MONTH,
  })
  filterCategory!: ERankingFilterCategory;

  @ApiProperty({ example: '2024-10' })
  periodKey!: string;
}
