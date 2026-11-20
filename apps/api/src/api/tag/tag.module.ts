import { QueueName } from '../../common/constants/job.constant';
import { RedisModule } from '../../redis/redis.module';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TagAdminController } from './controllers/tag-admin.controller';
import { TagCategoryAdminController } from './controllers/tag-category-admin.controller';
import { TagCategoryPublicController } from './controllers/tag-category-public.controller';
import { TagEncyclopediaAdminController } from './controllers/tag-encyclopedia-admin.controller';
import { TagPublicController } from './controllers/tag-public.controller';
import { TagUserController } from './controllers/tag-user.controller';
import { EntityTagConfigEntity } from './entities/entity-tag-config.entity';
import { EntityTagLogEntity } from './entities/entity-tag-log.entity';
import { EntityTagEntity } from './entities/entity-tag.entity';
import { TagAliasEntity } from './entities/tag-alias.entity';
import { TagCategoryEntity } from './entities/tag-category.entity';
import { TagClosureEntity } from './entities/tag-closure.entity';
import { TagEncyclopediaRevisionEntity } from './entities/tag-encyclopedia-revision.entity';
import { TagEncyclopediaEntity } from './entities/tag-encyclopedia.entity';
import { TagRelationEntity } from './entities/tag-relation.entity';
import { TagTranslationEntity } from './entities/tag-translation.entity';
import { TagEntity } from './entities/tag.entity';
import { UserMutedTagEntity } from './entities/user-muted-tag.entity';
import { TagQueryFilterHelper } from './helpers/tag-query-filter.helper';
import { EntityTaggingService } from './services/entity-tagging.service';
import { TagAutocompleteService } from './services/tag-autocomplete.service';
import { TagCacheService } from './services/tag-cache.service';
import { TagCategoryService } from './services/tag-category.service';
import { TagEncyclopediaService } from './services/tag-encyclopedia.service';
import { TagHierarchyService } from './services/tag-hierarchy.service';
import { TagMuteService } from './services/tag-mute.service';
import { TagNormalizationService } from './services/tag-normalization.service';
import { TagQueueService } from './services/tag-queue.service';
import { TagService } from './services/tag.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TagEntity,
      TagCategoryEntity,
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
    RedisModule,
    BullModule.registerQueue({
      name: QueueName.TAG,
    }),
  ],
  controllers: [
    TagAdminController,
    TagCategoryAdminController,
    TagCategoryPublicController,
    TagEncyclopediaAdminController,
    TagPublicController,
    TagUserController,
  ],
  providers: [
    TagNormalizationService,
    TagCacheService,
    TagHierarchyService,
    TagService,
    TagCategoryService,
    TagAutocompleteService,
    TagEncyclopediaService,
    TagMuteService,
    EntityTaggingService,
    TagQueryFilterHelper,
    TagQueueService,
  ],
  exports: [
    TagNormalizationService,
    TagHierarchyService,
    TagService,
    TagCategoryService,
    TagAutocompleteService,
    TagEncyclopediaService,
    TagMuteService,
    EntityTaggingService,
    TagQueryFilterHelper,
    TagQueueService,
  ],
})
export class TagModule {}
