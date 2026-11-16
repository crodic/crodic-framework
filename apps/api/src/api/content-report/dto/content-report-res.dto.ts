import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AutoIncrementID } from '../../../common/types/common.type';
import {
  EReportStatus,
  EReportTargetType,
} from '../constants/content-report.constant';

export class ContentReportResDto {
  @ApiProperty({ type: String, example: '1' })
  id!: AutoIncrementID;

  @ApiProperty({ type: String, example: '100' })
  reporterUserId!: AutoIncrementID;

  @ApiProperty({ enum: EReportTargetType, example: EReportTargetType.POST })
  targetType!: EReportTargetType;

  @ApiProperty({ type: String, example: '5' })
  targetId!: AutoIncrementID;

  @ApiProperty({ example: 'Nội dung phản cảm hoặc không phù hợp' })
  reason!: string;

  @ApiPropertyOptional({ example: 'Chi tiết báo cáo vi phạm...' })
  description?: string | null;

  @ApiProperty({ enum: EReportStatus, example: EReportStatus.PENDING })
  status!: EReportStatus;

  @ApiProperty()
  createdAt!: Date;
}
