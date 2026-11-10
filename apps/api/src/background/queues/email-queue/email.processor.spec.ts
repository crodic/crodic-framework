import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { Job } from 'bullmq';
import { EmailLogEntity } from '../../../api/email/entities/email-log.entity';
import { ISendMailOptions } from '../../../mail/constants/mail.constant';
import { MailService } from '../../../mail/mail.service';
import { SEND_EMAIL_JOB } from './constants/email-queue.constant';
import { EmailProcessor } from './email.processor';

describe('EmailProcessor', () => {
  let processor: EmailProcessor;
  let mailService: { sendDirectMail: any };
  let emailLogRepository: { create: any; save: any };
  let configService: { get: any };

  beforeEach(async () => {
    mailService = {
      sendDirectMail: jest.fn(() => Promise.resolve({ html: '<p>test</p>' })),
    };

    emailLogRepository = {
      create: jest.fn((dto) => dto),
      save: jest.fn((entity) => Promise.resolve({ id: '1', ...entity })),
    };

    configService = {
      get: jest.fn((key) => {
        if (key === 'mail.defaultName') return 'Crodic';
        if (key === 'mail.defaultEmail') return 'noreply@crodic.click';
        return undefined;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailProcessor,
        {
          provide: MailService,
          useValue: mailService,
        },
        {
          provide: ConfigService,
          useValue: configService,
        },
        {
          provide: getRepositoryToken(EmailLogEntity),
          useValue: emailLogRepository,
        },
      ],
    }).compile();

    processor = module.get<EmailProcessor>(EmailProcessor);
  });

  it('should be defined', () => {
    expect(processor).toBeDefined();
  });

  it('should call mailService.sendDirectMail when job name is send-email and save email log', async () => {
    const jobData: ISendMailOptions = {
      to: 'user@example.com',
      subject: 'Hello',
      template: 'test',
      context: {},
    };

    const job = {
      id: 'job-1',
      name: SEND_EMAIL_JOB,
      data: jobData,
      attemptsMade: 0,
    } as unknown as Job<ISendMailOptions, unknown, string>;

    const result = await processor.process(job);

    expect(result).toEqual({ html: '<p>test</p>' });
    expect(mailService.sendDirectMail).toHaveBeenCalledWith(jobData);
    expect(emailLogRepository.save).toHaveBeenCalled();
  });

  it('should log failed email when sendDirectMail throws', async () => {
    mailService.sendDirectMail = jest.fn(() =>
      Promise.reject(new Error('SMTP connection error')),
    );

    const jobData: ISendMailOptions = {
      to: 'user@example.com',
      subject: 'Hello',
      template: 'test',
      context: {},
    };

    const job = {
      id: 'job-1',
      name: SEND_EMAIL_JOB,
      data: jobData,
      attemptsMade: 0,
    } as unknown as Job<ISendMailOptions, unknown, string>;

    await expect(processor.process(job)).rejects.toThrow(
      'SMTP connection error',
    );
    expect(emailLogRepository.save).toHaveBeenCalled();
  });

  it('should throw an error when job name is unknown', async () => {
    const job = {
      id: 'job-1',
      name: 'unknown-job',
      data: { to: 'user@example.com' },
    } as unknown as Job<ISendMailOptions, unknown, string>;

    await expect(processor.process(job)).rejects.toThrow(
      'Unknown job name: unknown-job',
    );
  });
});
