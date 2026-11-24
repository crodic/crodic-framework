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
import { CreateCityReqDto, UpdateCityReqDto } from '../dto/city.req.dto';
import { CityResDto } from '../dto/city.res.dto';
import { CityService } from '../services/city.service';

@ApiTags('Cities')
@Controller({ path: 'cities', version: '1' })
@UseGuards(AdminAuthGuard, PoliciesGuard)
export class CityAdminController {
  constructor(private readonly cityService: CityService) {}

  @Get()
  @ApiAuth({
    type: CityResDto,
    summary: 'Get paginated list of cities',
    isQueryBuilder: true,
    queryBuilderOptions: {
      sorts: [
        'id',
        'name',
        'stateId',
        'stateCode',
        'countryId',
        'countryCode',
        'code',
        'createdAt',
        'updatedAt',
      ],
      defaultSort: 'name',
      filters: [
        'stateId',
        'countryId',
        'countryCode',
        'stateCode',
        'code',
        'name',
      ],
    },
  })
  @CheckPolicies((ability: AppAbility) =>
    ability.can(AppActions.Read, AppSubjects.Location),
  )
  findAll(@Query() query: QueryParams): Promise<Paginated<CityResDto>> {
    return this.cityService.findAll(query);
  }

  @Post()
  @ApiAuth({ type: CityResDto, summary: 'Create city' })
  @CheckPolicies((ability: AppAbility) =>
    ability.can(AppActions.Create, AppSubjects.Location),
  )
  create(@Body() dto: CreateCityReqDto): Promise<CityResDto> {
    return this.cityService.create(dto);
  }

  @Get(':id')
  @ApiAuth({ type: CityResDto, summary: 'Find city by id' })
  @ApiParam({ name: 'id', type: 'String' })
  @CheckPolicies((ability: AppAbility) =>
    ability.can(AppActions.Read, AppSubjects.Location),
  )
  findOne(@Param('id') id: AutoIncrementID): Promise<CityResDto> {
    return this.cityService.findOne(id);
  }

  @Put(':id')
  @ApiAuth({ type: CityResDto, summary: 'Update city' })
  @ApiParam({ name: 'id', type: 'String' })
  @CheckPolicies((ability: AppAbility) =>
    ability.can(AppActions.Update, AppSubjects.Location),
  )
  update(
    @Param('id') id: AutoIncrementID,
    @Body() dto: UpdateCityReqDto,
  ): Promise<CityResDto> {
    return this.cityService.update(id, dto);
  }

  @Delete(':id')
  @ApiAuth({ summary: 'Delete city' })
  @ApiParam({ name: 'id', type: 'String' })
  @CheckPolicies((ability: AppAbility) =>
    ability.can(AppActions.Delete, AppSubjects.Location),
  )
  remove(@Param('id') id: AutoIncrementID): Promise<{ message: string }> {
    return this.cityService.remove(id);
  }
}
