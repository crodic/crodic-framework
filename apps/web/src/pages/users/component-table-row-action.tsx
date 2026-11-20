import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  BadgeCheck,
  CheckCircle2,
  Edit2Icon,
  RotateCcw,
  Trash2Icon,
  UserCheck,
  UserX,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { restApiErrorHandler } from '@/lib/rest-api-handler'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { DeleteAlertDialog } from '@/components/common/delete-alert-dialog'
import { RestoreAlertDialog } from '@/components/common/restore-alert-dialog'
import {
  apiDeleteUser,
  apiHandleCosplayerRequest,
  apiRestoreUser,
  apiToggleCosplayerVerify,
  apiToggleVerifyUser,
} from './queries'
import { type UserSchema } from './schema'

export default function ComponentTableRowActions({
  row,
}: {
  row: { original: UserSchema }
}) {
  const { t } = useTranslation()
  const ability = useAuthStore((s) => s.ability)
  const canRestore =
    ability.can('update', 'USER') ||
    (ability as any).can('restore', 'USER') ||
    ability.can('manage', 'all')
  const queryClient = useQueryClient()
  const [isShowDeleteDialog, setIsShowDeleteDialog] = useState(false)
  const [isShowRestoreDialog, setIsShowRestoreDialog] = useState(false)

  const isDeleted = Boolean(row.original.deletedAt)

  const toggleVerifyMutation = useMutation({
    mutationFn: apiToggleVerifyUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success(
        t('users.messages.verifyToggleSuccess', 'Verification status updated')
      )
    },
    onError: restApiErrorHandler,
  })

  const toggleCosplayerVerifyMutation = useMutation({
    mutationFn: apiToggleCosplayerVerify,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success(
        t(
          'users.messages.cosplayerVerifyToggleSuccess',
          'Cosplayer verification status updated'
        )
      )
    },
    onError: restApiErrorHandler,
  })

  const handleCosplayerRequestMutation = useMutation({
    mutationFn: apiHandleCosplayerRequest,
    onSuccess: (_res, vars) => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success(
        vars.approved
          ? t(
              'users.messages.cosplayerRequestApproved',
              'Đã phê duyệt người dùng trở thành Cosplayer'
            )
          : t(
              'users.messages.cosplayerRequestRejected',
              'Đã từ chối yêu cầu trở thành Cosplayer'
            )
      )
    },
    onError: restApiErrorHandler,
  })

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
        <Tooltip>
          <TooltipTrigger asChild>
            {canRestore ? (
              <Button
                variant='ghost'
                size='icon'
                aria-label={t('buttons.restore', 'Restore')}
                onClick={() => setIsShowRestoreDialog(true)}
                disabled={restoreUserMutation.isPending}
              >
                <RotateCcw
                  size={16}
                  aria-hidden='true'
                  className='text-emerald-600 dark:text-emerald-400'
                />
              </Button>
            ) : (
              <span className='inline-block cursor-not-allowed'>
                <Button
                  variant='ghost'
                  size='icon'
                  aria-label={t('buttons.restore', 'Restore')}
                  disabled
                  className='opacity-50'
                >
                  <RotateCcw
                    size={16}
                    aria-hidden='true'
                    className='text-muted-foreground'
                  />
                </Button>
              </span>
            )}
          </TooltipTrigger>
          <TooltipContent side='left'>
            {canRestore
              ? t('buttons.restore', 'Restore')
              : t(
                  'users.errors.noPermissionRestore',
                  'Bạn không có quyền khôi phục người dùng này. Vui lòng liên hệ Quản trị viên cấp cao.'
                )}
          </TooltipContent>
        </Tooltip>
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

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant='ghost'
            size='icon'
            aria-label='Toggle email verification'
            onClick={() => toggleVerifyMutation.mutate(row.original.id)}
            disabled={toggleVerifyMutation.isPending}
          >
            <BadgeCheck
              className={`size-4 ${
                row.original.verifiedAt
                  ? 'fill-emerald-100 text-emerald-500 dark:fill-emerald-950'
                  : 'text-muted-foreground'
              }`}
              aria-hidden='true'
            />
          </Button>
        </TooltipTrigger>
        <TooltipContent side='left'>
          {row.original.verifiedAt
            ? t('users.actions.unverifyEmail', 'Hủy xác minh email')
            : t('users.actions.verifyEmail', 'Xác minh email')}
        </TooltipContent>
      </Tooltip>

      {row.original.cosplayerProfile && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='ghost'
              size='icon'
              aria-label='Toggle Cosplayer verification'
              onClick={() =>
                toggleCosplayerVerifyMutation.mutate(row.original.id)
              }
              disabled={toggleCosplayerVerifyMutation.isPending}
            >
              <CheckCircle2
                className={`size-4 ${
                  row.original.cosplayerProfile.isVerified
                    ? 'fill-blue-100 text-blue-500 dark:fill-blue-950'
                    : 'text-muted-foreground'
                }`}
                aria-hidden='true'
              />
            </Button>
          </TooltipTrigger>
          <TooltipContent side='left'>
            {row.original.cosplayerProfile.isVerified
              ? t(
                  'users.actions.unverifyCosplayer',
                  'Thu hồi tích xanh Cosplayer'
                )
              : t('users.actions.verifyCosplayer', 'Duyệt tích xanh Cosplayer')}
          </TooltipContent>
        </Tooltip>
      )}

      {Boolean(
        row.original.cosplayerRequestPending ||
        (row.original.notifications?.cosplayerRoleRequested &&
          row.original.role !== 'cosplayer')
      ) && (
        <>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='ghost'
                size='icon'
                aria-label='Approve Cosplayer request'
                onClick={() =>
                  handleCosplayerRequestMutation.mutate({
                    id: row.original.id,
                    approved: true,
                  })
                }
                disabled={handleCosplayerRequestMutation.isPending}
              >
                <UserCheck
                  className='size-4 text-emerald-600 dark:text-emerald-400'
                  aria-hidden='true'
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent side='left'>
              {t('users.actions.approveCosplayer', 'Duyệt làm Cosplayer')}
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='ghost'
                size='icon'
                aria-label='Reject Cosplayer request'
                onClick={() =>
                  handleCosplayerRequestMutation.mutate({
                    id: row.original.id,
                    approved: false,
                  })
                }
                disabled={handleCosplayerRequestMutation.isPending}
              >
                <UserX
                  className='size-4 text-amber-600 dark:text-amber-400'
                  aria-hidden='true'
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent side='left'>
              {t('users.actions.rejectCosplayer', 'Từ chối yêu cầu Cosplayer')}
            </TooltipContent>
          </Tooltip>
        </>
      )}

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
