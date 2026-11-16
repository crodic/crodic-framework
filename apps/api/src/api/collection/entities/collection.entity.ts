import { AutoIncrementID } from '../../../common/types/common.type';
import { AbstractEntity } from '../../../database/entities/abstract.entity';
import {
  Column,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';
import { UserEntity } from '../../user/entities/user.entity';
import { CollectionItemEntity } from './collection-item.entity';

@Entity('collections')
@Index('UQ_collections_user_slug', ['userId', 'slug'], {
  unique: true,
  where: '"deleted_at" IS NULL',
})
@Index('IDX_collections_user_updated', ['userId', 'updatedAt'])
export class CollectionEntity extends AbstractEntity {
  constructor(data?: Partial<CollectionEntity>) {
    super();
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn('increment', {
    primaryKeyConstraintName: 'PK_collection_id',
    type: 'bigint',
  })
  id!: AutoIncrementID;

  @Column({ name: 'user_id', type: 'bigint' })
  userId!: AutoIncrementID;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'user_id',
    foreignKeyConstraintName: 'FK_collections_user_id',
  })
  user?: Relation<UserEntity>;

  @Column({ length: 140 })
  title!: string;

  @Column({ length: 160 })
  slug!: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  description?: string | null;

  @Column({ name: 'is_default', type: 'boolean', default: false })
  isDefault!: boolean;

  @Column({ name: 'is_public', type: 'boolean', default: true })
  isPublic!: boolean;

  @Column({ name: 'items_count', type: 'integer', default: 0 })
  itemsCount!: number;

  @Column({
    name: 'preview_thumbnails',
    type: 'jsonb',
    default: () => `'[]'`,
  })
  previewThumbnails!: string[];

  @OneToMany(() => CollectionItemEntity, (item) => item.collection)
  items?: Relation<CollectionItemEntity>[];

  @DeleteDateColumn({
    name: 'deleted_at',
    type: 'timestamptz',
    default: null,
  })
  deletedAt?: Date | null;
}
