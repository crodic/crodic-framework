import {
  AllowedFilter,
  QueryBuilder,
  QueryParams,
} from '../../../common/query-builder';
import { Paginated } from '../../../common/dto/offset-pagination/paginated.dto';
import { AutoIncrementID } from '../../../common/types/common.type';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, In, Repository } from 'typeorm';
import { CosplayerProfileEntity } from '../../cosplayer/entities/cosplayer-profile.entity';
import { UserEntity } from '../../user/entities/user.entity';
import { CosplayerProfileUtil } from '../../cosplayer/utils/cosplayer-profile.util';
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
    @InjectRepository(CosplayerProfileEntity)
    private readonly profileRepo: Repository<CosplayerProfileEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
  ) {}

  /**
   * Get active spotlight banners for home screen / hero carousel.
   */
  async getActiveBanners(): Promise<SpotlightBannerResDto[]> {
    const banners = await this.bannerRepo.find({
      where: { isActive: true },
      relations: ['cosplayerUser'],
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
    });

    const activeBanners = banners.filter(
      (b) => b.cosplayerUser !== null && !b.cosplayerUser?.deletedAt,
    );

    const profileMap = await this.loadProfileMap(
      activeBanners.map((b) => b.cosplayerUserId),
    );

    return activeBanners.map((b) =>
      this.toBannerDto(b, profileMap.get(String(b.cosplayerUserId))),
    );
  }

  /**
   * Admin: List all spotlight banners with query builder support.
   */
  async findAllAdmin(
    query: QueryParams,
  ): Promise<Paginated<SpotlightBannerAdminResDto>> {
    const baseQb = this.bannerRepo
      .createQueryBuilder('banner')
      .leftJoinAndSelect('banner.cosplayerUser', 'cosplayerUser')
      .leftJoin(
        CosplayerProfileEntity,
        'cosplayer',
        'cosplayer.userId = banner.cosplayerUserId',
      );

    const paginated = await QueryBuilder.for(baseQb, query)
      .allowedFilters([
        AllowedFilter.exact('isActive'),
        AllowedFilter.partial('badge'),
        AllowedFilter.callback('search', (qb, value) => {
          const term = Array.isArray(value) ? String(value[0]) : String(value);
          const normalized = term.trim().toLowerCase();
          if (!normalized) return;
          qb.andWhere(
            new Brackets((b) => {
              b.where('LOWER(banner.badge) LIKE :sTerm', {
                sTerm: `%${normalized}%`,
              })
                .orWhere('LOWER(banner.tagline) LIKE :sTerm', {
                  sTerm: `%${normalized}%`,
                })
                .orWhere('LOWER(cosplayer.displayName) LIKE :sTerm', {
                  sTerm: `%${normalized}%`,
                })
                .orWhere('LOWER(cosplayerUser.fullName) LIKE :sTerm', {
                  sTerm: `%${normalized}%`,
                });
            }),
          );
        }),
      ])
      .allowedSorts(['sortOrder', 'createdAt', 'updatedAt'])
      .defaultSort('sortOrder')
      .paginate();

    const profileMap = await this.loadProfileMap(
      paginated.data.map((b) => b.cosplayerUserId),
    );

    const mapped = paginated.data.map((b) =>
      this.toAdminBannerDto(b, profileMap.get(String(b.cosplayerUserId))),
    );
    return new Paginated(mapped, paginated.meta, paginated.links);
  }

  /**
   * Admin: Get banner by ID.
   */
  async findById(id: AutoIncrementID): Promise<SpotlightBannerAdminResDto> {
    const banner = await this.bannerRepo.findOne({
      where: { id },
      relations: ['cosplayerUser'],
    });
    if (!banner) {
      throw new NotFoundException(`Spotlight banner #${id} not found`);
    }
    const profile = await this.profileRepo.findOne({
      where: { userId: banner.cosplayerUserId },
    });
    return this.toAdminBannerDto(banner, profile);
  }

  /**
   * Admin: Create new spotlight banner.
   */
  async createBanner(
    dto: CreateSpotlightBannerReqDto,
  ): Promise<SpotlightBannerAdminResDto> {
    const user = await this.userRepo.findOne({
      where: { id: dto.cosplayerUserId },
    });
    if (!user) {
      throw new NotFoundException(`User #${dto.cosplayerUserId} not found`);
    }

    const banner = this.bannerRepo.create({
      badge: dto.badge,
      tagline: dto.tagline,
      bannerImageUrl: dto.bannerImageUrl,
      bannerFileId: dto.bannerFileId ?? null,
      sortOrder: dto.sortOrder ?? 0,
      cosplayerUserId: dto.cosplayerUserId,
      isActive: dto.isActive ?? true,
    });

    const saved = await this.bannerRepo.save(banner);
    saved.cosplayerUser = user;
    const profile = await this.profileRepo.findOne({
      where: { userId: saved.cosplayerUserId },
    });
    return this.toAdminBannerDto(saved, profile);
  }

  /**
   * Admin: Update spotlight banner.
   */
  async updateBanner(
    id: AutoIncrementID,
    dto: UpdateSpotlightBannerReqDto,
  ): Promise<SpotlightBannerAdminResDto> {
    const banner = await this.bannerRepo.findOne({
      where: { id },
      relations: ['cosplayerUser'],
    });
    if (!banner) {
      throw new NotFoundException(`Spotlight banner #${id} not found`);
    }

    if (dto.cosplayerUserId !== undefined) {
      const user = await this.userRepo.findOne({
        where: { id: dto.cosplayerUserId },
      });
      if (!user) {
        throw new NotFoundException(`User #${dto.cosplayerUserId} not found`);
      }
      banner.cosplayerUserId = dto.cosplayerUserId;
      banner.cosplayerUser = user;
    }

    if (dto.badge !== undefined) banner.badge = dto.badge;
    if (dto.tagline !== undefined) banner.tagline = dto.tagline;
    if (dto.bannerImageUrl !== undefined)
      banner.bannerImageUrl = dto.bannerImageUrl;
    if (dto.bannerFileId !== undefined) banner.bannerFileId = dto.bannerFileId;
    if (dto.sortOrder !== undefined) banner.sortOrder = dto.sortOrder;
    if (dto.isActive !== undefined) banner.isActive = dto.isActive;

    const saved = await this.bannerRepo.save(banner);
    const profile = await this.profileRepo.findOne({
      where: { userId: saved.cosplayerUserId },
    });
    return this.toAdminBannerDto(saved, profile);
  }

  /**
   * Admin: Toggle active status.
   */
  async toggleBanner(id: AutoIncrementID): Promise<SpotlightBannerAdminResDto> {
    const banner = await this.bannerRepo.findOne({
      where: { id },
      relations: ['cosplayerUser'],
    });
    if (!banner) {
      throw new NotFoundException(`Spotlight banner #${id} not found`);
    }

    banner.isActive = !banner.isActive;
    const saved = await this.bannerRepo.save(banner);
    const profile = await this.profileRepo.findOne({
      where: { userId: saved.cosplayerUserId },
    });
    return this.toAdminBannerDto(saved, profile);
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

  private async loadProfileMap(
    userIds: AutoIncrementID[],
  ): Promise<Map<string, CosplayerProfileEntity>> {
    return CosplayerProfileUtil.loadProfilesMap(this.profileRepo, userIds);
  }

  private toBannerDto(
    b: SpotlightBannerEntity,
    profile?: CosplayerProfileEntity | null,
  ): SpotlightBannerResDto {
    const display = CosplayerProfileUtil.formatDisplay(
      profile,
      b.cosplayerUser,
    );
    const name = display.displayName || `User #${b.cosplayerUserId}`;
    const portfolioHref =
      display.portfolioHref || `/cosplayer/${b.cosplayerUserId}`;

    return {
      id: b.id,
      name,
      isVerified: display.isVerified,
      badge: b.badge,
      tagline: b.tagline,
      bannerImageUrl: b.bannerImageUrl,
      portfolioHref,
      sortOrder: b.sortOrder,
      cosplayerUserId: b.cosplayerUserId,
      createdAt: b.createdAt,
    };
  }

  private toAdminBannerDto(
    b: SpotlightBannerEntity,
    profile?: CosplayerProfileEntity | null,
  ): SpotlightBannerAdminResDto {
    return {
      ...this.toBannerDto(b, profile),
      bannerFileId: b.bannerFileId ?? null,
      isActive: b.isActive,
      updatedAt: b.updatedAt,
    };
  }
}
