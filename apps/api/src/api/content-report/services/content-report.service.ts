import {
  AllowedFilter,
  QueryBuilder,
  QueryParams,
} from '../../../common/query-builder';
import { Paginated } from '../../../common/dto/offset-pagination/paginated.dto';
import { AutoIncrementID } from '../../../common/types/common.type';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EReportStatus } from '../constants/content-report.constant';
import { CreateContentReportReqDto } from '../dto/content-report-req.dto';
import { ContentReportResDto } from '../dto/content-report-res.dto';
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
}
