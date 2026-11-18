import {
  AllowedFilter,
  QueryBuilder,
  QueryParams,
} from '../../../common/query-builder';
import { Paginated } from '../../../common/dto/offset-pagination/paginated.dto';
import { AutoIncrementID } from '../../../common/types/common.type';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { EReportStatus } from '../constants/content-report.constant';
import {
  CreateContentReportReqDto,
  ResolveContentReportReqDto,
} from '../dto/content-report-req.dto';
import {
  ContentReportAdminResDto,
  ContentReportResDto,
} from '../dto/content-report-res.dto';
import { ContentReportEntity } from '../entities/content-report.entity';

@Injectable()
export class ContentReportService {
  constructor(
    @InjectRepository(ContentReportEntity)
    private readonly reportRepo: Repository<ContentReportEntity>,
  ) {}

  /**
   * Submit a violation or abuse report on a post, user, comment, or job.
   */
  async createReport(
    reporterUserId: AutoIncrementID,
    dto: CreateContentReportReqDto,
  ): Promise<ContentReportResDto> {
    const report = this.reportRepo.create({
      reporterUserId,
      targetType: dto.targetType,
      targetId: dto.targetId,
      reason: dto.reason,
      description: dto.description ?? null,
      status: EReportStatus.PENDING,
    });

    const saved = await this.reportRepo.save(report);
    return this.toReportDto(saved);
  }

  /**
   * Get user's submitted reports and their moderation status.
   */
  async getMyReports(
    userId: AutoIncrementID,
    query: QueryParams,
  ): Promise<Paginated<ContentReportResDto>> {
    const baseQb = this.reportRepo
      .createQueryBuilder('report')
      .where('report.reporterUserId = :userId', { userId });

    const paginated = await QueryBuilder.for(baseQb, query)
      .allowedFilters([
        AllowedFilter.exact('targetType'),
        AllowedFilter.exact('status'),
      ])
      .allowedSorts(['createdAt'])
      .defaultSort('-createdAt')
      .paginate();

    const mapped = paginated.data.map((item) => this.toReportDto(item));
    return new Paginated(mapped, paginated.meta, paginated.links);
  }

  /**
   * Admin: List all violation reports with filtering, searching, and pagination.
   */
  async findAllAdmin(
    query: QueryParams,
  ): Promise<Paginated<ContentReportAdminResDto>> {
    const baseQb = this.reportRepo
      .createQueryBuilder('report')
      .leftJoinAndSelect('report.reporterUser', 'reporter')
      .leftJoinAndSelect('report.resolvedByAdmin', 'admin');

    const paginated = await QueryBuilder.for(baseQb, query)
      .allowedFilters([
        AllowedFilter.exact('targetType'),
        AllowedFilter.exact('status'),
        AllowedFilter.exact('reporterUserId'),
        AllowedFilter.partial('reason'),
        AllowedFilter.callback('search', (qb, value) => {
          const term = Array.isArray(value) ? String(value[0]) : String(value);
          const normalized = term.trim().toLowerCase();
          if (!normalized) return;
          qb.andWhere(
            new Brackets((b) => {
              b.where('LOWER(report.reason) LIKE :sTerm', {
                sTerm: `%${normalized}%`,
              })
                .orWhere('LOWER(report.description) LIKE :sTerm', {
                  sTerm: `%${normalized}%`,
                })
                .orWhere('LOWER(reporter.full_name) LIKE :sTerm', {
                  sTerm: `%${normalized}%`,
                })
                .orWhere('LOWER(reporter.email) LIKE :sTerm', {
                  sTerm: `%${normalized}%`,
                });
            }),
          );
        }),
      ])
      .allowedSorts(['createdAt', 'updatedAt', 'status'])
      .defaultSort('-createdAt')
      .paginate();

    const mapped = paginated.data.map((item) => this.toAdminReportDto(item));
    return new Paginated(mapped, paginated.meta, paginated.links);
  }

  /**
   * Admin: Get a report detail by ID.
   */
  async findOneAdmin(id: AutoIncrementID): Promise<ContentReportAdminResDto> {
    const report = await this.reportRepo
      .createQueryBuilder('report')
      .leftJoinAndSelect('report.reporterUser', 'reporter')
      .leftJoinAndSelect('report.resolvedByAdmin', 'admin')
      .where('report.id = :id', { id })
      .getOne();

    if (!report) {
      throw new NotFoundException(`Report with id ${id} not found`);
    }

    return this.toAdminReportDto(report);
  }

  /**
   * Admin: Resolve or dismiss report.
   */
  async resolveReport(
    id: AutoIncrementID,
    adminId: AutoIncrementID,
    dto: ResolveContentReportReqDto,
  ): Promise<ContentReportAdminResDto> {
    const report = await this.reportRepo.findOne({
      where: { id },
      relations: ['reporterUser', 'resolvedByAdmin'],
    });

    if (!report) {
      throw new NotFoundException(`Report with id ${id} not found`);
    }

    report.status = dto.status;
    report.resolvedByAdminId = adminId;
    report.resolvedAt = new Date();
    if (dto.resolutionNote !== undefined) {
      report.resolutionNote = dto.resolutionNote;
    }

    const saved = await this.reportRepo.save(report);
    return this.findOneAdmin(saved.id);
  }

  private toReportDto(r: ContentReportEntity): ContentReportResDto {
    return {
      id: r.id,
      reporterUserId: r.reporterUserId,
      targetType: r.targetType,
      targetId: r.targetId,
      reason: r.reason,
      description: r.description ?? null,
      status: r.status,
      createdAt: r.createdAt,
    };
  }

  private toAdminReportDto(r: ContentReportEntity): ContentReportAdminResDto {
    return {
      id: r.id,
      reporterUserId: r.reporterUserId,
      reporterName: r.reporterUser?.fullName,
      reporterEmail: r.reporterUser?.email,
      reporterAvatar: r.reporterUser?.avatar ?? null,
      targetType: r.targetType,
      targetId: r.targetId,
      reason: r.reason,
      description: r.description ?? null,
      status: r.status,
      resolvedByAdminId: r.resolvedByAdminId ?? null,
      resolvedByAdminName: r.resolvedByAdmin?.fullName ?? null,
      resolutionNote: r.resolutionNote ?? null,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    };
  }
}
