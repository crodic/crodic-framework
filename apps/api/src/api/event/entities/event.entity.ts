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
import { CityEntity } from '../../location/entities/city.entity';
import { FileEntity } from '../../file/entities/file.entity';
import { AdminUserEntity } from '../../admin-user/entities/admin-user.entity';
import { EEventStatus } from '../constants/event.constant';
import { EventParticipantEntity } from './event-participant.entity';
import { EventApplicationEntity } from './event-application.entity';
import { EventInterestEntity } from './event-interest.entity';

@Entity('events')
@Index('UQ_events_slug', ['slug'], {
  unique: true,
  where: '"deleted_at" IS NULL',
})
@Index('IDX_events_status_start', ['status', 'startAt'])
@Index('IDX_events_featured', ['isFeaturedFestival', 'startAt'])
@Index('IDX_events_recruiting', ['isRecruiting', 'startAt'])
export class EventEntity extends AbstractEntity {
  constructor(data?: Partial<EventEntity>) {
    super();
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn('increment', {
    primaryKeyConstraintName: 'PK_event_id',
    type: 'bigint',
  })
  id!: AutoIncrementID;

  @Column({ length: 200 })
  slug!: string;

  @Column({ length: 220 })
  title!: string;

  @Column({ name: 'day_label', length: 10 })
  dayLabel!: string;

  @Column({ name: 'month_label', length: 20 })
  monthLabel!: string;

  @Column({ name: 'year_label', type: 'varchar', length: 10, nullable: true })
  yearLabel?: string | null;

  @Column({ name: 'date_string', length: 40 })
  dateString!: string;

  @Column({ name: 'start_at', type: 'timestamptz' })
  startAt!: Date;

  @Column({ name: 'end_at', type: 'timestamptz', nullable: true })
  endAt?: Date | null;

  @Column({ name: 'location_label', length: 100 })
  locationLabel!: string;

  @Column({
    name: 'location_filter_code',
    length: 40,
    default: 'hcm',
  })
  locationFilterCode!: string;

  @Column({ name: 'city_id', type: 'bigint', nullable: true })
  cityId?: AutoIncrementID | null;

  @ManyToOne(() => CityEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({
    name: 'city_id',
    foreignKeyConstraintName: 'FK_events_city_id',
  })
  city?: Relation<CityEntity> | null;

  @Column({ length: 255 })
  venue!: string;

  @Column({ name: 'image_file_id', type: 'bigint', nullable: true })
  imageFileId?: AutoIncrementID | null;

  @ManyToOne(() => FileEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({
    name: 'image_file_id',
    foreignKeyConstraintName: 'FK_events_image_file_id',
  })
  imageFile?: Relation<FileEntity> | null;

  @Column({ name: 'image_url', length: 500 })
  imageUrl!: string;

  @Column({
    name: 'banner_image_url',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  bannerImageUrl?: string | null;

  @Column({ type: 'text' })
  description!: string;

  @Column({
    name: 'ticket_price_label',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  ticketPriceLabel?: string | null;

  @Column({ name: 'ticket_price_amount', type: 'integer', nullable: true })
  ticketPriceAmount?: number | null;

  @Column({ name: 'is_recruiting', type: 'boolean', default: false })
  isRecruiting!: boolean;

  @Column({ name: 'is_featured_festival', type: 'boolean', default: false })
  isFeaturedFestival!: boolean;

  @Column({
    name: 'registration_cta',
    type: 'varchar',
    length: 120,
    nullable: true,
  })
  registrationCta?: string | null;

  @Column({ type: 'jsonb', default: () => `'[]'` })
  schedule!: any[];

  @Column({ type: 'jsonb', default: () => `'[]'` })
  categories!: string[];

  @Column({ name: 'filter_tags', type: 'jsonb', default: () => `'[]'` })
  filterTags!: string[];

  @Column({
    type: 'enum',
    enum: EEventStatus,
    default: EEventStatus.UPCOMING,
    enumName: 'event_status_enum',
  })
  status!: EEventStatus;

  @Column({ name: 'participants_count', type: 'integer', default: 0 })
  participantsCount!: number;

  @Column({ name: 'applications_count', type: 'integer', default: 0 })
  applicationsCount!: number;

  @Column({ name: 'interested_count', type: 'integer', default: 0 })
  interestedCount!: number;

  @Column({ name: 'created_by_admin_id', type: 'bigint', nullable: true })
  createdByAdminId?: AutoIncrementID | null;

  @ManyToOne(() => AdminUserEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({
    name: 'created_by_admin_id',
    foreignKeyConstraintName: 'FK_events_created_by_admin_id',
  })
  createdByAdmin?: Relation<AdminUserEntity> | null;

  @OneToMany(() => EventParticipantEntity, (participant) => participant.event)
  participants?: Relation<EventParticipantEntity>[];

  @OneToMany(() => EventApplicationEntity, (application) => application.event)
  applications?: Relation<EventApplicationEntity>[];

  @OneToMany(() => EventInterestEntity, (interest) => interest.event)
  interests?: Relation<EventInterestEntity>[];

  @DeleteDateColumn({
    name: 'deleted_at',
    type: 'timestamptz',
    default: null,
  })
  deletedAt?: Date | null;
}
