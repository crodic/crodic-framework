import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CronJobLogEntity } from './entities/cron-job-log.entity';
import { CronJobService } from './cron-job.service';
import { CronJobController } from './cron-job.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CronJobLogEntity])],
  controllers: [CronJobController],
  providers: [CronJobService],
  exports: [CronJobService],
})
export class CronJobModule {}
