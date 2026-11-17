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
import { BookingRequestEntity } from './booking-request.entity';

@Entity('direct_messages')
@Index('IDX_direct_messages_recipient_unread', [
  'recipientId',
  'isRead',
  'createdAt',
])
@Index('IDX_direct_messages_conversation', [
  'senderId',
  'recipientId',
  'createdAt',
])
@Index('IDX_direct_messages_booking_request', ['bookingRequestId', 'createdAt'])
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

  @Column({ name: 'booking_request_id', type: 'bigint', nullable: true })
  bookingRequestId?: AutoIncrementID | null;

  @ManyToOne(() => BookingRequestEntity, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({
    name: 'booking_request_id',
    foreignKeyConstraintName: 'FK_direct_messages_booking_request_id',
  })
  bookingRequest?: Relation<BookingRequestEntity> | null;

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
