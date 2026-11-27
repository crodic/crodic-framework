import { AutoIncrementID } from '../../../common/types/common.type';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  In,
  Not,
  ObjectLiteral,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { ETaggableEntityType, ETagStatus } from '../constants/tag.constant';
import { EntityTagEntity } from '../entities/entity-tag.entity';
import { TagAliasEntity } from '../entities/tag-alias.entity';
import { TagTranslationEntity } from '../entities/tag-translation.entity';
import { TagEntity } from '../entities/tag.entity';
import { TagHierarchyService } from '../services/tag-hierarchy.service';
import { TagMuteService } from '../services/tag-mute.service';
import { TagNormalizationService } from '../services/tag-normalization.service';

export interface BooleanTagFilterOptions {
  /** Space-separated tag query string, e.g. "genshin_impact furina -r18" */
  tagQuery?: string;
  /** Explicit canonical slugs/names that MUST all match (AND) */
  tagsAll?: string[];
  /** Explicit canonical slugs/names where AT LEAST ONE matches (OR) */
  tagsAny?: string[];
  /** Explicit canonical slugs/names that MUST NOT match (NOT) */
  tagsNone?: string[];
  /** Expand matched tags to include DAG child tags via tag_closure (default: true) */
  expandHierarchy?: boolean;
  /** Apply personalized user NG-Tag mutes when userId is provided */
  currentUserId?: AutoIncrementID | null;
}

@Injectable()
export class TagQueryFilterHelper {
  constructor(
    @InjectRepository(TagEntity)
    private readonly tagRepository: Repository<TagEntity>,
    @InjectRepository(TagAliasEntity)
    private readonly aliasRepository: Repository<TagAliasEntity>,
    @InjectRepository(TagTranslationEntity)
    private readonly translationRepository: Repository<TagTranslationEntity>,
    @InjectRepository(EntityTagEntity)
    private readonly entityTagRepository: Repository<EntityTagEntity>,
    private readonly normalizationService: TagNormalizationService,
    private readonly hierarchyService: TagHierarchyService,
    private readonly tagMuteService: TagMuteService,
  ) {}

  /**
   * Parses a boolean tag query string (e.g. "frieren OR fern -ai_generated")
   * into structured AND, OR, and NOT token lists.
   */
  parseBooleanQuery(rawQuery?: string): {
    mustInclude: string[];
    anyInclude: string[];
    mustExclude: string[];
  } {
    const mustInclude: string[] = [];
    const anyInclude: string[] = [];
    const mustExclude: string[] = [];

    if (!rawQuery?.trim()) {
      return { mustInclude, anyInclude, mustExclude };
    }

    const tokens = rawQuery.trim().split(/\s+/).filter(Boolean);
    for (let i = 0; i < tokens.length; i++) {
      const tok = tokens[i]!;
      if (tok.toUpperCase() === 'OR') continue;

      const nextIsOr = tokens[i + 1]?.toUpperCase() === 'OR';
      const prevWasOr = i > 0 && tokens[i - 1]?.toUpperCase() === 'OR';

      if (tok.startsWith('-') && tok.length > 1) {
        mustExclude.push(tok.slice(1));
      } else if (nextIsOr || prevWasOr) {
        anyInclude.push(tok);
      } else {
        mustInclude.push(tok);
      }
    }

    return { mustInclude, anyInclude, mustExclude };
  }

  /**
   * Resolves raw user search tokens (canonical names, slugs, aliases, or translations)
   * into canonical Tag IDs.
   */
  async resolveTokensToTagIds(tokens: string[]): Promise<AutoIncrementID[]> {
    const resolved = await Promise.all(
      tokens.map((raw) => this.resolveTokenToTagId(raw)),
    );
    return resolved.filter((id): id is AutoIncrementID => id !== null);
  }

