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
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import {
  DEFAULT_MAX_TAGS_PER_ENTITY,
  EEntityTagLogAction,
  ETaggableEntityType,
} from '../constants/tag.constant';
import {
  AttachEntityTagReqDto,
  SyncEntityTagsReqDto,
  UpdateEntityTagGovernanceReqDto,
} from '../dto/tag-req.dto';
import {
  EntityTagItemDto,
  EntityTagListResDto,
  EntityTagLogResDto,
} from '../dto/tag-res.dto';
import { EntityTagConfigEntity } from '../entities/entity-tag-config.entity';
import { EntityTagLogEntity } from '../entities/entity-tag-log.entity';
import { EntityTagEntity } from '../entities/entity-tag.entity';
import { TagEntity } from '../entities/tag.entity';
import { TagCacheService } from './tag-cache.service';
import { TagService } from './tag.service';

export interface TagActorContext {
  userId?: AutoIncrementID | null;
  adminId?: AutoIncrementID | null;
}

@Injectable()
export class EntityTaggingService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(EntityTagEntity)
    private readonly entityTagRepository: Repository<EntityTagEntity>,
    @InjectRepository(EntityTagConfigEntity)
    private readonly configRepository: Repository<EntityTagConfigEntity>,
    @InjectRepository(EntityTagLogEntity)
    private readonly logRepository: Repository<EntityTagLogEntity>,
    private readonly tagService: TagService,
    private readonly cacheService: TagCacheService,
  ) {}

  /**
   * Lists tags attached to an entity with per-actor permission flags:
   * isAuthorTag (*), locked, deletable, canEdit, and maxTags.
   */
  async listEntityTags(
    entityType: ETaggableEntityType,
    entityId: AutoIncrementID,
    locale = 'en',
    actor: TagActorContext = {},
  ): Promise<EntityTagListResDto> {
    const [config, items] = await Promise.all([
      this.configRepository.findOne({ where: { entityType, entityId } }),
      this.entityTagRepository.find({
        where: { entityType, entityId },
        relations: ['tag', 'tag.translations'],
        order: { sortOrder: 'ASC', id: 'ASC' },
      }),
    ]);

    const tagEditLocked = config?.tagEditLocked ?? false;
    const maxTags = config?.maxTags ?? DEFAULT_MAX_TAGS_PER_ENTITY;
    const isAdmin = Boolean(actor.adminId);
    const isOwner =
      isAdmin ||
      Boolean(
        actor.userId &&
        config?.ownerUserId &&
        String(actor.userId) === String(config.ownerUserId),
      );

    const isAuthenticated = Boolean(actor.userId || actor.adminId);
    const canEdit = isOwner || (isAuthenticated && !tagEditLocked);

    const tags: EntityTagItemDto[] = items
      .filter((item) => item.tag && !item.tag.deletedAt)
      .map((item) => {
        const tr =
          item.tag.translations?.find((t) => t.locale === locale) ??
          item.tag.translations?.find((t) => t.locale === 'en') ??
          null;

        const deletable =
          isOwner ||
          (isAuthenticated &&
            !tagEditLocked &&
            !item.isAuthorTag &&
            !item.isLocked &&
            !item.tag.isSystem);

        return {
          id: item.id,
          tagId: item.tagId,
          slug: item.tag.slug,
          name: item.tag.name,
          translatedName: tr?.translatedName ?? null,
          category: item.tag.category,
          safetyRating: item.tag.safetyRating,
          isOfficial: item.tag.isOfficial,
          isAuthorTag: item.isAuthorTag,
          locked: item.isLocked,
          deletable,
          sortOrder: item.sortOrder,
          usageCount: Number(item.tag.usageCount || 0),
        };
      });

    return {
      entityType,
      entityId,
      tagEditLocked,
      maxTags,
      canEdit,
      isOwner,
      tags,
    };
  }

  /**
   * Attaches a single tag (Folksonomy community user or Owner/Admin) enforcing:
   * - Work-level tagEditLocked check
   * - Hard cap of 10 tags per work
   * - System-tag protection
   * - Automatic alias/orthographic resolution and audit logging.
   */
  async attachTag(
    entityType: ETaggableEntityType,
    entityId: AutoIncrementID,
    dto: AttachEntityTagReqDto,
    actor: TagActorContext,
    locale = 'en',
  ): Promise<EntityTagListResDto> {
    if (!actor.userId && !actor.adminId) {
      throw new ForbiddenException('Authentication is required to add tags');
    }

    let attachedTagId!: AutoIncrementID;

    await this.dataSource.transaction(async (manager) => {
      let config = await manager.findOne(EntityTagConfigEntity, {
        where: { entityType, entityId },
      });

      if (!config) {
        config = await manager.save(
          EntityTagConfigEntity,
          manager.create(EntityTagConfigEntity, {
            entityType,
            entityId,
            tagEditLocked: false,
            maxTags: DEFAULT_MAX_TAGS_PER_ENTITY,
          }),
        );
      }

      const isAdmin = Boolean(actor.adminId);
      const isOwner =
        isAdmin ||
        Boolean(
          actor.userId &&
          config.ownerUserId &&
          String(actor.userId) === String(config.ownerUserId),
        );

      if (!isOwner && config.tagEditLocked) {
        throw new ForbiddenException(
          'The creator has locked tag editing on this item',
        );
      }

      const currentTags = await manager.find(EntityTagEntity, {
        where: { entityType, entityId },
        order: { sortOrder: 'ASC' },
      });

      if (currentTags.length >= config.maxTags) {
        throw new BadRequestException(
          `Maximum limit of ${config.maxTags} tags reached for this item`,
        );
      }

      const canonicalTag = await this.tagService.resolveOrCreateCanonicalTag(
        dto.tagName,
        actor,
        manager,
      );

      if (canonicalTag.isSystem && !isOwner) {
        throw new ForbiddenException(
          'Only the creator or administrators may attach system classification tags',
        );
      }

      const duplicate = currentTags.find(
        (et) => String(et.tagId) === String(canonicalTag.id),
      );
      if (duplicate) {
        throw new ConflictException(
          `Tag "${canonicalTag.name}" is already attached`,
        );
      }

      const nextSortOrder =
        currentTags.length > 0
          ? Math.max(...currentTags.map((t) => t.sortOrder)) + 1
          : 0;

      const entityTag = manager.create(EntityTagEntity, {
        entityType,
        entityId,
        tagId: canonicalTag.id,
        isAuthorTag: isOwner,
        isLocked: isOwner ? Boolean(dto.isLocked) : false,
        sortOrder: nextSortOrder,
        addedByUserId: actor.userId ?? null,
        addedByAdminId: actor.adminId ?? null,
      });

      await manager.save(EntityTagEntity, entityTag);
      await manager.increment(
        TagEntity,
        { id: canonicalTag.id },
        'usageCount',
        1,
      );

      await manager.save(
        EntityTagLogEntity,
        manager.create(EntityTagLogEntity, {
          entityType,
          entityId,
          tagId: canonicalTag.id,
          tagNameSnapshot: canonicalTag.name,
          action: EEntityTagLogAction.ADD,
          actorUserId: actor.userId ?? null,
          actorAdminId: actor.adminId ?? null,
        }),
      );

      attachedTagId = canonicalTag.id;
    });

    await this.cacheService.recordTagActivity(attachedTagId, 2);
    await this.cacheService.bumpVersion();
    return this.listEntityTags(entityType, entityId, locale, actor);
  }

  /**
   * Detaches a tag from an entity, enforcing Author (*) & Lock rules.
   */
  async detachTag(
    entityType: ETaggableEntityType,
    entityId: AutoIncrementID,
    tagId: AutoIncrementID,
    actor: TagActorContext,
    locale = 'en',
  ): Promise<EntityTagListResDto> {
    if (!actor.userId && !actor.adminId) {
      throw new ForbiddenException('Authentication is required to remove tags');
    }

    await this.dataSource.transaction(async (manager) => {
      const [config, entityTag] = await Promise.all([
        manager.findOne(EntityTagConfigEntity, {
          where: { entityType, entityId },
        }),
        manager.findOne(EntityTagEntity, {
          where: { entityType, entityId, tagId },
          relations: ['tag'],
        }),
      ]);

      if (!entityTag) {
        throw new NotFoundException('Tag attachment not found on this item');
      }

      const isAdmin = Boolean(actor.adminId);
      const isOwner =
        isAdmin ||
        Boolean(
          actor.userId &&
          config?.ownerUserId &&
          String(actor.userId) === String(config.ownerUserId),
        );

      if (!isOwner) {
        if (config?.tagEditLocked) {
          throw new ForbiddenException(
            'The creator has locked tag editing on this item',
          );
        }
        if (entityTag.isAuthorTag) {
          throw new ForbiddenException(
            'Author tags (*) cannot be removed by other users',
          );
        }
        if (entityTag.isLocked) {
          throw new ForbiddenException(
            'This tag has been locked by the creator and cannot be removed',
          );
        }
        if (entityTag.tag?.isSystem) {
          throw new ForbiddenException('System tags cannot be removed');
        }
      }

      await manager.delete(EntityTagEntity, { id: entityTag.id });
      await manager.query(
        `UPDATE tags SET usage_count = GREATEST(usage_count - 1, 0) WHERE id = $1`,
        [tagId],
      );

      await manager.save(
        EntityTagLogEntity,
        manager.create(EntityTagLogEntity, {
          entityType,
          entityId,
          tagId,
          tagNameSnapshot: entityTag.tag?.name ?? null,
          action: EEntityTagLogAction.REMOVE,
          actorUserId: actor.userId ?? null,
          actorAdminId: actor.adminId ?? null,
        }),
      );
    });

    await this.cacheService.bumpVersion();
    return this.listEntityTags(entityType, entityId, locale, actor);
  }

  /**
   * Synchronizes the full author tag list on creation/editing forms (e.g. Admin CMS Page / Creator Upload).
   */
  async syncAuthorTags(
    entityType: ETaggableEntityType,
    entityId: AutoIncrementID,
    dto: SyncEntityTagsReqDto,
    actor: TagActorContext,
    locale = 'en',
  ): Promise<EntityTagListResDto> {
    await this.dataSource.transaction(async (manager) => {
      let config = await manager.findOne(EntityTagConfigEntity, {
        where: { entityType, entityId },
      });

      if (!config) {
        config = manager.create(EntityTagConfigEntity, {
          entityType,
          entityId,
          ownerUserId: dto.ownerUserId ?? actor.userId ?? null,
          tagEditLocked: dto.tagEditLocked ?? false,
          maxTags: DEFAULT_MAX_TAGS_PER_ENTITY,
        });
      } else {
        if (dto.ownerUserId !== undefined) config.ownerUserId = dto.ownerUserId;
        if (dto.tagEditLocked !== undefined) {
          config.tagEditLocked = dto.tagEditLocked;
        }
      }
      await manager.save(EntityTagConfigEntity, config);

      const cleanNames = dto.tagNames
        .map((n) => n.trim())
        .filter(Boolean)
        .slice(0, config.maxTags);

      const resolvedTags: TagEntity[] = [];
      const seenIds = new Set<string>();

      for (const rawName of cleanNames) {
        const canonical = await this.tagService.resolveOrCreateCanonicalTag(
          rawName,
          actor,
          manager,
        );
        if (!seenIds.has(String(canonical.id))) {
          seenIds.add(String(canonical.id));
          resolvedTags.push(canonical);
        }
      }

      const existing = await manager.find(EntityTagEntity, {
        where: { entityType, entityId },
      });
      const existingByTagId = new Map(
        existing.map((et) => [String(et.tagId), et]),
      );

      // Remove detached tags
      const removed = existing.filter((et) => !seenIds.has(String(et.tagId)));
      if (removed.length > 0) {
        await manager.delete(EntityTagEntity, {
          id: In(removed.map((r) => r.id)),
        });
        for (const rem of removed) {
          await manager.query(
            `UPDATE tags SET usage_count = GREATEST(usage_count - 1, 0) WHERE id = $1`,
            [rem.tagId],
          );
        }
      }

      // Upsert & order desired tags
      for (let idx = 0; idx < resolvedTags.length; idx++) {
        const tag = resolvedTags[idx]!;
        const prev = existingByTagId.get(String(tag.id));
        if (prev) {
          prev.sortOrder = idx;
          prev.isAuthorTag = true;
          await manager.save(EntityTagEntity, prev);
        } else {
          await manager.save(
            EntityTagEntity,
            manager.create(EntityTagEntity, {
              entityType,
              entityId,
              tagId: tag.id,
              isAuthorTag: true,
              isLocked: false,
              sortOrder: idx,
              addedByUserId: actor.userId ?? null,
              addedByAdminId: actor.adminId ?? null,
            }),
          );
          await manager.increment(TagEntity, { id: tag.id }, 'usageCount', 1);
        }
      }
    });

    await this.cacheService.bumpVersion();
    return this.listEntityTags(entityType, entityId, locale, actor);
  }

  /**
   * Owner/Admin governance controls: per-tag lock/unlock, work-level tagEditLocked toggle, and tag ordering.
   */
  async updateGovernance(
    entityType: ETaggableEntityType,
    entityId: AutoIncrementID,
    dto: UpdateEntityTagGovernanceReqDto,
    actor: TagActorContext,
    locale = 'en',
  ): Promise<EntityTagListResDto> {
    await this.dataSource.transaction(async (manager) => {
      let config = await manager.findOne(EntityTagConfigEntity, {
        where: { entityType, entityId },
      });
      if (!config) {
        config = await manager.save(
          EntityTagConfigEntity,
          manager.create(EntityTagConfigEntity, {
            entityType,
            entityId,
            ownerUserId: actor.userId ?? null,
            tagEditLocked: false,
            maxTags: DEFAULT_MAX_TAGS_PER_ENTITY,
          }),
        );
      }

      const isAdmin = Boolean(actor.adminId);
      const isOwner =
        isAdmin ||
        Boolean(
          actor.userId &&
          config.ownerUserId &&
          String(actor.userId) === String(config.ownerUserId),
        );

      if (!isOwner) {
        throw new ForbiddenException(
          'Only the creator or an administrator can manage tag locks and order',
        );
      }

      if (dto.tagEditLocked !== undefined) {
        config.tagEditLocked = dto.tagEditLocked;
        await manager.save(EntityTagConfigEntity, config);
        await manager.save(
          EntityTagLogEntity,
          manager.create(EntityTagLogEntity, {
            entityType,
            entityId,
            action: dto.tagEditLocked
              ? EEntityTagLogAction.WORK_LOCK
              : EEntityTagLogAction.WORK_UNLOCK,
            actorUserId: actor.userId ?? null,
            actorAdminId: actor.adminId ?? null,
          }),
        );
      }

      if (dto.tagId !== undefined && dto.isLocked !== undefined) {
        const et = await manager.findOne(EntityTagEntity, {
          where: { entityType, entityId, tagId: dto.tagId },
          relations: ['tag'],
        });
        if (!et) {
          throw new NotFoundException('Tag attachment not found');
        }
        et.isLocked = dto.isLocked;
        await manager.save(EntityTagEntity, et);
        await manager.save(
          EntityTagLogEntity,
          manager.create(EntityTagLogEntity, {
            entityType,
            entityId,
            tagId: dto.tagId,
            tagNameSnapshot: et.tag?.name ?? null,
            action: dto.isLocked
              ? EEntityTagLogAction.LOCK
              : EEntityTagLogAction.UNLOCK,
            actorUserId: actor.userId ?? null,
            actorAdminId: actor.adminId ?? null,
          }),
        );
      }

      if (dto.orderedTagIds?.length) {
        for (let i = 0; i < dto.orderedTagIds.length; i++) {
          await manager.update(
            EntityTagEntity,
            { entityType, entityId, tagId: dto.orderedTagIds[i]! },
            { sortOrder: i },
          );
        }
      }
    });

    return this.listEntityTags(entityType, entityId, locale, actor);
  }

  async listLogs(
    entityType: ETaggableEntityType,
    entityId: AutoIncrementID,
    limit = 30,
  ): Promise<EntityTagLogResDto[]> {
    const logs = await this.logRepository.find({
      where: { entityType, entityId },
      relations: ['actorUser', 'actorAdmin'],
      order: { createdAt: 'DESC' },
      take: Math.min(limit, 100),
    });

    return logs.map((l) => ({
      id: l.id,
      entityType: l.entityType,
      entityId: l.entityId,
      tagId: l.tagId ?? null,
      tagNameSnapshot: l.tagNameSnapshot ?? null,
      action: l.action,
      actorName:
        l.actorAdmin?.email ?? l.actorUser?.fullName ?? 'Community Member',
      isAdminAction: Boolean(l.actorAdminId),
      createdAt: l.createdAt,
    }));
  }

  async listRecentGlobalLogs(
    query?: QueryParams,
  ): Promise<{ data: EntityTagLogResDto[]; meta: any }> {
    const baseQb = this.logRepository
      .createQueryBuilder('log')
      .leftJoinAndSelect('log.actorUser', 'actorUser')
      .leftJoinAndSelect('log.actorAdmin', 'actorAdmin');

    const paginated = await QueryBuilder.for(baseQb, query ?? {})
      .allowedFilters([
        AllowedFilter.exact('action'),
        AllowedFilter.exact('entityType'),
        AllowedFilter.exact('entityId'),
        AllowedFilter.exact('tagId'),
        AllowedFilter.partial('tagNameSnapshot'),
      ])
      .allowedSorts(['createdAt', 'action', 'entityType'])
      .defaultSort('-createdAt')
      .setLimit(20, 100)
      .paginate();

    return {
      data: paginated.data.map((l) => ({
        id: l.id,
        entityType: l.entityType,
        entityId: l.entityId,
        tagId: l.tagId ?? null,
        tagNameSnapshot: l.tagNameSnapshot ?? null,
        action: l.action,
        actorName:
          l.actorAdmin?.email ?? l.actorUser?.fullName ?? 'Community Member',
        isAdminAction: Boolean(l.actorAdminId),
        createdAt: l.createdAt,
      })),
      meta: paginated.meta,
    };
  }
}
