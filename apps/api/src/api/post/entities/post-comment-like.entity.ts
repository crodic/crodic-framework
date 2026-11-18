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
import { PostCommentEntity } from './post-comment.entity';

@Entity('post_comment_likes')
@Index('UQ_post_comment_likes_pair', ['commentId', 'userId'], { unique: true })
export class PostCommentLikeEntity extends AbstractEntity {
  constructor(data?: Partial<PostCommentLikeEntity>) {
    super();
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn('increment', {
    primaryKeyConstraintName: 'PK_post_comment_like_id',
    type: 'bigint',
  })
  id!: AutoIncrementID;

  @Column({ name: 'comment_id', type: 'bigint' })
  commentId!: AutoIncrementID;

  @ManyToOne(() => PostCommentEntity, (comment) => comment.likes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'comment_id',
    foreignKeyConstraintName: 'FK_post_comment_likes_comment_id',
  })
  comment?: Relation<PostCommentEntity>;

  @Column({ name: 'user_id', type: 'bigint' })
  userId!: AutoIncrementID;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'user_id',
    foreignKeyConstraintName: 'FK_post_comment_likes_user_id',
  })
  user?: Relation<UserEntity>;
}