  private async resolveTokenToTagId(
    raw: string,
  ): Promise<AutoIncrementID | null> {
    const { normalized, unaccented } =
      this.normalizationService.normalizeSearchTerm(raw);
    if (!unaccented) return null;

    const slug = this.normalizationService.toSlug(raw);
    let tag = await this.tagRepository.findOne({
      where: [
        { slug: raw },
        { slug },
        { normalizedName: normalized },
        { unaccentedName: unaccented },
      ],
    });

    if (!tag) {
      const alias = await this.aliasRepository.findOne({
        where: [
          { normalizedAlias: normalized },
          { unaccentedAlias: unaccented },
        ],
      });
      if (alias) {
        tag = await this.tagRepository.findOne({ where: { id: alias.tagId } });
      }
    }

    if (!tag) {
      const tr = await this.translationRepository.findOne({
        where: [{ normalizedName: normalized }, { unaccentedName: unaccented }],
      });
      if (tr) {
        tag = await this.tagRepository.findOne({ where: { id: tr.tagId } });
      }
    }

    if (tag?.mergedIntoId) return tag.mergedIntoId;
    // Unmatched required tokens use an impossible ID so AND filters match no rows.
    return tag?.id ?? ('-1' as AutoIncrementID);
  }

  /**
   * Applies Boolean Tag Filtering + Synonym/Hierarchy Expansion + User NG-Tag Muting
   * onto any TypeORM SelectQueryBuilder whose root entity has an `id` column.
   */
  async applyTagFilters<T extends ObjectLiteral>(
    qb: SelectQueryBuilder<T>,
    entityAlias: string,
    entityType: ETaggableEntityType,
    options: BooleanTagFilterOptions,
  ): Promise<SelectQueryBuilder<T>> {
    const parsed = this.parseBooleanQuery(options.tagQuery);
    const expand = options.expandHierarchy !== false;

    const allTokens = [...(options.tagsAll ?? []), ...parsed.mustInclude];
    const anyTokens = [...(options.tagsAny ?? []), ...parsed.anyInclude];
    const noneTokens = [...(options.tagsNone ?? []), ...parsed.mustExclude];

    // Resolve independent input tokens together to avoid serial database round trips.
    const resolvedAllTokens = await Promise.all(
      allTokens.map((raw) => this.resolveTokenToTagId(raw)),
    );
    const expandedAllTokens = expand
      ? await Promise.all(
          resolvedAllTokens.map((id) =>
            id === null || id === ('-1' as AutoIncrementID)
              ? []
              : this.hierarchyService.expandDescendantIds([id]),
          ),
        )
      : resolvedAllTokens.map((id) => (id === null ? [] : [id]));

    // 1. AND conditions (each required tag cluster must match)
    for (let idx = 0; idx < allTokens.length; idx++) {
      const resolvedId = resolvedAllTokens[idx];
      if (resolvedId === ('-1' as AutoIncrementID)) {
        qb.andWhere('1 = 0');
        return qb;
      }
      const clusterIds = expandedAllTokens[idx]!;

      const pType = `etAllType_${idx}`;
      const pIds = `etAllIds_${idx}`;
      qb.andWhere(
        `EXISTS (
          SELECT 1 FROM entity_tags et_all
          WHERE et_all.entity_type = :${pType}
            AND et_all.entity_id = ${entityAlias}.id
            AND et_all.tag_id IN (:...${pIds})
        )`,
        { [pType]: entityType, [pIds]: clusterIds },
      );
    }

    // 2. OR conditions
    if (anyTokens.length > 0) {
      const resolvedAny = (await this.resolveTokensToTagIds(anyTokens)).filter(
        (id) => id !== ('-1' as AutoIncrementID),
      );
      if (resolvedAny.length === 0) {
        qb.andWhere('1 = 0');
        return qb;
      }
      const clusterIds = expand
        ? await this.hierarchyService.expandDescendantIds(resolvedAny)
        : resolvedAny;

      qb.andWhere(
        `EXISTS (
          SELECT 1 FROM entity_tags et_any
          WHERE et_any.entity_type = :etAnyType
            AND et_any.entity_id = ${entityAlias}.id
            AND et_any.tag_id IN (:...etAnyIds)
        )`,
        { etAnyType: entityType, etAnyIds: clusterIds },
      );
    }

    // 3. NOT conditions + User Muted Tags (NG Filter)
    const explicitExcludeIds =
      noneTokens.length > 0
        ? (await this.resolveTokensToTagIds(noneTokens)).filter(
            (id) => id !== ('-1' as AutoIncrementID),
          )
        : [];
    const expandedExcludeIds =
      explicitExcludeIds.length > 0 && expand
        ? await this.hierarchyService.expandDescendantIds(explicitExcludeIds)
        : explicitExcludeIds;

    const userMutedIds = await this.tagMuteService.getExpandedMutedTagIds(
      options.currentUserId,
    );

    const combinedExcluded = Array.from(
      new Set<string>([
        ...expandedExcludeIds.map(String),
        ...userMutedIds.map(String),
      ]),
    ) as AutoIncrementID[];

    if (combinedExcluded.length > 0) {
      qb.andWhere(
        `NOT EXISTS (
          SELECT 1 FROM entity_tags et_not
          WHERE et_not.entity_type = :etNotType
            AND et_not.entity_id = ${entityAlias}.id
            AND et_not.tag_id IN (:...etNotIds)
        )`,
        { etNotType: entityType, etNotIds: combinedExcluded },
      );
    }

    return qb;
  }

