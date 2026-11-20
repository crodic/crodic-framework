import { AutoIncrementID } from '../../../common/types/common.type';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  EEntityTagLogAction,
  ETagAliasType,
  ETagCategory,
  ETaggableEntityType,
  ETagSafetyRating,
  ETagStatus,
  ETagTranslationSource,
} from '../constants/tag.constant';
import { TagCategoryResDto } from './tag-category-res.dto';

export class TagTranslationResDto {
  @ApiProperty({ type: String })
  id!: AutoIncrementID;

  @ApiProperty({ type: String })
  locale!: string;

  @ApiProperty({ type: String })
  translatedName!: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  shortSummary?: string | null;

  @ApiProperty({ enum: ETagTranslationSource })
  source!: ETagTranslationSource;
}

export class TagAliasResDto {
  @ApiProperty({ type: String })
  id!: AutoIncrementID;

  @ApiProperty({ type: String })
  aliasName!: string;

  @ApiProperty({ enum: ETagAliasType })
  aliasType!: ETagAliasType;

  @ApiPropertyOptional({ type: String, nullable: true })
  locale?: string | null;
}

export class TagSummaryResDto {
  @ApiProperty({ type: String })
  id!: AutoIncrementID;

  @ApiProperty({ type: String })
  slug!: string;

  @ApiProperty({ type: String })
  name!: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  translatedName?: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  shortSummary?: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  featuredImageUrl?: string | null;

  @ApiProperty({ type: String, example: 'character' })
  category!: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  categoryId?: AutoIncrementID | null;

  @ApiPropertyOptional({ type: () => TagCategoryResDto, nullable: true })
  categoryDetail?: TagCategoryResDto | null;

  @ApiProperty({ enum: ETagSafetyRating })
  safetyRating!: ETagSafetyRating;

  @ApiProperty({ enum: ETagStatus })
  status!: ETagStatus;

  @ApiProperty({ type: Boolean })
  isOfficial!: boolean;

  @ApiProperty({ type: Boolean })
  isSystem!: boolean;

  @ApiProperty({ type: Number })
  usageCount!: number;

  @ApiProperty({ type: Number })
  trendingScore!: number;

  @ApiPropertyOptional({ type: () => [TagTranslationResDto] })
  translations?: TagTranslationResDto[];

  @ApiPropertyOptional({ type: () => [TagAliasResDto] })
  aliases?: TagAliasResDto[];

  @ApiProperty({ type: Date })
  createdAt!: Date;

  @ApiProperty({ type: Date })
  updatedAt!: Date;
}

export class TagGraphResDto {
  @ApiProperty({ type: () => [TagSummaryResDto] })
  parents!: TagSummaryResDto[];

  @ApiProperty({ type: () => [TagSummaryResDto] })
  children!: TagSummaryResDto[];

  @ApiProperty({ type: () => [TagSummaryResDto] })
  siblings!: TagSummaryResDto[];

  @ApiProperty({ type: () => [TagSummaryResDto] })
  related!: TagSummaryResDto[];

  @ApiProperty({ type: () => [TagSummaryResDto] })
  disambiguations!: TagSummaryResDto[];
}

export class TagDetailResDto extends TagSummaryResDto {
  @ApiPropertyOptional({ type: String, nullable: true })
  redirectSlug?: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  mergedIntoId?: AutoIncrementID | null;

  @ApiPropertyOptional({ type: Boolean })
  isMutedByCurrentUser?: boolean;

  @ApiPropertyOptional({ type: Boolean })
  hasEncyclopedia?: boolean;

  @ApiProperty({ type: () => TagGraphResDto })
  graph!: TagGraphResDto;
}

export class TagAutocompleteItemDto {
  @ApiProperty({ type: String })
  id!: AutoIncrementID;

  @ApiProperty({ type: String })
  slug!: string;

  @ApiProperty({ type: String })
  name!: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  translatedName?: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  matchedAlias?: string | null;

  @ApiProperty({ type: String, example: 'character' })
  category!: string;

  @ApiProperty({ enum: ETagSafetyRating })
  safetyRating!: ETagSafetyRating;

  @ApiProperty({ type: Boolean })
  isOfficial!: boolean;

  @ApiProperty({ type: Number })
  usageCount!: number;
}

export class TagTooltipResDto {
  @ApiProperty({ type: String })
  id!: AutoIncrementID;

  @ApiProperty({ type: String })
  slug!: string;

  @ApiProperty({ type: String })
  name!: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  translatedName?: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  summary?: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  featuredImageUrl?: string | null;

  @ApiProperty({ type: String, example: 'character' })
  category!: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  categoryId?: AutoIncrementID | null;

  @ApiPropertyOptional({ type: () => TagCategoryResDto, nullable: true })
  categoryDetail?: TagCategoryResDto | null;

  @ApiProperty({ enum: ETagSafetyRating })
  safetyRating!: ETagSafetyRating;

  @ApiProperty({ type: Boolean })
  isOfficial!: boolean;

