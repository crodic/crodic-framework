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
import { PostEntity } from '../../post/entities/post.entity';
import {
  ERankingFilterCategory,
  ERankingTrend,
} from '../constants/ranking.constant';

@Entity('leaderboard_snapshots')
@Index('IDX_leaderboard_current_rank', ['filterCategory', 'isCurrent', 'rank'])
export class LeaderboardSnapshotEntity extends AbstractEntity {
  constructor(data?: Partial<LeaderboardSnapshotEntity>) {
    super();
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn('increment', {
    primaryKeyConstraintName: 'PK_leaderboard_snapshot_id',
    type: 'bigint',
  })
  id!: AutoIncrementID;

  @Column({
    name: 'filter_category',
    type: 'enum',
    enum: ERankingFilterCategory,
    enumName: 'ranking_filter_category_enum',
  })
  filterCategory!: ERankingFilterCategory;

  @Column({ name: 'period_key', length: 32 })
  periodKey!: string;

  @Column({ name: 'is_current', type: 'boolean', default: true })
  isCurrent!: boolean;

  @Column({ type: 'integer' })
  rank!: number;

  @Column({ name: 'previous_rank', type: 'integer', nullable: true })
  previousRank?: number | null;

  @Column({
    type: 'enum',
    enum: ERankingTrend,
    default: ERankingTrend.SAME,
    enumName: 'ranking_trend_enum',
  })
  trend!: ERankingTrend;

  @Column({ name: 'user_id', type: 'bigint' })
  userId!: AutoIncrementID;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'user_id',
    foreignKeyConstraintName: 'FK_leaderboard_snapshots_user_id',
  })
  user?: Relation<UserEntity>;

  @Column({ name: 'post_id', type: 'bigint', nullable: true })
  postId?: AutoIncrementID | null;

  @ManyToOne(() => PostEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({
    name: 'post_id',
    foreignKeyConstraintName: 'FK_leaderboard_snapshots_post_id',
  })
  post?: Relation<PostEntity> | null;

  @Column({ name: 'likes_count', type: 'bigint', default: 0 })
  likesCount!: number;

  @Column({ name: 'followers_count', type: 'bigint', default: 0 })
  followersCount!: number;

  @Column({ type: 'double precision', default: 0 })
  score!: number;

  @Column({
    name: 'featured_projects',
    type: 'jsonb',
    default: () => `'[]'`,
  })
  featuredProjects!: string[];
}
