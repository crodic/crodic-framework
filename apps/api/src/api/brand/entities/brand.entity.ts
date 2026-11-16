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
import { FileEntity } from '../../file/entities/file.entity';
import { BrandMemberEntity } from './brand-member.entity';
import { JobEntity } from '../../job/entities/job.entity';

@Entity('brands')
@Index('UQ_brands_slug', ['slug'], {
  unique: true,
  where: '"deleted_at" IS NULL',
})
@Index('IDX_brands_owner', ['ownerUserId'])
export class BrandEntity extends AbstractEntity {
  constructor(data?: Partial<BrandEntity>) {
    super();
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn('increment', {
    primaryKeyConstraintName: 'PK_brand_id',
    type: 'bigint',
  })
  id!: AutoIncrementID;

  @Column({ name: 'owner_user_id', type: 'bigint' })
  ownerUserId!: AutoIncrementID;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'owner_user_id',
    foreignKeyConstraintName: 'FK_brands_owner_user_id',
  })
  owner?: Relation<UserEntity>;

  @Column({ length: 160 })
  name!: string;

  @Column({ length: 180 })
  slug!: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  initials?: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  color?: string | null;

  @Column({ name: 'logo_file_id', type: 'bigint', nullable: true })
  logoFileId?: AutoIncrementID | null;

  @ManyToOne(() => FileEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({
    name: 'logo_file_id',
    foreignKeyConstraintName: 'FK_brands_logo_file_id',
  })
  logoFile?: Relation<FileEntity> | null;

  @Column({ name: 'logo_url', type: 'varchar', length: 500, nullable: true })
  logoUrl?: string | null;

  @Column({ name: 'cover_file_id', type: 'bigint', nullable: true })
  coverFileId?: AutoIncrementID | null;

  @ManyToOne(() => FileEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({
    name: 'cover_file_id',
    foreignKeyConstraintName: 'FK_brands_cover_file_id',
  })
  coverFile?: Relation<FileEntity> | null;

  @Column({ name: 'cover_url', type: 'varchar', length: 500, nullable: true })
  coverUrl?: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  tagline?: string | null;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({ name: 'website_url', type: 'varchar', length: 300, nullable: true })
  websiteUrl?: string | null;

  @Column({ name: 'contact_email', length: 255 })
  contactEmail!: string;

  @Column({
    name: 'contact_phone',
    type: 'varchar',
    length: 40,
    nullable: true,
  })
  contactPhone?: string | null;

  @Column({ name: 'is_verified', type: 'boolean', default: false })
  isVerified!: boolean;

  @OneToMany(() => BrandMemberEntity, (member) => member.brand)
  members?: Relation<BrandMemberEntity>[];

  @OneToMany(() => JobEntity, (job) => job.brand)
  jobs?: Relation<JobEntity>[];

  @DeleteDateColumn({
    name: 'deleted_at',
    type: 'timestamptz',
    default: null,
  })
  deletedAt?: Date | null;
}
