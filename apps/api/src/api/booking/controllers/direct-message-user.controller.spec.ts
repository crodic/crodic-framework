import { AutoIncrementID } from '../../../common/types/common.type';
import { UserAuthGuard } from '../../../guards/user-auth.guard';
import { Test, TestingModule } from '@nestjs/testing';
import { DirectMessageUserController } from './direct-message-user.controller';
import { BookingService } from '../services/booking.service';

const id = (val: string) => val as unknown as AutoIncrementID;

describe('DirectMessageUserController', () => {
  let controller: DirectMessageUserController;
  let service: Partial<Record<keyof BookingService, jest.Mock>>;

  beforeEach(async () => {
    service = {
      sendMessage: jest.fn().mockResolvedValue({ id: id('1'), content: 'Hi' }),
      getConversations: jest.fn().mockResolvedValue([]),
      getConversation: jest.fn().mockResolvedValue({ data: [], meta: {} }),
      markAsRead: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DirectMessageUserController],
      providers: [{ provide: BookingService, useValue: service }],
    })
      .overrideGuard(UserAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<DirectMessageUserController>(
      DirectMessageUserController,
    );
  });

  it('sendMessage delegates to service', async () => {
    const dto: any = { recipientId: id('200'), content: 'Hi' };
    const res = await controller.sendMessage(id('100'), dto);
    expect(res.content).toBe('Hi');
    expect(service.sendMessage).toHaveBeenCalledWith(id('100'), dto);
  });

  it('getConversations delegates to service', async () => {
    const res = await controller.getConversations(id('100'));
    expect(res).toEqual([]);
    expect(service.getConversations).toHaveBeenCalledWith(id('100'));
  });

  it('getConversation delegates to service', async () => {
    const query: any = {};
    await controller.getConversation(id('100'), id('200'), query);
    expect(service.getConversation).toHaveBeenCalledWith(
      id('100'),
      id('200'),
      query,
    );
  });

  it('markAsRead delegates to service', async () => {
    await controller.markAsRead(id('100'), id('200'));
    expect(service.markAsRead).toHaveBeenCalledWith(id('100'), id('200'));
  });
});
