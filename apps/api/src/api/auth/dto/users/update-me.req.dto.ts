import {
  BooleanFieldOptional,
  StringFieldOptional,
} from '../../../../decorators/field.decorators';
import { Trim } from '../../../../decorators/transform.decorators';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateAuthUserMeReqDto {
  @StringFieldOptional()
  @Trim()
  firstName?: string;

  @StringFieldOptional()
  @Trim()
  lastName?: string;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Avatar image file (JPEG/PNG/WebP only, max size 5MB)',
  })
  avatar?: string;

  @BooleanFieldOptional()
  removeAvatar?: boolean;
}
