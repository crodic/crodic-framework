import { AutoIncrementID } from '../../../common/types/common.type';
import {
  ArrayFieldOptional,
  BooleanField,
  BooleanFieldOptional,
  EmailFieldOptional,
  NumberField,
  NumberFieldOptional,
  StringField,
  StringFieldOptional,
  URLFieldOptional,
} from '../../../decorators/field.decorators';
import { Trim } from '../../../decorators/transform.decorators';

export class UpdateCosplayerProfileReqDto {
  @StringFieldOptional({ maxLength: 120 })
  @Trim()
  displayName?: string;

  @StringFieldOptional({ maxLength: 80 })
  @Trim()
  handle?: string;

  @StringFieldOptional({ maxLength: 80 })
  @Trim()
  roleBadge?: string;

  @StringFieldOptional({ maxLength: 255 })
  @Trim()
  tagline?: string;

  @StringFieldOptional({ maxLength: 500 })
  @Trim()
  bio?: string;

  @StringFieldOptional()
  @Trim()
  artisticBio?: string;

  @StringFieldOptional({ maxLength: 500 })
  avatarUrl?: string;

  @StringFieldOptional({ maxLength: 500 })
  coverUrl?: string;

  @StringFieldOptional({ maxLength: 120 })
  @Trim()
  locationLabel?: string;

  @StringFieldOptional()
  cityId?: AutoIncrementID;

  @StringFieldOptional()
  countryId?: AutoIncrementID;

  @StringFieldOptional({ maxLength: 160 })
  @Trim()
  workArea?: string;

  @NumberFieldOptional({ min: 100, max: 250 })
  heightCm?: number;

  @StringFieldOptional({ maxLength: 50 })
  @Trim()
  heightLabel?: string;

  @NumberFieldOptional({ min: 0, max: 50 })
  experienceYearsNum?: number;

  @StringFieldOptional({ maxLength: 100 })
  @Trim()
  experienceLabel?: string;

  @ArrayFieldOptional({ itemType: 'string' })
  skills?: string[];

  @ArrayFieldOptional({ itemType: 'string' })
  specialties?: string[];

  @ArrayFieldOptional({ itemType: 'string' })
  awardsBadges?: string[];

  @EmailFieldOptional()
  contactEmail?: string;

  @StringFieldOptional({ maxLength: 50 })
  @Trim()
  contactPhone?: string;

  @URLFieldOptional()
  facebookUrl?: string;

  @URLFieldOptional()
  instagramUrl?: string;

  @URLFieldOptional()
  tiktokUrl?: string;

  @URLFieldOptional()
  twitterUrl?: string;

  @BooleanFieldOptional()
  isAcceptingBooking?: boolean;

  @BooleanFieldOptional()
  isCraftingCreator?: boolean;
}

export class CreateCosplayerServiceReqDto {
  @StringField({ maxLength: 150 })
  @Trim()
  title!: string;

  @StringFieldOptional({ maxLength: 500 })
  @Trim()
  description?: string;

  @StringField({ maxLength: 80 })
  @Trim()
  badgeLabel!: string;

  @NumberFieldOptional({ min: 0, max: 1000 })
  sortOrder?: number;

  @BooleanFieldOptional()
  isActive?: boolean;
}

export class UpdateCosplayerServiceReqDto {
  @StringFieldOptional({ maxLength: 150 })
  @Trim()
  title?: string;

  @StringFieldOptional({ maxLength: 500 })
  @Trim()
  description?: string;

  @StringFieldOptional({ maxLength: 80 })
  @Trim()
  badgeLabel?: string;

  @NumberFieldOptional({ min: 0, max: 1000 })
  sortOrder?: number;

  @BooleanFieldOptional()
  isActive?: boolean;
}

export class CreateCosplayerCharacterReqDto {
  @StringField({ maxLength: 160 })
  @Trim()
  characterName!: string;

  @StringField({ maxLength: 160 })
  @Trim()
  seriesName!: string;

  @StringFieldOptional()
  characterTagId?: AutoIncrementID;

  @StringFieldOptional()
  copyrightTagId?: AutoIncrementID;

  @StringFieldOptional()
  coverFileId?: AutoIncrementID;

  @StringField({ maxLength: 500 })
  coverImageUrl!: string;

  @NumberFieldOptional({ min: 0 })
  albumsCount?: number;

  @NumberFieldOptional({ min: 0 })
  photosCount?: number;

  @NumberFieldOptional({ min: 0, max: 1000 })
  sortOrder?: number;
}

export class UpdateCosplayerCharacterReqDto {
  @StringFieldOptional({ maxLength: 160 })
  @Trim()
  characterName?: string;

  @StringFieldOptional({ maxLength: 160 })
  @Trim()
  seriesName?: string;

  @StringFieldOptional()
  characterTagId?: AutoIncrementID;

  @StringFieldOptional()
  copyrightTagId?: AutoIncrementID;

  @StringFieldOptional()
  coverFileId?: AutoIncrementID;

  @StringFieldOptional({ maxLength: 500 })
  coverImageUrl?: string;

  @NumberFieldOptional({ min: 0 })
  albumsCount?: number;

  @NumberFieldOptional({ min: 0 })
  photosCount?: number;

  @NumberFieldOptional({ min: 0, max: 1000 })
  sortOrder?: number;
}
