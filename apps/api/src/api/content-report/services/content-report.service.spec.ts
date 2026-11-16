import { AutoIncrementID } from '../../../common/types/common.type';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  EReportStatus,
  EReportTargetType,
} from '../constants/content-report.constant';
import { ContentReportEntity } from '../entities/content-report.entity';
import { ContentReportService } from './content-report.service';

const id = (val: string) => val as unknown as AutoIncrementID;

describe('ContentReportService', () => {
  let service: ContentReportService;
  let reportRepo: any;

  beforeEach(async () => {
    reportRepo = {
      createQueryBuilder: jest.fn(),
      create: jest
        .fn()
        .mockImplementation((dto) => ({
          ...dto,
          id: id('1'),
          createdAt: new Date(),
        })),
      save: jest
        .fn()
        .mockImplementation(async (item) => ({
          ...item,
          id: id('1'),
          createdAt: new Date(),
        })),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContentReportService,
        {
          provide: getRepositoryToken(ContentReportEntity),
          useValue: reportRepo,
        },
      ],
    }).compile();

    service = module.get<ContentReportService>(ContentReportService);
  });

  describe('createReport', () => {
    it('creates and returns report with PENDING status', async () => {
      const res = await service.createReport(id('100'), {
        targetType: EReportTargetType.POST,
        targetId: id('50'),
        reason: 'Spam content',
        description: 'Repeated advertising',
      });

      expect(res.targetType).toBe(EReportTargetType.POST);
      expect(res.status).toBe(EReportStatus.PENDING);
      expect(reportRepo.save).toHaveBeenCalled();
    });
  });
});
