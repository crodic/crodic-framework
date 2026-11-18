import { AutoIncrementID } from '../../../common/types/common.type';
import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { UserEntity } from '../../user/entities/user.entity';
import { UserFollowEntity } from '../entities/user-follow.entity';
import { SocialService } from './social.service';

const id = (val: string) => val as unknown as AutoIncrementID;

describe('SocialService', () => {
  let service: SocialService;
  let followRepo: any;
  let userRepo: any;
  let dataSource: any;

  beforeEach(async () => {
    followRepo = {
      createQueryBuilder: jest.fn(),
      count: jest.fn().mockResolvedValue(1),
    };

    userRepo = {
      findOne: jest.fn(),
    };

    dataSource = {
      transaction: jest.fn().mockImplementation(async (cb) => {
        const em = {
          findOne: jest.fn().mockResolvedValue(null),
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
        SocialService,
        { provide: DataSource, useValue: dataSource },
        { provide: getRepositoryToken(UserFollowEntity), useValue: followRepo },
        {
          provide: getRepositoryToken(UserEntity),
          useValue: userRepo,
        },
      ],
    }).compile();

    service = module.get<SocialService>(SocialService);
  });

  describe('toggleFollow', () => {
    it('follows user successfully', async () => {
      const res = await service.toggleFollow(id('100'), id('200'));
      expect(res.following).toBe(true);
      expect(dataSource.transaction).toHaveBeenCalled();
    });

    it('throws BadRequestException when following self', async () => {
      await expect(service.toggleFollow(id('100'), id('100'))).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('checkIsFollowing', () => {
    it('returns true if count > 0', async () => {
      const res = await service.checkIsFollowing(id('100'), id('200'));
      expect(res).toBe(true);
      expect(followRepo.count).toHaveBeenCalledWith({
        where: { followerId: id('100'), followingId: id('200') },
      });
    });
  });
});
