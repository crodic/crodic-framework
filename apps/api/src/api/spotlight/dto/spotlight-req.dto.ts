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
  @StringField({ maxLength: 120 })
  @Trim()
  name!: string;

  @BooleanFieldOptional({ default: true })
  isVerified?: boolean;

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

  @StringField({ maxLength: 200 })
  @Trim()
  portfolioHref!: string;

  @StringFieldOptional({ maxLength: 200 })
  @Trim()
  bookingHref?: string;

  @NumberFieldOptional({ default: 0 })
  sortOrder?: number;

  @StringFieldOptional()
  cosplayerUserId?: AutoIncrementID;

  @BooleanFieldOptional({ default: true })
  isActive?: boolean;
}

export class UpdateSpotlightBannerReqDto {
  @StringFieldOptional({ maxLength: 120 })
  @Trim()
  name?: string;

  @BooleanFieldOptional()
  isVerified?: boolean;

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

  @StringFieldOptional({ maxLength: 200 })
  @Trim()
  portfolioHref?: string;

  @StringFieldOptional({ maxLength: 200 })
  @Trim()
  bookingHref?: string;

  @NumberFieldOptional()
  sortOrder?: number;

  @StringFieldOptional()
  cosplayerUserId?: AutoIncrementID;

  @BooleanFieldOptional()
  isActive?: boolean;
}
