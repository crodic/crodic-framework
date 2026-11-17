import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { apiCreateAdminJob } from '../queries'
import { jobFormSchema, type JobFormValues } from '../schema'

interface JobFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function JobFormDialog({ open, onOpenChange }: JobFormDialogProps) {
  const queryClient = useQueryClient()

  const form = useForm<JobFormValues>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      title: '',
      brandName: '',
      categoryCode: 'event',
      categoryLabel: 'Sự kiện / Guest Festival',
      budgetLabel: '5.000.000đ - 8.000.000đ / ngày',
      locationLabel: 'TP.HCM',
      deadlineLabel: '30 ngày nữa',
      requirements:
        'Cosplayer có kinh nghiệm diễn xuất, ngoại hình phù hợp nhân vật.',
      description:
        'Hóa thân nhân vật đại diện tại gian hàng sự kiện ra mắt game.',
      contactEmail: 'contact@brand.com',
      status: 'open',
      isFeatured: false,
    },
  })

  const createMutation = useMutation({
    mutationFn: apiCreateAdminJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-jobs'] })
      toast.success('Đã tạo tin tuyển dụng mới thành công')
      onOpenChange(false)
      form.reset()
    },
    onError: restApiErrorHandler,
  })

  const onSubmit = (values: JobFormValues) => {
    createMutation.mutate(values)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-[620px]'>
        <DialogHeader>
          <DialogTitle>Tạo tin tuyển dụng / Casting mới</DialogTitle>
          <DialogDescription>
            Đăng tin tuyển dụng cosplayer đại diện nhãn hàng hoặc sự kiện.
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
                    <FormLabel required>Tiêu đề tuyển dụng</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Tuyển Cosplayer Acheron Festival 2026'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='brandName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Tên Brand / Nhà tuyển dụng</FormLabel>
                    <FormControl>
                      <Input placeholder='HoYoverse VN' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='categoryCode'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Loại hình</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={(val: any) => {
                        field.onChange(val)
                        const labels: Record<string, string> = {
                          lookbook: 'Lookbook / Mẫu ảnh',
                          event: 'Sự kiện / Guest Festival',
                          crafting: 'Chế tác / Props & Wig',
                          game_ads: 'Quảng cáo Game Ads',
                        }
                        form.setValue('categoryLabel', labels[val] ?? 'Sự kiện')
                      }}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Chọn phân loại' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='event'>
                          Sự kiện / Guest Festival
                        </SelectItem>
                        <SelectItem value='lookbook'>
                          Lookbook / Mẫu ảnh
                        </SelectItem>
                        <SelectItem value='crafting'>
                          Chế tác / Props & Wig
                        </SelectItem>
                        <SelectItem value='game_ads'>
                          Quảng cáo Game Ads
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='budgetLabel'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Mức thù lao</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='5.000.000đ - 8.000.000đ / ngày'
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
                    <FormLabel required>Địa điểm làm việc</FormLabel>
                    <FormControl>
                      <Input placeholder='TP.HCM & Toàn quốc' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='deadlineLabel'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Hạn nộp</FormLabel>
                    <FormControl>
                      <Input placeholder='Hạn chót: 30/12/2026' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='contactEmail'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Email liên hệ</FormLabel>
                    <FormControl>
                      <Input placeholder='hr@hoyoverse.com' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='requirements'
                render={({ field }) => (
                  <FormItem className='col-span-2'>
                    <FormLabel required>Yêu cầu ứng viên</FormLabel>
                    <FormControl>
                      <Textarea rows={2} {...field} />
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
                    <FormLabel required>Mô tả chi tiết công việc</FormLabel>
                    <FormControl>
                      <Textarea rows={3} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='isFeatured'
                render={({ field }) => (
                  <FormItem className='col-span-2 flex items-center justify-between rounded-lg border p-3'>
                    <div className='space-y-0.5'>
                      <FormLabel className='text-sm'>
                        Tin nổi bật (Featured)
                      </FormLabel>
                      <p className='text-muted-foreground text-xs'>
                        Ghim lên đầu trang chủ và danh sách việc làm
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
                {createMutation.isPending ? 'Đang tạo...' : 'Tạo tin'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
