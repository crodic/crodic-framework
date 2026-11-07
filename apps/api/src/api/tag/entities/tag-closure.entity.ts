import { AutoIncrementID } from '../../../common/types/common.type';
import {
  BaseEntity,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  Relation,
} from 'typeorm';
import { TagEntity } from './tag.entity';

@Entity('tag_closure')
@Index('IDX_tag_closure_descendant_depth', ['descendantId', 'depth'])
@Index('IDX_tag_closure_ancestor_depth', ['ancestorId', 'depth'])
export class TagClosureEntity extends BaseEntity {
  constructor(data?: Partial<TagClosureEntity>) {
    super();
    Object.assign(this, data);
  }

  @PrimaryColumn({
    name: 'ancestor_id',
    type: 'bigint',
    primaryKeyConstraintName: 'PK_tag_closure',
  })
  ancestorId!: AutoIncrementID;

  @ManyToOne(() => TagEntity, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'ancestor_id',
    foreignKeyConstraintName: 'FK_tag_closure_ancestor_id',
  })
  ancestor!: Relation<TagEntity>;

  @PrimaryColumn({
    name: 'descendant_id',
    type: 'bigint',
    primaryKeyConstraintName: 'PK_tag_closure',
  })
  descendantId!: AutoIncrementID;

  @ManyToOne(() => TagEntity, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'descendant_id',
    foreignKeyConstraintName: 'FK_tag_closure_descendant_id',
  })
  descendant!: Relation<TagEntity>;

  @Column({ type: 'smallint', default: 0 })
  depth!: number;
}
