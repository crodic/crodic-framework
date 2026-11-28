import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Edit2Icon, RotateCcw, Trash2Icon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { restApiErrorHandler } from '@/lib/rest-api-handler'
import { DeleteAlertDialog } from '@/components/common/delete-alert-dialog'
import { HardDeleteAccountButton } from '@/components/common/hard-delete-account-button'
import { RestoreAlertDialog } from '@/components/common/restore-alert-dialog'
import {
  TableRowAction,
  TableRowActions,
} from '@/components/data-table/table-row-actions'
import { deleteAdmin, restoreAdmin } from './queries'
import { type AdminSchema } from './schema'

export default function ComponentTableRowActions({
  row,
}: {
  row: { original: AdminSchema }
}) {
  const { t } = useTranslation()
  const id = useAuthStore((s) => s.id)
  const ability = useAuthStore((s) => s.ability)
  const canRestore =
    ability.can('update', 'ADMIN') ||
    (ability as any).can('restore', 'ADMIN') ||
    ability.can('manage', 'all')
  const queryClient = useQueryClient()
  const [isShowDeleteDialog, setIsShowDeleteDialog] = useState(false)
  const [isShowRestoreDialog, setIsShowRestoreDialog] = useState(false)

  const isDeleted = Boolean(row.original.deletedAt)

  const deleteUserMutation = useMutation({
    mutationFn: deleteAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['admins'],
      })
      toast.success(
        t('adminUsers.messages.deleteSuccess', 'Admin deleted successfully')
      )
      setIsShowDeleteDialog(false)
    },
    onError: restApiErrorHandler,
  })

  const restoreAdminMutation = useMutation({
    mutationFn: restoreAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['admins'],
      })
      toast.success(
        t('adminUsers.messages.restoreSuccess', 'Admin restored successfully')
      )
      setIsShowRestoreDialog(false)
    },
    onError: restApiErrorHandler,
  })

  const handleDelete = (adminId: string) => {
    deleteUserMutation.mutate(adminId)
  }

  const handleRestore = (adminId: string) => {
    restoreAdminMutation.mutate(adminId)
  }

  if (isDeleted) {
    return (
      <TableRowActions>
        {isShowRestoreDialog && (
          <RestoreAlertDialog
            open={isShowRestoreDialog}
            onOpenChange={(open) => setIsShowRestoreDialog(open)}
            handleRestore={() => handleRestore(row.original.id)}
            isLoading={restoreAdminMutation.isPending}
          />
        )}
        {canRestore ? (
          <TableRowAction
            label={
              <>
                {canRestore
                  ? t('buttons.restore', 'Restore')
                  : t(
                      'adminUsers.errors.noPermissionRestore',
                      'Bạn không có quyền khôi phục quản trị viên này. Vui lòng liên hệ Quản trị viên cấp cao.'
                    )}
              </>
            }
            icon={
              <RotateCcw
                size={16}
                aria-hidden='true'
                className='text-primary dark:text-primary'
              />
            }
            onSelect={() => setIsShowRestoreDialog(true)}
            disabled={restoreAdminMutation.isPending}
          />
        ) : (
          <TableRowAction
            label={
              <>
                {canRestore
                  ? t('buttons.restore', 'Restore')
                  : t(
                      'adminUsers.errors.noPermissionRestore',
                      'Bạn không có quyền khôi phục quản trị viên này. Vui lòng liên hệ Quản trị viên cấp cao.'
                    )}
              </>
            }
            icon={
              <RotateCcw
                size={16}
                aria-hidden='true'
                className='text-muted-foreground'
              />
            }
            disabled={true}
          />
        )}
        <HardDeleteAccountButton
          id={row.original.id}
          subject='ADMIN'
          iconOnly
        />
      </TableRowActions>
    )
  }

  return (
    <TableRowActions>
      {isShowDeleteDialog && (
        <DeleteAlertDialog
          open={isShowDeleteDialog}
          onOpenChange={(open) => setIsShowDeleteDialog(open)}
          handleDelete={() => handleDelete(row.original.id)}
          isLoading={deleteUserMutation.isPending}
        />
      )}
      <TableRowAction
        label={t('adminUsers.actions.edit', 'Edit admin')}
        icon={
          <Edit2Icon
            size={16}
            aria-hidden='true'
            className={
              row.original.id === id ? 'text-primary/50' : 'text-primary'
            }
          />
        }
        to={`/admins/${row.original.id}/edit`}
        disabled={row.original.id === id}
      />
      <TableRowAction
        label={t('adminUsers.actions.delete', 'Delete admin')}
        icon={
          <Trash2Icon
            size={16}
            aria-hidden='true'
            className='text-destructive'
          />
        }
        onSelect={() => setIsShowDeleteDialog(true)}
        disabled={row.original.id === id}
      />
    </TableRowActions>
  )
}
