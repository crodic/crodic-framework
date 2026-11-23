import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { AiEventCrawlerService } from './ai-event-crawler.service';
import { EventEntity } from '../entities/event.entity';
import { CityEntity } from '../../location/entities/city.entity';
import { UserEntity } from '../../user/entities/user.entity';
import { PostEntity } from '../../post/entities/post.entity';

describe('AiEventCrawlerService', () => {
  let service: AiEventCrawlerService;
  let configService: any;
  let eventRepo: any;
  let cityRepo: any;
  let userRepo: any;
  let postRepo: any;
  let dataSource: any;
  let mockEm: any;

  beforeEach(async () => {
    configService = {
      get: jest.fn(),
    };

    eventRepo = {
      count: jest.fn(),
      createQueryBuilder: jest.fn(),
      create: jest.fn((dto) => dto),
      save: jest.fn((dto) => Promise.resolve({ id: '1', ...dto })),
    };

    cityRepo = {
      createQueryBuilder: jest.fn(),
    };

    userRepo = {
      findOne: jest.fn(),
    };

    postRepo = {
      create: jest.fn((dto) => dto),
      save: jest.fn((dto) => Promise.resolve({ id: '1', ...dto })),
    };

    mockEm = {
      create: jest.fn((entity, dto) => ({ ...dto })),
      save: jest.fn((entity, dto) => Promise.resolve({ id: '1', ...dto })),
    };

    dataSource = {
      transaction: jest.fn((cb) => cb(mockEm)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiEventCrawlerService,
        { provide: ConfigService, useValue: configService },
        { provide: DataSource, useValue: dataSource },
        { provide: getRepositoryToken(EventEntity), useValue: eventRepo },
        { provide: getRepositoryToken(CityEntity), useValue: cityRepo },
        { provide: getRepositoryToken(UserEntity), useValue: userRepo },
        { provide: getRepositoryToken(PostEntity), useValue: postRepo },
      ],
    }).compile();

    service = module.get<AiEventCrawlerService>(AiEventCrawlerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('crawlAndSyncEvents', () => {
    it('should return gracefully if GEMINI_API_KEY is not configured', async () => {
      configService.get.mockReturnValue(undefined);

      const result = await service.crawlAndSyncEvents();

      expect(result.success).toBe(false);
      expect(result.newEventsCreated).toBe(0);
      expect(result.message).toContain('GEMINI_API_KEY is missing');
    });

    it('should handle duplicates correctly and persist new events', async () => {
      configService.get.mockImplementation((key: string) => {
        if (key === 'ai.geminiApiKey') return 'test-key';
        if (key === 'ai.geminiModel') return 'gemini-3.8-flash';
        return null;
      });

      // Mock fetchEventsFromGemini by spying on private method
      const mockRawEvents = [
        {
          title: 'Cosplay Festival 2025',
          startDate: '2025-08-15',
          venue: 'SECC',
          locationLabel: 'TP. Hồ Chí Minh',
          ticketPriceAmount: 120000,
          description: 'Hội chợ cosplay lớn nhất',
          imageUrl: 'https://example.com/poster.jpg',
          categories: ['Cosplay', 'Anime'],
        },
        {
          title: 'Existing Duplicate Fes',
          startDate: '2025-09-01',
          venue: 'Hà Nội',
          locationLabel: 'Hà Nội',
          description: 'Lễ hội đã tồn tại',
        },
      ];

      jest
        .spyOn(service as any, 'fetchEventsFromGemini')
        .mockResolvedValue(mockRawEvents);

      // Event 1 is new (slug count 0, title queryBuilder returns null)
      // Event 2 is duplicate (slug count 1)
      eventRepo.count
        .mockResolvedValueOnce(0) // First event slug doesn't exist
        .mockResolvedValueOnce(1); // Second event slug already exists

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      };
      eventRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      // Mock City
      const mockCityQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        orWhere: jest.fn().mockReturnThis(),
        getOne: jest
          .fn()
          .mockResolvedValue({ id: '10', name: 'TP. Hồ Chí Minh' }),
      };
      cityRepo.createQueryBuilder.mockReturnValue(mockCityQueryBuilder);

      userRepo.findOne.mockResolvedValue({
        id: '1',
        email: 'admin@kosume.com',
      });

      const result = await service.crawlAndSyncEvents();

      expect(result.success).toBe(true);
      expect(result.totalDiscovered).toBe(2);
      expect(result.newEventsCreated).toBe(1);
      expect(result.duplicateEventsSkipped).toBe(1);
      expect(result.postCreated).toBe(true);
      expect(result.createdEventTitles).toEqual(['Cosplay Festival 2025']);
      expect(eventRepo.save).toHaveBeenCalledTimes(1);
      expect(dataSource.transaction).toHaveBeenCalledTimes(1);
    });
  });
});
