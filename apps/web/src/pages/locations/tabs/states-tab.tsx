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
import { getStatesTableColumns } from '../columns/states-columns'
import { apiDeleteState, useStatesQuery } from '../queries'
import { StateColumnKey, type StateSchema } from '../schema'

const stateFilterParsers = {
  [StateColumnKey.name]: parseAsString,
  [StateColumnKey.countryCode]: parseAsArrayOf(parseAsString, ','),
  [StateColumnKey.iso2]: parseAsString,
} as const

export function StatesTab() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [stateToDelete, setStateToDelete] = useState<StateSchema | null>(null)

  const handleEdit = useCallback(
    (state: StateSchema) => {
      navigate(`/locations/states/${state.id}/edit`)
    },
    [navigate]
  )

  const handleDelete = useCallback((state: StateSchema) => {
    setStateToDelete(state)
    setDeleteDialogOpen(true)
  }, [])

  const columns = useMemo(
    () =>
      getStatesTableColumns({
        onEdit: handleEdit,
        onDelete: handleDelete,
      }),
    [handleEdit, handleDelete]
  )

  const buildQuery: RestResourceQueryBuilderFn<typeof stateFilterParsers> =
    useCallback((builder, filter) => {
      builder
        .filter('name', filter.name)
        .filter('countryCode', filter.countryCode)
        .filter('iso2', filter.iso2)
    }, [])

  const { table, isFetching } = useRestResourceTable<
    StateSchema,
    typeof stateFilterParsers
  >({
    columns,
    allowedSorts: [
      StateColumnKey.name,
      StateColumnKey.countryCode,
      StateColumnKey.iso2,
      StateColumnKey.type,
      StateColumnKey.createdAt,
    ],
    filterParsers: stateFilterParsers,
    queryHook: useStatesQuery,
    buildQuery,
    initialColumnPinning: { right: ['actions'] },
    getRowId: (row) => row.id,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiDeleteState(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['states'] })
      queryClient.invalidateQueries({ queryKey: ['public-states'] })
      toast.success(
        t('locations.state.deleted', 'State / Province deleted successfully')
      )
      setDeleteDialogOpen(false)
      setStateToDelete(null)
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
              navigate('/locations/states/create')
            }}
          >
            <PlusIcon className='mr-1 size-4' />
            {t('locations.state.createBtn', 'Add State')}
          </Button>
          <DataTableSortList table={table} />
        </DataTableToolbar>
      </DataTable>

      {deleteDialogOpen && stateToDelete && (
        <DeleteAlertDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          handleDelete={() => deleteMutation.mutate(stateToDelete.id)}
          isLoading={deleteMutation.isPending}
          title='locations.state.deleteTitle'
          description='locations.state.deleteDesc'
          translationValues={{ name: stateToDelete.name }}
        />
      )}
    </div>
  )
}
