import { AutoIncrementID } from '../../common/types/common.type';
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { plainToInstance } from 'class-transformer';
import {
  FilterOperator,
  paginate,
  Paginated,
  PaginateQuery,
} from 'nestjs-paginate';
import { In, LessThan, Repository } from 'typeorm';
import {
  CronJobLogEntity,
  ECronJobStatus,
  ECronJobTriggerType,
} from './entities/cron-job-log.entity';
import { CronJobResDto } from './dto/cron-job.res.dto';
import { CronJobLogResDto } from './dto/cron-job-log.res.dto';
import { TriggerCronJobResDto } from './dto/trigger-cron-job.res.dto';

export interface CronJobDefinition {
  key: string;
  name: string;
  schedule: string;
  description: string;
  category: string;
  handler: (moduleRef: ModuleRef) => Promise<any>;
}

@Injectable()
export class CronJobService {
  private readonly logger = new Logger(CronJobService.name);

  private readonly registeredJobs: CronJobDefinition[] = [
    {
      key: 'purge-expired-users',
      name: 'Purge Expired Deleted Users',
      schedule: '0 3 * * *',
      description:
        'Permanently removes soft-deleted users and their associated records after 30-day grace period.',
      category: 'User Management',
      handler: async (ref) => {
        const { UserService } = await import('../user/user.service');
        const service = ref.get(UserService, { strict: false });
        const count = await service.purgeExpiredDeletedUsers();
        return `Purged ${count} expired users.`;
      },
    },
    {
      key: 'purge-expired-admin-users',
      name: 'Purge Expired Deleted Admins',
      schedule: '0 4 * * *',
      description:
        'Permanently removes soft-deleted admin accounts after 30-day grace period.',
      category: 'Admin Management',
      handler: async (ref) => {
        const { AdminUserService } =
          await import('../admin-user/admin-user.service');
        const service = ref.get(AdminUserService, { strict: false });
        await service.hardDeleteOldAccounts();
        return 'Purged expired admin users successfully.';
      },
    },
    {
      key: 'cleanup-temp-files',
      name: 'Cleanup Temporary Upload Files',
      schedule: '0 2 * * *',
      description:
        'Scans and cleans up expired multipart upload sessions and orphaned temporary files on storage.',
      category: 'Storage & Files',
      handler: async (ref) => {
        const { FileCleanupService } =
          await import('../file/file-cleanup.service');
        const service = ref.get(FileCleanupService, { strict: false });
        await service.handleTempFilesCleanup();
        return 'Temporary upload files cleaned up successfully.';
      },
    },
    {
      key: 'cleanup-audit-logs',
      name: 'Cleanup Old Audit Logs',
      schedule: '0 10 * * *',
      description:
        'Prunes activity logs and audit trails older than the retention threshold (7 days).',
      category: 'System & Audit',
      handler: async (ref) => {
        const { AuditLogService } =
          await import('../audit-log/audit-log.service');
        const service = ref.get(AuditLogService, { strict: false });
        await service.purgeAuditLogsOlderThan7Days();
        return 'Old audit logs pruned successfully.';
      },
    },
    {
      key: 'sync-ranking-weekly',
      name: 'Weekly Ranking Snapshot Sync',
      schedule: '0 0 * * 0',
      description:
        'Recalculates scores and takes an immutable snapshot of all cosplayer ranking boards weekly.',
      category: 'Ranking & Leaderboards',
      handler: async (ref) => {
        const { RankingCronService } =
          await import('../ranking/services/ranking-cron.service');
        const service = ref.get(RankingCronService, { strict: false });
        await service.handleWeeklyRankingSnapshot();
        return 'Weekly ranking snapshot completed.';
      },
    },
    {
      key: 'sync-ranking-monthly',
      name: 'Monthly Ranking Snapshot Sync',
      schedule: '0 0 1 * *',
      description:
        'Recalculates scores and takes an immutable snapshot of all cosplayer ranking boards monthly.',
      category: 'Ranking & Leaderboards',
      handler: async (ref) => {
        const { RankingCronService } =
          await import('../ranking/services/ranking-cron.service');
        const service = ref.get(RankingCronService, { strict: false });
        await service.handleMonthlyRankingSnapshot();
        return 'Monthly ranking snapshot completed.';
      },
    },
    {
      key: 'sync-tag-stats',
      name: 'Daily Tag Maintenance & Statistics',
      schedule: '0 5 * * *',
      description:
        'Enqueues tag trending metrics refresh and post counter reconciliation jobs daily.',
      category: 'Tags & Taxonomy',
      handler: async (ref) => {
        const { TagQueueService } =
          await import('../tag/services/tag-queue.service');
        const service = ref.get(TagQueueService, { strict: false });
        await service.scheduleDailyMaintenance();
        return 'Daily tag maintenance enqueued successfully.';
      },
    },
  ];

