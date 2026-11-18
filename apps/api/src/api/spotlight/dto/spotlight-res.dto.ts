import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AutoIncrementID } from '../../../common/types/common.type';

export class SpotlightBannerResDto {
  @ApiProperty({ type: String, example: '1' })
  id!: AutoIncrementID;

  @ApiProperty({ example: 'KIRIKO' })
  name!: string;

  @ApiProperty({ example: true })
  isVerified!: boolean;

  @ApiProperty({ example: 'TOP 1 COSPLAYER THÁNG 10' })
  badge!: string;

  @ApiProperty({
    example:
      'Chuyên nghiệp hoá đam mê cosplay - Hóa thân hơn 50+ nhân vật Anime & Game',
  })
  tagline!: string;

  @ApiProperty({
    example:
      'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1600',
  })
  bannerImageUrl!: string;

  @ApiProperty({ example: '/cosplayer/kiriko-cos' })
  portfolioHref!: string;

  @ApiProperty({ example: 1 })
  sortOrder!: number;

  @ApiProperty({ type: String, example: '100' })
  cosplayerUserId!: AutoIncrementID;

  @ApiProperty()
  createdAt!: Date;
}

export class SpotlightBannerAdminResDto extends SpotlightBannerResDto {
  @ApiProperty({ example: true })
  isActive!: boolean;

  @ApiPropertyOptional({ type: String, example: '50' })
  bannerFileId?: AutoIncrementID | null;

  @ApiProperty()
  updatedAt!: Date;
}
