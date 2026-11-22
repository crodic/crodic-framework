import { AutoIncrementID } from '../../../common/types/common.type';
import { UserAuthGuard } from '../../../guards/user-auth.guard';
import { Test, TestingModule } from '@nestjs/testing';
import { NotificationUserController } from './notification-user.controller';
import { NotificationService } from '../services/notification.service';

const id = (val: string) => val as unknown as AutoIncrementID;

describe('NotificationUserController', () => {
  let controller: NotificationUserController;
  let service: Partial<Record<keyof NotificationService, jest.Mock>>;

  beforeEach(async () => {
    service = {
      getMyNotifications: jest.fn().mockResolvedValue({ data: [], meta: {} }),
      getUnreadCount: jest.fn().mockResolvedValue({ unreadCount: 3 }),
      markAsRead: jest.fn().mockResolvedValue(undefined),
      markAllAsRead: jest.fn().mockResolvedValue(undefined),
      deleteNotification: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationUserController],
      providers: [{ provide: NotificationService, useValue: service }],
    })
      .overrideGuard(UserAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<NotificationUserController>(
      NotificationUserController,
    );
  });

  it('getMyNotifications delegates to service', async () => {
    const query: any = {};
    await controller.getMyNotifications(id('100'), query);
    expect(service.getMyNotifications).toHaveBeenCalledWith(id('100'), query);
  });

  it('getUnreadCount delegates to service', async () => {
    const res = await controller.getUnreadCount(id('100'));
    expect(res.unreadCount).toBe(3);
    expect(service.getUnreadCount).toHaveBeenCalledWith(id('100'));
  });

  it('markAsRead delegates to service', async () => {
    await controller.markAsRead(id('100'), id('1'));
    expect(service.markAsRead).toHaveBeenCalledWith(id('100'), id('1'));
  });

  it('markAllAsRead delegates to service', async () => {
    await controller.markAllAsRead(id('100'));
    expect(service.markAllAsRead).toHaveBeenCalledWith(id('100'));
  });

  it('deleteNotification delegates to service', async () => {
    await controller.deleteNotification(id('100'), id('1'));
    expect(service.deleteNotification).toHaveBeenCalledWith(id('100'), id('1'));
  });
});
