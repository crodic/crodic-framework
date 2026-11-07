import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EntityTagConfigEntity } from '../../../api/tag/entities/entity-tag-config.entity';
import { EntityTagLogEntity } from '../../../api/tag/entities/entity-tag-log.entity';
import { EntityTagEntity } from '../../../api/tag/entities/entity-tag.entity';
import { TagAliasEntity } from '../../../api/tag/entities/tag-alias.entity';
import { TagClosureEntity } from '../../../api/tag/entities/tag-closure.entity';
import { TagEncyclopediaRevisionEntity } from '../../../api/tag/entities/tag-encyclopedia-revision.entity';
import { TagEncyclopediaEntity } from '../../../api/tag/entities/tag-encyclopedia.entity';
import { TagRelationEntity } from '../../../api/tag/entities/tag-relation.entity';
import { TagTranslationEntity } from '../../../api/tag/entities/tag-translation.entity';
import { TagEntity } from '../../../api/tag/entities/tag.entity';
import { UserMutedTagEntity } from '../../../api/tag/entities/user-muted-tag.entity';
import { EntityTaggingService } from '../../../api/tag/services/entity-tagging.service';
import { TagCacheService } from '../../../api/tag/services/tag-cache.service';
import { TagEncyclopediaService } from '../../../api/tag/services/tag-encyclopedia.service';
import { TagHierarchyService } from '../../../api/tag/services/tag-hierarchy.service';
import { TagNormalizationService } from '../../../api/tag/services/tag-normalization.service';
import { TagService } from '../../../api/tag/services/tag.service';
import { RedisService } from '../../../redis/redis.service';
import { TagSeedService } from './tag-seed.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TagEntity,
      TagTranslationEntity,
      TagAliasEntity,
      TagRelationEntity,
      TagClosureEntity,
      TagEncyclopediaEntity,
      TagEncyclopediaRevisionEntity,
      EntityTagEntity,
      EntityTagConfigEntity,
      EntityTagLogEntity,
      UserMutedTagEntity,
    ]),
  ],
  providers: [
    RedisService,
    TagNormalizationService,
    TagCacheService,
    TagHierarchyService,
    TagService,
    TagEncyclopediaService,
    EntityTaggingService,
    TagSeedService,
  ],
  exports: [TagSeedService],
})
export class TagSeedModule {}
