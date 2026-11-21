import { AutoIncrementID } from '../../../common/types/common.type';
import {
  BooleanField,
  BooleanFieldOptional,
  ClassField,
  ClassFieldOptional,
  EnumField,
  JsonField,
  NumberField,
  NumberFieldOptional,
  StringField,
  StringFieldOptional,
} from '../../../decorators/field.decorators';
import { Exclude, Expose, Transform, Type } from 'class-transformer';

@Exclude()
export class UserCosplayerSummaryResDto {
  @StringFieldOptional()
  @Expose()
  id?: AutoIncrementID;

  @StringField()
  @Expose()
  slug!: string;

  @StringField()
  @Expose()
  displayName!: string;

  @StringFieldOptional()
  @Expose()
  roleBadge?: string | null;

  @StringFieldOptional()
  @Expose()
  tagline?: string | null;

  @StringFieldOptional()
  @Expose()
  bio?: string | null;

  @StringFieldOptional()
  @Expose()
  artisticBio?: string | null;

  @StringFieldOptional()
  @Expose()
  avatarUrl?: string | null;

  @StringFieldOptional()
  @Expose()
  coverUrl?: string | null;

  @StringFieldOptional()
  @Expose()
  locationLabel?: string | null;

  @StringFieldOptional()
  @Expose()
  workArea?: string | null;

  @NumberFieldOptional()
  @Expose()
  heightCm?: number | null;

  @NumberFieldOptional()
  @Expose()
  experienceYearsNum?: number | null;

  @StringFieldOptional({ each: true })
  @Expose()
  skills?: string[];

  @StringFieldOptional({ each: true })
  @Expose()
  specialties?: string[];

  @StringFieldOptional({ each: true })
  @Expose()
  awardsBadges?: string[];

  @StringFieldOptional()
  @Expose()
  contactEmail?: string | null;

  @StringFieldOptional()
  @Expose()
  contactPhone?: string | null;

  @StringFieldOptional()
  @Expose()
  facebookUrl?: string | null;

  @StringFieldOptional()
  @Expose()
  instagramUrl?: string | null;

  @StringFieldOptional()
  @Expose()
  tiktokUrl?: string | null;

  @StringFieldOptional()
  @Expose()
  twitterUrl?: string | null;

  @BooleanField()
  @Expose()
  isVerified!: boolean;

  @BooleanFieldOptional()
  @Expose()
  isCraftingCreator?: boolean;

  @NumberField()
  @Expose()
  rankingScore!: number;
}

@Exclude()
export class UserResDto {
  @StringField()
  @Expose()
  id!: AutoIncrementID;

  @StringFieldOptional()
  @Expose()
  username?: string | null;

  @StringField()
  @Expose()
  firstName!: string;

  @StringFieldOptional()
  @Expose()
  lastName?: string;

  @StringField()
  @Expose()
  fullName!: string;

  @StringField()
  @Expose()
  email!: string;

  @StringFieldOptional()
  @Expose()
  avatar?: string;

  @BooleanField()
  @Expose()
  hasPassword!: boolean;

  @JsonField()
  @Expose()
  notifications!: Record<string, boolean>;

  @BooleanFieldOptional()
  @Transform(({ obj }) =>
    Boolean(
      obj?.notifications?.cosplayerRoleRequested &&
      !obj?.cosplayerProfile?.isVerified,
    ),
  )
  @Expose()
  cosplayerRequestPending?: boolean;

  @BooleanField()
  @Transform(({ value }) => !!value)
  @Expose()
  verifiedAt?: boolean;

  @ClassFieldOptional(() => UserCosplayerSummaryResDto)
  @Type(() => UserCosplayerSummaryResDto)
  @Expose()
  cosplayerProfile?: UserCosplayerSummaryResDto | null;

  @ClassField(() => Date)
  @Expose()
  createdAt!: Date;

  @ClassField(() => Date)
  @Expose()
  updatedAt!: Date;

  @ClassField(() => Date)
  @Expose()
  deletedAt?: Date | null;
}
