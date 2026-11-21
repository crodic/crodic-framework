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
import { ECosplayerApplicationStatus } from '../constants/cosplayer-application.constant';

@Entity('cosplayer_applications')
@Index('IDX_cosplayer_applications_user_id', ['userId'])
@Index('IDX_cosplayer_applications_status', ['status'])
export class CosplayerApplicationEntity extends AbstractEntity {
  constructor(data?: Partial<CosplayerApplicationEntity>) {
    super();
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn('increment', {
    primaryKeyConstraintName: 'PK_cosplayer_application_id',
    type: 'bigint',
  })
  id!: AutoIncrementID;

  @Column({ name: 'user_id', type: 'bigint' })
  userId!: AutoIncrementID;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'user_id',
    foreignKeyConstraintName: 'FK_cosplayer_applications_user_id',
  })
  user?: Relation<UserEntity>;

  @Column({ name: 'stage_name', length: 100 })
  stageName!: string;

  @Column({ type: 'text' })
  bio!: string;

  @Column({ name: 'social_links', type: 'jsonb', nullable: true })
  socialLinks?: Record<string, string> | null;

  @Column({ name: 'portfolio_urls', type: 'text', array: true, nullable: true })
  portfolioUrls?: string[] | null;

  @Column({
    type: 'enum',
    enum: ECosplayerApplicationStatus,
    default: ECosplayerApplicationStatus.PENDING,
    enumName: 'cosplayer_application_status_enum',
  })
  status!: ECosplayerApplicationStatus;

  @Column({ name: 'rejection_reason', type: 'text', nullable: true })
  rejectionReason?: string | null;

  @Column({ name: 'reviewed_by_id', type: 'bigint', nullable: true })
  reviewedById?: AutoIncrementID | null;

  @ManyToOne(() => AdminUserEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({
    name: 'reviewed_by_id',
    foreignKeyConstraintName: 'FK_cosplayer_applications_reviewed_by_id',
  })
  reviewedBy?: Relation<AdminUserEntity> | null;

  @Column({ name: 'reviewed_at', type: 'timestamptz', nullable: true })
  reviewedAt?: Date | null;

  @Column({ name: 'admin_notes', type: 'text', nullable: true })
  adminNotes?: string | null;
}
