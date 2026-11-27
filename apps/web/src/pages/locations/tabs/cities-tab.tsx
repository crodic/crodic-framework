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
import { getCitiesTableColumns } from '../columns/cities-columns'
import { apiDeleteCity, useCitiesQuery } from '../queries'
import { CityColumnKey, type CitySchema } from '../schema'

const cityFilterParsers = {
  [CityColumnKey.name]: parseAsString,
  [CityColumnKey.stateCode]: parseAsArrayOf(parseAsString, ','),
  [CityColumnKey.countryCode]: parseAsArrayOf(parseAsString, ','),
  [CityColumnKey.code]: parseAsString,
} as const

export function CitiesTab() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [cityToDelete, setCityToDelete] = useState<CitySchema | null>(null)

  const handleEdit = useCallback(
    (city: CitySchema) => {
      navigate(`/locations/cities/${city.id}/edit`)
    },
    [navigate]
  )

  const handleDelete = useCallback((city: CitySchema) => {
    setCityToDelete(city)
    setDeleteDialogOpen(true)
  }, [])

  const columns = useMemo(
    () =>
      getCitiesTableColumns({
        onEdit: handleEdit,
        onDelete: handleDelete,
      }),
    [handleEdit, handleDelete]
  )

  const buildQuery: RestResourceQueryBuilderFn<typeof cityFilterParsers> =
    useCallback((builder, filter) => {
      builder
        .filter('name', filter.name)
        .filter('stateCode', filter.stateCode)
        .filter('countryCode', filter.countryCode)
        .filter('code', filter.code)
    }, [])

  const { table, isFetching } = useRestResourceTable<
    CitySchema,
    typeof cityFilterParsers
  >({
    columns,
    allowedSorts: [
      CityColumnKey.name,
      CityColumnKey.stateCode,
      CityColumnKey.countryCode,
      CityColumnKey.code,
      CityColumnKey.createdAt,
    ],
    filterParsers: cityFilterParsers,
    queryHook: useCitiesQuery,
    buildQuery,
    initialColumnPinning: { right: ['actions'] },
    getRowId: (row) => row.id,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiDeleteCity(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cities'] })
      queryClient.invalidateQueries({ queryKey: ['public-cities'] })
      toast.success(t('locations.city.deleted', 'City deleted successfully'))
      setDeleteDialogOpen(false)
      setCityToDelete(null)
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
              navigate('/locations/cities/create')
            }}
          >
            <PlusIcon className='mr-1 size-4' />
            {t('locations.city.createBtn', 'Add City')}
          </Button>
          <DataTableSortList table={table} />
        </DataTableToolbar>
      </DataTable>

      {deleteDialogOpen && cityToDelete && (
        <DeleteAlertDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          handleDelete={() => deleteMutation.mutate(cityToDelete.id)}
          isLoading={deleteMutation.isPending}
          title='locations.city.deleteTitle'
          description='locations.city.deleteDesc'
          translationValues={{ name: cityToDelete.name }}
        />
      )}
    </div>
  )
}
