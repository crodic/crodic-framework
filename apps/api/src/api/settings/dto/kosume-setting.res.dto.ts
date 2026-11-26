import {
  BooleanField,
  NumberField,
  NumberFieldOptional,
  StringField,
} from '../../../decorators/field.decorators';

export class KosumeSettingResDto {
  @NumberField({ min: 1, max: 200 })
  max_photos_per_album!: number;

  @NumberField({ min: 1, max: 100 })
  max_file_size_mb!: number;

  @BooleanField()
  auto_approve_posts!: boolean;

  @NumberField({ min: 0, max: 100 })
  commission_platform_rate_percent!: number;

  @NumberFieldOptional({ min: 0, max: 100 })
  cosplay_confidence_threshold_percent?: number;

  @StringField()
  banned_keywords!: string;

  @StringField()
  support_email!: string;

  @StringField()
  support_hotline!: string;
}
