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
import { EBookingRequestStatus } from '../constants/booking.constant';

@Entity('booking_requests')
@Index('IDX_booking_requests_target_status', [
  'targetCosplayerId',
  'status',
  'createdAt',
])
@Index('IDX_booking_requests_requester', ['requesterUserId', 'createdAt'])
export class BookingRequestEntity extends AbstractEntity {
  constructor(data?: Partial<BookingRequestEntity>) {
    super();
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn('increment', {
    primaryKeyConstraintName: 'PK_booking_request_id',
    type: 'bigint',
  })
  id!: AutoIncrementID;

  @Column({ name: 'target_cosplayer_id', type: 'bigint' })
  targetCosplayerId!: AutoIncrementID;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'target_cosplayer_id',
    foreignKeyConstraintName: 'FK_booking_requests_target_cosplayer_id',
  })
  targetCosplayer?: Relation<UserEntity>;

  @Column({ name: 'requester_user_id', type: 'bigint' })
  requesterUserId!: AutoIncrementID;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'requester_user_id',
    foreignKeyConstraintName: 'FK_booking_requests_requester_user_id',
  })
  requesterUser?: Relation<UserEntity>;

  @Column({ name: 'booking_type', length: 150 })
  bookingType!: string;

  @Column({ name: 'full_name', length: 150 })
  fullName!: string;

  @Column({ name: 'contact_info', length: 150 })
  contactInfo!: string;

  @Column({ name: 'target_date_label', length: 100 })
  targetDateLabel!: string;

  @Column({ name: 'budget_label', length: 120 })
  budgetLabel!: string;

  @Column({ type: 'text' })
  details!: string;

  @Column({
    type: 'enum',
    enum: EBookingRequestStatus,
    default: EBookingRequestStatus.PENDING,
    enumName: 'booking_request_status_enum',
  })
  status!: EBookingRequestStatus;

  @Column({ name: 'response_note', type: 'text', nullable: true })
  responseNote?: string | null;

  @Column({ name: 'responded_at', type: 'timestamptz', nullable: true })
  respondedAt?: Date | null;

  @DeleteDateColumn({
    name: 'deleted_at',
    type: 'timestamptz',
    default: null,
  })
  deletedAt?: Date | null;
}
