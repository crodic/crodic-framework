import { AutoIncrementID } from '../../../common/types/common.type';
import { CurrentUser } from '../../../decorators/current-user.decorator';
import { ApiAuth } from '../../../decorators/http.decorators';
import { UserAuthGuard } from '../../../guards/user-auth.guard';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import {
  CreateJobApplicationReqDto,
  CreateJobReqDto,
  UpdateJobReqDto,
} from '../dto/job-req.dto';
import { JobApplicationResDto, JobDetailResDto } from '../dto/job-res.dto';
import { JobService } from '../services/job.service';

@ApiTags('User Jobs & Casting Applications')
@Controller({ path: 'jobs', version: '1' })
@UseGuards(UserAuthGuard)
export class JobUserController {
  constructor(private readonly jobService: JobService) {}

  @Post()
  @ApiAuth({
    type: JobDetailResDto,
    summary: 'Post a new casting call or job opportunity',
    statusCode: HttpStatus.CREATED,
  })
  create(
    @CurrentUser('id') userId: AutoIncrementID,
    @Body() dto: CreateJobReqDto,
  ) {
    return this.jobService.create(userId, dto);
  }

  @Patch(':id')
  @ApiAuth({
    type: JobDetailResDto,
    summary: 'Update a job posting',
  })
  @ApiParam({ name: 'id', type: String })
  update(
    @CurrentUser('id') userId: AutoIncrementID,
    @Param('id') jobId: AutoIncrementID,
    @Body() dto: UpdateJobReqDto,
  ) {
    return this.jobService.update(userId, jobId, dto);
  }

  @Delete(':id')
  @ApiAuth({
    summary: 'Soft-delete a job posting',
    statusCode: HttpStatus.NO_CONTENT,
  })
  @ApiParam({ name: 'id', type: String })
  async delete(
    @CurrentUser('id') userId: AutoIncrementID,
    @Param('id') jobId: AutoIncrementID,
  ) {
    await this.jobService.delete(userId, jobId);
  }

  @Post(':id/apply')
  @ApiAuth({
    type: JobApplicationResDto,
    summary: 'Apply for a job or casting call',
    statusCode: HttpStatus.CREATED,
  })
  @ApiParam({ name: 'id', type: String })
  apply(
    @CurrentUser('id') userId: AutoIncrementID,
    @Param('id') jobId: AutoIncrementID,
    @Body() dto: CreateJobApplicationReqDto,
  ) {
    return this.jobService.apply(userId, jobId, dto);
  }

  @Get('me/applications')
  @ApiAuth({
    type: JobApplicationResDto,
    summary: 'Get all job applications submitted by current user',
  })
  getMyApplications(@CurrentUser('id') userId: AutoIncrementID) {
    return this.jobService.getMyApplications(userId);
  }
}
