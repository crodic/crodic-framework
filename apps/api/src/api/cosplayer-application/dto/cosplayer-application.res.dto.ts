import { AutoIncrementID } from '../../../common/types/common.type';
import {
  ArrayFieldOptional,
  ClassFieldOptional,
  DateField,
  DateFieldOptional,
  EnumField,
  JsonFieldOptional,
  StringField,
  StringFieldOptional,
} from '../../../decorators/field.decorators';
import { Exclude, Expose, Type } from 'class-transformer';
import { ECosplayerApplicationStatus } from '../constants/cosplayer-application.constant';
import { UserResDto } from '../../user/dto/user.res.dto';
import { AdminUserResDto } from '../../admin-user/dto/admin-user.res.dto';

@Exclude()
export class CosplayerApplicationResDto {
  @StringField()
  @Expose()
  id!: AutoIncrementID;

  @StringField()
  @Expose()
  userId!: AutoIncrementID;

  @ClassFieldOptional(() => UserResDto)
  @Type(() => UserResDto)
  @Expose()
  user?: UserResDto;

  @StringField()
  @Expose()
  stageName!: string;

  @StringField()
  @Expose()
  bio!: string;

  @JsonFieldOptional()
  @Expose()
  socialLinks?: Record<string, string> | null;

  @ArrayFieldOptional(() => String)
  @Expose()
  portfolioUrls?: string[] | null;

  @EnumField(() => ECosplayerApplicationStatus)
  @Expose()
  status!: ECosplayerApplicationStatus;

  @StringFieldOptional()
  @Expose()
  rejectionReason?: string | null;

  @StringFieldOptional()
  @Expose()
  reviewedById?: AutoIncrementID | null;

  @ClassFieldOptional(() => AdminUserResDto)
  @Type(() => AdminUserResDto)
  @Expose()
  reviewedBy?: AdminUserResDto | null;

  @DateFieldOptional()
  @Expose()
  reviewedAt?: Date | null;

  @StringFieldOptional()
  @Expose()
  adminNotes?: string | null;

  @DateField()
  @Expose()
  createdAt!: Date;

  @DateField()
  @Expose()
  updatedAt!: Date;
}
