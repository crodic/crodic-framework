import {
  StringField,
  StringFieldOptional,
  URLFieldOptional,
} from '../../../decorators/field.decorators';
import { Trim } from '../../../decorators/transform.decorators';

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
