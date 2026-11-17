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
import { UserEntity } from '../../user/entities/user.entity';
import { AdminUserEntity } from '../../admin-user/entities/admin-user.entity';
import {
  EReportStatus,
  EReportTargetType,
} from '../constants/content-report.constant';

@Entity('content_reports')
@Index('IDX_content_reports_moderation', ['status', 'targetType', 'createdAt'])
@Index('IDX_content_reports_target', ['targetType', 'targetId'])
@Index(
  'UQ_content_reports_reporter_target',
  ['reporterUserId', 'targetType', 'targetId'],
  { unique: true },
)
export class ContentReportEntity extends AbstractEntity {
  constructor(data?: Partial<ContentReportEntity>) {
    super();
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn('increment', {
    primaryKeyConstraintName: 'PK_content_report_id',
    type: 'bigint',
  })
  id!: AutoIncrementID;

  @Column({ name: 'reporter_user_id', type: 'bigint' })
  reporterUserId!: AutoIncrementID;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'reporter_user_id',
    foreignKeyConstraintName: 'FK_content_reports_reporter_user_id',
  })
  reporterUser?: Relation<UserEntity>;

  @Column({
    name: 'target_type',
    type: 'enum',
    enum: EReportTargetType,
    enumName: 'report_target_type_enum',
  })
  targetType!: EReportTargetType;

  @Column({ name: 'target_id', type: 'bigint' })
  targetId!: AutoIncrementID;

  @Column({ length: 120 })
  reason!: string;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({
    type: 'enum',
    enum: EReportStatus,
    default: EReportStatus.PENDING,
    enumName: 'report_status_enum',
  })
  status!: EReportStatus;

  @Column({ name: 'resolved_by_admin_id', type: 'bigint', nullable: true })
  resolvedByAdminId?: AutoIncrementID | null;

  @ManyToOne(() => AdminUserEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({
    name: 'resolved_by_admin_id',
    foreignKeyConstraintName: 'FK_content_reports_resolved_by_admin_id',
  })
  resolvedByAdmin?: Relation<AdminUserEntity> | null;

  @Column({ name: 'resolution_note', type: 'text', nullable: true })
  resolutionNote?: string | null;

  @Column({ name: 'resolved_at', type: 'timestamptz', nullable: true })
  resolvedAt?: Date | null;
}
