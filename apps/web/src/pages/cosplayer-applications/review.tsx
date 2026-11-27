import { useEffect, useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  BadgeCheck,
  CheckCircle,
  ExternalLink,
  Loader2,
  Mail,
  User,
  XCircle,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { PageHeader } from '@/components/layout/page-shell'
import { apiReviewCosplayerApplication } from './queries'
import type { CosplayerApplicationSchema } from './schema'

const reviewCosplayerFormSchema = z.object({
  rejectionReason: z.string().trim().optional(),
  adminNotes: z.string().trim().optional(),
})

type ReviewCosplayerFormValues = z.infer<typeof reviewCosplayerFormSchema>

interface ApplicationReviewProps {
  application: CosplayerApplicationSchema | null
  onClose: () => void
}

export function ApplicationReview({
  application,
  onClose,
}: ApplicationReviewProps) {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  const [showRejectForm, setShowRejectForm] = useState(false)

  const form = useForm<ReviewCosplayerFormValues>({
    resolver: zodResolver(reviewCosplayerFormSchema),
    defaultValues: {
      rejectionReason: '',
      adminNotes: '',
    },
  })

  useEffect(() => {
    if (application) {
      form.reset({
        rejectionReason: application.rejectionReason || '',
        adminNotes: application.adminNotes || '',
      })
      setShowRejectForm(false)
    }
  }, [application, form])

  const reviewMutation = useMutation({
    mutationFn: apiReviewCosplayerApplication,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['admin-cosplayer-applications'],
      })
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success(
        variables.status === 'APPROVED'
          ? t(
              'cosplayerApplications.messages.approved',
              'Application approved successfully.'
            )
          : t(
              'cosplayerApplications.messages.rejected',
              'Application rejected.'
            )
      )
      onClose()
    },
    onError: (err: any) => {
      toast.error(
        err?.response?.data?.message ||
          t(
            'cosplayerApplications.messages.error',
            'Unable to process this application.'
          )
      )
    },
  })

  if (!application) return null

  const handleApprove = () => {
    const values = form.getValues()
    reviewMutation.mutate({
      id: application.id,
      status: 'APPROVED',
      adminNotes: values.adminNotes?.trim() || undefined,
    })
  }

  const handleReject = (values: ReviewCosplayerFormValues) => {
    if (!values.rejectionReason?.trim()) {
      form.setError('rejectionReason', {
        message: t(
          'cosplayerApplications.validation.rejectionReason',
          'Enter a rejection reason so the user can update their application.'
        ),
      })
      return
    }
    reviewMutation.mutate({
      id: application.id,
      status: 'REJECTED',
      rejectionReason: values.rejectionReason.trim(),
      adminNotes: values.adminNotes?.trim() || undefined,
    })
  }

  return (
    <>
      <div className='flex w-full min-w-0 flex-col gap-6'>
        <PageHeader
          title={
            <>
              <BadgeCheck className='text-primary size-5' />
              {t(
                'cosplayerApplications.review.title',
                'Review cosplayer application'
              )}
            </>
          }
          description={
            <>
              {t(
                'cosplayerApplications.review.description',
                'Review the profile and decide whether to verify this account.'
              )}
            </>
          }
        />

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleReject)}
            className='space-y-5 py-2'
          >
            {/* User information header */}
            <div className='bg-muted/40 flex items-center gap-4 rounded-xl border p-4'>
              <div className='bg-primary/10 text-primary relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full font-bold'>
                {application.user?.avatar ? (
                  <img
                    src={application.user.avatar}
                    alt={application.user?.fullName || ''}
                    className='size-full object-cover'
                  />
                ) : (
                  <User className='size-6' />
                )}
              </div>
              <div className='min-w-0 flex-1 space-y-1'>
                <div className='flex items-center gap-2'>
                  <h4 className='truncate text-base font-semibold'>
                    {application.user?.fullName || application.stageName}
                  </h4>
                  {application.status === 'APPROVED' && (
                    <Badge variant='outline-success' className='gap-1'>
                      <CheckCircle className='size-3' /> Đã duyệt
                    </Badge>
                  )}
                  {application.status === 'PENDING' && (
                    <Badge variant='outline-warning' className='gap-1'>
                      Chờ duyệt
                    </Badge>
                  )}
                  {application.status === 'REJECTED' && (
                    <Badge variant='destructive' className='gap-1'>
                      <XCircle className='size-3' /> Đã từ chối
                    </Badge>
                  )}
                </div>
                <div className='text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1 text-xs'>
                  {application.user?.email && (
                    <span className='flex items-center gap-1'>
                      <Mail className='size-3' />
                      {application.user.email}
                    </span>
                  )}
                  {application.user?.username && (
                    <span>@{application.user.username}</span>
                  )}
                  <span>Mã đơn: #{application.id}</span>
                </div>
              </div>
            </div>

            {/* Cosplayer Profile Details */}
            <div className='space-y-3 rounded-xl border p-4'>
              <h5 className='text-foreground text-sm font-semibold'>
                Thông tin nghệ danh & Giới thiệu
              </h5>
              <div>
                <Label className='text-muted-foreground text-xs'>
                  Nghệ danh Cosplay
                </Label>
                <p className='text-primary text-base font-medium'>
                  {application.stageName}
                </p>
              </div>
              <div>
                <Label className='text-muted-foreground text-xs'>
                  Tiểu sử / Giới thiệu
                </Label>
                <p className='text-foreground/90 text-sm leading-relaxed whitespace-pre-wrap'>
                  {application.bio}
                </p>
              </div>
            </div>

            {/* Social Links */}
            {application.socialLinks &&
              Object.keys(application.socialLinks).length > 0 && (
                <div className='space-y-2 rounded-xl border p-4'>
                  <h5 className='text-foreground text-sm font-semibold'>
                    Liên kết mạng xã hội
                  </h5>
                  <div className='grid grid-cols-1 gap-2 sm:grid-cols-2'>
                    {Object.entries(application.socialLinks).map(
                      ([network, url]) => (
                        <a
                          key={network}
                          href={String(url)}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='bg-muted/50 hover:bg-muted flex items-center justify-between rounded-lg px-3 py-2 text-xs transition-colors'
                        >
                          <span className='font-medium capitalize'>
                            {network}
                          </span>
                          <span className='text-primary flex max-w-[200px] items-center gap-1 truncate'>
                            {String(url)}
                            <ExternalLink className='size-3 shrink-0' />
                          </span>
                        </a>
                      )
                    )}
                  </div>
                </div>
              )}

            {/* Portfolio URLs */}
            {application.portfolioUrls &&
              application.portfolioUrls.length > 0 && (
                <div className='space-y-3 rounded-xl border p-4'>
                  <h5 className='text-foreground text-sm font-semibold'>
                    Portfolio / Tác phẩm minh chứng (
                    {application.portfolioUrls.length})
                  </h5>
                  <div className='grid grid-cols-2 gap-3 sm:grid-cols-3'>
                    {application.portfolioUrls.map((url, idx) => (
                      <a
                        key={idx}
                        href={url}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='group bg-muted relative aspect-video overflow-hidden rounded-lg border'
                      >
                        <img
                          src={url}
                          alt={`Portfolio ${idx + 1}`}
                          className='size-full object-cover transition-transform group-hover:scale-105'
                          onError={(e) => {
                            ;(e.target as HTMLElement).style.display = 'none'
                          }}
                        />
                        <div className='absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100'>
                          <span className='flex items-center gap-1 rounded bg-black/70 px-2 py-1 text-[11px] text-white'>
                            <ExternalLink className='size-3' /> Xem ảnh
                          </span>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

            {/* Previous Rejection Info */}
            {application.status === 'REJECTED' &&
              application.rejectionReason &&
              !showRejectForm && (
                <div className='border-destructive/30 bg-destructive/5 rounded-xl border p-4 text-sm'>
                  <Label className='text-destructive font-semibold'>
                    Lý do từ chối trước đó:
                  </Label>
                  <p className='text-destructive/90 mt-1'>
                    {application.rejectionReason}
                  </p>
                </div>
              )}

            {/* Rejection form section */}
            {showRejectForm && (
              <FormField
                control={form.control}
                name='rejectionReason'
                render={({ field }) => (
                  <FormItem className='border-destructive/40 bg-destructive/5 space-y-1.5 rounded-xl border p-4'>
                    <FormLabel className='text-destructive text-sm font-semibold'>
                      Lý do từ chối đơn đăng ký{' '}
                      <span className='text-destructive'>*</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='Nhập lý do từ chối cụ thể để người dùng có thể bổ sung hồ sơ...'
                        className='min-h-[80px]'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Admin Notes */}
            <FormField
              control={form.control}
              name='adminNotes'
              render={({ field }) => (
                <FormItem className='space-y-1.5'>
                  <FormLabel className='text-muted-foreground text-xs'>
                    Ghi chú nội bộ admin (chỉ admin nhìn thấy)
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Ghi chú nội bộ về cosplayer này...'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='flex flex-wrap justify-end gap-2 border-t pt-4'>
              <Button
                type='button'
                variant='outline'
                onClick={() => onClose()}
                disabled={reviewMutation.isPending}
              >
                Đóng
              </Button>

              {showRejectForm ? (
                <Button
                  type='submit'
                  variant='destructive'
                  disabled={reviewMutation.isPending}
                  className='gap-1.5'
                >
                  {reviewMutation.isPending && (
                    <Loader2 className='size-4 animate-spin' />
                  )}
                  Xác nhận Từ chối
                </Button>
              ) : (
                <div className='flex items-center gap-2'>
                  <Button
                    type='button'
                    variant='outline'
                    className='text-destructive border-destructive/40 hover:bg-destructive/10'
                    onClick={() => setShowRejectForm(true)}
                    disabled={reviewMutation.isPending}
                  >
                    Từ chối
                  </Button>
                  <Button
                    type='button'
                    onClick={handleApprove}
                    disabled={reviewMutation.isPending}
                    className='bg-primary text-primary-foreground hover:bg-primary gap-1.5'
                  >
                    {reviewMutation.isPending ? (
                      <Loader2 className='size-4 animate-spin' />
                    ) : (
                      <CheckCircle className='size-4' />
                    )}
                    Phê duyệt (Cấp tích xanh)
                  </Button>
                </div>
              )}
            </div>
          </form>
        </Form>
      </div>
    </>
  )
}
