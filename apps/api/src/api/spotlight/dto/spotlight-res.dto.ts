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

  @ApiPropertyOptional({ example: '/booking?cosplayer=kiriko' })
  bookingHref?: string | null;

  @ApiProperty({ example: 1 })
  sortOrder!: number;

  @ApiPropertyOptional({ type: String, example: '100' })
  cosplayerUserId?: AutoIncrementID | null;

  @ApiProperty()
  createdAt!: Date;
}
