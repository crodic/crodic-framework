import { Module } from '@nestjs/common';
import { EmailQueueModule } from './queues/email-queue/email-queue.module';
import { FileQueueModule } from './queues/file-queue/file-queue.module';
import { TagQueueModule } from './queues/tag-queue/tag-queue.module';

@Module({
  imports: [EmailQueueModule, FileQueueModule, TagQueueModule],
  exports: [EmailQueueModule, FileQueueModule, TagQueueModule],
})
export class BackgroundModule {}
