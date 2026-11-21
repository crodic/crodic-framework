import {
  AllowedFilter,
  AllowedSort,
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
  Optional,
} from '@nestjs/common';
import { FilesystemService } from '../../../filesystem/filesystem.service';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Brackets, DataSource, Repository } from 'typeorm';
import { UserEntity } from '../../user/entities/user.entity';
import { CosplayerCharacterEntity } from '../entities/cosplayer-character.entity';
import { CosplayerProfileEntity } from '../entities/cosplayer-profile.entity';
import {
  CreateCosplayerCharacterReqDto,
  UpdateCosplayerCharacterReqDto,
  UpdateCosplayerProfileReqDto,
} from '../dto/cosplayer-req.dto';
import {
  CosplayerCharacterResDto,
  CosplayerDetailResDto,
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
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(CosplayerProfileEntity)
    private readonly profileRepo: Repository<CosplayerProfileEntity>,
    @InjectRepository(CosplayerCharacterEntity)
    private readonly characterRepo: Repository<CosplayerCharacterEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @Optional()
    private readonly filesystemService?: FilesystemService,
  ) {}

  /**
   * Browse cosplayers directory with QueryBuilder support.
   */
  async findAll(
    query: QueryParams,
  ): Promise<Paginated<CosplayerSummaryResDto>> {
    const baseQb = this.profileRepo
      .createQueryBuilder('profile')
      .innerJoinAndSelect('profile.user', 'user', 'user.deletedAt IS NULL')
      .where('profile.deletedAt IS NULL')
      .andWhere('user.deletedAt IS NULL');

    const paginated = await QueryBuilder.for(baseQb, query)
      .allowedFilters([
        AllowedFilter.exact('cityId'),
        AllowedFilter.exact('countryId'),
        AllowedFilter.exact('isVerified'),
        AllowedFilter.exact('isCraftingCreator'),
        AllowedFilter.partial('displayName'),
        AllowedFilter.partial('slug'),
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
                .orWhere('LOWER(profile.slug) LIKE :sTerm', {
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
        AllowedSort.field('followersCount', 'user.followersCount'),
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
   * Get smart suggested cosplayers excluding self and followed creators.
   */
  async getSuggested(
    currentUserId?: AutoIncrementID,
    limit: number = 4,
  ): Promise<CosplayerSummaryResDto[]> {
    const qb = this.profileRepo
      .createQueryBuilder('profile')
      .innerJoinAndSelect('profile.user', 'user', 'user.deletedAt IS NULL')
      .where('profile.deletedAt IS NULL')
      .andWhere('user.deletedAt IS NULL');

    if (currentUserId) {
      qb.andWhere('profile.userId != :currentUserId', { currentUserId });
      qb.andWhere(
        'NOT EXISTS (SELECT 1 FROM user_follows follow WHERE follow.follower_id = :currentUserId AND follow.following_id = profile.userId)',
      );
    }

    qb.orderBy('profile.isVerified', 'DESC')
      .addOrderBy('profile.rankingScore', 'DESC')
      .addOrderBy('profile.totalLikesCount', 'DESC')
      .addOrderBy('profile.albumsCount', 'DESC')
      .take(limit);

    const profiles = await qb.getMany();
    return profiles.map((p) => this.toSummaryDto(p));
  }

  /**
   * Find full public cosplayer profile by slug or handle.
   */
  async findBySlugOrHandle(
    slugOrHandle: string,
  ): Promise<CosplayerDetailResDto> {
    const cleaned = slugOrHandle.trim().replace(/^@/, '').toLowerCase();

    const profile = await this.profileRepo.findOne({
      where: { slug: cleaned },
      relations: ['user'],
    });

    if (
      !profile ||
      profile.deletedAt ||
      profile.user === null ||
      profile.user?.deletedAt
    ) {
      throw new NotFoundException(`Cosplayer "${slugOrHandle}" not found`);
    }

    if (
      (!profile.avatarUrl ||
        profile.avatarUrl.includes('googleusercontent.com')) &&
      profile.user?.avatar
    ) {
      profile.avatarUrl = profile.user.avatar;
      await this.profileRepo.save(profile);
    }

    const characters = await this.characterRepo.find({
      where: { userId: profile.userId },
      order: { sortOrder: 'ASC', id: 'ASC' },
    });

    return this.toDetailDto(profile, characters);
  }

  /**
   * Get authenticated user's cosplayer profile.
   */
  async getMyProfile(userId: AutoIncrementID): Promise<CosplayerDetailResDto> {
    let profile = await this.profileRepo.findOne({
      where: { userId },
      relations: ['user'],
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

      profile = this.profileRepo.create({
        userId,
        slug: candidateSlug,
        displayName: baseName,
        roleBadge: 'Cosplayer',
        avatarUrl: user.avatar || null,
        skills: [],
        specialties: [],
        awardsBadges: [],
        totalLikesCount: 0,
        albumsCount: 0,
        charactersCount: 0,
        rankingScore: 0,
      });

      profile = await this.profileRepo.save(profile);
      profile.user = user;
    } else if (
      (!profile.avatarUrl ||
        profile.avatarUrl.includes('googleusercontent.com')) &&
      profile.user?.avatar
    ) {
      profile.avatarUrl = profile.user.avatar;
      await this.profileRepo.save(profile);
    }

    const characters = await this.characterRepo.find({
      where: { userId },
      order: { sortOrder: 'ASC', id: 'ASC' },
    });

    return this.toDetailDto(profile, characters);
  }

  /**
   * Update cosplayer profile.
   */
  async updateProfile(
    userId: AutoIncrementID,
    dto: UpdateCosplayerProfileReqDto,
  ): Promise<CosplayerDetailResDto> {
    let profile = await this.profileRepo.findOne({
      where: { userId },
      relations: ['user'],
    });

    if (!profile) {
      await this.getMyProfile(userId);
      profile = await this.profileRepo.findOneOrFail({
        where: { userId },
        relations: ['user'],
      });
    }

    if (dto.handle) {
      const rawHandle = dto.handle.replace(/^@+/, '').trim();
      const cleanSlug = slugify(rawHandle) || rawHandle.toLowerCase();
      if (cleanSlug && cleanSlug !== profile.slug) {
        const existing = await this.profileRepo.findOne({
          where: { slug: cleanSlug },
        });
        if (existing && String(existing.userId) !== String(userId)) {
          throw new ConflictException(
            `Handle "@${cleanSlug}" is already taken`,
          );
        }
        profile.slug = cleanSlug;
      }
      if (cleanSlug && cleanSlug !== profile.user?.username) {
        await this.userRepo.update({ id: userId }, { username: cleanSlug });
        if (profile.user) {
          profile.user.username = cleanSlug;
        }
      }
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
    if (dto.experienceYearsNum !== undefined)
      profile.experienceYearsNum = dto.experienceYearsNum;
    if (dto.skills !== undefined) profile.skills = dto.skills;
    if (dto.specialties !== undefined) profile.specialties = dto.specialties;
    if (dto.awardsBadges !== undefined) profile.awardsBadges = dto.awardsBadges;
    if (dto.contactEmail !== undefined) profile.contactEmail = dto.contactEmail;
    if (dto.contactPhone !== undefined) profile.contactPhone = dto.contactPhone;
    if (dto.facebookUrl !== undefined) profile.facebookUrl = dto.facebookUrl;
    if (dto.instagramUrl !== undefined) profile.instagramUrl = dto.instagramUrl;
    if (dto.tiktokUrl !== undefined) profile.tiktokUrl = dto.tiktokUrl;
    if (dto.twitterUrl !== undefined) profile.twitterUrl = dto.twitterUrl;
    if (dto.isCraftingCreator !== undefined)
      profile.isCraftingCreator = dto.isCraftingCreator;

    profile = await this.profileRepo.save(profile);

    const characters = await this.characterRepo.find({
      where: { userId },
      order: { sortOrder: 'ASC', id: 'ASC' },
    });

    return this.toDetailDto(profile, characters);
  }

  /**
   * Mark current user as requesting Admin approval to become a Cosplayer.
   */
  async requestCosplayerRole(
    userId: AutoIncrementID,
  ): Promise<CosplayerDetailResDto> {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['cosplayerProfile'],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.cosplayerProfile?.isVerified) {
      user.notifications = {
        ...(user.notifications || {}),
        cosplayerRoleRequested: true,
      };
      await this.userRepo.save(user);
    }

    return this.getMyProfile(userId);
  }

  /**
   * Upload and persist profile cover image.
   */
  async uploadCover(
    userId: AutoIncrementID,
    file: Express.Multer.File,
  ): Promise<{ coverUrl: string }> {
    if (!this.filesystemService) {
      throw new BadRequestException('Filesystem service not available');
    }

    const ext = file.originalname.includes('.')
      ? file.originalname.substring(file.originalname.lastIndexOf('.'))
      : '.jpg';
    const filename = `covers/cover-user-${userId}-${Date.now()}${ext}`;

    await this.filesystemService
      .disk()
      .put(filename, file.buffer, { mimeType: file.mimetype });

    const coverUrl = this.filesystemService.disk().url(filename);

    let profile = await this.profileRepo.findOne({ where: { userId } });
    if (!profile) {
      await this.getMyProfile(userId);
      profile = await this.profileRepo.findOneOrFail({ where: { userId } });
    }

    profile.coverUrl = coverUrl;
    await this.profileRepo.save(profile);

    return { coverUrl };
  }

  /**
   * Upload and persist profile avatar image.
   */
  async uploadAvatar(
    userId: AutoIncrementID,
    file: Express.Multer.File,
  ): Promise<{ avatarUrl: string }> {
    if (!this.filesystemService) {
      throw new BadRequestException('Filesystem service not available');
    }

    const ext = file.originalname.includes('.')
      ? file.originalname.substring(file.originalname.lastIndexOf('.'))
      : '.jpg';
    const filename = `avatars/avatar-user-${userId}-${Date.now()}${ext}`;

    await this.filesystemService
      .disk()
      .put(filename, file.buffer, { mimeType: file.mimetype });

    const avatarUrl = this.filesystemService.disk().url(filename);

    let profile = await this.profileRepo.findOne({ where: { userId } });
    if (!profile) {
      await this.getMyProfile(userId);
      profile = await this.profileRepo.findOneOrFail({ where: { userId } });
    }

    profile.avatarUrl = avatarUrl;
    await this.profileRepo.save(profile);

    // Also sync to UserEntity avatar
    await this.userRepo.update({ id: userId }, { avatar: avatarUrl });

    return { avatarUrl };
  }

  /**
   * General media upload for authenticated users (e.g. photosets, artwork).
   */
  async uploadMedia(
    userId: AutoIncrementID,
    file: Express.Multer.File,
    folder = 'posts',
  ): Promise<{
    url: string;
    originalName: string;
    size: number;
    mimeType: string;
  }> {
    if (!this.filesystemService) {
      throw new BadRequestException('Filesystem service not available');
    }

    const cleanFolder = (folder || 'posts').replace(/[^a-z0-9_-]/gi, '');
    const defaultExt = file.mimetype.startsWith('video/webm')
      ? '.webm'
      : file.mimetype === 'video/quicktime'
        ? '.mov'
        : file.mimetype.startsWith('video/')
          ? '.mp4'
          : '.jpg';
    const ext = file.originalname.includes('.')
      ? file.originalname.substring(file.originalname.lastIndexOf('.'))
      : defaultExt;
    const filename = `${cleanFolder}/user-${userId}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}${ext}`;

    await this.filesystemService
      .disk()
      .put(filename, file.buffer, { mimeType: file.mimetype });

    const url = this.filesystemService.disk().url(filename);

    return {
      url,
      originalName: file.originalname,
      size: file.size,
      mimeType: file.mimetype,
    };
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
    return await this.dataSource.transaction(async (em) => {
      const character = em.create(CosplayerCharacterEntity, {
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

      const saved = await em.save(CosplayerCharacterEntity, character);

      // Update charactersCount on profile atomically
      await em.increment(
        CosplayerProfileEntity,
        { userId },
        'charactersCount',
        1,
      );

      return this.toCharacterDto(saved);
    });
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

    await this.dataSource.transaction(async (em) => {
      await em.delete(CosplayerCharacterEntity, { id: characterId });

      // Decrement charactersCount on profile atomically
      const profile = await em.findOne(CosplayerProfileEntity, {
        where: { userId },
      });
      if (profile && profile.charactersCount > 0) {
        await em.decrement(
          CosplayerProfileEntity,
          { userId },
          'charactersCount',
          1,
        );
      }
    });
  }

  // =================== MAPPERS ===================

  private toSummaryDto(p: CosplayerProfileEntity): CosplayerSummaryResDto {
    return {
      id: p.id,
      userId: p.userId,
      slug: p.slug,
      displayName: p.displayName,
      handle: `@${p.slug}`,
      roleBadge: p.roleBadge ?? 'Cosplayer',
      tagline: p.tagline ?? null,
      avatarUrl: p.avatarUrl || p.user?.avatar || null,
      coverUrl: p.coverUrl ?? null,
      locationLabel: p.locationLabel ?? null,
      workArea: p.workArea ?? null,
      isVerified: p.isVerified,
      isCraftingCreator: p.isCraftingCreator,
      followersCount: Number(p.user?.followersCount ?? 0),
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
    characters: CosplayerCharacterEntity[],
  ): CosplayerDetailResDto {
    const heightLabel = p.heightCm ? `${p.heightCm} cm` : null;
    const experienceLabel = p.experienceYearsNum
      ? `${p.experienceYearsNum}+ years`
      : null;

    return {
      ...this.toSummaryDto(p),
      bio: p.bio ?? null,
      artisticBio: p.artisticBio ?? null,
      cityId: p.cityId ?? null,
      countryId: p.countryId ?? null,
      heightCm: p.heightCm ?? null,
      heightLabel,
      experienceYearsNum: p.experienceYearsNum ?? null,
      experienceLabel,
      stats: {
        heightCm: p.heightCm ?? null,
        heightLabel,
        experienceYearsNum: p.experienceYearsNum ?? null,
        experienceLabel,
      },
      skills: p.skills || [],
      awardsBadges: p.awardsBadges || [],
      contactEmail: p.contactEmail ?? null,
      contactPhone: p.contactPhone ?? null,
      facebookUrl: p.facebookUrl ?? null,
      instagramUrl: p.instagramUrl ?? null,
      tiktokUrl: p.tiktokUrl ?? null,
      twitterUrl: p.twitterUrl ?? null,
      socialLinks: {
        facebookUrl: p.facebookUrl ?? null,
        instagramUrl: p.instagramUrl ?? null,
        tiktokUrl: p.tiktokUrl ?? null,
        twitterUrl: p.twitterUrl ?? null,
      },
      followingCount: Number(p.user?.followingCount ?? 0),
      collectionsCount: Number(p.user?.collectionsCount ?? 0),
      characters: characters.map((c) => this.toCharacterDto(c)),
      cosplayerRequestPending: Boolean(
        p.user?.notifications?.cosplayerRoleRequested && !p.isVerified,
      ),
      updatedAt: p.updatedAt,
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
