import { AutoIncrementID } from '../../../common/types/common.type';
import {
  DateFieldOptional,
  EnumField,
  EnumFieldOptional,
  NumberFieldOptional,
  StringField,
  StringFieldOptional,
} from '../../../decorators/field.decorators';
import { Trim } from '../../../decorators/transform.decorators';
import { ECurrencyCode } from '../../cosplayer/constants/cosplayer.constant';
import { EBookingRequestStatus } from '../constants/booking.constant';

export class CreateBookingRequestReqDto {
  @StringField()
  targetCosplayerId!: AutoIncrementID;

  @StringField({ maxLength: 150 })
  @Trim()
  bookingType!: string;

  @StringField({ maxLength: 150 })
  @Trim()
  fullName!: string;

  @StringField({ maxLength: 150 })
  @Trim()
  contactInfo!: string;

  @StringField({ maxLength: 100 })
  @Trim()
  targetDateLabel!: string;

  @DateFieldOptional()
  targetStartAt?: Date;

  @DateFieldOptional()
  targetEndAt?: Date;

  @StringField({ maxLength: 120 })
  @Trim()
  budgetLabel!: string;

  @NumberFieldOptional({ min: 0 })
  budgetAmount?: number;

  @EnumFieldOptional(() => ECurrencyCode, { default: ECurrencyCode.VND })
  currency?: ECurrencyCode;

  @StringField()
  @Trim()
  details!: string;
}

export class UpdateBookingStatusReqDto {
  @EnumField(() => EBookingRequestStatus)
  status!: EBookingRequestStatus;

  @StringFieldOptional({ maxLength: 500 })
  @Trim()
  responseNote?: string;
}

export class UpdateBookingStatusAdminReqDto extends UpdateBookingStatusReqDto {}

export class SendDirectMessageReqDto {
  @StringField()
  recipientId!: AutoIncrementID;

  @StringFieldOptional()
  bookingRequestId?: AutoIncrementID;

  @StringField({ maxLength: 2000 })
  @Trim()
  content!: string;
}
