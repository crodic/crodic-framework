import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { ECronJobStatus } from '../entities/cron-job-log.entity';

export class TriggerCronJobResDto {
  @ApiProperty({ example: true })
  @Expose()
  success!: boolean;

  @ApiProperty({ example: 'purge-expired-users' })
  @Expose()
  jobKey!: string;

  @ApiProperty({ enum: ECronJobStatus, example: ECronJobStatus.SUCCESS })
  @Expose()
  status!: ECronJobStatus;

  @ApiProperty({ example: 'Job executed successfully' })
  @Expose()
  message!: string;

  @ApiProperty({ example: 340 })
  @Expose()
  durationMs!: number;

  @ApiProperty({ example: 'Purged 0 expired users' })
  @Expose()
  summary?: string | null;
}
