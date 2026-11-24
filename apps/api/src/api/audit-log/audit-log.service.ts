import { AutoIncrementID } from '../../common/types/common.type';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import assert from 'assert';
import {
  AllowedFilter,
  Paginated,
  QueryBuilder,
  QueryParams,
} from '../../common/query-builder';
import { LessThan, Repository } from 'typeorm';
import { AuditLogResDto } from './dto/audit-log.res.dto';
import { ActivityLogEntity } from './entities/activity-log.entity';

@Injectable()
export class AuditLogService {
  constructor(
    @InjectRepository(ActivityLogEntity)
    private readonly auditLogRepository: Repository<ActivityLogEntity>,
  ) {}

  async findAll(query: QueryParams): Promise<Paginated<AuditLogResDto>> {
    const qb = this.auditLogRepository.createQueryBuilder('log');

    const result = await QueryBuilder.for(qb, query)
      .allowedFilters([
        AllowedFilter.exact('event'),
        AllowedFilter.exact('logName'),
        AllowedFilter.exact('subjectId'),
        AllowedFilter.exact('causerId'),
        AllowedFilter.exact('batchUuid'),
        AllowedFilter.partial('subjectType'),
        AllowedFilter.partial('causerType'),
        AllowedFilter.partial('description'),
        AllowedFilter.callback('search', (builder, value) => {
          builder.andWhere(
            '(log.description ILIKE :search OR log.subjectType ILIKE :search OR log.causerType ILIKE :search OR log.logName ILIKE :search OR log.event ILIKE :search)',
            { search: `%${value}%` },
          );
        }),
      ])
      .allowedSorts([
        'id',
        'createdAt',
        'logName',
        'event',
        'subjectType',
        'causerType',
      ])
      .defaultSort('-createdAt')
      .paginate();

    return new Paginated(
      plainToInstance(AuditLogResDto, result.data, {
        excludeExtraneousValues: true,
      }),
      result.meta,
      result.links,
    );
  }

  async findOne(id: AutoIncrementID): Promise<AuditLogResDto> {
    assert(id, 'id is required');

    const auditLog = await this.auditLogRepository.findOneBy({ id });

    if (!auditLog) {
      throw new NotFoundException('Activity log not found');
    }

    return plainToInstance(AuditLogResDto, auditLog, {
      excludeExtraneousValues: true,
    });
  }

  async purgeAuditLogsOlderThan7Days() {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    await this.auditLogRepository.delete({ createdAt: LessThan(sevenDaysAgo) });
  }
}
