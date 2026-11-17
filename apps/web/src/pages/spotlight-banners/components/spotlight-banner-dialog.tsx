import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { restApiErrorHandler } from '@/lib/rest-api-handler'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { ImagePickerInput } from '@/components/forms/image-picker-input'
import {
  apiCreateAdminSpotlightBanner,
  apiUpdateAdminSpotlightBanner,
} from '../queries'
import {
  spotlightBannerFormSchema,
  type SpotlightBanner,
  type SpotlightBannerFormValues,
} from '../schema'

interface SpotlightBannerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  banner: SpotlightBanner | null
}

export function SpotlightBannerDialog({
  open,
  onOpenChange,
  banner,
}: SpotlightBannerDialogProps) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const isEdit = !!banner

  const form = useForm<SpotlightBannerFormValues>({
    resolver: zodResolver(spotlightBannerFormSchema),
    defaultValues: {
      name: '',
      badge: 'Cosplayer Tiêu Điểm Tuần Này',
      tagline: 'Vinh danh thành thương hiệu chuyên nghiệp',
      bannerImageUrl: '',
      portfolioHref: '/cosplayer/kiriko',
      bookingHref: '/booking?cosplayer=kiriko',
      sortOrder: 0,
      isVerified: true,
      isActive: true,
    },
  })

  useEffect(() => {
    if (banner) {
      form.reset({
        name: banner.name,
        badge: banner.badge,
        tagline: banner.tagline,
        bannerImageUrl: banner.bannerImageUrl,
        portfolioHref: banner.portfolioHref,
        bookingHref: banner.bookingHref ?? '',
        sortOrder: banner.sortOrder,
        isVerified: banner.isVerified,
        isActive: banner.isActive,
      })
    } else {
      form.reset({
        name: '',
        badge: 'Cosplayer Tiêu Điểm Tuần Này',
        tagline: 'Vinh danh thành thương hiệu chuyên nghiệp',
        bannerImageUrl: '',
        portfolioHref: '/cosplayer/kiriko',
        bookingHref: '/booking?cosplayer=kiriko',
        sortOrder: 0,
        isVerified: true,
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
      onOpenChange(false)
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
      onOpenChange(false)
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-[560px]'>
        <DialogHeader>
          <DialogTitle>
            {isEdit
              ? 'Chỉnh sửa banner tiêu điểm'
              : 'Thêm banner tiêu điểm mới'}
          </DialogTitle>
          <DialogDescription>
            Thiết lập banner carousel nổi bật trên trang chủ Kosume.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-4 py-2'
          >
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Tên Cosplayer / Nhân vật</FormLabel>
                  <FormControl>
                    <Input placeholder='KIRIKO' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='badge'
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Huy hiệu / Tiêu đề phụ</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Cosplayer Tiêu Điểm Tuần Này'
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
                  <FormLabel required>Mô tả / Slogan</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Vinh danh thành thương hiệu chuyên nghiệp'
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

            <div className='grid grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='portfolioHref'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Link hồ sơ (Portfolio)</FormLabel>
                    <FormControl>
                      <Input placeholder='/cosplayer/kiriko' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='bookingHref'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Link Booking (Tùy chọn)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='/booking?cosplayer=kiriko'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name='sortOrder'
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Thứ tự sắp xếp (Nhỏ xếp trước)</FormLabel>
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

            <div className='grid grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='isActive'
                render={({ field }) => (
                  <FormItem className='flex items-center justify-between rounded-lg border p-3'>
                    <div className='space-y-0.5'>
                      <FormLabel className='text-sm'>
                        Kích hoạt hiển thị
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

              <FormField
                control={form.control}
                name='isVerified'
                render={({ field }) => (
                  <FormItem className='flex items-center justify-between rounded-lg border p-3'>
                    <div className='space-y-0.5'>
                      <FormLabel className='text-sm'>
                        Tích xanh xác minh
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
            </div>

            <DialogFooter className='pt-2'>
              <Button
                type='button'
                variant='outline'
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Hủy
              </Button>
              <Button type='submit' disabled={isPending}>
                {isPending ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Tạo mới'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
