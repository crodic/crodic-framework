import { AutoIncrementID } from '../../../common/types/common.type';
import {
  ArrayFieldOptional,
  BooleanFieldOptional,
  ClassField,
  EnumFieldOptional,
  NumberFieldOptional,
  StringField,
  StringFieldOptional,
} from '../../../decorators/field.decorators';
import { Trim } from '../../../decorators/transform.decorators';
import {
  EAlbumCategory,
  EMediaType,
  EPostStatus,
  EPostType,
} from '../constants/post.constant';

export class CreatePostMediaInputDto {
  @StringField({ maxLength: 500 })
  mediaUrl!: string;

  @EnumFieldOptional(() => EMediaType, { default: EMediaType.IMAGE })
  mediaType?: EMediaType;

  @StringFieldOptional()
  fileId?: AutoIncrementID;

  @NumberFieldOptional({ min: 1 })
  width?: number;

  @NumberFieldOptional({ min: 1 })
  height?: number;

  @NumberFieldOptional({ min: 0, max: 100 })
  sortOrder?: number;

  @BooleanFieldOptional()
  isCover?: boolean;

  @StringFieldOptional({ maxLength: 500 })
  @Trim()
  caption?: string;
}

export class CreatePostReqDto {
  @StringField({ maxLength: 220 })
  @Trim()
  title!: string;

  @StringFieldOptional()
  @Trim()
  caption?: string;

  @EnumFieldOptional(() => EPostType, { default: EPostType.PHOTOSET })
  postType?: EPostType;

  @EnumFieldOptional(() => EAlbumCategory, { default: EAlbumCategory.SERIES })
  albumCategory?: EAlbumCategory;

  @StringFieldOptional({ maxLength: 80 })
  @Trim()
  albumCategoryLabel?: string;

  @StringFieldOptional({ maxLength: 120 })
  @Trim()
  characterName?: string;

  @StringFieldOptional({ maxLength: 150 })
  @Trim()
  fandomName?: string;

  @StringFieldOptional()
  cosplayerCharacterId?: AutoIncrementID;

  @StringFieldOptional()
  characterTagId?: AutoIncrementID;

  @StringFieldOptional()
  copyrightTagId?: AutoIncrementID;

  @StringField({ maxLength: 500 })
  coverImageUrl!: string;

  @BooleanFieldOptional()
  isCollage?: boolean;

  @ArrayFieldOptional({ itemType: 'string' })
  collagePreviewUrls?: string[];

  @ArrayFieldOptional({ itemType: 'string' })
  tagNamesCache?: string[];

  @BooleanFieldOptional()
  isPublic?: boolean;

  @BooleanFieldOptional()
  enableWatermark?: boolean;

  @EnumFieldOptional(() => EPostStatus, { default: EPostStatus.PUBLISHED })
  status?: EPostStatus;

  @ClassField(() => CreatePostMediaInputDto, { each: true })
  media!: CreatePostMediaInputDto[];
}

export class UpdatePostReqDto {
  @StringFieldOptional({ maxLength: 220 })
  @Trim()
  title?: string;

  @StringFieldOptional()
  @Trim()
  caption?: string;

  @EnumFieldOptional(() => EPostType)
  postType?: EPostType;

  @EnumFieldOptional(() => EAlbumCategory)
  albumCategory?: EAlbumCategory;

  @StringFieldOptional({ maxLength: 80 })
  @Trim()
  albumCategoryLabel?: string;

  @StringFieldOptional({ maxLength: 120 })
  @Trim()
  characterName?: string;

  @StringFieldOptional({ maxLength: 150 })
  @Trim()
  fandomName?: string;

  @StringFieldOptional()
  cosplayerCharacterId?: AutoIncrementID;

  @StringFieldOptional()
  characterTagId?: AutoIncrementID;

  @StringFieldOptional()
  copyrightTagId?: AutoIncrementID;

  @StringFieldOptional({ maxLength: 500 })
  coverImageUrl?: string;

  @BooleanFieldOptional()
  isCollage?: boolean;

  @ArrayFieldOptional({ itemType: 'string' })
  collagePreviewUrls?: string[];

  @ArrayFieldOptional({ itemType: 'string' })
  tagNamesCache?: string[];

  @BooleanFieldOptional()
  isPublic?: boolean;

  @BooleanFieldOptional()
  enableWatermark?: boolean;

  @EnumFieldOptional(() => EPostStatus)
  status?: EPostStatus;

  @ArrayFieldOptional({ itemType: 'object' })
  media?: CreatePostMediaInputDto[];
}

export class CreatePostCommentReqDto {
  @StringField({ minLength: 1, maxLength: 2000 })
  @Trim()
  content!: string;

  @StringFieldOptional()
  parentCommentId?: AutoIncrementID;
}
