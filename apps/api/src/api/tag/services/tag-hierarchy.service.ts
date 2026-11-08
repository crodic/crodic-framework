import { AutoIncrementID } from '../../../common/types/common.type';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, In, Repository } from 'typeorm';
import { ETagRelationType, ETagStatus } from '../constants/tag.constant';
import { TagClosureEntity } from '../entities/tag-closure.entity';
import { TagRelationEntity } from '../entities/tag-relation.entity';
import { TagEntity } from '../entities/tag.entity';

export interface TagGraphSummary {
  parents: TagEntity[];
  children: TagEntity[];
  siblings: TagEntity[];
  related: TagEntity[];
  disambiguations: TagEntity[];
}

@Injectable()
export class TagHierarchyService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(TagEntity)
    private readonly tagRepository: Repository<TagEntity>,
    @InjectRepository(TagRelationEntity)
    private readonly relationRepository: Repository<TagRelationEntity>,
    @InjectRepository(TagClosureEntity)
    private readonly closureRepository: Repository<TagClosureEntity>,
  ) {}

  /**
   * Ensures a self-referencing depth-0 row exists in tag_closure for a tag.
   */
  async ensureSelfClosure(
    tagId: AutoIncrementID,
    manager?: EntityManager,
  ): Promise<void> {
    const em = manager ?? this.dataSource.manager;
    await em.query(
      `INSERT INTO tag_closure (ancestor_id, descendant_id, depth)
       VALUES ($1, $1, 0)
       ON CONFLICT (ancestor_id, descendant_id) DO NOTHING`,
      [tagId],
    );
  }

  /**
   * Adds a directed relation between two tags.
   * For HIERARCHY edges, enforces strict DAG acyclicity and updates the transitive closure table.
   */
  async addRelation(
    sourceTagId: AutoIncrementID,
    targetTagId: AutoIncrementID,
    relationType: ETagRelationType = ETagRelationType.HIERARCHY,
    sortOrder = 0,
  ): Promise<TagRelationEntity> {
    if (String(sourceTagId) === String(targetTagId)) {
      throw new BadRequestException('A tag cannot be linked to itself');
    }

    return this.dataSource.transaction(async (manager) => {
      const [sourceTag, targetTag] = await Promise.all([
        manager.findOne(TagEntity, { where: { id: sourceTagId } }),
        manager.findOne(TagEntity, { where: { id: targetTagId } }),
      ]);

      if (!sourceTag || !targetTag) {
        throw new NotFoundException('Source or target tag does not exist');
      }

      const existing = await manager.findOne(TagRelationEntity, {
        where: { sourceTagId, targetTagId, relationType },
      });
      if (existing) {
        throw new ConflictException('This tag relation already exists');
      }

      if (relationType === ETagRelationType.HIERARCHY) {
        await this.ensureSelfClosure(sourceTagId, manager);
        await this.ensureSelfClosure(targetTagId, manager);

        // Cycle check: if targetTag is already an ancestor of sourceTag, adding source->target creates a cycle
        const cycle = await manager.findOne(TagClosureEntity, {
          where: {
            ancestorId: targetTagId,
            descendantId: sourceTagId,
          },
        });
        if (cycle) {
          throw new BadRequestException(
            'Circular tag hierarchy detected: child tag is already an ancestor of parent tag',
          );
        }
      }

      const relation = manager.create(TagRelationEntity, {
        sourceTagId,
        targetTagId,
        relationType,
        sortOrder,
      });
      const saved = await manager.save(TagRelationEntity, relation);

      if (relationType === ETagRelationType.HIERARCHY) {
        await manager.query(
          `INSERT INTO tag_closure (ancestor_id, descendant_id, depth)
           SELECT p.ancestor_id, c.descendant_id, MIN(p.depth + c.depth + 1)
           FROM tag_closure p
           CROSS JOIN tag_closure c
           WHERE p.descendant_id = $1 AND c.ancestor_id = $2
           GROUP BY p.ancestor_id, c.descendant_id
           ON CONFLICT (ancestor_id, descendant_id)
           DO UPDATE SET depth = LEAST(tag_closure.depth, EXCLUDED.depth)`,
          [sourceTagId, targetTagId],
        );
      }

      return saved;
    });
  }

  /**
   * Removes a relation edge and safely rebuilds the DAG closure table if HIERARCHY was modified.
   */
  async removeRelation(
    sourceTagId: AutoIncrementID,
    targetTagId: AutoIncrementID,
    relationType: ETagRelationType,
  ): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const result = await manager.delete(TagRelationEntity, {
        sourceTagId,
        targetTagId,
        relationType,
      });

      if (!result.affected) {
        throw new NotFoundException('Tag relation not found');
      }

      if (relationType === ETagRelationType.HIERARCHY) {
        await this.rebuildClosureTable(manager);
      }
    });
  }

  /**
   * Rebuilds the complete transitive closure table from active HIERARCHY edges.
   * Preserves diamond DAG alternate paths accurately.
   */
  async rebuildClosureTable(manager?: EntityManager): Promise<void> {
    const runRebuild = async (em: EntityManager) => {
      await em.query(`DELETE FROM tag_closure`);
      await em.query(
        `INSERT INTO tag_closure (ancestor_id, descendant_id, depth)
         SELECT id, id, 0 FROM tags WHERE deleted_at IS NULL`,
      );
      await em.query(
        `WITH RECURSIVE dag_paths(ancestor_id, descendant_id, depth, visited) AS (
           SELECT r.source_tag_id, r.target_tag_id, 1, ARRAY[r.source_tag_id, r.target_tag_id]
           FROM tag_relations r
           INNER JOIN tags ts ON ts.id = r.source_tag_id AND ts.deleted_at IS NULL
           INNER JOIN tags tt ON tt.id = r.target_tag_id AND tt.deleted_at IS NULL
           WHERE r.relation_type = 'hierarchy'
           UNION ALL
           SELECT dp.ancestor_id, r.target_tag_id, dp.depth + 1, dp.visited || r.target_tag_id
           FROM dag_paths dp
           INNER JOIN tag_relations r ON r.source_tag_id = dp.descendant_id
           WHERE r.relation_type = 'hierarchy'
             AND NOT (r.target_tag_id = ANY(dp.visited))
             AND dp.depth < 16
         )
         INSERT INTO tag_closure (ancestor_id, descendant_id, depth)
         SELECT ancestor_id, descendant_id, MIN(depth)
         FROM dag_paths
         GROUP BY ancestor_id, descendant_id
         ON CONFLICT (ancestor_id, descendant_id)
         DO UPDATE SET depth = LEAST(tag_closure.depth, EXCLUDED.depth)`,
      );
    };

    if (manager) {
      await runRebuild(manager);
    } else {
      await this.dataSource.transaction(runRebuild);
    }
  }

  /**
   * Expands a list of canonical tag IDs to include all descendant tag IDs up to maxDepth.
   */
  async expandDescendantIds(
    tagIds: AutoIncrementID[],
    maxDepth = 8,
  ): Promise<AutoIncrementID[]> {
    if (tagIds.length === 0) return [];

    const rows = await this.closureRepository
      .createQueryBuilder('tc')
      .select('DISTINCT tc.descendant_id', 'descendantId')
      .where('tc.ancestor_id IN (:...tagIds)', { tagIds })
      .andWhere('tc.depth <= :maxDepth', { maxDepth })
      .getRawMany<{ descendantId: AutoIncrementID }>();

    const expanded = new Set<string>(tagIds.map(String));
    for (const row of rows) {
      expanded.add(String(row.descendantId));
    }

    return Array.from(expanded) as AutoIncrementID[];
  }

  /**
   * Fetches the immediate semantic neighborhood of a tag (Taxonomy Encyclopedia style):
   * Parent tags, Child tags, Sibling tags (sharing at least one parent), Related tags, and Disambiguations.
   */
  async getTagGraph(
    tagId: AutoIncrementID,
    siblingLimit = 20,
  ): Promise<TagGraphSummary> {
    const [incoming, outgoing] = await Promise.all([
      this.relationRepository.find({
        where: {
          targetTagId: tagId,
          relationType: ETagRelationType.HIERARCHY,
        },
        relations: ['sourceTag', 'sourceTag.translations'],
        order: { sortOrder: 'ASC', id: 'ASC' },
      }),
      this.relationRepository.find({
        where: { sourceTagId: tagId },
        relations: ['targetTag', 'targetTag.translations'],
        order: { sortOrder: 'ASC', id: 'ASC' },
      }),
    ]);

    const isActive = (t?: TagEntity | null): t is TagEntity =>
      Boolean(t && !t.deletedAt && t.status === ETagStatus.ACTIVE);

    const parents = incoming.map((r) => r.sourceTag).filter(isActive);
    const children = outgoing
      .filter((r) => r.relationType === ETagRelationType.HIERARCHY)
      .map((r) => r.targetTag)
      .filter(isActive);
    const related = outgoing
      .filter((r) => r.relationType === ETagRelationType.RELATED)
      .map((r) => r.targetTag)
      .filter(isActive);
    const disambiguations = outgoing
      .filter((r) => r.relationType === ETagRelationType.DISAMBIGUATION)
      .map((r) => r.targetTag)
      .filter(isActive);

    let siblings: TagEntity[] = [];
    if (parents.length > 0) {
      const parentIds = parents.map((p) => p.id);
      const siblingEdges = await this.relationRepository.find({
        where: {
          sourceTagId: In(parentIds),
          relationType: ETagRelationType.HIERARCHY,
        },
        relations: ['targetTag', 'targetTag.translations'],
        take: siblingLimit + 5,
      });

      const seen = new Set<string>([String(tagId)]);
      for (const edge of siblingEdges) {
        const candidate = edge.targetTag;
        if (isActive(candidate) && !seen.has(String(candidate.id))) {
          seen.add(String(candidate.id));
          siblings.push(candidate);
          if (siblings.length >= siblingLimit) break;
        }
      }
    }

    return {
      parents,
      children,
      siblings,
      related,
      disambiguations,
    };
  }
}
