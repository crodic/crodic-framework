import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeftIcon,
  Clock,
  EditIcon,
  Loader2,
  Mail,
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
import { DeleteAlertDialog } from '@/components/common/delete-alert-dialog'
import { DescriptionItem, Descriptions } from '@/components/common/descriptions'
import DataLoader from '@/components/layout/data-loader'
import { Main } from '@/components/layout/main'
import { PageHeader } from '@/components/layout/page-shell'
import { NotFoundError } from '@/pages/errors/not-found-error'
import {
  apiResendAdminVerification,
  deleteAdmin,
  useDataGetAdminDetail,
} from '../queries'

export function PageAdminShow() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const params = useParams()
  const id = params.id as string
  const [isShowDeleteDialog, setIsShowDeleteDialog] = useState(false)
  const userId = useAuthStore((s) => s.id)

  const { data, isFetching } = useDataGetAdminDetail(id)

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
              {!data?.verifiedAt && (
                <Button
                  variant='outline'
                  type='button'
                  onClick={() => resendMutation.mutate()}
                  disabled={resendMutation.isPending || cooldown > 0}
                  className='border-amber-500/50 text-amber-600 hover:bg-amber-500/10 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300'
                >
                  {resendMutation.isPending ? (
                    <Loader2
                      className='size-4 animate-spin'
                      aria-hidden='true'
                    />
                  ) : cooldown > 0 ? (
                    <Clock className='size-4 opacity-70' aria-hidden='true' />
                  ) : (
                    <Mail className='size-4' aria-hidden='true' />
                  )}
                  {resendMutation.isPending
                    ? t('adminUsers.show.resending', 'Sending...')
                    : cooldown > 0
                      ? t(
                          'adminUsers.show.cooldown',
                          'Resend in {{seconds}}s',
                          { seconds: cooldown }
                        )
                      : t(
                          'adminUsers.show.resendVerification',
                          'Resend verification email'
                        )}
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
            </div>
          }
        />

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
