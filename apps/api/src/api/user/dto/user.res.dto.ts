import { AutoIncrementID } from '../../../common/types/common.type';
import {
  BooleanField,
  ClassField,
  ClassFieldOptional,
  EnumField,
  JsonField,
  NumberField,
  StringField,
  StringFieldOptional,
} from '../../../decorators/field.decorators';
import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { EUserRole } from '../constants/user.constant';

@Exclude()
export class UserCosplayerSummaryResDto {
  @StringField()
  @Expose()
  slug!: string;

  @StringField()
  @Expose()
  displayName!: string;

  @StringFieldOptional()
  @Expose()
  roleBadge?: string | null;

  @BooleanField()
  @Expose()
  isVerified!: boolean;

  @BooleanField()
  @Expose()
  isAcceptingBooking!: boolean;

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

  @EnumField(() => EUserRole)
  @Expose()
  role!: EUserRole;

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