  @ApiProperty({ type: Number })
  usageCount!: number;

  @ApiPropertyOptional({ type: () => TagSummaryResDto, nullable: true })
  parentTag?: TagSummaryResDto | null;
}

export class TagEncyclopediaRevisionResDto {
  @ApiProperty({ type: String })
  id!: AutoIncrementID;

  @ApiProperty({ type: Number })
  revisionNumber!: number;

  @ApiProperty({ type: String })
  summary!: string;

  @ApiProperty({ type: String })
  body!: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  changeNote?: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  editorName?: string | null;

  @ApiProperty({ type: Date })
  createdAt!: Date;
}

export class TagEncyclopediaResDto {
  @ApiProperty({ type: String })
  id!: AutoIncrementID;

  @ApiProperty({ type: String })
  tagId!: AutoIncrementID;

  @ApiProperty({ type: String })
  locale!: string;

  @ApiProperty({ type: String })
  summary!: string;

  @ApiProperty({ type: String })
  body!: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  featuredImageUrl?: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  featuredFileId?: AutoIncrementID | null;

  @ApiProperty({ type: Boolean })
  isEditLocked!: boolean;

  @ApiProperty({ type: Number })
  currentRevision!: number;

  @ApiProperty({ type: Number })
  viewCount!: number;

  @ApiProperty({ type: () => TagDetailResDto })
  tag!: TagDetailResDto;

  @ApiPropertyOptional({ type: () => [TagEncyclopediaRevisionResDto] })
  revisions?: TagEncyclopediaRevisionResDto[];

  @ApiProperty({ type: Date })
  updatedAt!: Date;
}

export class EntityTagItemDto {
  @ApiProperty({ type: String })
  id!: AutoIncrementID;

  @ApiProperty({ type: String })
  tagId!: AutoIncrementID;

  @ApiProperty({ type: String })
  slug!: string;

  @ApiProperty({ type: String })
  name!: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  translatedName?: string | null;

  @ApiProperty({ type: String, example: 'character' })
  category!: string;

  @ApiProperty({ enum: ETagSafetyRating })
  safetyRating!: ETagSafetyRating;

  @ApiProperty({ type: Boolean })
  isOfficial!: boolean;

  @ApiProperty({
    type: Boolean,
    description: 'True when attached by creator (*)',
  })
  isAuthorTag!: boolean;

  @ApiProperty({
    type: Boolean,
    description: 'Per-tag lock status',
  })
  locked!: boolean;

  @ApiProperty({
    type: Boolean,
    description: 'Whether the requesting actor can delete this tag',
  })
  deletable!: boolean;

  @ApiProperty({ type: Number })
  sortOrder!: number;

  @ApiProperty({ type: Number })
  usageCount!: number;
}

export class EntityTagListResDto {
  @ApiProperty({ enum: ETaggableEntityType })
  entityType!: ETaggableEntityType;

  @ApiProperty({ type: String })
  entityId!: AutoIncrementID;

  @ApiProperty({ type: Boolean })
  tagEditLocked!: boolean;

  @ApiProperty({ type: Number })
  maxTags!: number;

  @ApiProperty({ type: Boolean })
  canEdit!: boolean;

  @ApiProperty({ type: Boolean })
  isOwner!: boolean;

  @ApiProperty({ type: () => [EntityTagItemDto] })
  tags!: EntityTagItemDto[];
}

export class EntityTagLogResDto {
  @ApiProperty({ type: String })
  id!: AutoIncrementID;

  @ApiProperty({ enum: ETaggableEntityType })
  entityType!: ETaggableEntityType;

  @ApiProperty({ type: String })
  entityId!: AutoIncrementID;

  @ApiPropertyOptional({ type: String, nullable: true })
  tagId?: AutoIncrementID | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  tagNameSnapshot?: string | null;

  @ApiProperty({ enum: EEntityTagLogAction })
  action!: EEntityTagLogAction;

  @ApiPropertyOptional({ type: String, nullable: true })
  actorName?: string | null;

  @ApiProperty({ type: Boolean })
  isAdminAction!: boolean;

  @ApiProperty({ type: Date })
  createdAt!: Date;
}

export class MergeTagPreviewResDto {
  @ApiProperty({ type: () => TagSummaryResDto })
  sourceTag!: TagSummaryResDto;

  @ApiProperty({ type: () => TagSummaryResDto })
  targetTag!: TagSummaryResDto;

  @ApiProperty({ type: Number })
  affectedEntityTagsCount!: number;

  @ApiProperty({ type: Number })
  aliasesToTransferCount!: number;

  @ApiProperty({ type: Number })
  relationsToRewireCount!: number;
}

export class MutedTagItemResDto {
  @ApiProperty({ type: String })
  id!: AutoIncrementID;

  @ApiProperty({ type: Boolean })
  includeChildren!: boolean;

  @ApiProperty({ type: () => TagSummaryResDto })
  tag!: TagSummaryResDto;

  @ApiProperty({ type: Date })
  createdAt!: Date;
}
