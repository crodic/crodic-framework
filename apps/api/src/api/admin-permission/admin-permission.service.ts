import { AutoIncrementID } from '../../common/types/common.type';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import {
  AllowedFilter,
  Paginated,
  QueryBuilder,
  QueryParams,
} from '../../common/query-builder';
import { Not, Repository } from 'typeorm';
import { AdminPermissionResDto } from './dto/admin-permission.res.dto';
import { UpdatePermissionReqDto } from './dto/update-permission.req.dto';
import { AdminPermissionEntity } from './entities/admin-permission.entity';
import { FULL_ACCESS_PERMISSION_KEY, syncPermissions } from './permission-sync';

@Injectable()
export class AdminPermissionService implements OnModuleInit {
  private isSynced = false;

  constructor(
    @InjectRepository(AdminPermissionEntity)
    private readonly permissionRepository: Repository<AdminPermissionEntity>,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.ensureSynced();
  }

  private async ensureSynced(): Promise<void> {
    if (this.isSynced) {
      return;
    }
    await syncPermissions(this.permissionRepository);
    this.isSynced = true;
  }

  async formOptions(): Promise<AdminPermissionResDto[]> {
    await this.ensureSynced();

    const permissions = await this.permissionRepository.find({
      where: {
        key: Not(FULL_ACCESS_PERMISSION_KEY),
      },
      order: {
        key: 'ASC',
      },
    });

    return plainToInstance(AdminPermissionResDto, permissions, {
      excludeExtraneousValues: true,
    });
  }

  async findAll(query: QueryParams): Promise<Paginated<AdminPermissionResDto>> {
    await this.ensureSynced();

    const queryBuilder =
      this.permissionRepository.createQueryBuilder('permission');

    const result = await QueryBuilder.for(queryBuilder, query)
      .allowedFilters([
        AllowedFilter.partial('key'),
        AllowedFilter.partial('name'),
        AllowedFilter.partial('group'),
        AllowedFilter.callback('search', (qb, value) => {
          qb.andWhere(
            '(permission.key ILIKE :search OR permission.name ILIKE :search OR permission.group ILIKE :search OR permission.description ILIKE :search)',
            { search: `%${value}%` },
          );
        }),
      ])
      .allowedSorts(['id', 'key', 'name', 'group', 'createdAt', 'updatedAt'])
      .defaultSort('id')
      .paginate();

    return new Paginated(
      plainToInstance(AdminPermissionResDto, result.data, {
        excludeExtraneousValues: true,
      }),
      result.meta,
      result.links,
    );
  }

  async findOne(id: AutoIncrementID): Promise<AdminPermissionResDto> {
    const permission = await this.permissionRepository.findOneOrFail({
      where: { id },
    });

    return plainToInstance(AdminPermissionResDto, permission, {
      excludeExtraneousValues: true,
    });
  }

  async update(
    id: AutoIncrementID,
    dto: UpdatePermissionReqDto,
  ): Promise<AdminPermissionResDto> {
    const permission = await this.permissionRepository.findOneOrFail({
      where: { id },
    });

    Object.assign(permission, {
      group: dto.group,
      description: dto.description,
    });

    const savedPermission = await this.permissionRepository.save(permission);

    return plainToInstance(AdminPermissionResDto, savedPermission, {
      excludeExtraneousValues: true,
    });
  }
}
