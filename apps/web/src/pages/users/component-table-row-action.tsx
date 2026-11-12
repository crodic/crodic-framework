import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Edit2Icon, RotateCcw, Trash2Icon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { toast } from 'sonner'
import { restApiErrorHandler } from '@/lib/rest-api-handler'
import { Button } from '@/components/ui/button'
import { DeleteAlertDialog } from '@/components/common/delete-alert-dialog'
import { RestoreAlertDialog } from '@/components/common/restore-alert-dialog'
import { apiDeleteUser, apiRestoreUser } from './queries'
import { type UserSchema } from './schema'

export default function ComponentTableRowActions({
  row,
}: {
  row: { original: UserSchema }
}) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [isShowDeleteDialog, setIsShowDeleteDialog] = useState(false)
  const [isShowRestoreDialog, setIsShowRestoreDialog] = useState(false)

  const isDeleted = Boolean(row.original.deletedAt)

  const deleteUserMutation = useMutation({
    mutationFn: apiDeleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['users'],
      })
      toast.success(
        t('users.messages.deleteSuccess', 'User deleted successfully')
      )
      setIsShowDeleteDialog(false)
    },
    onError: restApiErrorHandler,
  })

  const restoreUserMutation = useMutation({
    mutationFn: apiRestoreUser,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['users'],
      })
      toast.success(
        t('users.messages.restoreSuccess', 'User restored successfully')
      )
      setIsShowRestoreDialog(false)
    },
    onError: restApiErrorHandler,
  })

  const handleDelete = (id: string) => {
    deleteUserMutation.mutate(id)
  }

  const handleRestore = (id: string) => {
    restoreUserMutation.mutate(id)
  }

  if (isDeleted) {
    return (
      <div className='flex items-center gap-1'>
        {isShowRestoreDialog && (
          <RestoreAlertDialog
            open={isShowRestoreDialog}
            onOpenChange={(open) => setIsShowRestoreDialog(open)}
            handleRestore={() => handleRestore(row.original.id)}
            isLoading={restoreUserMutation.isPending}
          />
        )}
        <Button
          variant='ghost'
          size='icon'
          aria-label='Restore user'
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
        <Link to={`/users/${row.original.id}/edit`} aria-label='Edit user'>
          <Edit2Icon className='text-primary size-4' aria-hidden='true' />
        </Link>
      </Button>
      <Button
        variant='ghost'
        size='icon'
        aria-label='Delete user'
        onClick={() => setIsShowDeleteDialog(true)}
      >
        <Trash2Icon className='text-destructive size-4' aria-hidden='true' />
      </Button>
    </div>
  )
}
