import { AutoIncrementID } from '../../common/types/common.type';
import { EEmailLogSource } from '../../common/constants/entity.enum';

export * from '../../background/queues/email-queue/constants/email-queue.constant';

export interface ISendMailOptions {
  to: string | string[];
  subject: string;
  template: string;
  context: Record<string, unknown>;
  cc?: string[];
  bcc?: string[];
  attachments?: Record<string, unknown>[];
  createdByAdminId?: AutoIncrementID;
  source?: EEmailLogSource;
}
