import { AutoIncrementID } from '../../../common/types/common.type';
import { AbstractEntity } from '../../../database/entities/abstract.entity';
import {
  Column,
  DeleteDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';
import { TagEntity } from './tag.entity';

@Entity('tag_categories')
@Index('UQ_tag_categories_slug', ['slug'], {
  unique: true,
  where: '"deleted_at" IS NULL',
})
@Index('IDX_tag_categories_sort_order', ['sortOrder'])
@Index('IDX_tag_categories_is_active', ['isActive'])
export class TagCategoryEntity extends AbstractEntity {
  constructor(data?: Partial<TagCategoryEntity>) {
    super();
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn('increment', {
    primaryKeyConstraintName: 'PK_tag_category_id',
    type: 'bigint',
  })
  id!: AutoIncrementID;

  @Column({ length: 60 })
  slug!: string;

  @Column({ length: 100 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({ length: 30, default: '#64748b' })
  color!: string;

  @Column({ length: 50, default: 'Tag' })
  icon!: string;

  @Column({ name: 'sort_order', type: 'integer', default: 0 })
  sortOrder!: number;

  @Column({ name: 'is_system', type: 'boolean', default: false })
  isSystem!: boolean;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @DeleteDateColumn({
    name: 'deleted_at',
    type: 'timestamptz',
    default: null,
  })
  deletedAt?: Date | null;

  @OneToMany(() => TagEntity, (tag) => tag.categoryRel)
  tags?: Relation<TagEntity[]>;
}
