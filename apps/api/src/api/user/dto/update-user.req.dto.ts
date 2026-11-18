import { OmitType } from '@nestjs/swagger';
import { CreateUserReqDto } from './create-user.req.dto';
import {
  EnumFieldOptional,
  StringFieldOptional,
} from '../../../decorators/field.decorators';
import { EUserRole } from '../constants/user.constant';

export class UpdateUserReqDto extends OmitType(CreateUserReqDto, [
  'email',
  'password',
  'confirmPassword',
] as const) {
  @EnumFieldOptional(() => EUserRole)
  role?: EUserRole;

  @StringFieldOptional()
  username?: string;
}
