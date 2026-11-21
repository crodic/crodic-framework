import { AutoIncrementID } from '../../../../common/types/common.type';
import {
  ClassFieldOptional,
  EmailField,
  PasswordField,
  StringField,
  StringFieldOptional,
} from '../../../../decorators/field.decorators';

export class UserRegisterReqDto {
  @StringField()
  firstName!: string;

  @StringFieldOptional()
  lastName?: string;

  @EmailField()
  email!: string;

  @PasswordField()
  password!: string;

  @ClassFieldOptional(() => String)
  roleId?: AutoIncrementID;

  @StringFieldOptional()
  username?: string;

  @StringFieldOptional()
  handle?: string;

  @StringFieldOptional()
  displayName?: string;

  @StringFieldOptional()
  roleBadge?: string;

  @StringFieldOptional()
  locationLabel?: string;

  @ClassFieldOptional(() => [String])
  specialties?: string[];

  @StringFieldOptional()
  bio?: string;
}
