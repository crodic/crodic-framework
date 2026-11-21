import { OmitType } from '@nestjs/swagger';
import {
  BooleanField,
  ClassFieldOptional,
  StringFieldOptional,
} from '../../../decorators/field.decorators';
import {
  AdminCosplayerProfileInputDto,
  CreateUserReqDto,
} from './create-user.req.dto';

export class UpdateUserReqDto extends OmitType(CreateUserReqDto, [
  'email',
  'password',
  'confirmPassword',
] as const) {
  @StringFieldOptional({ maxLength: 80 })
  username?: string;

  @ClassFieldOptional(() => AdminCosplayerProfileInputDto)
  cosplayerProfile?: AdminCosplayerProfileInputDto;
}

export class HandleCosplayerRequestReqDto {
  @BooleanField()
  approved!: boolean;
}
