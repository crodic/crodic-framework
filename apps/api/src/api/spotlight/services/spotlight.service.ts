import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SpotlightBannerResDto } from '../dto/spotlight-res.dto';
import { SpotlightBannerEntity } from '../entities/spotlight-banner.entity';

@Injectable()
export class SpotlightService {
  constructor(
    @InjectRepository(SpotlightBannerEntity)
    private readonly bannerRepo: Repository<SpotlightBannerEntity>,
  ) {}

  /**
   * Get active spotlight banners for home screen / hero carousel.
   */
  async getActiveBanners(): Promise<SpotlightBannerResDto[]> {
    const banners = await this.bannerRepo.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
    });

    return banners.map((b) => this.toBannerDto(b));
  }

  private toBannerDto(b: SpotlightBannerEntity): SpotlightBannerResDto {
    return {
      id: b.id,
      name: b.name,
      isVerified: b.isVerified,
      badge: b.badge,
      tagline: b.tagline,
      bannerImageUrl: b.bannerImageUrl,
      portfolioHref: b.portfolioHref,
      bookingHref: b.bookingHref ?? null,
      sortOrder: b.sortOrder,
      cosplayerUserId: b.cosplayerUserId ?? null,
      createdAt: b.createdAt,
    };
  }
}
