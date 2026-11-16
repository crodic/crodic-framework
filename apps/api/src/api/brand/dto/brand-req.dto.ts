import {
  EmailField,
  StringField,
  StringFieldOptional,
  URLFieldOptional,
} from '../../../decorators/field.decorators';
import { Trim } from '../../../decorators/transform.decorators';

export class CreateBrandReqDto {
  @StringField({ maxLength: 160 })
  @Trim()
  name!: string;

  @StringFieldOptional({ maxLength: 10 })
  @Trim()
  initials?: string;

  @StringFieldOptional({ maxLength: 50 })
  @Trim()
  color?: string;

  @URLFieldOptional()
  logoUrl?: string;

  @URLFieldOptional()
  coverUrl?: string;

  @StringFieldOptional({ maxLength: 255 })
  @Trim()
  tagline?: string;

  @StringFieldOptional()
  @Trim()
  description?: string;

  @URLFieldOptional()
  websiteUrl?: string;

  @EmailField()
  @Trim()
  contactEmail!: string;

  @StringFieldOptional({ maxLength: 40 })
  @Trim()
  contactPhone?: string;
}

export class UpdateBrandReqDto {
  @StringFieldOptional({ maxLength: 160 })
  @Trim()
  name?: string;

  @StringFieldOptional({ maxLength: 10 })
  @Trim()
  initials?: string;

  @StringFieldOptional({ maxLength: 50 })
  @Trim()
  color?: string;

  @URLFieldOptional()
  logoUrl?: string;

  @URLFieldOptional()
  coverUrl?: string;

  @StringFieldOptional({ maxLength: 255 })
  @Trim()
  tagline?: string;

  @StringFieldOptional()
  @Trim()
  description?: string;

  @URLFieldOptional()
  websiteUrl?: string;

  @EmailField({ required: false })
  @Trim()
  contactEmail?: string;

  @StringFieldOptional({ maxLength: 40 })
  @Trim()
  contactPhone?: string;
}
