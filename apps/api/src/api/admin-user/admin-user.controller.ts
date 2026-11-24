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
  HttpStatus,
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
import { AdminUserService } from './admin-user.service';
import { AdminUserResDto } from './dto/admin-user.res.dto';
import { CreateAdminUserReqDto } from './dto/create-admin-user.req.dto';
import { UpdateAdminUserReqDto } from './dto/update-admin-user.req.dto';

@ApiTags('Admin Users')
@Controller({
  path: 'admin-users',
  version: '1',
})
@UseGuards(AdminAuthGuard, PoliciesGuard)
export class AdminUserController {
  constructor(private readonly adminUserService: AdminUserService) {}

  @Get()
  @ApiAuth({
    type: AdminUserResDto,
    summary: 'Find all users',
    description: 'Admin can find all users in the system with pagination',
    isQueryBuilder: true,
    queryBuilderOptions: {
      sorts: ['id', 'email', 'createdAt', 'updatedAt'],
      defaultSort: '-id',
      filters: [
        'email',
        'fullName',
        'search',
        AllowedFilter.exact('roles.id'),
        AllowedFilter.trashed(),
        AllowedFilter.callback('verifiedAt', () => {}),
        AllowedFilter.callback('verified', () => {}),
      ],
    },
  })
  @CheckPolicies((ability: AppAbility) =>
    ability.can(AppActions.Read, AppSubjects.Admin),
  )
  findAll(@Query() query: QueryParams): Promise<Paginated<AdminUserResDto>> {
    return this.adminUserService.findAllUser(query);
  }

  // --------------------------------------------------

  @Post()
  @ApiAuth({
    type: AdminUserResDto,
    summary: 'Create user',
    statusCode: HttpStatus.CREATED,
  })
  @CheckPolicies((ability: AppAbility) =>
    ability.can(AppActions.Create, AppSubjects.Admin),
  )
  async createUser(
    @Body() createAdminUserDto: CreateAdminUserReqDto,
  ): Promise<AdminUserResDto> {
    return await this.adminUserService.create(createAdminUserDto);
  }

  // --------------------------------------------------

  @Get(':id')
  @ApiAuth({ type: AdminUserResDto, summary: 'Find user by id' })
  @ApiParam({ name: 'id', type: 'String' })
  @CheckPolicies((ability: AppAbility) =>
    ability.can(AppActions.Read, AppSubjects.Admin),
  )
  async findUser(@Param('id') id: AutoIncrementID): Promise<AdminUserResDto> {
    return await this.adminUserService.findOne(id);
  }

  // --------------------------------------------------

  @Put(':id')
  @ApiAuth({ type: AdminUserResDto, summary: 'Update user' })
  @ApiParam({ name: 'id', type: 'String' })
  @CheckPolicies((ability: AppAbility) =>
    ability.can(AppActions.Update, AppSubjects.Admin),
  )
  updateUser(
    @Param('id') id: AutoIncrementID,
    @Body() reqDto: UpdateAdminUserReqDto,
  ) {
    return this.adminUserService.update(id, reqDto);
  }

  // --------------------------------------------------

  @Post(':id/resend-verification')
  @ApiAuth({
    summary: 'Resend verification email to admin user',
    statusCode: HttpStatus.OK,
  })
  @ApiParam({ name: 'id', type: 'String' })
  @CheckPolicies((ability: AppAbility) =>
    ability.can(AppActions.Update, AppSubjects.Admin),
  )
  async resendVerification(
    @Param('id') id: AutoIncrementID,
  ): Promise<{ message: string }> {
    return await this.adminUserService.resendVerification(id);
  }

  // --------------------------------------------------

  @Delete(':id')
  @ApiAuth({
    summary: 'Delete user',
    errorResponses: [400, 401, 403, 404, 500],
  })
  @ApiParam({ name: 'id', type: 'String' })
  @CheckPolicies((ability: AppAbility) =>
    ability.can(AppActions.Delete, AppSubjects.Admin),
  )
  removeUser(@Param('id') id: AutoIncrementID) {
    return this.adminUserService.remove(id);
  }

  // --------------------------------------------------

  @Post(':id/restore')
  @ApiAuth({
    summary: 'Restore a soft-deleted admin user',
    statusCode: HttpStatus.OK,
    type: AdminUserResDto,
    errorResponses: [400, 401, 403, 404, 409, 500],
  })
  @ApiParam({ name: 'id', type: 'String' })
  @CheckPolicies((ability: AppAbility) =>
    ability.can(AppActions.Update, AppSubjects.Admin),
  )
  restoreUser(@Param('id') id: AutoIncrementID): Promise<AdminUserResDto> {
    return this.adminUserService.restore(id);
  }
}
