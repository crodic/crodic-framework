import { AutoIncrementID } from '../../../common/types/common.type';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum ECronJobStatus {
  RUNNING = 'RUNNING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

export enum ECronJobTriggerType {
  SCHEDULED = 'SCHEDULED',
  MANUAL = 'MANUAL',
}

@Entity('cron_job_logs')
export class CronJobLogEntity {
  @PrimaryGeneratedColumn('increment', {
    primaryKeyConstraintName: 'PK_cron_job_log_id',
    type: 'bigint',
  })
  id!: AutoIncrementID;

  @Index('IDX_cron_job_logs_job_key')
  @Column({ name: 'job_key', type: 'varchar', length: 100 })
  jobKey!: string;

  @Column({ name: 'job_name', type: 'varchar', length: 255 })
  jobName!: string;

  @Index('IDX_cron_job_logs_status')
  @Column({
    type: 'enum',
    enum: ECronJobStatus,
    default: ECronJobStatus.RUNNING,
  })
  status!: ECronJobStatus;

  @Index('IDX_cron_job_logs_trigger_type')
  @Column({
    name: 'trigger_type',
    type: 'enum',
    enum: ECronJobTriggerType,
    default: ECronJobTriggerType.SCHEDULED,
  })
  triggerType!: ECronJobTriggerType;

  @Index('IDX_cron_job_logs_triggered_by')
  @Column({ name: 'triggered_by_admin_id', type: 'bigint', nullable: true })
  triggeredByAdminId?: AutoIncrementID | null;

  @Index('IDX_cron_job_logs_started_at')
  @Column({ name: 'started_at', type: 'timestamptz' })
  startedAt!: Date;

  @Column({ name: 'finished_at', type: 'timestamptz', nullable: true })
  finishedAt?: Date | null;

  @Column({ name: 'duration_ms', type: 'integer', nullable: true })
  durationMs?: number | null;

  @Column({ type: 'text', nullable: true })
  summary?: string | null;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage?: string | null;

  @Column({ name: 'error_stack', type: 'text', nullable: true })
  errorStack?: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
