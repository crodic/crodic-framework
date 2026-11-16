import { AutoIncrementID } from '../../../common/types/common.type';
import {
  ArrayFieldOptional,
  BooleanFieldOptional,
  DateFieldOptional,
  EmailField,
  EnumField,
  EnumFieldOptional,
  NumberFieldOptional,
  StringField,
  StringFieldOptional,
  URLFieldOptional,
} from '../../../decorators/field.decorators';
import { Trim } from '../../../decorators/transform.decorators';
import { EJobCategory, EJobStatus } from '../constants/job.constant';

export class CreateJobReqDto {
  @StringField({ maxLength: 255 })
  @Trim()
  title!: string;

  @StringFieldOptional()
  brandId?: AutoIncrementID;

  @StringField({ maxLength: 160 })
  @Trim()
  brandName!: string;

  @URLFieldOptional()
  brandLogoUrl?: string;

  @StringFieldOptional({ maxLength: 10 })
  @Trim()
  brandInitials?: string;

  @StringFieldOptional({ maxLength: 60 })
  @Trim()
  brandColor?: string;

  @BooleanFieldOptional()
  isVerified?: boolean;

  @EnumField(() => EJobCategory, { default: EJobCategory.EVENT })
  categoryCode!: EJobCategory;

  @StringField({ maxLength: 100 })
  @Trim()
  categoryLabel!: string;

  @StringField({ maxLength: 120 })
  @Trim()
  budgetLabel!: string;

  @NumberFieldOptional({ min: 0 })
  budgetMin?: number;

  @NumberFieldOptional({ min: 0 })
  budgetMax?: number;

  @StringField({ maxLength: 120 })
  @Trim()
  locationLabel!: string;

  @StringFieldOptional({ maxLength: 30 })
  @Trim()
  locationFilterCode?: string;

  @StringFieldOptional()
  cityId?: AutoIncrementID;

  @StringField({ maxLength: 50 })
  @Trim()
  deadlineLabel!: string;

  @DateFieldOptional()
  deadlineAt?: Date;

  @StringField()
  @Trim()
  requirements!: string;

  @StringField()
  @Trim()
  description!: string;

  @ArrayFieldOptional({ itemType: 'string' })
  perks?: string[];

  @ArrayFieldOptional({ itemType: 'string' })
  filterTags?: string[];

  @EmailField()
  @Trim()
  contactEmail!: string;

  @URLFieldOptional()
  thumbnailUrl?: string;

  @BooleanFieldOptional()
  isFeatured?: boolean;

  @EnumFieldOptional(() => EJobStatus, { default: EJobStatus.OPEN })
  status?: EJobStatus;
}

export class UpdateJobReqDto {
  @StringFieldOptional({ maxLength: 255 })
  @Trim()
  title?: string;

  @StringFieldOptional()
  brandId?: AutoIncrementID;

  @StringFieldOptional({ maxLength: 160 })
  @Trim()
  brandName?: string;

  @URLFieldOptional()
  brandLogoUrl?: string;

  @StringFieldOptional({ maxLength: 10 })
  @Trim()
  brandInitials?: string;

  @StringFieldOptional({ maxLength: 60 })
  @Trim()
  brandColor?: string;

  @BooleanFieldOptional()
  isVerified?: boolean;

  @EnumFieldOptional(() => EJobCategory)
  categoryCode?: EJobCategory;

  @StringFieldOptional({ maxLength: 100 })
  @Trim()
  categoryLabel?: string;

  @StringFieldOptional({ maxLength: 120 })
  @Trim()
  budgetLabel?: string;

  @NumberFieldOptional({ min: 0 })
  budgetMin?: number;

  @NumberFieldOptional({ min: 0 })
  budgetMax?: number;

  @StringFieldOptional({ maxLength: 120 })
  @Trim()
  locationLabel?: string;

  @StringFieldOptional({ maxLength: 30 })
  @Trim()
  locationFilterCode?: string;

  @StringFieldOptional()
  cityId?: AutoIncrementID;

  @StringFieldOptional({ maxLength: 50 })
  @Trim()
  deadlineLabel?: string;

  @DateFieldOptional()
  deadlineAt?: Date;

  @StringFieldOptional()
  @Trim()
  requirements?: string;

  @StringFieldOptional()
  @Trim()
  description?: string;

  @ArrayFieldOptional({ itemType: 'string' })
  perks?: string[];

  @ArrayFieldOptional({ itemType: 'string' })
  filterTags?: string[];

  @EmailField({ required: false })
  @Trim()
  contactEmail?: string;

  @URLFieldOptional()
  thumbnailUrl?: string;

  @BooleanFieldOptional()
  isFeatured?: boolean;

  @EnumFieldOptional(() => EJobStatus)
  status?: EJobStatus;
}

export class CreateJobApplicationReqDto {
  @StringField({ maxLength: 120 })
  @Trim()
  fullName!: string;

  @StringField({ maxLength: 120 })
  @Trim()
  stageName!: string;

  @StringField({ maxLength: 120 })
  @Trim()
  contactInfo!: string;

  @URLFieldOptional()
  portfolioUrl?: string;

  @StringField()
  @Trim()
  experience!: string;

  @StringFieldOptional()
  @Trim()
  message?: string;
}
