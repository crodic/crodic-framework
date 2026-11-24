import { Controller, Get } from '@nestjs/common';
import { ApiQueryBuilderDocs } from './swagger.decorator';
import { AllowedFilter } from './allowed-filter';
import { AllowedSort } from './allowed-sort';
import { AllowedInclude } from './allowed-include';
import { ApiAuth, ApiPublic } from '../../decorators/http.decorators';

class TestDto {
  id!: string;
  name!: string;
}

enum StatusEnum {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

describe('ApiQueryBuilderDocs Decorator', () => {
  it('should apply without errors on a controller method with full configuration', () => {
    class SampleController {
      @Get()
      @ApiQueryBuilderDocs({
        entity: TestDto,
        filters: [
          'name',
          AllowedFilter.exact('status'),
          AllowedFilter.trashed(),
          {
            name: 'role',
            enum: StatusEnum,
            description: 'Filter by role',
          },
        ],
        sorts: ['createdAt', 'name', AllowedSort.field('role', 'roles.name')],
        defaultSort: '-createdAt',
        includes: ['roles', 'profile', AllowedInclude.count('comments')],
        fields: ['id', 'name', 'email'],
        defaultLimit: 15,
        maxLimit: 50,
      })
      findAll() {
        return [];
      }
    }

    const controller = new SampleController();
    expect(controller).toBeDefined();
    expect(typeof controller.findAll).toBe('function');
  });

  it('should integrate seamlessly into ApiPublic with isQueryBuilder: true', () => {
    @Controller('public-test')
    class PublicSampleController {
      @Get()
      @ApiPublic({
        type: TestDto,
        isQueryBuilder: true,
        summary: 'Public list with query builder',
        queryBuilderOptions: {
          filters: ['name'],
          sorts: ['createdAt'],
        },
      })
      findAll() {
        return [];
      }
    }

    const controller = new PublicSampleController();
    expect(controller).toBeDefined();
  });

  it('should integrate seamlessly into ApiAuth with isQueryBuilder: true', () => {
    @Controller('auth-test')
    class AuthSampleController {
      @Get()
      @ApiAuth({
        type: TestDto,
        isQueryBuilder: true,
        summary: 'Protected list with query builder',
        queryBuilderOptions: {
          filters: [AllowedFilter.exact('status')],
          includes: ['roles'],
        },
      })
      findAll() {
        return [];
      }
    }

    const controller = new AuthSampleController();
    expect(controller).toBeDefined();
  });

  it('should document cursor pagination, JSONB filters/sorts, groupOr, and dynamic operators in OpenAPI metadata', () => {
    class CursorController {
      @Get()
      @ApiQueryBuilderDocs({
        entity: TestDto,
        paginationType: 'cursor',
        filters: [
          AllowedFilter.json('score', 'userMeta', 'stats.score', {
            operator: 'dynamic',
            cast: 'numeric',
          }),
          AllowedFilter.json('emailNotify', 'userMeta', 'notifications.email', {
            cast: 'boolean',
          }),
          AllowedFilter.groupOr('search', [
            AllowedFilter.partial('name'),
            AllowedFilter.partial('email'),
          ]),
          AllowedFilter.operator('age', 'dynamic'),
        ],
        sorts: [
          'createdAt',
          AllowedSort.json('priority', 'userMeta', 'stats.priority', {
            cast: 'numeric',
          }),
        ],
      })
      feed() {
        return [];
      }
    }

    const params: any[] =
      Reflect.getMetadata(
        'swagger/apiParameters',
        CursorController.prototype.feed,
      ) ?? [];
    const paramNames = params.map((p) => p.name);

    expect(paramNames).toContain('cursor');
    expect(paramNames).toContain('limit');
    expect(paramNames).not.toContain('page');

    const scoreParam = params.find((p) => p.name === 'filter[score]');
    expect(scoreParam.description).toContain(
      'JSONB: userMeta.stats.score::numeric',
    );
    expect(scoreParam.description).toContain('dynamic comparison prefixes');
    expect(scoreParam.example).toBe('>=100,<=500');

    const emailParam = params.find((p) => p.name === 'filter[emailNotify]');
    expect(emailParam.description).toContain(
      'JSONB: userMeta.notifications.email::boolean',
    );
    expect(emailParam.example).toBe('true');

    const groupParam = params.find((p) => p.name === 'filter[search]');
    expect(groupParam.description).toContain('OR across: name, email');

    const sortParam = params.find((p) => p.name === 'sort');
    expect(sortParam.description).toContain(
      'priority (JSONB: userMeta.stats.priority::numeric)',
    );
  });
});
