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
import { ETagRelationType } from '../constants/tag.constant';
import { TagEntity } from './tag.entity';

@Entity('tag_relations')
@Index(
  'UQ_tag_relations_edge',
  ['sourceTagId', 'targetTagId', 'relationType'],
  { unique: true },
)
@Index('IDX_tag_relations_source_type', ['sourceTagId', 'relationType'])
@Index('IDX_tag_relations_target_type', ['targetTagId', 'relationType'])
export class TagRelationEntity extends AbstractEntity {
  constructor(data?: Partial<TagRelationEntity>) {
    super();
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn('increment', {
    primaryKeyConstraintName: 'PK_tag_relation_id',
    type: 'bigint',
  })
  id!: AutoIncrementID;

  @Column({ name: 'source_tag_id', type: 'bigint' })
  sourceTagId!: AutoIncrementID;

  @ManyToOne(() => TagEntity, (tag) => tag.outgoingRelations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'source_tag_id',
    foreignKeyConstraintName: 'FK_tag_relations_source_tag_id',
  })
  sourceTag!: Relation<TagEntity>;

  @Column({ name: 'target_tag_id', type: 'bigint' })
  targetTagId!: AutoIncrementID;

  @ManyToOne(() => TagEntity, (tag) => tag.incomingRelations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'target_tag_id',
    foreignKeyConstraintName: 'FK_tag_relations_target_tag_id',
  })
  targetTag!: Relation<TagEntity>;

  @Column({
    name: 'relation_type',
    type: 'enum',
    enum: ETagRelationType,
    default: ETagRelationType.HIERARCHY,
  })
  relationType!: ETagRelationType;

  @Column({ name: 'sort_order', type: 'smallint', default: 0 })
  sortOrder!: number;
}
