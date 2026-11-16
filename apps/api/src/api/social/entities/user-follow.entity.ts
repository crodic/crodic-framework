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

@Entity('user_follows')
@Index('UQ_user_follows_pair', ['followerId', 'followingId'], { unique: true })
@Index('IDX_user_follows_following', ['followingId', 'createdAt'])
@Index('IDX_user_follows_follower', ['followerId', 'createdAt'])
export class UserFollowEntity extends AbstractEntity {
  constructor(data?: Partial<UserFollowEntity>) {
    super();
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn('increment', {
    primaryKeyConstraintName: 'PK_user_follow_id',
    type: 'bigint',
  })
  id!: AutoIncrementID;

  @Column({ name: 'follower_id', type: 'bigint' })
  followerId!: AutoIncrementID;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'follower_id',
    foreignKeyConstraintName: 'FK_user_follows_follower_id',
  })
  follower?: Relation<UserEntity>;

  @Column({ name: 'following_id', type: 'bigint' })
  followingId!: AutoIncrementID;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'following_id',
    foreignKeyConstraintName: 'FK_user_follows_following_id',
  })
  following?: Relation<UserEntity>;
}
