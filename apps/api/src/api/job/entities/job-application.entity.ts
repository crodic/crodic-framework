import { AutoIncrementID } from '../../../common/types/common.type';
import { AbstractEntity } from '../../../database/entities/abstract.entity';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';
import { JobEntity } from './job.entity';
import { UserEntity } from '../../user/entities/user.entity';
import { EJobApplicationStatus } from '../constants/job.constant';

@Entity('job_applications')
@Index('UQ_job_applications_job_applicant', ['jobId', 'applicantUserId'], {
  unique: true,
})
@Index('IDX_job_applications_applicant', ['applicantUserId', 'createdAt'])
export class JobApplicationEntity extends AbstractEntity {
  constructor(data?: Partial<JobApplicationEntity>) {
    super();
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn('increment', {
    primaryKeyConstraintName: 'PK_job_application_id',
    type: 'bigint',
  })
  id!: AutoIncrementID;

  @Column({ name: 'job_id', type: 'bigint' })
  jobId!: AutoIncrementID;

  @ManyToOne(() => JobEntity, (job) => job.applications, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'job_id',
    foreignKeyConstraintName: 'FK_job_applications_job_id',
  })
  job?: Relation<JobEntity>;

  @Column({ name: 'applicant_user_id', type: 'bigint' })
  applicantUserId!: AutoIncrementID;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'applicant_user_id',
    foreignKeyConstraintName: 'FK_job_applications_applicant_user_id',
  })
  applicantUser?: Relation<UserEntity>;

  @Column({ name: 'full_name', length: 120 })
  fullName!: string;

  @Column({ name: 'stage_name', length: 120 })
  stageName!: string;

  @Column({ name: 'contact_info', length: 120 })
  contactInfo!: string;

  @Column({
    name: 'portfolio_url',
    type: 'varchar',
    length: 300,
    nullable: true,
  })
  portfolioUrl?: string | null;

  @Column({ type: 'text' })
  experience!: string;

  @Column({ type: 'text', nullable: true })
  message?: string | null;

  @Column({
    type: 'enum',
    enum: EJobApplicationStatus,
    default: EJobApplicationStatus.PENDING,
    enumName: 'job_application_status_enum',
  })
  status!: EJobApplicationStatus;

  @Column({ name: 'reviewer_note', type: 'text', nullable: true })
  reviewerNote?: string | null;

  @Column({ name: 'reviewed_at', type: 'timestamptz', nullable: true })
  reviewedAt?: Date | null;
}
