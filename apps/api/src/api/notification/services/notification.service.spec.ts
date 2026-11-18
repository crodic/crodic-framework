import { AutoIncrementID } from '../../../common/types/common.type';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CosplayerProfileEntity } from '../../cosplayer/entities/cosplayer-profile.entity';
import {
  ENotificationCategory,
  ENotificationType,
} from '../constants/notification.constant';
import { NotificationEntity } from '../entities/notification.entity';
import { NotificationService } from './notification.service';

const id = (val: string) => val as unknown as AutoIncrementID;

describe('NotificationService', () => {
  let service: NotificationService;
  let notiRepo: any;
  let profileRepo: any;

  beforeEach(async () => {
    notiRepo = {
      createQueryBuilder: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ affected: 3 }),
      }),
      findOne: jest.fn(),
      count: jest.fn().mockResolvedValue(5),
      save: jest.fn().mockImplementation(async (item) => item),
    };

    profileRepo = {
      find: jest.fn().mockResolvedValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        { provide: getRepositoryToken(NotificationEntity), useValue: notiRepo },
        {
          provide: getRepositoryToken(CosplayerProfileEntity),
          useValue: profileRepo,
        },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
  });

  describe('getUnreadCount', () => {
    it('returns unread count', async () => {
      const res = await service.getUnreadCount(id('100'));
      expect(res.unreadCount).toBe(5);
      expect(notiRepo.count).toHaveBeenCalledWith({
        where: { recipientUserId: id('100'), isRead: false },
      });
    });
  });

  describe('markAsRead', () => {
    it('marks notification as read', async () => {
      notiRepo.findOne.mockResolvedValue({
        id: id('1'),
        recipientUserId: id('100'),
        isRead: false,
      });

      await service.markAsRead(id('100'), id('1'));
      expect(notiRepo.save).toHaveBeenCalled();
    });

    it('throws NotFoundException if missing', async () => {
      notiRepo.findOne.mockResolvedValue(null);
      await expect(service.markAsRead(id('100'), id('999'))).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('markAllAsRead', () => {
    it('executes update query', async () => {
      await service.markAllAsRead(id('100'));
      expect(notiRepo.createQueryBuilder).toHaveBeenCalled();
    });
  });
});
