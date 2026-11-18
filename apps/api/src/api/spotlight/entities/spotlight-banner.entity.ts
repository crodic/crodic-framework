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
import { FileEntity } from '../../file/entities/file.entity';

@Entity('spotlight_banners')
@Index('IDX_spotlight_banners_active_sort', ['isActive', 'sortOrder'])
export class SpotlightBannerEntity extends AbstractEntity {
  constructor(data?: Partial<SpotlightBannerEntity>) {
    super();
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn('increment', {
    primaryKeyConstraintName: 'PK_spotlight_banner_id',
    type: 'bigint',
  })
  id!: AutoIncrementID;

  @Column({ name: 'cosplayer_user_id', type: 'bigint' })
  cosplayerUserId!: AutoIncrementID;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'cosplayer_user_id',
    foreignKeyConstraintName: 'FK_spotlight_banners_cosplayer_user_id',
  })
  cosplayerUser?: Relation<UserEntity>;

  @Column({ length: 80 })
  badge!: string;

  @Column({ length: 255 })
  tagline!: string;

  @Column({ name: 'banner_file_id', type: 'bigint', nullable: true })
  bannerFileId?: AutoIncrementID | null;

  @ManyToOne(() => FileEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({
    name: 'banner_file_id',
    foreignKeyConstraintName: 'FK_spotlight_banners_banner_file_id',
  })
  bannerFile?: Relation<FileEntity> | null;

  @Column({ name: 'banner_image_url', length: 500 })
  bannerImageUrl!: string;

  @Column({ name: 'sort_order', type: 'smallint', default: 0 })
  sortOrder!: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;
}
