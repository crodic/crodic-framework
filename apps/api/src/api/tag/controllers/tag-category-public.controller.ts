import { ApiPublic } from '../../../decorators/http.decorators';
import { Controller, Get, Param } from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { TagCategoryResDto } from '../dto/tag-category-res.dto';
import { TagCategoryService } from '../services/tag-category.service';

@ApiTags('Public Tag Categories')
@Controller({ path: 'public/tag-categories', version: '1' })
export class TagCategoryPublicController {
  constructor(private readonly tagCategoryService: TagCategoryService) {}

  @Get()
  @ApiPublic({
    type: TagCategoryResDto,
    summary: 'List active tag categories with UI theme tokens and metadata',
  })
  findAll() {
    return this.tagCategoryService.findActiveList();
  }

  @Get(':slug')
  @ApiPublic({
    type: TagCategoryResDto,
    summary: 'Get active tag category details by slug',
  })
  @ApiParam({ name: 'slug', type: 'String', example: 'character' })
  findBySlug(@Param('slug') slug: string) {
    return this.tagCategoryService.findBySlug(slug);
  }
}
