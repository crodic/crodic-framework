import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Edit2Icon, RotateCcw, Trash2Icon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { restApiErrorHandler } from '@/lib/rest-api-handler'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { DeleteAlertDialog } from '@/components/common/delete-alert-dialog'
import { RestoreAlertDialog } from '@/components/common/restore-alert-dialog'
import { deleteAdmin, restoreAdmin } from './queries'
import { type AdminSchema } from './schema'

export default function ComponentTableRowActions({
  row,
}: {
  row: { original: AdminSchema }
}) {
  const { t } = useTranslation()
  const id = useAuthStore((s) => s.id)
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
      <div className='flex items-center gap-1'>
        {isShowRestoreDialog && (
          <RestoreAlertDialog
            open={isShowRestoreDialog}
            onOpenChange={(open) => setIsShowRestoreDialog(open)}
            handleRestore={() => handleRestore(row.original.id)}
            isLoading={restoreAdminMutation.isPending}
          />
        )}
        <Button
          variant='ghost'
          size='icon'
          aria-label='Restore admin'
          onClick={() => setIsShowRestoreDialog(true)}
          title={t('buttons.restore', 'Restore')}
        >
          <RotateCcw
            size={16}
            aria-hidden='true'
            className='text-emerald-600 dark:text-emerald-400'
          />
        </Button>
      </div>
    )
  }

  return (
    <div className='flex items-center gap-1'>
      {isShowDeleteDialog && (
        <DeleteAlertDialog
          open={isShowDeleteDialog}
          onOpenChange={(open) => setIsShowDeleteDialog(open)}
          handleDelete={() => handleDelete(row.original.id)}
          isLoading={deleteUserMutation.isPending}
        />
      )}
      <Button variant='ghost' size='icon' asChild>
        <Link
          to={`/admins/${row.original.id}/edit`}
          aria-label='Edit admin'
          className={cn({ 'pointer-events-none': row.original.id === id })}
        >
          <Edit2Icon
            size={16}
            aria-hidden='true'
            className={
              row.original.id === id ? 'text-primary/50' : 'text-primary'
            }
          />
        </Link>
      </Button>
      <Button
        variant='ghost'
        size='icon'
        aria-label='Delete admin'
        disabled={row.original.id === id}
        onClick={() => setIsShowDeleteDialog(true)}
      >
        <Trash2Icon size={16} aria-hidden='true' className='text-destructive' />
      </Button>
    </div>
  )
}
