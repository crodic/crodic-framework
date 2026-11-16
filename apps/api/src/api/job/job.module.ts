import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobEntity } from './entities/job.entity';
import { JobApplicationEntity } from './entities/job-application.entity';

@Module({
  imports: [TypeOrmModule.forFeature([JobEntity, JobApplicationEntity])],
  exports: [TypeOrmModule],
})
export class JobModule {}
