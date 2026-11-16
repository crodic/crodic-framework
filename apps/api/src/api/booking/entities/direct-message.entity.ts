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

@Entity('direct_messages')
@Index('IDX_direct_messages_recipient_unread', [
  'recipientId',
  'isRead',
  'createdAt',
])
export class DirectMessageEntity extends AbstractEntity {
  constructor(data?: Partial<DirectMessageEntity>) {
    super();
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn('increment', {
    primaryKeyConstraintName: 'PK_direct_message_id',
    type: 'bigint',
  })
  id!: AutoIncrementID;

  @Column({ name: 'sender_id', type: 'bigint' })
  senderId!: AutoIncrementID;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'sender_id',
    foreignKeyConstraintName: 'FK_direct_messages_sender_id',
  })
  sender?: Relation<UserEntity>;

  @Column({ name: 'recipient_id', type: 'bigint' })
  recipientId!: AutoIncrementID;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'recipient_id',
    foreignKeyConstraintName: 'FK_direct_messages_recipient_id',
  })
  recipient?: Relation<UserEntity>;

  @Column({ type: 'text' })
  content!: string;

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
