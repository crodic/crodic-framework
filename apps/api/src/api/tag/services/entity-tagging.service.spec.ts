import { AutoIncrementID } from '../../../common/types/common.type';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { ETaggableEntityType } from '../constants/tag.constant';
import { EntityTagConfigEntity } from '../entities/entity-tag-config.entity';
import { EntityTagLogEntity } from '../entities/entity-tag-log.entity';
import { EntityTagEntity } from '../entities/entity-tag.entity';
import { TagEntity } from '../entities/tag.entity';
import { EntityTaggingService } from './entity-tagging.service';
import { TagCacheService } from './tag-cache.service';
import { TagService } from './tag.service';

describe('EntityTaggingService (Collaborative Folksonomy Governance)', () => {
  const id = (v: string) => v as AutoIncrementID;

  function createSetup(opts: {
    ownerUserId?: AutoIncrementID | null;
    tagEditLocked?: boolean;
    maxTags?: number;
    existingTags?: Partial<EntityTagEntity>[];
    resolvedTag?: Partial<TagEntity>;
  }) {
    const config: Partial<EntityTagConfigEntity> = {
      id: id('100'),
      entityType: ETaggableEntityType.ARTWORK,
      entityId: id('1'),
      ownerUserId: opts.ownerUserId ?? id('10'),
      tagEditLocked: opts.tagEditLocked ?? false,
      maxTags: opts.maxTags ?? 10,
    };

    const existing = (opts.existingTags ?? []).map((t, idx) => ({
      id: id(String(idx + 1)),
      entityType: ETaggableEntityType.ARTWORK,
      entityId: id('1'),
      tagId: t.tagId ?? id(String(idx + 50)),
      isAuthorTag: t.isAuthorTag ?? false,
      isLocked: t.isLocked ?? false,
      sortOrder: t.sortOrder ?? idx,
      tag:
        t.tag ??
        ({
          id: t.tagId ?? id(String(idx + 50)),
          name: `Tag${idx}`,
          isSystem: false,
        } as TagEntity),
    })) as EntityTagEntity[];

    const manager = {
      findOne: jest.fn(
        async (
          entity: unknown,
          queryOpts: { where: Record<string, unknown> },
        ) => {
          if (entity === EntityTagConfigEntity) {
            return config;
          }
          if (entity === EntityTagEntity) {
            return (
              existing.find(
                (item) => String(item.tagId) === String(queryOpts.where.tagId),
              ) ?? null
            );
          }
          return null;
        },
      ),
      find: jest.fn(async () => existing),
      create: jest.fn(
        (_entity: unknown, payload: Record<string, unknown>) => payload,
      ),
      save: jest.fn(
        async (_entity: unknown, payload: Record<string, unknown>) => {
          if (_entity === EntityTagEntity) {
            existing.push(
              ...((Array.isArray(payload)
                ? payload
                : [payload]) as unknown as EntityTagEntity[]),
            );
          }
          return payload;
        },
      ),
      delete: jest.fn(async () => ({ affected: 1 })),
      increment: jest.fn(async () => undefined),
      query: jest.fn(async () => []),
    };

    const dataSource = {
      transaction: jest.fn(
        async (cb: (em: typeof manager) => Promise<unknown>) => cb(manager),
      ),
    } as unknown as DataSource;

    const tagService = {
      resolveOrCreateCanonicalTag: jest.fn(async () => ({
        id: id('999'),
        name: 'Cyberpunk',
        isSystem: false,
        ...(opts.resolvedTag ?? {}),
      })),
    } as unknown as TagService;

    const cacheService = {
      recordTagActivity: jest.fn(async () => undefined),
      bumpVersion: jest.fn(async () => undefined),
    } as unknown as TagCacheService;

    const service = new EntityTaggingService(
      dataSource,
      {} as Repository<EntityTagEntity>,
      {} as Repository<EntityTagConfigEntity>,
      {} as Repository<EntityTagLogEntity>,
      tagService,
      cacheService,
    );

    jest.spyOn(service, 'listEntityTags').mockResolvedValue({
      entityType: ETaggableEntityType.ARTWORK,
      entityId: id('1'),
      tagEditLocked: Boolean(config.tagEditLocked),
      maxTags: config.maxTags ?? 10,
      canEdit: true,
      isOwner: false,
      tags: [],
    });

    return { service, existing, manager, tagService };
  }

  it('enforces 10-tag maximum limit per entity', async () => {
    const tenTags = Array.from({ length: 10 }, (_, idx) => ({
      tagId: id(String(idx + 1)),
    }));
    const { service } = createSetup({ maxTags: 10, existingTags: tenTags });

    await expect(
      service.attachTag(
        ETaggableEntityType.ARTWORK,
        id('1'),
        { tagName: '11th Tag' },
        { userId: id('22') },
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it('saves synchronized tag links together and adjusts usage counts in one query', async () => {
    const { service, manager, tagService } = createSetup({});
    (tagService.resolveOrCreateCanonicalTag as jest.Mock)
      .mockResolvedValueOnce({ id: id('201'), name: 'First', isSystem: false })
      .mockResolvedValueOnce({
        id: id('202'),
        name: 'Second',
        isSystem: false,
      });

    await service.syncAuthorTagsInTransaction(
      manager as any,
      ETaggableEntityType.ARTWORK,
      id('1'),
      { tagNames: ['First', 'Second'] },
      { userId: id('10') },
    );

    expect(manager.save).toHaveBeenCalledWith(
      EntityTagEntity,
      expect.arrayContaining([
        expect.objectContaining({ tagId: id('201'), sortOrder: 0 }),
        expect.objectContaining({ tagId: id('202'), sortOrder: 1 }),
      ]),
    );
    expect(manager.query).toHaveBeenCalledTimes(1);
    expect(manager.query.mock.calls[0][1]).toEqual(['201', 1, '202', 1]);
  });

  it('blocks community tag additions when creator enables work-level tagEditLocked, while permitting creator', async () => {
    const { service } = createSetup({
      ownerUserId: id('10'),
      tagEditLocked: true,
    });

    // Community user (#22) is blocked
    await expect(
      service.attachTag(
        ETaggableEntityType.ARTWORK,
        id('1'),
        { tagName: 'Cyberpunk' },
        { userId: id('22') },
      ),
    ).rejects.toThrow(ForbiddenException);

    // Creator (#10) succeeds and marks isAuthorTag = true
    await expect(
      service.attachTag(
        ETaggableEntityType.ARTWORK,
        id('1'),
        { tagName: 'Cyberpunk' },
        { userId: id('10') },
      ),
    ).resolves.toBeDefined();
  });

  it('protects Author (*) tags and creator-locked tags from removal by other users, while allowing creator override', async () => {
    const { service } = createSetup({
      ownerUserId: id('10'),
      existingTags: [
        { tagId: id('51'), isAuthorTag: true, isLocked: false },
        { tagId: id('52'), isAuthorTag: false, isLocked: true },
      ],
    });

    // Community user (#99) cannot remove Author (*) tag
    await expect(
      service.detachTag(ETaggableEntityType.ARTWORK, id('1'), id('51'), {
        userId: id('99'),
      }),
    ).rejects.toThrow(ForbiddenException);

    // Community user (#99) cannot remove locked community tag
    await expect(
      service.detachTag(ETaggableEntityType.ARTWORK, id('1'), id('52'), {
        userId: id('99'),
      }),
    ).rejects.toThrow(ForbiddenException);

    // Creator (#10) can remove their own Author (*) tag
    await expect(
      service.detachTag(ETaggableEntityType.ARTWORK, id('1'), id('51'), {
        userId: id('10'),
      }),
    ).resolves.toBeDefined();
  });
});