  constructor(
    @InjectRepository(CronJobLogEntity)
    private readonly logRepository: Repository<CronJobLogEntity>,
    private readonly moduleRef: ModuleRef,
  ) {}

  /**
   * Returns list of all defined cron jobs with their latest execution stats.
   */
  async getRegisteredJobs(): Promise<CronJobResDto[]> {
    const jobKeys = this.registeredJobs.map((j) => j.key);

    const latestLogs = await this.logRepository
      .createQueryBuilder('log')
      .distinctOn(['log.job_key'])
      .where('log.job_key IN (:...jobKeys)', { jobKeys })
      .orderBy('log.job_key')
      .addOrderBy('log.id', 'DESC')
      .getMany();

    const logMap = new Map<string, CronJobLogEntity>();
    latestLogs.forEach((l) => logMap.set(l.jobKey, l));

    return this.registeredJobs.map((job) => {
      const last = logMap.get(job.key);
      return plainToInstance(CronJobResDto, {
        key: job.key,
        name: job.name,
        schedule: job.schedule,
        description: job.description,
        category: job.category,
        lastStatus: last?.status ?? null,
        lastRunAt: last?.startedAt ?? null,
        lastDurationMs: last?.durationMs ?? null,
        lastSummary: last?.summary ?? last?.errorMessage ?? null,
      });
    });
  }

  /**
   * Get paginated logs for data table view in Admin Portal.
   */
  async findAllLogs(
    query: PaginateQuery,
  ): Promise<Paginated<CronJobLogResDto>> {
    const qb = this.logRepository.createQueryBuilder('log');

    const result = await paginate(query, qb, {
      sortableColumns: [
        'id',
        'startedAt',
        'finishedAt',
        'durationMs',
        'status',
        'triggerType',
        'jobKey',
      ],
      searchableColumns: ['jobKey', 'jobName', 'summary', 'errorMessage'],
      defaultSortBy: [['id', 'DESC']],
      filterableColumns: {
        status: [FilterOperator.EQ, FilterOperator.IN],
        jobKey: [FilterOperator.EQ, FilterOperator.IN],
        triggerType: [FilterOperator.EQ],
        startedAt: [FilterOperator.BTW, FilterOperator.GTE, FilterOperator.LTE],
      },
    });

    return {
      ...result,
      data: plainToInstance(CronJobLogResDto, result.data, {
        excludeExtraneousValues: true,
      }),
    };
  }

  /**
   * Get single execution log detail by ID.
   */
  async findOneLog(id: AutoIncrementID): Promise<CronJobLogResDto> {
    const log = await this.logRepository.findOneBy({ id });
    if (!log) {
      throw new NotFoundException(`Cron job execution log #${id} not found`);
    }
    return plainToInstance(CronJobLogResDto, log, {
      excludeExtraneousValues: true,
    });
  }

