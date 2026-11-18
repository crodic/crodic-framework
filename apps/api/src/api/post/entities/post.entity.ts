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
import { TagEntity } from '../../tag/entities/tag.entity';
import { CosplayerCharacterEntity } from '../../cosplayer/entities/cosplayer-character.entity';
import {
  EAlbumCategory,
  EPostCollaboratorRole,
  EPostStatus,
  EPostType,
} from '../constants/post.constant';
import { PostMediaEntity } from './post-media.entity';
import { PostLikeEntity } from './post-like.entity';
import { PostCommentEntity } from './post-comment.entity';

export interface IPostCollaborator {
  role: EPostCollaboratorRole;
  name: string;
  userId?: AutoIncrementID | null;
  socialUrl?: string | null;
}

@Entity('posts')
@Index('UQ_posts_slug', ['slug'], {
  unique: true,
  where: '"deleted_at" IS NULL',
})
@Index('IDX_posts_author_category', [
  'authorId',
  'albumCategory',
  'publishedAt',
])
@Index('IDX_posts_feed_public', ['isPublic', 'status', 'publishedAt'])
@Index('IDX_posts_trending', ['isPublic', 'status', 'trendingScore'])
@Index('IDX_posts_featured', ['isFeaturedWork', 'publishedAt'])
@Index('IDX_posts_copyright_tag', ['copyrightTagId', 'publishedAt'])
@Index('IDX_posts_character_tag', ['characterTagId', 'publishedAt'])
@Index('IDX_posts_cosplayer_character', ['cosplayerCharacterId', 'publishedAt'])
export class PostEntity extends AbstractEntity {
  constructor(data?: Partial<PostEntity>) {
    super();
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn('increment', {
    primaryKeyConstraintName: 'PK_post_id',
    type: 'bigint',
  })
  id!: AutoIncrementID;

  @Column({ length: 200 })
  slug!: string;

  @Column({ name: 'author_id', type: 'bigint' })
  authorId!: AutoIncrementID;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'author_id',
    foreignKeyConstraintName: 'FK_posts_author_id',
  })
  author?: Relation<UserEntity>;

  @Column({ length: 220 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  caption?: string | null;

  @Column({
    name: 'post_type',
    type: 'enum',
    enum: EPostType,
    default: EPostType.PHOTOSET,
    enumName: 'post_type_enum',
  })
  postType!: EPostType;

  @Column({
    name: 'album_category',
    type: 'enum',
    enum: EAlbumCategory,
    default: EAlbumCategory.GENERAL,
    enumName: 'album_category_enum',
  })
  albumCategory!: EAlbumCategory;

  @Column({
    name: 'character_name',
    type: 'varchar',
    length: 160,
    nullable: true,
  })
  characterName?: string | null;

  @Column({ name: 'fandom_name', type: 'varchar', length: 160, nullable: true })
  fandomName?: string | null;

  @Column({ name: 'cosplayer_character_id', type: 'bigint', nullable: true })
  cosplayerCharacterId?: AutoIncrementID | null;

  @ManyToOne(() => CosplayerCharacterEntity, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({
    name: 'cosplayer_character_id',
    foreignKeyConstraintName: 'FK_posts_cosplayer_character_id',
  })
  cosplayerCharacter?: Relation<CosplayerCharacterEntity> | null;

  @Column({ name: 'character_tag_id', type: 'bigint', nullable: true })
  characterTagId?: AutoIncrementID | null;

  @ManyToOne(() => TagEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({
    name: 'character_tag_id',
    foreignKeyConstraintName: 'FK_posts_character_tag_id',
  })
  characterTag?: Relation<TagEntity> | null;

  @Column({ name: 'copyright_tag_id', type: 'bigint', nullable: true })
  copyrightTagId?: AutoIncrementID | null;

  @ManyToOne(() => TagEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({
    name: 'copyright_tag_id',
    foreignKeyConstraintName: 'FK_posts_copyright_tag_id',
  })
  copyrightTag?: Relation<TagEntity> | null;

  @Column({ name: 'cover_image_url', length: 500 })
  coverImageUrl!: string;

  @Column({ type: 'jsonb', default: () => `'[]'` })
  collaborators!: IPostCollaborator[];

  @Column({ name: 'is_public', type: 'boolean', default: true })
  isPublic!: boolean;

  @Column({ name: 'enable_watermark', type: 'boolean', default: false })
  enableWatermark!: boolean;

  @Column({
    type: 'enum',
    enum: EPostStatus,
    default: EPostStatus.PUBLISHED,
    enumName: 'post_status_enum',
  })
  status!: EPostStatus;

  @Column({ name: 'is_featured_work', type: 'boolean', default: false })
  isFeaturedWork!: boolean;

  @Column({ name: 'photos_count', type: 'smallint', default: 1 })
  photosCount!: number;

  @Column({ name: 'likes_count', type: 'bigint', default: 0 })
  likesCount!: number;

  @Column({ name: 'comments_count', type: 'bigint', default: 0 })
  commentsCount!: number;

  @Column({ name: 'saves_count', type: 'bigint', default: 0 })
  savesCount!: number;

  @Column({ name: 'shares_count', type: 'bigint', default: 0 })
  sharesCount!: number;

  @Column({ name: 'views_count', type: 'bigint', default: 0 })
  viewsCount!: number;

  @Column({ name: 'trending_score', type: 'double precision', default: 0 })
  trendingScore!: number;

  @Column({
    name: 'published_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  publishedAt!: Date;

  @OneToMany(() => PostMediaEntity, (media) => media.post)
  media?: Relation<PostMediaEntity>[];

  @OneToMany(() => PostLikeEntity, (like) => like.post)
  likes?: Relation<PostLikeEntity>[];

  @OneToMany(() => PostCommentEntity, (comment) => comment.post)
  comments?: Relation<PostCommentEntity>[];

  @DeleteDateColumn({
    name: 'deleted_at',
    type: 'timestamptz',
    default: null,
  })
  deletedAt?: Date | null;
}
