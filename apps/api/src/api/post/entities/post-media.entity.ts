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
import { PostEntity } from './post.entity';
import { FileEntity } from '../../file/entities/file.entity';
import { EMediaType } from '../constants/post.constant';

@Entity('post_media')
@Index('IDX_post_media_post_sort', ['postId', 'sortOrder'])
@Index('IDX_post_media_file_id', ['fileId'])
export class PostMediaEntity extends AbstractEntity {
  constructor(data?: Partial<PostMediaEntity>) {
    super();
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn('increment', {
    primaryKeyConstraintName: 'PK_post_media_id',
    type: 'bigint',
  })
  id!: AutoIncrementID;

  @Column({ name: 'post_id', type: 'bigint' })
  postId!: AutoIncrementID;

  @ManyToOne(() => PostEntity, (post) => post.media, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'post_id',
    foreignKeyConstraintName: 'FK_post_media_post_id',
  })
  post?: Relation<PostEntity>;

  @Column({ name: 'file_id', type: 'bigint', nullable: true })
  fileId?: AutoIncrementID | null;

  @ManyToOne(() => FileEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({
    name: 'file_id',
    foreignKeyConstraintName: 'FK_post_media_file_id',
  })
  file?: Relation<FileEntity> | null;

  @Column({
    name: 'media_type',
    type: 'enum',
    enum: EMediaType,
    default: EMediaType.IMAGE,
    enumName: 'media_type_enum',
  })
  mediaType!: EMediaType;

  @Column({ length: 500 })
  url!: string;

  @Column({
    name: 'original_url',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  originalUrl?: string | null;

  @Column({ name: 'alt_text', type: 'varchar', length: 255, nullable: true })
  altText?: string | null;

  @Column({ type: 'integer', nullable: true })
  width?: number | null;

  @Column({ type: 'integer', nullable: true })
  height?: number | null;

  @Column({ type: 'integer', nullable: true })
  duration?: number | null;

  @Column({ name: 'sort_order', type: 'smallint', default: 0 })
  sortOrder!: number;

  @Column({ name: 'is_cover', type: 'boolean', default: false })
  isCover!: boolean;
}
