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
import { UserEntity } from '../../user/entities/user.entity';
import { TagEntity } from '../../tag/entities/tag.entity';
import { FileEntity } from '../../file/entities/file.entity';
import { CosplayerProfileEntity } from './cosplayer-profile.entity';

@Entity('cosplayer_characters')
@Index('IDX_cosplayer_characters_user_sort', ['userId', 'sortOrder'])
@Index('IDX_cosplayer_characters_character_tag', ['characterTagId'])
@Index(
  'UQ_cosplayer_characters_user_char',
  ['userId', 'characterName', 'seriesName'],
  { unique: true },
)
export class CosplayerCharacterEntity extends AbstractEntity {
  constructor(data?: Partial<CosplayerCharacterEntity>) {
    super();
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn('increment', {
    primaryKeyConstraintName: 'PK_cosplayer_character_id',
    type: 'bigint',
  })
  id!: AutoIncrementID;

  @Column({ name: 'user_id', type: 'bigint' })
  userId!: AutoIncrementID;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'user_id',
    foreignKeyConstraintName: 'FK_cosplayer_characters_user_id',
  })
  user?: Relation<UserEntity>;

  @ManyToOne(() => CosplayerProfileEntity, (profile) => profile.characters, {
    nullable: true,
    createForeignKeyConstraints: false,
  })
  @JoinColumn({
    name: 'user_id',
    referencedColumnName: 'userId',
  })
  cosplayerProfile?: Relation<CosplayerProfileEntity>;

  @Column({ name: 'character_name', length: 160 })
  characterName!: string;

  @Column({ name: 'series_name', length: 160 })
  seriesName!: string;

  @Column({ name: 'character_tag_id', type: 'bigint', nullable: true })
  characterTagId?: AutoIncrementID | null;

  @ManyToOne(() => TagEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({
    name: 'character_tag_id',
    foreignKeyConstraintName: 'FK_cosplayer_characters_character_tag_id',
  })
  characterTag?: Relation<TagEntity> | null;

  @Column({ name: 'copyright_tag_id', type: 'bigint', nullable: true })
  copyrightTagId?: AutoIncrementID | null;

  @ManyToOne(() => TagEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({
    name: 'copyright_tag_id',
    foreignKeyConstraintName: 'FK_cosplayer_characters_copyright_tag_id',
  })
  copyrightTag?: Relation<TagEntity> | null;

  @Column({ name: 'cover_file_id', type: 'bigint', nullable: true })
  coverFileId?: AutoIncrementID | null;

  @ManyToOne(() => FileEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({
    name: 'cover_file_id',
    foreignKeyConstraintName: 'FK_cosplayer_characters_cover_file_id',
  })
  coverFile?: Relation<FileEntity> | null;

  @Column({ name: 'cover_image_url', length: 500 })
  coverImageUrl!: string;

  @Column({ name: 'albums_count', type: 'integer', default: 0 })
  albumsCount!: number;

  @Column({ name: 'photos_count', type: 'integer', default: 0 })
  photosCount!: number;

  @Column({ name: 'sort_order', type: 'smallint', default: 0 })
  sortOrder!: number;
}
