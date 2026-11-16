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
import { BrandEntity } from './brand.entity';
import { UserEntity } from '../../user/entities/user.entity';
import { EBrandMemberRole } from '../constants/brand.constant';

@Entity('brand_members')
@Index('UQ_brand_members_pair', ['brandId', 'userId'], { unique: true })
export class BrandMemberEntity extends AbstractEntity {
  constructor(data?: Partial<BrandMemberEntity>) {
    super();
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn('increment', {
    primaryKeyConstraintName: 'PK_brand_member_id',
    type: 'bigint',
  })
  id!: AutoIncrementID;

  @Column({ name: 'brand_id', type: 'bigint' })
  brandId!: AutoIncrementID;

  @ManyToOne(() => BrandEntity, (brand) => brand.members, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'brand_id',
    foreignKeyConstraintName: 'FK_brand_members_brand_id',
  })
  brand?: Relation<BrandEntity>;

  @Column({ name: 'user_id', type: 'bigint' })
  userId!: AutoIncrementID;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'user_id',
    foreignKeyConstraintName: 'FK_brand_members_user_id',
  })
  user?: Relation<UserEntity>;

  @Column({
    type: 'enum',
    enum: EBrandMemberRole,
    default: EBrandMemberRole.MEMBER,
    enumName: 'brand_member_role_enum',
  })
  role!: EBrandMemberRole;
}
