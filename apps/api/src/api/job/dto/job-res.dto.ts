import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AutoIncrementID } from '../../../common/types/common.type';
import {
  EJobApplicationStatus,
  EJobCategory,
  EJobStatus,
} from '../constants/job.constant';

export class JobSummaryResDto {
  @ApiProperty({ type: String, example: '1' })
  id!: AutoIncrementID;

  @ApiProperty({ example: 'hoyoverse-official-cosplayer-tgs-2024' })
  slug!: string;

  @ApiProperty({
    example: 'Tuyển Cosplayer Khách Mời Độc Quyền - HoYoverse Booth',
  })
  title!: string;

  @ApiProperty({ example: 'HoYoverse' })
  brandName!: string;

  @ApiPropertyOptional({
    example:
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200',
  })
  brandLogoUrl?: string | null;

  @ApiPropertyOptional({ example: 'HYV' })
  brandInitials?: string | null;

  @ApiPropertyOptional({ example: 'bg-primary' })
  brandColor?: string | null;

  @ApiProperty({ example: true })
  isVerified!: boolean;

  @ApiProperty({ example: 'TP. Hồ Chí Minh' })
  locationLabel!: string;

  @ApiPropertyOptional({ example: 'hcm' })
  locationFilterCode?: string | null;

  @ApiProperty({ example: '15.000.000đ - 25.000.000đ / show' })
  budgetLabel!: string;

  @ApiPropertyOptional({ example: 15000000 })
  budgetMin?: number | null;

  @ApiPropertyOptional({ example: 25000000 })
  budgetMax?: number | null;

  @ApiProperty({ enum: EJobCategory, example: EJobCategory.EVENT })
  categoryCode!: EJobCategory;

  @ApiProperty({ example: 'Sự kiện & Festival' })
  categoryLabel!: string;

  @ApiProperty({ example: 'Còn 12 ngày' })
  deadlineLabel!: string;

  @ApiPropertyOptional()
  deadlineAt?: Date | null;

  @ApiProperty({ type: [String], example: ['Genshin Impact', 'Booth Guest'] })
  filterTags!: string[];

  @ApiProperty({
    type: [String],
    example: ['Tài trợ trang phục 100%', 'Make-up chuyên nghiệp'],
  })
  perks!: string[];

  @ApiProperty({ example: 'recruitment@hoyoverse.com' })
  contactEmail!: string;

  @ApiPropertyOptional({
    example:
      'https://images.unsplash.com/photo-1511578314322-379afb476865?w=500',
  })
  thumbnailUrl?: string | null;

  @ApiProperty({ example: true })
  isFeatured!: boolean;

  @ApiProperty({ enum: EJobStatus, example: EJobStatus.OPEN })
  status!: EJobStatus;

  @ApiProperty({ example: 18 })
  applicationsCount!: number;

  @ApiPropertyOptional({ example: false })
  isAppliedByCurrentUser?: boolean;

  @ApiProperty()
  createdAt!: Date;
}

export class JobDetailResDto extends JobSummaryResDto {
  @ApiPropertyOptional({ type: String, nullable: true })
  brandId?: AutoIncrementID | null;

  @ApiProperty({
    example:
      'HoYoverse đang tìm kiếm gương mặt Cosplayer đại diện cho các nhân vật chủ chốt...',
  })
  description!: string;

  @ApiProperty({
    example:
      'Chiều cao từ 1m62 trở lên, có kinh nghiệm diễn xuất trước ống kính',
  })
  requirements!: string;

  @ApiProperty()
  updatedAt!: Date;
}

export class JobApplicationResDto {
  @ApiProperty({ type: String, example: '1' })
  id!: AutoIncrementID;

  @ApiProperty({ type: String, example: '1' })
  jobId!: AutoIncrementID;

  @ApiProperty({ type: String, example: '100' })
  applicantUserId!: AutoIncrementID;

  @ApiProperty({ example: 'Nguyễn Văn A' })
  fullName!: string;

  @ApiProperty({ example: 'Kiriko' })
  stageName!: string;

  @ApiProperty({ example: '0987654321 / kiriko@example.com' })
  contactInfo!: string;

  @ApiPropertyOptional({ example: 'https://kosume.vn/cosplayer/kiriko-cos' })
  portfolioUrl?: string | null;

  @ApiProperty({
    example:
      '5 năm kinh nghiệm cosplay, đã tham gia nhiều sự kiện của HoYoverse',
  })
  experience!: string;

  @ApiPropertyOptional({ example: 'Rất mong có cơ hội hợp tác!' })
  message?: string | null;

  @ApiProperty({
    enum: EJobApplicationStatus,
    example: EJobApplicationStatus.PENDING,
  })
  status!: EJobApplicationStatus;

  @ApiProperty()
  createdAt!: Date;
}
