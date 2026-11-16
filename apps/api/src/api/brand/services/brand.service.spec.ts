import { AutoIncrementID } from '../../../common/types/common.type';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EBrandMemberRole } from '../constants/brand.constant';
import { BrandMemberEntity } from '../entities/brand-member.entity';
import { BrandEntity } from '../entities/brand.entity';
import { BrandService } from './brand.service';

const id = (val: string) => val as unknown as AutoIncrementID;

describe('BrandService', () => {
  let service: BrandService;
  let brandRepo: any;
  let memberRepo: any;

  beforeEach(async () => {
    brandRepo = {
      createQueryBuilder: jest.fn(),
      findOne: jest.fn(),
      count: jest.fn().mockResolvedValue(0),
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
          id: id('1'),
          createdAt: new Date(),
        })),
    };

    memberRepo = {
      findOne: jest.fn(),
      create: jest.fn().mockImplementation((dto) => dto),
      save: jest.fn().mockResolvedValue({}),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BrandService,
        { provide: getRepositoryToken(BrandEntity), useValue: brandRepo },
        {
          provide: getRepositoryToken(BrandMemberEntity),
          useValue: memberRepo,
        },
      ],
    }).compile();

    service = module.get<BrandService>(BrandService);
  });

  describe('findBySlug', () => {
    it('returns brand when found', async () => {
      brandRepo.findOne.mockResolvedValue({
        id: id('1'),
        ownerUserId: id('100'),
        name: 'HoYoverse',
        slug: 'hoyoverse',
        contactEmail: 'contact@hoyoverse.com',
        isVerified: true,
        createdAt: new Date(),
      });

      const res = await service.findBySlug('hoyoverse');
      expect(res.name).toBe('HoYoverse');
    });

    it('throws NotFoundException when missing', async () => {
      brandRepo.findOne.mockResolvedValue(null);
      await expect(service.findBySlug('missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('creates brand and owner member', async () => {
      const res = await service.create(id('100'), {
        name: 'Studio A',
        contactEmail: 'studio@a.com',
      });

      expect(res.name).toBe('Studio A');
      expect(brandRepo.save).toHaveBeenCalled();
      expect(memberRepo.save).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('updates brand if owner', async () => {
      brandRepo.findOne.mockResolvedValue({
        id: id('1'),
        ownerUserId: id('100'),
        name: 'Old Name',
      });

      const res = await service.update(id('100'), id('1'), {
        name: 'New Name',
      });
      expect(res.name).toBe('New Name');
    });

    it('throws ForbiddenException if not owner or admin', async () => {
      brandRepo.findOne.mockResolvedValue({
        id: id('1'),
        ownerUserId: id('999'),
        name: 'Old Name',
      });
      memberRepo.findOne.mockResolvedValue(null);

      await expect(
        service.update(id('100'), id('1'), { name: 'New Name' }),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
