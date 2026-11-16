import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AutoIncrementID } from '../../../common/types/common.type';

export class FollowToggleResDto {
  @ApiProperty({ example: true })
  following!: boolean;

  @ApiProperty({ example: 48201 })
  followersCount!: number;
}

export class FollowStatusResDto {
  @ApiProperty({ example: true })
  isFollowing!: boolean;
}

export class FollowUserResDto {
  @ApiProperty({ type: String, example: '100' })
  id!: AutoIncrementID;

  @ApiProperty({ example: 'Kiriko' })
  displayName!: string;

  @ApiPropertyOptional({ example: 'kiriko-cos' })
  handle?: string | null;

  @ApiPropertyOptional({
    example:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
  })
  avatarUrl?: string | null;

  @ApiProperty()
  followedAt!: Date;
}
