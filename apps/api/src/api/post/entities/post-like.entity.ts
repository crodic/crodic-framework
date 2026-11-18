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
import { PostEntity } from './post.entity';
import { UserEntity } from '../../user/entities/user.entity';

@Entity('post_likes')
@Index('UQ_post_likes_post_user', ['postId', 'userId'], { unique: true })
@Index('IDX_post_likes_user_created', ['userId', 'createdAt'])
@Index('IDX_post_likes_created', ['createdAt'])
export class PostLikeEntity extends AbstractEntity {
  constructor(data?: Partial<PostLikeEntity>) {
    super();
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn('increment', {
    primaryKeyConstraintName: 'PK_post_like_id',
    type: 'bigint',
  })
  id!: AutoIncrementID;

  @Column({ name: 'post_id', type: 'bigint' })
  postId!: AutoIncrementID;

  @ManyToOne(() => PostEntity, (post) => post.likes, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'post_id',
    foreignKeyConstraintName: 'FK_post_likes_post_id',
  })
  post?: Relation<PostEntity>;

  @Column({ name: 'user_id', type: 'bigint' })
  userId!: AutoIncrementID;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'user_id',
    foreignKeyConstraintName: 'FK_post_likes_user_id',
  })
  user?: Relation<UserEntity>;
}
