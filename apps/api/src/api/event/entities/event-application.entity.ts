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
import { EventEntity } from './event.entity';
import { UserEntity } from '../../user/entities/user.entity';
import { AdminUserEntity } from '../../admin-user/entities/admin-user.entity';
import { EEventApplicationStatus } from '../constants/event.constant';

@Entity('event_applications')
@Index(
  'UQ_event_applications_event_user_cat',
  ['eventId', 'applicantUserId', 'category'],
  { unique: true },
)
export class EventApplicationEntity extends AbstractEntity {
  constructor(data?: Partial<EventApplicationEntity>) {
    super();
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn('increment', {
    primaryKeyConstraintName: 'PK_event_application_id',
    type: 'bigint',
  })
  id!: AutoIncrementID;

  @Column({ name: 'event_id', type: 'bigint' })
  eventId!: AutoIncrementID;

  @ManyToOne(() => EventEntity, (event) => event.applications, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'event_id',
    foreignKeyConstraintName: 'FK_event_applications_event_id',
  })
  event?: Relation<EventEntity>;

  @Column({ name: 'applicant_user_id', type: 'bigint' })
  applicantUserId!: AutoIncrementID;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'applicant_user_id',
    foreignKeyConstraintName: 'FK_event_applications_applicant_user_id',
  })
  applicantUser?: Relation<UserEntity>;

  @Column({ name: 'full_name', length: 150 })
  fullName!: string;

  @Column({ name: 'stage_name', length: 150 })
  stageName!: string;

  @Column({ length: 120 })
  category!: string;

  @Column({ length: 50 })
  phone!: string;

  @Column({ name: 'character_planned', length: 255 })
  characterPlanned!: string;

  @Column({
    name: 'portfolio_url',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  portfolioUrl?: string | null;

  @Column({ type: 'text', nullable: true })
  notes?: string | null;

  @Column({
    type: 'enum',
    enum: EEventApplicationStatus,
    default: EEventApplicationStatus.PENDING,
    enumName: 'event_application_status_enum',
  })
  status!: EEventApplicationStatus;

  @Column({ name: 'reviewed_by_admin_id', type: 'bigint', nullable: true })
  reviewedByAdminId?: AutoIncrementID | null;

  @ManyToOne(() => AdminUserEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({
    name: 'reviewed_by_admin_id',
    foreignKeyConstraintName: 'FK_event_applications_reviewed_by_admin_id',
  })
  reviewedByAdmin?: Relation<AdminUserEntity> | null;

  @Column({ name: 'reviewed_at', type: 'timestamptz', nullable: true })
  reviewedAt?: Date | null;
}
