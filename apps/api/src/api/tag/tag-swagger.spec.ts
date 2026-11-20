import { AdminAuthGuard } from '../../guards/admin-auth.guard';
import { PoliciesGuard } from '../../guards/policies.guard';
import { UserAuthGuard } from '../../guards/user-auth.guard';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Test } from '@nestjs/testing';
import { TagAdminController } from './controllers/tag-admin.controller';
import { TagCategoryAdminController } from './controllers/tag-category-admin.controller';
import { TagCategoryPublicController } from './controllers/tag-category-public.controller';
import { TagEncyclopediaAdminController } from './controllers/tag-encyclopedia-admin.controller';
import { TagPublicController } from './controllers/tag-public.controller';
import { TagUserController } from './controllers/tag-user.controller';
import { TagQueryFilterHelper } from './helpers/tag-query-filter.helper';
import { EntityTaggingService } from './services/entity-tagging.service';
import { TagAutocompleteService } from './services/tag-autocomplete.service';
import { TagCategoryService } from './services/tag-category.service';
import { TagCacheService } from './services/tag-cache.service';
import { TagEncyclopediaService } from './services/tag-encyclopedia.service';
import { TagHierarchyService } from './services/tag-hierarchy.service';
import { TagMuteService } from './services/tag-mute.service';
import { TagQueueService } from './services/tag-queue.service';
import { TagService } from './services/tag.service';

describe('Tag System OpenAPI / Swagger Schema Generation', () => {
  it('generates OpenAPI document across all 6 Tag controllers with zero circular dependency or metadata errors', async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [
        TagAdminController,
        TagCategoryAdminController,
        TagCategoryPublicController,
        TagEncyclopediaAdminController,
        TagPublicController,
        TagUserController,
      ],
      providers: [
        { provide: TagService, useValue: {} },
        { provide: TagCategoryService, useValue: {} },
        { provide: TagHierarchyService, useValue: {} },
        { provide: TagAutocompleteService, useValue: {} },
        { provide: TagEncyclopediaService, useValue: {} },
        { provide: TagMuteService, useValue: {} },
        { provide: EntityTaggingService, useValue: {} },
        { provide: TagQueryFilterHelper, useValue: {} },
        { provide: TagQueueService, useValue: {} },
      ],
    })
      .overrideGuard(AdminAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(PoliciesGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(UserAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    const app = moduleRef.createNestApplication();
    await app.init();

    const config = new DocumentBuilder()
      .setTitle('Tag System Test API')
      .setVersion('1.0')
      .build();

    const document = SwaggerModule.createDocument(app, config);

    expect(document.paths).toBeDefined();
    expect(Object.keys(document.paths).length).toBeGreaterThanOrEqual(15);
    expect(document.components?.schemas?.Paginated).toBeDefined();
    expect(document.components?.schemas?.OffsetPaginationDto).toBeDefined();
    expect(document.components?.schemas?.TagDetailResDto).toBeDefined();

    await app.close();
  });
});
