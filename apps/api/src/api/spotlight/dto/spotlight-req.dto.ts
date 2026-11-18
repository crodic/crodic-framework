import { AutoIncrementID } from '../../../common/types/common.type';
import {
  BooleanFieldOptional,
  NumberFieldOptional,
  StringField,
  StringFieldOptional,
  URLField,
  URLFieldOptional,
} from '../../../decorators/field.decorators';
import { Trim } from '../../../decorators/transform.decorators';

export class CreateSpotlightBannerReqDto {
  @StringField({ maxLength: 80 })
  @Trim()
  badge!: string;

  @StringField({ maxLength: 255 })
  @Trim()
  tagline!: string;

  @URLField()
  bannerImageUrl!: string;

  @StringFieldOptional()
  bannerFileId?: AutoIncrementID;

  @NumberFieldOptional({ default: 0 })
  sortOrder?: number;

  @StringField()
  cosplayerUserId!: AutoIncrementID;

  @BooleanFieldOptional({ default: true })
  isActive?: boolean;
}

export class UpdateSpotlightBannerReqDto {
  @StringFieldOptional({ maxLength: 80 })
  @Trim()
  badge?: string;

  @StringFieldOptional({ maxLength: 255 })
  @Trim()
  tagline?: string;

  @URLFieldOptional()
  bannerImageUrl?: string;

  @StringFieldOptional()
  bannerFileId?: AutoIncrementID;

  @NumberFieldOptional()
  sortOrder?: number;

  @StringFieldOptional()
  cosplayerUserId?: AutoIncrementID;

  @BooleanFieldOptional()
  isActive?: boolean;
}
