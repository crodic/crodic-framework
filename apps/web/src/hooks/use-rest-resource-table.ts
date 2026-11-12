import { useMemo, useState } from 'react'
import type {
  ColumnDef,
  ColumnFiltersState,
  Row,
  Table,
  TableState,
} from '@tanstack/react-table'
import type { ExtendedColumnSort, QueryKeys } from '@/types/data-table'
import type { SingleParser } from 'nuqs'
import { RestQueryBuilder, type RestQueryParams } from '@/lib/query-builder'
import { useDataTable } from '@/hooks/use-data-table'
import useGetFilterParams, {
  type InferParsers,
} from '@/hooks/use-get-filter-params'

const DEFAULT_COLUMN_PINNING = { right: ['actions'] }

export type RestResourceQueryBuilderFn<
  TParsers extends Record<string, SingleParser<any>> = Record<
    string,
    SingleParser<any>
  >,
> = (
  builder: RestQueryBuilder,
  filter: InferParsers<TParsers>,
  search?: string
) => void

export interface UseRestResourceTableOptions<
  TData,
  TParsers extends Record<string, SingleParser<any>> = Record<
    string,
    SingleParser<any>
  >,
> {
  columns: ColumnDef<TData, any>[]
  allowedSorts?: string[]
  filterParsers?: TParsers
  buildQuery?: RestResourceQueryBuilderFn<TParsers>
  queryHook: (params: RestQueryParams) => {
    data?: {
      data: TData[]
      meta?: { totalPages: number; totalItems?: number; [key: string]: any }
    }
    isFetching: boolean
    [key: string]: any
  }
  initialColumnPinning?: { left?: string[]; right?: string[] }
  initialState?: Omit<Partial<TableState>, 'sorting'> & {
    sorting?: ExtendedColumnSort<TData>[]
  }
  getRowId?: (row: TData) => string
  enableRowSelection?: boolean | ((row: Row<TData>) => boolean)
  clearOnDefault?: boolean
  queryKeys?: Partial<QueryKeys>
}

export interface UseRestResourceTableReturn<
  TData,
  TParsers extends Record<string, SingleParser<any>>,
> {
  table: Table<TData>
  data: TData[]
  meta?: { totalPages: number; totalItems?: number; [key: string]: any }
  isFetching: boolean
  filter: InferParsers<TParsers>
  page: number
  perPage: number
  search: string
  queryParams: RestQueryParams
}

/**
 * Deep hook encapsulating RESTful/Spatie-style query building (filter[...], sort=-..., include=...),
 * URL query synchronization, and TanStack Table management into a single cohesive interface.
 */
export function useRestResourceTable<
  TData,
  TParsers extends Record<string, SingleParser<any>> = Record<
    string,
    SingleParser<any>
  >,
>({
  columns,
  allowedSorts = [],
  filterParsers,
  buildQuery,
  queryHook,
  initialColumnPinning = DEFAULT_COLUMN_PINNING,
  initialState,
  getRowId = (row: any) => row.id,
  enableRowSelection,
  clearOnDefault,
  queryKeys,
}: UseRestResourceTableOptions<TData, TParsers>): UseRestResourceTableReturn<
  TData,
  TParsers
> {
  const {
    page,
    perPage,
    sorting: sort,
    filter,
    search,
  } = useGetFilterParams<TData, TParsers>({
    allowedSorts,
    filterParsers: filterParsers ?? ({} as TParsers),
    queryKeys,
  })

  const initialColumnFilters: ColumnFiltersState = useMemo(() => {
    const urlFilters: ColumnFiltersState = []
    for (const [key, value] of Object.entries(filter)) {
      if (
        value !== null &&
        value !== undefined &&
        value !== '' &&
        (!Array.isArray(value) || value.length > 0)
      ) {
        urlFilters.push({ id: key, value })
      }
    }
    if (urlFilters.length > 0) {
      return urlFilters
    }
    return initialState?.columnFilters ?? []
  }, [filter, initialState?.columnFilters])

  const [columnFilters, setColumnFilters] =
    useState<ColumnFiltersState>(initialColumnFilters)

  const effectiveFilter = useMemo(() => {
    const res: Record<string, any> = {}
    for (const f of columnFilters) {
      res[f.id] = f.value
    }
    return res as InferParsers<TParsers>
  }, [columnFilters])

  const queryParams = useMemo(() => {
    const builder = new RestQueryBuilder().page(page).limit(perPage)

    if (search) {
      builder.search(search)
    }

    if (sort.length > 0) {
      sort.forEach(({ id, desc }) => {
        builder.sortBy(id, desc ? 'desc' : 'asc')
      })
    }

    if (buildQuery) {
      buildQuery(builder, effectiveFilter, search)
    }

    return builder.build()
  }, [page, perPage, effectiveFilter, sort, search, buildQuery])

  const { data, isFetching } = queryHook(queryParams)
  const totalPages = data?.meta?.totalPages ?? 0

  const { table } = useDataTable({
    data: data?.data ?? [],
    columns,
    pageCount: totalPages,
    queryKeys,
    columnFilters,
    onColumnFiltersChange: setColumnFilters,
    initialState: {
      columnPinning: initialColumnPinning,
      ...initialState,
    },
    getRowId,
    enableRowSelection,
    clearOnDefault,
  })

  return {
    table,
    data: data?.data ?? [],
    meta: data?.meta,
    isFetching,
    filter: effectiveFilter,
    page,
    perPage,
    search,
    queryParams,
  }
}
