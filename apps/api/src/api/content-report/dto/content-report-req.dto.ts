import { AutoIncrementID } from '../../../common/types/common.type';
import {
  EnumField,
  StringField,
  StringFieldOptional,
} from '../../../decorators/field.decorators';
import { Trim } from '../../../decorators/transform.decorators';
import { EReportTargetType } from '../constants/content-report.constant';

export class CreateContentReportReqDto {
  @EnumField(() => EReportTargetType)
  targetType!: EReportTargetType;

  @StringField()
  targetId!: AutoIncrementID;

  @StringField({ maxLength: 120 })
  @Trim()
  reason!: string;

  @StringFieldOptional({ maxLength: 1000 })
  @Trim()
  description?: string;
}
