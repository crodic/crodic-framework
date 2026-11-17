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
import {
  ECurrencyCode,
  EServicePriceUnit,
} from '../constants/cosplayer.constant';
import { CosplayerProfileEntity } from './cosplayer-profile.entity';

@Entity('cosplayer_services')
@Index('IDX_cosplayer_services_user_sort', ['userId', 'isActive', 'sortOrder'])
export class CosplayerServiceEntity extends AbstractEntity {
  constructor(data?: Partial<CosplayerServiceEntity>) {
    super();
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn('increment', {
    primaryKeyConstraintName: 'PK_cosplayer_service_id',
    type: 'bigint',
  })
  id!: AutoIncrementID;

  @Column({ name: 'user_id', type: 'bigint' })
  userId!: AutoIncrementID;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'user_id',
    foreignKeyConstraintName: 'FK_cosplayer_services_user_id',
  })
  user?: Relation<UserEntity>;

  @ManyToOne(() => CosplayerProfileEntity, (profile) => profile.services, {
    nullable: true,
    createForeignKeyConstraints: false,
  })
  @JoinColumn({
    name: 'user_id',
    referencedColumnName: 'userId',
  })
  cosplayerProfile?: Relation<CosplayerProfileEntity>;

  @Column({ length: 180 })
  title!: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  description?: string | null;

  @Column({ name: 'badge_label', length: 80 })
  badgeLabel!: string;

  @Column({
    name: 'starting_price',
    type: 'numeric',
    precision: 14,
    scale: 2,
    nullable: true,
  })
  startingPrice?: number | null;

  @Column({
    type: 'enum',
    enum: ECurrencyCode,
    default: ECurrencyCode.VND,
    enumName: 'currency_code_enum',
  })
  currency!: ECurrencyCode;

  @Column({
    name: 'price_unit',
    type: 'enum',
    enum: EServicePriceUnit,
    enumName: 'service_price_unit_enum',
    nullable: true,
  })
  priceUnit?: EServicePriceUnit | null;

  @Column({ name: 'is_negotiable', type: 'boolean', default: true })
  isNegotiable!: boolean;

  @Column({ name: 'sort_order', type: 'smallint', default: 0 })
  sortOrder!: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;
}
