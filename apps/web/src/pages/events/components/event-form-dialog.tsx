import { useState } from 'react'
import { format, isSameDay, isSameMonth, isSameYear } from 'date-fns'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { CalendarIcon, Clock, MapPin, Ticket } from 'lucide-react'
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
import { ImagePickerInput } from '@/components/forms/image-picker-input'
import { apiCreateAdminEvent } from '../queries'
import { eventFormSchema, type EventFormValues } from '../schema'

const EVENT_TIME_SLOTS = [
  '08:00 - 17:00',
  '09:00 - 18:00',
  '09:00 - 21:00',
  '10:00 - 22:00',
  '13:00 - 21:00',
  'Cả ngày',
] as const

const EVENT_LOCATION_OPTIONS = [
  { label: 'TP.HCM', code: 'hcm' },
  { label: 'Hà Nội', code: 'hn' },
  { label: 'Đà Nẵng', code: 'dn' },
  { label: 'Cần Thơ', code: 'other' },
  { label: 'Hải Phòng', code: 'other' },
  { label: 'Toàn quốc', code: 'all' },
] as const

const DEFAULT_TIME_SLOT = '09:00 - 21:00'

function buildEventDateFields(
  start: Date,
  end: Date | undefined,
  slot: string
) {
  const effectiveEnd = end && end >= start ? end : start
  const dayLabel = format(start, 'dd')
  const monthLabel = `THÁNG ${format(start, 'M')}`
  const yearLabel = format(start, 'yyyy')

  let dateRangeText: string
  if (isSameDay(start, effectiveEnd)) {
    dateRangeText = `${format(start, 'dd')} Tháng ${format(start, 'M')}, ${yearLabel}`
  } else if (
    isSameMonth(start, effectiveEnd) &&
    isSameYear(start, effectiveEnd)
  ) {
    dateRangeText = `${format(start, 'dd')} - ${format(effectiveEnd, 'dd')} Tháng ${format(start, 'M')}, ${yearLabel}`
  } else {
    dateRangeText = `${format(start, 'dd/MM')} - ${format(effectiveEnd, 'dd/MM/yyyy')}`
  }

  const dateString = slot ? `${dateRangeText} • ${slot}` : dateRangeText

  return {
    dayLabel,
    monthLabel,
    yearLabel,
    dateString,
    startAt: start.toISOString(),
    endAt: effectiveEnd.toISOString(),
  }
}

function formatVndLabel(amount: number) {
  return `${new Intl.NumberFormat('vi-VN').format(amount)}đ`
}

