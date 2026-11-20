import { AutoIncrementID } from '../../common/types/common.type';
import { EAccountProvider } from '../../common/constants/entity.enum';
import { ErrorCode } from '../../common/constants/error-code.constant';
import { ValidationException } from '../../common/exceptions/validation.exception';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import assert from 'assert';
import { plainToInstance } from 'class-transformer';
import { ClsService } from 'nestjs-cls';
import {
  FilterOperator,
  paginate,
  Paginated,
  PaginateQuery,
} from 'nestjs-paginate';
import { DataSource, Repository } from 'typeorm';
import { UserAccountRecoveryService } from '../auth/services/user-account-recovery.service';
import { UserSessionEntity } from '../auth/entities/user-session.entity';
import { CreateUserReqDto } from './dto/create-user.req.dto';
import { UpdateUserReqDto } from './dto/update-user.req.dto';
import { UserResDto } from './dto/user.res.dto';
import { UserAccountEntity } from './entities/user-account.entity';
import { UserEntity } from './entities/user.entity';
import { EUserRole } from './constants/user.constant';
import { CosplayerProfileEntity } from '../cosplayer/entities/cosplayer-profile.entity';
import { PostEntity } from '../post/entities/post.entity';
import { CollectionEntity } from '../collection/entities/collection.entity';
import { PostCommentEntity } from '../post/entities/post-comment.entity';
import { NotificationEntity } from '../notification/entities/notification.entity';
import {
  ENotificationCategory,
  ENotificationType,
} from '../notification/constants/notification.constant';
import { AdminCosplayerProfileInputDto } from './dto/create-user.req.dto';
import { EntityManager } from 'typeorm';

