import { AutoIncrementID } from '../../common/types/common.type';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import {
  AllowedFilter,
  Paginated,
  QueryBuilder,
  QueryParams,
} from '../../common/query-builder';
import { Repository } from 'typeorm';
import { EmailLogResDto } from './dto/email-log.res.dto';
import { EmailLogEntity } from './entities/email-log.entity';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    @InjectRepository(EmailLogEntity)
    private readonly emailLogRepository: Repository<EmailLogEntity>,
  ) {}

  async findAll(
    query: QueryParams,
    filter: Partial<EmailLogEntity> = {},
  ): Promise<Paginated<EmailLogResDto>> {
    const qb = this.emailLogRepository
      .createQueryBuilder('emailLog')
      .leftJoinAndSelect('emailLog.createdByAdmin', 'createdByAdmin');

    if (filter.createdByAdminId) {
      qb.andWhere('emailLog.createdByAdminId = :createdByAdminId', {
        createdByAdminId: filter.createdByAdminId,
      });
    }

    const result = await QueryBuilder.for(qb, query)
      .allowedFilters([
        AllowedFilter.exact('status'),
        AllowedFilter.exact('source'),
        AllowedFilter.exact('createdByAdminId'),
        AllowedFilter.partial('subject'),
        AllowedFilter.callback('to', (builder, value) => {
          builder.andWhere('CAST(emailLog.to AS TEXT) ILIKE :toSearch', {
            toSearch: `%${value}%`,
          });
        }),
        AllowedFilter.callback('search', (builder, value) => {
          builder.andWhere(
            '(emailLog.subject ILIKE :search OR CAST(emailLog.to AS TEXT) ILIKE :search)',
            { search: `%${value}%` },
          );
        }),
      ])
      .allowedSorts(['id', 'createdAt', 'scheduledAt', 'sentAt', 'status'])
      .defaultSort('-createdAt')
      .paginate();

    return new Paginated(
      plainToInstance(EmailLogResDto, result.data, {
        excludeExtraneousValues: true,
      }),
      result.meta,
      result.links,
    );
  }

  async findOne(id: AutoIncrementID): Promise<EmailLogResDto> {
    const emailLog = await this.emailLogRepository.findOne({
      where: { id },
      relations: ['createdByAdmin'],
    });

    if (!emailLog) {
      throw new NotFoundException('Email log not found');
    }

    return plainToInstance(EmailLogResDto, emailLog, {
      excludeExtraneousValues: true,
    });
  }
}
