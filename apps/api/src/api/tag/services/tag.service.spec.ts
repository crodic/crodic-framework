import { ForbiddenException } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { ETagStatus } from '../constants/tag.constant';
import { TagEntity } from '../entities/tag.entity';
import { TagNormalizationService } from './tag-normalization.service';
import { TagService } from './tag.service';

describe('TagService batch canonical tag resolution', () => {
  const cacheService = { bumpVersion: jest.fn().mockResolvedValue(undefined) };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  function createService(): TagService {
    return new TagService(
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      new TagNormalizationService(),
      {} as any,
      cacheService as any,
    );
  }

  it('resolves multiple canonical tags with one lookup and preserves input order', async () => {
    const tags = [
      {
        id: '1',
        name: 'Genshin Impact',
        normalizedName: 'genshin_impact',
        status: ETagStatus.ACTIVE,
        mergedIntoId: null,
      },
      {
        id: '2',
        name: 'Frieren',
        normalizedName: 'frieren',
        status: ETagStatus.ACTIVE,
        mergedIntoId: null,
      },
    ];
    const manager = {
      find: jest.fn(async (entity: unknown) =>
        entity === TagEntity ? tags : [],
      ),
    };

    const result = await createService().resolveOrCreateCanonicalTags(
      ['Genshin Impact', 'Frieren'],
      {},
      manager as unknown as EntityManager,
    );

    expect(result.map((tag) => tag.id)).toEqual(['1', '2']);
    expect(manager.find).toHaveBeenCalledTimes(1);
    expect(manager.find).toHaveBeenCalledWith(TagEntity, {
      where: { normalizedName: expect.anything() },
      relations: ['translations'],
    });
    expect(cacheService.bumpVersion).toHaveBeenCalledTimes(2);
  });

  it('preserves banned-tag rejection', async () => {
    const manager = {
      find: jest.fn(async (entity: unknown) =>
        entity === TagEntity
          ? [
              {
                id: '1',
                name: 'Banned',
                normalizedName: 'banned',
                status: ETagStatus.BANNED,
              },
            ]
          : [],
      ),
    };

    await expect(
      createService().resolveOrCreateCanonicalTags(
        ['Banned'],
        {},
        manager as unknown as EntityManager,
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(cacheService.bumpVersion).not.toHaveBeenCalled();
  });

  it('keeps partial success when one tag in removeMany fails', async () => {
    const service = createService();
    const remove = jest
      .spyOn(service, 'remove')
      .mockImplementation(async (id) => {
        if (String(id) === '2') throw new Error('Tag cannot be deleted');
        return { message: 'Tag deleted successfully' };
      });

    await expect(service.removeMany(['1', '2', '3'] as any)).resolves.toEqual({
      count: 2,
    });
    expect(remove.mock.calls.map(([id]) => String(id))).toEqual([
      '1',
      '2',
      '3',
    ]);
  });
});
