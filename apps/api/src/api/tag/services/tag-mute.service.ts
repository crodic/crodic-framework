import { AutoIncrementID } from '../../../common/types/common.type';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpsertMutedTagReqDto } from '../dto/tag-req.dto';
import { MutedTagItemResDto } from '../dto/tag-res.dto';
import { TagEntity } from '../entities/tag.entity';
import { UserMutedTagEntity } from '../entities/user-muted-tag.entity';
import { TagCacheService } from './tag-cache.service';
import { TagHierarchyService } from './tag-hierarchy.service';
import { TagService } from './tag.service';

@Injectable()
export class TagMuteService {
  constructor(
    @InjectRepository(UserMutedTagEntity)
    private readonly mutedTagRepository: Repository<UserMutedTagEntity>,
    @InjectRepository(TagEntity)
    private readonly tagRepository: Repository<TagEntity>,
    private readonly hierarchyService: TagHierarchyService,
    private readonly tagService: TagService,
    private readonly cacheService: TagCacheService,
  ) {}

  async listUserMutedTags(
    userId: AutoIncrementID,
    locale = 'en',
  ): Promise<MutedTagItemResDto[]> {
    const items = await this.mutedTagRepository.find({
      where: { userId },
      relations: ['tag', 'tag.translations'],
      order: { createdAt: 'DESC' },
    });

    return items
      .filter((item) => item.tag && !item.tag.deletedAt)
      .map((item) => ({
        id: item.id,
        includeChildren: item.includeChildren,
        tag: this.tagService.toSummaryDto(item.tag, locale),
        createdAt: item.createdAt,
      }));
  }

  async upsertMutedTag(
    userId: AutoIncrementID,
    dto: UpsertMutedTagReqDto,
    locale = 'en',
  ): Promise<MutedTagItemResDto> {
    const tag = await this.tagRepository.findOne({
      where: { id: dto.tagId },
      relations: ['translations'],
    });
    if (!tag) {
      throw new NotFoundException('Tag not found');
    }

    let existing = await this.mutedTagRepository.findOne({
      where: { userId, tagId: dto.tagId },
    });

    if (existing) {
      existing.includeChildren = dto.includeChildren ?? true;
    } else {
      existing = this.mutedTagRepository.create({
        userId,
        tagId: dto.tagId,
        includeChildren: dto.includeChildren ?? true,
      });
    }

    const saved = await this.mutedTagRepository.save(existing);
    await this.cacheService.invalidateUserMutedCache(userId);

    return {
      id: saved.id,
      includeChildren: saved.includeChildren,
      tag: this.tagService.toSummaryDto(tag, locale),
      createdAt: saved.createdAt,
    };
  }

  async removeMutedTag(
    userId: AutoIncrementID,
    tagId: AutoIncrementID,
  ): Promise<{ message: string }> {
    const res = await this.mutedTagRepository.delete({ userId, tagId });
    if (!res.affected) {
      throw new NotFoundException('Muted tag entry not found');
    }
    await this.cacheService.invalidateUserMutedCache(userId);
    return { message: 'Tag unmuted successfully' };
  }

  /**
   * Returns the expanded set of muted canonical tag IDs (including descendant child tags when includeChildren = true),
   * cached in Redis for zero-overhead feed/search exclusion.
   */
  async getExpandedMutedTagIds(
    userId?: AutoIncrementID | null,
  ): Promise<AutoIncrementID[]> {
    if (!userId) return [];

    const cached = await this.cacheService.getUserMutedCache(userId);
    if (cached) return cached;

    const entries = await this.mutedTagRepository.find({ where: { userId } });
    if (entries.length === 0) {
      await this.cacheService.setUserMutedCache(userId, []);
      return [];
    }

    const directIds = entries.map((e) => e.tagId);
    const expandableIds = entries
      .filter((e) => e.includeChildren)
      .map((e) => e.tagId);

    const expandedChildren =
      expandableIds.length > 0
        ? await this.hierarchyService.expandDescendantIds(expandableIds)
        : [];

    const merged = Array.from(
      new Set<string>([
        ...directIds.map(String),
        ...expandedChildren.map(String),
      ]),
    ) as AutoIncrementID[];

    await this.cacheService.setUserMutedCache(userId, merged);
    return merged;
  }
}
