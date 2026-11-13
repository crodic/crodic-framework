import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeftIcon,
  Clock,
  EditIcon,
  Loader2,
  Mail,
  RotateCcw,
  TrashIcon,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { restApiErrorHandler } from '@/lib/rest-api-handler'
import { useBreadcrumb } from '@/hooks/use-breadcrumb'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { DeleteAlertDialog } from '@/components/common/delete-alert-dialog'
import { DescriptionItem, Descriptions } from '@/components/common/descriptions'
import { RestoreAlertDialog } from '@/components/common/restore-alert-dialog'
import DataLoader from '@/components/layout/data-loader'
import { Main } from '@/components/layout/main'
import { PageHeader } from '@/components/layout/page-shell'
import { NotFoundError } from '@/pages/errors/not-found-error'
import {
  apiResendAdminVerification,
  deleteAdmin,
  restoreAdmin,
  useDataGetAdminDetail,
} from '../queries'

export function PageAdminShow() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const params = useParams()
  const id = params.id as string
  const [isShowDeleteDialog, setIsShowDeleteDialog] = useState(false)
  const [isShowRestoreDialog, setIsShowRestoreDialog] = useState(false)
  const userId = useAuthStore((s) => s.id)
  const ability = useAuthStore((s) => s.ability)
  const canRestore =
    ability.can('update', 'ADMIN') ||
    (ability as any).can('restore', 'ADMIN') ||
    ability.can('manage', 'all')

  const { data, isFetching } = useDataGetAdminDetail(id)
  const isDeleted = Boolean(data?.deletedAt)

  const adminName = data?.fullName || data?.email || (id ? `#${id}` : '')

  useBreadcrumb([
    { title: t('navigation.management.admins', 'Admins'), href: '/admins' },
    { title: adminName },
  ])

  const deleteUserMutation = useMutation({
    mutationFn: deleteAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['admins'],
      })
      toast.success('Admin deleted successfully')
      setIsShowDeleteDialog(false)
      navigate('/admins')
    },
    onError: restApiErrorHandler,
  })

  const restoreAdminMutation = useMutation({
    mutationFn: restoreAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['admins'],
      })
      queryClient.invalidateQueries({
        queryKey: ['admin', id],
      })
      toast.success(
        t('adminUsers.messages.restoreSuccess', 'Admin restored successfully')
      )
      setIsShowRestoreDialog(false)
    },
    onError: restApiErrorHandler,
  })

  const handleDelete = () => {
    if (params.id) {
      deleteUserMutation.mutate(id)
    }
  }

  const storageKey = `admin_verify_cooldown_${id}`
  const [cooldown, setCooldown] = useState<number>(0)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = window.sessionStorage.getItem(storageKey)
    if (stored) {
      const expiry = parseInt(stored, 10)
      const remaining = Math.max(0, Math.ceil((expiry - Date.now()) / 1000))
      if (remaining > 0) {
        setCooldown(remaining)
      } else {
        window.sessionStorage.removeItem(storageKey)
      }
    }
  }, [storageKey])

  useEffect(() => {
    if (cooldown <= 0) return

    const timer = window.setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          if (typeof window !== 'undefined') {
            window.sessionStorage.removeItem(storageKey)
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => window.clearInterval(timer)
  }, [cooldown, storageKey])

  const resendMutation = useMutation({
    mutationFn: () => apiResendAdminVerification(id),
    onSuccess: (res) => {
      toast.success(
        res?.message ||
          t(
            'adminUsers.show.resendVerificationSuccess',
            'Verification email has been sent successfully.'
          )
      )
      setCooldown(60)
      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem(
          storageKey,
          String(Date.now() + 60 * 1000)
        )
      }
    },
    onError: restApiErrorHandler,
  })

  const renderResendButtonContent = () => {
    if (resendMutation.isPending) {
      return (
        <>
          <Loader2 className='size-4 animate-spin' aria-hidden='true' />
          {t('adminUsers.show.resending', 'Sending...')}
        </>
      )
    }

    if (cooldown > 0) {
      return (
        <>
          <Clock className='size-4 opacity-70' aria-hidden='true' />
          {t('adminUsers.show.cooldown', 'Resend in {{seconds}}s', {
            seconds: cooldown,
          })}
        </>
      )
    }

    return (
      <>
        <Mail className='size-4' aria-hidden='true' />
        {t('adminUsers.show.resendVerification', 'Resend verification email')}
      </>
    )
  }

  if (isFetching) return <DataLoader />

  if (!data) {
    return <NotFoundError />
  }

  return (
    <>
      {isShowDeleteDialog && (
        <DeleteAlertDialog
          open={isShowDeleteDialog}
          onOpenChange={(open) => setIsShowDeleteDialog(open)}
          handleDelete={handleDelete}
          isLoading={deleteUserMutation.isPending}
        />
      )}

      {isShowRestoreDialog && (
        <RestoreAlertDialog
          open={isShowRestoreDialog}
          onOpenChange={(open) => setIsShowRestoreDialog(open)}
          handleRestore={() => restoreAdminMutation.mutate(id)}
          isLoading={restoreAdminMutation.isPending}
        />
      )}

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <PageHeader
          title={data?.fullName || t('adminUsers.show.title')}
          description={t('adminUsers.show.description')}
          actions={
            <div className='flex flex-wrap items-center gap-2'>
              <Button
                variant='outline'
                type='button'
                onClick={() => {
                  void navigate(-1)
                }}
              >
                <ArrowLeftIcon className='size-4' aria-hidden='true' />
                {t('buttons.cancel')}
              </Button>
              {isDeleted ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    {canRestore ? (
                      <Button
                        variant='outline-success'
                        type='button'
                        onClick={() => setIsShowRestoreDialog(true)}
                        disabled={restoreAdminMutation.isPending}
                      >
                        {restoreAdminMutation.isPending ? (
                          <Loader2
                            className='size-4 animate-spin'
                            aria-hidden='true'
                          />
                        ) : (
                          <RotateCcw className='size-4' aria-hidden='true' />
                        )}
                        {t('buttons.restore', 'Restore')}
                      </Button>
                    ) : (
                      <span className='inline-block cursor-not-allowed'>
                        <Button
                          variant='outline'
                          type='button'
                          disabled
                          className='text-muted-foreground border-emerald-500/30 opacity-50'
                        >
                          <RotateCcw className='size-4' aria-hidden='true' />
                          {t('buttons.restore', 'Restore')}
                        </Button>
                      </span>
                    )}
                  </TooltipTrigger>
                  <TooltipContent>
                    {canRestore
                      ? t('buttons.restore', 'Restore')
                      : t(
                          'adminUsers.errors.noPermissionRestore',
                          'Bạn không có quyền khôi phục quản trị viên này. Vui lòng liên hệ Quản trị viên cấp cao.'
                        )}
                  </TooltipContent>
                </Tooltip>
              ) : (
                <>
                  {!data?.verifiedAt && (
                    <Button
                      variant='outline-warning'
                      type='button'
                      onClick={() => resendMutation.mutate()}
                      disabled={resendMutation.isPending || cooldown > 0}
                    >
                      {renderResendButtonContent()}
                    </Button>
                  )}
                  <Button
                    onClick={() => navigate(`/admins/${data?.id}/edit`)}
                    disabled={id === userId}
                  >
                    <EditIcon className='size-4' aria-hidden='true' />
                    {t('buttons.edit')}
                  </Button>
                  <Button
                    variant='destructive'
                    onClick={() => setIsShowDeleteDialog(true)}
                    disabled={id === userId}
                  >
                    <TrashIcon className='size-4' aria-hidden='true' />
                    {t('buttons.delete')}
                  </Button>
                </>
              )}
            </div>
          }
        />

        {isDeleted && (
          <div className='border-destructive/40 bg-destructive/10 text-destructive dark:bg-destructive/15 flex items-center gap-2.5 rounded-lg border p-4 text-sm'>
            <RotateCcw className='size-4 shrink-0' aria-hidden='true' />
            <span>
              {t(
                'adminUsers.show.accountDeletedNotice',
                'Tài khoản này đang ở trạng thái đã xóa ({{date}}). Khôi phục để kích hoạt lại tài khoản.',
                {
                  date: data.deletedAt
                    ? format(new Date(data.deletedAt), 'dd/MM/yyyy HH:mm')
                    : '',
                }
              )}
            </span>
          </div>
        )}

        <div className='grid grid-cols-1 gap-8 md:grid-cols-[250px_1fr]'>
          <Card className='h-max'>
            <CardContent>
              <div className='flex flex-col items-center gap-4'>
                <Avatar className='inline-block size-24'>
                  <AvatarFallback>CN</AvatarFallback>
                  <AvatarImage
                    src={data?.avatar || ''}
                    alt={data?.fullName || ''}
                    className='rounded-full'
                  />
                </Avatar>
                <h3 className='text-lg font-bold'>{data?.fullName || ''}</h3>
                <p className='text-muted-foreground text-center text-sm'>
                  {data?.bio || '—'}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>{t('adminUsers.show.cardTitle')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Descriptions>
                <DescriptionItem label='Email' value={data?.email} />
                <DescriptionItem
                  label={t('adminUsers.show.fullName')}
                  value={data?.fullName}
                />
                <DescriptionItem
                  label={t('adminUsers.show.phoneNumber')}
                  value={data?.phone}
                />
                <DescriptionItem
                  label={t('adminUsers.show.birthday')}
                  value={
                    data.birthday
                      ? format(data.birthday, 'dd/MM/yyyy')
                      : undefined
                  }
                />
                <DescriptionItem label={t('common.status', 'Status')}>
                  <div className='mt-2 flex flex-wrap gap-1'>
                    {isDeleted ? (
                      <Badge variant='destructive' className='text-xs'>
                        {t('common.status.deleted', 'Deleted')}
                      </Badge>
                    ) : (
                      <Badge variant='outline-success' className='text-xs'>
                        {t('common.status.active', 'Active')}
                      </Badge>
                    )}
                  </div>
                </DescriptionItem>
                <DescriptionItem label={t('adminUsers.show.emailVerified')}>
                  <div className='mt-2 flex flex-wrap gap-1'>
                    <Badge variant='secondary'>
                      {data?.verifiedAt
                        ? t('adminUsers.show.verified', 'Verified')
                        : t('adminUsers.show.unverified', 'Unverified')}
                    </Badge>
                  </div>
                </DescriptionItem>
                <DescriptionItem label={t('adminUsers.show.role')}>
                  <div className='mt-2 flex flex-wrap gap-1'>
                    {data.roles.map((role) => (
                      <Badge key={role.id} variant='secondary'>
                        {role.name}
                      </Badge>
                    ))}
                  </div>
                </DescriptionItem>
                <DescriptionItem
                  label={t('adminUsers.show.createdAt')}
                  value={format(data.createdAt, 'dd/MM/yyyy HH:mm aa')}
                />
                <DescriptionItem
                  label={t('adminUsers.show.updatedAt')}
                  value={format(data.updatedAt, 'dd/MM/yyyy HH:mm aa')}
                />
              </Descriptions>
            </CardContent>
          </Card>
        </div>
      </Main>
    </>
  )
}
