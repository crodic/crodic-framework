import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { QueueName } from '../common/constants/job.constant';
import { HealthController } from './health.controller';

@Module({
  imports: [
    TerminusModule,
    BullModule.registerQueue(
      {
        name: QueueName.EMAIL,
      },
      {
        name: QueueName.FILE,
      },
      {
        name: QueueName.TAG,
      },
    ),
  ],
  controllers: [HealthController],
})
export class HealthModule {}
