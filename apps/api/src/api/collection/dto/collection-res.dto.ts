import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AutoIncrementID } from '../../../common/types/common.type';

export class CollectionPostSummaryResDto {
  @ApiProperty({ type: String, example: '1' })
  id!: AutoIncrementID;

  @ApiProperty({ example: 'Acheron Cosplay Photoshoot' })
  title!: string;

  @ApiProperty({ example: 'acheron-cosplay-photoshoot' })
  slug!: string;

  @ApiPropertyOptional({
    example:
      'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500',
  })
  coverUrl?: string | null;

  @ApiPropertyOptional({ example: 'photoset' })
  postType?: string;
}

export class CollectionResDto {
  @ApiProperty({ type: String, example: '1' })
  id!: AutoIncrementID;

  @ApiProperty({ type: String, example: '100' })
  userId!: AutoIncrementID;

  @ApiProperty({ example: 'Cảm hứng Cosplay Honkai' })
  title!: string;

  @ApiProperty({ example: 'cam-hung-cosplay-honkai' })
  slug!: string;

  @ApiPropertyOptional({ example: 'Tổng hợp các concept photoshoot xịn xò' })
  description?: string | null;

  @ApiProperty({ example: false })
  isDefault!: boolean;

  @ApiProperty({ example: true })
  isPublic!: boolean;

  @ApiProperty({ example: 12 })
  itemsCount!: number;

  @ApiProperty({
    type: [String],
    example: [
      'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=300',
    ],
  })
  previewThumbnails!: string[];

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

export class CollectionItemResDto {
  @ApiProperty({ type: String, example: '1' })
  id!: AutoIncrementID;

  @ApiProperty({ type: String, example: '1' })
  collectionId!: AutoIncrementID;

  @ApiProperty({ type: String, example: '5' })
  postId!: AutoIncrementID;

  @ApiPropertyOptional({ type: CollectionPostSummaryResDto })
  post?: CollectionPostSummaryResDto;

  @ApiPropertyOptional({ type: String, example: '10' })
  postMediaId?: AutoIncrementID | null;

  @ApiPropertyOptional({
    example:
      'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500',
  })
  mediaUrl?: string | null;

  @ApiProperty({ example: 0 })
  sortOrder!: number;

  @ApiProperty()
  createdAt!: Date;
}
