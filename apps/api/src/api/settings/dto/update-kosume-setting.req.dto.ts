import {
  BooleanFieldOptional,
  NumberFieldOptional,
  StringFieldOptional,
} from '../../../decorators/field.decorators';
import { Trim } from '../../../decorators/transform.decorators';

export class UpdateKosumeSettingReqDto {
  @NumberFieldOptional({ min: 1, max: 200 })
  max_photos_per_album?: number;

  @NumberFieldOptional({ min: 1, max: 100 })
  max_file_size_mb?: number;

  @BooleanFieldOptional()
  auto_approve_posts?: boolean;

  @BooleanFieldOptional()
  auto_approve_jobs?: boolean;

  @NumberFieldOptional({ min: 0, max: 100 })
  commission_platform_rate_percent?: number;

  @StringFieldOptional({ maxLength: 2000 })
  @Trim()
  banned_keywords?: string;

  @StringFieldOptional({ maxLength: 150 })
  @Trim()
  support_email?: string;

  @StringFieldOptional({ maxLength: 50 })
  @Trim()
  support_hotline?: string;
}
