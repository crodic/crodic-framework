import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AutoIncrementID } from '../../../common/types/common.type';
import {
  ENotificationCategory,
  ENotificationType,
} from '../constants/notification.constant';

export class NotificationResDto {
  @ApiProperty({ type: String, example: '1' })
  id!: AutoIncrementID;

  @ApiProperty({ type: String, example: '100' })
  recipientUserId!: AutoIncrementID;

  @ApiProperty({
    enum: ENotificationCategory,
    example: ENotificationCategory.SOCIAL,
  })
  category!: ENotificationCategory;

  @ApiProperty({ enum: ENotificationType, example: ENotificationType.LIKE })
  type!: ENotificationType;

  @ApiPropertyOptional({ type: String, example: '101' })
  actorUserId?: AutoIncrementID | null;

  @ApiPropertyOptional({ example: 'Kiriko' })
  actorName?: string | null;

  @ApiPropertyOptional({
    example:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
  })
  actorAvatarUrl?: string | null;

  @ApiPropertyOptional({ example: 'Pro Cosplayer' })
  actorRole?: string | null;

  @ApiProperty({ example: true })
  actorIsVerified!: boolean;

  @ApiProperty({ example: 'Kiriko đã thích bài viết của bạn' })
  title!: string;

  @ApiProperty({
    example: 'Bài viết "Acheron Honkai Star Rail" nhận được 1 lượt thích mới',
  })
  description!: string;

  @ApiPropertyOptional({ example: '/posts/acheron-cosplay-photoshoot' })
  actionUrl?: string | null;

  @ApiPropertyOptional({
    example:
      'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=300',
  })
  previewImageUrl?: string | null;

  @ApiPropertyOptional({ example: 'post' })
  subjectType?: string | null;

  @ApiPropertyOptional({ type: String, example: '1' })
  subjectId?: AutoIncrementID | null;

  @ApiProperty({ example: false })
  isRead!: boolean;

  @ApiPropertyOptional()
  readAt?: Date | null;

  @ApiProperty()
  createdAt!: Date;
}

export class UnreadCountResDto {
  @ApiProperty({ example: 3 })
  unreadCount!: number;
}
