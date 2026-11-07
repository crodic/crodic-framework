import { TagModule } from '../../../api/tag/tag.module';
import { QueueName } from '../../../common/constants/job.constant';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { TagQueueEvents } from './tag-queue.events';
import { TagProcessor } from './tag.processor';

@Module({
  imports: [
    TagModule,
    BullModule.registerQueue({
      name: QueueName.TAG,
      streams: {
        events: {
          maxLen: 1000,
        },
      },
    }),
    BullBoardModule.forFeature({
      name: QueueName.TAG,
      adapter: BullMQAdapter,
    }),
  ],
  providers: [TagProcessor, TagQueueEvents],
  exports: [BullModule],
})
export class TagQueueModule {}
