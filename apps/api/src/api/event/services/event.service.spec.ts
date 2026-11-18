import { AutoIncrementID } from '../../../common/types/common.type';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CosplayerProfileEntity } from '../../cosplayer/entities/cosplayer-profile.entity';
import { UserEntity } from '../../user/entities/user.entity';
import {
  EEventApplicationStatus,
  EEventStatus,
} from '../constants/event.constant';
import { EventApplicationEntity } from '../entities/event-application.entity';
import { EventInterestEntity } from '../entities/event-interest.entity';
import { EventParticipantEntity } from '../entities/event-participant.entity';
import { EventEntity } from '../entities/event.entity';
import { EventService } from './event.service';

const id = (val: string) => val as unknown as AutoIncrementID;

describe('EventService', () => {
  let service: EventService;
  let eventRepo: any;
  let participantRepo: any;
  let applicationRepo: any;
  let interestRepo: any;
  let profileRepo: any;
  let userRepo: any;
  let dataSource: any;

  beforeEach(async () => {
    eventRepo = {
      createQueryBuilder: jest.fn(),
      findOne: jest.fn(),
      increment: jest.fn().mockResolvedValue(undefined),
      decrement: jest.fn().mockResolvedValue(undefined),
    };

    participantRepo = {
      find: jest.fn().mockResolvedValue([]),
      findOne: jest.fn(),
      create: jest.fn().mockImplementation((dto) => ({ ...dto, id: id('10') })),
      save: jest
        .fn()
        .mockImplementation(async (item) => ({ ...item, id: id('10') })),
      delete: jest.fn().mockResolvedValue({ affected: 1 }),
    };

    applicationRepo = {
      find: jest.fn().mockResolvedValue([]),
      findOne: jest.fn(),
      create: jest.fn().mockImplementation((dto) => ({
        ...dto,
        id: id('20'),
        createdAt: new Date(),
      })),
      save: jest.fn().mockImplementation(async (item) => ({
        ...item,
        id: id('20'),
        createdAt: new Date(),
      })),
    };

    interestRepo = {
      find: jest.fn().mockResolvedValue([]),
      findOne: jest.fn(),
      create: jest.fn().mockImplementation((dto) => ({ ...dto, id: id('30') })),
      save: jest.fn().mockResolvedValue({ id: id('30') }),
      delete: jest.fn().mockResolvedValue({ affected: 1 }),
    };

    profileRepo = {
      find: jest.fn().mockResolvedValue([
        {
          userId: id('100'),
          displayName: 'KIRIKO',
          avatarUrl: 'url',
          isVerified: true,
          roleBadge: 'Cosplayer',
        },
      ]),
      findOne: jest.fn().mockResolvedValue({
        id: id('100'),
        userId: id('100'),
        displayName: 'KIRIKO',
        avatarUrl: 'url',
        isVerified: true,
        roleBadge: 'Cosplayer',
      }),
    };

    userRepo = {
      find: jest.fn().mockResolvedValue([
        {
          id: id('100'),
          fullName: 'KIRIKO',
          avatar: 'url',
        },
      ]),
      findOne: jest.fn().mockResolvedValue({
        id: id('100'),
        fullName: 'KIRIKO',
        avatar: 'url',
      }),
    };

    dataSource = {
      transaction: jest.fn().mockImplementation(async (cb) => {
        const em = {
          findOne: jest.fn(),
          findOneOrFail: jest
            .fn()
            .mockResolvedValue({ id: id('1'), interestedCount: 1 }),
          create: jest.fn().mockImplementation((_, dto) => dto),
          save: jest.fn().mockResolvedValue({}),
          delete: jest.fn().mockResolvedValue({}),
          increment: jest.fn().mockResolvedValue({}),
          decrement: jest.fn().mockResolvedValue({}),
        };
        return cb(em);
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventService,
        { provide: DataSource, useValue: dataSource },
        { provide: getRepositoryToken(EventEntity), useValue: eventRepo },
        {
          provide: getRepositoryToken(EventParticipantEntity),
          useValue: participantRepo,
        },
        {
          provide: getRepositoryToken(EventApplicationEntity),
          useValue: applicationRepo,
        },
        {
          provide: getRepositoryToken(EventInterestEntity),
          useValue: interestRepo,
        },
        {
          provide: getRepositoryToken(CosplayerProfileEntity),
          useValue: profileRepo,
        },
        {
          provide: getRepositoryToken(UserEntity),
          useValue: userRepo,
        },
      ],
    }).compile();

    service = module.get<EventService>(EventService);
  });

  describe('findBySlug', () => {
    it('returns event detail with schedule and participants', async () => {
      eventRepo.findOne.mockResolvedValue({
        id: id('1'),
        slug: 'winter-fest',
        title: 'Winter Fest',
        locationLabel: 'HCM',
        venue: 'SECC',
        imageUrl: 'url',
        status: EEventStatus.UPCOMING,
        startAt: new Date('2025-12-24T09:00:00Z'),
        schedule: [{ time: '09:00', activity: 'Opening' }],
      });
      participantRepo.find.mockResolvedValue([
        {
          id: id('10'),
          eventId: id('1'),
          userId: id('100'),
          roleLabel: 'Guest',
          sortOrder: 0,
        },
      ]);

      const res = await service.findBySlug('winter-fest');

      expect(res.slug).toBe('winter-fest');
      expect(res.dayLabel).toBe('24');
      expect(res.participants).toHaveLength(1);
      expect(res.participants[0].name).toBe('KIRIKO');
    });

    it('throws NotFoundException when event not found', async () => {
      eventRepo.findOne.mockResolvedValue(null);

      await expect(service.findBySlug('unknown')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('toggleInterest', () => {
    it('delegates to transaction', async () => {
      eventRepo.findOne.mockResolvedValue({ id: id('1') });

      const res = await service.toggleInterest(id('100'), id('1'));

      expect(dataSource.transaction).toHaveBeenCalled();
      expect(res).toBeDefined();
    });
  });

  describe('participate & cancelParticipation', () => {
    it('creates participant record and increments participantsCount', async () => {
      eventRepo.findOne.mockResolvedValue({ id: id('1') });
      participantRepo.findOne.mockResolvedValue(null);

      const res = await service.participate(id('100'), id('1'), {});

      expect(res.participating).toBe(true);
      expect(participantRepo.save).toHaveBeenCalled();
      expect(eventRepo.increment).toHaveBeenCalledWith(
        { id: id('1') },
        'participantsCount',
        1,
      );
    });

    it('deletes participant record and decrements participantsCount', async () => {
      participantRepo.findOne.mockResolvedValue({ id: id('10') });

      await service.cancelParticipation(id('100'), id('1'));

      expect(participantRepo.delete).toHaveBeenCalledWith({ id: id('10') });
      expect(eventRepo.decrement).toHaveBeenCalledWith(
        { id: id('1') },
        'participantsCount',
        1,
      );
    });
  });

  describe('apply', () => {
    it('throws BadRequestException if event is not recruiting', async () => {
      eventRepo.findOne.mockResolvedValue({ id: id('1'), isRecruiting: false });

      await expect(
        service.apply(id('100'), id('1'), {
          fullName: 'Name',
          stageName: 'Stage',
          category: 'Guest',
          phone: '098',
          characterPlanned: 'Char',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws ConflictException if already applied for category', async () => {
      eventRepo.findOne.mockResolvedValue({ id: id('1'), isRecruiting: true });
      applicationRepo.findOne.mockResolvedValue({ id: id('20') });

      await expect(
        service.apply(id('100'), id('1'), {
          fullName: 'Name',
          stageName: 'Stage',
          category: 'Guest',
          phone: '098',
          characterPlanned: 'Char',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('submits application successfully and increments applicationsCount', async () => {
      eventRepo.findOne.mockResolvedValue({ id: id('1'), isRecruiting: true });
      applicationRepo.findOne.mockResolvedValue(null);

      const res = await service.apply(id('100'), id('1'), {
        fullName: 'Name',
        stageName: 'Stage',
        category: 'Guest',
        phone: '098',
        characterPlanned: 'Char',
      });

      expect(res.status).toBe(EEventApplicationStatus.PENDING);
      expect(applicationRepo.save).toHaveBeenCalled();
      expect(eventRepo.increment).toHaveBeenCalledWith(
        { id: id('1') },
        'applicationsCount',
        1,
      );
    });
  });
});
