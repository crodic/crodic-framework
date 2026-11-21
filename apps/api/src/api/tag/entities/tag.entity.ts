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
import { AdminUserEntity } from '../../admin-user/entities/admin-user.entity';
import { UserEntity } from '../../user/entities/user.entity';
import {
  ETagCategory,
  ETagSafetyRating,
  ETagStatus,
} from '../constants/tag.constant';
import { TagAliasEntity } from './tag-alias.entity';
import { TagCategoryEntity } from './tag-category.entity';
import { TagEncyclopediaEntity } from './tag-encyclopedia.entity';
import { TagRelationEntity } from './tag-relation.entity';
import { TagTranslationEntity } from './tag-translation.entity';

@Entity('tags')
@Index('UQ_tags_slug', ['slug'], {
  unique: true,
  where: '"deleted_at" IS NULL',
})
@Index('UQ_tags_normalized_name', ['normalizedName'], {
  unique: true,
  where: '"deleted_at" IS NULL',
})
@Index('IDX_tags_unaccented_name', ['unaccentedName'])
@Index('IDX_tags_category_status', ['category', 'status'])
@Index('IDX_tags_safety_rating', ['safetyRating'])
@Index('IDX_tags_usage_count', ['usageCount'])
@Index('IDX_tags_trending_score', ['trendingScore'])
export class TagEntity extends AbstractEntity {
  constructor(data?: Partial<TagEntity>) {
    super();
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn('increment', {
    primaryKeyConstraintName: 'PK_tag_id',
    type: 'bigint',
  })
  id!: AutoIncrementID;

  @Column({ length: 140 })
  slug!: string;

  @Column({ length: 100 })
  name!: string;

  @Column({ name: 'normalized_name', length: 120 })
  normalizedName!: string;

  @Column({ name: 'unaccented_name', length: 120 })
  unaccentedName!: string;

  @Column({
    type: 'varchar',
    length: 60,
    default: 'general',
  })
  category!: string;

  @Index('IDX_tags_category_id')
  @Column({ name: 'category_id', type: 'bigint', nullable: true })
  categoryId?: AutoIncrementID | null;

  @ManyToOne(() => TagCategoryEntity, (cat) => cat.tags, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({
    name: 'category_id',
    foreignKeyConstraintName: 'FK_tags_category_id',
  })
  categoryRel?: Relation<TagCategoryEntity> | null;

  @Column({
    name: 'safety_rating',
    type: 'enum',
    enum: ETagSafetyRating,
    default: ETagSafetyRating.SAFE,
  })
  safetyRating!: ETagSafetyRating;

  @Column({
    type: 'enum',
    enum: ETagStatus,
    default: ETagStatus.ACTIVE,
  })
  status!: ETagStatus;

  @Column({ name: 'is_official', type: 'boolean', default: false })
  isOfficial!: boolean;

  @Column({ name: 'is_system', type: 'boolean', default: false })
  isSystem!: boolean;

  @Column({ name: 'usage_count', type: 'bigint', default: 0 })
  usageCount!: number;

  @Column({ name: 'trending_score', type: 'double precision', default: 0 })
  trendingScore!: number;

  @Column({ name: 'merged_into_id', type: 'bigint', nullable: true })
  mergedIntoId?: AutoIncrementID | null;

  @ManyToOne(() => TagEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({
    name: 'merged_into_id',
    foreignKeyConstraintName: 'FK_tags_merged_into_id',
  })
  mergedInto?: Relation<TagEntity> | null;

  @Column({ name: 'created_by_user_id', type: 'bigint', nullable: true })
  createdByUserId?: AutoIncrementID | null;

  @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({
    name: 'created_by_user_id',
    foreignKeyConstraintName: 'FK_tags_created_by_user_id',
  })
  createdByUser?: Relation<UserEntity> | null;

  @Column({ name: 'created_by_admin_id', type: 'bigint', nullable: true })
  createdByAdminId?: AutoIncrementID | null;

  @ManyToOne(() => AdminUserEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({
    name: 'created_by_admin_id',
    foreignKeyConstraintName: 'FK_tags_created_by_admin_id',
  })
  createdByAdmin?: Relation<AdminUserEntity> | null;

  @OneToMany(() => TagTranslationEntity, (translation) => translation.tag, {
    cascade: true,
  })
  translations?: Relation<TagTranslationEntity[]>;

  @OneToMany(() => TagAliasEntity, (alias) => alias.tag, {
    cascade: true,
  })
  aliases?: Relation<TagAliasEntity[]>;

  @OneToMany(() => TagRelationEntity, (relation) => relation.sourceTag)
  outgoingRelations?: Relation<TagRelationEntity[]>;

  @OneToMany(() => TagRelationEntity, (relation) => relation.targetTag)
  incomingRelations?: Relation<TagRelationEntity[]>;

  @OneToMany(() => TagEncyclopediaEntity, (encyclopedia) => encyclopedia.tag)
  encyclopedias?: Relation<TagEncyclopediaEntity[]>;

  @DeleteDateColumn({
    name: 'deleted_at',
    type: 'timestamptz',
    default: null,
  })
  deletedAt?: Date | null;
}
