import { AllowedFilter, QueryParams } from '../../../common/query-builder';
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
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import {
  CreateTagCategoryReqDto,
  UpdateTagCategoryReqDto,
} from '../dto/tag-category-req.dto';
import { TagCategoryResDto } from '../dto/tag-category-res.dto';
import { TagCategoryService } from '../services/tag-category.service';

@ApiTags('Admin Tag Categories')
@Controller({ path: 'tag-categories', version: '1' })
@UseGuards(AdminAuthGuard, PoliciesGuard)
export class TagCategoryAdminController {
  constructor(private readonly tagCategoryService: TagCategoryService) {}

  @Get()
  @ApiAuth({
    type: TagCategoryResDto,
    summary: 'List all tag categories with filtering and sorting',
    isQueryBuilder: true,
    queryBuilderOptions: {
      filters: [
        'name',
        'slug',
        'search',
        AllowedFilter.exact('isActive'),
        AllowedFilter.exact('isSystem'),
        AllowedFilter.trashed(),
      ],
      sorts: ['sortOrder', 'name', 'createdAt', 'updatedAt'],
      defaultSort: 'sortOrder',
    },
  })
  @CheckPolicies((ability: AppAbility) =>
    ability.can(AppActions.Read, AppSubjects.Tag),
  )
  findAll(@Query() query: QueryParams) {
    return this.tagCategoryService.findAll(query);
  }

  @Get(':id')
  @ApiAuth({
    type: TagCategoryResDto,
    summary: 'Get tag category by ID',
  })
  @ApiParam({ name: 'id', type: 'String' })
  @CheckPolicies((ability: AppAbility) =>
    ability.can(AppActions.Read, AppSubjects.Tag),
  )
  findOne(@Param('id') id: AutoIncrementID) {
    return this.tagCategoryService.findById(id);
  }

  @Post()
  @ApiAuth({
    type: TagCategoryResDto,
    summary: 'Create a new tag category',
  })
  @CheckPolicies((ability: AppAbility) =>
    ability.can(AppActions.Create, AppSubjects.Tag),
  )
  create(@Body() dto: CreateTagCategoryReqDto) {
    return this.tagCategoryService.create(dto);
  }

  @Patch(':id')
  @ApiAuth({
    type: TagCategoryResDto,
    summary: 'Update tag category metadata',
  })
  @ApiParam({ name: 'id', type: 'String' })
  @CheckPolicies((ability: AppAbility) =>
    ability.can(AppActions.Update, AppSubjects.Tag),
  )
  update(
    @Param('id') id: AutoIncrementID,
    @Body() dto: UpdateTagCategoryReqDto,
  ) {
    return this.tagCategoryService.update(id, dto);
  }

  @Delete(':id')
  @ApiAuth({ summary: 'Soft-delete a non-system tag category' })
  @ApiParam({ name: 'id', type: 'String' })
  @CheckPolicies((ability: AppAbility) =>
    ability.can(AppActions.Delete, AppSubjects.Tag),
  )
  delete(@Param('id') id: AutoIncrementID) {
    return this.tagCategoryService.delete(id);
  }
}
