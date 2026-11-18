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

@Entity('event_participants')
@Index('IDX_event_participants_event_sort', ['eventId', 'sortOrder'])
@Index('UQ_event_participants_event_user', ['eventId', 'userId'], {
  unique: true,
})
export class EventParticipantEntity extends AbstractEntity {
  constructor(data?: Partial<EventParticipantEntity>) {
    super();
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn('increment', {
    primaryKeyConstraintName: 'PK_event_participant_id',
    type: 'bigint',
  })
  id!: AutoIncrementID;

  @Column({ name: 'event_id', type: 'bigint' })
  eventId!: AutoIncrementID;

  @ManyToOne(() => EventEntity, (event) => event.participants, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'event_id',
    foreignKeyConstraintName: 'FK_event_participants_event_id',
  })
  event?: Relation<EventEntity>;

  @Column({ name: 'user_id', type: 'bigint' })
  userId!: AutoIncrementID;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'user_id',
    foreignKeyConstraintName: 'FK_event_participants_user_id',
  })
  user?: Relation<UserEntity>;

  @Column({ name: 'role_label', type: 'varchar', length: 100, nullable: true })
  roleLabel?: string | null;

  @Column({ name: 'sort_order', type: 'smallint', default: 0 })
  sortOrder!: number;
}
