import { useState } from 'react'
import { addDays, format } from 'date-fns'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { CalendarIcon, MapPin } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { restApiErrorHandler } from '@/lib/rest-api-handler'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
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
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
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

const JOB_LOCATION_OPTIONS = [
  { label: 'TP.HCM', code: 'hcm' },
  { label: 'Hà Nội', code: 'hn' },
  { label: 'Đà Nẵng', code: 'dn' },
  { label: 'Cần Thơ', code: 'other' },
  { label: 'Toàn quốc', code: 'all' },
  { label: 'Online / Remote', code: 'remote' },
] as const

const JOB_BUDGET_UNITS = [
  { value: '/ ngày', label: '/ ngày' },
  { value: '/ buổi', label: '/ buổi' },
  { value: '/ sự kiện', label: '/ sự kiện' },
  { value: '/ bộ', label: '/ bộ' },
  { value: '/ dự án', label: '/ dự án' },
  { value: 'negotiable', label: 'Thỏa thuận' },
] as const

const CATEGORY_LABELS: Record<string, string> = {
  lookbook: 'Lookbook / Mẫu ảnh',
  event: 'Sự kiện / Guest Festival',
  crafting: 'Chế tác / Props & Wig',
  game_ads: 'Quảng cáo Game Ads',
}

function buildJobBudgetLabel(
  min?: number,
  max?: number,
  unit = '/ ngày'
): string {
  if (unit === 'negotiable') return 'Thỏa thuận'
  const fmt = (n: number) => `${new Intl.NumberFormat('vi-VN').format(n)}đ`
  const hasMin = typeof min === 'number' && min > 0
  const hasMax = typeof max === 'number' && max > 0

  if (hasMin && hasMax && max > min) {
    return `${fmt(min)} - ${fmt(max)} ${unit}`
  }
  if (hasMin) {
    return `${fmt(min)} ${unit}`
  }
  if (hasMax) {
    return `Đến ${fmt(max)} ${unit}`
  }
  return 'Thỏa thuận'
}

