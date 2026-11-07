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
import { ETagAliasType } from '../constants/tag.constant';
import { TagEntity } from './tag.entity';

@Entity('tag_aliases')
@Index('UQ_tag_aliases_normalized_alias', ['normalizedAlias'], { unique: true })
@Index('IDX_tag_aliases_unaccented_alias', ['unaccentedAlias'])
@Index('IDX_tag_aliases_tag_id', ['tagId'])
export class TagAliasEntity extends AbstractEntity {
  constructor(data?: Partial<TagAliasEntity>) {
    super();
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn('increment', {
    primaryKeyConstraintName: 'PK_tag_alias_id',
    type: 'bigint',
  })
  id!: AutoIncrementID;

  @Column({ name: 'tag_id', type: 'bigint' })
  tagId!: AutoIncrementID;

  @ManyToOne(() => TagEntity, (tag) => tag.aliases, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'tag_id',
    foreignKeyConstraintName: 'FK_tag_aliases_tag_id',
  })
  tag!: Relation<TagEntity>;

  @Column({ name: 'alias_name', length: 120 })
  aliasName!: string;

  @Column({ name: 'normalized_alias', length: 140 })
  normalizedAlias!: string;

  @Column({ name: 'unaccented_alias', length: 140 })
  unaccentedAlias!: string;

  @Column({
    name: 'alias_type',
    type: 'enum',
    enum: ETagAliasType,
    default: ETagAliasType.SYNONYM,
  })
  aliasType!: ETagAliasType;

  @Column({ type: 'varchar', length: 16, nullable: true })
  locale?: string | null;
}
