import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobPublicController } from './controllers/job-public.controller';
import { JobUserController } from './controllers/job-user.controller';
import { JobApplicationEntity } from './entities/job-application.entity';
import { JobEntity } from './entities/job.entity';
import { JobService } from './services/job.service';

@Module({
  imports: [TypeOrmModule.forFeature([JobEntity, JobApplicationEntity])],
  controllers: [JobPublicController, JobUserController],
  providers: [JobService],
  exports: [TypeOrmModule, JobService],
})
export class JobModule {}
