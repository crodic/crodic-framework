import { useState } from 'react'
import { format } from 'date-fns'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeftIcon, EditIcon, RotateCcw, TrashIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'
import { restApiErrorHandler } from '@/lib/rest-api-handler'
import { useBreadcrumb } from '@/hooks/use-breadcrumb'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DeleteAlertDialog } from '@/components/common/delete-alert-dialog'
import { DescriptionItem, Descriptions } from '@/components/common/descriptions'
import { RestoreAlertDialog } from '@/components/common/restore-alert-dialog'
import DataLoader from '@/components/layout/data-loader'
import { Main } from '@/components/layout/main'
import { PageHeader } from '@/components/layout/page-shell'
import { NotFoundError } from '@/pages/errors/not-found-error'
import { apiDeleteUser, apiRestoreUser, useDataGetUserDetail } from '../queries'

export function PageUserShow() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const params = useParams()
  const id = params.id as string
  const { data, isFetching } = useDataGetUserDetail(id)
  const [isShowDeleteDialog, setIsShowDeleteDialog] = useState(false)
  const [isShowRestoreDialog, setIsShowRestoreDialog] = useState(false)

  const isDeleted = Boolean(data?.deletedAt)
  const userName = data?.fullName || data?.email || (id ? `#${id}` : '')

  useBreadcrumb([
    { title: t('navigation.management.users', 'Users'), href: '/users' },
    { title: userName },
  ])
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
      navigate('/users')
    },
    onError: restApiErrorHandler,
  })

  const restoreUserMutation = useMutation({
    mutationFn: () => apiRestoreUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['user', id],
      })
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

  const handleDelete = () => {
    if (params.id) {
      deleteUserMutation.mutate(id)
    }
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
          handleRestore={() => restoreUserMutation.mutate()}
          isLoading={restoreUserMutation.isPending}
        />
      )}

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <PageHeader
          title={data?.fullName || t('users.show.title')}
          description={t('users.show.description')}
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
                <Button
                  type='button'
                  onClick={() => setIsShowRestoreDialog(true)}
                  className='bg-emerald-600 text-white hover:bg-emerald-700'
                >
                  <RotateCcw className='size-4' aria-hidden='true' />
                  {t('buttons.restore', 'Restore')}
                </Button>
              ) : (
                <>
                  <Button onClick={() => navigate(`/users/${data?.id}/edit`)}>
                    <EditIcon className='size-4' aria-hidden='true' />
                    {t('buttons.edit')}
                  </Button>
                  <Button
                    variant='destructive'
                    onClick={() => setIsShowDeleteDialog(true)}
                  >
                    <TrashIcon className='size-4' aria-hidden='true' />
                    {t('buttons.delete')}
                  </Button>
                </>
              )}
            </div>
          }
        />

        <div className='grid gap-8 md:grid-cols-[250px_1fr]'>
          <Card className='h-max'>
            <CardContent>
              <div className='flex flex-col items-center gap-4'>
                <Avatar className='inline-block size-24'>
                  <AvatarFallback>CN</AvatarFallback>
                  <AvatarImage
                    src={data?.avatar ?? undefined}
                    alt={data?.fullName}
                  />
                </Avatar>
                <h3 className='text-lg font-bold'>{data?.fullName}</h3>
                {isDeleted ? (
                  <Badge variant='destructive' className='text-xs'>
                    {t('common.status.deleted', 'Deleted')}
                  </Badge>
                ) : (
                  <Badge
                    variant='outline'
                    className='border-emerald-300 text-xs text-emerald-600 dark:border-emerald-800 dark:text-emerald-400'
                  >
                    {t('common.status.active', 'Active')}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('users.show.cardTitle')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Descriptions>
                <DescriptionItem
                  label={t('users.show.email')}
                  value={data?.email}
                />
                <DescriptionItem
                  label={t('users.show.fullName')}
                  value={data?.fullName}
                />
                <DescriptionItem label={t('common.status', 'Status')}>
                  <div className='mt-2 flex flex-wrap gap-1'>
                    {isDeleted ? (
                      <Badge variant='destructive'>
                        {t('common.status.deleted', 'Deleted')}
                      </Badge>
                    ) : (
                      <Badge
                        variant='outline'
                        className='border-emerald-300 text-emerald-600 dark:border-emerald-800 dark:text-emerald-400'
                      >
                        {t('common.status.active', 'Active')}
                      </Badge>
                    )}
                  </div>
                </DescriptionItem>
                {isDeleted && data?.deletedAt && (
                  <DescriptionItem
                    label={t('common.deletedAt', 'Deleted at')}
                    value={format(
                      new Date(data.deletedAt),
                      'dd/MM/yyyy HH:mm aa'
                    )}
                  />
                )}
                <DescriptionItem
                  label={t('users.show.emailVerified')}
                  value={data?.verifiedAt ? 'Active' : 'Inactive'}
                />
                <DescriptionItem
                  label={t('users.show.createdAt')}
                  value={format(data.createdAt, 'dd/MM/yyyy HH:mm aa')}
                />
                <DescriptionItem
                  label={t('users.show.updatedAt')}
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
