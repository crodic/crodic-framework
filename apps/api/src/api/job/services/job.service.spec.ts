import { AutoIncrementID } from '../../../common/types/common.type';
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  EJobApplicationStatus,
  EJobCategory,
  EJobStatus,
} from '../constants/job.constant';
import { JobApplicationEntity } from '../entities/job-application.entity';
import { JobEntity } from '../entities/job.entity';
import { JobService } from './job.service';

const id = (val: string) => val as unknown as AutoIncrementID;

describe('JobService', () => {
  let service: JobService;
  let jobRepo: any;
  let applicationRepo: any;

  beforeEach(async () => {
    jobRepo = {
      createQueryBuilder: jest.fn(),
      findOne: jest.fn(),
      count: jest.fn().mockResolvedValue(0),
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
          id: item.id || id('1'),
          createdAt: new Date(),
          updatedAt: new Date(),
        })),
      softDelete: jest.fn().mockResolvedValue({ affected: 1 }),
      increment: jest.fn().mockResolvedValue(undefined),
    };

    applicationRepo = {
      find: jest.fn().mockResolvedValue([]),
      findOne: jest.fn(),
      create: jest
        .fn()
        .mockImplementation((dto) => ({
          ...dto,
          id: id('10'),
          createdAt: new Date(),
        })),
      save: jest
        .fn()
        .mockImplementation(async (item) => ({
          ...item,
          id: id('10'),
          createdAt: new Date(),
        })),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobService,
        { provide: getRepositoryToken(JobEntity), useValue: jobRepo },
        {
          provide: getRepositoryToken(JobApplicationEntity),
          useValue: applicationRepo,
        },
      ],
    }).compile();

    service = module.get<JobService>(JobService);
  });

  describe('findBySlug', () => {
    it('returns detail when found', async () => {
      jobRepo.findOne.mockResolvedValue({
        id: id('1'),
        slug: 'test-job',
        title: 'Cosplay Guest',
        brandName: 'Test Brand',
        isVerified: true,
        categoryCode: EJobCategory.EVENT,
        categoryLabel: 'Event',
        budgetLabel: '10M',
        locationLabel: 'HCM',
        deadlineLabel: '10 days',
        requirements: 'Reqs',
        description: 'Desc',
        filterTags: [],
        perks: [],
        contactEmail: 'job@test.com',
        isFeatured: false,
        status: EJobStatus.OPEN,
        applicationsCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const res = await service.findBySlug('test-job', id('100'));
      expect(res.slug).toBe('test-job');
      expect(res.title).toBe('Cosplay Guest');
    });

    it('throws NotFoundException when missing', async () => {
      jobRepo.findOne.mockResolvedValue(null);
      await expect(service.findBySlug('missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('creates job and returns detail', async () => {
      const res = await service.create(id('100'), {
        title: 'Cosplayer Shoot',
        brandName: 'Brand A',
        categoryCode: EJobCategory.LOOKBOOK,
        categoryLabel: 'Lookbook',
        budgetLabel: '5M',
        locationLabel: 'HN',
        deadlineLabel: '5 days',
        requirements: 'Experience required',
        description: 'Full day shoot',
        contactEmail: 'contact@brand.com',
      });

      expect(res.title).toBe('Cosplayer Shoot');
      expect(res.brandName).toBe('Brand A');
      expect(jobRepo.save).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('updates job if caller is poster', async () => {
      jobRepo.findOne.mockResolvedValue({
        id: id('1'),
        posterUserId: id('100'),
        title: 'Old Title',
        filterTags: [],
        perks: [],
      });

      const res = await service.update(id('100'), id('1'), {
        title: 'New Title',
      });
      expect(res.title).toBe('New Title');
    });

    it('throws ForbiddenException if caller is not poster', async () => {
      jobRepo.findOne.mockResolvedValue({
        id: id('1'),
        posterUserId: id('999'),
        title: 'Old Title',
      });

      await expect(
        service.update(id('100'), id('1'), { title: 'New Title' }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('delete', () => {
    it('soft deletes job if caller is poster', async () => {
      jobRepo.findOne.mockResolvedValue({
        id: id('1'),
        posterUserId: id('100'),
      });

      await service.delete(id('100'), id('1'));
      expect(jobRepo.softDelete).toHaveBeenCalledWith({ id: id('1') });
    });
  });

  describe('apply', () => {
    it('creates application and increments count', async () => {
      jobRepo.findOne.mockResolvedValue({ id: id('1') });
      applicationRepo.findOne.mockResolvedValue(null);

      const res = await service.apply(id('100'), id('1'), {
        fullName: 'Nguyễn Văn A',
        stageName: 'Kiriko',
        contactInfo: '0987654321',
        experience: '3 years',
      });

      expect(res.fullName).toBe('Nguyễn Văn A');
      expect(res.status).toBe(EJobApplicationStatus.PENDING);
      expect(jobRepo.increment).toHaveBeenCalledWith(
        { id: id('1') },
        'applicationsCount',
        1,
      );
    });

    it('throws ConflictException if already applied', async () => {
      jobRepo.findOne.mockResolvedValue({ id: id('1') });
      applicationRepo.findOne.mockResolvedValue({ id: id('99') });

      await expect(
        service.apply(id('100'), id('1'), {
          fullName: 'Nguyễn Văn A',
          stageName: 'Kiriko',
          contactInfo: '0987654321',
          experience: '3 years',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('getMyApplications', () => {
    it('returns applications for user', async () => {
      applicationRepo.find.mockResolvedValue([
        {
          id: id('10'),
          jobId: id('1'),
          applicantUserId: id('100'),
          fullName: 'Test User',
          stageName: 'Tester',
          contactInfo: '0123456789',
          experience: 'None',
          status: EJobApplicationStatus.PENDING,
          createdAt: new Date(),
        },
      ]);

      const list = await service.getMyApplications(id('100'));
      expect(list.length).toBe(1);
      expect(list[0].stageName).toBe('Tester');
    });
  });
});
