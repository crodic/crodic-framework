import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AutoIncrementID } from '../../../common/types/common.type';
import {
  EEventApplicationStatus,
  EEventStatus,
} from '../constants/event.constant';

export class EventParticipantResDto {
  @ApiProperty({ type: String, example: '1' })
  id!: AutoIncrementID;

  @ApiProperty({ type: String, example: '1' })
  eventId!: AutoIncrementID;

  @ApiProperty({ type: String, example: '100' })
  userId!: AutoIncrementID;

  @ApiProperty({ example: 'KIRIKO' })
  name!: string;

  @ApiPropertyOptional({
    example:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500',
    nullable: true,
  })
  avatarUrl?: string | null;

  @ApiProperty({ example: true })
  isVerified!: boolean;

  @ApiPropertyOptional({ example: 'Ban Giám Khảo' })
  roleLabel?: string | null;

  @ApiProperty({ example: 0 })
  sortOrder!: number;
}

export class EventSummaryResDto {
  @ApiProperty({ type: String, example: '1' })
  id!: AutoIncrementID;

  @ApiProperty({ example: 'winter-cosplay-fest-2024' })
  slug!: string;

  @ApiProperty({ example: 'Winter Cosplay Fest 2024' })
  title!: string;

  @ApiProperty({ example: '24' })
  dayLabel!: string;

  @ApiProperty({ example: 'Tháng 12' })
  monthLabel!: string;

  @ApiPropertyOptional({ example: '2024' })
  yearLabel?: string | null;

  @ApiProperty({ example: '24 - 25 Tháng 12, 2024' })
  dateString!: string;

  @ApiProperty()
  startAt!: Date;

  @ApiPropertyOptional()
  endAt?: Date | null;

  @ApiProperty({ example: 'TP. Hồ Chí Minh' })
  locationLabel!: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  cityId?: AutoIncrementID | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  organizerUserId?: AutoIncrementID | null;

  @ApiPropertyOptional({
    example: 'Kosume Events & Community',
    nullable: true,
  })
  organizerName?: string | null;

  @ApiProperty({
    example: 'Trung tâm Triển lãm SECC - 799 Nguyễn Văn Linh, Quận 7',
  })
  venue!: string;

  @ApiProperty({
    example:
      'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200',
  })
  imageUrl!: string;

  @ApiPropertyOptional({
    example:
      'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1600',
  })
  bannerImageUrl?: string | null;

  @ApiPropertyOptional({ example: '150.000đ - 350.000đ' })
  ticketPriceLabel?: string | null;

  @ApiPropertyOptional({ example: 150000 })
  ticketPriceAmount?: number | null;

  @ApiProperty({ example: true })
  isRecruiting!: boolean;

  @ApiProperty({ example: true })
  isFeaturedFestival!: boolean;

  @ApiProperty({
    type: [String],
    example: ['Cosplay Contest', 'Artist Alley', 'Workshop'],
  })
  categories!: string[];

  @ApiProperty({ enum: EEventStatus, example: EEventStatus.UPCOMING })
  status!: EEventStatus;

  @ApiProperty({ example: 450 })
  participantsCount!: number;

  @ApiProperty({ example: 1200 })
  interestedCount!: number;

  @ApiProperty({ example: 35 })
  applicationsCount!: number;

  @ApiPropertyOptional({ example: false })
  isInterestedByCurrentUser?: boolean;

  @ApiPropertyOptional({ example: false })
  isParticipatingByCurrentUser?: boolean;

  @ApiPropertyOptional({
    example: 'Lễ hội cosplay mùa đông quy mô lớn nhất năm...',
  })
  description?: string;

  @ApiPropertyOptional({ type: () => [EventParticipantResDto] })
  participants?: EventParticipantResDto[];

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

export class EventDetailResDto extends EventSummaryResDto {
  declare description: string;

  @ApiProperty({
    type: 'array',
    example: [{ time: '09:00', activity: 'Khai mạc lễ hội' }],
  })
  schedule!: any[];

  declare participants: EventParticipantResDto[];
}

export class EventApplicationResDto {
  @ApiProperty({ type: String, example: '1' })
  id!: AutoIncrementID;

  @ApiProperty({ type: String, example: '1' })
  eventId!: AutoIncrementID;

  @ApiProperty({ type: String, example: '100' })
  applicantUserId!: AutoIncrementID;

  @ApiProperty({ example: 'Nguyễn Văn A' })
  fullName!: string;

  @ApiProperty({ example: 'Kiriko' })
  stageName!: string;

  @ApiProperty({ example: 'Cosplayer khách mời' })
  category!: string;

  @ApiProperty({ example: '0987654321' })
  phone!: string;

  @ApiProperty({ example: 'Raiden Shogun' })
  characterPlanned!: string;

  @ApiPropertyOptional({ example: 'https://kosume.vn/cosplayer/kiriko-cos' })
  portfolioUrl?: string | null;

  @ApiPropertyOptional({ example: 'Đã có kinh nghiệm tham gia nhiều fes lớn' })
  notes?: string | null;

  @ApiProperty({
    enum: EEventApplicationStatus,
    example: EEventApplicationStatus.PENDING,
  })
  status!: EEventApplicationStatus;

  @ApiProperty()
  createdAt!: Date;
}
