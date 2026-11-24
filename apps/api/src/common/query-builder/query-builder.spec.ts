import {
  Brackets,
  ObjectLiteral,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { QueryBuilder } from './query-builder';
import { AllowedFilter, FilterOperator } from './allowed-filter';
import { AllowedSort } from './allowed-sort';
import { AllowedInclude } from './allowed-include';
import { Cursor, CursorPaginated } from './cursor';
import { resetGlobalConfig, setGlobalConfig } from './config';
import {
  InvalidFieldQueryException,
  InvalidFilterQueryException,
  InvalidIncludeQueryException,
  InvalidSortQueryException,
} from './exceptions';
import { FilterInterface, SortInterface, IncludeInterface } from './types';

interface TestUser extends ObjectLiteral {
  id: string;
  name: string;
  email: string;
  status: string;
  createdAt: Date;
  deletedAt?: Date;
  roles?: any[];
}

function createMockQb(alias = 'user') {
  const qb: any = {
    alias,
    expressionMap: { withDeleted: false },
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    addOrderBy: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    loadRelationCountAndMap: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    withDeleted: jest.fn().mockImplementation(function (this: any) {
      if (this.expressionMap) this.expressionMap.withDeleted = true;
      return this;
    }),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue([]),
    getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
    getOne: jest.fn().mockResolvedValue(null),
  };
  return qb as unknown as SelectQueryBuilder<TestUser>;
}

function createMockRepo(
  qb: SelectQueryBuilder<TestUser>,
  targetName = 'UserEntity',
) {
  return {
    target: class UserEntity {},
    metadata: { targetName },
    createQueryBuilder: jest.fn().mockReturnValue(qb),
  } as unknown as Repository<TestUser>;
}

describe('Spatie-style QueryBuilder', () => {
  afterEach(() => {
    resetGlobalConfig();
  });

  describe('Initialization (QueryBuilder.for)', () => {
    it('should initialize from an existing SelectQueryBuilder', () => {
      const qb = createMockQb('customUser');
      const builder = QueryBuilder.for(qb, {});

      expect(builder).toBeInstanceOf(QueryBuilder);
      expect(builder.getQueryBuilder()).toBe(qb);
    });

    it('should initialize from a Repository and infer the alias from targetName', () => {
      const qb = createMockQb('user');
      const repo = createMockRepo(qb, 'UserEntity');

      const builder = QueryBuilder.for(repo, {});

      expect(repo.createQueryBuilder).toHaveBeenCalledWith('user');
      expect(builder).toBeInstanceOf(QueryBuilder);
    });

    it('should handle multi-word target names correctly', () => {
      const qb = createMockQb('adminUser');
      const repo = createMockRepo(qb, 'AdminUserEntity');

      QueryBuilder.for(repo, {});

      expect(repo.createQueryBuilder).toHaveBeenCalledWith('adminUser');
    });
  });

  describe('AllowedFilter Operators', () => {
    it('should apply partial filter by default when provided as string', () => {
      const qb = createMockQb();
      QueryBuilder.for(qb, { filter: { name: 'alice' } })
        .allowedFilters(['name'])
        .getQueryBuilder();

      expect(qb.andWhere).toHaveBeenCalledWith('user.name ILIKE :qb_f_name_0', {
        qb_f_name_0: '%alice%',
      });
    });

    it('should apply partial filter with array values using OR', () => {
      const qb = createMockQb();
      QueryBuilder.for(qb, { filter: { name: ['alice', 'bob'] } })
        .allowedFilters(['name'])
        .getQueryBuilder();

      expect(qb.andWhere).toHaveBeenCalledWith(
        '(user.name ILIKE :qb_f_name_0_0 OR user.name ILIKE :qb_f_name_0_1)',
        {
          qb_f_name_0_0: '%alice%',
          qb_f_name_0_1: '%bob%',
        },
      );
    });

    it('should apply exact filter with single value', () => {
      const qb = createMockQb();
      QueryBuilder.for(qb, { filter: { status: 'active' } })
        .allowedFilters([AllowedFilter.exact('status')])
        .getQueryBuilder();

      expect(qb.andWhere).toHaveBeenCalledWith('user.status = :qb_f_status_0', {
        qb_f_status_0: 'active',
      });
    });

    it('should apply exact filter with array values using IN', () => {
      const qb = createMockQb();
      QueryBuilder.for(qb, { filter: { status: ['active', 'pending'] } })
        .allowedFilters([AllowedFilter.exact('status')])
        .getQueryBuilder();

      expect(qb.andWhere).toHaveBeenCalledWith(
        'user.status IN (:...qb_f_status_0)',
        { qb_f_status_0: ['active', 'pending'] },
      );
    });

    it('should split comma-separated strings for multi-select exact filter using IN', () => {
      const qb = createMockQb();
      QueryBuilder.for(qb, { filter: { 'roles.id': '1,2' } })
        .allowedFilters([AllowedFilter.exact('roles.id')])
        .getQueryBuilder();

      expect(qb.andWhere).toHaveBeenCalledWith(
        'roles.id IN (:...qb_f_roles_id_0)',
        { qb_f_roles_id_0: ['1', '2'] },
      );
    });

    it('should apply startsWith filter (prefix match)', () => {
      const qb = createMockQb();
      QueryBuilder.for(qb, { filter: { code: 'INV' } })
        .allowedFilters([AllowedFilter.startsWith('code')])
        .getQueryBuilder();

      expect(qb.andWhere).toHaveBeenCalledWith('user.code ILIKE :qb_f_code_0', {
        qb_f_code_0: 'INV%',
      });
    });

    it('should apply endsWith filter (suffix match)', () => {
      const qb = createMockQb();
      QueryBuilder.for(qb, { filter: { email: '.com' } })
        .allowedFilters([AllowedFilter.endsWith('email')])
        .getQueryBuilder();

      expect(qb.andWhere).toHaveBeenCalledWith(
        'user.email ILIKE :qb_f_email_0',
        { qb_f_email_0: '%.com' },
      );
    });

    it('should apply comparison operator filter', () => {
      const qb = createMockQb();
      QueryBuilder.for(qb, { filter: { minAge: 18 } })
        .allowedFilters([AllowedFilter.operator('minAge', '>=', 'age')])
        .getQueryBuilder();

      expect(qb.andWhere).toHaveBeenCalledWith('user.age >= :qb_f_age_0', {
        qb_f_age_0: 18,
      });
    });

    it('should handle relation column with dot notation in filters', () => {
      const qb = createMockQb();
      QueryBuilder.for(qb, { filter: { role: 'admin' } })
        .allowedFilters([AllowedFilter.exact('role', 'roles.name')])
        .getQueryBuilder();

      expect(qb.andWhere).toHaveBeenCalledWith(
        'roles.name = :qb_f_roles_name_0',
        { qb_f_roles_name_0: 'admin' },
      );
    });

    it('should apply trashed filter for soft deletes', () => {
      const qbWith = createMockQb();
      QueryBuilder.for(qbWith, { filter: { trashed: 'with' } })
        .allowedFilters([AllowedFilter.trashed()])
        .getQueryBuilder();

      expect(qbWith.withDeleted).toHaveBeenCalled();
      expect((qbWith as any).expressionMap.withDeleted).toBe(true);

      const qbOnly = createMockQb();
      QueryBuilder.for(qbOnly, { filter: { trashed: 'only' } })
        .allowedFilters([AllowedFilter.trashed()])
        .getQueryBuilder();

      expect(qbOnly.withDeleted).toHaveBeenCalled();
      expect(qbOnly.andWhere).toHaveBeenCalledWith(
        'user.deletedAt IS NOT NULL',
      );
      expect((qbOnly as any).expressionMap.withDeleted).toBe(true);

      const qbWithout = createMockQb();
      (qbWithout as any).expressionMap.withDeleted = true; // simulate base qb having withDeleted called
      QueryBuilder.for(qbWithout, { filter: { trashed: 'without' } })
        .allowedFilters([AllowedFilter.trashed()])
        .getQueryBuilder();

      expect(qbWithout.andWhere).toHaveBeenCalledWith('user.deletedAt IS NULL');
      expect((qbWithout as any).expressionMap.withDeleted).toBe(false);
    });

    it('should apply custom scope filter callback', () => {
      const qb = createMockQb();
      const scopeFn = jest.fn((builder, value, alias) => {
        builder.andWhere(
          `(${alias}.name ILIKE :s OR ${alias}.email ILIKE :s)`,
          {
            s: `%${value}%`,
          },
        );
      });

      QueryBuilder.for(qb, { filter: { search: 'keyword' } })
        .allowedFilters([AllowedFilter.scope('search', scopeFn)])
        .getQueryBuilder();

      expect(scopeFn).toHaveBeenCalledWith(qb, 'keyword', 'user');
      expect(qb.andWhere).toHaveBeenCalledWith(
        '(user.name ILIKE :s OR user.email ILIKE :s)',
        { s: '%keyword%' },
      );
    });

    it('should apply AllowedFilter.custom with a closure and a FilterInterface class', () => {
      const qb = createMockQb();
      const closureFn = jest.fn((builder, value, alias) => {
        builder.andWhere(`${alias}.customField = :val`, { val: value });
      });

      class MyFilter implements FilterInterface {
        apply(builder: SelectQueryBuilder<any>, value: any, alias: string) {
          builder.andWhere(`${alias}.classField = :cVal`, { cVal: value });
        }
      }

      QueryBuilder.for(qb, {
        filter: { customKey: 'foo', classKey: 'bar' },
      })
        .allowedFilters([
          AllowedFilter.custom('customKey', closureFn),
          AllowedFilter.custom('classKey', new MyFilter()),
        ])
        .getQueryBuilder();

      expect(closureFn).toHaveBeenCalledWith(qb, 'foo', 'user');
      expect(qb.andWhere).toHaveBeenCalledWith('user.customField = :val', {
        val: 'foo',
      });
      expect(qb.andWhere).toHaveBeenCalledWith('user.classField = :cVal', {
        cVal: 'bar',
      });
    });

    it('should apply AllowedFilter.callback with Spatie signature (qb, value, property, alias)', () => {
      const qb = createMockQb();
      const cb = jest.fn((builder, value, property, alias) => {
        builder.andWhere(`${alias}.${property} ILIKE :v`, { v: `%${value}%` });
      });

      QueryBuilder.for(qb, { filter: { q: 'frieren' } })
        .allowedFilters([AllowedFilter.callback('q', cb, 'displayName')])
        .getQueryBuilder();

      expect(cb).toHaveBeenCalledWith(qb, 'frieren', 'displayName', 'user');
      expect(qb.andWhere).toHaveBeenCalledWith('user.displayName ILIKE :v', {
        v: '%frieren%',
      });
    });

    it('should support .default(), .ignore(), and .nullable() modifiers on AllowedFilter', () => {
      // 1. Default when filter param is absent
      const qbDefault = createMockQb();
      QueryBuilder.for(qbDefault, {})
        .allowedFilters([
          AllowedFilter.callback('status', (b, val, prop, alias) => {
            b.andWhere(`${alias}.${prop} = :st`, { st: val });
          }).default('active'),
        ])
        .getQueryBuilder();

      expect(qbDefault.andWhere).toHaveBeenCalledWith('user.status = :st', {
        st: 'active',
      });

      // 2. Ignore skips execution when value matches ignored values
      const qbIgnore = createMockQb();
      const ignoredCb = jest.fn();
      QueryBuilder.for(qbIgnore, { filter: { role: 'all' } })
        .allowedFilters([
          AllowedFilter.callback('role', ignoredCb).ignore('all', null, ''),
        ])
        .getQueryBuilder();

      expect(ignoredCb).not.toHaveBeenCalled();

      // 3. Nullable generates IS NULL on exact filter
      const qbNull = createMockQb();
      QueryBuilder.for(qbNull, { filter: { verifiedAt: 'null' } })
        .allowedFilters([AllowedFilter.exact('verifiedAt').nullable()])
        .getQueryBuilder();

      expect(qbNull.andWhere).toHaveBeenCalledWith('user.verifiedAt IS NULL');
    });

    it('should ignore filters not present in allowedFilters when strict mode is false', () => {
      const qb = createMockQb();
      QueryBuilder.for(qb, { filter: { unallowed: 'malicious', name: 'safe' } })
        .allowedFilters(['name'])
        .getQueryBuilder();

      expect(qb.andWhere).toHaveBeenCalledTimes(1);
      expect(qb.andWhere).toHaveBeenCalledWith('user.name ILIKE :qb_f_name_0', {
        qb_f_name_0: '%safe%',
      });
    });

    it('should throw InvalidFilterQueryException in strict mode for unallowed filters', () => {
      const qb = createMockQb();
      const builder = QueryBuilder.for(qb, {
        filter: { unallowed: 'malicious', name: 'safe' },
      })
        .allowedFilters(['name'])
        .strict(true);

      expect(() => builder.getQueryBuilder()).toThrow(
        InvalidFilterQueryException,
      );
    });

    it('should skip filter if value is empty string, null, or undefined', () => {
      const qb = createMockQb();
      QueryBuilder.for(qb, {
        filter: { name: '', status: null as any, email: undefined as any },
      })
        .allowedFilters(['name', AllowedFilter.exact('status'), 'email'])
        .getQueryBuilder();

      expect(qb.andWhere).not.toHaveBeenCalled();
    });

    it('should expose FilterOperator enum values', () => {
      expect(FilterOperator.EXACT).toBe('exact');
      expect(FilterOperator.PARTIAL).toBe('partial');
      expect(FilterOperator.STARTS_WITH).toBe('starts_with');
      expect(FilterOperator.ENDS_WITH).toBe('ends_with');
      expect(FilterOperator.OPERATOR).toBe('operator');
      expect(FilterOperator.SCOPE).toBe('scope');
      expect(FilterOperator.TRASHED).toBe('trashed');
    });
  });

  describe('AllowedSort', () => {
    it('should apply ascending sort when name does not start with -', () => {
      const qb = createMockQb();
      QueryBuilder.for(qb, { sort: 'name' })
        .allowedSorts(['name'])
        .getQueryBuilder();

      expect(qb.orderBy).toHaveBeenCalledWith('user.name', 'ASC');
    });

    it('should apply descending sort when name starts with -', () => {
      const qb = createMockQb();
      QueryBuilder.for(qb, { sort: '-createdAt' })
        .allowedSorts(['createdAt'])
        .getQueryBuilder();

      expect(qb.orderBy).toHaveBeenCalledWith('user.createdAt', 'DESC');
    });

    it('should apply multiple sorts in order (orderBy then addOrderBy)', () => {
      const qb = createMockQb();
      QueryBuilder.for(qb, { sort: '-createdAt,name' })
        .allowedSorts(['createdAt', 'name'])
        .getQueryBuilder();

      expect(qb.orderBy).toHaveBeenCalledWith('user.createdAt', 'DESC');
      expect(qb.addOrderBy).toHaveBeenCalledWith('user.name', 'ASC');
    });

    it('should support relation column in sort with dot notation', () => {
      const qb = createMockQb();
      QueryBuilder.for(qb, { sort: '-roleName' })
        .allowedSorts([AllowedSort.field('roleName', 'roles.name')])
        .getQueryBuilder();

      expect(qb.orderBy).toHaveBeenCalledWith('roles.name', 'DESC');
    });

    it('should fall back to defaultSort when sort param is not provided', () => {
      const qb = createMockQb();
      QueryBuilder.for(qb, {})
        .allowedSorts(['name', 'createdAt'])
        .defaultSort('-createdAt,name')
        .getQueryBuilder();

      expect(qb.orderBy).toHaveBeenCalledWith('user.createdAt', 'DESC');
      expect(qb.addOrderBy).toHaveBeenCalledWith('user.name', 'ASC');
    });

    it('should apply AllowedSort.custom with a closure and a SortInterface class', () => {
      const qb = createMockQb();
      const sortFn = jest.fn((builder, direction, alias) => {
        builder.addOrderBy(`${alias}.score`, direction);
      });

      class CustomPopularitySort implements SortInterface {
        apply(
          builder: SelectQueryBuilder<any>,
          direction: 'ASC' | 'DESC',
          alias: string,
        ) {
          builder.addOrderBy(`${alias}.views + ${alias}.likes`, direction);
        }
      }

      QueryBuilder.for(qb, { sort: '-score,popularity' })
        .allowedSorts([
          AllowedSort.custom('score', sortFn),
          AllowedSort.custom('popularity', new CustomPopularitySort()),
        ])
        .getQueryBuilder();

      expect(sortFn).toHaveBeenCalledWith(qb, 'DESC', 'user');
      expect(qb.addOrderBy).toHaveBeenCalledWith(
        'user.views + user.likes',
        'ASC',
      );
    });

    it('should throw InvalidSortQueryException in strict mode for unallowed sorts', () => {
      const qb = createMockQb();
      const builder = QueryBuilder.for(qb, { sort: 'unallowedSort' })
        .allowedSorts(['name'])
        .strict(true);

      expect(() => builder.getQueryBuilder()).toThrow(
        InvalidSortQueryException,
      );
    });
  });

  describe('AllowedInclude', () => {
    it('should apply relationship include with leftJoinAndSelect', () => {
      const qb = createMockQb();
      QueryBuilder.for(qb, { include: 'roles' })
        .allowedIncludes(['roles'])
        .getQueryBuilder();

      expect(qb.leftJoinAndSelect).toHaveBeenCalledWith('user.roles', 'roles');
    });

    it('should handle nested relation includes (dot notation)', () => {
      const qb = createMockQb();
      QueryBuilder.for(qb, { include: 'posts.comments' })
        .allowedIncludes(['posts.comments'])
        .getQueryBuilder();

      expect(qb.leftJoinAndSelect).toHaveBeenCalledWith('user.posts', 'posts');
      expect(qb.leftJoinAndSelect).toHaveBeenCalledWith(
        'posts.comments',
        'posts_comments',
      );
    });

    it('should support count include with custom countSuffix', () => {
      setGlobalConfig({ countSuffix: '_count' });
      const qb = createMockQb();
      QueryBuilder.for(qb, { include: 'comments' })
        .allowedIncludes([AllowedInclude.count('comments')])
        .getQueryBuilder();

      expect(qb.loadRelationCountAndMap).toHaveBeenCalledWith(
        'user.comments_count',
        'user.comments',
      );
    });

    it('should apply AllowedInclude.custom with a closure and an IncludeInterface class', () => {
      const qb = createMockQb();
      const includeFn = jest.fn((builder, alias) => {
        builder.leftJoinAndSelect(`${alias}.customRel`, 'customRel');
      });

      class ActiveRolesInclude implements IncludeInterface {
        apply(builder: SelectQueryBuilder<any>, alias: string) {
          builder.leftJoinAndSelect(
            `${alias}.activeRoles`,
            'activeRoles',
            'activeRoles.isActive = true',
          );
        }
      }

      QueryBuilder.for(qb, { include: 'customRel,activeRoles' })
        .allowedIncludes([
          AllowedInclude.custom('customRel', includeFn),
          AllowedInclude.custom('activeRoles', new ActiveRolesInclude()),
        ])
        .getQueryBuilder();

      expect(includeFn).toHaveBeenCalledWith(qb, 'user');
      expect(qb.leftJoinAndSelect).toHaveBeenCalledWith(
        'user.activeRoles',
        'activeRoles',
        'activeRoles.isActive = true',
      );
    });

    it('should throw InvalidIncludeQueryException in strict mode for unallowed includes', () => {
      const qb = createMockQb();
      const builder = QueryBuilder.for(qb, { include: 'unknownRelation' })
        .allowedIncludes(['roles'])
        .strict(true);

      expect(() => builder.getQueryBuilder()).toThrow(
        InvalidIncludeQueryException,
      );
    });
  });

  describe('Sparse Fieldsets (allowedFields)', () => {
    it('should select flat fields on root entity', () => {
      const qb = createMockQb();
      QueryBuilder.for(qb, { fields: 'id,name' })
        .allowedFields(['id', 'name', 'email'])
        .getQueryBuilder();

      expect(qb.select).toHaveBeenCalledWith(['user.id', 'user.name']);
    });

    it('should select scoped fields for root and relations', () => {
      const qb = createMockQb();
      QueryBuilder.for(qb, {
        fields: {
          user: 'id,name',
          roles: 'id,title',
        },
      })
        .allowedFields(['id', 'name', 'roles.id', 'roles.title'])
        .getQueryBuilder();

      expect(qb.select).toHaveBeenCalledWith(['user.id', 'user.name']);
      expect(qb.addSelect).toHaveBeenCalledWith(['roles.id', 'roles.title']);
    });

    it('should throw InvalidFieldQueryException in strict mode for unallowed fields', () => {
      const qb = createMockQb();
      const builder = QueryBuilder.for(qb, { fields: 'id,secretHash' })
        .allowedFields(['id', 'name'])
        .strict(true);

      expect(() => builder.getQueryBuilder()).toThrow(
        InvalidFieldQueryException,
      );
    });
  });

  describe('Configuration & Parameter Customization', () => {
    it('should support customized parameter names', () => {
      QueryBuilder.configure({
        parameters: {
          filter: 'filters',
          sort: 'order',
          limit: 'per_page',
          page: 'p',
        },
      });

      const qb = createMockQb();
      QueryBuilder.for(qb, {
        filters: { name: 'alice' },
        order: '-createdAt',
        per_page: 25,
        p: 2,
      })
        .allowedFilters(['name'])
        .allowedSorts(['createdAt'])
        .paginate();

      expect(qb.andWhere).toHaveBeenCalledWith('user.name ILIKE :qb_f_name_0', {
        qb_f_name_0: '%alice%',
      });
      expect(qb.orderBy).toHaveBeenCalledWith('user.createdAt', 'DESC');
      expect(qb.take).toHaveBeenCalledWith(25);
      expect(qb.skip).toHaveBeenCalledWith(25); // (2 - 1) * 25
    });
  });

  describe('where()', () => {
    it('should append custom WHERE conditions directly', () => {
      const qb = createMockQb();
      QueryBuilder.for(qb, {})
        .where('user.tenantId = :tenantId', { tenantId: '123' })
        .getQueryBuilder();

      expect(qb.andWhere).toHaveBeenCalledWith('user.tenantId = :tenantId', {
        tenantId: '123',
      });
    });
  });

  describe('Pagination & Limit Resolution', () => {
    it('should paginate with default limit and page', async () => {
      const mockUsers = [{ id: '1', name: 'Alice' }];
      const qb = createMockQb();
      (qb.getManyAndCount as jest.Mock).mockResolvedValue([mockUsers, 1]);

      const result = await QueryBuilder.for(qb, {}).paginate();

      expect(qb.skip).toHaveBeenCalledWith(0);
      expect(qb.take).toHaveBeenCalledWith(10); // DEFAULT_PAGE_LIMIT
      expect(result.data).toEqual(mockUsers);

      // nestjs-paginate standard meta
      expect(result.meta.totalItems).toBe(1);
      expect(result.meta.itemsPerPage).toBe(10);
      expect(result.meta.currentPage).toBe(1);
      expect(result.meta.totalPages).toBe(1);
      expect(result.meta.sortBy).toEqual([]);

      // nestjs-paginate standard links
      expect(result.links.current).toBe('?page=1&limit=10');
      expect(result.links.first).toBeUndefined();
      expect(result.links.previous).toBeUndefined();
      expect(result.links.next).toBeUndefined();
      expect(result.links.last).toBeUndefined();

      // backwards-compatible pagination getter
      expect(result.pagination.totalRecords).toBe(1);
      expect(result.pagination.currentPage).toBe(1);
    });

    it('should respect page and limit from query parameters and generate multi-page links', async () => {
      const qb = createMockQb();
      (qb.getManyAndCount as jest.Mock).mockResolvedValue([[], 50]);

      const result = await QueryBuilder.for(qb, {
        page: 2,
        limit: 10,
        sort: '-createdAt,name',
        filter: { status: 'active' },
      }).paginate({ path: '/api/v1/users' });

      expect(qb.skip).toHaveBeenCalledWith(10); // (2 - 1) * 10
      expect(qb.take).toHaveBeenCalledWith(10);

      expect(result.meta.totalItems).toBe(50);
      expect(result.meta.totalPages).toBe(5);
      expect(result.meta.currentPage).toBe(2);
      expect(result.meta.itemsPerPage).toBe(10);
      expect(result.meta.sortBy).toEqual([
        ['createdAt', 'DESC'],
        ['name', 'ASC'],
      ]);
      expect(result.meta.filter).toEqual({ status: 'active' });

      // Links navigation
      expect(result.links.first).toBe(
        '/api/v1/users?page=1&limit=10&sort=-createdAt,name&filter[status]=active',
      );
      expect(result.links.previous).toBe(
        '/api/v1/users?page=1&limit=10&sort=-createdAt,name&filter[status]=active',
      );
      expect(result.links.current).toBe(
        '/api/v1/users?page=2&limit=10&sort=-createdAt,name&filter[status]=active',
      );
      expect(result.links.next).toBe(
        '/api/v1/users?page=3&limit=10&sort=-createdAt,name&filter[status]=active',
      );
      expect(result.links.last).toBe(
        '/api/v1/users?page=5&limit=10&sort=-createdAt,name&filter[status]=active',
      );
    });

    it('should clamp limit to maxLimit', async () => {
      const qb = createMockQb();
      await QueryBuilder.for(qb, { limit: 500 }).setLimit(10, 50).paginate();

      expect(qb.take).toHaveBeenCalledWith(50);
    });
  });

  describe('Terminal Execution Methods', () => {
    it('getMany should build and call qb.getMany', async () => {
      const qb = createMockQb();
      const mockList = [{ id: '1', name: 'Alice' }];
      (qb.getMany as jest.Mock).mockResolvedValue(mockList);

      const result = await QueryBuilder.for(qb, { filter: { name: 'alice' } })
        .allowedFilters(['name'])
        .getMany();

      expect(qb.andWhere).toHaveBeenCalled();
      expect(qb.getMany).toHaveBeenCalled();
      expect(result).toEqual(mockList);
    });

    it('getManyAndCount should build and call qb.getManyAndCount', async () => {
      const qb = createMockQb();
      (qb.getManyAndCount as jest.Mock).mockResolvedValue([[], 0]);

      const result = await QueryBuilder.for(qb, {}).getManyAndCount();

      expect(qb.getManyAndCount).toHaveBeenCalled();
      expect(result).toEqual([[], 0]);
    });

    it('getOne should build and call qb.getOne', async () => {
      const qb = createMockQb();
      const user = { id: '1', name: 'Bob' };
      (qb.getOne as jest.Mock).mockResolvedValue(user);

      const result = await QueryBuilder.for(qb, {}).getOne();

      expect(qb.getOne).toHaveBeenCalled();
      expect(result).toEqual(user);
    });

    it('build should be idempotent (not re-apply filters when called multiple times)', async () => {
      const qb = createMockQb();
      const builder = QueryBuilder.for(qb, {
        filter: { name: 'alice' },
      }).allowedFilters(['name']);

      builder.getQueryBuilder();
      builder.getQueryBuilder();

      expect(qb.andWhere).toHaveBeenCalledTimes(1);
    });
  });

  describe('Security Hardening & Spatie v7 Parity', () => {
    it('should block prototype pollution via bracket keys (__proto__, constructor, prototype)', () => {
      const qb = createMockQb();
      QueryBuilder.for(qb, {
        '__proto__[polluted]': 'yes',
        'constructor[prototype]': 'hacked',
        'filter[__proto__]': 'bad',
        'filter[name]': 'alice',
      })
        .allowedFilters(['name'])
        .getQueryBuilder();

      expect(({} as any).polluted).toBeUndefined();
      expect(qb.andWhere).toHaveBeenCalledWith('user.name ILIKE :qb_f_name_0', {
        qb_f_name_0: '%alice%',
      });
    });

    it('should skip empty arrays (e.g. commas only) and nested objects to prevent SQL 500 crashes', () => {
      const qb = createMockQb();
      QueryBuilder.for(qb, {
        filter: {
          'roles.id': ',,,',
          id: { nested: 'object' },
          status: [{ a: 1 }, { b: 2 }],
        },
      })
        .allowedFilters([
          AllowedFilter.exact('roles.id'),
          AllowedFilter.exact('id'),
          AllowedFilter.exact('status'),
        ])
        .getQueryBuilder();

      expect(qb.andWhere).not.toHaveBeenCalled();
    });

    it('should ignore nested objects in filter arrays while preserving valid scalar siblings', () => {
      const qb = createMockQb();
      QueryBuilder.for(qb, {
        filter: {
          name: [{ x: 'ignored' }, 'John'],
        },
      })
        .allowedFilters(['name'])
        .getQueryBuilder();

      expect(qb.andWhere).toHaveBeenCalledWith(
        '(user.name ILIKE :qb_f_name_0_0)',
        { qb_f_name_0_0: '%John%' },
      );
    });

    it('should respect global arrayDelimiter and filterValueSplittingEnabled config', () => {
      QueryBuilder.configure({ arrayDelimiter: '|' });
      const qbPipe = createMockQb();
      QueryBuilder.for(qbPipe, { filter: { status: 'active|pending' } })
        .allowedFilters([AllowedFilter.exact('status')])
        .getQueryBuilder();

      expect(qbPipe.andWhere).toHaveBeenCalledWith(
        'user.status IN (:...qb_f_status_0)',
        { qb_f_status_0: ['active', 'pending'] },
      );

      QueryBuilder.configure({
        arrayDelimiter: ',',
        filterValueSplittingEnabled: false,
      });
      const qbDisabled = createMockQb();
      QueryBuilder.for(qbDisabled, { filter: { status: 'active,pending' } })
        .allowedFilters([AllowedFilter.exact('status')])
        .getQueryBuilder();

      expect(qbDisabled.andWhere).toHaveBeenCalledWith(
        'user.status = :qb_f_status_0',
        { qb_f_status_0: 'active,pending' },
      );

      const qbOverride = createMockQb();
      QueryBuilder.for(qbOverride, { filter: { status: 'a;b' } })
        .allowedFilters([AllowedFilter.exact('status').delimiter(';')])
        .getQueryBuilder();

      expect(qbOverride.andWhere).toHaveBeenCalledWith(
        'user.status IN (:...qb_f_status_0)',
        { qb_f_status_0: ['a', 'b'] },
      );
    });

    it('should escape LIKE wildcard characters (%, _, \\) in partial/startsWith/endsWith', () => {
      const qb = createMockQb();
      QueryBuilder.for(qb, { filter: { email: '100%_test\\a' } })
        .allowedFilters(['email'])
        .getQueryBuilder();

      expect(qb.andWhere).toHaveBeenCalledWith(
        'user.email ILIKE :qb_f_email_0',
        { qb_f_email_0: '%100\\%\\_test\\\\a%' },
      );
    });

    it('should auto-cast boolean strings in exact filters', () => {
      const qb = createMockQb();
      QueryBuilder.for(qb, {
        filter: { isActive: 'true', isDeleted: 'false' },
      })
        .allowedFilters([
          AllowedFilter.exact('isActive'),
          AllowedFilter.exact('isDeleted'),
        ])
        .getQueryBuilder();

      expect(qb.andWhere).toHaveBeenCalledWith(
        'user.isActive = :qb_f_isActive_0',
        { qb_f_isActive_0: true },
      );
      expect(qb.andWhere).toHaveBeenCalledWith(
        'user.isDeleted = :qb_f_isDeleted_1',
        { qb_f_isDeleted_1: false },
      );
    });

    it('should ignore untrusted query.path and safely encode special chars in pagination links', async () => {
      const qb = createMockQb();
      (qb.getManyAndCount as jest.Mock).mockResolvedValue([[], 30]);

      const result = await QueryBuilder.for(qb, {
        path: 'https://evil.com/phishing',
        page: 1,
        limit: 10,
        filter: { name: 'a&b=c#d' },
      }).paginate();

      expect(result.links.current).not.toContain('evil.com');
      expect(result.links.current).toBe(
        '?page=1&limit=10&filter[name]=a%26b%3Dc%23d',
      );
    });

    it('should floor fractional limits and clamp extreme page numbers to maxPage', async () => {
      const qbFrac = createMockQb();
      await QueryBuilder.for(qbFrac, { limit: 0.5 }).paginate();
      expect(qbFrac.take).toHaveBeenCalledWith(10); // falls back to default

      const qbFloat = createMockQb();
      await QueryBuilder.for(qbFloat, { limit: 15.9, page: 999999999 })
        .setLimit(10, 50)
        .paginate();
      expect(qbFloat.take).toHaveBeenCalledWith(15);
      expect(qbFloat.skip).toHaveBeenCalledWith((10_000 - 1) * 15);
    });

    it('should apply includes before sparse fieldsets so relation fields are not overwritten', () => {
      const callOrder: string[] = [];
      const qb = createMockQb();
      (qb.leftJoinAndSelect as jest.Mock).mockImplementation(() => {
        callOrder.push('include');
        return qb;
      });
      (qb.select as jest.Mock).mockImplementation(() => {
        callOrder.push('select');
        return qb;
      });

      QueryBuilder.for(qb, {
        include: 'roles',
        fields: { user: 'id,name', roles: 'id,title' },
      })
        .allowedIncludes(['roles'])
        .allowedFields(['id', 'name', 'roles.id', 'roles.title'])
        .getQueryBuilder();

      expect(callOrder).toEqual(['include', 'select']);
    });

    it('should support dynamic operator filters (e.g. >=100, <=500)', () => {
      const qb = createMockQb();
      QueryBuilder.for(qb, { filter: { price: '>=100,<=500' } })
        .allowedFilters([AllowedFilter.operator('price', 'dynamic')])
        .getQueryBuilder();

      expect(qb.andWhere).toHaveBeenCalledWith(
        'user.price >= :qb_f_price_0_0',
        {
          qb_f_price_0_0: '100',
        },
      );
      expect(qb.andWhere).toHaveBeenCalledWith(
        'user.price <= :qb_f_price_0_1',
        {
          qb_f_price_0_1: '500',
        },
      );
    });

    it('should support AllowedFilter.groupOr and groupAnd with validation', () => {
      expect(() => AllowedFilter.groupOr('q', [])).toThrow(
        'FiltersGroup requires at least one member.',
      );

      const qb = createMockQb();
      QueryBuilder.for(qb, { filter: { q: 'john' } })
        .allowedFilters([
          AllowedFilter.groupOr('q', [
            AllowedFilter.partial('name'),
            AllowedFilter.partial('email'),
          ]),
        ])
        .getQueryBuilder();

      expect(qb.andWhere).toHaveBeenCalledTimes(1);
      const bracketArg = (qb.andWhere as jest.Mock).mock.calls[0][0];
      expect(bracketArg).toBeInstanceOf(Brackets);

      // Execute bracket callback against a mock WhereExpressionBuilder
      const subQb = {
        andWhere: jest.fn().mockImplementation((b: Brackets) => {
          b.whereFactory(innerQb1 as any);
          return subQb;
        }),
        orWhere: jest.fn().mockImplementation((b: Brackets) => {
          b.whereFactory(innerQb2 as any);
          return subQb;
        }),
      };
      const innerQb1 = { andWhere: jest.fn().mockReturnThis() };
      const innerQb2 = { andWhere: jest.fn().mockReturnThis() };

      bracketArg.whereFactory(subQb as any);

      expect(subQb.andWhere).toHaveBeenCalledTimes(1);
      expect(subQb.orWhere).toHaveBeenCalledTimes(1);
      expect(innerQb1.andWhere).toHaveBeenCalledWith(
        'user.name ILIKE :qb_f_name_0',
        { qb_f_name_0: '%john%' },
      );
      expect(innerQb2.andWhere).toHaveBeenCalledWith(
        'user.email ILIKE :qb_f_email_1',
        { qb_f_email_1: '%john%' },
      );
    });

    it('should support AllowedFilter.groupAnd, skip empty values, and reject invalid members', () => {
      expect(() => AllowedFilter.groupAnd('m', ['invalid' as any])).toThrow(
        'FiltersGroup members must be AllowedFilter instances.',
      );

      // Empty value should be skipped without calling andWhere
      const qbEmpty = createMockQb();
      QueryBuilder.for(qbEmpty, { filter: { m: '' } })
        .allowedFilters([
          AllowedFilter.groupAnd('m', [
            AllowedFilter.partial('firstName'),
            AllowedFilter.partial('lastName'),
          ]),
        ])
        .getQueryBuilder();
      expect(qbEmpty.andWhere).not.toHaveBeenCalled();

      // Non-empty value uses AND for every member
      const qb = createMockQb();
      QueryBuilder.for(qb, { filter: { m: 'doe' } })
        .allowedFilters([
          AllowedFilter.groupAnd('m', [
            AllowedFilter.partial('firstName'),
            AllowedFilter.partial('lastName'),
          ]),
        ])
        .getQueryBuilder();

      const bracketArg = (qb.andWhere as jest.Mock).mock.calls[0][0];
      const innerQb1 = { andWhere: jest.fn().mockReturnThis() };
      const innerQb2 = { andWhere: jest.fn().mockReturnThis() };
      let callCount = 0;
      const subQb = {
        andWhere: jest.fn().mockImplementation((b: Brackets) => {
          b.whereFactory((callCount++ === 0 ? innerQb1 : innerQb2) as any);
          return subQb;
        }),
        orWhere: jest.fn(),
      };

      bracketArg.whereFactory(subQb as any);

      expect(subQb.andWhere).toHaveBeenCalledTimes(2);
      expect(subQb.orWhere).not.toHaveBeenCalled();
      expect(innerQb1.andWhere).toHaveBeenCalledWith(
        'user.firstName ILIKE :qb_f_firstName_0',
        { qb_f_firstName_0: '%doe%' },
      );
      expect(innerQb2.andWhere).toHaveBeenCalledWith(
        'user.lastName ILIKE :qb_f_lastName_1',
        { qb_f_lastName_1: '%doe%' },
      );
    });

    it('should handle all dynamic operator edge cases (single, bare value, !=, empty stripped value)', () => {
      const qbSingle = createMockQb();
      QueryBuilder.for(qbSingle, {
        filter: {
          age: '>18',
          score: '!=0',
          rank: '5',
          deleted: '!=',
          emptyEq: '=',
        },
      })
        .allowedFilters([
          AllowedFilter.operator('age', 'dynamic'),
          AllowedFilter.operator('score', 'dynamic'),
          AllowedFilter.operator('rank', 'dynamic'),
          AllowedFilter.operator('deleted', 'dynamic'),
          AllowedFilter.operator('emptyEq', 'dynamic'),
        ])
        .getQueryBuilder();

      expect(qbSingle.andWhere).toHaveBeenCalledWith('user.age > :qb_f_age_0', {
        qb_f_age_0: '18',
      });
      expect(qbSingle.andWhere).toHaveBeenCalledWith(
        'user.score != :qb_f_score_1',
        { qb_f_score_1: '0' },
      );
      expect(qbSingle.andWhere).toHaveBeenCalledWith(
        'user.rank = :qb_f_rank_2',
        { qb_f_rank_2: '5' },
      );
      expect(qbSingle.andWhere).toHaveBeenCalledWith(
        'user.deleted IS NOT NULL',
      );
      expect(qbSingle.andWhere).toHaveBeenCalledWith('user.emptyEq IS NULL');
    });

    it('should escape LIKE wildcards in startsWith and endsWith (single and array)', () => {
      const qb = createMockQb();
      QueryBuilder.for(qb, {
        filter: {
          code: 'INV_100%',
          domain: '.co_m,%.net',
        },
      })
        .allowedFilters([
          AllowedFilter.startsWith('code'),
          AllowedFilter.endsWith('domain'),
        ])
        .getQueryBuilder();

      expect(qb.andWhere).toHaveBeenCalledWith('user.code ILIKE :qb_f_code_0', {
        qb_f_code_0: 'INV\\_100\\%%',
      });
      expect(qb.andWhere).toHaveBeenCalledWith(
        '(user.domain ILIKE :qb_f_domain_1_0 OR user.domain ILIKE :qb_f_domain_1_1)',
        {
          qb_f_domain_1_0: '%.co\\_m',
          qb_f_domain_1_1: '%\\%.net',
        },
      );
    });

    it('should support exact multi-select for string slugs, boolean arrays, and per-filter delimiter(null)', () => {
      const qb = createMockQb();
      QueryBuilder.for(qb, {
        filter: {
          slug: 'genshin,honkai,zenless',
          flags: 'true,false',
          title: 'Hello, World',
        },
      })
        .allowedFilters([
          AllowedFilter.exact('slug'),
          AllowedFilter.exact('flags'),
          AllowedFilter.exact('title').delimiter(null),
        ])
        .getQueryBuilder();

      expect(qb.andWhere).toHaveBeenCalledWith(
        'user.slug IN (:...qb_f_slug_0)',
        {
          qb_f_slug_0: ['genshin', 'honkai', 'zenless'],
        },
      );
      expect(qb.andWhere).toHaveBeenCalledWith(
        'user.flags IN (:...qb_f_flags_1)',
        { qb_f_flags_1: [true, false] },
      );
      expect(qb.andWhere).toHaveBeenCalledWith('user.title = :qb_f_title_2', {
        qb_f_title_2: 'Hello, World',
      });
    });

    it('should auto-enable nullable when default(null) is set and handle boolean ignore() strictly', () => {
      const qbNullDefault = createMockQb();
      QueryBuilder.for(qbNullDefault, {})
        .allowedFilters([AllowedFilter.exact('deletedAt').default(null)])
        .getQueryBuilder();

      expect(qbNullDefault.andWhere).toHaveBeenCalledWith(
        'user.deletedAt IS NULL',
      );

      // ignore(null, '') must NOT drop boolean false
      const qbBoolKeep = createMockQb();
      QueryBuilder.for(qbBoolKeep, { filter: { active: false } })
        .allowedFilters([AllowedFilter.exact('active').ignore(null, '')])
        .getQueryBuilder();
      expect(qbBoolKeep.andWhere).toHaveBeenCalledWith(
        'user.active = :qb_f_active_0',
        { qb_f_active_0: false },
      );

      // ignore('false') DOES drop boolean false
      const qbBoolDrop = createMockQb();
      QueryBuilder.for(qbBoolDrop, { filter: { active: false } })
        .allowedFilters([AllowedFilter.exact('active').ignore('false')])
        .getQueryBuilder();
      expect(qbBoolDrop.andWhere).not.toHaveBeenCalled();
    });

    it('should safely ignore nested objects in sort and include arrays while keeping scalar siblings', () => {
      const qb = createMockQb();
      QueryBuilder.for(qb, {
        sort: [{ bad: 1 } as any, '-createdAt'],
        include: [{ nested: 'bad' } as any, 'roles'],
      })
        .allowedSorts(['createdAt'])
        .allowedIncludes(['roles'])
        .getQueryBuilder();

      expect(qb.orderBy).toHaveBeenCalledWith('user.createdAt', 'DESC');
      expect(qb.leftJoinAndSelect).toHaveBeenCalledWith('user.roles', 'roles');
    });

    it('should fallback to defaults for negative, zero, or NaN page and limit values', async () => {
      const qb = createMockQb();
      await QueryBuilder.for(qb, {
        page: -5,
        limit: 'not-a-number',
      }).paginate();

      expect(qb.skip).toHaveBeenCalledWith(0);
      expect(qb.take).toHaveBeenCalledWith(10);

      const qbZero = createMockQb();
      await QueryBuilder.for(qbZero, { page: 0, limit: 0 }).paginate();
      expect(qbZero.skip).toHaveBeenCalledWith(0);
      expect(qbZero.take).toHaveBeenCalledWith(10);
    });

    it('should automatically build full pagination URLs via configured pathResolver (Laravel Paginator parity)', async () => {
      QueryBuilder.configure({
        pathResolver: () => 'https://api.crodic.click/api/v1/users',
      });

      const qb = createMockQb();
      (qb.getManyAndCount as jest.Mock).mockResolvedValue([[], 30]);

      const result = await QueryBuilder.for(qb, {
        page: 2,
        limit: 10,
        filter: { status: 'active' },
        path: 'https://evil.com/spoofed', // must still be ignored
      }).paginate();

      expect(result.links.first).toBe(
        'https://api.crodic.click/api/v1/users?page=1&limit=10&filter[status]=active',
      );
      expect(result.links.previous).toBe(
        'https://api.crodic.click/api/v1/users?page=1&limit=10&filter[status]=active',
      );
      expect(result.links.current).toBe(
        'https://api.crodic.click/api/v1/users?page=2&limit=10&filter[status]=active',
      );
      expect(result.links.next).toBe(
        'https://api.crodic.click/api/v1/users?page=3&limit=10&filter[status]=active',
      );
      expect(result.links.last).toBe(
        'https://api.crodic.click/api/v1/users?page=3&limit=10&filter[status]=active',
      );

      // Explicit options.path still takes precedence over global pathResolver
      const overrideRes = await QueryBuilder.for(qb, {
        page: 1,
        limit: 10,
      }).paginate({ path: '/custom/path' });
      expect(overrideRes.links.current).toBe('/custom/path?page=1&limit=10');
    });
  });

  describe('Cursor Pagination (cursorPaginate)', () => {
    it('should encode and decode Cursor safely and reject malformed or prototype-polluting inputs', () => {
      const encoded = new Cursor(
        { id: '42', createdAt: '2026-11-24T00:00:00.000Z' },
        true,
      ).encode();
      const decoded = Cursor.fromEncoded(encoded);

      expect(decoded).not.toBeNull();
      expect(decoded!.parameters).toEqual({
        id: '42',
        createdAt: '2026-11-24T00:00:00.000Z',
      });
      expect(decoded!.pointsToNextItems).toBe(true);

      const prevDecoded = Cursor.fromEncoded(
        new Cursor({ id: '10' }, false).encode(),
      );
      expect(prevDecoded!.pointsToNextItems).toBe(false);

      expect(Cursor.fromEncoded(null)).toBeNull();
      expect(Cursor.fromEncoded('')).toBeNull();
      expect(Cursor.fromEncoded('not-valid-base64!!!')).toBeNull();
      expect(
        Cursor.fromEncoded(Buffer.from('[]').toString('base64url')),
      ).toBeNull();

      // Prototype pollution payload inside base64 cursor
      const evilCursor = Buffer.from(
        '{"__proto__":{"hacked":true},"_pointsToNextItems":true}',
      ).toString('base64url');
      expect(Cursor.fromEncoded(evilCursor)).toBeNull();
      expect(({} as any).hacked).toBeUndefined();
    });

    it('should paginate first page using limit + 1 lookahead and build full URL next link via pathResolver', async () => {
      QueryBuilder.configure({
        pathResolver: () => 'https://api.crodic.click/api/v1/posts',
      });

      const qb = createMockQb('post');
      (qb.getMany as jest.Mock).mockResolvedValue([
        { id: '100', name: 'A' },
        { id: '99', name: 'B' },
        { id: '98', name: 'C' }, // lookahead row (+1)
      ]);

      const result = await QueryBuilder.for(qb, {
        limit: 2,
        filter: { status: 'published' },
      })
        .allowedFilters([AllowedFilter.exact('status')])
        .cursorPaginate();

      expect(result).toBeInstanceOf(CursorPaginated);
      expect(qb.orderBy).toHaveBeenCalledWith('post.id', 'DESC');
      expect(qb.take).toHaveBeenCalledWith(3); // limit + 1
      expect(result.data).toHaveLength(2);
      expect(result.data.map((d: any) => d.id)).toEqual(['100', '99']);
      expect(result.meta.itemsPerPage).toBe(2);
      expect(result.meta.hasMore).toBe(true);
      expect(result.meta.prevCursor).toBeNull();
      expect(result.meta.nextCursor).toBeTruthy();
      expect(result.links.previous).toBeUndefined();
      expect(result.links.next).toBe(
        `https://api.crodic.click/api/v1/posts?limit=2&filter[status]=published&cursor=${result.meta.nextCursor}`,
      );

      const decodedNext = Cursor.fromEncoded(result.meta.nextCursor);
      expect(decodedNext!.parameters).toEqual({ id: '99' });
      expect(decodedNext!.pointsToNextItems).toBe(true);
    });

    it('should navigate forward and detect the final page accurately', async () => {
      const qb = createMockQb('post');
      const forwardCursor = new Cursor({ id: '99' }, true).encode();
      (qb.getMany as jest.Mock).mockResolvedValue([
        { id: '98', name: 'C' },
        { id: '97', name: 'D' },
      ]); // exactly limit (no +1 row -> final page)

      const result = await QueryBuilder.for(qb, {
        limit: 2,
        cursor: forwardCursor,
      }).cursorPaginate();

      expect(qb.orderBy).toHaveBeenCalledWith('post.id', 'DESC');
      expect(qb.andWhere).toHaveBeenCalledWith('post.id < :qb_c_0', {
        qb_c_0: '99',
      });
      expect(result.meta.hasMore).toBe(false);
      expect(result.meta.nextCursor).toBeNull();
      expect(result.meta.prevCursor).toBeTruthy();
      expect(result.links.next).toBeUndefined();
      expect(result.links.previous).toBeDefined();

      const decodedPrev = Cursor.fromEncoded(result.meta.prevCursor);
      expect(decodedPrev!.parameters).toEqual({ id: '98' });
      expect(decodedPrev!.pointsToNextItems).toBe(false);
    });

    it('should invert ORDER BY and WHERE when navigating backwards and reverse results back to display order', async () => {
      const qb = createMockQb('post');
      const prevCursor = new Cursor({ id: '98' }, false).encode();
      // DB returns in ASC order because ORDER BY was inverted from DESC to ASC
      (qb.getMany as jest.Mock).mockResolvedValue([
        { id: '99', name: 'B' },
        { id: '100', name: 'A' },
        { id: '101', name: 'Z' }, // lookahead row showing there are still earlier pages
      ]);

      const result = await QueryBuilder.for(qb, {
        limit: 2,
        cursor: prevCursor,
      }).cursorPaginate();

      expect(qb.orderBy).toHaveBeenCalledWith('post.id', 'ASC');
      expect(qb.andWhere).toHaveBeenCalledWith('post.id > :qb_c_0', {
        qb_c_0: '98',
      });
      // Reversed back to DESC display order
      expect(result.data.map((d: any) => d.id)).toEqual(['100', '99']);
      expect(result.meta.prevCursor).toBeTruthy();
      expect(result.meta.nextCursor).toBeTruthy();
      expect(result.meta.hasMore).toBe(true);
    });

    it('should append tie-breaker column and build lexicographic Brackets WHERE for multi-column sorts', async () => {
      const qb = createMockQb('post');
      const cursor = new Cursor(
        { createdAt: '2026-11-24T00:00:00.000Z', id: '50' },
        true,
      ).encode();

      (qb.getMany as jest.Mock).mockResolvedValue([
        { id: '49', createdAt: new Date('2026-11-23T12:00:00.000Z') },
      ]);

      await QueryBuilder.for(qb, {
        sort: '-createdAt',
        cursor,
        limit: 5,
      })
        .allowedSorts(['createdAt', 'id'])
        .cursorPaginate();

      expect(qb.orderBy).toHaveBeenCalledWith('post.createdAt', 'DESC');
      expect(qb.addOrderBy).toHaveBeenCalledWith('post.id', 'DESC');

      const bracketArg = (qb.andWhere as jest.Mock).mock.calls[0][0];
      expect(bracketArg).toBeInstanceOf(Brackets);

      const subQb = {
        where: jest.fn().mockReturnThis(),
        orWhere: jest.fn().mockReturnThis(),
      };
      bracketArg.whereFactory(subQb as any);

      expect(subQb.where).toHaveBeenCalledWith('(post.createdAt < :qb_c_0_0)', {
        qb_c_0_0: '2026-11-24T00:00:00.000Z',
      });
      expect(subQb.orWhere).toHaveBeenCalledWith(
        '(post.createdAt = :qb_c_1_0 AND post.id < :qb_c_1_1)',
        {
          qb_c_1_0: '2026-11-24T00:00:00.000Z',
          qb_c_1_1: '50',
        },
      );
    });

    it('should safely ignore stale cursors when sort columns changed and enforce strict sort validation', async () => {
      const qb = createMockQb('post');
      // Cursor only has 'id', but request now sorts by '-createdAt' (requires createdAt + id)
      const staleCursor = new Cursor({ id: '50' }, true).encode();
      (qb.getMany as jest.Mock).mockResolvedValue([]);

      await QueryBuilder.for(qb, {
        sort: '-createdAt',
        cursor: staleCursor,
      })
        .allowedSorts(['createdAt'])
        .cursorPaginate();

      expect(qb.andWhere).not.toHaveBeenCalled();

      // Strict mode still throws InvalidSortQueryException
      const qbStrict = createMockQb('post');
      await expect(
        QueryBuilder.for(qbStrict, { sort: '-forbiddenCol' })
          .allowedSorts(['createdAt'])
          .strict(true)
          .cursorPaginate(),
      ).rejects.toThrow(InvalidSortQueryException);
    });
  });
});
