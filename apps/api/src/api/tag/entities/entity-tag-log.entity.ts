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
import { AdminUserEntity } from '../../admin-user/entities/admin-user.entity';
import { UserEntity } from '../../user/entities/user.entity';
import {
  EEntityTagLogAction,
  ETaggableEntityType,
} from '../constants/tag.constant';
import { TagEntity } from './tag.entity';

@Entity('entity_tag_logs')
@Index('IDX_entity_tag_logs_target_created', [
  'entityType',
  'entityId',
  'createdAt',
])
@Index('IDX_entity_tag_logs_actor_user', ['actorUserId'])
export class EntityTagLogEntity extends AbstractEntity {
  constructor(data?: Partial<EntityTagLogEntity>) {
    super();
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn('increment', {
    primaryKeyConstraintName: 'PK_entity_tag_log_id',
    type: 'bigint',
  })
  id!: AutoIncrementID;

  @Column({
    name: 'entity_type',
    type: 'enum',
    enum: ETaggableEntityType,
  })
  entityType!: ETaggableEntityType;

  @Column({ name: 'entity_id', type: 'bigint' })
  entityId!: AutoIncrementID;

  @Column({ name: 'tag_id', type: 'bigint', nullable: true })
  tagId?: AutoIncrementID | null;

  @ManyToOne(() => TagEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({
    name: 'tag_id',
    foreignKeyConstraintName: 'FK_entity_tag_logs_tag_id',
  })
  tag?: Relation<TagEntity> | null;

  @Column({
    name: 'tag_name_snapshot',
    type: 'varchar',
    length: 120,
    nullable: true,
  })
  tagNameSnapshot?: string | null;

  @Column({
    type: 'enum',
    enum: EEntityTagLogAction,
  })
  action!: EEntityTagLogAction;

  @Column({ name: 'actor_user_id', type: 'bigint', nullable: true })
  actorUserId?: AutoIncrementID | null;

  @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({
    name: 'actor_user_id',
    foreignKeyConstraintName: 'FK_entity_tag_logs_actor_user_id',
  })
  actorUser?: Relation<UserEntity> | null;

  @Column({ name: 'actor_admin_id', type: 'bigint', nullable: true })
  actorAdminId?: AutoIncrementID | null;

  @ManyToOne(() => AdminUserEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({
    name: 'actor_admin_id',
    foreignKeyConstraintName: 'FK_entity_tag_logs_actor_admin_id',
  })
  actorAdmin?: Relation<AdminUserEntity> | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown> | null;
}
