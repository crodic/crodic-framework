import { AutoIncrementID } from '../../common/types/common.type';
import { ApiAuth } from '../../decorators/http.decorators';
import { CheckPolicies } from '../../decorators/policies.decorator';
import { AdminAuthGuard } from '../../guards/admin-auth.guard';
import { PoliciesGuard } from '../../guards/policies.guard';
import { AppAbility } from '../../shared/casl/ability.factory';
import { AppActions, AppSubjects } from '../../utils/permissions.constant';
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
import {
  AllowedFilter,
  Paginated,
  QueryParams,
} from '../../common/query-builder';
import { CreateAdminRoleReqDto } from './dto/create-admin-role.req.dto';
import { AdminRoleResDto } from './dto/admin-role.res.dto';
import { UpdateAdminRoleReqDto } from './dto/update-admin-role.req.dto';
import { AdminRoleService } from './admin-role.service';

@ApiTags('Admin Roles')
@Controller({ path: ['admin/roles', 'roles'], version: '1' })
@UseGuards(AdminAuthGuard, PoliciesGuard)
export class AdminRoleController {
  constructor(private readonly roleService: AdminRoleService) {}

  @Get()
  @ApiAuth({
    type: AdminRoleResDto,
    summary: 'Get all admin roles',
    description: 'Return all admin roles',
    errorResponses: [404, 400, 401, 403],
    statusCode: 200,
    isQueryBuilder: true,
    queryBuilderOptions: {
      sorts: ['id', 'name', 'description', 'createdAt', 'updatedAt'],
      defaultSort: '-id',
      filters: ['name', 'search', AllowedFilter.partial('name')],
    },
  })
  @CheckPolicies((ability: AppAbility) =>
    ability.can(AppActions.Read, AppSubjects.Role),
  )
  findAll(@Query() query: QueryParams): Promise<Paginated<AdminRoleResDto>> {
    return this.roleService.findAll(query);
  }

  @Post()
  @ApiAuth()
  @CheckPolicies((ability: AppAbility) =>
    ability.can(AppActions.Create, AppSubjects.Role),
  )
  async create(
    @Body() reqDto: CreateAdminRoleReqDto,
  ): Promise<AdminRoleResDto> {
    return await this.roleService.create(reqDto);
  }

  @Get('form-options')
  @ApiAuth({
    type: AdminRoleResDto,
    summary: 'List all admin roles',
  })
  @CheckPolicies(
    (ability: AppAbility) => ability.can(AppActions.Read, AppSubjects.Role),
    (ability: AppAbility) => ability.can(AppActions.Read, AppSubjects.Admin),
  )
  roleFormOptions(): Promise<AdminRoleResDto[]> {
    return this.roleService.formOptions();
  }

  @Get(':id')
  @ApiAuth({ type: AdminRoleResDto, summary: 'Find admin role by id' })
  @ApiParam({ name: 'id', type: 'String' })
  @CheckPolicies((ability: AppAbility) =>
    ability.can(AppActions.Read, AppSubjects.Role),
  )
  findOne(@Param('id') id: AutoIncrementID): Promise<AdminRoleResDto> {
    return this.roleService.findOne(id);
  }

  @Put(':id')
  @ApiAuth({ type: AdminRoleResDto, summary: 'Update admin role' })
  @ApiParam({ name: 'id', type: 'String' })
  @CheckPolicies((ability: AppAbility) =>
    ability.can(AppActions.Update, AppSubjects.Role),
  )
  update(
    @Param('id') id: AutoIncrementID,
    @Body() updateRoleDto: UpdateAdminRoleReqDto,
  ): Promise<AdminRoleResDto> {
    return this.roleService.update(id, updateRoleDto);
  }

  @Delete(':id')
  @ApiAuth({
    summary: 'Delete admin role',
    errorResponses: [400, 401, 403, 404, 500],
  })
  @CheckPolicies((ability: AppAbility) =>
    ability.can(AppActions.Delete, AppSubjects.Role),
  )
  @ApiParam({ name: 'id', type: 'String' })
  remove(@Param('id') id: AutoIncrementID): Promise<void> {
    return this.roleService.remove(id);
  }
}
