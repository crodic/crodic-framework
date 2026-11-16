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
import { BrandEntity } from '../../brand/entities/brand.entity';
import { UserEntity } from '../../user/entities/user.entity';
import { AdminUserEntity } from '../../admin-user/entities/admin-user.entity';
import { CityEntity } from '../../location/entities/city.entity';
import { FileEntity } from '../../file/entities/file.entity';
import { EJobCategory, EJobStatus } from '../constants/job.constant';
import { JobApplicationEntity } from './job-application.entity';

@Entity('jobs')
@Index('UQ_jobs_slug', ['slug'], {
  unique: true,
  where: '"deleted_at" IS NULL',
})
@Index('IDX_jobs_brand_id', ['brandId'])
@Index('IDX_jobs_listing', [
  'status',
  'categoryCode',
  'locationFilterCode',
  'createdAt',
])
@Index('IDX_jobs_featured', ['status', 'isFeatured', 'createdAt'])
@Index('IDX_jobs_deadline', ['status', 'deadlineAt'])
export class JobEntity extends AbstractEntity {
  constructor(data?: Partial<JobEntity>) {
    super();
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn('increment', {
    primaryKeyConstraintName: 'PK_job_id',
    type: 'bigint',
  })
  id!: AutoIncrementID;

  @Column({ length: 220 })
  slug!: string;

  @Column({ name: 'brand_id', type: 'bigint', nullable: true })
  brandId?: AutoIncrementID | null;

  @ManyToOne(() => BrandEntity, (brand) => brand.jobs, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({
    name: 'brand_id',
    foreignKeyConstraintName: 'FK_jobs_brand_id',
  })
  brand?: Relation<BrandEntity> | null;

  @Column({ name: 'poster_user_id', type: 'bigint', nullable: true })
  posterUserId?: AutoIncrementID | null;

  @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({
    name: 'poster_user_id',
    foreignKeyConstraintName: 'FK_jobs_poster_user_id',
  })
  posterUser?: Relation<UserEntity> | null;

  @Column({ name: 'created_by_admin_id', type: 'bigint', nullable: true })
  createdByAdminId?: AutoIncrementID | null;

  @ManyToOne(() => AdminUserEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({
    name: 'created_by_admin_id',
    foreignKeyConstraintName: 'FK_jobs_created_by_admin_id',
  })
  createdByAdmin?: Relation<AdminUserEntity> | null;

  @Column({ name: 'brand_name', length: 160 })
  brandName!: string;

  @Column({
    name: 'brand_logo_url',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  brandLogoUrl?: string | null;

  @Column({ name: 'brand_logo_file_id', type: 'bigint', nullable: true })
  brandLogoFileId?: AutoIncrementID | null;

  @ManyToOne(() => FileEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({
    name: 'brand_logo_file_id',
    foreignKeyConstraintName: 'FK_jobs_brand_logo_file_id',
  })
  brandLogoFile?: Relation<FileEntity> | null;

  @Column({
    name: 'brand_initials',
    type: 'varchar',
    length: 10,
    nullable: true,
  })
  brandInitials?: string | null;

  @Column({
    name: 'brand_color',
    type: 'varchar',
    length: 60,
    nullable: true,
    default: 'bg-primary',
  })
  brandColor?: string | null;

  @Column({ name: 'is_verified', type: 'boolean', default: false })
  isVerified!: boolean;

  @Column({ length: 255 })
  title!: string;

  @Column({
    name: 'category_code',
    type: 'enum',
    enum: EJobCategory,
    enumName: 'job_category_enum',
  })
  categoryCode!: EJobCategory;

  @Column({ name: 'category_label', length: 100 })
  categoryLabel!: string;

  @Column({ name: 'budget_label', length: 120 })
  budgetLabel!: string;

  @Column({
    name: 'budget_min',
    type: 'numeric',
    precision: 14,
    scale: 2,
    nullable: true,
  })
  budgetMin?: number | null;

  @Column({
    name: 'budget_max',
    type: 'numeric',
    precision: 14,
    scale: 2,
    nullable: true,
  })
  budgetMax?: number | null;

  @Column({ name: 'location_label', length: 120 })
  locationLabel!: string;

  @Column({
    name: 'location_filter_code',
    type: 'varchar',
    length: 30,
    nullable: true,
  })
  locationFilterCode?: string | null;

  @Column({ name: 'city_id', type: 'bigint', nullable: true })
  cityId?: AutoIncrementID | null;

  @ManyToOne(() => CityEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({
    name: 'city_id',
    foreignKeyConstraintName: 'FK_jobs_city_id',
  })
  city?: Relation<CityEntity> | null;

  @Column({ name: 'deadline_label', length: 50 })
  deadlineLabel!: string;

  @Column({ name: 'deadline_at', type: 'timestamptz', nullable: true })
  deadlineAt?: Date | null;

  @Column({ type: 'text' })
  requirements!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'jsonb', default: () => `'[]'` })
  perks!: string[];

  @Column({ name: 'filter_tags', type: 'jsonb', default: () => `'[]'` })
  filterTags!: string[];

  @Column({ name: 'contact_email', length: 255 })
  contactEmail!: string;

  @Column({
    name: 'thumbnail_url',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  thumbnailUrl?: string | null;

  @Column({ name: 'is_featured', type: 'boolean', default: false })
  isFeatured!: boolean;

  @Column({
    type: 'enum',
    enum: EJobStatus,
    default: EJobStatus.PENDING_APPROVAL,
    enumName: 'job_status_enum',
  })
  status!: EJobStatus;

  @Column({ name: 'applications_count', type: 'integer', default: 0 })
  applicationsCount!: number;

  @OneToMany(() => JobApplicationEntity, (application) => application.job)
  applications?: Relation<JobApplicationEntity>[];

  @DeleteDateColumn({
    name: 'deleted_at',
    type: 'timestamptz',
    default: null,
  })
  deletedAt?: Date | null;
}
