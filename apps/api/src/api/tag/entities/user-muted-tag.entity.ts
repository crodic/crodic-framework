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
import { TagEntity } from './tag.entity';

@Entity('user_muted_tags')
@Index('UQ_user_muted_tags_user_tag', ['userId', 'tagId'], { unique: true })
@Index('IDX_user_muted_tags_user_id', ['userId'])
export class UserMutedTagEntity extends AbstractEntity {
  constructor(data?: Partial<UserMutedTagEntity>) {
    super();
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn('increment', {
    primaryKeyConstraintName: 'PK_user_muted_tag_id',
    type: 'bigint',
  })
  id!: AutoIncrementID;

  @Column({ name: 'user_id', type: 'bigint' })
  userId!: AutoIncrementID;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'user_id',
    foreignKeyConstraintName: 'FK_user_muted_tags_user_id',
  })
  user!: Relation<UserEntity>;

  @Column({ name: 'tag_id', type: 'bigint' })
  tagId!: AutoIncrementID;

  @ManyToOne(() => TagEntity, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'tag_id',
    foreignKeyConstraintName: 'FK_user_muted_tags_tag_id',
  })
  tag!: Relation<TagEntity>;

  @Column({ name: 'include_children', type: 'boolean', default: true })
  includeChildren!: boolean;
}
