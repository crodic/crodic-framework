import { AutoIncrementID } from '../../../common/types/common.type';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TagCategoryResDto {
  @ApiProperty({ type: String, example: '1' })
  id!: AutoIncrementID;

  @ApiProperty({ example: 'character' })
  slug!: string;

  @ApiProperty({ example: 'Character' })
  name!: string;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    example: 'Named fictional or historical characters',
  })
  description?: string | null;

  @ApiProperty({ example: '#3b82f6' })
  color!: string;

  @ApiProperty({ example: 'User' })
  icon!: string;

  @ApiProperty({ example: 2 })
  sortOrder!: number;

  @ApiProperty({ example: true })
  isSystem!: boolean;

  @ApiProperty({ example: true })
  isActive!: boolean;

  @ApiPropertyOptional({ type: Number, example: 42 })
  tagCount?: number;

  @ApiProperty({ type: Date })
  createdAt!: Date;

  @ApiProperty({ type: Date })
  updatedAt!: Date;
}
