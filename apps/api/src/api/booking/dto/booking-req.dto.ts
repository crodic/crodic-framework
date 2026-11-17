import { AutoIncrementID } from '../../../common/types/common.type';
import {
  EnumField,
  StringField,
  StringFieldOptional,
} from '../../../decorators/field.decorators';
import { Trim } from '../../../decorators/transform.decorators';
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

  @StringField({ maxLength: 120 })
  @Trim()
  budgetLabel!: string;

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

  @StringField({ maxLength: 2000 })
  @Trim()
  content!: string;
}
