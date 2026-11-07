import { AutoIncrementID } from '../../../common/types/common.type';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { ETagSafetyRating, ETagStatus } from '../constants/tag.constant';
import { AutocompleteTagQueryDto } from '../dto/tag-req.dto';
import { TagAutocompleteItemDto } from '../dto/tag-res.dto';
import { TagAliasEntity } from '../entities/tag-alias.entity';
import { TagTranslationEntity } from '../entities/tag-translation.entity';
import { TagEntity } from '../entities/tag.entity';
import { TagCacheService } from './tag-cache.service';
import { TagNormalizationService } from './tag-normalization.service';

@Injectable()
export class TagAutocompleteService {
  constructor(
    @InjectRepository(TagEntity)
    private readonly tagRepository: Repository<TagEntity>,
    @InjectRepository(TagTranslationEntity)
    private readonly translationRepository: Repository<TagTranslationEntity>,
    @InjectRepository(TagAliasEntity)
    private readonly aliasRepository: Repository<TagAliasEntity>,
    private readonly normalizationService: TagNormalizationService,
    private readonly cacheService: TagCacheService,
  ) {}

  /**
   * Resolves fast multilingual + orthographic-variant autocomplete candidates.
   * Matches canonical names, localized translations, and aliases, ranked by match precision and usage count.
   */
  async autocomplete(
    queryDto: AutocompleteTagQueryDto,
  ): Promise<TagAutocompleteItemDto[]> {
    const locale = (queryDto.locale || 'en').toLowerCase();
    const limit = Math.min(Math.max(queryDto.limit ?? 10, 1), 30);
    const includeUnsafe = Boolean(queryDto.includeUnsafe);
    const { normalized, unaccented } =
      this.normalizationService.normalizeSearchTerm(queryDto.q || '');

    const cacheKey = `ac:${locale}:${includeUnsafe ? 'all' : 'safe'}:${limit}:${unaccented || '_top'}`;
    const cached =
      await this.cacheService.getJson<TagAutocompleteItemDto[]>(cacheKey);
    if (cached) {
      return cached;
    }

    // Empty query returns popular/official active tags
    if (!unaccented) {
      const qb = this.tagRepository
        .createQueryBuilder('tag')
        .leftJoinAndSelect('tag.translations', 'tr', 'tr.locale = :locale', {
          locale,
        })
        .where('tag.status = :status', { status: ETagStatus.ACTIVE });

      if (!includeUnsafe) {
        qb.andWhere('tag.safetyRating = :safe', {
          safe: ETagSafetyRating.SAFE,
        });
      }

      const popular = await qb
        .orderBy('tag.usageCount', 'DESC')
        .addOrderBy('tag.isOfficial', 'DESC')
        .take(limit)
        .getMany();

      const result = popular.map((tag) => ({
        id: tag.id,
        slug: tag.slug,
        name: tag.name,
        translatedName: tag.translations?.[0]?.translatedName ?? null,
        matchedAlias: null,
        category: tag.category,
        safetyRating: tag.safetyRating,
        isOfficial: tag.isOfficial,
        usageCount: Number(tag.usageCount || 0),
      }));

      await this.cacheService.setJson(cacheKey, result, 180);
      return result;
    }

    const prefixNorm = `${normalized}%`;
    const subNorm = `%${normalized}%`;
    const prefixUnacc = `${unaccented}%`;
    const subUnacc = `%${unaccented}%`;

    const [directTags, matchedTranslations, matchedAliases] = await Promise.all(
      [
        this.tagRepository
          .createQueryBuilder('tag')
          .select(['tag.id'])
          .where('tag.status = :status', { status: ETagStatus.ACTIVE })
          .andWhere(
            new Brackets((b) => {
              b.where('tag.normalizedName ILIKE :subNorm', { subNorm }).orWhere(
                'tag.unaccentedName ILIKE :subUnacc',
                { subUnacc },
              );
            }),
          )
          .orderBy('tag.usageCount', 'DESC')
          .take(limit * 3)
          .getMany(),

        this.translationRepository
          .createQueryBuilder('tr')
          .select(['tr.tagId', 'tr.translatedName', 'tr.locale'])
          .where(
            new Brackets((b) => {
              b.where('tr.normalizedName ILIKE :subNorm', { subNorm }).orWhere(
                'tr.unaccentedName ILIKE :subUnacc',
                { subUnacc },
              );
            }),
          )
          .take(limit * 3)
          .getMany(),

        this.aliasRepository
          .createQueryBuilder('al')
          .select(['al.tagId', 'al.aliasName'])
          .where(
            new Brackets((b) => {
              b.where('al.normalizedAlias ILIKE :subNorm', {
                subNorm,
              }).orWhere('al.unaccentedAlias ILIKE :subUnacc', {
                subUnacc,
              });
            }),
          )
          .take(limit * 3)
          .getMany(),
      ],
    );

    const candidateIds = new Set<string>();
    const aliasHintByTagId = new Map<string, string>();

    for (const t of directTags) candidateIds.add(String(t.id));
    for (const tr of matchedTranslations) candidateIds.add(String(tr.tagId));
    for (const al of matchedAliases) {
      const tid = String(al.tagId);
      candidateIds.add(tid);
      if (!aliasHintByTagId.has(tid)) {
        aliasHintByTagId.set(tid, al.aliasName);
      }
    }

    if (candidateIds.size === 0) {
      await this.cacheService.setJson(cacheKey, [], 120);
      return [];
    }

    const hydratedQb = this.tagRepository
      .createQueryBuilder('tag')
      .leftJoinAndSelect('tag.translations', 'tr')
      .where('tag.id IN (:...ids)', {
        ids: Array.from(candidateIds) as AutoIncrementID[],
      })
      .andWhere('tag.status = :status', { status: ETagStatus.ACTIVE });

    if (!includeUnsafe) {
      hydratedQb.andWhere('tag.safetyRating = :safe', {
        safe: ETagSafetyRating.SAFE,
      });
    }

    const tags = await hydratedQb.getMany();

    const scored = tags.map((tag) => {
      const preferredTr =
        tag.translations?.find((t) => t.locale === locale) ??
        tag.translations?.find((t) => t.locale === 'en') ??
        null;

      const exactMatch =
        tag.normalizedName === normalized ||
        tag.unaccentedName === unaccented ||
        tag.translations?.some(
          (t) =>
            t.normalizedName === normalized || t.unaccentedName === unaccented,
        );

      const prefixMatch =
        tag.normalizedName.startsWith(normalized) ||
        tag.unaccentedName.startsWith(unaccented) ||
        tag.translations?.some(
          (t) =>
            t.normalizedName.startsWith(normalized) ||
            t.unaccentedName.startsWith(unaccented),
        ) ||
        Boolean(prefixNorm && prefixUnacc && false);

      const usage = Number(tag.usageCount || 0);
      const score =
        (exactMatch ? 1000 : prefixMatch ? 500 : 100) +
        (tag.isOfficial ? 50 : 0) +
        Math.log10(usage + 1) * 40;

      return {
        score,
        dto: {
          id: tag.id,
          slug: tag.slug,
          name: tag.name,
          translatedName: preferredTr?.translatedName ?? null,
          matchedAlias: aliasHintByTagId.get(String(tag.id)) ?? null,
          category: tag.category,
          safetyRating: tag.safetyRating,
          isOfficial: tag.isOfficial,
          usageCount: usage,
        } satisfies TagAutocompleteItemDto,
      };
    });

    scored.sort((a, b) => b.score - a.score);
    const finalItems = scored.slice(0, limit).map((s) => s.dto);

    await this.cacheService.setJson(cacheKey, finalItems, 300);
    return finalItems;
  }
}
