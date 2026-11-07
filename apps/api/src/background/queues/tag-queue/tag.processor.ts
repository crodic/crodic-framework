import {
  TagCounterReconcileJobPayload,
  TagMergeJobPayload,
} from '../../../api/tag/services/tag-queue.service';
import { TagService } from '../../../api/tag/services/tag.service';
import { JobName, QueueName } from '../../../common/constants/job.constant';
import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';

@Processor(QueueName.TAG, {
  concurrency: 2,
})
export class TagProcessor extends WorkerHost {
  private readonly logger = new Logger(TagProcessor.name);

  constructor(private readonly tagService: TagService) {
    super();
  }

  async process(job: Job<unknown, unknown, string>): Promise<unknown> {
    this.logger.debug(`Processing tag job ${job.id} (${job.name})`);

    switch (job.name) {
      case JobName.TAG_MERGE: {
        const data = job.data as TagMergeJobPayload;
        await this.tagService.executeMerge(
          data.sourceTagId,
          data.targetTagId,
          data.adminId,
        );
        return { merged: true };
      }
      case JobName.TAG_COUNTER_RECONCILE: {
        const data = (job.data || {}) as TagCounterReconcileJobPayload;
        await this.tagService.reconcileUsageCounts(data.tagIds);
        return { reconciled: true };
      }
      case JobName.TAG_TRENDING_REFRESH: {
        await this.tagService.refreshTrendingScores();
        return { refreshed: true };
      }
      default:
        throw new Error(`Unsupported tag queue job: ${job.name}`);
    }
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error): void {
    this.logger.error(
      `Tag processor job ${job.id} failed: ${error.message}`,
      error.stack,
    );
  }
}
