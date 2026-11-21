import { AutoIncrementID } from '../../../common/types/common.type';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import {
  ECronJobStatus,
  ECronJobTriggerType,
} from '../entities/cron-job-log.entity';

export class CronJobLogResDto {
  @ApiProperty({ example: '1' })
  @Expose()
  id!: AutoIncrementID;

  @ApiProperty({ example: 'purge-expired-users' })
  @Expose()
  jobKey!: string;

  @ApiProperty({ example: 'Purge Expired Deleted Users' })
  @Expose()
  jobName!: string;

  @ApiProperty({ enum: ECronJobStatus, example: ECronJobStatus.SUCCESS })
  @Expose()
  status!: ECronJobStatus;

  @ApiProperty({
    enum: ECronJobTriggerType,
    example: ECronJobTriggerType.SCHEDULED,
  })
  @Expose()
  triggerType!: ECronJobTriggerType;

  @ApiPropertyOptional({ example: '1' })
  @Expose()
  triggeredByAdminId?: AutoIncrementID | null;

  @ApiProperty({ example: '2026-11-21T03:00:00.000Z' })
  @Expose()
  startedAt!: Date;

  @ApiPropertyOptional({ example: '2026-11-21T03:00:01.200Z' })
  @Expose()
  finishedAt?: Date | null;

  @ApiPropertyOptional({ example: 1200 })
  @Expose()
  durationMs?: number | null;

  @ApiPropertyOptional({ example: 'Purged 0 expired users' })
  @Expose()
  summary?: string | null;

  @ApiPropertyOptional({ example: 'Connection timeout' })
  @Expose()
  errorMessage?: string | null;

  @ApiPropertyOptional()
  @Expose()
  errorStack?: string | null;

  @ApiProperty({ example: '2026-11-21T03:00:00.000Z' })
  @Expose()
  createdAt!: Date;

  @ApiProperty({ example: '2026-11-21T03:00:00.000Z' })
  @Expose()
  updatedAt!: Date;
}
