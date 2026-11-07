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
import {
  DEFAULT_MAX_TAGS_PER_ENTITY,
  ETaggableEntityType,
} from '../constants/tag.constant';

@Entity('entity_tag_configs')
@Index('UQ_entity_tag_configs_target', ['entityType', 'entityId'], {
  unique: true,
})
export class EntityTagConfigEntity extends AbstractEntity {
  constructor(data?: Partial<EntityTagConfigEntity>) {
    super();
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn('increment', {
    primaryKeyConstraintName: 'PK_entity_tag_config_id',
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

  @Column({ name: 'owner_user_id', type: 'bigint', nullable: true })
  ownerUserId?: AutoIncrementID | null;

  @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({
    name: 'owner_user_id',
    foreignKeyConstraintName: 'FK_entity_tag_configs_owner_user_id',
  })
  ownerUser?: Relation<UserEntity> | null;

  @Column({ name: 'tag_edit_locked', type: 'boolean', default: false })
  tagEditLocked!: boolean;

  @Column({
    name: 'max_tags',
    type: 'smallint',
    default: DEFAULT_MAX_TAGS_PER_ENTITY,
  })
  maxTags!: number;
}
