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
import { CollectionEntity } from './collection.entity';
import { PostEntity } from '../../post/entities/post.entity';
import { PostMediaEntity } from '../../post/entities/post-media.entity';

@Entity('collection_items')
@Index('IDX_collection_items_collection_sort', ['collectionId', 'sortOrder'])
@Index('IDX_collection_items_post', ['collectionId', 'postId'])
export class CollectionItemEntity extends AbstractEntity {
  constructor(data?: Partial<CollectionItemEntity>) {
    super();
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn('increment', {
    primaryKeyConstraintName: 'PK_collection_item_id',
    type: 'bigint',
  })
  id!: AutoIncrementID;

  @Column({ name: 'collection_id', type: 'bigint' })
  collectionId!: AutoIncrementID;

  @ManyToOne(() => CollectionEntity, (collection) => collection.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'collection_id',
    foreignKeyConstraintName: 'FK_collection_items_collection_id',
  })
  collection?: Relation<CollectionEntity>;

  @Column({ name: 'post_id', type: 'bigint' })
  postId!: AutoIncrementID;

  @ManyToOne(() => PostEntity, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'post_id',
    foreignKeyConstraintName: 'FK_collection_items_post_id',
  })
  post?: Relation<PostEntity>;

  @Column({ name: 'post_media_id', type: 'bigint', nullable: true })
  postMediaId?: AutoIncrementID | null;

  @ManyToOne(() => PostMediaEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({
    name: 'post_media_id',
    foreignKeyConstraintName: 'FK_collection_items_post_media_id',
  })
  postMedia?: Relation<PostMediaEntity> | null;

  @Column({ name: 'sort_order', type: 'integer', default: 0 })
  sortOrder!: number;
}
