import { AutoIncrementID } from '../../../common/types/common.type';
import { AdminAuthGuard } from '../../../guards/admin-auth.guard';
import { PoliciesGuard } from '../../../guards/policies.guard';
import { Test, TestingModule } from '@nestjs/testing';
import { EEventStatus } from '../constants/event.constant';
import { EventAdminController } from './event-admin.controller';
import { EventService } from '../services/event.service';
import { AiEventCrawlerService } from '../services/ai-event-crawler.service';

const id = (val: string) => val as unknown as AutoIncrementID;

describe('EventAdminController', () => {
  let controller: EventAdminController;
  let service: Partial<Record<keyof EventService, jest.Mock>>;
  let crawlerService: Partial<Record<keyof AiEventCrawlerService, jest.Mock>>;

  beforeEach(async () => {
    service = {
      findAll: jest.fn().mockResolvedValue({ data: [], meta: {} }),
      findById: jest
        .fn()
        .mockResolvedValue({ id: id('1'), title: 'Cosplay Festival' }),
      createEvent: jest
        .fn()
        .mockResolvedValue({ id: id('1'), title: 'Cosplay Festival' }),
      updateEvent: jest
        .fn()
        .mockResolvedValue({ id: id('1'), title: 'Updated' }),
      updateEventStatus: jest
        .fn()
        .mockResolvedValue({ id: id('1'), status: EEventStatus.UPCOMING }),
      deleteEvent: jest.fn().mockResolvedValue(undefined),
    };

    crawlerService = {
      crawlAndSyncEvents: jest.fn().mockResolvedValue({
        success: true,
        totalDiscovered: 2,
        newEventsCreated: 1,
        duplicateEventsSkipped: 1,
        postCreated: true,
        createdEventTitles: ['Cosplay Festival'],
        message: 'Success',
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventAdminController],
      providers: [
        { provide: EventService, useValue: service },
        { provide: AiEventCrawlerService, useValue: crawlerService },
      ],
    })
      .overrideGuard(AdminAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(PoliciesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<EventAdminController>(EventAdminController);
  });

  it('findAll delegates to service', async () => {
    const query: any = {};
    await controller.findAll(query);
    expect(service.findAll).toHaveBeenCalledWith(query);
  });

  it('findOne delegates to service', async () => {
    await controller.findOne(id('1'));
    expect(service.findById).toHaveBeenCalledWith(id('1'));
  });

  it('create delegates to service', async () => {
    const dto: any = { title: 'Cosplay Festival' };
    await controller.create(id('99'), dto);
    expect(service.createEvent).toHaveBeenCalledWith(id('99'), dto);
  });

  it('update delegates to service', async () => {
    const dto: any = { title: 'Updated' };
    await controller.update(id('1'), dto);
    expect(service.updateEvent).toHaveBeenCalledWith(id('1'), dto);
  });

  it('updateStatus delegates to service', async () => {
    const dto = { status: EEventStatus.UPCOMING };
    await controller.updateStatus(id('1'), dto);
    expect(service.updateEventStatus).toHaveBeenCalledWith(id('1'), dto);
  });

  it('remove delegates to service', async () => {
    await controller.remove(id('1'));
    expect(service.deleteEvent).toHaveBeenCalledWith(id('1'));
  });

  it('triggerAiCrawl delegates to aiCrawlerService', async () => {
    const result = await controller.triggerAiCrawl();
    expect(crawlerService.crawlAndSyncEvents).toHaveBeenCalled();
    expect(result.success).toBe(true);
  });
});
