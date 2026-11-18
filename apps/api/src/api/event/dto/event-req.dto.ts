import { AutoIncrementID } from '../../../common/types/common.type';
import {
  ArrayFieldOptional,
  BooleanFieldOptional,
  DateField,
  DateFieldOptional,
  EnumField,
  EnumFieldOptional,
  NumberFieldOptional,
  StringField,
  StringFieldOptional,
  URLField,
  URLFieldOptional,
} from '../../../decorators/field.decorators';
import { Trim } from '../../../decorators/transform.decorators';
import { EEventStatus } from '../constants/event.constant';

export class EventScheduleItemInputDto {
  @StringField({ maxLength: 50 })
  @Trim()
  time!: string;

  @StringField({ maxLength: 300 })
  @Trim()
  activity!: string;
}

export class CreateEventApplicationReqDto {
  @StringField({ maxLength: 150 })
  @Trim()
  fullName!: string;

  @StringField({ maxLength: 150 })
  @Trim()
  stageName!: string;

  @StringField({ maxLength: 120 })
  @Trim()
  category!: string;

  @StringField({ maxLength: 50 })
  @Trim()
  phone!: string;

  @StringField({ maxLength: 255 })
  @Trim()
  characterPlanned!: string;

  @URLFieldOptional()
  portfolioUrl?: string;

  @StringFieldOptional()
  @Trim()
  notes?: string;
}

export class ParticipateEventReqDto {
  @StringFieldOptional({ maxLength: 255 })
  @Trim()
  characterPlanned?: string;
}

export class CreateEventReqDto {
  @StringField({ maxLength: 220 })
  @Trim()
  title!: string;

  @DateField()
  startAt!: Date;

  @DateFieldOptional()
  endAt?: Date;

  @StringField({ maxLength: 100 })
  @Trim()
  locationLabel!: string;

  @StringFieldOptional()
  cityId?: AutoIncrementID;

  @StringFieldOptional()
  organizerUserId?: AutoIncrementID;

  @StringFieldOptional({ maxLength: 160 })
  @Trim()
  organizerName?: string;

  @StringField({ maxLength: 255 })
  @Trim()
  venue!: string;

  @URLField()
  imageUrl!: string;

  @URLFieldOptional()
  bannerImageUrl?: string;

  @StringField()
  @Trim()
  description!: string;

  @NumberFieldOptional({ min: 0 })
  ticketPriceAmount?: number;

  @BooleanFieldOptional()
  isRecruiting?: boolean;

  @BooleanFieldOptional()
  isFeaturedFestival?: boolean;

  @ArrayFieldOptional(EventScheduleItemInputDto)
  schedule?: EventScheduleItemInputDto[];

  @StringFieldOptional({ each: true })
  categories?: string[];

  @EnumFieldOptional(() => EEventStatus, { default: EEventStatus.UPCOMING })
  status?: EEventStatus;
}

export class UpdateEventReqDto {
  @StringFieldOptional({ maxLength: 220 })
  @Trim()
  title?: string;

  @DateFieldOptional()
  startAt?: Date;

  @DateFieldOptional()
  endAt?: Date;

  @StringFieldOptional({ maxLength: 100 })
  @Trim()
  locationLabel?: string;

  @StringFieldOptional()
  cityId?: AutoIncrementID;

  @StringFieldOptional()
  organizerUserId?: AutoIncrementID;

  @StringFieldOptional({ maxLength: 160 })
  @Trim()
  organizerName?: string;

  @StringFieldOptional({ maxLength: 255 })
  @Trim()
  venue?: string;

  @URLFieldOptional()
  imageUrl?: string;

  @URLFieldOptional()
  bannerImageUrl?: string;

  @StringFieldOptional()
  @Trim()
  description?: string;

  @NumberFieldOptional({ min: 0 })
  ticketPriceAmount?: number;

  @BooleanFieldOptional()
  isRecruiting?: boolean;

  @BooleanFieldOptional()
  isFeaturedFestival?: boolean;

  @ArrayFieldOptional(EventScheduleItemInputDto)
  schedule?: EventScheduleItemInputDto[];

  @StringFieldOptional({ each: true })
  categories?: string[];

  @EnumFieldOptional(() => EEventStatus)
  status?: EEventStatus;
}

export class UpdateEventStatusReqDto {
  @EnumField(() => EEventStatus)
  status!: EEventStatus;

  @BooleanFieldOptional()
  isFeaturedFestival?: boolean;

  @BooleanFieldOptional()
  isRecruiting?: boolean;
}
