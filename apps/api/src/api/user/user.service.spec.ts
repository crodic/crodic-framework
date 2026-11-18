import { ErrorCode } from '../../common/constants/error-code.constant';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ClsService } from 'nestjs-cls';
import { DataSource, Repository } from 'typeorm';
import { UserAccountRecoveryService } from '../auth/services/user-account-recovery.service';
import { UserSessionEntity } from '../auth/entities/user-session.entity';
import { UserAccountEntity } from './entities/user-account.entity';
import { UserEntity } from './entities/user.entity';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let userRepositoryValue: Partial<
    Record<keyof Repository<UserEntity>, jest.Mock>
  >;
  let userAccountRepositoryValue: Partial<
    Record<keyof Repository<UserAccountEntity>, jest.Mock>
  >;
  let userSessionRepositoryValue: Partial<
    Record<keyof Repository<UserSessionEntity>, jest.Mock>
  >;
  let dataSourceMock: { transaction: jest.Mock; getRepository: jest.Mock };
  let userAccountRecoveryServiceMock: { sendVerificationEmail: jest.Mock };

  beforeAll(async () => {
    userRepositoryValue = {
      findOne: jest.fn(),
      findOneOrFail: jest.fn(),
      findOneByOrFail: jest.fn(),
      save: jest.fn(),
      softRemove: jest.fn(),
      restore: jest.fn(),
    };
    userAccountRepositoryValue = {
      findOne: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };
    userSessionRepositoryValue = {
      delete: jest.fn(),
    };
    dataSourceMock = {
      getRepository: jest.fn().mockReturnValue({
        save: jest.fn().mockResolvedValue({}),
        update: jest.fn().mockResolvedValue({ affected: 1 }),
      }),
      transaction: jest.fn().mockImplementation(async (cb) => {
        const managerMock = {
          getRepository: jest.fn().mockImplementation((entity) => {
            if (entity === UserEntity) return userRepositoryValue;
            if (entity === UserAccountEntity) return userAccountRepositoryValue;
            if (entity === UserSessionEntity) return userSessionRepositoryValue;
            return {};
          }),
        };
        return cb(managerMock);
      }),
    };
    userAccountRecoveryServiceMock = {
      sendVerificationEmail: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: userRepositoryValue,
        },
        {
          provide: getRepositoryToken(UserAccountEntity),
          useValue: userAccountRepositoryValue,
        },
        {
          provide: getRepositoryToken(UserSessionEntity),
          useValue: userSessionRepositoryValue,
        },
        {
          provide: DataSource,
          useValue: dataSourceMock,
        },
        {
          provide: ClsService,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
          },
        },
        {
          provide: UserAccountRecoveryService,
          useValue: userAccountRecoveryServiceMock,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const dto = {
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@example.com',
      password: 'secret1',
      confirmPassword: 'secret1',
    };

    it('creates a user when email is unique and passwords match', async () => {
      const savedUser = new UserEntity({
        id: '1' as any,
        ...dto,
      });

      userRepositoryValue.findOne.mockResolvedValue(null);
      userRepositoryValue.save.mockResolvedValue(savedUser);

      const result = await service.create(dto);

      expect(userRepositoryValue.findOne).toHaveBeenCalledWith({
        where: { email: dto.email },
      });
      expect(userRepositoryValue.save).toHaveBeenCalledWith(
        expect.objectContaining({
          firstName: dto.firstName,
          lastName: dto.lastName,
          email: dto.email,
          password: dto.password,
        }),
      );
      expect(
        userAccountRecoveryServiceMock.sendVerificationEmail,
      ).toHaveBeenCalledWith(savedUser);
      expect(result).toEqual(expect.objectContaining({ email: dto.email }));
    });

    it('throws when the email is already used', async () => {
      userRepositoryValue.findOne.mockResolvedValue(new UserEntity());

      await expect(service.create(dto)).rejects.toMatchObject({
        response: { errorCode: ErrorCode.E001 },
      });
      expect(userRepositoryValue.save).not.toHaveBeenCalled();
    });

    it('throws when password confirmation does not match', async () => {
      userRepositoryValue.findOne.mockResolvedValue(null);

      await expect(
        service.create({ ...dto, confirmPassword: 'different1' }),
      ).rejects.toMatchObject({
        response: { errorCode: ErrorCode.E003 },
      });
      expect(userRepositoryValue.save).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('returns the user dto', async () => {
      const user = new UserEntity({
        id: '1' as any,
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@example.com',
      });

      userRepositoryValue.findOneOrFail.mockResolvedValue(user);

      const result = await service.findOne('1' as any);

      expect(userRepositoryValue.findOneOrFail).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: ['cosplayerProfile'],
        withDeleted: true,
      });
      expect(result).toEqual(expect.objectContaining({ email: user.email }));
    });
  });

  describe('update', () => {
    it('updates mutable profile fields only', async () => {
      const user = new UserEntity({
        id: '1' as any,
        firstName: 'Old',
        lastName: 'Name',
        email: 'jane@example.com',
      });

      userRepositoryValue.findOneByOrFail.mockResolvedValue(user);

      await service.update('1' as any, {
        firstName: 'New',
        lastName: 'Person',
        confirmPassword: 'secret1',
      });

      expect(user.firstName).toBe('New');
      expect(user.lastName).toBe('Person');
      expect(userRepositoryValue.save).toHaveBeenCalledWith(user);
    });
  });

  describe('toggleVerify', () => {
    it('toggles verification state', async () => {
      const user = new UserEntity({
        id: '1' as any,
        firstName: 'Jane',
        verifiedAt: null,
      });

      userRepositoryValue.findOneOrFail.mockResolvedValue(user);
      userRepositoryValue.save.mockResolvedValue(user);

      const result = await service.toggleVerify('1' as any);

      expect(user.verifiedAt).toBeInstanceOf(Date);
      expect(userRepositoryValue.save).toHaveBeenCalledWith(user);
    });
  });

  describe('toggleCosplayerVerify', () => {
    it('toggles cosplayer verification state independently', async () => {
      const profile = { isVerified: false };
      const user = new UserEntity({
        id: '1' as any,
        firstName: 'Jane',
        cosplayerProfile: profile as any,
      });

      userRepositoryValue.findOneOrFail.mockResolvedValue(user);
      const profileRepo = { save: jest.fn().mockResolvedValue(profile) };
      dataSourceMock.getRepository.mockReturnValue(profileRepo);

      await service.toggleCosplayerVerify('1' as any);

      expect(profile.isVerified).toBe(true);
      expect(profileRepo.save).toHaveBeenCalledWith(profile);
    });
  });

  describe('remove', () => {
    it('soft removes the selected user and cleans up accounts and sessions', async () => {
      const user = new UserEntity({ id: '1' as any });

      userRepositoryValue.findOneByOrFail.mockResolvedValue(user);

      await service.remove('1' as any);

      expect(userAccountRepositoryValue.delete).toHaveBeenCalledWith({
        userId: '1',
      });
      expect(userSessionRepositoryValue.delete).toHaveBeenCalledWith({
        userId: '1',
      });
      expect(userRepositoryValue.softRemove).toHaveBeenCalledWith(user);
    });
  });

  describe('restore', () => {
    it('restores a soft-deleted user and sends verification email', async () => {
      const user = new UserEntity({
        id: '1' as any,
        email: 'deleted@example.com',
        deletedAt: new Date(),
      });

      userRepositoryValue.findOne
        .mockResolvedValueOnce(user) // findOne withDeleted
        .mockResolvedValueOnce(null); // findOne active duplicate check

      const result = await service.restore('1' as any);

      expect(dataSourceMock.transaction).toHaveBeenCalled();
      expect(
        userAccountRecoveryServiceMock.sendVerificationEmail,
      ).toHaveBeenCalledWith(user, { skipRateLimit: true });
      expect(result).toBeDefined();
    });

    it('throws NotFoundException when user is not found', async () => {
      userRepositoryValue.findOne.mockResolvedValueOnce(null);

      await expect(service.restore('999' as any)).rejects.toThrow();
    });

    it('throws BadRequestException when user is not deleted', async () => {
      const user = new UserEntity({
        id: '1' as any,
        email: 'active@example.com',
        deletedAt: null,
      });

      userRepositoryValue.findOne.mockResolvedValueOnce(user);

      await expect(service.restore('1' as any)).rejects.toThrow();
    });

    it('throws ConflictException when active user with same email exists', async () => {
      const user = new UserEntity({
        id: '1' as any,
        email: 'dup@example.com',
        deletedAt: new Date(),
      });
      const activeUser = new UserEntity({
        id: '2' as any,
        email: 'dup@example.com',
      });

      userRepositoryValue.findOne
        .mockResolvedValueOnce(user)
        .mockResolvedValueOnce(activeUser);

      await expect(service.restore('1' as any)).rejects.toThrow();
    });
  });
});
