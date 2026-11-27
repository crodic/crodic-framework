import { useCallback, useMemo, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { PlusIcon } from 'lucide-react'
import { parseAsArrayOf, parseAsString } from 'nuqs'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { restApiErrorHandler } from '@/lib/rest-api-handler'
import {
  useRestResourceTable,
  type RestResourceQueryBuilderFn,
} from '@/hooks/use-rest-resource-table'
import { Button } from '@/components/ui/button'
import { DeleteAlertDialog } from '@/components/common/delete-alert-dialog'
import { DataTable } from '@/components/data-table/data-table'
import { DataTableSortList } from '@/components/data-table/data-table-sort-list'
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar'
import { getCountriesTableColumns } from '../columns/countries-columns'
import {
  apiDeleteCountry,
  useCountriesQuery,
  usePublicRegionsQuery,
} from '../queries'
import { CountryColumnKey, type CountrySchema } from '../schema'

const countryFilterParsers = {
  [CountryColumnKey.name]: parseAsString,
  [CountryColumnKey.iso2]: parseAsString,
  [CountryColumnKey.regionId]: parseAsArrayOf(parseAsString, ','),
} as const

export function CountriesTab() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [countryToDelete, setCountryToDelete] = useState<CountrySchema | null>(
    null
  )

  const { data: regions } = usePublicRegionsQuery()

  const handleEdit = useCallback(
    (country: CountrySchema) => {
      navigate(`/locations/countries/${country.id}/edit`)
    },
    [navigate]
  )

  const handleDelete = useCallback((country: CountrySchema) => {
    setCountryToDelete(country)
    setDeleteDialogOpen(true)
  }, [])

  const columns = useMemo(
    () =>
      getCountriesTableColumns({
        regions: regions ?? [],
        onEdit: handleEdit,
        onDelete: handleDelete,
      }),
    [regions, handleEdit, handleDelete]
  )

  const buildQuery: RestResourceQueryBuilderFn<typeof countryFilterParsers> =
    useCallback((builder, filter) => {
      builder
        .filter('name', filter.name)
        .filter('iso2', filter.iso2)
        .filter('regionId', filter.regionId)
    }, [])

  const { table, isFetching } = useRestResourceTable<
    CountrySchema,
    typeof countryFilterParsers
  >({
    columns,
    allowedSorts: [
      CountryColumnKey.name,
      CountryColumnKey.iso2,
      CountryColumnKey.capital,
      CountryColumnKey.phonecode,
      CountryColumnKey.currency,
      CountryColumnKey.createdAt,
    ],
    filterParsers: countryFilterParsers,
    queryHook: useCountriesQuery,
    buildQuery,
    initialColumnPinning: { right: ['actions'] },
    getRowId: (row) => row.id,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiDeleteCountry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['countries'] })
      queryClient.invalidateQueries({ queryKey: ['public-countries'] })
      toast.success(
        t('locations.country.deleted', 'Country deleted successfully')
      )
      setDeleteDialogOpen(false)
      setCountryToDelete(null)
    },
    onError: restApiErrorHandler,
  })

  return (
    <div className='space-y-4'>
      <DataTable table={table} isFetching={isFetching}>
        <DataTableToolbar table={table}>
          <Button
            size='sm'
            onClick={() => {
              navigate('/locations/countries/create')
            }}
          >
            <PlusIcon className='mr-1 size-4' />
            {t('locations.country.createBtn', 'Add Country')}
          </Button>
          <DataTableSortList table={table} />
        </DataTableToolbar>
      </DataTable>

      {deleteDialogOpen && countryToDelete && (
        <DeleteAlertDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          handleDelete={() => deleteMutation.mutate(countryToDelete.id)}
          isLoading={deleteMutation.isPending}
          title='locations.country.deleteTitle'
          description='locations.country.deleteDesc'
          translationValues={{ name: countryToDelete.name }}
        />
      )}
    </div>
  )
}
