import { AutoIncrementID } from '../../../common/types/common.type';
import { UserAuthGuard } from '../../../guards/user-auth.guard';
import { Test, TestingModule } from '@nestjs/testing';
import { EventPublicController } from './event-public.controller';
import { EventService } from '../services/event.service';

const id = (val: string) => val as unknown as AutoIncrementID;

describe('EventPublicController', () => {
  let controller: EventPublicController;
  let service: Partial<Record<keyof EventService, jest.Mock>>;

  beforeEach(async () => {
    service = {
      findAll: jest.fn().mockResolvedValue({ data: [], meta: {} }),
      findBySlug: jest.fn().mockResolvedValue({
        id: id('1'),
        slug: 'winter-fest',
        title: 'Winter Fest',
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventPublicController],
      providers: [{ provide: EventService, useValue: service }],
    })
      .overrideGuard(UserAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<EventPublicController>(EventPublicController);
  });

  it('findAll delegates to service with publicOnly option', async () => {
    await controller.findAll({}, id('100'));
    expect(service.findAll).toHaveBeenCalledWith({}, id('100'), {
      publicOnly: true,
    });
  });

  it('findBySlug delegates to service', async () => {
    const res = await controller.findBySlug('winter-fest', id('100'));
    expect(res.slug).toBe('winter-fest');
    expect(service.findBySlug).toHaveBeenCalledWith('winter-fest', id('100'));
  });
});
