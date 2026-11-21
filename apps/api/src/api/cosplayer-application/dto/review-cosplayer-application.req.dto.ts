import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  EnumField,
  StringFieldOptional,
} from '../../../decorators/field.decorators';
import { Trim } from '../../../decorators/transform.decorators';
import { ECosplayerApplicationStatus } from '../constants/cosplayer-application.constant';

export class ReviewCosplayerApplicationReqDto {
  @EnumField(() => ECosplayerApplicationStatus)
  @ApiProperty({
    enum: [
      ECosplayerApplicationStatus.APPROVED,
      ECosplayerApplicationStatus.REJECTED,
    ],
    example: ECosplayerApplicationStatus.APPROVED,
  })
  status!:
    ECosplayerApplicationStatus.APPROVED | ECosplayerApplicationStatus.REJECTED;

  @StringFieldOptional()
  @Trim()
  @ApiPropertyOptional({
    example:
      'Hồ sơ chưa có đủ hình ảnh đối chiếu hoặc tài khoản mạng xã hội không chính chủ',
    description: 'Lý do từ chối (bắt buộc nếu từ chối)',
  })
  rejectionReason?: string;

  @StringFieldOptional()
  @Trim()
  @ApiPropertyOptional({
    example: 'Đã kiểm tra tài khoản TikTok và ảnh festival hợp lệ',
    description: 'Ghi chú nội bộ cho ban quản trị',
  })
  adminNotes?: string;
}
