import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { AdminAuthGuard } from '../../guards/admin-auth.guard';
import { PoliciesGuard } from '../../guards/policies.guard';
import { CaslAbilityFactory } from '../../shared/casl/ability.factory';
import { CronJobController } from './cron-job.controller';
import { CronJobService } from './cron-job.service';
import {
  ECronJobStatus,
  ECronJobTriggerType,
} from './entities/cron-job-log.entity';

describe('CronJobController', () => {
  let controller: CronJobController;
  let serviceMock: any;

  beforeEach(async () => {
    serviceMock = {
      getRegisteredJobs: jest.fn().mockResolvedValue([]),
      findAllLogs: jest.fn().mockResolvedValue({ data: [], meta: {} }),
      findOneLog: jest.fn().mockResolvedValue({ id: '1' }),
      runJob: jest.fn().mockResolvedValue({
        success: true,
        jobKey: 'purge-expired-users',
        status: ECronJobStatus.SUCCESS,
        message: 'Completed',
        durationMs: 120,
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CronJobController],
      providers: [
        {
          provide: CronJobService,
          useValue: serviceMock,
        },
        Reflector,
        {
          provide: ClsService,
          useValue: { get: jest.fn() },
        },
        CaslAbilityFactory,
      ],
    })
      .overrideGuard(AdminAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(PoliciesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<CronJobController>(CronJobController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('getRegisteredJobs calls service.getRegisteredJobs', async () => {
    await controller.getRegisteredJobs();
    expect(serviceMock.getRegisteredJobs).toHaveBeenCalled();
  });

  it('getLogs calls service.findAllLogs', async () => {
    await controller.getLogs({ path: '/cron-jobs/logs' } as any);
    expect(serviceMock.findAllLogs).toHaveBeenCalled();
  });

  it('getLogDetail calls service.findOneLog', async () => {
    await controller.getLogDetail('1' as any);
    expect(serviceMock.findOneLog).toHaveBeenCalledWith('1');
  });

  it('triggerJob calls service.runJob with adminId and MANUAL type', async () => {
    const result = await controller.triggerJob(
      'purge-expired-users',
      '10' as any,
    );
    expect(serviceMock.runJob).toHaveBeenCalledWith(
      'purge-expired-users',
      ECronJobTriggerType.MANUAL,
      '10',
    );
    expect(result.success).toBe(true);
  });
});
