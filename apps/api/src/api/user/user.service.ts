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
      sortableColumns: ['id', 'email', 'createdAt', 'updatedAt'],
      searchableColumns: ['email', 'id', 'fullName'],
      defaultSortBy: [['id', 'DESC']],
      relations: [],
      filterableColumns: {
        createdAt: [FilterOperator.GTE, FilterOperator.LTE, FilterOperator.BTW],
        fullName: [FilterOperator.ILIKE],
        email: [FilterOperator.ILIKE],
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

    const newUser = new UserEntity({
      ...dto,
      email,
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

      return saved;
    });

    await this.userAccountRecoveryService.sendVerificationEmail(savedUser);

    return plainToInstance(UserResDto, savedUser);
  }

  async findOne(id: AutoIncrementID): Promise<UserResDto> {
    assert(id, 'id is required');
    const user = await this.userRepository.findOneOrFail({
      where: { id },
      withDeleted: true,
    });

    return user.toDto(UserResDto);
  }

  async update(id: AutoIncrementID, updateUserDto: UpdateUserReqDto) {
    const user = await this.userRepository.findOneByOrFail({ id });

    user.firstName = updateUserDto.firstName;
    user.lastName = updateUserDto.lastName;

    await this.userRepository.save(user);
  }

  async remove(id: AutoIncrementID) {
    const user = await this.userRepository.findOneByOrFail({ id });

    await this.dataSource.transaction(async (manager) => {
      await manager.getRepository(UserAccountEntity).delete({ userId: id });
      await manager.getRepository(UserSessionEntity).delete({ userId: id });
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
    });

    user.deletedAt = null;

    // Send password setup / reactivation email
    await this.userAccountRecoveryService.sendVerificationEmail(user, {
      skipRateLimit: true,
    });

    return plainToInstance(UserResDto, user);
  }
}
