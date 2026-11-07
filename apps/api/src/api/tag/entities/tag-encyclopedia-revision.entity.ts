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
import { AdminUserEntity } from '../../admin-user/entities/admin-user.entity';
import { UserEntity } from '../../user/entities/user.entity';
import { TagEncyclopediaEntity } from './tag-encyclopedia.entity';

@Entity('tag_encyclopedia_revisions')
@Index(
  'UQ_tag_encyclopedia_revisions_number',
  ['encyclopediaId', 'revisionNumber'],
  { unique: true },
)
@Index('IDX_tag_encyclopedia_revisions_encyclopedia', ['encyclopediaId'])
export class TagEncyclopediaRevisionEntity extends AbstractEntity {
  constructor(data?: Partial<TagEncyclopediaRevisionEntity>) {
    super();
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn('increment', {
    primaryKeyConstraintName: 'PK_tag_encyclopedia_revision_id',
    type: 'bigint',
  })
  id!: AutoIncrementID;

  @Column({ name: 'encyclopedia_id', type: 'bigint' })
  encyclopediaId!: AutoIncrementID;

  @ManyToOne(
    () => TagEncyclopediaEntity,
    (encyclopedia) => encyclopedia.revisions,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({
    name: 'encyclopedia_id',
    foreignKeyConstraintName: 'FK_tag_encyclopedia_revisions_encyclopedia_id',
  })
  encyclopedia!: Relation<TagEncyclopediaEntity>;

  @Column({ name: 'revision_number', type: 'integer' })
  revisionNumber!: number;

  @Column({ type: 'text' })
  summary!: string;

  @Column({ type: 'text' })
  body!: string;

  @Column({
    name: 'change_note',
    type: 'varchar',
    length: 280,
    nullable: true,
  })
  changeNote?: string | null;

  @Column({ name: 'editor_user_id', type: 'bigint', nullable: true })
  editorUserId?: AutoIncrementID | null;

  @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({
    name: 'editor_user_id',
    foreignKeyConstraintName: 'FK_tag_encyclopedia_revisions_editor_user_id',
  })
  editorUser?: Relation<UserEntity> | null;

  @Column({ name: 'editor_admin_id', type: 'bigint', nullable: true })
  editorAdminId?: AutoIncrementID | null;

  @ManyToOne(() => AdminUserEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({
    name: 'editor_admin_id',
    foreignKeyConstraintName: 'FK_tag_encyclopedia_revisions_editor_admin_id',
  })
  editorAdmin?: Relation<AdminUserEntity> | null;
}
