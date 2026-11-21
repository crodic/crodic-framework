import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayFieldOptional,
  ClassFieldOptional,
  StringField,
  StringFieldOptional,
} from '../../../decorators/field.decorators';
import { Trim } from '../../../decorators/transform.decorators';

export class CosplayerSocialLinksDto {
  @StringFieldOptional()
  @Trim()
  facebook?: string;

  @StringFieldOptional()
  @Trim()
  instagram?: string;

  @StringFieldOptional()
  @Trim()
  tiktok?: string;

  @StringFieldOptional()
  @Trim()
  twitter?: string;

  @StringFieldOptional()
  @Trim()
  youtube?: string;

  @StringFieldOptional()
  @Trim()
  other?: string;
}

export class CreateCosplayerApplicationReqDto {
  @StringField({ minLength: 2, maxLength: 100 })
  @Trim()
  @ApiProperty({
    example: 'Elysia Cosplay',
    description: 'Nghệ danh hoạt động của Cosplayer',
  })
  stageName!: string;

  @StringField({ minLength: 20 })
  @Trim()
  @ApiProperty({
    example:
      'Tôi đã có hơn 3 năm tham gia cosplay tại các festival Hà Nội & TP.HCM...',
    description:
      'Giới thiệu kinh nghiệm, phong cách cosplay, giải thưởng đã đạt được',
  })
  bio!: string;

  @ClassFieldOptional(() => CosplayerSocialLinksDto)
  @ApiPropertyOptional({ type: () => CosplayerSocialLinksDto })
  socialLinks?: CosplayerSocialLinksDto;

  @ArrayFieldOptional(() => String)
  @ApiPropertyOptional({
    type: [String],
    example: [
      'https://example.com/proof1.jpg',
      'https://example.com/proof2.jpg',
    ],
    description:
      'Danh sách URL hình ảnh chứng minh hoạt động (ảnh festival, ảnh studio)',
  })
  portfolioUrls?: string[];
}
