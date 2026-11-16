import {
  AllowedFilter,
  QueryBuilder,
  QueryParams,
} from '../../../common/query-builder';
import { Paginated } from '../../../common/dto/offset-pagination/paginated.dto';
import { AutoIncrementID } from '../../../common/types/common.type';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { UserEntity } from '../../user/entities/user.entity';
import { CosplayerCharacterEntity } from '../entities/cosplayer-character.entity';
import { CosplayerProfileEntity } from '../entities/cosplayer-profile.entity';
import { CosplayerServiceEntity } from '../entities/cosplayer-service.entity';
import {
  CreateCosplayerCharacterReqDto,
  CreateCosplayerServiceReqDto,
  UpdateCosplayerCharacterReqDto,
  UpdateCosplayerProfileReqDto,
  UpdateCosplayerServiceReqDto,
} from '../dto/cosplayer-req.dto';
import {
  CosplayerCharacterResDto,
  CosplayerDetailResDto,
  CosplayerServiceResDto,
  CosplayerSummaryResDto,
} from '../dto/cosplayer-res.dto';

function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

@Injectable()
export class CosplayerService {
  constructor(
    @InjectRepository(CosplayerProfileEntity)
    private readonly profileRepo: Repository<CosplayerProfileEntity>,
    @InjectRepository(CosplayerServiceEntity)
    private readonly serviceRepo: Repository<CosplayerServiceEntity>,
    @InjectRepository(CosplayerCharacterEntity)
    private readonly characterRepo: Repository<CosplayerCharacterEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
  ) {}

  /**
   * Browse cosplayers directory with QueryBuilder support.
   */
  async findAll(
    query: QueryParams,
  ): Promise<Paginated<CosplayerSummaryResDto>> {
    const baseQb = this.profileRepo.createQueryBuilder('profile');

    const paginated = await QueryBuilder.for(baseQb, query)
      .allowedFilters([
        AllowedFilter.exact('cityId'),
        AllowedFilter.exact('countryId'),
        AllowedFilter.exact('isVerified'),
        AllowedFilter.exact('isAcceptingBooking'),
        AllowedFilter.exact('isCraftingCreator'),
        AllowedFilter.partial('displayName'),
        AllowedFilter.partial('handle'),
        AllowedFilter.partial('workArea'),
        AllowedFilter.callback('search', (qb, value) => {
          const term = Array.isArray(value) ? String(value[0]) : String(value);
          const normalized = term.trim().toLowerCase();
          if (!normalized) return;
          qb.andWhere(
            new Brackets((b) => {
              b.where('LOWER(profile.displayName) LIKE :sTerm', {
                sTerm: `%${normalized}%`,
              })
                .orWhere('LOWER(profile.handle) LIKE :sTerm', {
                  sTerm: `%${normalized}%`,
                })
                .orWhere('LOWER(profile.tagline) LIKE :sTerm', {
                  sTerm: `%${normalized}%`,
                })
                .orWhere('profile.specialties::text ILIKE :sTerm', {
                  sTerm: `%${normalized}%`,
                })
                .orWhere('profile.skills::text ILIKE :sTerm', {
                  sTerm: `%${normalized}%`,
                });
            }),
          );
        }),
      ])
      .allowedSorts([
        'rankingScore',
        'totalLikesCount',
        'followersCount',
        'albumsCount',
        'createdAt',
      ])
      .defaultSort('-rankingScore')
      .paginate();

    return new Paginated(
      paginated.data.map((item) => this.toSummaryDto(item)),
      paginated.meta,
      paginated.links,
    );
  }

  /**
   * Find full public cosplayer profile by slug or handle.
   */
  async findBySlugOrHandle(
    slugOrHandle: string,
  ): Promise<CosplayerDetailResDto> {
    const cleaned = slugOrHandle.trim().replace(/^@/, '');

    const profile = await this.profileRepo.findOne({
      where: [
        { slug: cleaned },
        { handle: `@${cleaned}` },
        { handle: cleaned },
      ],
    });

    if (!profile) {
      throw new NotFoundException(`Cosplayer "${slugOrHandle}" not found`);
    }

    const [services, characters] = await Promise.all([
      this.serviceRepo.find({
        where: { userId: profile.userId, isActive: true },
        order: { sortOrder: 'ASC', id: 'ASC' },
      }),
      this.characterRepo.find({
        where: { userId: profile.userId },
        order: { sortOrder: 'ASC', id: 'ASC' },
      }),
    ]);

    return this.toDetailDto(profile, services, characters);
  }

