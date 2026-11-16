import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AutoIncrementID } from '../../../common/types/common.type';

export class BrandResDto {
  @ApiProperty({ type: String, example: '1' })
  id!: AutoIncrementID;

  @ApiProperty({ type: String, example: '100' })
  ownerUserId!: AutoIncrementID;

  @ApiProperty({ example: 'HoYoverse' })
  name!: string;

  @ApiProperty({ example: 'hoyoverse' })
  slug!: string;

  @ApiPropertyOptional({ example: 'HYV' })
  initials?: string | null;

  @ApiPropertyOptional({ example: 'bg-primary' })
  color?: string | null;

  @ApiPropertyOptional({
    example:
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200',
  })
  logoUrl?: string | null;

  @ApiPropertyOptional({
    example:
      'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200',
  })
  coverUrl?: string | null;

  @ApiPropertyOptional({ example: 'Tech Otakus Save the World' })
  tagline?: string | null;

  @ApiPropertyOptional({ example: 'Global interactive entertainment brand' })
  description?: string | null;

  @ApiPropertyOptional({ example: 'https://hoyoverse.com' })
  websiteUrl?: string | null;

  @ApiProperty({ example: 'contact@hoyoverse.com' })
  contactEmail!: string;

  @ApiPropertyOptional({ example: '028 1234 5678' })
  contactPhone?: string | null;

  @ApiProperty({ example: true })
  isVerified!: boolean;

  @ApiProperty()
  createdAt!: Date;
}
