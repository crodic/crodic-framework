import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Job } from 'bullmq';
import { Repository } from 'typeorm';
import { EmailLogEntity } from '../../../api/email/entities/email-log.entity';
import {
  EEmailLogSource,
  EEmailLogStatus,
} from '../../../common/constants/entity.enum';
import { AllConfigType } from '../../../config/config.type';
import { ISendMailOptions } from '../../../mail/constants/mail.constant';
import { MailService } from '../../../mail/mail.service';
import {
  EMAIL_QUEUE_NAME,
  SEND_EMAIL_JOB,
} from './constants/email-queue.constant';

@Processor(EMAIL_QUEUE_NAME, {
  concurrency: 1,
  limiter: {
    max: 1,
    duration: 150,
  },
})
export class EmailProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailProcessor.name);

  constructor(
    private readonly mailService: MailService,
    private readonly configService: ConfigService<AllConfigType>,
    @InjectRepository(EmailLogEntity)
    private readonly emailLogRepository: Repository<EmailLogEntity>,
  ) {
    super();
  }

  async process(job: Job<ISendMailOptions, unknown, string>): Promise<unknown> {
    this.logger.debug(
      `Processing email job ${job.id} (name: ${job.name}) to ${Array.isArray(job.data.to) ? job.data.to.join(', ') : job.data.to}`,
    );

    if (job.name === SEND_EMAIL_JOB) {
      const defaultName = this.configService.get('mail.defaultName', {
        infer: true,
      });
      const defaultEmail = this.configService.get('mail.defaultEmail', {
        infer: true,
      });
      const from = defaultName
        ? `"${defaultName}" <${defaultEmail}>`
        : (defaultEmail ?? 'noreply@example.com');
      const recipients = Array.isArray(job.data.to)
        ? job.data.to
        : [job.data.to];
      const source =
        job.data.source ??
        (job.data.createdByAdminId
          ? EEmailLogSource.ADMIN
          : EEmailLogSource.SYSTEM);

      try {
        const result = await this.mailService.sendDirectMail(job.data);

        await this.emailLogRepository.save(
          this.emailLogRepository.create({
            source,
            status: EEmailLogStatus.SENT,
            subject: job.data.subject,
            from,
            to: recipients,
            cc: job.data.cc,
            bcc: job.data.bcc,
            templateName: job.data.template,
            renderedBody: result.html,
            sentAt: new Date(),
            queueJobId: String(job.id),
            jobName: job.name,
            attempts: (job.attemptsMade || 0) + 1,
            createdByAdminId: job.data.createdByAdminId,
          }),
        );

        return result;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);

        await this.emailLogRepository.save(
          this.emailLogRepository.create({
            source,
            status: EEmailLogStatus.FAILED,
            subject: job.data.subject,
            from,
            to: recipients,
            cc: job.data.cc,
            bcc: job.data.bcc,
            templateName: job.data.template,
            failedAt: new Date(),
            errorMessage,
            queueJobId: String(job.id),
            jobName: job.name,
            attempts: (job.attemptsMade || 0) + 1,
            createdByAdminId: job.data.createdByAdminId,
          }),
        );

        throw error;
      }
    }

    throw new Error(`Unknown job name: ${job.name}`);
  }

  @OnWorkerEvent('active')
  onActive(job: Job): void {
    this.logger.debug(`Email job ${job.id} is now active`);
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job): void {
    this.logger.debug(`Email job ${job.id} completed successfully`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error): void {
    this.logger.error(
      `Email job ${job.id} failed with error: ${error.message}`,
      error.stack,
    );
  }
}