  /**
   * Get authenticated user's cosplayer profile.
   */
  async getMyProfile(userId: AutoIncrementID): Promise<CosplayerDetailResDto> {
    let profile = await this.profileRepo.findOne({
      where: { userId },
    });

    if (!profile) {
      const user = await this.userRepo.findOne({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const baseName =
        user.username ||
        `${user.firstName} ${user.lastName || ''}`.trim() ||
        `user-${userId}`;
      let candidateSlug = slugify(baseName) || `cosplayer-${userId}`;
      const slugExists = await this.profileRepo.count({
        where: { slug: candidateSlug },
      });
      if (slugExists > 0) {
        candidateSlug = `${candidateSlug}-${userId}`;
      }

      const handle = user.username
        ? `@${user.username}`
        : `@cosplayer${userId}`;

      profile = this.profileRepo.create({
        userId,
        slug: candidateSlug,
        displayName: baseName,
        handle,
        roleBadge: 'Cosplayer',
        skills: [],
        specialties: [],
        awardsBadges: [],
        followersCount: 0,
        followingCount: 0,
        totalLikesCount: 0,
        albumsCount: 0,
        charactersCount: 0,
        collectionsCount: 0,
        rankingScore: 0,
      });

      profile = await this.profileRepo.save(profile);
    }

    const [services, characters] = await Promise.all([
      this.serviceRepo.find({
        where: { userId },
        order: { sortOrder: 'ASC', id: 'ASC' },
      }),
      this.characterRepo.find({
        where: { userId },
        order: { sortOrder: 'ASC', id: 'ASC' },
      }),
    ]);

    return this.toDetailDto(profile, services, characters);
  }

  /**
   * Update cosplayer profile.
   */
  async updateProfile(
    userId: AutoIncrementID,
    dto: UpdateCosplayerProfileReqDto,
  ): Promise<CosplayerDetailResDto> {
    let profile = await this.profileRepo.findOne({ where: { userId } });

    if (!profile) {
      await this.getMyProfile(userId);
      profile = await this.profileRepo.findOneOrFail({ where: { userId } });
    }

    if (dto.handle && dto.handle !== profile.handle) {
      const formattedHandle = dto.handle.startsWith('@')
        ? dto.handle
        : `@${dto.handle}`;
      const existing = await this.profileRepo.findOne({
        where: { handle: formattedHandle },
      });
      if (existing && String(existing.userId) !== String(userId)) {
        throw new ConflictException(
          `Handle "${formattedHandle}" is already taken`,
        );
      }
      profile.handle = formattedHandle;
    }

    if (dto.displayName !== undefined) profile.displayName = dto.displayName;
    if (dto.roleBadge !== undefined) profile.roleBadge = dto.roleBadge;
    if (dto.tagline !== undefined) profile.tagline = dto.tagline;
    if (dto.bio !== undefined) profile.bio = dto.bio;
    if (dto.artisticBio !== undefined) profile.artisticBio = dto.artisticBio;
    if (dto.avatarUrl !== undefined) profile.avatarUrl = dto.avatarUrl;
    if (dto.coverUrl !== undefined) profile.coverUrl = dto.coverUrl;
    if (dto.locationLabel !== undefined)
      profile.locationLabel = dto.locationLabel;
    if (dto.cityId !== undefined) profile.cityId = dto.cityId;
    if (dto.countryId !== undefined) profile.countryId = dto.countryId;
    if (dto.workArea !== undefined) profile.workArea = dto.workArea;
    if (dto.heightCm !== undefined) profile.heightCm = dto.heightCm;
    if (dto.heightLabel !== undefined) profile.heightLabel = dto.heightLabel;
    if (dto.experienceYearsNum !== undefined)
      profile.experienceYearsNum = dto.experienceYearsNum;
    if (dto.experienceLabel !== undefined)
      profile.experienceLabel = dto.experienceLabel;
    if (dto.skills !== undefined) profile.skills = dto.skills;
    if (dto.specialties !== undefined) profile.specialties = dto.specialties;
    if (dto.awardsBadges !== undefined) profile.awardsBadges = dto.awardsBadges;
    if (dto.contactEmail !== undefined) profile.contactEmail = dto.contactEmail;
    if (dto.contactPhone !== undefined) profile.contactPhone = dto.contactPhone;
    if (dto.facebookUrl !== undefined) profile.facebookUrl = dto.facebookUrl;
    if (dto.instagramUrl !== undefined) profile.instagramUrl = dto.instagramUrl;
    if (dto.tiktokUrl !== undefined) profile.tiktokUrl = dto.tiktokUrl;
    if (dto.twitterUrl !== undefined) profile.twitterUrl = dto.twitterUrl;
    if (dto.isAcceptingBooking !== undefined)
      profile.isAcceptingBooking = dto.isAcceptingBooking;
    if (dto.isCraftingCreator !== undefined)
      profile.isCraftingCreator = dto.isCraftingCreator;

    profile = await this.profileRepo.save(profile);

    const [services, characters] = await Promise.all([
      this.serviceRepo.find({
        where: { userId },
        order: { sortOrder: 'ASC', id: 'ASC' },
      }),
      this.characterRepo.find({
        where: { userId },
        order: { sortOrder: 'ASC', id: 'ASC' },
      }),
    ]);

    return this.toDetailDto(profile, services, characters);
  }

  // =================== SERVICES ===================

  async getServicesByUserId(
    userId: AutoIncrementID,
  ): Promise<CosplayerServiceResDto[]> {
    const list = await this.serviceRepo.find({
      where: { userId },
      order: { sortOrder: 'ASC', id: 'ASC' },
    });
    return list.map((item) => this.toServiceDto(item));
  }

  async addService(
    userId: AutoIncrementID,
    dto: CreateCosplayerServiceReqDto,
  ): Promise<CosplayerServiceResDto> {
    const service = this.serviceRepo.create({
      userId,
      title: dto.title,
      description: dto.description ?? null,
      badgeLabel: dto.badgeLabel,
      sortOrder: dto.sortOrder ?? 0,
      isActive: dto.isActive ?? true,
    });

    const saved = await this.serviceRepo.save(service);
    return this.toServiceDto(saved);
  }

  async updateService(
    userId: AutoIncrementID,
    serviceId: AutoIncrementID,
    dto: UpdateCosplayerServiceReqDto,
  ): Promise<CosplayerServiceResDto> {
    const service = await this.serviceRepo.findOne({
      where: { id: serviceId },
    });
    if (!service) {
      throw new NotFoundException(`Service #${serviceId} not found`);
    }
    if (String(service.userId) !== String(userId)) {
      throw new ForbiddenException(
        'You do not have permission to edit this service',
      );
    }

    if (dto.title !== undefined) service.title = dto.title;
    if (dto.description !== undefined) service.description = dto.description;
    if (dto.badgeLabel !== undefined) service.badgeLabel = dto.badgeLabel;
    if (dto.sortOrder !== undefined) service.sortOrder = dto.sortOrder;
    if (dto.isActive !== undefined) service.isActive = dto.isActive;

    const saved = await this.serviceRepo.save(service);
    return this.toServiceDto(saved);
  }

  async deleteService(
    userId: AutoIncrementID,
    serviceId: AutoIncrementID,
  ): Promise<void> {
    const service = await this.serviceRepo.findOne({
      where: { id: serviceId },
    });
    if (!service) {
      throw new NotFoundException(`Service #${serviceId} not found`);
    }
    if (String(service.userId) !== String(userId)) {
      throw new ForbiddenException(
        'You do not have permission to delete this service',
      );
    }
    await this.serviceRepo.delete({ id: serviceId });
  }

  // =================== CHARACTERS ===================

  async getCharactersByUserId(
    userId: AutoIncrementID,
  ): Promise<CosplayerCharacterResDto[]> {
    const list = await this.characterRepo.find({
      where: { userId },
      order: { sortOrder: 'ASC', id: 'ASC' },
    });
    return list.map((item) => this.toCharacterDto(item));
  }

  async addCharacter(
    userId: AutoIncrementID,
    dto: CreateCosplayerCharacterReqDto,
  ): Promise<CosplayerCharacterResDto> {
    const character = this.characterRepo.create({
      userId,
      characterName: dto.characterName,
      seriesName: dto.seriesName,
      characterTagId: dto.characterTagId ?? null,
      copyrightTagId: dto.copyrightTagId ?? null,
      coverFileId: dto.coverFileId ?? null,
      coverImageUrl: dto.coverImageUrl,
      albumsCount: dto.albumsCount ?? 0,
      photosCount: dto.photosCount ?? 0,
      sortOrder: dto.sortOrder ?? 0,
    });

    const saved = await this.characterRepo.save(character);

    // Update charactersCount on profile
    await this.profileRepo.increment({ userId }, 'charactersCount', 1);

    return this.toCharacterDto(saved);
  }

  async updateCharacter(
    userId: AutoIncrementID,
    characterId: AutoIncrementID,
    dto: UpdateCosplayerCharacterReqDto,
  ): Promise<CosplayerCharacterResDto> {
    const char = await this.characterRepo.findOne({
      where: { id: characterId },
    });
    if (!char) {
      throw new NotFoundException(`Character #${characterId} not found`);
    }
    if (String(char.userId) !== String(userId)) {
      throw new ForbiddenException(
        'You do not have permission to edit this character',
      );
    }

    if (dto.characterName !== undefined) char.characterName = dto.characterName;
    if (dto.seriesName !== undefined) char.seriesName = dto.seriesName;
    if (dto.characterTagId !== undefined)
      char.characterTagId = dto.characterTagId;
    if (dto.copyrightTagId !== undefined)
      char.copyrightTagId = dto.copyrightTagId;
    if (dto.coverFileId !== undefined) char.coverFileId = dto.coverFileId;
    if (dto.coverImageUrl !== undefined) char.coverImageUrl = dto.coverImageUrl;
    if (dto.albumsCount !== undefined) char.albumsCount = dto.albumsCount;
    if (dto.photosCount !== undefined) char.photosCount = dto.photosCount;
    if (dto.sortOrder !== undefined) char.sortOrder = dto.sortOrder;

    const saved = await this.characterRepo.save(char);
    return this.toCharacterDto(saved);
  }

  async deleteCharacter(
    userId: AutoIncrementID,
    characterId: AutoIncrementID,
  ): Promise<void> {
    const char = await this.characterRepo.findOne({
      where: { id: characterId },
    });
    if (!char) {
      throw new NotFoundException(`Character #${characterId} not found`);
    }
    if (String(char.userId) !== String(userId)) {
      throw new ForbiddenException(
        'You do not have permission to delete this character',
      );
    }

    await this.characterRepo.delete({ id: characterId });

    // Decrement charactersCount on profile
    const profile = await this.profileRepo.findOne({ where: { userId } });
    if (profile && profile.charactersCount > 0) {
      await this.profileRepo.decrement({ userId }, 'charactersCount', 1);
    }
  }

  // =================== MAPPERS ===================

  private toSummaryDto(p: CosplayerProfileEntity): CosplayerSummaryResDto {
    return {
      id: p.id,
      userId: p.userId,
      slug: p.slug,
      displayName: p.displayName,
      handle: p.handle,
      roleBadge: p.roleBadge ?? 'Cosplayer',
      tagline: p.tagline ?? null,
      avatarUrl: p.avatarUrl ?? null,
      coverUrl: p.coverUrl ?? null,
      locationLabel: p.locationLabel ?? null,
      workArea: p.workArea ?? null,
      isVerified: p.isVerified,
      isAcceptingBooking: p.isAcceptingBooking,
      isCraftingCreator: p.isCraftingCreator,
      followersCount: Number(p.followersCount || 0),
      totalLikesCount: Number(p.totalLikesCount || 0),
      albumsCount: Number(p.albumsCount || 0),
      charactersCount: Number(p.charactersCount || 0),
      rankingScore: Number(p.rankingScore || 0),
      specialties: p.specialties || [],
      createdAt: p.createdAt,
    };
  }

  private toDetailDto(
    p: CosplayerProfileEntity,
    services: CosplayerServiceEntity[],
    characters: CosplayerCharacterEntity[],
  ): CosplayerDetailResDto {
    return {
      ...this.toSummaryDto(p),
      bio: p.bio ?? null,
      artisticBio: p.artisticBio ?? null,
      cityId: p.cityId ?? null,
      countryId: p.countryId ?? null,
      heightCm: p.heightCm ?? null,
      heightLabel: p.heightLabel ?? null,
      experienceYearsNum: p.experienceYearsNum ?? null,
      experienceLabel: p.experienceLabel ?? null,
      skills: p.skills || [],
      awardsBadges: p.awardsBadges || [],
      contactEmail: p.contactEmail ?? null,
      contactPhone: p.contactPhone ?? null,
      facebookUrl: p.facebookUrl ?? null,
      instagramUrl: p.instagramUrl ?? null,
      tiktokUrl: p.tiktokUrl ?? null,
      twitterUrl: p.twitterUrl ?? null,
      followingCount: Number(p.followingCount || 0),
      collectionsCount: Number(p.collectionsCount || 0),
      services: services.map((s) => this.toServiceDto(s)),
      characters: characters.map((c) => this.toCharacterDto(c)),
      updatedAt: p.updatedAt,
    };
  }

  private toServiceDto(s: CosplayerServiceEntity): CosplayerServiceResDto {
    return {
      id: s.id,
      userId: s.userId,
      title: s.title,
      description: s.description ?? null,
      badgeLabel: s.badgeLabel,
      sortOrder: s.sortOrder,
      isActive: s.isActive,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    };
  }

  private toCharacterDto(
    c: CosplayerCharacterEntity,
  ): CosplayerCharacterResDto {
    return {
      id: c.id,
      userId: c.userId,
      characterName: c.characterName,
      seriesName: c.seriesName,
      characterTagId: c.characterTagId ?? null,
      copyrightTagId: c.copyrightTagId ?? null,
      coverFileId: c.coverFileId ?? null,
      coverImageUrl: c.coverImageUrl,
      albumsCount: c.albumsCount,
      photosCount: c.photosCount,
      sortOrder: c.sortOrder,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    };
  }
}
