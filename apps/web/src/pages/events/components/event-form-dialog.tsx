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
import { Textarea } from '@/components/ui/textarea'
import { ImagePickerInput } from '@/components/forms/image-picker-input'
import { apiCreateAdminEvent } from '../queries'
import { eventFormSchema, type EventFormValues } from '../schema'

interface EventFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EventFormDialog({ open, onOpenChange }: EventFormDialogProps) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: '',
      dayLabel: '28',
      monthLabel: 'THÁNG 12',
      yearLabel: '2026',
      dateString: '28 - 29 Tháng 12, 2026',
      startAt: new Date().toISOString(),
      locationLabel: 'TP.HCM',
      venue: 'SECC - Trung tâm Hội chợ & Triển lãm Sài Gòn, Q.7',
      imageUrl: '/landing/featured-work-1.jpg',
      description:
        'Lễ hội hóa thân Cosplay quy mô lớn nhất mùa đông với hàng ngàn cosplayer.',
      ticketPriceLabel: '120.000đ - 250.000đ',
      status: 'upcoming',
      isFeaturedFestival: false,
      isRecruiting: true,
    },
  })

  const createMutation = useMutation({
    mutationFn: apiCreateAdminEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-events'] })
      toast.success(
        t('events.messages.created', 'Đã tạo sự kiện mới thành công')
      )
      onOpenChange(false)
      form.reset()
    },
    onError: restApiErrorHandler,
  })

  const onSubmit = (values: EventFormValues) => {
    createMutation.mutate(values)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-[640px]'>
        <DialogHeader>
          <DialogTitle>Tạo sự kiện / Cosplay Festival mới</DialogTitle>
          <DialogDescription>
            Đăng thông tin lễ hội anime, cosplay, giao lưu cộng đồng.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-4 py-2'
          >
            <div className='grid grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='title'
                render={({ field }) => (
                  <FormItem className='col-span-2'>
                    <FormLabel required>Tên sự kiện / Festival</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Vietnam Cosplay Expo 2026'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='dayLabel'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Ngày (Badge)</FormLabel>
                    <FormControl>
                      <Input placeholder='28' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='monthLabel'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Tháng (Badge)</FormLabel>
                    <FormControl>
                      <Input placeholder='THÁNG 12' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='dateString'
                render={({ field }) => (
                  <FormItem className='col-span-2'>
                    <FormLabel required>Chuỗi ngày giờ hiển thị</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='28 - 29 Tháng 12, 2026 • 09:00 - 21:00'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='locationLabel'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Tỉnh / Thành phố</FormLabel>
                    <FormControl>
                      <Input placeholder='TP.HCM hoặc Hà Nội' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='venue'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Địa điểm cụ thể</FormLabel>
                    <FormControl>
                      <Input placeholder='SECC Q.7, TP.HCM' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='imageUrl'
                render={({ field }) => (
                  <FormItem className='col-span-2'>
                    <FormControl>
                      <ImagePickerInput
                        label={t(
                          'events.fields.imageUrl',
                          'Ảnh đại diện sự kiện (Poster/Cover)'
                        )}
                        required
                        value={field.value || ''}
                        onChange={field.onChange}
                        placeholder='https://... hoặc /landing/event-1.jpg'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='ticketPriceLabel'
                render={({ field }) => (
                  <FormItem className='col-span-2'>
                    <FormLabel>Giá vé / Vé vào cổng</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='120.000đ - 250.000đ (Miễn phí vé thường)'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='description'
                render={({ field }) => (
                  <FormItem className='col-span-2'>
                    <FormLabel required>Mô tả sự kiện</FormLabel>
                    <FormControl>
                      <Textarea rows={3} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='isFeaturedFestival'
                render={({ field }) => (
                  <FormItem className='flex items-center justify-between rounded-lg border p-3'>
                    <div className='space-y-0.5'>
                      <FormLabel className='text-sm'>
                        Lễ hội tiêu điểm
                      </FormLabel>
                      <p className='text-muted-foreground text-xs'>
                        Ghim banner lớn trang chủ
                      </p>
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
                name='isRecruiting'
                render={({ field }) => (
                  <FormItem className='flex items-center justify-between rounded-lg border p-3'>
                    <div className='space-y-0.5'>
                      <FormLabel className='text-sm'>Mở đăng ký</FormLabel>
                      <p className='text-muted-foreground text-xs'>
                        Tuyển guest & cosplayer
                      </p>
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
                disabled={createMutation.isPending}
              >
                Hủy
              </Button>
              <Button type='submit' disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Đang tạo...' : 'Tạo sự kiện'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
