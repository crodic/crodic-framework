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
import {
  CreateCountryReqDto,
  UpdateCountryReqDto,
} from '../dto/country.req.dto';
import { CountryResDto } from '../dto/country.res.dto';
import { StateResDto } from '../dto/state.res.dto';
import { CountryService } from '../services/country.service';

@ApiTags('Countries')
@Controller({ path: 'countries', version: '1' })
@UseGuards(AdminAuthGuard, PoliciesGuard)
export class CountryAdminController {
  constructor(private readonly countryService: CountryService) {}

  @Get()
  @ApiAuth({
    type: CountryResDto,
    summary: 'Get paginated list of countries',
    isQueryBuilder: true,
    queryBuilderOptions: {
      sorts: [
        'id',
        'name',
        'iso2',
        'iso3',
        'capital',
        'phonecode',
        'currency',
        'createdAt',
        'updatedAt',
      ],
      defaultSort: 'name',
      filters: ['regionId', 'iso2', 'iso3', 'name'],
    },
  })
  @CheckPolicies((ability: AppAbility) =>
    ability.can(AppActions.Read, AppSubjects.Location),
  )
  findAll(@Query() query: QueryParams): Promise<Paginated<CountryResDto>> {
    return this.countryService.findAll(query);
  }

  @Post()
  @ApiAuth({ type: CountryResDto, summary: 'Create country' })
  @CheckPolicies((ability: AppAbility) =>
    ability.can(AppActions.Create, AppSubjects.Location),
  )
  create(@Body() dto: CreateCountryReqDto): Promise<CountryResDto> {
    return this.countryService.create(dto);
  }

  @Get(':id')
  @ApiAuth({ type: CountryResDto, summary: 'Find country by id' })
  @ApiParam({ name: 'id', type: 'String' })
  @CheckPolicies((ability: AppAbility) =>
    ability.can(AppActions.Read, AppSubjects.Location),
  )
  findOne(@Param('id') id: AutoIncrementID): Promise<CountryResDto> {
    return this.countryService.findOne(id);
  }

  @Get(':id/states')
  @ApiAuth({ type: StateResDto, summary: 'Get states of country' })
  @ApiParam({ name: 'id', type: 'String' })
  @CheckPolicies((ability: AppAbility) =>
    ability.can(AppActions.Read, AppSubjects.Location),
  )
  findStates(@Param('id') id: AutoIncrementID): Promise<StateResDto[]> {
    return this.countryService.findStatesByCountry(id);
  }

  @Put(':id')
  @ApiAuth({ type: CountryResDto, summary: 'Update country' })
  @ApiParam({ name: 'id', type: 'String' })
  @CheckPolicies((ability: AppAbility) =>
    ability.can(AppActions.Update, AppSubjects.Location),
  )
  update(
    @Param('id') id: AutoIncrementID,
    @Body() dto: UpdateCountryReqDto,
  ): Promise<CountryResDto> {
    return this.countryService.update(id, dto);
  }

  @Delete(':id')
  @ApiAuth({ summary: 'Delete country' })
  @ApiParam({ name: 'id', type: 'String' })
  @CheckPolicies((ability: AppAbility) =>
    ability.can(AppActions.Delete, AppSubjects.Location),
  )
  remove(@Param('id') id: AutoIncrementID): Promise<{ message: string }> {
    return this.countryService.remove(id);
  }
}
