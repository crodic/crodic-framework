import { AutoIncrementID } from '../../../common/types/common.type';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserEntity } from '../../user/entities/user.entity';
import { EBookingRequestStatus } from '../constants/booking.constant';
import { BookingRequestEntity } from '../entities/booking-request.entity';
import { DirectMessageEntity } from '../entities/direct-message.entity';
import { BookingService } from './booking.service';

const id = (val: string) => val as unknown as AutoIncrementID;

describe('BookingService', () => {
  let service: BookingService;
  let bookingRepo: any;
  let messageRepo: any;
  let userRepo: any;

  beforeEach(async () => {
    bookingRepo = {
      createQueryBuilder: jest.fn(),
      findOne: jest.fn(),
      create: jest
        .fn()
        .mockImplementation((dto) => ({
          ...dto,
          id: id('1'),
          createdAt: new Date(),
        })),
      save: jest
        .fn()
        .mockImplementation(async (item) => ({
          ...item,
          id: item.id || id('1'),
          createdAt: new Date(),
        })),
    };

    messageRepo = {
      createQueryBuilder: jest.fn().mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ affected: 1 }),
      }),
      create: jest
        .fn()
        .mockImplementation((dto) => ({
          ...dto,
          id: id('10'),
          createdAt: new Date(),
        })),
      save: jest
        .fn()
        .mockImplementation(async (item) => ({
          ...item,
          id: id('10'),
          createdAt: new Date(),
        })),
    };

    userRepo = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingService,
        {
          provide: getRepositoryToken(BookingRequestEntity),
          useValue: bookingRepo,
        },
        {
          provide: getRepositoryToken(DirectMessageEntity),
          useValue: messageRepo,
        },
        { provide: getRepositoryToken(UserEntity), useValue: userRepo },
      ],
    }).compile();

    service = module.get<BookingService>(BookingService);
  });

  describe('createBookingRequest', () => {
    it('creates and returns booking request', async () => {
      userRepo.findOne.mockResolvedValue({
        id: id('200'),
        displayName: 'Cosplayer X',
      });

      const res = await service.createBookingRequest(id('100'), {
        targetCosplayerId: id('200'),
        bookingType: 'Event',
        fullName: 'Requester',
        contactInfo: '0900000000',
        targetDateLabel: 'Next week',
        budgetLabel: '5M',
        details: 'Appearance at booth',
      });

      expect(res.bookingType).toBe('Event');
      expect(res.status).toBe(EBookingRequestStatus.PENDING);
      expect(bookingRepo.save).toHaveBeenCalled();
    });

    it('throws BadRequestException if booking oneself', async () => {
      await expect(
        service.createBookingRequest(id('100'), {
          targetCosplayerId: id('100'),
          bookingType: 'Event',
          fullName: 'Requester',
          contactInfo: '0900000000',
          targetDateLabel: 'Next week',
          budgetLabel: '5M',
          details: 'Appearance',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws NotFoundException if target user does not exist', async () => {
      userRepo.findOne.mockResolvedValue(null);

      await expect(
        service.createBookingRequest(id('100'), {
          targetCosplayerId: id('999'),
          bookingType: 'Event',
          fullName: 'Requester',
          contactInfo: '0900000000',
          targetDateLabel: 'Next week',
          budgetLabel: '5M',
          details: 'Appearance',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateBookingStatus', () => {
    it('updates status when authorized target cosplayer', async () => {
      bookingRepo.findOne.mockResolvedValue({
        id: id('1'),
        targetCosplayerId: id('200'),
        requesterUserId: id('100'),
        status: EBookingRequestStatus.PENDING,
        createdAt: new Date(),
      });

      const res = await service.updateBookingStatus(id('200'), id('1'), {
        status: EBookingRequestStatus.ACCEPTED,
        responseNote: 'Gladly accept',
      });

      expect(res.status).toBe(EBookingRequestStatus.ACCEPTED);
      expect(res.responseNote).toBe('Gladly accept');
    });

    it('throws ForbiddenException if user is neither target nor requester', async () => {
      bookingRepo.findOne.mockResolvedValue({
        id: id('1'),
        targetCosplayerId: id('200'),
        requesterUserId: id('100'),
        status: EBookingRequestStatus.PENDING,
      });

      await expect(
        service.updateBookingStatus(id('999'), id('1'), {
          status: EBookingRequestStatus.ACCEPTED,
        }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('sendMessage', () => {
    it('creates and returns message', async () => {
      userRepo.findOne.mockResolvedValue({ id: id('200') });

      const res = await service.sendMessage(id('100'), {
        recipientId: id('200'),
        content: 'Hello cosplayer!',
      });

      expect(res.content).toBe('Hello cosplayer!');
      expect(res.isRead).toBe(false);
      expect(messageRepo.save).toHaveBeenCalled();
    });

    it('throws BadRequestException if sending to self', async () => {
      await expect(
        service.sendMessage(id('100'), {
          recipientId: id('100'),
          content: 'Hello self!',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getConversations', () => {
    it('returns empty array when no messages', async () => {
      const res = await service.getConversations(id('100'));
      expect(res).toEqual([]);
    });
  });

  describe('markAsRead', () => {
    it('executes update query', async () => {
      await service.markAsRead(id('100'), id('200'));
      expect(messageRepo.createQueryBuilder).toHaveBeenCalled();
    });
  });
});