  /**
   * Evaluates a standalone boolean tag expression (AND, OR, -NOT, taxonomy closure expansion,
   * and user NG-tag mutes) against both Canonical Tags and Polymorphic EntityTag attachments.
   */
  async evaluateStandaloneBooleanSearch(options: {
    tagQuery?: string;
    expandHierarchy?: boolean;
    currentUserId?: AutoIncrementID | null;
    entityType?: ETaggableEntityType;
    page?: number;
    limit?: number;
  }): Promise<{
    parsed: {
      mustInclude: string[];
      anyInclude: string[];
      mustExclude: string[];
    };
    matchedTagIds: AutoIncrementID[];
    excludedTagIds: AutoIncrementID[];
    matchedEntityKeys: {
      entityType: ETaggableEntityType;
      entityId: AutoIncrementID;
    }[];
    totalEntities: number;
  }> {
    const parsed = this.parseBooleanQuery(options.tagQuery);
    const expand = options.expandHierarchy !== false;
    const page = Math.max(options.page ?? 1, 1);
    const limit = Math.min(Math.max(options.limit ?? 12, 1), 50);

    const explicitExcludeIds =
      parsed.mustExclude.length > 0
        ? (await this.resolveTokensToTagIds(parsed.mustExclude)).filter(
            (id) => id !== ('-1' as AutoIncrementID),
          )
        : [];
    const expandedExcludeIds =
      explicitExcludeIds.length > 0 && expand
        ? await this.hierarchyService.expandDescendantIds(explicitExcludeIds)
        : explicitExcludeIds;

    const userMutedIds = await this.tagMuteService.getExpandedMutedTagIds(
      options.currentUserId,
    );

    const excludedTagIds = Array.from(
      new Set<string>([
        ...expandedExcludeIds.map(String),
        ...userMutedIds.map(String),
      ]),
    ) as AutoIncrementID[];

    const positiveTokens = [...parsed.mustInclude, ...parsed.anyInclude];
    let matchedTagIds: AutoIncrementID[];

    if (positiveTokens.length > 0) {
      const resolvedPositive = (
        await this.resolveTokensToTagIds(positiveTokens)
      ).filter((id) => id !== ('-1' as AutoIncrementID));

      const expandedPositive =
        resolvedPositive.length > 0 && expand
          ? await this.hierarchyService.expandDescendantIds(resolvedPositive)
          : resolvedPositive;

      const excludedSet = new Set(excludedTagIds.map(String));
      matchedTagIds = expandedPositive.filter(
        (id) => !excludedSet.has(String(id)),
      );
    } else {
      const topTags = await this.tagRepository.find({
        where:
          excludedTagIds.length > 0
            ? { status: ETagStatus.ACTIVE, id: Not(In(excludedTagIds)) }
            : { status: ETagStatus.ACTIVE },
        order: { usageCount: 'DESC' },
        take: limit,
      });
      matchedTagIds = topTags.map((item) => item.id);
    }

    // Polymorphic entity_tags boolean evaluation
    const qb = this.entityTagRepository
      .createQueryBuilder('et')
      .select('et.entityType', 'entityType')
      .addSelect('et.entityId', 'entityId')
      .addSelect('MAX(et.createdAt)', 'latestTaggedAt')
      .groupBy('et.entityType')
      .addGroupBy('et.entityId')
      .orderBy('MAX(et.createdAt)', 'DESC');

    if (options.entityType) {
      qb.andWhere('et.entityType = :filterEntityType', {
        filterEntityType: options.entityType,
      });
    }

    const resolvedMustInclude = await Promise.all(
      parsed.mustInclude.map((raw) => this.resolveTokenToTagId(raw)),
    );
    const expandedMustInclude = expand
      ? await Promise.all(
          resolvedMustInclude.map((id) =>
            id === null || id === ('-1' as AutoIncrementID)
              ? []
              : this.hierarchyService.expandDescendantIds([id]),
          ),
        )
      : resolvedMustInclude.map((id) => (id === null ? [] : [id]));
    for (let idx = 0; idx < parsed.mustInclude.length; idx++) {
      const resolvedId = resolvedMustInclude[idx];
      if (resolvedId === ('-1' as AutoIncrementID)) {
        return {
          parsed,
          matchedTagIds,
          excludedTagIds,
          matchedEntityKeys: [],
          totalEntities: 0,
        };
      }
      const clusterIds = expandedMustInclude[idx]!;
      const paramKey = `mustCluster_${idx}`;
      qb.andWhere(
        `EXISTS (
          SELECT 1 FROM entity_tags et_m
          WHERE et_m.entity_type = et.entity_type
            AND et_m.entity_id = et.entity_id
            AND et_m.tag_id IN (:...${paramKey})
        )`,
        { [paramKey]: clusterIds },
      );
    }

    if (parsed.anyInclude.length > 0) {
      const resolvedAny = (
        await this.resolveTokensToTagIds(parsed.anyInclude)
      ).filter((id) => id !== ('-1' as AutoIncrementID));
      if (resolvedAny.length === 0) {
        return {
          parsed,
          matchedTagIds,
          excludedTagIds,
          matchedEntityKeys: [],
          totalEntities: 0,
        };
      }
      const clusterIds = expand
        ? await this.hierarchyService.expandDescendantIds(resolvedAny)
        : resolvedAny;
      qb.andWhere(
        `EXISTS (
          SELECT 1 FROM entity_tags et_o
          WHERE et_o.entity_type = et.entity_type
            AND et_o.entity_id = et.entity_id
            AND et_o.tag_id IN (:...anyCluster)
        )`,
        { anyCluster: clusterIds },
      );
    }

    if (excludedTagIds.length > 0) {
      qb.andWhere(
        `NOT EXISTS (
          SELECT 1 FROM entity_tags et_x
          WHERE et_x.entity_type = et.entity_type
            AND et_x.entity_id = et.entity_id
            AND et_x.tag_id IN (:...excludedCluster)
        )`,
        { excludedCluster: excludedTagIds },
      );
    }

    const allRows = await qb.getRawMany<{
      entityType: ETaggableEntityType;
      entityId: AutoIncrementID;
    }>();
    const totalEntities = allRows.length;
    const pagedRows = allRows.slice((page - 1) * limit, page * limit);

    return {
      parsed,
      matchedTagIds,
      excludedTagIds,
      matchedEntityKeys: pagedRows,
      totalEntities,
    };
  }
}
