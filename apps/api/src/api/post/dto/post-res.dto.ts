import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AutoIncrementID } from '../../../common/types/common.type';
import {
  EAlbumCategory,
  EMediaType,
  EPostCollaboratorRole,
  EPostStatus,
  EPostType,
} from '../constants/post.constant';

export class PostCollaboratorResDto {
  @ApiProperty({
    enum: EPostCollaboratorRole,
    example: EPostCollaboratorRole.PHOTOGRAPHER,
  })
  role!: EPostCollaboratorRole;

  @ApiProperty({ example: 'Neko Studio' })
  name!: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  userId?: AutoIncrementID | null;

  @ApiPropertyOptional({ nullable: true })
  socialUrl?: string | null;
}

export class PostMediaResDto {
  @ApiProperty({ type: String, example: '1' })
  id!: AutoIncrementID;

  @ApiProperty({ type: String, example: '1' })
  postId!: AutoIncrementID;

  @ApiPropertyOptional({ type: String, nullable: true })
  fileId?: AutoIncrementID | null;

  @ApiProperty({
    example:
      'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1200',
  })
  mediaUrl!: string;

  @ApiProperty({ enum: EMediaType, example: EMediaType.IMAGE })
  mediaType!: EMediaType;

  @ApiPropertyOptional({ example: 1920 })
  width?: number | null;

  @ApiPropertyOptional({ example: 1080 })
  height?: number | null;

  @ApiProperty({ example: 0 })
  sortOrder!: number;

  @ApiProperty({ example: true })
  isCover!: boolean;

  @ApiPropertyOptional({ example: 'Cosplay concept studio' })
  caption?: string | null;
}

export class PostAuthorSummaryDto {
  @ApiProperty({ type: String, example: '1' })
  id!: AutoIncrementID;

  @ApiProperty({ example: 'KIRIKO' })
  displayName!: string;

  @ApiProperty({ example: '@kirikocos' })
  handle!: string;

  @ApiPropertyOptional({
    example:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500',
  })
  avatarUrl?: string | null;

  @ApiProperty({ example: true })
  isVerified!: boolean;
}

export class PostSummaryResDto {
  @ApiProperty({ type: String, example: '1' })
  id!: AutoIncrementID;

  @ApiProperty({ example: 'acheron-loi-than-khoi-nguyen' })
  slug!: string;

  @ApiProperty({ example: 'Acheron - Lôi Thần Khởi Nguyên' })
  title!: string;

  @ApiPropertyOptional({
    example:
      'Photoset cosplay Acheron từ Honkai: Star Rail thực hiện tại Studio Galaxy...',
  })
  caption?: string | null;

  @ApiProperty({ enum: EPostType, example: EPostType.PHOTOSET })
  postType!: EPostType;

  @ApiProperty({ enum: EAlbumCategory, example: EAlbumCategory.SERIES })
  albumCategory!: EAlbumCategory;

  @ApiPropertyOptional({ example: 'Acheron' })
  characterName?: string | null;

  @ApiPropertyOptional({ example: 'Honkai: Star Rail' })
  fandomName?: string | null;

  @ApiProperty({
    example:
      'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1200',
  })
  coverImageUrl!: string;

  @ApiPropertyOptional({
    example: 'https://cdn.example.com/posts/video-short.mp4',
    nullable: true,
  })
  videoUrl?: string | null;

  @ApiProperty({ example: false })
  isCollage!: boolean;

  @ApiProperty({
    type: [String],
    example: [
      'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600',
    ],
  })
  collagePreviewUrls!: string[];

  @ApiProperty({
    type: [String],
    example: ['Acheron', 'HonkaiStarRail', 'CosplayVN'],
  })
  tagNamesCache!: string[];

  @ApiPropertyOptional({ type: () => [PostCollaboratorResDto] })
  collaborators?: PostCollaboratorResDto[];

  @ApiProperty({ example: true })
  isPublic!: boolean;

  @ApiProperty({ enum: EPostStatus, example: EPostStatus.PUBLISHED })
  status!: EPostStatus;

  @ApiProperty({ example: false })
  isFeaturedWork!: boolean;

  @ApiProperty({ example: 4 })
  photosCount!: number;

  @ApiProperty({ example: 1250 })
  likesCount!: number;

  @ApiProperty({ example: 42 })
  commentsCount!: number;

  @ApiProperty({ example: 89 })
  savesCount!: number;

  @ApiProperty({ example: 15 })
  sharesCount!: number;

  @ApiProperty({ example: 5400 })
  viewsCount!: number;

  @ApiProperty({ example: 95.4 })
  trendingScore!: number;

  @ApiProperty()
  publishedAt!: Date;

  @ApiProperty({ type: () => PostAuthorSummaryDto })
  author!: PostAuthorSummaryDto;

  @ApiPropertyOptional({ example: false })
  isLikedByCurrentUser?: boolean;

  @ApiPropertyOptional({ example: false })
  isSavedByCurrentUser?: boolean;
}

export class PostDetailResDto extends PostSummaryResDto {
  @ApiProperty({ example: false })
  enableWatermark!: boolean;

  @ApiPropertyOptional({ type: String, nullable: true })
  cosplayerCharacterId?: AutoIncrementID | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  characterTagId?: AutoIncrementID | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  copyrightTagId?: AutoIncrementID | null;

  @ApiProperty({ type: () => [PostMediaResDto] })
  media!: PostMediaResDto[];

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

export class PostCommentResDto {
  @ApiProperty({ type: String, example: '1' })
  id!: AutoIncrementID;

  @ApiProperty({ type: String, example: '1' })
  postId!: AutoIncrementID;

  @ApiProperty({ type: String, example: '1' })
  userId!: AutoIncrementID;

  @ApiPropertyOptional({ type: String, nullable: true })
  parentCommentId?: AutoIncrementID | null;

  @ApiProperty({ example: 'Bộ ảnh đỉnh quá bạn ơi!' })
  content!: string;

  @ApiProperty({ example: 5 })
  likesCount!: number;

  @ApiProperty({ type: () => PostAuthorSummaryDto })
  author!: PostAuthorSummaryDto;

  @ApiPropertyOptional({ example: false })
  isLikedByCurrentUser?: boolean;

  @ApiProperty()
  createdAt!: Date;
}

export class ToggleLikeResDto {
  @ApiProperty({ example: true, description: 'Trạng thái like sau khi toggle' })
  liked!: boolean;

  @ApiProperty({
    example: 42,
    description: 'Tổng số like của post sau khi toggle',
  })
  likesCount!: number;
}
