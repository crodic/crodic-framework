import { CacheKey } from '../../common/constants/cache.constant';
import { ErrorCode } from '../../common/constants/error-code.constant';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { EmailQueueService } from '../../background/queues/email-queue/email-queue.service';
import { AdminAccountRecoveryService } from '../auth/services/admin-account-recovery.service';
import { AdminRoleEntity } from '../admin-role/entities/admin-role.entity';
import { AdminSessionEntity } from '../auth/entities/admin-session.entity';
import { AdminUserService } from './admin-user.service';
import { AdminAccountEntity } from './entities/admin-account.entity';
import { AdminUserEntity } from './entities/admin-user.entity';

describe('AdminUserService', () => {
  let service: AdminUserService;

  let adminRepoMock: Record<string, jest.Mock>;
  let adminAccountRepoMock: Record<string, jest.Mock>;
  let adminSessionRepoMock: Record<string, jest.Mock>;
  let roleRepoMock: Record<string, jest.Mock>;
  let dataSourceMock: { transaction: jest.Mock };
  let cacheMock: { get: jest.Mock; set: jest.Mock; del: jest.Mock };
  let adminAccountRecoveryServiceMock: { sendVerificationEmail: jest.Mock };
  let emailQueueServiceMock: { sendMail: jest.Mock };

  beforeAll(async () => {
    adminRepoMock = {
      findOne: jest.fn(),
      count: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
      findOneOrFail: jest.fn(),
      findOneByOrFail: jest.fn(),
      findOneBy: jest.fn(),
      softRemove: jest.fn(),
      restore: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    adminAccountRepoMock = {
      findOne: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };

    adminSessionRepoMock = {
      delete: jest.fn(),
    };

    roleRepoMock = {
      findOne: jest.fn(),
      findOneBy: jest.fn(),
      findBy: jest.fn(),
    };

    dataSourceMock = {
      transaction: jest.fn().mockImplementation(async (cb) => {
        const managerMock = {
          getRepository: jest.fn().mockImplementation((entity) => {
            if (entity === AdminUserEntity) return adminRepoMock;
            if (entity === AdminAccountEntity) return adminAccountRepoMock;
            if (entity === AdminSessionEntity) return adminSessionRepoMock;
            return {};
          }),
        };
        return cb(managerMock);
      }),
    };

    cacheMock = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    };
    adminAccountRecoveryServiceMock = {
      sendVerificationEmail: jest.fn(),
    };
    emailQueueServiceMock = {
      sendMail: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminUserService,
        {
          provide: getRepositoryToken(AdminUserEntity),
          useValue: adminRepoMock,
        },
        {
          provide: getRepositoryToken(AdminAccountEntity),
          useValue: adminAccountRepoMock,
        },
        {
          provide: getRepositoryToken(AdminSessionEntity),
          useValue: adminSessionRepoMock,
        },
        {
          provide: getRepositoryToken(AdminRoleEntity),
          useValue: roleRepoMock,
        },
        {
          provide: DataSource,
          useValue: dataSourceMock,
        },
        {
          provide: CACHE_MANAGER,
          useValue: cacheMock,
        },
        {
          provide: AdminAccountRecoveryService,
          useValue: adminAccountRecoveryServiceMock,
        },
        {
          provide: EmailQueueService,
          useValue: emailQueueServiceMock,
        },
      ],
    }).compile();

    service = module.get<AdminUserService>(AdminUserService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('hasAdmin', () => {
    it('returns cached initialized state', async () => {
      cacheMock.get.mockResolvedValue(true);

      await expect(service.hasAdmin()).resolves.toBe(true);

      expect(adminRepoMock.count).not.toHaveBeenCalled();
    });

    it('counts admins and caches the result on cache miss', async () => {
      cacheMock.get.mockResolvedValue(undefined);
      adminRepoMock.count.mockResolvedValue(0);

      await expect(service.hasAdmin()).resolves.toBe(false);

      expect(cacheMock.set).toHaveBeenCalledWith(
        CacheKey.SYSTEM_HAS_ADMIN,
        false,
        60000,
      );
    });
  });

  describe('create', () => {
    const dto = {
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@example.com',
      password: 'secret1',
      roleIds: ['1' as any],
    };

    it('creates an admin user with resolved roles', async () => {
      const role = new AdminRoleEntity({ id: '1' as any, name: 'Admin' });
      const savedAdmin = new AdminUserEntity({
        id: '2' as any,
        ...dto,
        roles: [role],
      });

      adminRepoMock.findOne.mockResolvedValue(null);
      roleRepoMock.findBy.mockResolvedValue([role]);
      adminRepoMock.save.mockResolvedValue(savedAdmin);

      const result = await service.create(dto);

      expect(adminRepoMock.findOne).toHaveBeenCalledWith({
        where: { email: dto.email },
        withDeleted: true,
      });
      expect(adminRepoMock.save).toHaveBeenCalledWith(
        expect.objectContaining({ email: dto.email, roles: [role] }),
      );
      expect(
        adminAccountRecoveryServiceMock.sendVerificationEmail,
      ).toHaveBeenCalledWith(savedAdmin, { skipRateLimit: true });
      expect(result).toEqual(expect.objectContaining({ email: dto.email }));
    });

    it('throws when the email already exists', async () => {
      adminRepoMock.findOne.mockResolvedValue(new AdminUserEntity());

      await expect(service.create(dto)).rejects.toMatchObject({
        response: { errorCode: ErrorCode.E001 },
      });
      expect(adminRepoMock.save).not.toHaveBeenCalled();
    });

    it('throws when any role id does not exist', async () => {
      adminRepoMock.findOne.mockResolvedValue(null);
      roleRepoMock.findBy.mockResolvedValue([]);

      await expect(service.create(dto)).rejects.toMatchObject({
        response: { errorCode: ErrorCode.E002 },
      });
      expect(adminRepoMock.save).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('replaces roles when role ids are provided', async () => {
      const existing = new AdminUserEntity({
        id: '1' as any,
        email: 'admin@example.com',
        roles: [],
      });
      const role = new AdminRoleEntity({ id: '2' as any, name: 'Manager' });

      adminRepoMock.findOneOrFail.mockResolvedValue(existing);
      roleRepoMock.findBy.mockResolvedValue([role]);

      await service.update('1' as any, {
        firstName: 'Updated',
        lastName: 'Admin',
        email: 'admin@example.com',
        roleIds: ['2' as any],
      });

      expect(existing.roles).toEqual([role]);
      expect(adminRepoMock.save).toHaveBeenCalledWith(existing);
    });

    it('throws when updated role ids cannot all be resolved', async () => {
      adminRepoMock.findOneOrFail.mockResolvedValue(
        new AdminUserEntity({ id: '1' as any, roles: [] }),
      );
      roleRepoMock.findBy.mockResolvedValue([]);

      await expect(
        service.update('1' as any, {
          firstName: 'Updated',
          lastName: 'Admin',
          email: 'admin@example.com',
          roleIds: ['missing' as any],
        }),
      ).rejects.toMatchObject({
        response: { errorCode: ErrorCode.E002 },
      });
      expect(adminRepoMock.save).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('soft removes the selected admin user and cleans up sessions while preserving accounts', async () => {
      const admin = new AdminUserEntity({ id: '1' as any });
      adminRepoMock.findOneByOrFail.mockResolvedValue(admin);

      await service.remove('1' as any);

      expect(adminSessionRepoMock.delete).toHaveBeenCalledWith({
        adminUserId: '1',
      });
      expect(adminRepoMock.softRemove).toHaveBeenCalledWith(admin);
    });
  });

  describe('restore', () => {
    it('restores a soft-deleted admin user and sends verification email', async () => {
      const admin = new AdminUserEntity({
        id: '1' as any,
        email: 'deleted@example.com',
        deletedAt: new Date(),
        roles: [],
      });

      adminRepoMock.findOne
        .mockResolvedValueOnce(admin) // findOne withDeleted
        .mockResolvedValueOnce(null); // findOne active duplicate check

      const result = await service.restore('1' as any);

      expect(dataSourceMock.transaction).toHaveBeenCalled();
      expect(
        adminAccountRecoveryServiceMock.sendVerificationEmail,
      ).toHaveBeenCalledWith(admin, { skipRateLimit: true });
      expect(cacheMock.del).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('throws NotFoundException when admin is not found', async () => {
      adminRepoMock.findOne.mockResolvedValueOnce(null);

      await expect(service.restore('999' as any)).rejects.toThrow();
    });

    it('throws BadRequestException when admin is not deleted', async () => {
      const admin = new AdminUserEntity({
        id: '1' as any,
        email: 'active@example.com',
        deletedAt: null,
      });

      adminRepoMock.findOne.mockResolvedValueOnce(admin);

      await expect(service.restore('1' as any)).rejects.toThrow();
    });

    it('throws ConflictException when active admin with same email exists', async () => {
      const admin = new AdminUserEntity({
        id: '1' as any,
        email: 'duplicate@example.com',
        deletedAt: new Date(),
      });
      const activeAdmin = new AdminUserEntity({
        id: '2' as any,
        email: 'duplicate@example.com',
      });

      adminRepoMock.findOne
        .mockResolvedValueOnce(admin)
        .mockResolvedValueOnce(activeAdmin);

      await expect(service.restore('1' as any)).rejects.toThrow();
    });
  });
});
