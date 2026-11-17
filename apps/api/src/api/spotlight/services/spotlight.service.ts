import {
  AllowedFilter,
  QueryBuilder,
  QueryParams,
} from '../../../common/query-builder';
import { Paginated } from '../../../common/dto/offset-pagination/paginated.dto';
import { AutoIncrementID } from '../../../common/types/common.type';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateSpotlightBannerReqDto,
  UpdateSpotlightBannerReqDto,
} from '../dto/spotlight-req.dto';
import {
  SpotlightBannerAdminResDto,
  SpotlightBannerResDto,
} from '../dto/spotlight-res.dto';
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

  /**
   * Admin: List all spotlight banners with query builder support.
   */
  async findAllAdmin(
    query: QueryParams,
  ): Promise<Paginated<SpotlightBannerAdminResDto>> {
    const baseQb = this.bannerRepo.createQueryBuilder('banner');

    const paginated = await QueryBuilder.for(baseQb, query)
      .allowedFilters([
        AllowedFilter.exact('isActive'),
        AllowedFilter.partial('name'),
        AllowedFilter.partial('badge'),
      ])
      .allowedSorts(['sortOrder', 'createdAt', 'updatedAt'])
      .defaultSort('sortOrder')
      .paginate();

    const mapped = paginated.data.map((b) => this.toAdminBannerDto(b));
    return new Paginated(mapped, paginated.meta, paginated.links);
  }

  /**
   * Admin: Get banner by ID.
   */
  async findById(id: AutoIncrementID): Promise<SpotlightBannerAdminResDto> {
    const banner = await this.bannerRepo.findOne({ where: { id } });
    if (!banner) {
      throw new NotFoundException(`Spotlight banner #${id} not found`);
    }
    return this.toAdminBannerDto(banner);
  }

  /**
   * Admin: Create new spotlight banner.
   */
  async createBanner(
    dto: CreateSpotlightBannerReqDto,
  ): Promise<SpotlightBannerAdminResDto> {
    const banner = this.bannerRepo.create({
      name: dto.name,
      isVerified: dto.isVerified ?? true,
      badge: dto.badge,
      tagline: dto.tagline,
      bannerImageUrl: dto.bannerImageUrl,
      bannerFileId: dto.bannerFileId ?? null,
      portfolioHref: dto.portfolioHref,
      bookingHref: dto.bookingHref ?? null,
      sortOrder: dto.sortOrder ?? 0,
      cosplayerUserId: dto.cosplayerUserId ?? null,
      isActive: dto.isActive ?? true,
    });

    const saved = await this.bannerRepo.save(banner);
    return this.toAdminBannerDto(saved);
  }

  /**
   * Admin: Update spotlight banner.
   */
  async updateBanner(
    id: AutoIncrementID,
    dto: UpdateSpotlightBannerReqDto,
  ): Promise<SpotlightBannerAdminResDto> {
    const banner = await this.bannerRepo.findOne({ where: { id } });
    if (!banner) {
      throw new NotFoundException(`Spotlight banner #${id} not found`);
    }

    if (dto.name !== undefined) banner.name = dto.name;
    if (dto.isVerified !== undefined) banner.isVerified = dto.isVerified;
    if (dto.badge !== undefined) banner.badge = dto.badge;
    if (dto.tagline !== undefined) banner.tagline = dto.tagline;
    if (dto.bannerImageUrl !== undefined)
      banner.bannerImageUrl = dto.bannerImageUrl;
    if (dto.bannerFileId !== undefined) banner.bannerFileId = dto.bannerFileId;
    if (dto.portfolioHref !== undefined)
      banner.portfolioHref = dto.portfolioHref;
    if (dto.bookingHref !== undefined) banner.bookingHref = dto.bookingHref;
    if (dto.sortOrder !== undefined) banner.sortOrder = dto.sortOrder;
    if (dto.cosplayerUserId !== undefined)
      banner.cosplayerUserId = dto.cosplayerUserId;
    if (dto.isActive !== undefined) banner.isActive = dto.isActive;

    const saved = await this.bannerRepo.save(banner);
    return this.toAdminBannerDto(saved);
  }

  /**
   * Admin: Toggle active status.
   */
  async toggleBanner(id: AutoIncrementID): Promise<SpotlightBannerAdminResDto> {
    const banner = await this.bannerRepo.findOne({ where: { id } });
    if (!banner) {
      throw new NotFoundException(`Spotlight banner #${id} not found`);
    }

    banner.isActive = !banner.isActive;
    const saved = await this.bannerRepo.save(banner);
    return this.toAdminBannerDto(saved);
  }

  /**
   * Admin: Delete spotlight banner.
   */
  async deleteBanner(id: AutoIncrementID): Promise<void> {
    const banner = await this.bannerRepo.findOne({ where: { id } });
    if (!banner) {
      throw new NotFoundException(`Spotlight banner #${id} not found`);
    }
    await this.bannerRepo.delete({ id });
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

  private toAdminBannerDto(
    b: SpotlightBannerEntity,
  ): SpotlightBannerAdminResDto {
    return {
      id: b.id,
      name: b.name,
      isVerified: b.isVerified,
      badge: b.badge,
      tagline: b.tagline,
      bannerImageUrl: b.bannerImageUrl,
      bannerFileId: b.bannerFileId ?? null,
      portfolioHref: b.portfolioHref,
      bookingHref: b.bookingHref ?? null,
      sortOrder: b.sortOrder,
      cosplayerUserId: b.cosplayerUserId ?? null,
      isActive: b.isActive,
      createdAt: b.createdAt,
      updatedAt: b.updatedAt,
    };
  }
}
