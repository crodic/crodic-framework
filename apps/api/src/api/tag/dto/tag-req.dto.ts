import { AutoIncrementID } from '../../../common/types/common.type';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import {
  ETagAliasType,
  ETagCategory,
  ETagRelationType,
  ETagSafetyRating,
  ETagStatus,
  ETagTranslationSource,
} from '../constants/tag.constant';

export class TagTranslationInputDto {
  @ApiProperty({ example: 'vi' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(16)
  locale!: string;

  @ApiProperty({ example: 'Phong cảnh' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  translatedName!: string;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    example: 'Tác phẩm minh họa bối cảnh thiên nhiên hoặc kiến trúc.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(280)
  shortSummary?: string | null;

  @ApiPropertyOptional({ enum: ETagTranslationSource })
  @IsOptional()
  @IsEnum(ETagTranslationSource)
  source?: ETagTranslationSource;
}

export class TagAliasInputDto {
  @ApiProperty({ example: 'FGO' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  aliasName!: string;

  @ApiPropertyOptional({ enum: ETagAliasType, default: ETagAliasType.SYNONYM })
  @IsOptional()
  @IsEnum(ETagAliasType)
  aliasType?: ETagAliasType;

  @ApiPropertyOptional({ type: String, nullable: true, example: 'en' })
  @IsOptional()
  @IsString()
  @MaxLength(16)
  locale?: string | null;
}

export class CreateTagReqDto {
  @ApiProperty({ example: '葬送のフリーレン' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @ApiPropertyOptional({ example: 'frieren-beyond-journeys-end' })
  @IsOptional()
  @IsString()
  @MaxLength(140)
  slug?: string;

  @ApiPropertyOptional({ example: 'character', default: 'general' })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  category?: string;

  @ApiPropertyOptional({ type: String, example: '1' })
  @IsOptional()
  @IsString()
  categoryId?: AutoIncrementID;

  @ApiPropertyOptional({
    enum: ETagSafetyRating,
    default: ETagSafetyRating.SAFE,
  })
  @IsOptional()
  @IsEnum(ETagSafetyRating)
  safetyRating?: ETagSafetyRating;

  @ApiPropertyOptional({ enum: ETagStatus, default: ETagStatus.ACTIVE })
  @IsOptional()
  @IsEnum(ETagStatus)
  status?: ETagStatus;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isOfficial?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isSystem?: boolean;

  @ApiPropertyOptional({ type: [TagTranslationInputDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TagTranslationInputDto)
  translations?: TagTranslationInputDto[];

  @ApiPropertyOptional({ type: [TagAliasInputDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TagAliasInputDto)
  aliases?: TagAliasInputDto[];
}

export class UpdateTagReqDto {
  @ApiPropertyOptional({ example: '葬送のフリーレン' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ example: 'frieren' })
  @IsOptional()
  @IsString()
  @MaxLength(140)
  slug?: string;

  @ApiPropertyOptional({ example: 'character' })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  category?: string;

  @ApiPropertyOptional({ type: String, example: '1' })
  @IsOptional()
  @IsString()
  categoryId?: AutoIncrementID;

  @ApiPropertyOptional({ enum: ETagSafetyRating })
  @IsOptional()
  @IsEnum(ETagSafetyRating)
  safetyRating?: ETagSafetyRating;

  @ApiPropertyOptional({ enum: ETagStatus })
  @IsOptional()
  @IsEnum(ETagStatus)
  status?: ETagStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isOfficial?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isSystem?: boolean;

  @ApiPropertyOptional({ type: [TagTranslationInputDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TagTranslationInputDto)
  translations?: TagTranslationInputDto[];

  @ApiPropertyOptional({ type: [TagAliasInputDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TagAliasInputDto)
  aliases?: TagAliasInputDto[];
}

export class AddTagRelationReqDto {
  @ApiProperty({ type: String, example: '2' })
  @IsString()
  @IsNotEmpty()
  targetTagId!: AutoIncrementID;

  @ApiPropertyOptional({
    enum: ETagRelationType,
    default: ETagRelationType.HIERARCHY,
  })
  @IsOptional()
  @IsEnum(ETagRelationType)
  relationType?: ETagRelationType;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(9999)
  sortOrder?: number;
}

export class MergeTagReqDto {
  @ApiProperty({ type: String, example: '5' })
  @IsString()
  @IsNotEmpty()
  targetTagId!: AutoIncrementID;
}

export class UpsertTagEncyclopediaReqDto {
  @ApiProperty({ example: 'vi' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(16)
  locale!: string;

  @ApiProperty({
    example: 'Tóm tắt ngắn gọn về nguồn gốc và ý nghĩa của thẻ này.',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  summary!: string;

  @ApiProperty({
    example:
      '<h2>Giới thiệu</h2><p>Nội dung chi tiết bách khoa toàn thư...</p>',
  })
  @IsString()
  @IsNotEmpty()
  body!: string;

  @ApiPropertyOptional({ type: String, nullable: true, example: '12' })
  @IsOptional()
  @IsString()
  featuredFileId?: AutoIncrementID | null;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    example: 'https://example.com/storage/uploads/image/tags/frieren.webp',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  featuredImageUrl?: string | null;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isEditLocked?: boolean;

  @ApiPropertyOptional({ example: 'Cập nhật danh sách nhân vật liên quan' })
  @IsOptional()
  @IsString()
  @MaxLength(280)
  changeNote?: string;
}

export class AttachEntityTagReqDto {
  @ApiProperty({ example: 'Original' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  tagName!: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isLocked?: boolean;
}

export class SyncEntityTagsReqDto {
  @ApiProperty({ type: [String], example: ['Original', 'Landscape'] })
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  tagNames!: string[];

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  tagEditLocked?: boolean;

  @ApiPropertyOptional({ type: String, nullable: true, example: '1' })
  @IsOptional()
  @IsString()
  ownerUserId?: AutoIncrementID | null;
}

export class UpdateEntityTagGovernanceReqDto {
  @ApiPropertyOptional({ type: String, example: '3' })
  @IsOptional()
  @IsString()
  tagId?: AutoIncrementID;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isLocked?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  tagEditLocked?: boolean;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  orderedTagIds?: AutoIncrementID[];
}

export class UpsertMutedTagReqDto {
  @ApiProperty({ type: String, example: '4' })
  @IsString()
  @IsNotEmpty()
  tagId!: AutoIncrementID;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  includeChildren?: boolean;
}

export class AutocompleteTagQueryDto {
  @ApiPropertyOptional({ example: 'frie' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  q?: string;

  @ApiPropertyOptional({ example: 'vi' })
  @IsOptional()
  @IsString()
  @MaxLength(16)
  locale?: string;

  @ApiPropertyOptional({ default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(30)
  limit?: number;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  includeUnsafe?: boolean;
}
