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
import { ETagTranslationSource } from '../constants/tag.constant';
import { TagEntity } from './tag.entity';

@Entity('tag_translations')
@Index('UQ_tag_translations_tag_locale', ['tagId', 'locale'], { unique: true })
@Index('IDX_tag_translations_normalized_name', ['normalizedName'])
@Index('IDX_tag_translations_unaccented_name', ['unaccentedName'])
@Index('IDX_tag_translations_locale', ['locale'])
export class TagTranslationEntity extends AbstractEntity {
  constructor(data?: Partial<TagTranslationEntity>) {
    super();
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn('increment', {
    primaryKeyConstraintName: 'PK_tag_translation_id',
    type: 'bigint',
  })
  id!: AutoIncrementID;

  @Column({ name: 'tag_id', type: 'bigint' })
  tagId!: AutoIncrementID;

  @ManyToOne(() => TagEntity, (tag) => tag.translations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'tag_id',
    foreignKeyConstraintName: 'FK_tag_translations_tag_id',
  })
  tag!: Relation<TagEntity>;

  @Column({ length: 16 })
  locale!: string;

  @Column({ name: 'translated_name', length: 120 })
  translatedName!: string;

  @Column({ name: 'normalized_name', length: 140 })
  normalizedName!: string;

  @Column({ name: 'unaccented_name', length: 140 })
  unaccentedName!: string;

  @Column({
    name: 'short_summary',
    type: 'varchar',
    length: 280,
    nullable: true,
  })
  shortSummary?: string | null;

  @Column({
    type: 'enum',
    enum: ETagTranslationSource,
    default: ETagTranslationSource.ADMIN,
  })
  source!: ETagTranslationSource;
}