interface EventFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EventFormDialog({ open, onOpenChange }: EventFormDialogProps) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [startDate, setStartDate] = useState<Date>(() => new Date())
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [timeSlot, setTimeSlot] = useState<string>(DEFAULT_TIME_SLOT)
  const [ticketMode, setTicketMode] = useState<'paid' | 'free'>('paid')
  const [startOpen, setStartOpen] = useState(false)
  const [endOpen, setEndOpen] = useState(false)

  const initialDates = buildEventDateFields(
    startDate,
    endDate,
    DEFAULT_TIME_SLOT
  )

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: '',
      dayLabel: initialDates.dayLabel,
      monthLabel: initialDates.monthLabel,
      yearLabel: initialDates.yearLabel,
      dateString: initialDates.dateString,
      startAt: initialDates.startAt,
      endAt: initialDates.endAt,
      locationLabel: 'TP.HCM',
      locationFilterCode: 'hcm',
      organizerName: '',
      venue: 'SECC - Trung tâm Hội chợ & Triển lãm Sài Gòn, Q.7',
      imageUrl: '',
      description:
        'Lễ hội hóa thân Cosplay quy mô lớn nhất mùa đông với hàng ngàn cosplayer.',
      ticketPriceAmount: 120000,
      ticketPriceLabel: formatVndLabel(120000),
      status: 'upcoming',
      isFeaturedFestival: false,
      isRecruiting: true,
    },
  })

  const syncEventDates = (
    nextStart: Date,
    nextEnd: Date | undefined,
    nextSlot: string
  ) => {
    const computed = buildEventDateFields(nextStart, nextEnd, nextSlot)
    form.setValue('dayLabel', computed.dayLabel, { shouldValidate: true })
    form.setValue('monthLabel', computed.monthLabel, { shouldValidate: true })
    form.setValue('yearLabel', computed.yearLabel)
    form.setValue('dateString', computed.dateString, { shouldValidate: true })
    form.setValue('startAt', computed.startAt, { shouldValidate: true })
    form.setValue('endAt', computed.endAt)
  }

  const resetLocalState = () => {
    const freshStart = new Date()
    const freshDates = buildEventDateFields(
      freshStart,
      undefined,
      DEFAULT_TIME_SLOT
    )
    setStartDate(freshStart)
    setEndDate(undefined)
    setTimeSlot(DEFAULT_TIME_SLOT)
    setTicketMode('paid')
    form.reset({
      title: '',
      dayLabel: freshDates.dayLabel,
      monthLabel: freshDates.monthLabel,
      yearLabel: freshDates.yearLabel,
      dateString: freshDates.dateString,
      startAt: freshDates.startAt,
      endAt: freshDates.endAt,
      locationLabel: 'TP.HCM',
      locationFilterCode: 'hcm',
      organizerName: '',
      venue: 'SECC - Trung tâm Hội chợ & Triển lãm Sài Gòn, Q.7',
      imageUrl: '',
      description:
        'Lễ hội hóa thân Cosplay quy mô lớn nhất mùa đông với hàng ngàn cosplayer.',
      ticketPriceAmount: 120000,
      ticketPriceLabel: formatVndLabel(120000),
      status: 'upcoming',
      isFeaturedFestival: false,
      isRecruiting: true,
    })
  }

  const createMutation = useMutation({
    mutationFn: apiCreateAdminEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-events'] })
      toast.success(
        t('events.messages.created', 'Đã tạo sự kiện mới thành công')
      )
      onOpenChange(false)
      resetLocalState()
    },
    onError: restApiErrorHandler,
  })

  const onSubmit = (values: EventFormValues) => {
    createMutation.mutate(values)
  }

  const previewDay = form.watch('dayLabel')
  const previewMonth = form.watch('monthLabel')
  const previewDateString = form.watch('dateString')

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
                name='startAt'
                render={() => (
                  <FormItem>
                    <FormLabel required>Ngày bắt đầu</FormLabel>
                    <Popover open={startOpen} onOpenChange={setStartOpen} modal>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            type='button'
                            variant='outline'
                            className={cn(
                              'w-full justify-start text-left font-normal',
                              !startDate && 'text-muted-foreground'
                            )}
                          >
                            <CalendarIcon className='mr-2 size-4 opacity-70' />
                            {startDate
                              ? format(startDate, 'dd/MM/yyyy')
                              : 'Chọn ngày bắt đầu'}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className='w-auto p-0' align='start'>
                        <Calendar
                          mode='single'
                          captionLayout='dropdown'
                          selected={startDate}
                          onSelect={(date) => {
                            if (!date) return
                            const adjustedEnd =
                              endDate && endDate < date ? date : endDate
                            setStartDate(date)
                            setEndDate(adjustedEnd)
                            syncEventDates(date, adjustedEnd, timeSlot)
                            setStartOpen(false)
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='endAt'
                render={() => (
                  <FormItem>
                    <FormLabel>Ngày kết thúc</FormLabel>
                    <Popover open={endOpen} onOpenChange={setEndOpen} modal>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            type='button'
                            variant='outline'
                            className={cn(
                              'w-full justify-start text-left font-normal',
                              !endDate && 'text-muted-foreground'
                            )}
                          >
                            <CalendarIcon className='mr-2 size-4 opacity-70' />
                            {endDate
                              ? format(endDate, 'dd/MM/yyyy')
                              : 'Cùng ngày (1 ngày)'}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className='w-auto p-0' align='start'>
                        <Calendar
                          mode='single'
                          captionLayout='dropdown'
                          selected={endDate}
                          onSelect={(date) => {
                            setEndDate(date)
                            syncEventDates(startDate, date, timeSlot)
                            setEndOpen(false)
                          }}
                          disabled={(date) => date < startDate}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='col-span-2 grid gap-2'>
                <Label>Khung giờ diễn ra</Label>
                <Select
                  value={timeSlot}
                  onValueChange={(val) => {
                    setTimeSlot(val)
                    syncEventDates(startDate, endDate, val)
                  }}
                >
                  <SelectTrigger className='w-full'>
                    <span className='flex items-center gap-2'>
                      <Clock className='size-4 opacity-70' />
                      <SelectValue placeholder='Chọn khung giờ' />
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    {EVENT_TIME_SLOTS.map((slot) => (
                      <SelectItem key={slot} value={slot}>
                        {slot}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className='bg-muted/40 col-span-2 flex items-center justify-between rounded-lg border px-3 py-2 text-xs'>
                <span className='text-muted-foreground'>
                  Tự động hiển thị:{' '}
                  <strong className='text-foreground'>
                    {previewDateString}
                  </strong>
                </span>
                <span className='bg-primary/10 text-primary rounded px-2 py-0.5 font-semibold'>
                  {previewDay} • {previewMonth}
                </span>
              </div>

              <FormField
                control={form.control}
                name='locationLabel'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Tỉnh / Thành phố</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={(val) => {
                        field.onChange(val)
                        const matched = EVENT_LOCATION_OPTIONS.find(
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
                            <SelectValue placeholder='Chọn Tỉnh / Thành phố' />
                          </span>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {EVENT_LOCATION_OPTIONS.map((loc) => (
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
                name='organizerName'
                render={({ field }) => (
                  <FormItem className='col-span-2'>
                    <FormLabel>
                      {t('events.fields.organizerName', 'Đơn vị tổ chức')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Kosume Events & Community'
                        {...field}
                        value={field.value ?? ''}
                      />
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
                        placeholder='https://...'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='grid gap-2'>
                <Label>Hình thức vé vào cổng</Label>
                <Select
                  value={ticketMode}
                  onValueChange={(val: 'paid' | 'free') => {
                    setTicketMode(val)
                    if (val === 'free') {
                      form.setValue('ticketPriceAmount', 0)
                      form.setValue('ticketPriceLabel', 'Miễn phí vào cổng')
                    } else {
                      const currentAmount =
                        form.getValues('ticketPriceAmount') || 120000
                      form.setValue('ticketPriceAmount', currentAmount)
                      form.setValue(
                        'ticketPriceLabel',
                        formatVndLabel(currentAmount)
                      )
                    }
                  }}
                >
                  <SelectTrigger className='w-full'>
                    <span className='flex items-center gap-2'>
                      <Ticket className='size-4 opacity-70' />
                      <SelectValue />
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='paid'>Có bán vé</SelectItem>
                    <SelectItem value='free'>Miễn phí vào cổng</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {ticketMode === 'paid' ? (
                <FormField
                  control={form.control}
                  name='ticketPriceAmount'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Giá vé từ (VNĐ)</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          min={0}
                          step={10000}
                          value={field.value ?? 0}
                          onChange={(e) => {
                            const amount = Math.max(
                              0,
                              Number(e.target.value) || 0
                            )
                            field.onChange(amount)
                            form.setValue(
                              'ticketPriceLabel',
                              amount > 0
                                ? formatVndLabel(amount)
                                : 'Miễn phí vào cổng'
                            )
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <div className='grid gap-2'>
                  <Label>Hiển thị</Label>
                  <Input value='Miễn phí vào cổng' disabled readOnly />
                </div>
              )}

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
