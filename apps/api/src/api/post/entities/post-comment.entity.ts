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
import { PostEntity } from './post.entity';
import { UserEntity } from '../../user/entities/user.entity';
import { PostCommentLikeEntity } from './post-comment-like.entity';

@Entity('post_comments')
@Index('IDX_post_comments_post_created', ['postId', 'parentId', 'createdAt'])
@Index('IDX_post_comments_author_id', ['authorId'])
export class PostCommentEntity extends AbstractEntity {
  constructor(data?: Partial<PostCommentEntity>) {
    super();
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn('increment', {
    primaryKeyConstraintName: 'PK_post_comment_id',
    type: 'bigint',
  })
  id!: AutoIncrementID;

  @Column({ name: 'post_id', type: 'bigint' })
  postId!: AutoIncrementID;

  @ManyToOne(() => PostEntity, (post) => post.comments, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'post_id',
    foreignKeyConstraintName: 'FK_post_comments_post_id',
  })
  post?: Relation<PostEntity>;

  @Column({ name: 'author_id', type: 'bigint' })
  authorId!: AutoIncrementID;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'author_id',
    foreignKeyConstraintName: 'FK_post_comments_author_id',
  })
  author?: Relation<UserEntity>;

  @Column({ name: 'parent_id', type: 'bigint', nullable: true })
  parentId?: AutoIncrementID | null;

  @ManyToOne(() => PostCommentEntity, (comment) => comment.replies, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'parent_id',
    foreignKeyConstraintName: 'FK_post_comments_parent_id',
  })
  parent?: Relation<PostCommentEntity> | null;

  @OneToMany(() => PostCommentEntity, (comment) => comment.parent)
  replies?: Relation<PostCommentEntity>[];

  @Column({ type: 'text' })
  content!: string;

  @Column({ name: 'likes_count', type: 'integer', default: 0 })
  likesCount!: number;

  @OneToMany(() => PostCommentLikeEntity, (like) => like.comment)
  likes?: Relation<PostCommentLikeEntity>[];

  @DeleteDateColumn({
    name: 'deleted_at',
    type: 'timestamptz',
    default: null,
  })
  deletedAt?: Date | null;
}
