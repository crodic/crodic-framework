import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AutoIncrementID } from '../../../common/types/common.type';

export class CosplayerCharacterResDto {
  @ApiProperty({ type: String, example: '1' })
  id!: AutoIncrementID;

  @ApiProperty({ type: String, example: '1' })
  userId!: AutoIncrementID;

  @ApiProperty({ example: 'Raiden Shogun' })
  characterName!: string;

  @ApiProperty({ example: 'Genshin Impact' })
  seriesName!: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  characterTagId?: AutoIncrementID | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  copyrightTagId?: AutoIncrementID | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  coverFileId?: AutoIncrementID | null;

  @ApiProperty({
    example:
      'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800',
  })
  coverImageUrl!: string;

  @ApiProperty({ example: 4 })
  albumsCount!: number;

  @ApiProperty({ example: 28 })
  photosCount!: number;

  @ApiProperty({ example: 0 })
  sortOrder!: number;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

export class CosplayerSummaryResDto {
  @ApiProperty({ type: String, example: '1' })
  id!: AutoIncrementID;

  @ApiProperty({ type: String, example: '1' })
  userId!: AutoIncrementID;

  @ApiProperty({ example: 'kiriko-cos' })
  slug!: string;

  @ApiProperty({ example: 'KIRIKO' })
  displayName!: string;

  @ApiProperty({ example: '@kirikocos' })
  handle!: string;

  @ApiProperty({ example: 'Cosplayer Chuyên Nghiệp' })
  roleBadge!: string;

  @ApiPropertyOptional({ example: 'Cosplayer & Props Maker tại Hà Nội' })
  tagline?: string | null;

  @ApiPropertyOptional({
    example:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500',
  })
  avatarUrl?: string | null;

  @ApiPropertyOptional({
    example:
      'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1600',
  })
  coverUrl?: string | null;

  @ApiPropertyOptional({ example: 'Hà Nội & Toàn quốc' })
  locationLabel?: string | null;

  @ApiPropertyOptional({ example: 'Toàn quốc' })
  workArea?: string | null;

  @ApiProperty({ example: true })
  isVerified!: boolean;

  @ApiProperty({ example: false })
  isCraftingCreator!: boolean;

  @ApiProperty({ example: 12450 })
  followersCount!: number;

  @ApiProperty({ example: 98200 })
  totalLikesCount!: number;

  @ApiProperty({ example: 12 })
  albumsCount!: number;

  @ApiProperty({ example: 8 })
  charactersCount!: number;

  @ApiProperty({ example: 98.5 })
  rankingScore!: number;

  @ApiProperty({
    type: [String],
    example: ['Genshin Impact', 'Honkai: Star Rail'],
  })
  specialties!: string[];

  @ApiProperty()
  createdAt!: Date;
}

export class CosplayerPhysicalStatsResDto {
  @ApiPropertyOptional({ example: 165 })
  heightCm?: number | null;

  @ApiPropertyOptional({ example: '1m65' })
  heightLabel?: string | null;

  @ApiPropertyOptional({ example: 6 })
  experienceYearsNum?: number | null;

  @ApiPropertyOptional({ example: '6 năm kinh nghiệm' })
  experienceLabel?: string | null;
}

export class CosplayerSocialLinksResDto {
  @ApiPropertyOptional({ example: 'https://facebook.com/kiriko' })
  facebookUrl?: string | null;

  @ApiPropertyOptional({ example: 'https://instagram.com/kiriko' })
  instagramUrl?: string | null;

  @ApiPropertyOptional({ example: 'https://tiktok.com/@kiriko' })
  tiktokUrl?: string | null;

  @ApiPropertyOptional({ example: 'https://twitter.com/kiriko' })
  twitterUrl?: string | null;
}

export class CosplayerDetailResDto extends CosplayerSummaryResDto {
  @ApiPropertyOptional({
    example:
      'Cosplayer & Props Maker tại Hà Nội. Đam mê biến các nhân vật fantasy thành hiện thực.',
  })
  bio?: string | null;

  @ApiPropertyOptional({
    example: 'Khởi đầu từ 2018 với các bộ cánh tự may...',
  })
  artisticBio?: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  cityId?: AutoIncrementID | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  countryId?: AutoIncrementID | null;

  @ApiPropertyOptional({ example: 165 })
  heightCm?: number | null;

  @ApiPropertyOptional({ example: '1m65' })
  heightLabel?: string | null;

  @ApiPropertyOptional({ example: 6 })
  experienceYearsNum?: number | null;

  @ApiPropertyOptional({ example: '6 năm kinh nghiệm' })
  experienceLabel?: string | null;

  @ApiPropertyOptional({ type: () => CosplayerPhysicalStatsResDto })
  stats?: CosplayerPhysicalStatsResDto;

  @ApiPropertyOptional({ type: () => CosplayerSocialLinksResDto })
  socialLinks?: CosplayerSocialLinksResDto;

  @ApiProperty({
    type: [String],
    example: ['Chế tác trang phục', 'Make-up biến hóa'],
  })
  skills!: string[];

  @ApiProperty({
    type: [String],
    example: ['Top 1 Vietnam Cosplay Contest 2024'],
  })
  awardsBadges!: string[];

  @ApiPropertyOptional({ example: 'kiriko.cosplay@example.com' })
  contactEmail?: string | null;

  @ApiPropertyOptional({ example: '0987654321' })
  contactPhone?: string | null;

  @ApiPropertyOptional({ example: 'https://facebook.com/kiriko.cosplay' })
  facebookUrl?: string | null;

  @ApiPropertyOptional({ example: 'https://instagram.com/kiriko.cos' })
  instagramUrl?: string | null;

  @ApiPropertyOptional({ example: 'https://tiktok.com/@kiriko.cos' })
  tiktokUrl?: string | null;

  @ApiPropertyOptional({ example: 'https://twitter.com/kirikocos' })
  twitterUrl?: string | null;

  @ApiProperty({ example: 250 })
  followingCount!: number;

  @ApiProperty({ example: 5 })
  collectionsCount!: number;

  @ApiProperty({ type: () => [CosplayerCharacterResDto] })
  characters!: CosplayerCharacterResDto[];

  @ApiPropertyOptional({ example: false })
  cosplayerRequestPending?: boolean;

  @ApiProperty()
  updatedAt!: Date;
}
