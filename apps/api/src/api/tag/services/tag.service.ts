import {
  AllowedFilter,
  QueryBuilder,
  QueryParams,
} from '../../../common/query-builder';
import { AutoIncrementID } from '../../../common/types/common.type';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Brackets, DataSource, EntityManager, In, Repository } from 'typeorm';
import {
  EEntityTagLogAction,
  ETagAliasType,
  ETagCategory,
  ETagRelationType,
  ETagSafetyRating,
  ETagStatus,
  ETagTranslationSource,
} from '../constants/tag.constant';
import {
  CreateTagReqDto,
  TagAliasInputDto,
  TagTranslationInputDto,
  UpdateTagReqDto,
} from '../dto/tag-req.dto';
import {
  MergeTagPreviewResDto,
  TagDetailResDto,
  TagSummaryResDto,
  TagTooltipResDto,
} from '../dto/tag-res.dto';
import { EntityTagLogEntity } from '../entities/entity-tag-log.entity';
import { EntityTagEntity } from '../entities/entity-tag.entity';
import { TagAliasEntity } from '../entities/tag-alias.entity';
import { TagEncyclopediaEntity } from '../entities/tag-encyclopedia.entity';
import { TagRelationEntity } from '../entities/tag-relation.entity';
import { TagTranslationEntity } from '../entities/tag-translation.entity';
import { TagEntity } from '../entities/tag.entity';
import { UserMutedTagEntity } from '../entities/user-muted-tag.entity';
import { TagCacheService } from './tag-cache.service';
import { TagHierarchyService } from './tag-hierarchy.service';
import { TagNormalizationService } from './tag-normalization.service';

