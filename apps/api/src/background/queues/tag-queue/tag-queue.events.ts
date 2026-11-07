import {
  OnQueueEvent,
  QueueEventsHost,
  QueueEventsListener,
} from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { QueueName } from '../../../common/constants/job.constant';

@QueueEventsListener(QueueName.TAG)
export class TagQueueEvents extends QueueEventsHost {
  private readonly logger = new Logger(TagQueueEvents.name);

  @OnQueueEvent('completed')
  onCompleted(job: { jobId: string }) {
    this.logger.debug(`Tag queue job ${job.jobId} completed`);
  }

  @OnQueueEvent('failed')
  onFailed(job: { jobId: string; failedReason: string }) {
    this.logger.error(`Tag queue job ${job.jobId} failed: ${job.failedReason}`);
  }
}