function normalizeUserSlug(text: string): string {
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
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(UserAccountEntity)
    private readonly userAccountRepository: Repository<UserAccountEntity>,
    @InjectRepository(UserSessionEntity)
    private readonly userSessionRepository: Repository<UserSessionEntity>,
    private cls: ClsService,
    private readonly userAccountRecoveryService: UserAccountRecoveryService,
    private readonly dataSource: DataSource,
  ) {}

  async findAllUser(query: PaginateQuery): Promise<Paginated<UserResDto>> {
    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .withDeleted();

    const isTrashedOnly =
      query.filter?.trashed === '$eq:only' ||
      query.filter?.deleted === '$eq:true' ||
      query.filter?.trashed === 'only' ||
      query.filter?.deleted === 'true' ||
      query.filter?.status === 'deleted' ||
      query.filter?.status === '$eq:deleted';

    const isActiveOnly =
      query.filter?.status === 'active' ||
      query.filter?.status === '$eq:active' ||
      query.filter?.trashed === 'none' ||
      query.filter?.trashed === '$eq:none';

    if (isTrashedOnly) {
      queryBuilder.andWhere('user.deleted_at IS NOT NULL');
    } else if (isActiveOnly) {
      queryBuilder.andWhere('user.deleted_at IS NULL');
    }

    const result = await paginate(query, queryBuilder, {
      sortableColumns: ['id', 'email', 'createdAt', 'updatedAt', 'role'],
      searchableColumns: ['email', 'id', 'fullName', 'username'],
      defaultSortBy: [['id', 'DESC']],
      relations: ['cosplayerProfile'],
      filterableColumns: {
        createdAt: [FilterOperator.GTE, FilterOperator.LTE, FilterOperator.BTW],
        fullName: [FilterOperator.ILIKE],
        email: [FilterOperator.ILIKE],
        username: [FilterOperator.ILIKE],
        role: [FilterOperator.EQ, FilterOperator.IN],
        id: [FilterOperator.EQ],
      },
    });

    return {
      ...result,
      data: plainToInstance(UserResDto, result.data, {
        excludeExtraneousValues: true,
      }),
    } as Paginated<UserResDto>;
  }

  async create(dto: CreateUserReqDto): Promise<UserResDto> {
    const { email, password } = dto;
    const { cosplayerProfile: _cosplayerProfile, ...userEntityInput } = dto;

    const user = await this.userRepository.findOne({
      where: {
        email,
      },
    });

    if (user) {
      throw new ValidationException(ErrorCode.E001);
    }

    if (dto.password !== dto.confirmPassword) {
      throw new ValidationException(ErrorCode.E003);
    }

    const cleanUsername = dto.username
      ? dto.username.replace(/^@+/, '').trim().toLowerCase()
      : undefined;

    if (cleanUsername) {
      const existingUsername = await this.userRepository.findOne({
        where: { username: cleanUsername },
      });
      if (existingUsername) {
        throw new ConflictException(
          `Username "${cleanUsername}" is already taken`,
        );
      }
    }

    const newUser = new UserEntity({
      ...userEntityInput,
      email,
      ...(dto.role !== undefined ? { role: dto.role } : {}),
      ...(cleanUsername ? { username: cleanUsername } : {}),
    });

    const savedUser = await this.dataSource.transaction(async (manager) => {
      const userRepo = manager.getRepository(UserEntity);
      const accountRepo = manager.getRepository(UserAccountEntity);

      const saved = await userRepo.save(newUser);

      if (password) {
        await accountRepo.delete({
          provider: EAccountProvider.LOCAL,
          providerAccountId: saved.email,
        });

        await accountRepo.save(
          new UserAccountEntity({
            userId: saved.id,
            provider: EAccountProvider.LOCAL,
            providerAccountId: saved.email,
            password,
            email: saved.email,
            displayName: `${saved.firstName} ${saved.lastName ?? ''}`.trim(),
          }),
        );
      }

      if (dto.role === EUserRole.COSPLAYER || dto.cosplayerProfile) {
        saved.cosplayerProfile = await this.upsertCosplayerProfile(
          manager,
          saved,
          dto.cosplayerProfile,
          cleanUsername,
        );
      }

      return saved;
    });

    await this.userAccountRecoveryService.sendVerificationEmail(savedUser);

    return plainToInstance(UserResDto, savedUser);
  }

  async findOne(id: AutoIncrementID): Promise<UserResDto> {
    assert(id, 'id is required');
    const user = await this.userRepository.findOneOrFail({
      where: { id },
      relations: ['cosplayerProfile'],
      withDeleted: true,
    });

    return user.toDto(UserResDto);
  }

  async update(id: AutoIncrementID, updateUserDto: UpdateUserReqDto) {
    const user = await this.userRepository.findOneByOrFail({ id });

    if (updateUserDto.firstName !== undefined) {
      user.firstName = updateUserDto.firstName;
    }
    if (updateUserDto.lastName !== undefined) {
      user.lastName = updateUserDto.lastName;
    }
    if (updateUserDto.role !== undefined) {
      user.role = updateUserDto.role;
      if (updateUserDto.role === EUserRole.COSPLAYER) {
        user.notifications = {
          ...(user.notifications || {}),
          cosplayerRoleRequested: false,
        };
      }
    }

    let cleanUsername: string | undefined;
    if (updateUserDto.username !== undefined) {
      cleanUsername = updateUserDto.username
        .replace(/^@+/, '')
        .trim()
        .toLowerCase();
      if (cleanUsername && cleanUsername !== user.username) {
        const existingUsername = await this.userRepository.findOne({
          where: { username: cleanUsername },
        });
        if (existingUsername && String(existingUsername.id) !== String(id)) {
          throw new ConflictException(
            `Username "${cleanUsername}" is already taken`,
          );
        }
      }
      user.username = cleanUsername || null;
    }

    await this.userRepository.save(user);

    if (
      updateUserDto.cosplayerProfile !== undefined ||
      updateUserDto.role === EUserRole.COSPLAYER
    ) {
      const profile = await this.upsertCosplayerProfile(
        this.dataSource,
        user,
        updateUserDto.cosplayerProfile,
        cleanUsername,
      );
      user.cosplayerProfile = profile;
    } else if (cleanUsername) {
      await this.dataSource
        .getRepository('cosplayer_profiles')
        .update({ userId: id }, { slug: cleanUsername });
    }

    return user.toDto(UserResDto);
  }

  async toggleVerify(id: AutoIncrementID): Promise<UserResDto> {
    const user = await this.userRepository.findOneOrFail({
      where: { id },
      relations: ['cosplayerProfile'],
    });

    user.verifiedAt = user.verifiedAt ? null : new Date();
    const saved = await this.userRepository.save(user);
    return saved.toDto(UserResDto);
  }

  async toggleCosplayerVerify(id: AutoIncrementID): Promise<UserResDto> {
    const user = await this.userRepository.findOneOrFail({
      where: { id },
      relations: ['cosplayerProfile'],
    });

    if (!user.cosplayerProfile) {
      throw new NotFoundException('User does not have a cosplayer profile');
    }

    user.cosplayerProfile.isVerified = !user.cosplayerProfile.isVerified;
    await this.dataSource
      .getRepository(CosplayerProfileEntity)
      .save(user.cosplayerProfile);

    return user.toDto(UserResDto);
  }

  async handleCosplayerRequest(
    id: AutoIncrementID,
    approved: boolean,
  ): Promise<UserResDto> {
    const user = await this.userRepository.findOneOrFail({
      where: { id },
      relations: ['cosplayerProfile'],
    });

    user.notifications = {
      ...(user.notifications || {}),
      cosplayerRoleRequested: false,
    };

    if (approved) {
      user.role = EUserRole.COSPLAYER;
    }

    await this.dataSource.transaction(async (manager) => {
      await manager.getRepository(UserEntity).save(user);

      if (approved) {
        await this.upsertCosplayerProfile(
          manager,
          user,
          undefined,
          user.username || undefined,
        );
      }

      const notificationRepo = manager.getRepository(NotificationEntity);
      await notificationRepo.save(
        notificationRepo.create({
          recipientUserId: user.id,
          category: ENotificationCategory.SYSTEM,
          type: approved
            ? ENotificationType.BADGE_AWARDED
            : ENotificationType.SECURITY,
          title: approved
            ? 'Yêu cầu trở thành Cosplayer đã được duyệt'
            : 'Yêu cầu trở thành Cosplayer chưa được duyệt',
          description: approved
            ? 'Chúc mừng! Tài khoản của bạn đã được Admin phê duyệt trở thành Cosplayer chính thức.'
            : 'Yêu cầu trở thành Cosplayer của bạn chưa được phê duyệt. Vui lòng hoàn thiện thêm hồ sơ cá nhân và gửi lại yêu cầu.',
          actionUrl: '/profile',
        }),
      );
    });

    return this.findOne(id);
  }

  private async upsertCosplayerProfile(
    managerOrDataSource: EntityManager | DataSource,
    user: UserEntity,
    profileInput?: AdminCosplayerProfileInputDto,
    explicitSlug?: string,
  ): Promise<CosplayerProfileEntity> {
    const profileRepo = managerOrDataSource.getRepository(
      CosplayerProfileEntity,
    );
    let profile = await profileRepo.findOne({ where: { userId: user.id } });

    const baseDisplayName =
      profileInput?.displayName?.trim() ||
      profile?.displayName ||
      user.fullName ||
      `${user.firstName} ${user.lastName ?? ''}`.trim() ||
      user.username ||
      `User ${user.id}`;

    const requestedSlug = profileInput?.slug
      ? normalizeUserSlug(profileInput.slug)
      : explicitSlug
        ? normalizeUserSlug(explicitSlug)
        : undefined;

    let finalSlug =
      requestedSlug ||
      profile?.slug ||
      normalizeUserSlug(baseDisplayName) ||
      `cosplayer-${user.id}`;

    const slugConflict = await profileRepo.findOne({
      where: { slug: finalSlug },
    });
    if (slugConflict && String(slugConflict.userId) !== String(user.id)) {
      if (profileInput?.slug) {
        throw new ConflictException(`Slug "${finalSlug}" is already taken`);
      }
      finalSlug = `${finalSlug}-${user.id}`;
    }

    if (!profile) {
      profile = profileRepo.create({
        userId: user.id,
        slug: finalSlug,
        displayName: baseDisplayName,
        roleBadge: profileInput?.roleBadge ?? 'Cosplayer',
        avatarUrl: profileInput?.avatarUrl ?? user.avatar ?? null,
        skills: profileInput?.skills ?? [],
        specialties: profileInput?.specialties ?? [],
        awardsBadges: profileInput?.awardsBadges ?? [],
        totalLikesCount: 0,
        albumsCount: 0,
        charactersCount: 0,
        rankingScore: 0,
        isVerified: profileInput?.isVerified ?? false,
        isCraftingCreator: profileInput?.isCraftingCreator ?? false,
      });
    } else {
      profile.slug = finalSlug;
      if (profileInput?.displayName !== undefined) {
        profile.displayName = baseDisplayName;
      }
    }

    if (profileInput) {
      if (profileInput.roleBadge !== undefined)
        profile.roleBadge = profileInput.roleBadge;
      if (profileInput.tagline !== undefined)
        profile.tagline = profileInput.tagline;
      if (profileInput.bio !== undefined) profile.bio = profileInput.bio;
      if (profileInput.artisticBio !== undefined)
        profile.artisticBio = profileInput.artisticBio;
      if (profileInput.avatarUrl !== undefined)
        profile.avatarUrl = profileInput.avatarUrl;
      if (profileInput.coverUrl !== undefined)
        profile.coverUrl = profileInput.coverUrl;
      if (profileInput.locationLabel !== undefined)
        profile.locationLabel = profileInput.locationLabel;
      if (profileInput.workArea !== undefined)
        profile.workArea = profileInput.workArea;
      if (profileInput.heightCm !== undefined)
        profile.heightCm = profileInput.heightCm;
      if (profileInput.experienceYearsNum !== undefined)
        profile.experienceYearsNum = profileInput.experienceYearsNum;
      if (profileInput.skills !== undefined)
        profile.skills = profileInput.skills;
      if (profileInput.specialties !== undefined)
        profile.specialties = profileInput.specialties;
      if (profileInput.awardsBadges !== undefined)
        profile.awardsBadges = profileInput.awardsBadges;
      if (profileInput.contactEmail !== undefined)
        profile.contactEmail = profileInput.contactEmail;
      if (profileInput.contactPhone !== undefined)
        profile.contactPhone = profileInput.contactPhone;
      if (profileInput.facebookUrl !== undefined)
        profile.facebookUrl = profileInput.facebookUrl;
      if (profileInput.instagramUrl !== undefined)
        profile.instagramUrl = profileInput.instagramUrl;
      if (profileInput.tiktokUrl !== undefined)
        profile.tiktokUrl = profileInput.tiktokUrl;
      if (profileInput.twitterUrl !== undefined)
        profile.twitterUrl = profileInput.twitterUrl;
      if (profileInput.isVerified !== undefined)
        profile.isVerified = profileInput.isVerified;
      if (profileInput.isCraftingCreator !== undefined)
        profile.isCraftingCreator = profileInput.isCraftingCreator;
    }

    return profileRepo.save(profile);
  }

  async remove(id: AutoIncrementID) {
    const user = await this.userRepository.findOneByOrFail({ id });

    await this.dataSource.transaction(async (manager) => {
      await manager.getRepository(UserAccountEntity).delete({ userId: id });
      await manager.getRepository(UserSessionEntity).delete({ userId: id });
      await manager
        .getRepository(CosplayerProfileEntity)
        .softDelete({ userId: id });
      await manager.getRepository(PostEntity).softDelete({ authorId: id });
      await manager.getRepository(CollectionEntity).softDelete({ userId: id });
      await manager
        .getRepository(PostCommentEntity)
        .softDelete({ authorId: id });
      await manager.getRepository(UserEntity).softRemove(user);
    });
  }

  async restore(id: AutoIncrementID): Promise<UserResDto> {
    const user = await this.userRepository.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.deletedAt) {
      throw new BadRequestException('User is not deleted');
    }

    // Check if another active user has taken this email
    const activeUser = await this.userRepository.findOne({
      where: { email: user.email },
    });

    if (activeUser) {
      throw new ConflictException(
        'An active user already exists with this email address',
      );
    }

    await this.dataSource.transaction(async (manager) => {
      await manager.getRepository(UserEntity).restore(id);
      await manager
        .getRepository(CosplayerProfileEntity)
        .restore({ userId: id });
      await manager.getRepository(PostEntity).restore({ authorId: id });
      await manager.getRepository(CollectionEntity).restore({ userId: id });
      await manager.getRepository(PostCommentEntity).restore({ authorId: id });
    });

    user.deletedAt = null;

    // Send password setup / reactivation email
    await this.userAccountRecoveryService.sendVerificationEmail(user, {
      skipRateLimit: true,
    });

    return plainToInstance(UserResDto, user);
  }
}
