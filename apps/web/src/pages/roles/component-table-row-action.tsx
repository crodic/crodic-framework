import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Edit2Icon, Trash2Icon } from 'lucide-react'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { restApiErrorHandler } from '@/lib/rest-api-handler'
import { DeleteAlertDialog } from '@/components/common/delete-alert-dialog'
import {
  TableRowAction,
  TableRowActions,
} from '@/components/data-table/table-row-actions'
import { apiDeleteRole } from './queries'
import { isProtectedRole, type RoleSchema } from './schema'

export default function ComponentTableRowActions({
  row,
}: {
  row: { original: RoleSchema }
}) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [isShowDeleteDialog, setIsShowDeleteDialog] = useState(false)

  const deleteRoleMutation = useMutation({
    mutationFn: apiDeleteRole,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['roles'],
      })
      toast.success('Role deleted successfully')
      setIsShowDeleteDialog(false)
    },
    onError: restApiErrorHandler,
  })

  const handleDelete = () => {
    if (isProtectedRole(row.original)) {
      toast.error('System roles cannot be deleted')
      return
    }

    deleteRoleMutation.mutate(row.original.id)
  }

  const isProtected = isProtectedRole(row.original)

  return (
    <TableRowActions>
      {isShowDeleteDialog && (
        <DeleteAlertDialog
          open={isShowDeleteDialog}
          onOpenChange={(open) => setIsShowDeleteDialog(open)}
          handleDelete={handleDelete}
          isLoading={deleteRoleMutation.isPending}
        />
      )}
      <TableRowAction
        label={'Edit role'}
        icon={<Edit2Icon className='text-primary size-4' aria-hidden='true' />}
        onSelect={() => {
          navigate(`/roles/${row.original.id}/edit`)
        }}
        disabled={isProtected}
      />
      <TableRowAction
        label={'Delete role'}
        icon={
          <Trash2Icon className='text-destructive size-4' aria-hidden='true' />
        }
        onSelect={() => setIsShowDeleteDialog(true)}
        disabled={isProtected}
      />
    </TableRowActions>
  )
}
