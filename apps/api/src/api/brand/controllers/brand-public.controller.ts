import { AllowedFilter, QueryParams } from '../../../common/query-builder';
import { ApiPublic } from '../../../decorators/http.decorators';
import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { BrandResDto } from '../dto/brand-res.dto';
import { BrandService } from '../services/brand.service';

@ApiTags('Public Brands & Cosplay Studios')
@Controller({ path: 'public/brands', version: '1' })
export class BrandPublicController {
  constructor(private readonly brandService: BrandService) {}

  @Get()
  @ApiPublic({
    type: BrandResDto,
    summary: 'Browse registered partner brands and cosplay studios',
    isQueryBuilder: true,
    queryBuilderOptions: {
      filters: [
        AllowedFilter.partial('name'),
        AllowedFilter.exact('isVerified'),
      ],
      sorts: ['createdAt', 'name'],
      defaultSort: 'name',
    },
  })
  findAll(@Query() query: QueryParams) {
    return this.brandService.findAll(query);
  }

  @Get(':slug')
  @ApiPublic({
    type: BrandResDto,
    summary: 'Get brand profile by slug',
  })
  @ApiParam({ name: 'slug', type: String, example: 'hoyoverse' })
  findBySlug(@Param('slug') slug: string) {
    return this.brandService.findBySlug(slug);
  }
}
