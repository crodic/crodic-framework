import { JobName, QueueName } from '../../../common/constants/job.constant';
import { AutoIncrementID } from '../../../common/types/common.type';
import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';
import { TagService } from './tag.service';

export interface TagMergeJobPayload {
  sourceTagId: AutoIncrementID;
  targetTagId: AutoIncrementID;
  adminId?: AutoIncrementID | null;
}

export interface TagCounterReconcileJobPayload {
  tagIds?: AutoIncrementID[];
}

@Injectable()
export class TagQueueService {
  private readonly logger = new Logger(TagQueueService.name);

  constructor(
    @InjectQueue(QueueName.TAG)
    private readonly tagQueue: Queue,
    private readonly tagService: TagService,
  ) {}

  /**
   * Dispatches a tag merge operation via BullMQ, falling back to direct atomic execution
   * when Redis queue workers are unavailable.
   */
  async dispatchMerge(
    payload: TagMergeJobPayload,
  ): Promise<{ queued: boolean }> {
    // Perform synchronous execution for modest datasets or fallback if queue fails
    const preview = await this.tagService.previewMerge(
      payload.sourceTagId,
      payload.targetTagId,
    );

    if (preview.affectedEntityTagsCount <= 5000) {
      await this.tagService.executeMerge(
        payload.sourceTagId,
        payload.targetTagId,
        payload.adminId,
      );
      return { queued: false };
    }

    try {
      await this.tagQueue.add(JobName.TAG_MERGE, payload, {
        attempts: 3,
        backoff: { type: 'exponential', delay: 3000 },
        removeOnComplete: true,
        removeOnFail: false,
      });
      return { queued: true };
    } catch (err) {
      this.logger.warn(
        `Queue unavailable, executing tag merge inline: ${err instanceof Error ? err.message : String(err)}`,
      );
      await this.tagService.executeMerge(
        payload.sourceTagId,
        payload.targetTagId,
        payload.adminId,
      );
      return { queued: false };
    }
  }

  async scheduleHourlyMaintenance(): Promise<void> {
    try {
      // Reconcile usage counters first
      await this.tagQueue.add(
        JobName.TAG_COUNTER_RECONCILE,
        {},
        {
          attempts: 3,
          backoff: { type: 'exponential', delay: 2000 },
          removeOnComplete: true,
        },
      );
      // Refresh trending scores after counters have been reconciled
      await this.tagQueue.add(
        JobName.TAG_TRENDING_REFRESH,
        {},
        {
          attempts: 3,
          backoff: { type: 'exponential', delay: 2000 },
          removeOnComplete: true,
          delay: 3000,
        },
      );
    } catch {
      // Non-blocking cron enqueue
    }
  }
}
