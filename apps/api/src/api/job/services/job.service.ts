import {
  AllowedFilter,
  QueryBuilder,
  QueryParams,
} from '../../../common/query-builder';
import { Paginated } from '../../../common/dto/offset-pagination/paginated.dto';
import { AutoIncrementID } from '../../../common/types/common.type';
import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, In, Repository } from 'typeorm';
import {
  EJobApplicationStatus,
  EJobCategory,
  EJobStatus,
} from '../constants/job.constant';
import {
  CreateJobApplicationReqDto,
  CreateJobReqDto,
  UpdateJobReqDto,
} from '../dto/job-req.dto';
import {
  JobApplicationResDto,
  JobDetailResDto,
  JobSummaryResDto,
} from '../dto/job-res.dto';
import { JobApplicationEntity } from '../entities/job-application.entity';
import { JobEntity } from '../entities/job.entity';

function slugify(text: string): string {
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
export class JobService {
  constructor(
    @InjectRepository(JobEntity)
    private readonly jobRepo: Repository<JobEntity>,
    @InjectRepository(JobApplicationEntity)
    private readonly applicationRepo: Repository<JobApplicationEntity>,
  ) {}

  /**
   * Browse cosplay jobs and casting calls with QueryBuilder support.
   */
  async findAll(
    query: QueryParams,
    currentUserId?: AutoIncrementID,
  ): Promise<Paginated<JobSummaryResDto>> {
    const baseQb = this.jobRepo.createQueryBuilder('job');

    const paginated = await QueryBuilder.for(baseQb, query)
      .allowedFilters([
        AllowedFilter.exact('categoryCode'),
        AllowedFilter.exact('locationFilterCode'),
        AllowedFilter.exact('cityId'),
        AllowedFilter.exact('brandId'),
        AllowedFilter.exact('status'),
        AllowedFilter.exact('isFeatured'),
        AllowedFilter.partial('title'),
        AllowedFilter.partial('brandName'),
        AllowedFilter.partial('locationLabel'),
        AllowedFilter.callback('search', (qb, value) => {
          const term = Array.isArray(value) ? String(value[0]) : String(value);
          const normalized = term.trim().toLowerCase();
          if (!normalized) return;
          qb.andWhere(
            new Brackets((b) => {
              b.where('LOWER(job.title) LIKE :sTerm', {
                sTerm: `%${normalized}%`,
              })
                .orWhere('LOWER(job.brandName) LIKE :sTerm', {
                  sTerm: `%${normalized}%`,
                })
                .orWhere('LOWER(job.locationLabel) LIKE :sTerm', {
                  sTerm: `%${normalized}%`,
                })
                .orWhere('job.filter_tags::text ILIKE :sTerm', {
                  sTerm: `%${normalized}%`,
                });
            }),
          );
        }),
      ])
      .allowedSorts(['createdAt', 'applicationsCount', 'deadlineAt'])
      .defaultSort('-createdAt')
      .paginate();

    const jobIds = paginated.data.map((j) => j.id);
    let appliedSet = new Set<string>();

    if (currentUserId && jobIds.length > 0) {
      const apps = await this.applicationRepo.find({
        where: { applicantUserId: currentUserId, jobId: In(jobIds) },
      });
      appliedSet = new Set(apps.map((a) => String(a.jobId)));
    }

    const mapped = paginated.data.map((job) =>
      this.toSummaryDto(job, appliedSet.has(String(job.id))),
    );

    return new Paginated(mapped, paginated.meta, paginated.links);
  }

  /**
   * Get job detail by slug.
   */
  async findBySlug(
    slug: string,
    currentUserId?: AutoIncrementID,
  ): Promise<JobDetailResDto> {
    const job = await this.jobRepo.findOne({ where: { slug } });
    if (!job) {
      throw new NotFoundException(`Job "${slug}" not found`);
    }

    let isApplied = false;
    if (currentUserId) {
      const existing = await this.applicationRepo.findOne({
        where: { applicantUserId: currentUserId, jobId: job.id },
      });
      isApplied = Boolean(existing);
    }

    return this.toDetailDto(job, isApplied);
  }

  /**
   * Create new job posting.
   */
  async create(
    posterUserId: AutoIncrementID,
    dto: CreateJobReqDto,
  ): Promise<JobDetailResDto> {
    let slugCandidate = slugify(dto.title);
    if (!slugCandidate) {
      slugCandidate = `job-${Date.now().toString(36)}`;
    }
    const slugCollision = await this.jobRepo.count({
      where: { slug: slugCandidate },
    });
    if (slugCollision > 0) {
      slugCandidate = `${slugCandidate}-${Date.now().toString(36).slice(-4)}`;
    }

    const job = this.jobRepo.create({
      slug: slugCandidate,
      posterUserId,
      brandId: dto.brandId ?? null,
      brandName: dto.brandName,
      brandLogoUrl: dto.brandLogoUrl ?? null,
      brandInitials: dto.brandInitials ?? null,
      brandColor: dto.brandColor || 'bg-primary',
      isVerified: dto.isVerified ?? false,
      title: dto.title,
      categoryCode: dto.categoryCode ?? EJobCategory.EVENT,
      categoryLabel: dto.categoryLabel,
      budgetLabel: dto.budgetLabel,
      budgetMin: dto.budgetMin ?? null,
      budgetMax: dto.budgetMax ?? null,
      locationLabel: dto.locationLabel,
      locationFilterCode: dto.locationFilterCode || 'toanquoc',
      cityId: dto.cityId ?? null,
      deadlineLabel: dto.deadlineLabel,
      deadlineAt: dto.deadlineAt ?? null,
      requirements: dto.requirements,
      description: dto.description,
      perks: dto.perks || [],
      filterTags: dto.filterTags || [],
      contactEmail: dto.contactEmail,
      thumbnailUrl: dto.thumbnailUrl ?? null,
      isFeatured: dto.isFeatured ?? false,
      status: dto.status ?? EJobStatus.OPEN,
      applicationsCount: 0,
    });

    const saved = await this.jobRepo.save(job);
    return this.toDetailDto(saved, false);
  }

  /**
   * Update job posting.
   */
  async update(
    userId: AutoIncrementID,
    jobId: AutoIncrementID,
    dto: UpdateJobReqDto,
  ): Promise<JobDetailResDto> {
    const job = await this.jobRepo.findOne({ where: { id: jobId } });
    if (!job) {
      throw new NotFoundException(`Job #${jobId} not found`);
    }
    if (job.posterUserId && String(job.posterUserId) !== String(userId)) {
      throw new ForbiddenException(
        'You do not have permission to edit this job posting',
      );
    }

    if (dto.title !== undefined) job.title = dto.title;
    if (dto.brandId !== undefined) job.brandId = dto.brandId;
    if (dto.brandName !== undefined) job.brandName = dto.brandName;
    if (dto.brandLogoUrl !== undefined) job.brandLogoUrl = dto.brandLogoUrl;
    if (dto.brandInitials !== undefined) job.brandInitials = dto.brandInitials;
    if (dto.brandColor !== undefined) job.brandColor = dto.brandColor;
    if (dto.isVerified !== undefined) job.isVerified = dto.isVerified;
    if (dto.categoryCode !== undefined) job.categoryCode = dto.categoryCode;
    if (dto.categoryLabel !== undefined) job.categoryLabel = dto.categoryLabel;
    if (dto.budgetLabel !== undefined) job.budgetLabel = dto.budgetLabel;
    if (dto.budgetMin !== undefined) job.budgetMin = dto.budgetMin;
    if (dto.budgetMax !== undefined) job.budgetMax = dto.budgetMax;
    if (dto.locationLabel !== undefined) job.locationLabel = dto.locationLabel;
    if (dto.locationFilterCode !== undefined)
      job.locationFilterCode = dto.locationFilterCode;
    if (dto.cityId !== undefined) job.cityId = dto.cityId;
    if (dto.deadlineLabel !== undefined) job.deadlineLabel = dto.deadlineLabel;
    if (dto.deadlineAt !== undefined) job.deadlineAt = dto.deadlineAt;
    if (dto.requirements !== undefined) job.requirements = dto.requirements;
    if (dto.description !== undefined) job.description = dto.description;
    if (dto.perks !== undefined) job.perks = dto.perks;
    if (dto.filterTags !== undefined) job.filterTags = dto.filterTags;
    if (dto.contactEmail !== undefined) job.contactEmail = dto.contactEmail;
    if (dto.thumbnailUrl !== undefined) job.thumbnailUrl = dto.thumbnailUrl;
    if (dto.isFeatured !== undefined) job.isFeatured = dto.isFeatured;
    if (dto.status !== undefined) job.status = dto.status;

    const saved = await this.jobRepo.save(job);
    return this.toDetailDto(saved, false);
  }

  /**
   * Delete job posting.
   */
  async delete(userId: AutoIncrementID, jobId: AutoIncrementID): Promise<void> {
    const job = await this.jobRepo.findOne({ where: { id: jobId } });
    if (!job) {
      throw new NotFoundException(`Job #${jobId} not found`);
    }
    if (job.posterUserId && String(job.posterUserId) !== String(userId)) {
      throw new ForbiddenException(
        'You do not have permission to delete this job posting',
      );
    }

    await this.jobRepo.softDelete({ id: jobId });
  }

  /**
   * Apply for a job.
   */
  async apply(
    userId: AutoIncrementID,
    jobId: AutoIncrementID,
    dto: CreateJobApplicationReqDto,
  ): Promise<JobApplicationResDto> {
    const job = await this.jobRepo.findOne({ where: { id: jobId } });
    if (!job) {
      throw new NotFoundException(`Job #${jobId} not found`);
    }

    const existing = await this.applicationRepo.findOne({
      where: { jobId, applicantUserId: userId },
    });
    if (existing) {
      throw new ConflictException(
        'You have already submitted an application for this job',
      );
    }

    const app = this.applicationRepo.create({
      jobId,
      applicantUserId: userId,
      fullName: dto.fullName,
      stageName: dto.stageName,
      contactInfo: dto.contactInfo,
      portfolioUrl: dto.portfolioUrl ?? null,
      experience: dto.experience,
      message: dto.message ?? null,
      status: EJobApplicationStatus.PENDING,
    });

    const saved = await this.applicationRepo.save(app);
    await this.jobRepo.increment({ id: jobId }, 'applicationsCount', 1);

    return this.toApplicationDto(saved);
  }

  /**
   * Get current user's job applications.
   */
  async getMyApplications(
    userId: AutoIncrementID,
  ): Promise<JobApplicationResDto[]> {
    const list = await this.applicationRepo.find({
      where: { applicantUserId: userId },
      order: { createdAt: 'DESC' },
    });
    return list.map((item) => this.toApplicationDto(item));
  }

  // =================== MAPPERS ===================

  private toSummaryDto(j: JobEntity, isApplied = false): JobSummaryResDto {
    return {
      id: j.id,
      slug: j.slug,
      title: j.title,
      brandName: j.brandName,
      brandLogoUrl: j.brandLogoUrl ?? null,
      brandInitials: j.brandInitials ?? null,
      brandColor: j.brandColor ?? null,
      isVerified: j.isVerified,
      locationLabel: j.locationLabel,
      locationFilterCode: j.locationFilterCode ?? null,
      budgetLabel: j.budgetLabel,
      budgetMin:
        j.budgetMin !== null && j.budgetMin !== undefined
          ? Number(j.budgetMin)
          : null,
      budgetMax:
        j.budgetMax !== null && j.budgetMax !== undefined
          ? Number(j.budgetMax)
          : null,
      categoryCode: j.categoryCode,
      categoryLabel: j.categoryLabel,
      deadlineLabel: j.deadlineLabel,
      deadlineAt: j.deadlineAt ?? null,
      filterTags: j.filterTags || [],
      perks: j.perks || [],
      contactEmail: j.contactEmail,
      thumbnailUrl: j.thumbnailUrl ?? null,
      isFeatured: j.isFeatured,
      status: j.status,
      applicationsCount: Number(j.applicationsCount || 0),
      isAppliedByCurrentUser: isApplied,
      createdAt: j.createdAt,
    };
  }

  private toDetailDto(j: JobEntity, isApplied = false): JobDetailResDto {
    return {
      ...this.toSummaryDto(j, isApplied),
      brandId: j.brandId ?? null,
      description: j.description,
      requirements: j.requirements,
      updatedAt: j.updatedAt,
    };
  }

  private toApplicationDto(a: JobApplicationEntity): JobApplicationResDto {
    return {
      id: a.id,
      jobId: a.jobId,
      applicantUserId: a.applicantUserId,
      fullName: a.fullName,
      stageName: a.stageName,
      contactInfo: a.contactInfo,
      portfolioUrl: a.portfolioUrl ?? null,
      experience: a.experience,
      message: a.message ?? null,
      status: a.status,
      createdAt: a.createdAt,
    };
  }
}
