import { AutoIncrementID } from '../../../common/types/common.type';
import { ApiAuth } from '../../../decorators/http.decorators';
import { CheckPolicies } from '../../../decorators/policies.decorator';
import { AdminAuthGuard } from '../../../guards/admin-auth.guard';
import { PoliciesGuard } from '../../../guards/policies.guard';
import { AppAbility } from '../../../shared/casl/ability.factory';
import { AppActions, AppSubjects } from '../../../utils/permissions.constant';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { Paginated, QueryParams } from '../../../common/query-builder';
import { CreateRegionReqDto, UpdateRegionReqDto } from '../dto/region.req.dto';
import { RegionResDto } from '../dto/region.res.dto';
import { RegionService } from '../services/region.service';

@ApiTags('Regions')
@Controller({ path: 'regions', version: '1' })
@UseGuards(AdminAuthGuard, PoliciesGuard)
export class RegionAdminController {
  constructor(private readonly regionService: RegionService) {}

  @Get()
  @ApiAuth({
    type: RegionResDto,
    summary: 'Get paginated list of regions',
    isQueryBuilder: true,
    queryBuilderOptions: {
      sorts: ['id', 'name', 'createdAt', 'updatedAt'],
      defaultSort: 'name',
      filters: ['name'],
    },
  })
  @CheckPolicies((ability: AppAbility) =>
    ability.can(AppActions.Read, AppSubjects.Location),
  )
  findAll(@Query() query: QueryParams): Promise<Paginated<RegionResDto>> {
    return this.regionService.findAll(query);
  }

  @Post()
  @ApiAuth({ type: RegionResDto, summary: 'Create region' })
  @CheckPolicies((ability: AppAbility) =>
    ability.can(AppActions.Create, AppSubjects.Location),
  )
  create(@Body() dto: CreateRegionReqDto): Promise<RegionResDto> {
    return this.regionService.create(dto);
  }

  @Get(':id')
  @ApiAuth({ type: RegionResDto, summary: 'Find region by id' })
  @ApiParam({ name: 'id', type: 'String' })
  @CheckPolicies((ability: AppAbility) =>
    ability.can(AppActions.Read, AppSubjects.Location),
  )
  findOne(@Param('id') id: AutoIncrementID): Promise<RegionResDto> {
    return this.regionService.findOne(id);
  }

  @Put(':id')
  @ApiAuth({ type: RegionResDto, summary: 'Update region' })
  @ApiParam({ name: 'id', type: 'String' })
  @CheckPolicies((ability: AppAbility) =>
    ability.can(AppActions.Update, AppSubjects.Location),
  )
  update(
    @Param('id') id: AutoIncrementID,
    @Body() dto: UpdateRegionReqDto,
  ): Promise<RegionResDto> {
    return this.regionService.update(id, dto);
  }

  @Delete(':id')
  @ApiAuth({ summary: 'Delete region' })
  @ApiParam({ name: 'id', type: 'String' })
  @CheckPolicies((ability: AppAbility) =>
    ability.can(AppActions.Delete, AppSubjects.Location),
  )
  remove(@Param('id') id: AutoIncrementID): Promise<{ message: string }> {
    return this.regionService.remove(id);
  }
}
