import { useState } from 'react'
import { format } from 'date-fns'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeftIcon,
  EditIcon,
  Loader2,
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
  apiDeleteUser,
  apiHandleCosplayerRequest,
  apiHardDeleteUser,
  apiRestoreUser,
  useDataGetUserDetail,
} from '../queries'

export function PageUserShow() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const params = useParams()
  const id = params.id as string
  const ability = useAuthStore((s) => s.ability)
  const canRestore =
    ability.can('update', 'USER') ||
    (ability as any).can('restore', 'USER') ||
    ability.can('manage', 'all')
  const { data, isFetching } = useDataGetUserDetail(id)
  const isDeleted = Boolean(data?.deletedAt)
  const isPendingRequest =
    Boolean(data?.cosplayerRequestPending) ||
    (Boolean(data?.notifications?.cosplayerRoleRequested) &&
      data?.role !== 'cosplayer')
  const [isShowDeleteDialog, setIsShowDeleteDialog] = useState(false)
  const [isShowHardDeleteDialog, setIsShowHardDeleteDialog] = useState(false)
  const [isShowRestoreDialog, setIsShowRestoreDialog] = useState(false)

  const userName = data?.fullName || data?.email || (id ? `#${id}` : '')

  useBreadcrumb([
    { title: t('navigation.management.users', 'Users'), href: '/users' },
    { title: userName },
  ])

  const handleCosplayerRequestMutation = useMutation({
    mutationFn: apiHandleCosplayerRequest,
    onSuccess: async (_res, vars) => {
      await queryClient.invalidateQueries({ queryKey: ['users'] })
      await queryClient.invalidateQueries({ queryKey: ['user', id] })
      toast.success(
        vars.approved
          ? 'Đã phê duyệt người dùng trở thành Cosplayer'
          : 'Đã từ chối yêu cầu trở thành Cosplayer'
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
        t(
          'users.messages.softDeleteSuccess',
          'Đã đưa người dùng vào thùng rác thành công (có thể khôi phục trong 30 ngày)'
        )
      )
      setIsShowDeleteDialog(false)
      navigate('/users')
    },
    onError: restApiErrorHandler,
  })

  const hardDeleteUserMutation = useMutation({
    mutationFn: apiHardDeleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['users'],
      })
      toast.success(
        t(
          'users.messages.hardDeleteSuccess',
          'Đã xóa vĩnh viễn người dùng và toàn bộ dữ liệu liên quan khỏi hệ thống'
        )
      )
      setIsShowHardDeleteDialog(false)
      navigate('/users')
    },
    onError: restApiErrorHandler,
  })

  const restoreUserMutation = useMutation({
    mutationFn: apiRestoreUser,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['users'],
      })
      queryClient.invalidateQueries({
        queryKey: ['user', id],
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
          title={t(
            'users.deleteDialog.softTitle',
            'Đưa người dùng vào thùng rác?'
          )}
          description={t(
            'users.deleteDialog.softDesc',
            'Tài khoản người dùng sẽ bị vô hiệu hóa và chuyển vào thùng rác. Toàn bộ bài viết, bộ ảnh và hồ sơ Cosplayer sẽ tạm ẩn. Hệ thống sẽ tự động xóa vĩnh viễn sau 30 ngày nếu không được khôi phục.'
          )}
          confirmText={t('users.deleteDialog.softConfirm', 'Đưa vào thùng rác')}
        />
      )}

      {isShowHardDeleteDialog && (
        <DeleteAlertDialog
          open={isShowHardDeleteDialog}
          onOpenChange={(open) => setIsShowHardDeleteDialog(open)}
          handleDelete={() => hardDeleteUserMutation.mutate(id)}
          isLoading={hardDeleteUserMutation.isPending}
          title={t('users.deleteDialog.hardTitle', 'Xóa vĩnh viễn người dùng?')}
          description={t(
            'users.deleteDialog.hardDesc',
            'CẢNH BÁO NGUY HIỂM: Hành động này KHÔNG THỂ HOÀN TÁC! Toàn bộ tài khoản, hồ sơ Cosplayer, bài viết, bình luận, bộ sưu tập và toàn bộ dữ liệu của người dùng này sẽ bị xóa sạch hoàn toàn khỏi máy chủ ngay lập tức.'
          )}
          confirmText={t('users.deleteDialog.hardConfirm', 'Xóa vĩnh viễn')}
        />
      )}

      {isShowRestoreDialog && (
        <RestoreAlertDialog
          open={isShowRestoreDialog}
          onOpenChange={(open) => setIsShowRestoreDialog(open)}
          handleRestore={() => restoreUserMutation.mutate(id)}
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
                <div className='flex items-center gap-2'>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      {canRestore ? (
                        <Button
                          variant='outline-success'
                          type='button'
                          onClick={() => setIsShowRestoreDialog(true)}
                          disabled={restoreUserMutation.isPending}
                        >
                          {restoreUserMutation.isPending ? (
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
                            'users.errors.noPermissionRestore',
                            'Bạn không có quyền khôi phục người dùng này. Vui lòng liên hệ Quản trị viên cấp cao.'
                          )}
                    </TooltipContent>
                  </Tooltip>

                  <Button
                    variant='destructive'
                    type='button'
                    onClick={() => setIsShowHardDeleteDialog(true)}
                    disabled={hardDeleteUserMutation.isPending}
                  >
                    <TrashIcon className='size-4' aria-hidden='true' />
                    {t('users.actions.hardDelete', 'Xóa vĩnh viễn')}
                  </Button>
                </div>
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

        {isDeleted && (
          <div className='border-destructive/40 bg-destructive/10 text-destructive dark:bg-destructive/15 flex items-center gap-2.5 rounded-lg border p-4 text-sm'>
            <RotateCcw className='size-4 shrink-0' aria-hidden='true' />
            <span>
              {t(
                'users.show.accountDeletedNotice',
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

        {isPendingRequest && (
          <div className='flex flex-col justify-between gap-3 rounded-lg border border-amber-500/40 bg-amber-500/10 p-4 sm:flex-row sm:items-center'>
            <div>
              <p className='text-sm font-semibold text-amber-700 dark:text-amber-300'>
                Người dùng này đã gửi yêu cầu nâng cấp vai trò Cosplayer
              </p>
              <p className='text-muted-foreground text-xs'>
                Xem xét thông tin hồ sơ và phê duyệt hoặc từ chối yêu cầu.
              </p>
            </div>
            <div className='flex items-center gap-2'>
              <Button
                variant='outline'
                size='sm'
                disabled={handleCosplayerRequestMutation.isPending}
                onClick={() =>
                  handleCosplayerRequestMutation.mutate({
                    id,
                    approved: false,
                  })
                }
              >
                Từ chối
              </Button>
              <Button
                size='sm'
                disabled={handleCosplayerRequestMutation.isPending}
                onClick={() =>
                  handleCosplayerRequestMutation.mutate({
                    id,
                    approved: true,
                  })
                }
              >
                Phê duyệt Cosplayer
              </Button>
            </div>
          </div>
        )}

        <div className='grid gap-8 md:grid-cols-[250px_1fr]'>
          <Card className='h-max'>
            <CardContent>
              <div className='flex flex-col items-center gap-4'>
                <Avatar className='inline-block size-24'>
                  <AvatarFallback>
                    {data?.fullName?.slice(0, 2)?.toUpperCase() || 'US'}
                  </AvatarFallback>
                  <AvatarImage
                    src={data?.avatar ?? undefined}
                    alt={data?.fullName}
                  />
                </Avatar>
                <h3 className='text-lg font-bold'>{data?.fullName}</h3>
              </div>
            </CardContent>
          </Card>

          <div className='flex flex-col gap-6'>
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
                  <DescriptionItem
                    label={t('users.show.username', 'Username')}
                    value={data?.username ? `@${data.username}` : '—'}
                  />
                  <DescriptionItem label={t('users.show.role', 'Vai trò')}>
                    <div className='mt-1'>
                      <Badge variant='outline' className='text-xs uppercase'>
                        {data?.role || 'fan'}
                      </Badge>
                    </div>
                  </DescriptionItem>
                  <DescriptionItem label={t('users.show.status', 'Trạng thái')}>
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
                  <DescriptionItem
                    label={t(
                      'users.show.emailVerifiedStatus',
                      'Xác minh Email'
                    )}
                    value={
                      data?.verifiedAt
                        ? t('users.show.emailVerified', 'Đã xác minh Email')
                        : t('users.show.emailUnverified', 'Chưa xác minh Email')
                    }
                  />
                  <DescriptionItem
                    label={t('users.show.createdAt')}
                    value={format(new Date(data.createdAt), 'dd/MM/yyyy HH:mm')}
                  />
                  <DescriptionItem
                    label={t('users.show.updatedAt')}
                    value={format(new Date(data.updatedAt), 'dd/MM/yyyy HH:mm')}
                  />
                </Descriptions>
              </CardContent>
            </Card>

            {(data?.role === 'cosplayer' || Boolean(data?.cosplayerProfile)) &&
              data?.cosplayerProfile && (
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {t('users.show.cosplayerProfileTitle', 'Hồ sơ Cosplayer')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Descriptions>
                      <DescriptionItem
                        label={t(
                          'users.show.cosplayerDisplayName',
                          'Tên hiển thị'
                        )}
                        value={data.cosplayerProfile.displayName}
                      />
                      <DescriptionItem
                        label={t('users.show.cosplayerBadge', 'Huy hiệu')}
                        value={data.cosplayerProfile.roleBadge || 'Cosplayer'}
                      />
                      <DescriptionItem
                        label={t(
                          'users.show.cosplayerSlug',
                          'Đường dẫn (Slug)'
                        )}
                        value={`/${data.cosplayerProfile.slug}`}
                      />
                      <DescriptionItem
                        label='Tagline'
                        value={data.cosplayerProfile.tagline || '—'}
                      />
                      <DescriptionItem
                        label='Địa điểm / Khu vực'
                        value={
                          [
                            data.cosplayerProfile.locationLabel,
                            data.cosplayerProfile.workArea,
                          ]
                            .filter(Boolean)
                            .join(' • ') || '—'
                        }
                      />
                      <DescriptionItem
                        label='Chỉ số cơ thể'
                        value={
                          [
                            data.cosplayerProfile.heightCm
                              ? `${data.cosplayerProfile.heightCm} cm`
                              : null,
                            data.cosplayerProfile.experienceYearsNum
                              ? `${data.cosplayerProfile.experienceYearsNum}+ năm kinh nghiệm`
                              : null,
                          ]
                            .filter(Boolean)
                            .join(' • ') || '—'
                        }
                      />
                      <DescriptionItem
                        label='Kỹ năng'
                        value={
                          data.cosplayerProfile.skills?.length
                            ? data.cosplayerProfile.skills.join(', ')
                            : '—'
                        }
                      />
                      <DescriptionItem
                        label='Sở trường'
                        value={
                          data.cosplayerProfile.specialties?.length
                            ? data.cosplayerProfile.specialties.join(', ')
                            : '—'
                        }
                      />
                      <DescriptionItem
                        label='Giải thưởng'
                        value={
                          data.cosplayerProfile.awardsBadges?.length
                            ? data.cosplayerProfile.awardsBadges.join(', ')
                            : '—'
                        }
                      />
                      <DescriptionItem
                        label='Liên hệ'
                        value={
                          [
                            data.cosplayerProfile.contactEmail,
                            data.cosplayerProfile.contactPhone,
                          ]
                            .filter(Boolean)
                            .join(' • ') || '—'
                        }
                      />
                      <DescriptionItem
                        label='Mạng xã hội'
                        value={
                          [
                            data.cosplayerProfile.facebookUrl
                              ? `FB: ${data.cosplayerProfile.facebookUrl}`
                              : null,
                            data.cosplayerProfile.instagramUrl
                              ? `IG: ${data.cosplayerProfile.instagramUrl}`
                              : null,
                            data.cosplayerProfile.tiktokUrl
                              ? `TikTok: ${data.cosplayerProfile.tiktokUrl}`
                              : null,
                            data.cosplayerProfile.twitterUrl
                              ? `X: ${data.cosplayerProfile.twitterUrl}`
                              : null,
                          ]
                            .filter(Boolean)
                            .join(' | ') || '—'
                        }
                      />
                      <DescriptionItem
                        label='Giới thiệu ngắn'
                        value={data.cosplayerProfile.bio || '—'}
                      />
                      <DescriptionItem
                        label='Tiểu sử nghệ thuật'
                        value={data.cosplayerProfile.artisticBio || '—'}
                      />
                      <DescriptionItem
                        label={t('users.show.rankingScore', 'Điểm xếp hạng')}
                        value={`${data.cosplayerProfile.rankingScore ?? 0} pts`}
                      />
                      <DescriptionItem
                        label={t(
                          'users.show.cosplayerVerified',
                          'Tích xanh Cosplayer'
                        )}
                        value={
                          data.cosplayerProfile.isVerified
                            ? t(
                                'users.show.cosplayerVerifiedTrue',
                                'Đã duyệt tích xanh (Verified)'
                              )
                            : t(
                                'users.show.cosplayerVerifiedFalse',
                                'Chưa duyệt tích xanh'
                              )
                        }
                      />
                    </Descriptions>
                  </CardContent>
                </Card>
              )}
          </div>
        </div>
      </Main>
    </>
  )
}
