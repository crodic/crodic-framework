import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { ECronJobStatus } from '../entities/cron-job-log.entity';

export class CronJobResDto {
  @ApiProperty({ example: 'purge-expired-users' })
  @Expose()
  key!: string;

  @ApiProperty({ example: 'Purge Expired Deleted Users' })
  @Expose()
  name!: string;

  @ApiProperty({ example: '0 3 * * *' })
  @Expose()
  schedule!: string;

  @ApiProperty({
    example: 'Xóa vĩnh viễn tài khoản người dùng đã soft delete quá 30 ngày',
  })
  @Expose()
  description!: string;

  @ApiProperty({ example: 'User & Auth' })
  @Expose()
  category!: string;

  @ApiPropertyOptional({
    enum: ECronJobStatus,
    example: ECronJobStatus.SUCCESS,
  })
  @Expose()
  lastStatus?: ECronJobStatus | null;

  @ApiPropertyOptional({ example: '2026-11-21T03:00:00.000Z' })
  @Expose()
  lastRunAt?: Date | null;

  @ApiPropertyOptional({ example: 450 })
  @Expose()
  lastDurationMs?: number | null;

  @ApiPropertyOptional({ example: 'Purged 0 expired users' })
  @Expose()
  lastSummary?: string | null;

  @ApiPropertyOptional({ example: '2026-11-22T03:00:00.000Z' })
  @Expose()
  nextRunAt?: Date | null;
}
