import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AutoIncrementID } from '../../../common/types/common.type';
import { EBookingRequestStatus } from '../constants/booking.constant';

export class BookingUserSummaryResDto {
  @ApiProperty({ type: String, example: '100' })
  id!: AutoIncrementID;

  @ApiProperty({ example: 'Kiriko' })
  displayName!: string;

  @ApiPropertyOptional({
    example:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
  })
  avatarUrl?: string | null;
}

export class BookingRequestResDto {
  @ApiProperty({ type: String, example: '1' })
  id!: AutoIncrementID;

  @ApiProperty({ type: String, example: '100' })
  targetCosplayerId!: AutoIncrementID;

  @ApiPropertyOptional({ type: BookingUserSummaryResDto })
  targetCosplayer?: BookingUserSummaryResDto;

  @ApiProperty({ type: String, example: '101' })
  requesterUserId!: AutoIncrementID;

  @ApiPropertyOptional({ type: BookingUserSummaryResDto })
  requesterUser?: BookingUserSummaryResDto;

  @ApiProperty({ example: 'Sự kiện / Guest festival' })
  bookingType!: string;

  @ApiProperty({ example: 'Nguyễn Văn A' })
  fullName!: string;

  @ApiProperty({ example: '0901234567 / a@example.com' })
  contactInfo!: string;

  @ApiProperty({ example: '25/12/2024' })
  targetDateLabel!: string;

  @ApiProperty({ example: '10.000.000đ' })
  budgetLabel!: string;

  @ApiProperty({ example: 'Mời cosplay Raiden Shogun tham gia booth giao lưu' })
  details!: string;

  @ApiProperty({
    enum: EBookingRequestStatus,
    example: EBookingRequestStatus.PENDING,
  })
  status!: EBookingRequestStatus;

  @ApiPropertyOptional({ example: 'Nhận lời tham dự' })
  responseNote?: string | null;

  @ApiPropertyOptional()
  respondedAt?: Date | null;

  @ApiProperty()
  createdAt!: Date;
}

export class DirectMessageResDto {
  @ApiProperty({ type: String, example: '1' })
  id!: AutoIncrementID;

  @ApiProperty({ type: String, example: '100' })
  senderId!: AutoIncrementID;

  @ApiPropertyOptional({ type: BookingUserSummaryResDto })
  sender?: BookingUserSummaryResDto;

  @ApiProperty({ type: String, example: '101' })
  recipientId!: AutoIncrementID;

  @ApiPropertyOptional({ type: BookingUserSummaryResDto })
  recipient?: BookingUserSummaryResDto;

  @ApiProperty({
    example: 'Chào bạn, mình muốn thảo luận thêm về lịch trình sự kiện.',
  })
  content!: string;

  @ApiProperty({ example: false })
  isRead!: boolean;

  @ApiPropertyOptional()
  readAt?: Date | null;

  @ApiProperty()
  createdAt!: Date;
}

export class ConversationSummaryResDto {
  @ApiProperty({ type: String, example: '101' })
  partnerUserId!: AutoIncrementID;

  @ApiProperty({ example: 'Kiriko' })
  partnerDisplayName!: string;

  @ApiPropertyOptional({
    example:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
  })
  partnerAvatarUrl?: string | null;

  @ApiProperty({ example: 'Hẹn gặp bạn tại festival nhé!' })
  lastMessage!: string;

  @ApiProperty()
  lastMessageAt!: Date;

  @ApiProperty({ example: 2 })
  unreadCount!: number;
}
