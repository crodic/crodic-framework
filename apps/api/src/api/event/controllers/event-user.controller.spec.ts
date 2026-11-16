import { AutoIncrementID } from '../../../common/types/common.type';
import { UserAuthGuard } from '../../../guards/user-auth.guard';
import { Test, TestingModule } from '@nestjs/testing';
import { EventUserController } from './event-user.controller';
import { EventService } from '../services/event.service';

const id = (val: string) => val as unknown as AutoIncrementID;

describe('EventUserController', () => {
  let controller: EventUserController;
  let service: Partial<Record<keyof EventService, jest.Mock>>;

  beforeEach(async () => {
    service = {
      toggleInterest: jest
        .fn()
        .mockResolvedValue({ interested: true, interestedCount: 10 }),
      participate: jest.fn().mockResolvedValue({ participating: true }),
      cancelParticipation: jest.fn().mockResolvedValue(undefined),
      apply: jest.fn().mockResolvedValue({ id: id('1'), status: 'pending' }),
      getMyApplications: jest.fn().mockResolvedValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventUserController],
      providers: [{ provide: EventService, useValue: service }],
    })
      .overrideGuard(UserAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<EventUserController>(EventUserController);
  });

  it('toggleInterest delegates to service', async () => {
    const res = await controller.toggleInterest(id('100'), id('1'));
    expect(res.interested).toBe(true);
    expect(service.toggleInterest).toHaveBeenCalledWith(id('100'), id('1'));
  });

  it('participate delegates to service', async () => {
    const res = await controller.participate(id('100'), id('1'), {});
    expect(res.participating).toBe(true);
    expect(service.participate).toHaveBeenCalledWith(id('100'), id('1'), {});
  });

  it('cancelParticipation delegates to service', async () => {
    await controller.cancelParticipation(id('100'), id('1'));
    expect(service.cancelParticipation).toHaveBeenCalledWith(
      id('100'),
      id('1'),
    );
  });

  it('apply delegates to service', async () => {
    await controller.apply(id('100'), id('1'), {
      fullName: 'A',
      stageName: 'B',
      category: 'C',
      phone: 'D',
      characterPlanned: 'E',
    });
    expect(service.apply).toHaveBeenCalledWith(
      id('100'),
      id('1'),
      expect.anything(),
    );
  });

  it('getMyApplications delegates to service', async () => {
    await controller.getMyApplications(id('100'));
    expect(service.getMyApplications).toHaveBeenCalledWith(id('100'));
  });
});
