import { AutoIncrementID } from '../../../common/types/common.type';
import { AbstractEntity } from '../../../database/entities/abstract.entity';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';
import { FileEntity } from '../../file/entities/file.entity';
import { TagEncyclopediaRevisionEntity } from './tag-encyclopedia-revision.entity';
import { TagEntity } from './tag.entity';

@Entity('tag_encyclopedias')
@Index('UQ_tag_encyclopedias_tag_locale', ['tagId', 'locale'], { unique: true })
@Index('IDX_tag_encyclopedias_locale', ['locale'])
export class TagEncyclopediaEntity extends AbstractEntity {
  constructor(data?: Partial<TagEncyclopediaEntity>) {
    super();
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn('increment', {
    primaryKeyConstraintName: 'PK_tag_encyclopedia_id',
    type: 'bigint',
  })
  id!: AutoIncrementID;

  @Column({ name: 'tag_id', type: 'bigint' })
  tagId!: AutoIncrementID;

  @ManyToOne(() => TagEntity, (tag) => tag.encyclopedias, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'tag_id',
    foreignKeyConstraintName: 'FK_tag_encyclopedias_tag_id',
  })
  tag!: Relation<TagEntity>;

  @Column({ length: 16 })
  locale!: string;

  @Column({ type: 'text' })
  summary!: string;

  @Column({ type: 'text' })
  body!: string;

  @Column({ name: 'featured_file_id', type: 'bigint', nullable: true })
  featuredFileId?: AutoIncrementID | null;

  @ManyToOne(() => FileEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({
    name: 'featured_file_id',
    foreignKeyConstraintName: 'FK_tag_encyclopedias_featured_file_id',
  })
  featuredFile?: Relation<FileEntity> | null;

  @Column({
    name: 'featured_image_url',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  featuredImageUrl?: string | null;

  @Column({ name: 'is_edit_locked', type: 'boolean', default: false })
  isEditLocked!: boolean;

  @Column({ name: 'current_revision', type: 'integer', default: 1 })
  currentRevision!: number;

  @Column({ name: 'view_count', type: 'bigint', default: 0 })
  viewCount!: number;

  @OneToMany(
    () => TagEncyclopediaRevisionEntity,
    (revision) => revision.encyclopedia,
  )
  revisions?: Relation<TagEncyclopediaRevisionEntity[]>;
}
