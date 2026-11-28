import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CacheKey } from '../../common/constants/cache.constant';
import { AdminAccountEntity } from './entities/admin-account.entity';
import { AdminSessionEntity } from '../auth/entities/admin-session.entity';
import { AdminUserEntity } from './entities/admin-user.entity';
import { AdminUserService } from './admin-user.service';

describe('Admin permanent deletion', () => {
  const targetId = '2' as any;
  const actorId = '1' as any;
  let repo: { findOne: jest.Mock; delete: jest.Mock };
  let sessions: { delete: jest.Mock };
  let accounts: { delete: jest.Mock };
  let cache: { del: jest.Mock };
  let dataSource: { transaction: jest.Mock };
  let service: AdminUserService;

  beforeEach(() => {
    repo = {
      findOne: jest
        .fn()
        .mockResolvedValue({ id: targetId, deletedAt: new Date() }),
      delete: jest.fn(),
    };
    sessions = { delete: jest.fn() };
    accounts = { delete: jest.fn() };
    cache = { del: jest.fn() };
    dataSource = {
      transaction: jest.fn(async (callback) =>
        callback({
          getRepository: (entity: unknown) => {
            if (entity === AdminUserEntity) return repo;
            if (entity === AdminSessionEntity) return sessions;
            if (entity === AdminAccountEntity) return accounts;
            throw new Error('Unexpected repository');
          },
        }),
      ),
    };
    service = new AdminUserService(
      repo as any,
      {} as any,
      {} as any,
      {} as any,
      cache as any,
      {} as any,
      {} as any,
      dataSource as any,
    );
  });

  it('removes credentials, sessions and the trashed admin in one transaction', async () => {
    await service.hardRemove(targetId, actorId);
    expect(repo.findOne).toHaveBeenCalledWith({
      where: { id: targetId },
      withDeleted: true,
    });
    expect(dataSource.transaction).toHaveBeenCalledTimes(1);
    expect(sessions.delete).toHaveBeenCalledWith({ adminUserId: targetId });
    expect(accounts.delete).toHaveBeenCalledWith({ adminUserId: targetId });
    expect(repo.delete).toHaveBeenCalledWith(targetId);
    expect(cache.del).toHaveBeenCalledWith(CacheKey.SYSTEM_HAS_ADMIN);
  });

  it('rejects deleting the current admin', async () => {
    await expect(service.hardRemove(actorId, actorId)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(dataSource.transaction).not.toHaveBeenCalled();
  });

  it('requires the target admin to be in trash', async () => {
    repo.findOne.mockResolvedValue({ id: targetId, deletedAt: null });
    await expect(service.hardRemove(targetId, actorId)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(dataSource.transaction).not.toHaveBeenCalled();
  });

  it('returns not found for a missing admin', async () => {
    repo.findOne.mockResolvedValue(null);
    await expect(service.hardRemove(targetId, actorId)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('propagates failures without deleting the admin or clearing the cache', async () => {
    const failure = new Error('Database unavailable');
    accounts.delete.mockRejectedValue(failure);
    await expect(service.hardRemove(targetId, actorId)).rejects.toBe(failure);
    expect(repo.delete).not.toHaveBeenCalled();
    expect(cache.del).not.toHaveBeenCalled();
  });
});
