import { AutoIncrementID } from '../../../common/types/common.type';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { ETagRelationType } from '../constants/tag.constant';
import { TagClosureEntity } from '../entities/tag-closure.entity';
import { TagRelationEntity } from '../entities/tag-relation.entity';
import { TagEntity } from '../entities/tag.entity';
import { TagHierarchyService } from './tag-hierarchy.service';

describe('TagHierarchyService (Semantic DAG & Closure Table)', () => {
  const id = (v: string) => v as AutoIncrementID;

  function createHarness() {
    const tags = new Map<string, Partial<TagEntity>>([
      ['1', { id: id('1'), name: 'Fantasy', slug: 'fantasy' }],
      [
        '2',
        {
          id: id('2'),
          name: '葬送のフリーレン',
          slug: 'frieren-beyond-journeys-end',
        },
      ],
      ['3', { id: id('3'), name: 'フリーレン', slug: 'frieren-character' }],
    ]);

    const relations: TagRelationEntity[] = [];
    const closures = new Map<string, number>(); // key `${ancestor}:${descendant}` -> depth
    const queries: string[] = [];

    const manager = {
      findOne: jest.fn(
        async (entity: unknown, opts: { where: Record<string, unknown> }) => {
          if (entity === TagEntity) {
            return tags.get(String(opts.where.id)) ?? null;
          }
          if (entity === TagRelationEntity) {
            return (
              relations.find(
                (r) =>
                  String(r.sourceTagId) === String(opts.where.sourceTagId) &&
                  String(r.targetTagId) === String(opts.where.targetTagId) &&
                  r.relationType === opts.where.relationType,
              ) ?? null
            );
          }
          if (entity === TagClosureEntity) {
            const key = `${opts.where.ancestorId}:${opts.where.descendantId}`;
            if (closures.has(key)) {
              return {
                ancestorId: opts.where.ancestorId,
                descendantId: opts.where.descendantId,
                depth: closures.get(key),
              };
            }
            return null;
          }
          return null;
        },
      ),
      create: jest.fn(
        (_entity: unknown, payload: Partial<TagRelationEntity>) => ({
          id: id(String(relations.length + 1)),
          ...payload,
        }),
      ),
      save: jest.fn(async (_entity: unknown, entityObj: TagRelationEntity) => {
        relations.push(entityObj);
        return entityObj;
      }),
      delete: jest.fn(
        async (_entity: unknown, where: Record<string, unknown>) => {
          const idx = relations.findIndex(
            (r) =>
              String(r.sourceTagId) === String(where.sourceTagId) &&
              String(r.targetTagId) === String(where.targetTagId) &&
              r.relationType === where.relationType,
          );
          if (idx === -1) return { affected: 0 };
          relations.splice(idx, 1);
          return { affected: 1 };
        },
      ),
      query: jest.fn(async (sql: string, params?: unknown[]) => {
        queries.push(sql);
        if (sql.includes('VALUES ($1, $1, 0)') && params?.[0]) {
          const tId = String(params[0]);
          if (!closures.has(`${tId}:${tId}`)) {
            closures.set(`${tId}:${tId}`, 0);
          }
        } else if (
          sql.includes('CROSS JOIN tag_closure') &&
          params?.length === 2
        ) {
          const src = String(params[0]);
          const dst = String(params[1]);
          const ancestorsOfSrc: Array<[string, number]> = [];
          const descendantsOfDst: Array<[string, number]> = [];
          for (const [key, depth] of closures.entries()) {
            const [anc, desc] = key.split(':');
            if (desc === src) ancestorsOfSrc.push([anc, depth]);
            if (anc === dst) descendantsOfDst.push([desc, depth]);
          }
          for (const [anc, d1] of ancestorsOfSrc) {
            for (const [desc, d2] of descendantsOfDst) {
              const k = `${anc}:${desc}`;
              const nextDepth = d1 + d2 + 1;
              const prev = closures.get(k);
              closures.set(
                k,
                prev !== undefined ? Math.min(prev, nextDepth) : nextDepth,
              );
            }
          }
        }
        return [];
      }),
    };

    const dataSource = {
      manager,
      transaction: jest.fn(
        async (cb: (em: typeof manager) => Promise<unknown>) => cb(manager),
      ),
    } as unknown as DataSource;

    const service = new TagHierarchyService(
      dataSource,
      {} as Repository<TagEntity>,
      {} as Repository<TagRelationEntity>,
      {} as Repository<TagClosureEntity>,
    );

    return { service, closures, relations, queries };
  }

  it('rejects self-referencing tag links immediately', async () => {
    const { service } = createHarness();
    await expect(
      service.addRelation(id('1'), id('1'), ETagRelationType.HIERARCHY),
    ).rejects.toThrow(BadRequestException);
  });

  it('builds multi-level transitive closure paths and rejects direct or transitive cycles', async () => {
    const { service, closures } = createHarness();

    // 1 (Fantasy) -> 2 (Frieren Series) -> 3 (Frieren Character)
    await service.addRelation(id('1'), id('2'), ETagRelationType.HIERARCHY);
    await service.addRelation(id('2'), id('3'), ETagRelationType.HIERARCHY);

    expect(closures.get('1:2')).toBe(1);
    expect(closures.get('2:3')).toBe(1);
    expect(closures.get('1:3')).toBe(2);

    // Attempting 3 -> 1 would create a 3-node cycle (1 -> 2 -> 3 -> 1)
    await expect(
      service.addRelation(id('3'), id('1'), ETagRelationType.HIERARCHY),
    ).rejects.toThrow(BadRequestException);

    // Duplicate edge rejected with ConflictException
    await expect(
      service.addRelation(id('1'), id('2'), ETagRelationType.HIERARCHY),
    ).rejects.toThrow(ConflictException);
  });

  it('triggers full DAG closure rebuild when removing a HIERARCHY edge and throws NotFound on missing edge', async () => {
    const { service, queries } = createHarness();

    await service.addRelation(id('1'), id('2'), ETagRelationType.HIERARCHY);
    await service.removeRelation(id('1'), id('2'), ETagRelationType.HIERARCHY);

    expect(queries.some((q) => q.includes('WITH RECURSIVE dag_paths'))).toBe(
      true,
    );

    await expect(
      service.removeRelation(id('1'), id('2'), ETagRelationType.HIERARCHY),
    ).rejects.toThrow(NotFoundException);
  });
});
