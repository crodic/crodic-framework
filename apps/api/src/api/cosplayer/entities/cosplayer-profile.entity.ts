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
  OneToOne,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';
import { UserEntity } from '../../user/entities/user.entity';
import { FileEntity } from '../../file/entities/file.entity';
import { CityEntity } from '../../location/entities/city.entity';
import { CountryEntity } from '../../location/entities/country.entity';
import { CosplayerCharacterEntity } from './cosplayer-character.entity';

@Entity('cosplayer_profiles')
@Index('UQ_cosplayer_profiles_user_id', ['userId'], {
  unique: true,
  where: '"deleted_at" IS NULL',
})
@Index('UQ_cosplayer_profiles_slug', ['slug'], {
  unique: true,
  where: '"deleted_at" IS NULL',
})
@Index('IDX_cosplayer_profiles_ranking', ['rankingScore', 'totalLikesCount'])
@Index('IDX_cosplayer_profiles_city_id', ['cityId'])
export class CosplayerProfileEntity extends AbstractEntity {
  constructor(data?: Partial<CosplayerProfileEntity>) {
    super();
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn('increment', {
    primaryKeyConstraintName: 'PK_cosplayer_profile_id',
    type: 'bigint',
  })
  id!: AutoIncrementID;

  @Column({ name: 'user_id', type: 'bigint' })
  userId!: AutoIncrementID;

  @OneToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'user_id',
    foreignKeyConstraintName: 'FK_cosplayer_profiles_user_id',
  })
  user?: Relation<UserEntity>;

  @Column({ length: 80 })
  slug!: string;

  @Column({ name: 'display_name', length: 120 })
  displayName!: string;

  @Column({
    name: 'role_badge',
    type: 'varchar',
    length: 80,
    nullable: true,
  })
  roleBadge?: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  tagline?: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  bio?: string | null;

  @Column({ name: 'artistic_bio', type: 'text', nullable: true })
  artisticBio?: string | null;

  @Column({ name: 'avatar_file_id', type: 'bigint', nullable: true })
  avatarFileId?: AutoIncrementID | null;

  @ManyToOne(() => FileEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({
    name: 'avatar_file_id',
    foreignKeyConstraintName: 'FK_cosplayer_profiles_avatar_file_id',
  })
  avatarFile?: Relation<FileEntity> | null;

  @Column({ name: 'avatar_url', type: 'varchar', length: 500, nullable: true })
  avatarUrl?: string | null;

  @Column({ name: 'cover_file_id', type: 'bigint', nullable: true })
  coverFileId?: AutoIncrementID | null;

  @ManyToOne(() => FileEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({
    name: 'cover_file_id',
    foreignKeyConstraintName: 'FK_cosplayer_profiles_cover_file_id',
  })
  coverFile?: Relation<FileEntity> | null;

  @Column({ name: 'cover_url', type: 'varchar', length: 500, nullable: true })
  coverUrl?: string | null;

  @Column({
    name: 'location_label',
    type: 'varchar',
    length: 120,
    nullable: true,
  })
  locationLabel?: string | null;

  @Column({ name: 'city_id', type: 'bigint', nullable: true })
  cityId?: AutoIncrementID | null;

  @ManyToOne(() => CityEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({
    name: 'city_id',
    foreignKeyConstraintName: 'FK_cosplayer_profiles_city_id',
  })
  city?: Relation<CityEntity> | null;

  @Column({ name: 'country_id', type: 'bigint', nullable: true })
  countryId?: AutoIncrementID | null;

  @ManyToOne(() => CountryEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({
    name: 'country_id',
    foreignKeyConstraintName: 'FK_cosplayer_profiles_country_id',
  })
  country?: Relation<CountryEntity> | null;

  @Column({
    name: 'work_area',
    type: 'varchar',
    length: 160,
    nullable: true,
  })
  workArea?: string | null;

  @Column({ name: 'height_cm', type: 'smallint', nullable: true })
  heightCm?: number | null;

  @Column({ name: 'experience_years_num', type: 'smallint', nullable: true })
  experienceYearsNum?: number | null;

  @Column({ type: 'jsonb', default: () => `'[]'` })
  skills!: string[];

  @Column({ type: 'jsonb', default: () => `'[]'` })
  specialties!: string[];

  @Column({ name: 'awards_badges', type: 'jsonb', default: () => `'[]'` })
  awardsBadges!: string[];

  @Column({
    name: 'contact_email',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  contactEmail?: string | null;

  @Column({
    name: 'contact_phone',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  contactPhone?: string | null;

  @Column({
    name: 'facebook_url',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  facebookUrl?: string | null;

  @Column({
    name: 'instagram_url',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  instagramUrl?: string | null;

  @Column({ name: 'tiktok_url', type: 'varchar', length: 500, nullable: true })
  tiktokUrl?: string | null;

  @Column({ name: 'twitter_url', type: 'varchar', length: 500, nullable: true })
  twitterUrl?: string | null;

  @Column({ name: 'is_verified', type: 'boolean', default: false })
  isVerified!: boolean;

  @Column({ name: 'is_crafting_creator', type: 'boolean', default: false })
  isCraftingCreator!: boolean;

  @Column({ name: 'total_likes_count', type: 'bigint', default: 0 })
  totalLikesCount!: number;

  @Column({ name: 'albums_count', type: 'integer', default: 0 })
  albumsCount!: number;

  @Column({ name: 'characters_count', type: 'integer', default: 0 })
  charactersCount!: number;

  @Column({ name: 'ranking_score', type: 'double precision', default: 0 })
  rankingScore!: number;

  @OneToMany(() => CosplayerCharacterEntity, (char) => char.cosplayerProfile)
  characters?: Relation<CosplayerCharacterEntity>[];

  @DeleteDateColumn({
    name: 'deleted_at',
    type: 'timestamptz',
    default: null,
  })
  deletedAt?: Date | null;
}
