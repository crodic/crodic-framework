import {
  BooleanFieldOptional,
  ClassFieldOptional,
  EmailField,
  EmailFieldOptional,
  EnumFieldOptional,
  NumberFieldOptional,
  PasswordField,
  StringField,
  StringFieldOptional,
  URLFieldOptional,
} from '../../../decorators/field.decorators';
import { Trim } from '../../../decorators/transform.decorators';

export class AdminCosplayerProfileInputDto {
  @StringFieldOptional({ maxLength: 120, nullable: true })
  @Trim()
  displayName?: string;

  @StringFieldOptional({ maxLength: 80, nullable: true })
  @Trim()
  slug?: string;

  @StringFieldOptional({ maxLength: 80, nullable: true })
  @Trim()
  roleBadge?: string;

  @StringFieldOptional({ maxLength: 255, nullable: true })
  @Trim()
  tagline?: string;

  @StringFieldOptional({ maxLength: 500, nullable: true })
  @Trim()
  bio?: string;

  @StringFieldOptional({ nullable: true })
  @Trim()
  artisticBio?: string;

  @StringFieldOptional({ maxLength: 500, nullable: true })
  avatarUrl?: string;

  @StringFieldOptional({ maxLength: 500, nullable: true })
  coverUrl?: string;

  @StringFieldOptional({ maxLength: 120, nullable: true })
  @Trim()
  locationLabel?: string;

  @StringFieldOptional({ maxLength: 160, nullable: true })
  @Trim()
  workArea?: string;

  @NumberFieldOptional({ min: 100, max: 250, nullable: true })
  heightCm?: number;

  @NumberFieldOptional({ min: 0, max: 50, nullable: true })
  experienceYearsNum?: number;

  @StringFieldOptional({ each: true })
  skills?: string[];

  @StringFieldOptional({ each: true })
  specialties?: string[];

  @StringFieldOptional({ each: true })
  awardsBadges?: string[];

  @EmailFieldOptional({ nullable: true })
  contactEmail?: string;

  @StringFieldOptional({ maxLength: 50, nullable: true })
  @Trim()
  contactPhone?: string;

  @URLFieldOptional({ nullable: true })
  facebookUrl?: string;

  @URLFieldOptional({ nullable: true })
  instagramUrl?: string;

  @URLFieldOptional({ nullable: true })
  tiktokUrl?: string;

  @URLFieldOptional({ nullable: true })
  twitterUrl?: string;

  @BooleanFieldOptional()
  isVerified?: boolean;

  @BooleanFieldOptional()
  isCraftingCreator?: boolean;
}

export class CreateUserReqDto {
  @StringField()
  @Trim()
  firstName: string;

  @StringField()
  @Trim()
  lastName: string;

  @EmailField()
  email: string;

  @PasswordField()
  password: string;

  @PasswordField()
  confirmPassword: string;

  @StringFieldOptional({ maxLength: 80 })
  @Trim()
  username?: string;

  @ClassFieldOptional(() => AdminCosplayerProfileInputDto)
  cosplayerProfile?: AdminCosplayerProfileInputDto;
}
