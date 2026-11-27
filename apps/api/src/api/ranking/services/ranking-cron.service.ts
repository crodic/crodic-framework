import { Injectable, Logger } from '@nestjs/common';
import { RankingService } from './ranking.service';

@Injectable()
export class RankingCronService {
  private readonly logger = new Logger(RankingCronService.name);

  constructor(private readonly rankingService: RankingService) {}

  /**
   * Weekly Cron: Runs every Monday at 00:00 (Midnight)
   */
  async handleWeeklyRankingSnapshot() {
    this.logger.log('Weekly Ranking Snapshot Cron triggered.');
    const settings = await this.rankingService.getSettings();
    if (!settings.enableCronJob) {
      this.logger.log('Ranking Cron Job is disabled in settings. Skipping.');
      return;
    }

    try {
      const result = await this.rankingService.triggerSnapshotRecalculate();
      const log =
        result.failedCategories.length > 0
          ? this.logger.error.bind(this.logger)
          : this.logger.log.bind(this.logger);
      log(`Weekly Ranking Snapshot: ${result.message}`);
    } catch (err: any) {
      this.logger.error(
        `Weekly Ranking Snapshot failed: ${err.message}`,
        err.stack,
      );
    }
  }

  /**
   * Monthly Cron: Runs on the 1st of every month at 00:00
   */
  async handleMonthlyRankingSnapshot() {
    this.logger.log('Monthly Ranking Snapshot Cron triggered.');
    const settings = await this.rankingService.getSettings();
    if (!settings.enableCronJob) {
      this.logger.log('Ranking Cron Job is disabled in settings. Skipping.');
      return;
    }

    try {
      const result = await this.rankingService.triggerSnapshotRecalculate();
      const log =
        result.failedCategories.length > 0
          ? this.logger.error.bind(this.logger)
          : this.logger.log.bind(this.logger);
      log(`Monthly Ranking Snapshot: ${result.message}`);
    } catch (err: any) {
      this.logger.error(
        `Monthly Ranking Snapshot failed: ${err.message}`,
        err.stack,
      );
    }
  }
}
