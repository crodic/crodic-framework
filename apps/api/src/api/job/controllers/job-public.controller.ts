import { AllowedFilter, QueryParams } from '../../../common/query-builder';
import { AuthOptional } from '../../../decorators/auth-optional.decorator';
import { CurrentUser } from '../../../decorators/current-user.decorator';
import { ApiPublic } from '../../../decorators/http.decorators';
import { AutoIncrementID } from '../../../common/types/common.type';
import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { JobDetailResDto, JobSummaryResDto } from '../dto/job-res.dto';
import { JobService } from '../services/job.service';

@ApiTags('Public Cosplay Jobs & Casting Calls')
@Controller({ path: 'public/jobs', version: '1' })
export class JobPublicController {
  constructor(private readonly jobService: JobService) {}

  @Get()
  @AuthOptional()
  @ApiPublic({
    type: JobSummaryResDto,
    summary: 'Browse and search cosplay recruitment & casting calls',
    isQueryBuilder: true,
    queryBuilderOptions: {
      filters: [
        'title',
        'brandName',
        'locationLabel',
        'search',
        AllowedFilter.exact('categoryCode'),
        AllowedFilter.exact('locationFilterCode'),
        AllowedFilter.exact('cityId'),
        AllowedFilter.exact('brandId'),
        AllowedFilter.exact('status'),
        AllowedFilter.exact('isFeatured'),
      ],
      sorts: ['createdAt', 'applicationsCount', 'deadlineAt'],
      defaultSort: '-createdAt',
    },
  })
  findAll(
    @Query() query: QueryParams,
    @CurrentUser('id') currentUserId?: AutoIncrementID,
  ) {
    return this.jobService.findAll(query, currentUserId);
  }

  @Get(':slug')
  @AuthOptional()
  @ApiPublic({
    type: JobDetailResDto,
    summary: 'Get full job posting description, requirements & perks by slug',
  })
  @ApiParam({
    name: 'slug',
    type: String,
    example: 'hoyoverse-official-cosplayer-tgs-2024',
  })
  findBySlug(
    @Param('slug') slug: string,
    @CurrentUser('id') currentUserId?: AutoIncrementID,
  ) {
    return this.jobService.findBySlug(slug, currentUserId);
  }
}