  /**
   * Execute a registered job by its key (either via automated scheduler or manually via Admin Portal).
   */
  async runJob(
    jobKey: string,
    triggerType: ECronJobTriggerType = ECronJobTriggerType.MANUAL,
    adminId?: AutoIncrementID,
  ): Promise<TriggerCronJobResDto> {
    const jobDef = this.registeredJobs.find((j) => j.key === jobKey);
    if (!jobDef) {
      throw new BadRequestException(
        `Job key "${jobKey}" is not a recognized scheduled task`,
      );
    }

    const log = this.logRepository.create({
      jobKey: jobDef.key,
      jobName: jobDef.name,
      status: ECronJobStatus.RUNNING,
      triggerType,
      triggeredByAdminId: adminId ?? null,
      startedAt: new Date(),
    });

    const savedLog = await this.logRepository.save(log);
    const startTime = Date.now();

    try {
      this.logger.log(
        `[CRON] Executing job "${jobDef.key}" (${triggerType}) [Log #${savedLog.id}]...`,
      );
      const result = await jobDef.handler(this.moduleRef);
      const durationMs = Date.now() - startTime;

      savedLog.status = ECronJobStatus.SUCCESS;
      savedLog.finishedAt = new Date();
      savedLog.durationMs = durationMs;
      savedLog.summary =
        typeof result === 'string'
          ? result
          : typeof result === 'object'
            ? JSON.stringify(result)
            : 'Execution completed successfully.';

      await this.logRepository.save(savedLog);
      this.logger.log(
        `[CRON] Job "${jobDef.key}" completed in ${durationMs}ms.`,
      );

      return {
        success: true,
        jobKey: jobDef.key,
        status: ECronJobStatus.SUCCESS,
        message: 'Job executed successfully',
        durationMs,
        summary: savedLog.summary,
      };
    } catch (err: any) {
      const durationMs = Date.now() - startTime;
      this.logger.error(
        `[CRON] Job "${jobDef.key}" failed after ${durationMs}ms: ${err.message}`,
        err.stack,
      );

      savedLog.status = ECronJobStatus.FAILED;
      savedLog.finishedAt = new Date();
      savedLog.durationMs = durationMs;
      savedLog.errorMessage = err.message || 'Unknown error occurred';
      savedLog.errorStack = err.stack || null;

      await this.logRepository.save(savedLog);

      return {
        success: false,
        jobKey: jobDef.key,
        status: ECronJobStatus.FAILED,
        message: err.message || 'Job execution failed',
        durationMs,
        summary: savedLog.errorMessage,
      };
    }
  }

  /**
   * ==========================================
   * Automated Centralized Cron Schedulers
   * ==========================================
   * Every scheduled execution runs through this.runJob() with triggerType = SCHEDULED.
   * This automatically tracks start/finish time, duration, status, and errors in `cron_job_logs`.
   */
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async handleScheduledPurgeUsers(): Promise<void> {
    await this.runJob('purge-expired-users', ECronJobTriggerType.SCHEDULED);
  }

  @Cron(CronExpression.EVERY_DAY_AT_4AM)
  async handleScheduledPurgeAdmins(): Promise<void> {
    await this.runJob(
      'purge-expired-admin-users',
      ECronJobTriggerType.SCHEDULED,
    );
  }

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async handleScheduledTempFilesCleanup(): Promise<void> {
    await this.runJob('cleanup-temp-files', ECronJobTriggerType.SCHEDULED);
  }

  @Cron(CronExpression.EVERY_DAY_AT_10AM)
  async handleScheduledAuditLogsCleanup(): Promise<void> {
    await this.runJob('cleanup-audit-logs', ECronJobTriggerType.SCHEDULED);
  }

  @Cron(CronExpression.EVERY_WEEK)
  async handleScheduledWeeklyRanking(): Promise<void> {
    await this.runJob('sync-ranking-weekly', ECronJobTriggerType.SCHEDULED);
  }

  @Cron('0 0 1 * *')
  async handleScheduledMonthlyRanking(): Promise<void> {
    await this.runJob('sync-ranking-monthly', ECronJobTriggerType.SCHEDULED);
  }

  @Cron(CronExpression.EVERY_DAY_AT_5AM)
  async handleScheduledTagMaintenance(): Promise<void> {
    await this.runJob('sync-tag-stats', ECronJobTriggerType.SCHEDULED);
  }

  /**
   * Daily retention policy: purges execution logs older than 60 days.
   */
  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async purgeOldCronLogs(): Promise<number> {
    const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
    const deleteResult = await this.logRepository.delete({
      createdAt: LessThan(sixtyDaysAgo),
    });
    const purged = deleteResult.affected ?? 0;
    if (purged > 0) {
      this.logger.log(
        `Pruned ${purged} cron execution logs older than 60 days.`,
      );
    }
    return purged;
  }
}
