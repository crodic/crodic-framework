import { AutoIncrementID } from '../../../common/types/common.type';
import { AbstractEntity } from '../../../database/entities/abstract.entity';
import {
  Column,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';
import { UserEntity } from '../../user/entities/user.entity';
import {
  ENotificationCategory,
  ENotificationType,
} from '../constants/notification.constant';

@Entity('notifications')
@Index('IDX_notifications_inbox', [
  'recipientUserId',
  'isRead',
  'category',
  'createdAt',
])
@Index('IDX_notifications_subject', ['subjectType', 'subjectId'])
export class NotificationEntity extends AbstractEntity {
  constructor(data?: Partial<NotificationEntity>) {
    super();
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn('increment', {
    primaryKeyConstraintName: 'PK_notification_id',
    type: 'bigint',
  })
  id!: AutoIncrementID;

  @Column({ name: 'recipient_user_id', type: 'bigint' })
  recipientUserId!: AutoIncrementID;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'recipient_user_id',
    foreignKeyConstraintName: 'FK_notifications_recipient_user_id',
  })
  recipientUser?: Relation<UserEntity>;

  @Column({
    type: 'enum',
    enum: ENotificationCategory,
    enumName: 'notification_category_enum',
  })
  category!: ENotificationCategory;

  @Column({
    type: 'enum',
    enum: ENotificationType,
    enumName: 'notification_type_enum',
  })
  type!: ENotificationType;

  @Column({ name: 'actor_user_id', type: 'bigint', nullable: true })
  actorUserId?: AutoIncrementID | null;

  @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({
    name: 'actor_user_id',
    foreignKeyConstraintName: 'FK_notifications_actor_user_id',
  })
  actorUser?: Relation<UserEntity> | null;

  @Column({ length: 220 })
  title!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ name: 'action_url', type: 'varchar', length: 300, nullable: true })
  actionUrl?: string | null;

  @Column({
    name: 'preview_image_url',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  previewImageUrl?: string | null;

  @Column({ name: 'subject_type', type: 'varchar', length: 50, nullable: true })
  subjectType?: string | null;

  @Column({ name: 'subject_id', type: 'bigint', nullable: true })
  subjectId?: AutoIncrementID | null;

  @Column({ name: 'is_read', type: 'boolean', default: false })
  isRead!: boolean;

  @Column({ name: 'read_at', type: 'timestamptz', nullable: true })
  readAt?: Date | null;

  @DeleteDateColumn({
    name: 'deleted_at',
    type: 'timestamptz',
    default: null,
  })
  deletedAt?: Date | null;
}
