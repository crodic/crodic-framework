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
  Patch,
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
import { CreateUserReqDto } from './dto/create-user.req.dto';
import {
  HandleCosplayerRequestReqDto,
  UpdateUserReqDto,
} from './dto/update-user.req.dto';
import { UserResDto } from './dto/user.res.dto';
import { UserService } from './user.service';

@ApiTags('Users')
@Controller({
  path: 'users',
  version: '1',
})
@UseGuards(AdminAuthGuard, PoliciesGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiAuth({
    type: UserResDto,
    summary: 'Get paginated list of users',
    description: `Retrieve a paginated list of users for Admin.

Features:
- Pagination (page, limit)
- Full-text search on: email, id, fullName
- Sorting on: id, email, createdAt, updatedAt (default: id DESC)
- Advanced filters:
  • createdAt: BETWEEN, GTE, LTE
  • email: ILIKE
  • fullName: ILIKE
  • id: EQ

Response includes paginated data, metadata, and navigation links.`,
    isQueryBuilder: true,
    queryBuilderOptions: {
      sorts: ['id', 'email', 'createdAt', 'updatedAt'],
      defaultSort: '-id',
      filters: [
        'email',
        'fullName',
        'username',
        'search',
        AllowedFilter.exact('id'),
        AllowedFilter.trashed(),
      ],
    },
  })
  @CheckPolicies((ability: AppAbility) =>
    ability.can(AppActions.Read, AppSubjects.User),
  )
  findAll(@Query() query: QueryParams): Promise<Paginated<UserResDto>> {
    return this.userService.findAllUser(query);
  }

  @Post()
  @ApiAuth({
    type: UserResDto,
    summary: 'Create user',
    statusCode: HttpStatus.CREATED,
  })
  @CheckPolicies((ability: AppAbility) =>
    ability.can(AppActions.Create, AppSubjects.User),
  )
  async createUser(
    @Body() createUserDto: CreateUserReqDto,
  ): Promise<UserResDto> {
    return await this.userService.create(createUserDto);
  }

  @Get(':id')
  @ApiAuth({ type: UserResDto, summary: 'Find user by id' })
  @ApiParam({ name: 'id', type: 'String' })
  @CheckPolicies((ability: AppAbility) =>
    ability.can(AppActions.Read, AppSubjects.User),
  )
  async findUser(@Param('id') id: AutoIncrementID): Promise<UserResDto> {
    return await this.userService.findOne(id);
  }

  @Put(':id')
  @ApiAuth({ type: UserResDto, summary: 'Update user' })
  @ApiParam({ name: 'id', type: 'String' })
  @CheckPolicies((ability: AppAbility) =>
    ability.can(AppActions.Update, AppSubjects.User),
  )
  updateUser(
    @Param('id') id: AutoIncrementID,
    @Body() reqDto: UpdateUserReqDto,
  ) {
    return this.userService.update(id, reqDto);
  }

  @Patch(':id/verify')
  @ApiAuth({
    type: UserResDto,
    summary: 'Toggle email verification status for user',
  })
  @ApiParam({ name: 'id', type: 'String' })
  @CheckPolicies((ability: AppAbility) =>
    ability.can(AppActions.Update, AppSubjects.User),
  )
  toggleVerify(@Param('id') id: AutoIncrementID): Promise<UserResDto> {
    return this.userService.toggleVerify(id);
  }

  @Patch(':id/cosplayer-verify')
  @ApiAuth({
    type: UserResDto,
    summary:
      'Toggle cosplayer verified badge (isVerified) for cosplayer profile',
  })
  @ApiParam({ name: 'id', type: 'String' })
  @CheckPolicies((ability: AppAbility) =>
    ability.can(AppActions.Update, AppSubjects.User),
  )
  toggleCosplayerVerify(@Param('id') id: AutoIncrementID): Promise<UserResDto> {
    return this.userService.toggleCosplayerVerify(id);
  }

  @Patch(':id/cosplayer-request')
  @ApiAuth({
    type: UserResDto,
    summary: 'Approve or reject a user request to become a Cosplayer',
  })
  @ApiParam({ name: 'id', type: 'String' })
  @CheckPolicies((ability: AppAbility) =>
    ability.can(AppActions.Update, AppSubjects.User),
  )
  handleCosplayerRequest(
    @Param('id') id: AutoIncrementID,
    @Body() dto: HandleCosplayerRequestReqDto,
  ): Promise<UserResDto> {
    return this.userService.handleCosplayerRequest(id, dto.approved);
  }

  @Delete(':id/permanent')
  @ApiAuth({
    summary: 'Permanently hard-delete user and all related records',
    errorResponses: [400, 401, 403, 404, 500],
  })
  @ApiParam({ name: 'id', type: 'String' })
  @CheckPolicies((ability: AppAbility) =>
    ability.can(AppActions.Delete, AppSubjects.User),
  )
  hardRemoveUser(@Param('id') id: AutoIncrementID) {
    return this.userService.hardRemove(id);
  }

  @Delete(':id')
  @ApiAuth({
    summary: 'Delete user (soft delete by default, hard delete if hard=true)',
    errorResponses: [400, 401, 403, 404, 500],
  })
  @ApiParam({ name: 'id', type: 'String' })
  @CheckPolicies((ability: AppAbility) =>
    ability.can(AppActions.Delete, AppSubjects.User),
  )
  removeUser(@Param('id') id: AutoIncrementID, @Query('hard') hard?: string) {
    if (hard === 'true' || hard === '1') {
      return this.userService.hardRemove(id);
    }
    return this.userService.remove(id);
  }

  @Post(':id/restore')
  @ApiAuth({
    summary: 'Restore a soft-deleted user',
    statusCode: HttpStatus.OK,
    type: UserResDto,
    errorResponses: [400, 401, 403, 404, 409, 500],
  })
  @ApiParam({ name: 'id', type: 'String' })
  @CheckPolicies((ability: AppAbility) =>
    ability.can(AppActions.Update, AppSubjects.User),
  )
  restoreUser(@Param('id') id: AutoIncrementID): Promise<UserResDto> {
    return this.userService.restore(id);
  }
}