@Injectable()
export class TagService {
  private readonly logger = new Logger(TagService.name);

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(TagEntity)
    private readonly tagRepository: Repository<TagEntity>,
    @InjectRepository(TagTranslationEntity)
    private readonly translationRepository: Repository<TagTranslationEntity>,
    @InjectRepository(TagAliasEntity)
    private readonly aliasRepository: Repository<TagAliasEntity>,
    @InjectRepository(TagRelationEntity)
    private readonly relationRepository: Repository<TagRelationEntity>,
    @InjectRepository(TagEncyclopediaEntity)
    private readonly encyclopediaRepository: Repository<TagEncyclopediaEntity>,
    @InjectRepository(EntityTagEntity)
    private readonly entityTagRepository: Repository<EntityTagEntity>,
    @InjectRepository(UserMutedTagEntity)
    private readonly mutedTagRepository: Repository<UserMutedTagEntity>,
    private readonly normalizationService: TagNormalizationService,
    private readonly hierarchyService: TagHierarchyService,
    private readonly cacheService: TagCacheService,
  ) {}

  toSummaryDto(tag: TagEntity, locale = 'en'): TagSummaryResDto {
    const preferredTr =
      tag.translations?.find((t) => t.locale === locale) ??
      tag.translations?.find((t) => t.locale === 'en') ??
      null;

    const preferredEnc =
      tag.encyclopedias?.find(
        (e) => e.locale === locale && (e.featuredImageUrl || e.featuredFile),
      ) ??
      tag.encyclopedias?.find(
        (e) => e.locale === 'en' && (e.featuredImageUrl || e.featuredFile),
      ) ??
      tag.encyclopedias?.find((e) => e.featuredImageUrl || e.featuredFile) ??
      null;

    return {
      id: tag.id,
      slug: tag.slug,
      name: tag.name,
      translatedName: preferredTr?.translatedName ?? null,
      shortSummary: preferredTr?.shortSummary ?? null,
      featuredImageUrl:
        preferredEnc?.featuredImageUrl ||
        preferredEnc?.featuredFile?.url ||
        null,
      category: tag.category,
      safetyRating: tag.safetyRating,
      status: tag.status,
      isOfficial: tag.isOfficial,
      isSystem: tag.isSystem,
      usageCount: Number(tag.usageCount || 0),
      trendingScore: Number(tag.trendingScore || 0),
      translations: tag.translations?.map((tr) => ({
        id: tr.id,
        locale: tr.locale,
        translatedName: tr.translatedName,
        shortSummary: tr.shortSummary ?? null,
        source: tr.source,
      })),
      aliases: tag.aliases?.map((al) => ({
        id: al.id,
        aliasName: al.aliasName,
        aliasType: al.aliasType,
        locale: al.locale ?? null,
      })),
      createdAt: tag.createdAt,
      updatedAt: tag.updatedAt,
    };
  }

  /**
   * Lists tags using the monorepo QueryBuilder with strict whitelist enforcement.
   */
  async findAll(query: QueryParams, locale = 'en', publicOnly = false) {
    const baseQb = this.tagRepository
      .createQueryBuilder('tag')
      .leftJoinAndSelect('tag.translations', 'translations')
      .leftJoinAndSelect('tag.aliases', 'aliases')
      .leftJoinAndSelect('tag.encyclopedias', 'encyclopedias')
      .leftJoinAndSelect('encyclopedias.featuredFile', 'encFeaturedFile');

    if (publicOnly) {
      baseQb.andWhere('tag.status = :activeStatus', {
        activeStatus: ETagStatus.ACTIVE,
      });
    }

    const paginated = await QueryBuilder.for(baseQb, query)
      .allowedFilters([
        AllowedFilter.exact('category'),
        AllowedFilter.exact('safetyRating'),
        AllowedFilter.exact('status'),
        AllowedFilter.exact('isOfficial'),
        AllowedFilter.exact('isSystem'),
        AllowedFilter.partial('name'),
        AllowedFilter.partial('slug'),
        AllowedFilter.trashed(),
        AllowedFilter.callback('search', (qb, value) => {
          const term = Array.isArray(value) ? String(value[0]) : String(value);
          const { normalized, unaccented } =
            this.normalizationService.normalizeSearchTerm(term);
          if (!unaccented) return;
          qb.andWhere(
            new Brackets((b) => {
              b.where('tag.normalizedName ILIKE :sNorm', {
                sNorm: `%${normalized}%`,
              })
                .orWhere('tag.unaccentedName ILIKE :sUnacc', {
                  sUnacc: `%${unaccented}%`,
                })
                .orWhere('translations.normalizedName ILIKE :sNorm', {
                  sNorm: `%${normalized}%`,
                })
                .orWhere('translations.unaccentedName ILIKE :sUnacc', {
                  sUnacc: `%${unaccented}%`,
                })
                .orWhere('aliases.normalizedAlias ILIKE :sNorm', {
                  sNorm: `%${normalized}%`,
                });
            }),
          );
        }),
      ])
      .allowedSorts([
        'id',
        'name',
        'usageCount',
        'trendingScore',
        'createdAt',
        'updatedAt',
      ])
      .defaultSort('-usageCount')
      .setLimit(20, 100)
      .paginate();

    return {
      data: paginated.data.map((tag) => this.toSummaryDto(tag, locale)),
      meta: paginated.meta,
    };
  }

  /**
   * Creates a new canonical tag with optional localized translations and orthographic aliases.
   */
  async create(
    dto: CreateTagReqDto,
    adminId?: AutoIncrementID,
  ): Promise<TagDetailResDto> {
    const parsed = this.normalizationService.parseTagInput(dto.name, dto.slug);

    const savedId = await this.dataSource.transaction(async (manager) => {
      const conflict = await manager.findOne(TagEntity, {
        where: [
          { normalizedName: parsed.normalizedName },
          { slug: parsed.slug },
        ],
      });
      if (conflict) {
        throw new ConflictException(
          `Tag with name "${parsed.displayName}" or slug "${parsed.slug}" already exists`,
        );
      }

      const aliasConflict = await manager.findOne(TagAliasEntity, {
        where: { normalizedAlias: parsed.normalizedName },
      });
      if (aliasConflict) {
        throw new ConflictException(
          `"${parsed.displayName}" is already registered as an alias of another tag`,
        );
      }

      const tag = manager.create(TagEntity, {
        name: parsed.displayName,
        slug: parsed.slug,
        normalizedName: parsed.normalizedName,
        unaccentedName: parsed.unaccentedName,
        category: dto.category ?? ETagCategory.GENERAL,
        safetyRating: dto.safetyRating ?? ETagSafetyRating.SAFE,
        status: dto.status ?? ETagStatus.ACTIVE,
        isOfficial: dto.isOfficial ?? false,
        isSystem: dto.isSystem ?? false,
        createdByAdminId: adminId ?? null,
      });

      const saved = await manager.save(TagEntity, tag);
      await this.hierarchyService.ensureSelfClosure(saved.id, manager);

      if (dto.translations?.length) {
        await this.syncTranslations(manager, saved.id, dto.translations);
      }

      if (dto.aliases?.length) {
        await this.syncAliases(
          manager,
          saved.id,
          parsed.normalizedName,
          dto.aliases,
        );
      }

      return saved.id;
    });

    await this.cacheService.bumpVersion();
    return this.findOneById(savedId);
  }

  async update(
    id: AutoIncrementID,
    dto: UpdateTagReqDto,
  ): Promise<TagDetailResDto> {
    await this.dataSource.transaction(async (manager) => {
      const tag = await manager.findOne(TagEntity, { where: { id } });
      if (!tag) {
        throw new NotFoundException('Tag not found');
      }

      if (dto.name !== undefined || dto.slug !== undefined) {
        const parsed = this.normalizationService.parseTagInput(
          dto.name ?? tag.name,
          dto.slug ?? (dto.name ? undefined : tag.slug),
        );

        const conflict = await manager
          .createQueryBuilder(TagEntity, 't')
          .where('t.id != :id', { id })
          .andWhere(
            new Brackets((b) => {
              b.where('t.normalizedName = :norm', {
                norm: parsed.normalizedName,
              }).orWhere('t.slug = :slug', { slug: parsed.slug });
            }),
          )
          .getOne();

        if (conflict) {
          throw new ConflictException(
            'Another tag already uses this canonical name or slug',
          );
        }

        tag.name = parsed.displayName;
        tag.normalizedName = parsed.normalizedName;
        tag.unaccentedName = parsed.unaccentedName;
        tag.slug = parsed.slug;
      }

      if (dto.category !== undefined) tag.category = dto.category;
      if (dto.safetyRating !== undefined) tag.safetyRating = dto.safetyRating;
      if (dto.status !== undefined) tag.status = dto.status;
      if (dto.isOfficial !== undefined) tag.isOfficial = dto.isOfficial;
      if (dto.isSystem !== undefined) tag.isSystem = dto.isSystem;

      await manager.save(TagEntity, tag);

      if (dto.translations !== undefined) {
        await this.syncTranslations(manager, tag.id, dto.translations);
      }

      if (dto.aliases !== undefined) {
        await this.syncAliases(
          manager,
          tag.id,
          tag.normalizedName,
          dto.aliases,
        );
      }
    });

    await this.cacheService.bumpVersion();
    return this.findOneById(id);
  }

  async remove(id: AutoIncrementID): Promise<{ message: string }> {
    const tag = await this.tagRepository.findOne({ where: { id } });
    if (!tag) {
      throw new NotFoundException('Tag not found');
    }

    if (tag.isSystem) {
      throw new ForbiddenException('System-protected tags cannot be deleted');
    }

    await this.dataSource.transaction(async (manager) => {
      await manager.delete(TagAliasEntity, { tagId: id });
      await manager.softDelete(TagEntity, { id });
      await this.hierarchyService.rebuildClosureTable(manager);
    });

    await this.cacheService.bumpVersion();
    return { message: 'Tag deleted successfully' };
  }

  async findOneById(
    id: AutoIncrementID,
    locale = 'en',
    currentUserId?: AutoIncrementID | null,
  ): Promise<TagDetailResDto> {
    const tag = await this.tagRepository.findOne({
      where: { id },
      relations: ['translations', 'aliases', 'mergedInto'],
    });

    if (!tag) {
      throw new NotFoundException('Tag not found');
    }

    return this.hydrateTagDetail(tag, locale, currentUserId);
  }

  /**
   * Resolves a tag by slug, alias, or merged target.
   * When matched via an alias or merged record, populates redirectSlug so Next.js RSC can issue a 301/308 canonical redirect.
   */
  async findBySlugOrAlias(
    slugOrName: string,
    locale = 'en',
    currentUserId?: AutoIncrementID | null,
  ): Promise<TagDetailResDto> {
    const decoded = decodeURIComponent(slugOrName);
    const slugCandidate = this.normalizationService.toSlug(decoded);
    const { normalized, unaccented } =
      this.normalizationService.normalizeSearchTerm(decoded);

    let tag = await this.tagRepository.findOne({
      where: [
        { slug: decoded },
        { slug: slugCandidate },
        { normalizedName: normalized },
      ],
      relations: ['translations', 'aliases', 'mergedInto'],
    });

    let matchedViaAlias = false;

    if (!tag) {
      const alias = await this.aliasRepository.findOne({
        where: [
          { normalizedAlias: normalized },
          { unaccentedAlias: unaccented },
        ],
      });
      if (alias) {
        matchedViaAlias = true;
        tag = await this.tagRepository.findOne({
          where: { id: alias.tagId },
          relations: ['translations', 'aliases', 'mergedInto'],
        });
      }
    }

    if (!tag) {
      const tr = await this.translationRepository.findOne({
        where: [{ normalizedName: normalized }, { unaccentedName: unaccented }],
      });
      if (tr) {
        matchedViaAlias = true;
        tag = await this.tagRepository.findOne({
          where: { id: tr.tagId },
          relations: ['translations', 'aliases', 'mergedInto'],
        });
      }
    }

    if (!tag || tag.status === ETagStatus.BANNED) {
      throw new NotFoundException(`Tag "${decoded}" not found`);
    }

    if (tag.status === ETagStatus.MERGED && tag.mergedIntoId) {
      const canonical = await this.tagRepository.findOne({
        where: { id: tag.mergedIntoId },
        relations: ['translations', 'aliases', 'mergedInto'],
      });
      if (canonical) {
        const detail = await this.hydrateTagDetail(
          canonical,
          locale,
          currentUserId,
        );
        detail.redirectSlug = canonical.slug;
        return detail;
      }
    }

    const detail = await this.hydrateTagDetail(tag, locale, currentUserId);
    if (matchedViaAlias || tag.slug !== decoded) {
      detail.redirectSlug = tag.slug !== decoded ? tag.slug : null;
    }

    return detail;
  }

  /**
   * Lightweight cached payload for hover cards on the client.
   */
  async getTooltipBySlug(
    slug: string,
    locale = 'en',
  ): Promise<TagTooltipResDto> {
    const cacheKey = `tooltip:${slug}:${locale}`;
    const cached = await this.cacheService.getJson<TagTooltipResDto>(cacheKey);
    if (cached) return cached;

    const detail = await this.findBySlugOrAlias(slug, locale);
    const enc = await this.encyclopediaRepository.findOne({
      where: [
        { tagId: detail.id, locale },
        { tagId: detail.id, locale: 'en' },
      ],
      relations: ['featuredFile'],
    });

    const tooltip: TagTooltipResDto = {
      id: detail.id,
      slug: detail.slug,
      name: detail.name,
      translatedName: detail.translatedName ?? null,
      summary: detail.shortSummary ?? enc?.summary?.slice(0, 220) ?? null,
      featuredImageUrl:
        detail.featuredImageUrl ??
        enc?.featuredImageUrl ??
        enc?.featuredFile?.url ??
        null,
      category: detail.category,
      safetyRating: detail.safetyRating,
      isOfficial: detail.isOfficial,
      usageCount: detail.usageCount,
      parentTag: detail.graph.parents[0] ?? null,
    };

    await this.cacheService.setJson(cacheKey, tooltip, 900);
    return tooltip;
  }

  /**
   * Resolves a raw tag string from folksonomy user input to an active Canonical Tag,
   * creating a lightweight tag organically if none exists yet (Pixiv zero-friction folksonomy).
   */
  async resolveOrCreateCanonicalTag(
    rawInput: string,
    actor: {
      userId?: AutoIncrementID | null;
      adminId?: AutoIncrementID | null;
    },
    manager?: EntityManager,
  ): Promise<TagEntity> {
    const parsed = this.normalizationService.parseTagInput(rawInput);

    const execute = async (em: EntityManager): Promise<TagEntity> => {
      // 1. Direct canonical match
      let tag = await em.findOne(TagEntity, {
        where: { normalizedName: parsed.normalizedName },
        relations: ['translations'],
      });

      // 2. Alias match (表記揺れ resolution)
      if (!tag) {
        const alias = await em.findOne(TagAliasEntity, {
          where: { normalizedAlias: parsed.normalizedName },
        });
        if (alias) {
          tag = await em.findOne(TagEntity, {
            where: { id: alias.tagId },
            relations: ['translations'],
          });
        }
      }

      // 3. Exact translation match
      if (!tag) {
        const tr = await em.findOne(TagTranslationEntity, {
          where: { normalizedName: parsed.normalizedName },
        });
        if (tr) {
          tag = await em.findOne(TagEntity, {
            where: { id: tr.tagId },
            relations: ['translations'],
          });
        }
      }

      // Follow merge chain if necessary
      if (tag && tag.status === ETagStatus.MERGED && tag.mergedIntoId) {
        const target = await em.findOne(TagEntity, {
          where: { id: tag.mergedIntoId },
          relations: ['translations'],
        });
        if (target) tag = target;
      }

      if (tag) {
        if (tag.status === ETagStatus.BANNED) {
          throw new ForbiddenException(
            `Tag "${parsed.displayName}" is prohibited by community guidelines`,
          );
        }
        return tag;
      }

      // 4. Organic Folksonomy Creation
      let uniqueSlug = parsed.slug;
      const slugConflict = await em.findOne(TagEntity, {
        where: { slug: uniqueSlug },
      });
      if (slugConflict) {
        uniqueSlug = `${parsed.slug}-${Date.now().toString(36).slice(-4)}`;
      }

      const created = em.create(TagEntity, {
        name: parsed.displayName,
        slug: uniqueSlug,
        normalizedName: parsed.normalizedName,
        unaccentedName: parsed.unaccentedName,
        category: ETagCategory.GENERAL,
        safetyRating: ETagSafetyRating.SAFE,
        status: ETagStatus.ACTIVE,
        isOfficial: false,
        isSystem: false,
        createdByUserId: actor.userId ?? null,
        createdByAdminId: actor.adminId ?? null,
      });

      const saved = await em.save(TagEntity, created);
      await this.hierarchyService.ensureSelfClosure(saved.id, em);
      return saved;
    };

    const result = manager
      ? await execute(manager)
      : await this.dataSource.transaction(execute);
    await this.cacheService.bumpVersion();
    return result;
  }

  async getTrendingTags(
    locale = 'en',
    limit = 16,
  ): Promise<TagSummaryResDto[]> {
    const safeLimit = Math.min(Math.max(limit, 1), 50);
    const redisIds = await this.cacheService.getTopTrendingTagIds(safeLimit);

    let tags: TagEntity[] = [];
    if (redisIds.length > 0) {
      const found = await this.tagRepository.find({
        where: {
          id: In(redisIds),
          status: ETagStatus.ACTIVE,
          safetyRating: ETagSafetyRating.SAFE,
        },
        relations: [
          'translations',
          'encyclopedias',
          'encyclopedias.featuredFile',
        ],
      });
      const mapById = new Map(found.map((t) => [String(t.id), t]));
      tags = redisIds
        .map((id) => mapById.get(String(id)))
        .filter((t): t is TagEntity => Boolean(t));
    }

    if (tags.length < safeLimit) {
      const existingIds = tags.map((t) => t.id);
      const fallbackQb = this.tagRepository
        .createQueryBuilder('tag')
        .leftJoinAndSelect('tag.translations', 'translations')
        .leftJoinAndSelect('tag.encyclopedias', 'encyclopedias')
        .leftJoinAndSelect('encyclopedias.featuredFile', 'featuredFile')
        .where('tag.status = :status', { status: ETagStatus.ACTIVE })
        .andWhere('tag.safetyRating = :safe', {
          safe: ETagSafetyRating.SAFE,
        })
        .orderBy('tag.trendingScore', 'DESC')
        .addOrderBy('tag.usageCount', 'DESC')
        .take(safeLimit - tags.length);

      if (existingIds.length > 0) {
        fallbackQb.andWhere('tag.id NOT IN (:...existingIds)', { existingIds });
      }

      const fallback = await fallbackQb.getMany();
      tags = [...tags, ...fallback];
    }

    return tags.map((t) => this.toSummaryDto(t, locale));
  }

  /**
   * Computes an impact summary before merging sourceTagId into targetTagId.
   */
  async previewMerge(
    sourceTagId: AutoIncrementID,
    targetTagId: AutoIncrementID,
    locale = 'en',
  ): Promise<MergeTagPreviewResDto> {
    if (String(sourceTagId) === String(targetTagId)) {
      throw new BadRequestException('Cannot merge a tag into itself');
    }

    const [source, target] = await Promise.all([
      this.tagRepository.findOne({
        where: { id: sourceTagId },
        relations: ['translations', 'aliases'],
      }),
      this.tagRepository.findOne({
        where: { id: targetTagId },
        relations: ['translations', 'aliases'],
      }),
    ]);

    if (!source || !target) {
      throw new NotFoundException('Source or target tag not found');
    }

    if (source.isSystem) {
      throw new ForbiddenException('System tags cannot be merged away');
    }

    const [affectedEntityTagsCount, relationsToRewireCount] = await Promise.all(
      [
        this.entityTagRepository.count({ where: { tagId: sourceTagId } }),
        this.relationRepository.count({
          where: [{ sourceTagId }, { targetTagId: sourceTagId }],
        }),
      ],
    );

    return {
      sourceTag: this.toSummaryDto(source, locale),
      targetTag: this.toSummaryDto(target, locale),
      affectedEntityTagsCount,
      aliasesToTransferCount: (source.aliases?.length ?? 0) + 1,
      relationsToRewireCount,
    };
  }

  /**
   * Executes an atomic batch-safe tag merge (invocable via BullMQ worker or directly):
   * 1. Deduplicates overlapping entity_tags while preserving highest Author/Lock flags
   * 2. Rewires remaining entity_tags, aliases, translations, and DAG relations
   * 3. Converts sourceTag into a MERGED record and registers its canonical name as a LEGACY_MERGE alias
   * 4. Reconciles usage_count and rebuilds DAG closure table.
   */
  async executeMerge(
    sourceTagId: AutoIncrementID,
    targetTagId: AutoIncrementID,
    adminId?: AutoIncrementID | null,
  ): Promise<void> {
    if (String(sourceTagId) === String(targetTagId)) {
      throw new BadRequestException('Cannot merge a tag into itself');
    }

    await this.dataSource.transaction(async (manager) => {
      const [source, target] = await Promise.all([
        manager.findOne(TagEntity, {
          where: { id: sourceTagId },
          relations: ['translations', 'aliases'],
        }),
        manager.findOne(TagEntity, {
          where: { id: targetTagId },
          relations: ['translations', 'aliases'],
        }),
      ]);

      if (!source || !target) {
        throw new NotFoundException('Source or target tag not found');
      }

      if (source.isSystem) {
        throw new ForbiddenException('System tags cannot be merged away');
      }

      // 1. Elevate flags on target entity_tags where an entity already has BOTH source and target
      await manager.query(
        `UPDATE entity_tags tgt
         SET is_author_tag = (tgt.is_author_tag OR src.is_author_tag),
             is_locked = (tgt.is_locked OR src.is_locked)
         FROM entity_tags src
         WHERE src.tag_id = $1
           AND tgt.tag_id = $2
           AND src.entity_type = tgt.entity_type
           AND src.entity_id = tgt.entity_id`,
        [sourceTagId, targetTagId],
      );

      // Delete duplicate source entity_tags that overlapped with target
      await manager.query(
        `DELETE FROM entity_tags src
         USING entity_tags tgt
         WHERE src.tag_id = $1
           AND tgt.tag_id = $2
           AND src.entity_type = tgt.entity_type
           AND src.entity_id = tgt.entity_id`,
        [sourceTagId, targetTagId],
      );

      // Rewire remaining non-overlapping entity_tags to target
      await manager.update(
        EntityTagEntity,
        { tagId: sourceTagId },
        { tagId: targetTagId },
      );

      // 2. Transfer missing locale translations
      const targetLocales = new Set(
        (target.translations ?? []).map((t) => t.locale),
      );
      for (const tr of source.translations ?? []) {
        if (!targetLocales.has(tr.locale)) {
          await manager.update(
            TagTranslationEntity,
            { id: tr.id },
            { tagId: targetTagId },
          );
        }
      }

      // 3. Transfer aliases and create LEGACY_MERGE alias for source canonical name
      await manager.update(
        TagAliasEntity,
        { tagId: sourceTagId },
        { tagId: targetTagId },
      );

      if (source.normalizedName !== target.normalizedName) {
        const existingAlias = await manager.findOne(TagAliasEntity, {
          where: { normalizedAlias: source.normalizedName },
        });
        if (!existingAlias) {
          await manager.save(
            TagAliasEntity,
            manager.create(TagAliasEntity, {
              tagId: targetTagId,
              aliasName: source.name,
              normalizedAlias: source.normalizedName,
              unaccentedAlias: source.unaccentedName,
              aliasType: ETagAliasType.LEGACY_MERGE,
            }),
          );
        }
      }

      // 4. Rewire DAG relations avoiding self-edges and duplicates
      await manager.query(
        `DELETE FROM tag_relations
         WHERE (source_tag_id = $1 AND target_tag_id = $2)
            OR (source_tag_id = $2 AND target_tag_id = $1)`,
        [sourceTagId, targetTagId],
      );

      await manager.query(
        `UPDATE tag_relations r
         SET source_tag_id = $2
         WHERE r.source_tag_id = $1
           AND NOT EXISTS (
             SELECT 1 FROM tag_relations ex
             WHERE ex.source_tag_id = $2
               AND ex.target_tag_id = r.target_tag_id
               AND ex.relation_type = r.relation_type
           )`,
        [sourceTagId, targetTagId],
      );

      await manager.query(
        `UPDATE tag_relations r
         SET target_tag_id = $2
         WHERE r.target_tag_id = $1
           AND NOT EXISTS (
             SELECT 1 FROM tag_relations ex
             WHERE ex.source_tag_id = r.source_tag_id
               AND ex.target_tag_id = $2
               AND ex.relation_type = r.relation_type
           )`,
        [sourceTagId, targetTagId],
      );

      await manager.delete(TagRelationEntity, { sourceTagId });
      await manager.delete(TagRelationEntity, { targetTagId: sourceTagId });

      // 5. Mark source tag as MERGED and update counters
      source.status = ETagStatus.MERGED;
      source.mergedIntoId = targetTagId;
      source.usageCount = 0;
      await manager.save(TagEntity, source);

      // Redirect any chained merges pointing to sourceTagId -> targetTagId
      await manager.update(
        TagEntity,
        { mergedIntoId: sourceTagId },
        { mergedIntoId: targetTagId },
      );

      const newCount = await manager.count(EntityTagEntity, {
        where: { tagId: targetTagId },
      });
      await manager.update(
        TagEntity,
        { id: targetTagId },
        { usageCount: newCount },
      );

      await manager.save(
        EntityTagLogEntity,
        manager.create(EntityTagLogEntity, {
          entityType: 'cms_page' as any,
          entityId: '0' as AutoIncrementID,
          tagId: targetTagId,
          tagNameSnapshot: `${source.name} -> ${target.name}`,
          action: EEntityTagLogAction.MERGE_REWIRE,
          actorAdminId: adminId ?? null,
          metadata: { sourceTagId, targetTagId },
        }),
      );

      await this.hierarchyService.rebuildClosureTable(manager);
    });

    await this.cacheService.bumpVersion();
    this.logger.log(
      `Merged tag ${String(sourceTagId)} into ${String(targetTagId)}`,
    );
  }

  /**
   * Reconciles denormalized usage_count across tags.
   */
  async reconcileUsageCounts(tagIds?: AutoIncrementID[]): Promise<void> {
    if (tagIds && tagIds.length > 0) {
      await this.dataSource.query(
        `UPDATE tags t
         SET usage_count = COALESCE((
           SELECT COUNT(*)::bigint FROM entity_tags et WHERE et.tag_id = t.id
         ), 0)
         WHERE t.id = ANY($1::bigint[])`,
        [tagIds],
      );
    } else {
      await this.dataSource.query(
        `UPDATE tags t
         SET usage_count = COALESCE(sub.cnt, 0)
         FROM (
           SELECT tag_id, COUNT(*)::bigint AS cnt
           FROM entity_tags
           GROUP BY tag_id
         ) sub
         WHERE t.id = sub.tag_id`,
      );
    }
    await this.cacheService.bumpVersion();
  }

  /**
   * Computes related tags by co-occurrence when manual RELATED edges are sparse,
   * and updates time-decayed trending scores.
   */
  async refreshTrendingScores(): Promise<void> {
    await this.dataSource.query(
      `UPDATE tags t
       SET trending_score = (
         COALESCE((
           SELECT COUNT(*)::double precision * 10.0
           FROM entity_tags et
           WHERE et.tag_id = t.id
             AND et.created_at >= NOW() - INTERVAL '7 days'
         ), 0) + LN(GREATEST(t.usage_count, 0) + 1) * 2.0
       )
       WHERE t.deleted_at IS NULL AND t.status = 'active'`,
    );
    await this.cacheService.bumpVersion();
  }

  private async hydrateTagDetail(
    tag: TagEntity,
    locale: string,
    currentUserId?: AutoIncrementID | null,
  ): Promise<TagDetailResDto> {
    const [graph, encList, mutedRecord] = await Promise.all([
      this.hierarchyService.getTagGraph(tag.id),
      this.encyclopediaRepository.find({
        where: { tagId: tag.id },
        relations: ['featuredFile'],
      }),
      currentUserId
        ? this.mutedTagRepository.findOne({
            where: { userId: currentUserId, tagId: tag.id },
          })
        : Promise.resolve(null),
    ]);

    tag.encyclopedias = encList;

    return {
      ...this.toSummaryDto(tag, locale),
      redirectSlug: null,
      mergedIntoId: tag.mergedIntoId ?? null,
      isMutedByCurrentUser: Boolean(mutedRecord),
      hasEncyclopedia: encList.length > 0,
      graph: {
        parents: graph.parents.map((t) => this.toSummaryDto(t, locale)),
        children: graph.children.map((t) => this.toSummaryDto(t, locale)),
        siblings: graph.siblings.map((t) => this.toSummaryDto(t, locale)),
        related: graph.related.map((t) => this.toSummaryDto(t, locale)),
        disambiguations: graph.disambiguations.map((t) =>
          this.toSummaryDto(t, locale),
        ),
      },
    };
  }

  private async syncTranslations(
    manager: EntityManager,
    tagId: AutoIncrementID,
    inputs: TagTranslationInputDto[],
  ): Promise<void> {
    await manager.delete(TagTranslationEntity, { tagId });

    const seenLocales = new Set<string>();
    const entities: TagTranslationEntity[] = [];

    for (const item of inputs) {
      const cleanLocale = item.locale.trim().toLowerCase();
      if (!cleanLocale || seenLocales.has(cleanLocale)) continue;
      if (!item.translatedName?.trim()) continue;

      seenLocales.add(cleanLocale);
      const parsed = this.normalizationService.parseTagInput(
        item.translatedName,
      );

      entities.push(
        manager.create(TagTranslationEntity, {
          tagId,
          locale: cleanLocale,
          translatedName: parsed.displayName,
          normalizedName: parsed.normalizedName,
          unaccentedName: parsed.unaccentedName,
          shortSummary: item.shortSummary?.trim() || null,
          source: item.source ?? ETagTranslationSource.ADMIN,
        }),
      );
    }

    if (entities.length > 0) {
      await manager.save(TagTranslationEntity, entities);
    }
  }

  private async syncAliases(
    manager: EntityManager,
    tagId: AutoIncrementID,
    canonicalNormalizedName: string,
    inputs: TagAliasInputDto[],
  ): Promise<void> {
    await manager.delete(TagAliasEntity, { tagId });

    const seenAliases = new Set<string>([canonicalNormalizedName]);
    const entities: TagAliasEntity[] = [];

    for (const item of inputs) {
      if (!item.aliasName?.trim()) continue;
      const parsed = this.normalizationService.parseTagInput(item.aliasName);
      if (seenAliases.has(parsed.normalizedName)) continue;

      const [tagConflict, otherAliasConflict] = await Promise.all([
        manager.findOne(TagEntity, {
          where: { normalizedName: parsed.normalizedName },
        }),
        manager.findOne(TagAliasEntity, {
          where: { normalizedAlias: parsed.normalizedName },
        }),
      ]);

      if (tagConflict && String(tagConflict.id) !== String(tagId)) {
        throw new ConflictException(
          `Alias "${parsed.displayName}" conflicts with existing canonical tag "${tagConflict.name}"`,
        );
      }
      if (
        otherAliasConflict &&
        String(otherAliasConflict.tagId) !== String(tagId)
      ) {
        throw new ConflictException(
          `Alias "${parsed.displayName}" is already assigned to another tag`,
        );
      }

      seenAliases.add(parsed.normalizedName);
      entities.push(
        manager.create(TagAliasEntity, {
          tagId,
          aliasName: parsed.displayName,
          normalizedAlias: parsed.normalizedName,
          unaccentedAlias: parsed.unaccentedName,
          aliasType: item.aliasType ?? ETagAliasType.SYNONYM,
          locale: item.locale?.trim().toLowerCase() || null,
        }),
      );
    }

    if (entities.length > 0) {
      await manager.save(TagAliasEntity, entities);
    }
  }
}
