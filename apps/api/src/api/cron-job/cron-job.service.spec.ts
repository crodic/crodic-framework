import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ModuleRef } from '@nestjs/core';
import { CronJobService } from './cron-job.service';
import {
  CronJobLogEntity,
  ECronJobStatus,
  ECronJobTriggerType,
} from './entities/cron-job-log.entity';

describe('CronJobService', () => {
  let service: CronJobService;
  let logRepositoryMock: any;
  let moduleRefMock: any;

  beforeEach(async () => {
    logRepositoryMock = {
      create: jest.fn().mockImplementation((dto) => ({
        id: '1',
        ...dto,
      })),
      save: jest.fn().mockImplementation(async (entity) => ({
        id: '1',
        ...entity,
      })),
      findOneBy: jest.fn(),
      delete: jest.fn().mockResolvedValue({ affected: 5 }),
      createQueryBuilder: jest.fn().mockReturnValue({
        distinctOn: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      }),
    };

    moduleRefMock = {
      get: jest.fn().mockImplementation(() => ({
        purgeExpiredDeletedUsers: jest.fn().mockResolvedValue(2),
        hardDeleteOldAccounts: jest.fn().mockResolvedValue(undefined),
        handleTempFilesCleanup: jest.fn().mockResolvedValue(5),
        purgeAuditLogsOlderThan7Days: jest.fn().mockResolvedValue(10),
        handleWeeklyRankingSnapshot: jest.fn().mockResolvedValue(undefined),
        handleMonthlyRankingSnapshot: jest.fn().mockResolvedValue(undefined),
        scheduleHourlyMaintenance: jest.fn().mockResolvedValue(undefined),
        scheduleDailyMaintenance: jest.fn().mockResolvedValue(undefined),
      })),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CronJobService,
        {
          provide: getRepositoryToken(CronJobLogEntity),
          useValue: logRepositoryMock,
        },
        {
          provide: ModuleRef,
          useValue: moduleRefMock,
        },
      ],
    }).compile();

    service = module.get<CronJobService>(CronJobService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getRegisteredJobs', () => {
    it('returns all registered jobs with definition metadata', async () => {
      const jobs = await service.getRegisteredJobs();
      expect(Array.isArray(jobs)).toBe(true);
      expect(jobs.length).toBeGreaterThan(0);
      expect(jobs.some((j) => j.key === 'purge-expired-users')).toBe(true);
      expect(jobs.some((j) => j.key === 'cleanup-temp-files')).toBe(true);
    });
  });

  describe('runJob', () => {
    it('throws BadRequestException when jobKey is unknown', async () => {
      await expect(service.runJob('unknown-key')).rejects.toThrow();
    });

    it('creates log and executes recognized job successfully', async () => {
      const result = await service.runJob(
        'purge-expired-users',
        ECronJobTriggerType.MANUAL,
        '1' as any,
      );

      expect(logRepositoryMock.create).toHaveBeenCalledWith(
        expect.objectContaining({
          jobKey: 'purge-expired-users',
          triggerType: ECronJobTriggerType.MANUAL,
        }),
      );
      expect(logRepositoryMock.save).toHaveBeenCalled();
      expect(result).toBeDefined();
      expect(result.jobKey).toBe('purge-expired-users');
    });
  });

  describe('purgeOldCronLogs', () => {
    it('deletes execution logs older than 60 days', async () => {
      const count = await service.purgeOldCronLogs();
      expect(count).toBe(5);
      expect(logRepositoryMock.delete).toHaveBeenCalled();
    });
  });

  describe('scheduled cron handlers', () => {
    it('executes scheduled handlers with SCHEDULED triggerType', async () => {
      const runJobSpy = jest.spyOn(service, 'runJob').mockResolvedValue({
        success: true,
        jobKey: 'purge-expired-users',
        status: ECronJobStatus.SUCCESS,
        message: 'ok',
        durationMs: 10,
      });

      await service.handleScheduledPurgeUsers();
      expect(runJobSpy).toHaveBeenCalledWith(
        'purge-expired-users',
        ECronJobTriggerType.SCHEDULED,
      );

      await service.handleScheduledPurgeAdmins();
      expect(runJobSpy).toHaveBeenCalledWith(
        'purge-expired-admin-users',
        ECronJobTriggerType.SCHEDULED,
      );

      await service.handleScheduledTempFilesCleanup();
      expect(runJobSpy).toHaveBeenCalledWith(
        'cleanup-temp-files',
        ECronJobTriggerType.SCHEDULED,
      );

      await service.handleScheduledAuditLogsCleanup();
      expect(runJobSpy).toHaveBeenCalledWith(
        'cleanup-audit-logs',
        ECronJobTriggerType.SCHEDULED,
      );

      await service.handleScheduledWeeklyRanking();
      expect(runJobSpy).toHaveBeenCalledWith(
        'sync-ranking-weekly',
        ECronJobTriggerType.SCHEDULED,
      );

      await service.handleScheduledMonthlyRanking();
      expect(runJobSpy).toHaveBeenCalledWith(
        'sync-ranking-monthly',
        ECronJobTriggerType.SCHEDULED,
      );

      await service.handleScheduledTagMaintenance();
      expect(runJobSpy).toHaveBeenCalledWith(
        'sync-tag-stats',
        ECronJobTriggerType.SCHEDULED,
      );
    });
  });
});
