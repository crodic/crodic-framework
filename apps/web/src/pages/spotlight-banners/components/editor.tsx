import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import http from '@/lib/http'
import { RestQueryBuilder } from '@/lib/query-builder'
import { restApiErrorHandler } from '@/lib/rest-api-handler'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import AutoCompleteAsyncSelectControl from '@/components/forms/auto-complete-async-select-control'
import { ImagePickerInput } from '@/components/forms/image-picker-input'
import { FormActions } from '@/components/layout/form-actions'
import { PageHeader } from '@/components/layout/page-shell'
import {
  apiCreateAdminSpotlightBanner,
  apiUpdateAdminSpotlightBanner,
} from '../queries'
import {
  spotlightBannerFormSchema,
  type SpotlightBanner,
  type SpotlightBannerFormValues,
} from '../schema'

interface CosplayerSearchItem {
  userId: string | number
  slug: string
  displayName: string
  handle?: string | null
  isVerified?: boolean
  tagline?: string | null
}

interface CosplayerSelectOption {
  value: string
  label: string
  slug?: string
  displayName?: string
  isVerified?: boolean
  tagline?: string | null
  [key: string]: unknown
}

interface SpotlightBannerEditorProps {
  onClose: () => void
  banner: SpotlightBanner | null
}

export function SpotlightBannerEditor({
  onClose,
  banner,
}: SpotlightBannerEditorProps) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const isEdit = !!banner

  const form = useForm<SpotlightBannerFormValues>({
    resolver: zodResolver(spotlightBannerFormSchema),
    defaultValues: {
      cosplayerUserId: '',
      badge: 'Cosplayer Tiêu Điểm Tuần Này',
      tagline: 'Vinh danh thành thương hiệu chuyên nghiệp',
      bannerImageUrl: '',
      sortOrder: 0,
      isActive: true,
    },
  })

  useEffect(() => {
    if (banner) {
      form.reset({
        cosplayerUserId: banner.cosplayerUserId
          ? String(banner.cosplayerUserId)
          : '',
        badge: banner.badge,
        tagline: banner.tagline,
        bannerImageUrl: banner.bannerImageUrl,
        sortOrder: banner.sortOrder,
        isActive: banner.isActive,
      })
    } else {
      form.reset({
        cosplayerUserId: '',
        badge: 'Cosplayer Tiêu Điểm Tuần Này',
        tagline: 'Vinh danh thành thương hiệu chuyên nghiệp',
        bannerImageUrl: '',
        sortOrder: 0,
        isActive: true,
      })
    }
  }, [banner, form])

  const createMutation = useMutation({
    mutationFn: apiCreateAdminSpotlightBanner,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-spotlight-banners'] })
      toast.success(
        t('spotlight.messages.created', 'Đã thêm banner tiêu điểm thành công')
      )
      onClose()
      form.reset()
    },
    onError: restApiErrorHandler,
  })

  const updateMutation = useMutation({
    mutationFn: apiUpdateAdminSpotlightBanner,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-spotlight-banners'] })
      toast.success(
        t(
          'spotlight.messages.updated',
          'Đã cập nhật banner tiêu điểm thành công'
        )
      )
      onClose()
    },
    onError: restApiErrorHandler,
  })

  const onSubmit = (values: SpotlightBannerFormValues) => {
    if (isEdit && banner) {
      updateMutation.mutate({ id: banner.id, data: values })
    } else {
      createMutation.mutate(values)
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  const pageActions = (
    <FormActions>
      <Button
        type='button'
        variant='outline'
        onClick={() => onClose()}
        disabled={isPending}
      >
        {t('common.cancel', 'Hủy')}
      </Button>
      <Button type='submit' disabled={isPending}>
        {isPending
          ? t('common.saving', 'Đang lưu...')
          : isEdit
            ? t('common.update', 'Cập nhật')
            : t('common.create', 'Tạo mới')}
      </Button>
    </FormActions>
  )

  return (
    <>
      <div className='flex w-full min-w-0 flex-col gap-6'>
        <PageHeader
          title={
            <>
              {isEdit
                ? 'Chỉnh sửa banner tiêu điểm'
                : 'Thêm banner tiêu điểm mới'}
            </>
          }
          description={
            <>Thiết lập banner carousel nổi bật trên trang chủ Kosume.</>
          }
        />

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-4 py-2'
          >
            {pageActions}

            {/* Chọn Cosplayer để liên kết banner */}
            <FormField
              control={form.control}
              name='cosplayerUserId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>
                    {t('spotlight.fields.cosplayerUser', 'Chọn Cosplayer')}
                  </FormLabel>
                  <FormControl>
                    <AutoCompleteAsyncSelectControl
                      {...field}
                      value={field.value || undefined}
                      placeholder={t(
                        'spotlight.placeholders.selectCosplayer',
                        'Tìm kiếm và chọn Cosplayer trên sàn...'
                      )}
                      defaultOption={
                        banner?.cosplayerUserId
                          ? {
                              value: String(banner.cosplayerUserId),
                              label: banner.name,
                            }
                          : undefined
                      }
                      fetchOptions={async (search, page) => {
                        const builder = new RestQueryBuilder()
                          .page(page)
                          .limit(10)
                        if (search) {
                          builder.filter('search', search)
                        }
                        const res = await http.get<{
                          data?: CosplayerSearchItem[]
                          meta?: { totalPages?: number }
                        }>('/public/cosplayers', {
                          params: builder.build(),
                        })
                        const items = res.data?.data ?? []
                        return {
                          data: items.map((c): CosplayerSelectOption => ({
                            value: String(c.userId),
                            label: `${c.displayName} (${c.handle || c.slug})`,
                            slug: c.slug,
                            displayName: c.displayName,
                            isVerified: c.isVerified,
                            tagline: c.tagline,
                          })),
                          hasMore: page < (res.data?.meta?.totalPages ?? 1),
                        }
                      }}
                      onChange={(val) => {
                        field.onChange(val ? String(val) : '')
                      }}
                      onSelectOption={(opt) => {
                        if (!opt || Array.isArray(opt)) return
                        const selected = opt as CosplayerSelectOption
                        if (selected.tagline && !form.getValues('tagline')) {
                          form.setValue('tagline', selected.tagline)
                        }
                      }}
                    />
                  </FormControl>
                  <FormDescription className='text-muted-foreground text-xs'>
                    {t(
                      'spotlight.fields.cosplayerUserHelp',
                      'Tên hiển thị, tích xanh và đường dẫn Portfolio sẽ tự động đồng bộ theo hồ sơ Cosplayer đã chọn.'
                    )}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='badge'
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>
                    {t('spotlight.fields.badge', 'Huy hiệu / Tiêu đề phụ')}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t(
                        'spotlight.placeholders.badge',
                        'Cosplayer Tiêu Điểm Tuần Này'
                      )}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='tagline'
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>
                    {t('spotlight.fields.tagline', 'Mô tả / Slogan')}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t(
                        'spotlight.placeholders.tagline',
                        'Vinh danh thành thương hiệu chuyên nghiệp'
                      )}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='bannerImageUrl'
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <ImagePickerInput
                      label={t(
                        'spotlight.fields.bannerImageUrl',
                        'Đường dẫn hình ảnh Banner'
                      )}
                      required
                      value={field.value || ''}
                      onChange={field.onChange}
                      placeholder='https://...'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='sortOrder'
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>
                    {t(
                      'spotlight.fields.sortOrder',
                      'Thứ tự sắp xếp (Nhỏ xếp trước)'
                    )}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      value={field.value}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='isActive'
              render={({ field }) => (
                <FormItem className='flex items-center justify-between rounded-lg border p-3'>
                  <div className='space-y-0.5'>
                    <FormLabel className='text-sm'>
                      {t('spotlight.fields.isActive', 'Kích hoạt hiển thị')}
                    </FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormActions footer>{pageActions}</FormActions>
          </form>
        </Form>
      </div>
    </>
  )
}