interface JobFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function JobFormDialog({ open, onOpenChange }: JobFormDialogProps) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [deadlineDate, setDeadlineDate] = useState<Date>(() =>
    addDays(new Date(), 30)
  )
  const [deadlineOpen, setDeadlineOpen] = useState(false)
  const [budgetUnit, setBudgetUnit] = useState<string>('/ ngày')

  const form = useForm<JobFormValues>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      title: '',
      brandName: '',
      categoryCode: 'event',
      categoryLabel: 'Sự kiện / Guest Festival',
      budgetMin: 5000000,
      budgetMax: 8000000,
      budgetLabel: buildJobBudgetLabel(5000000, 8000000, '/ ngày'),
      locationLabel: 'TP.HCM',
      locationFilterCode: 'hcm',
      deadlineLabel: format(deadlineDate, 'dd/MM/yyyy'),
      deadlineAt: deadlineDate.toISOString(),
      requirements:
        'Cosplayer có kinh nghiệm diễn xuất, ngoại hình phù hợp nhân vật.',
      description:
        'Hóa thân nhân vật đại diện tại gian hàng sự kiện ra mắt game.',
      contactEmail: 'contact@brand.com',
      status: 'open',
      isFeatured: false,
    },
  })

  const syncBudget = (
    nextMin: number | undefined,
    nextMax: number | undefined,
    nextUnit: string
  ) => {
    form.setValue('budgetMin', nextUnit === 'negotiable' ? undefined : nextMin)
    form.setValue('budgetMax', nextUnit === 'negotiable' ? undefined : nextMax)
    form.setValue(
      'budgetLabel',
      buildJobBudgetLabel(nextMin, nextMax, nextUnit),
      { shouldValidate: true }
    )
  }

  const resetLocalState = () => {
    const nextDeadline = addDays(new Date(), 30)
    setDeadlineDate(nextDeadline)
    setBudgetUnit('/ ngày')
    form.reset({
      title: '',
      brandName: '',
      categoryCode: 'event',
      categoryLabel: 'Sự kiện / Guest Festival',
      budgetMin: 5000000,
      budgetMax: 8000000,
      budgetLabel: buildJobBudgetLabel(5000000, 8000000, '/ ngày'),
      locationLabel: 'TP.HCM',
      locationFilterCode: 'hcm',
      deadlineLabel: format(nextDeadline, 'dd/MM/yyyy'),
      deadlineAt: nextDeadline.toISOString(),
      requirements:
        'Cosplayer có kinh nghiệm diễn xuất, ngoại hình phù hợp nhân vật.',
      description:
        'Hóa thân nhân vật đại diện tại gian hàng sự kiện ra mắt game.',
      contactEmail: 'contact@brand.com',
      status: 'open',
      isFeatured: false,
    })
  }

  const createMutation = useMutation({
    mutationFn: apiCreateAdminJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-jobs'] })
      toast.success(
        t('jobs.messages.created', 'Đã tạo tin tuyển dụng mới thành công')
      )
      onOpenChange(false)
      resetLocalState()
    },
    onError: restApiErrorHandler,
  })

  const onSubmit = (values: JobFormValues) => {
    createMutation.mutate(values)
  }

  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)

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
                      onValueChange={(val) => {
                        field.onChange(val)
                        form.setValue(
                          'categoryLabel',
                          CATEGORY_LABELS[val] ?? 'Sự kiện'
                        )
                      }}
                    >
                      <FormControl>
                        <SelectTrigger className='w-full'>
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

              <div className='col-span-2 grid grid-cols-3 gap-3'>
                <FormField
                  control={form.control}
                  name='budgetMin'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Thù lao từ (VNĐ)</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          min={0}
                          step={500000}
                          disabled={budgetUnit === 'negotiable'}
                          value={field.value ?? 0}
                          onChange={(e) => {
                            const val = Math.max(0, Number(e.target.value) || 0)
                            syncBudget(
                              val,
                              form.getValues('budgetMax'),
                              budgetUnit
                            )
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='budgetMax'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Đến (VNĐ)</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          min={0}
                          step={500000}
                          disabled={budgetUnit === 'negotiable'}
                          value={field.value ?? 0}
                          onChange={(e) => {
                            const val = Math.max(0, Number(e.target.value) || 0)
                            syncBudget(
                              form.getValues('budgetMin'),
                              val,
                              budgetUnit
                            )
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className='grid gap-2'>
                  <Label>Đơn vị tính</Label>
                  <Select
                    value={budgetUnit}
                    onValueChange={(val) => {
                      setBudgetUnit(val)
                      syncBudget(
                        form.getValues('budgetMin'),
                        form.getValues('budgetMax'),
                        val
                      )
                    }}
                  >
                    <SelectTrigger className='w-full'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {JOB_BUDGET_UNITS.map((unit) => (
                        <SelectItem key={unit.value} value={unit.value}>
                          {unit.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <FormField
                control={form.control}
                name='locationLabel'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Địa điểm làm việc</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={(val) => {
                        field.onChange(val)
                        const matched = JOB_LOCATION_OPTIONS.find(
                          (loc) => loc.label === val
                        )
                        if (matched) {
                          form.setValue('locationFilterCode', matched.code)
                        }
                      }}
                    >
                      <FormControl>
                        <SelectTrigger className='w-full'>
                          <span className='flex items-center gap-2'>
                            <MapPin className='size-4 opacity-70' />
                            <SelectValue placeholder='Chọn địa điểm' />
                          </span>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {JOB_LOCATION_OPTIONS.map((loc) => (
                          <SelectItem key={loc.label} value={loc.label}>
                            {loc.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='deadlineLabel'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Hạn nộp hồ sơ</FormLabel>
                    <Popover
                      open={deadlineOpen}
                      onOpenChange={setDeadlineOpen}
                      modal
                    >
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            type='button'
                            variant='outline'
                            className={cn(
                              'w-full justify-start text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            <CalendarIcon className='mr-2 size-4 opacity-70' />
                            {deadlineDate
                              ? format(deadlineDate, 'dd/MM/yyyy')
                              : field.value || 'Chọn hạn nộp'}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className='w-auto p-0' align='start'>
                        <Calendar
                          mode='single'
                          captionLayout='dropdown'
                          selected={deadlineDate}
                          onSelect={(date) => {
                            if (!date) return
                            setDeadlineDate(date)
                            form.setValue(
                              'deadlineLabel',
                              format(date, 'dd/MM/yyyy'),
                              { shouldValidate: true }
                            )
                            form.setValue('deadlineAt', date.toISOString())
                            setDeadlineOpen(false)
                          }}
                          disabled={(date) => date < startOfToday}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='contactEmail'
                render={({ field }) => (
                  <FormItem className='col-span-2'>
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
