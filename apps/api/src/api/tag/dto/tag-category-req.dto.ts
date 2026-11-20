import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateTagCategoryReqDto {
  @ApiProperty({ example: 'Costume & Props' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @ApiPropertyOptional({ example: 'costume' })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  slug?: string;

  @ApiPropertyOptional({
    example: 'Outfits, wigs, props, and makeup styles for cosplayers',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: '#06b6d4', default: '#64748b' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  @Matches(/^#([0-9a-fA-F]{3,8})$/, {
    message: 'color must be a valid hex color string (e.g. #3b82f6)',
  })
  color?: string;

  @ApiPropertyOptional({ example: 'Shirt', default: 'Tag' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  icon?: string;

  @ApiPropertyOptional({ example: 7, default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateTagCategoryReqDto {
  @ApiPropertyOptional({ example: 'Costume & Props' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ example: 'costume' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  slug?: string;

  @ApiPropertyOptional({
    example: 'Outfits, wigs, props, and makeup styles for cosplayers',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: '#06b6d4' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  @Matches(/^#([0-9a-fA-F]{3,8})$/, {
    message: 'color must be a valid hex color string (e.g. #3b82f6)',
  })
  color?: string;

  @ApiPropertyOptional({ example: 'Shirt' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  icon?: string;

  @ApiPropertyOptional({ example: 7 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
