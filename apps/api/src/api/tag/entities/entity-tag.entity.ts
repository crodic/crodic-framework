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
import { ETaggableEntityType } from '../constants/tag.constant';
import { TagEntity } from './tag.entity';

@Entity('entity_tags')
@Index('UQ_entity_tags_target_tag', ['entityType', 'entityId', 'tagId'], {
  unique: true,
})
@Index('IDX_entity_tags_target_sort', ['entityType', 'entityId', 'sortOrder'])
@Index('IDX_entity_tags_tag_entity_type', ['tagId', 'entityType'])
export class EntityTagEntity extends AbstractEntity {
  constructor(data?: Partial<EntityTagEntity>) {
    super();
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn('increment', {
    primaryKeyConstraintName: 'PK_entity_tag_id',
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

  @Column({ name: 'tag_id', type: 'bigint' })
  tagId!: AutoIncrementID;

  @ManyToOne(() => TagEntity, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'tag_id',
    foreignKeyConstraintName: 'FK_entity_tags_tag_id',
  })
  tag!: Relation<TagEntity>;

  @Column({ name: 'is_author_tag', type: 'boolean', default: false })
  isAuthorTag!: boolean;

  @Column({ name: 'is_locked', type: 'boolean', default: false })
  isLocked!: boolean;

  @Column({ name: 'sort_order', type: 'smallint', default: 0 })
  sortOrder!: number;

  @Column({ name: 'added_by_user_id', type: 'bigint', nullable: true })
  addedByUserId?: AutoIncrementID | null;

  @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({
    name: 'added_by_user_id',
    foreignKeyConstraintName: 'FK_entity_tags_added_by_user_id',
  })
  addedByUser?: Relation<UserEntity> | null;

  @Column({ name: 'added_by_admin_id', type: 'bigint', nullable: true })
  addedByAdminId?: AutoIncrementID | null;

  @ManyToOne(() => AdminUserEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({
    name: 'added_by_admin_id',
    foreignKeyConstraintName: 'FK_entity_tags_added_by_admin_id',
  })
  addedByAdmin?: Relation<AdminUserEntity> | null;
}
