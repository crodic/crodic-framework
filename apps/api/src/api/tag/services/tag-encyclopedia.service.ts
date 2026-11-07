import {
  AllowedFilter,
  QueryBuilder,
  QueryParams,
} from '../../../common/query-builder';
import { AutoIncrementID } from '../../../common/types/common.type';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { UpsertTagEncyclopediaReqDto } from '../dto/tag-req.dto';
import {
  TagEncyclopediaResDto,
  TagEncyclopediaRevisionResDto,
} from '../dto/tag-res.dto';
import { TagEncyclopediaRevisionEntity } from '../entities/tag-encyclopedia-revision.entity';
import { TagEncyclopediaEntity } from '../entities/tag-encyclopedia.entity';
import { TagEntity } from '../entities/tag.entity';
import { TagCacheService } from './tag-cache.service';
import { TagService } from './tag.service';

@Injectable()
export class TagEncyclopediaService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(TagEncyclopediaEntity)
    private readonly encyclopediaRepository: Repository<TagEncyclopediaEntity>,
    @InjectRepository(TagEncyclopediaRevisionEntity)
    private readonly revisionRepository: Repository<TagEncyclopediaRevisionEntity>,
    @InjectRepository(TagEntity)
    private readonly tagRepository: Repository<TagEntity>,
    private readonly tagService: TagService,
    private readonly cacheService: TagCacheService,
  ) {}

  async findAllAdmin(query: QueryParams, locale = 'en') {
    const baseQb = this.encyclopediaRepository
      .createQueryBuilder('enc')
      .leftJoinAndSelect('enc.tag', 'tag')
      .leftJoinAndSelect('tag.translations', 'translations');

    const paginated = await QueryBuilder.for(baseQb, query)
      .allowedFilters([
        AllowedFilter.exact('locale'),
        AllowedFilter.exact('isEditLocked'),
        AllowedFilter.exact('tagId'),
        AllowedFilter.callback('search', (qb, val) => {
          const term = Array.isArray(val) ? String(val[0]) : String(val);
          if (!term) return;
          qb.andWhere('(tag.name ILIKE :q OR enc.summary ILIKE :q)', {
            q: `%${term}%`,
          });
        }),
      ])
      .allowedSorts(['id', 'viewCount', 'currentRevision', 'updatedAt'])
      .defaultSort('-updatedAt')
      .setLimit(20, 100)
      .paginate();

    return {
      data: paginated.data.map((enc) => ({
        id: enc.id,
        tagId: enc.tagId,
        locale: enc.locale,
        summary: enc.summary,
        isEditLocked: enc.isEditLocked,
        currentRevision: enc.currentRevision,
        viewCount: Number(enc.viewCount || 0),
        updatedAt: enc.updatedAt,
        tag: this.tagService.toSummaryDto(enc.tag, locale),
      })),
      meta: paginated.meta,
    };
  }

  /**
   * Retrieves a localized encyclopedia wiki article by tag slug (falling back to English or first available locale).
   */
  async findByTagSlug(
    slug: string,
    locale = 'en',
    incrementView = true,
  ): Promise<TagEncyclopediaResDto> {
    const tagDetail = await this.tagService.findBySlugOrAlias(slug, locale);

    const candidates = await this.encyclopediaRepository.find({
      where: { tagId: tagDetail.id },
      relations: ['featuredFile'],
      order: { updatedAt: 'DESC' },
    });

    const chosen =
      candidates.find((c) => c.locale === locale) ??
      candidates.find((c) => c.locale === 'en') ??
      candidates[0] ??
      null;

    if (!chosen) {
      // Return a dynamic semantic wiki stub when no custom article has been authored yet
      return {
        id: '0' as AutoIncrementID,
        tagId: tagDetail.id,
        locale,
        summary:
          tagDetail.shortSummary ||
          `Community tag cluster for "${tagDetail.translatedName || tagDetail.name}".`,
        body: '',
        featuredImageUrl: null,
        featuredFileId: null,
        isEditLocked: false,
        currentRevision: 0,
        viewCount: 0,
        tag: tagDetail,
        revisions: [],
        updatedAt: tagDetail.updatedAt,
      };
    }

    if (incrementView) {
      await this.encyclopediaRepository.increment(
        { id: chosen.id },
        'viewCount',
        1,
      );
    }

    const revisions = await this.revisionRepository.find({
      where: { encyclopediaId: chosen.id },
      relations: ['editorUser', 'editorAdmin'],
      order: { revisionNumber: 'DESC' },
      take: 25,
    });

    const fallbackImageSource = candidates.find(
      (c) => c.featuredImageUrl || c.featuredFile,
    );
    const detailDto = this.toDetailDto(chosen, tagDetail, revisions);
    if (!detailDto.featuredImageUrl && fallbackImageSource) {
      detailDto.featuredImageUrl =
        fallbackImageSource.featuredImageUrl ||
        fallbackImageSource.featuredFile?.url ||
        null;
    }
    return detailDto;
  }

  async findByTagIdAndLocale(
    tagId: AutoIncrementID,
    locale: string,
  ): Promise<TagEncyclopediaResDto> {
    const tagDetail = await this.tagService.findOneById(tagId, locale);
    const enc = await this.encyclopediaRepository.findOne({
      where: { tagId, locale: locale.toLowerCase() },
      relations: ['featuredFile'],
    });

    if (!enc) {
      return {
        id: '0' as AutoIncrementID,
        tagId,
        locale: locale.toLowerCase(),
        summary: tagDetail.shortSummary || '',
        body: '',
        featuredImageUrl: null,
        featuredFileId: null,
        isEditLocked: false,
        currentRevision: 0,
        viewCount: 0,
        tag: tagDetail,
        revisions: [],
        updatedAt: tagDetail.updatedAt,
      };
    }

    const revisions = await this.revisionRepository.find({
      where: { encyclopediaId: enc.id },
      relations: ['editorUser', 'editorAdmin'],
      order: { revisionNumber: 'DESC' },
      take: 30,
    });

    return this.toDetailDto(enc, tagDetail, revisions);
  }

  /**
   * Creates or updates a localized wiki article and appends an immutable revision snapshot.
   */
  async upsert(
    tagId: AutoIncrementID,
    dto: UpsertTagEncyclopediaReqDto,
    actor: {
      userId?: AutoIncrementID | null;
      adminId?: AutoIncrementID | null;
    },
  ): Promise<TagEncyclopediaResDto> {
    const cleanLocale = dto.locale.trim().toLowerCase();

    await this.dataSource.transaction(async (manager) => {
      const tag = await manager.findOne(TagEntity, { where: { id: tagId } });
      if (!tag) {
        throw new NotFoundException('Tag not found');
      }

      let enc = await manager.findOne(TagEncyclopediaEntity, {
        where: { tagId, locale: cleanLocale },
      });

      if (enc && enc.isEditLocked && !actor.adminId) {
        throw new ForbiddenException(
          'This encyclopedia article is locked against community edits',
        );
      }

      const nextRevNumber = enc ? enc.currentRevision + 1 : 1;

      if (!enc) {
        enc = manager.create(TagEncyclopediaEntity, {
          tagId,
          locale: cleanLocale,
          summary: dto.summary.trim(),
          body: dto.body,
          featuredFileId: dto.featuredFileId ?? null,
          featuredImageUrl: dto.featuredImageUrl?.trim() || null,
          isEditLocked: actor.adminId ? Boolean(dto.isEditLocked) : false,
          currentRevision: 1,
          viewCount: 0,
        });
      } else {
        enc.summary = dto.summary.trim();
        enc.body = dto.body;
        if (dto.featuredFileId !== undefined) {
          enc.featuredFileId = dto.featuredFileId;
        }
        if (dto.featuredImageUrl !== undefined) {
          enc.featuredImageUrl = dto.featuredImageUrl?.trim() || null;
        }
        if (actor.adminId && dto.isEditLocked !== undefined) {
          enc.isEditLocked = dto.isEditLocked;
        }
        enc.currentRevision = nextRevNumber;
      }

      const savedEnc = await manager.save(TagEncyclopediaEntity, enc);

      const revision = manager.create(TagEncyclopediaRevisionEntity, {
        encyclopediaId: savedEnc.id,
        revisionNumber: nextRevNumber,
        summary: savedEnc.summary,
        body: savedEnc.body,
        changeNote: dto.changeNote?.trim() || null,
        editorUserId: actor.userId ?? null,
        editorAdminId: actor.adminId ?? null,
      });

      await manager.save(TagEncyclopediaRevisionEntity, revision);
    });

    await this.cacheService.bumpVersion();
    return this.findByTagIdAndLocale(tagId, cleanLocale);
  }

  /**
   * Restores an encyclopedia article to a prior revision number by creating a new forward rollback revision.
   */
  async rollbackToRevision(
    encyclopediaId: AutoIncrementID,
    revisionNumber: number,
    adminId: AutoIncrementID,
  ): Promise<TagEncyclopediaResDto> {
    let targetTagId!: AutoIncrementID;
    let targetLocale!: string;

    await this.dataSource.transaction(async (manager) => {
      const enc = await manager.findOne(TagEncyclopediaEntity, {
        where: { id: encyclopediaId },
      });
      if (!enc) {
        throw new NotFoundException('Encyclopedia article not found');
      }

      const targetRev = await manager.findOne(TagEncyclopediaRevisionEntity, {
        where: { encyclopediaId, revisionNumber },
      });
      if (!targetRev) {
        throw new NotFoundException(
          `Revision #${revisionNumber} does not exist`,
        );
      }

      const nextRev = enc.currentRevision + 1;
      enc.summary = targetRev.summary;
      enc.body = targetRev.body;
      enc.currentRevision = nextRev;
      await manager.save(TagEncyclopediaEntity, enc);

      await manager.save(
        TagEncyclopediaRevisionEntity,
        manager.create(TagEncyclopediaRevisionEntity, {
          encyclopediaId: enc.id,
          revisionNumber: nextRev,
          summary: targetRev.summary,
          body: targetRev.body,
          changeNote: `Rolled back to revision #${revisionNumber}`,
          editorAdminId: adminId,
        }),
      );

      targetTagId = enc.tagId;
      targetLocale = enc.locale;
    });

    await this.cacheService.bumpVersion();
    return this.findByTagIdAndLocale(targetTagId, targetLocale);
  }

  private toDetailDto(
    enc: TagEncyclopediaEntity,
    tagDetail: Awaited<ReturnType<TagService['findOneById']>>,
    revisions: TagEncyclopediaRevisionEntity[],
  ): TagEncyclopediaResDto {
    const mappedRevisions: TagEncyclopediaRevisionResDto[] = revisions.map(
      (r) => ({
        id: r.id,
        revisionNumber: r.revisionNumber,
        summary: r.summary,
        body: r.body,
        changeNote: r.changeNote ?? null,
        editorName:
          r.editorAdmin?.email ?? r.editorUser?.fullName ?? 'Community Editor',
        createdAt: r.createdAt,
      }),
    );

    return {
      id: enc.id,
      tagId: enc.tagId,
      locale: enc.locale,
      summary: enc.summary,
      body: enc.body,
      featuredFileId: enc.featuredFileId ?? null,
      featuredImageUrl: enc.featuredImageUrl || enc.featuredFile?.url || null,
      isEditLocked: enc.isEditLocked,
      currentRevision: enc.currentRevision,
      viewCount: Number(enc.viewCount || 0),
      tag: tagDetail,
      revisions: mappedRevisions,
      updatedAt: enc.updatedAt,
    };
  }
}
