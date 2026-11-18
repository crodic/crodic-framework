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

@Entity('event_interests')
@Index('UQ_event_interests_pair', ['eventId', 'userId'], { unique: true })
export class EventInterestEntity extends AbstractEntity {
  constructor(data?: Partial<EventInterestEntity>) {
    super();
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn('increment', {
    primaryKeyConstraintName: 'PK_event_interest_id',
    type: 'bigint',
  })
  id!: AutoIncrementID;

  @Column({ name: 'event_id', type: 'bigint' })
  eventId!: AutoIncrementID;

  @ManyToOne(() => EventEntity, (event) => event.interests, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'event_id',
    foreignKeyConstraintName: 'FK_event_interests_event_id',
  })
  event?: Relation<EventEntity>;

  @Column({ name: 'user_id', type: 'bigint' })
  userId!: AutoIncrementID;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'user_id',
    foreignKeyConstraintName: 'FK_event_interests_user_id',
  })
  user?: Relation<UserEntity>;
}
