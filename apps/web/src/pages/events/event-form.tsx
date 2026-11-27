import { useEffect, useMemo, useState } from 'react'
import { format, isSameDay, isSameMonth, isSameYear, isValid } from 'date-fns'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  CalendarIcon,
  Loader2Icon,
  PlusIcon,
  SaveIcon,
  Trash2Icon,
  XIcon,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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
import { FormActions } from '@/components/layout/form-actions'
import { PageHeader } from '@/components/layout/page-shell'
import {
  EventFeaturedBadge,
  EventRecruitingBadge,
  EventStatusBadge,
} from './components/event-badges'
import { eventFormSchema, type Event, type EventFormValues } from './schema'

const EVENT_LOCATION_OPTIONS = [
  'TP. Hồ Chí Minh',
  'TP.HCM',
  'Hà Nội',
  'Đà Nẵng',
  'Cần Thơ',
  'Hải Phòng',
  'Toàn quốc',
] as const

const STANDARD_CATEGORIES = [
  'Festival',
  'Cosplay Contest',
  'Photoshoot',
  'Workshop',
  'Artist Alley',
] as const

const TICKET_PRICE_PRESETS = [50000, 100000, 150000, 200000] as const

function parseDateSafe(isoString?: string | null, fallback = new Date()): Date {
  if (!isoString) return fallback
  const parsed = new Date(isoString)
  return isValid(parsed) ? parsed : fallback
}

function combineDateAndTime(baseDate: Date, timeStr: string): Date {
  const [rawHours, rawMinutes] = timeStr.split(':')
  const hours = Number.parseInt(rawHours ?? '9', 10)
  const minutes = Number.parseInt(rawMinutes ?? '0', 10)
  const result = new Date(baseDate)
  result.setHours(
    Number.isFinite(hours) ? Math.min(23, Math.max(0, hours)) : 9,
    Number.isFinite(minutes) ? Math.min(59, Math.max(0, minutes)) : 0,
    0,
    0
  )
  return result
}

function formatDateRangePreview(
  start: Date,
  end: Date | undefined,
  startTime: string,
  endTime: string
): string {
  const effectiveEnd = end && end >= start ? end : start
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

  return `${dateRangeText} • ${startTime} - ${endTime}`
}

interface EventFormProps {
  initialData?: Event
  isSubmitting?: boolean
  onSubmit: (values: EventFormValues) => void
}

export function EventForm({
  initialData,
  isSubmitting = false,
  onSubmit,
}: EventFormProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const initialStart = parseDateSafe(
    initialData?.startAt,
    combineDateAndTime(new Date(), '09:00')
  )
  const initialEnd = initialData?.endAt
    ? parseDateSafe(initialData.endAt)
    : undefined
  const initialStartTime = initialData?.startAt
    ? format(initialStart, 'HH:mm')
    : '09:00'
  const initialEndTime = initialEnd ? format(initialEnd, 'HH:mm') : '21:00'

  const [startDate, setStartDate] = useState<Date>(initialStart)
  const [endDate, setEndDate] = useState<Date | undefined>(initialEnd)
  const [startTime, setStartTime] = useState<string>(initialStartTime)
  const [endTime, setEndTime] = useState<string>(initialEndTime)
  const [startOpen, setStartOpen] = useState(false)
  const [endOpen, setEndOpen] = useState(false)
  const [customCategory, setCustomCategory] = useState('')
  const [ticketMode, setTicketMode] = useState<'free' | 'paid'>(
    initialData &&
      initialData.ticketPriceAmount !== null &&
      initialData.ticketPriceAmount !== undefined &&
      initialData.ticketPriceAmount > 0
      ? 'paid'
      : 'free'
  )

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: initialData?.title ?? '',
      startAt: initialStart.toISOString(),
      endAt: (
        initialEnd ?? combineDateAndTime(initialStart, initialEndTime)
      ).toISOString(),
      locationLabel: initialData?.locationLabel ?? 'TP. Hồ Chí Minh',
      organizerName: initialData?.organizerName ?? '',
      venue: initialData?.venue ?? '',
      imageUrl: initialData?.imageUrl ?? '',
      bannerImageUrl: initialData?.bannerImageUrl ?? '',
      description: initialData?.description ?? '',
      ticketPriceAmount: initialData?.ticketPriceAmount ?? 0,
      status: initialData?.status ?? 'upcoming',
      isFeaturedFestival: initialData?.isFeaturedFestival ?? false,
      isRecruiting: initialData?.isRecruiting ?? true,
      categories: initialData?.categories ?? [],
      schedule: initialData?.schedule ?? [],
    },
  })

  const {
    fields: scheduleFields,
    append,
    remove,
  } = useFieldArray({
    control: form.control,
    name: 'schedule',
  })

  useEffect(() => {
    if (!initialData) return
    const nextStart = parseDateSafe(initialData.startAt)
    const nextEnd = initialData.endAt
      ? parseDateSafe(initialData.endAt)
      : undefined
    const nextStartTime = format(nextStart, 'HH:mm')
    const nextEndTime = nextEnd ? format(nextEnd, 'HH:mm') : '21:00'

    setStartDate(nextStart)
    setEndDate(nextEnd)
    setStartTime(nextStartTime)
    setEndTime(nextEndTime)
    setTicketMode(
      initialData.ticketPriceAmount && initialData.ticketPriceAmount > 0
        ? 'paid'
        : 'free'
    )

    form.reset({
      title: initialData.title,
      startAt: nextStart.toISOString(),
      endAt: (
        nextEnd ?? combineDateAndTime(nextStart, nextEndTime)
      ).toISOString(),
      locationLabel: initialData.locationLabel,
      organizerName: initialData.organizerName ?? '',
      venue: initialData.venue,
      imageUrl: initialData.imageUrl,
      bannerImageUrl: initialData.bannerImageUrl ?? '',
      description: initialData.description ?? '',
      ticketPriceAmount: initialData.ticketPriceAmount ?? 0,
      status: initialData.status,
      isFeaturedFestival: initialData.isFeaturedFestival,
      isRecruiting: initialData.isRecruiting,
      categories: initialData.categories ?? [],
      schedule: initialData.schedule ?? [],
    })
  }, [initialData, form])

  const watchedTitle = useWatch({ control: form.control, name: 'title' })
  const watchedStatus = useWatch({ control: form.control, name: 'status' })
  const watchedFeatured = useWatch({
    control: form.control,
    name: 'isFeaturedFestival',
  })
  const watchedRecruiting = useWatch({
    control: form.control,
    name: 'isRecruiting',
  })
  const watchedCategories = useWatch({
    control: form.control,
    name: 'categories',
  })

  const locationOptions = useMemo(() => {
    const current = initialData?.locationLabel
    if (
      current &&
      !EVENT_LOCATION_OPTIONS.includes(
        current as (typeof EVENT_LOCATION_OPTIONS)[number]
      )
    ) {
      return [current, ...EVENT_LOCATION_OPTIONS]
    }
    return [...EVENT_LOCATION_OPTIONS]
  }, [initialData?.locationLabel])

  const syncDates = (
    nextStart: Date,
    nextEnd: Date | undefined,
    nextStartTime: string,
    nextEndTime: string
  ) => {
    const startWithTime = combineDateAndTime(nextStart, nextStartTime)
    const effectiveEndBase =
      nextEnd && nextEnd >= nextStart ? nextEnd : nextStart
    const endWithTime = combineDateAndTime(effectiveEndBase, nextEndTime)

    form.setValue('startAt', startWithTime.toISOString(), {
      shouldValidate: true,
    })
    form.setValue('endAt', endWithTime.toISOString())
  }

  const toggleCategory = (cat: string) => {
    const current = watchedCategories ?? []
    const exists = current.some(
      (item) => item.toLowerCase() === cat.toLowerCase()
    )
    const next = exists
      ? current.filter((item) => item.toLowerCase() !== cat.toLowerCase())
      : [...current, cat]
    form.setValue('categories', next, { shouldDirty: true })
  }

  const addCustomCategory = () => {
    const trimmed = customCategory.trim()
    if (!trimmed) return
    const current = watchedCategories ?? []
    if (!current.some((item) => item.toLowerCase() === trimmed.toLowerCase())) {
      form.setValue('categories', [...current, trimmed], { shouldDirty: true })
    }
    setCustomCategory('')
  }

  const datePreviewText = formatDateRangePreview(
    startDate,
    endDate,
    startTime,
    endTime
  )

  const backTarget = initialData ? `/events/${initialData.id}/show` : '/events'

  const pageActions = (
    <>
      <Button
        type='button'
        variant='outline'

        onClick={() => navigate(backTarget)}
        disabled={isSubmitting}
      >
        {t('buttons.cancel', 'Hủy')}
      </Button>
      <Button
        type='submit'

        disabled={isSubmitting}
        className='cursor-pointer gap-2'
      >
        {isSubmitting ? (
          <>
            <Loader2Icon className='size-4 animate-spin' aria-hidden='true' />
            <span>{t('buttons.saving', 'Đang lưu...')}</span>
          </>
        ) : (
          <>
            <SaveIcon className='size-4' aria-hidden='true' />
            <span>
              {initialData
                ? t('buttons.saveChanges', 'Lưu thay đổi')
                : t('events.form.submit', 'Tạo sự kiện')}
            </span>
          </>
        )}
      </Button>
    </>
  )

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='flex-1 space-y-6'>
        {/* Clean Sticky Header Bar */}
        <PageHeader
          title={
            <>
              {initialData
                ? watchedTitle?.trim() || initialData.title
                : t('events.form.createTitle', 'Tạo sự kiện & Festival mới')}
            </>
          }
          description={
            <>
              {initialData
                ? t(
                    'events.form.editSubtitle',
                    'Cập nhật thông tin tổ chức, lịch trình hoạt động, giá vé và trạng thái hiển thị công khai.'
                  )
                : t(
                    'events.form.createSubtitle',
                    'Thiết lập đầy đủ thông tin sự kiện cosplay, lễ hội hoặc workshop để xuất bản lên cổng thông tin.'
                  )}
            </>
          }
          badges={
            <>
              <EventStatusBadge status={watchedStatus} />
              <EventFeaturedBadge isFeatured={Boolean(watchedFeatured)} />
              <EventRecruitingBadge isRecruiting={Boolean(watchedRecruiting)} />
            </>
          }
          actions={pageActions}
        />

        {/* 2-Column Operate Workspace */}
        <div className='grid grid-cols-1 gap-6 lg:grid-cols-12'>
          {/* Left Main Column (8 Cols) */}
          <div className='space-y-6 lg:col-span-8'>
            {/* Card 1: Core Details */}
            <Card className='border-border/80'>
              <CardHeader>
                <CardTitle className='text-base font-semibold'>
                  {t('events.form.coreSection', 'Thông tin cơ bản')}
                </CardTitle>
                <CardDescription className='text-xs'>
                  {t(
                    'events.form.coreDesc',
                    'Tên sự kiện, địa điểm tổ chức, phân loại danh mục và mô tả nội dung.'
                  )}
                </CardDescription>
              </CardHeader>

              <CardContent className='space-y-6'>
                <div className='grid gap-4 sm:grid-cols-2'>
                  <FormField
                    control={form.control}
                    name='title'
                    render={({ field }) => (
                      <FormItem className='sm:col-span-2'>
                        <FormLabel required className='text-xs font-semibold'>
                          {t('events.form.name', 'Tên sự kiện / Festival')}
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t(
                              'events.form.namePlaceholder',
                              'Ví dụ: Winter Cosplay Fest 2026'
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
                    name='locationLabel'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel required className='text-xs font-semibold'>
                          {t('events.form.city', 'Tỉnh / Thành phố')}
                        </FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger className='w-full'>
                              <SelectValue
                                placeholder={t(
                                  'events.form.selectCity',
                                  'Chọn khu vực'
                                )}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {locationOptions.map((loc) => (
                              <SelectItem key={loc} value={loc}>
                                {loc}
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
                    name='organizerName'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='text-xs font-semibold'>
                          {t('events.fields.organizerName', 'Đơn vị tổ chức')}
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t(
                              'events.form.organizerPlaceholder',
                              'Organizer / Studio'
                            )}
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
                    name='venue'
                    render={({ field }) => (
                      <FormItem className='sm:col-span-2'>
                        <FormLabel required className='text-xs font-semibold'>
                          {t('events.form.venue', 'Địa điểm tổ chức cụ thể')}
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t(
                              'events.form.venuePlaceholder',
                              'Ví dụ: SECC - 799 Nguyễn Văn Linh, Quận 7'
                            )}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Categories */}
                <div className='space-y-2.5'>
                  <Label className='text-xs font-semibold'>
                    {t('events.form.categories', 'Danh mục hoạt động')}
                  </Label>
                  <div className='flex flex-wrap gap-2'>
                    {STANDARD_CATEGORIES.map((cat) => {
                      const active = (watchedCategories ?? []).some(
                        (item) => item.toLowerCase() === cat.toLowerCase()
                      )
                      return (
                        <Button
                          key={cat}
                          type='button'
                          variant={active ? 'default' : 'outline'}
                          size='sm'
                          onClick={() => toggleCategory(cat)}
                          className='h-7 cursor-pointer rounded-full px-3 text-xs'
                        >
                          {cat}
                        </Button>
                      )
                    })}
                    {(watchedCategories ?? [])
                      .filter(
                        (cat) =>
                          !STANDARD_CATEGORIES.some(
                            (std) => std.toLowerCase() === cat.toLowerCase()
                          )
                      )
                      .map((custom) => (
                        <Badge
                          key={custom}
                          variant='secondary'
                          className='gap-1 pr-1.5 text-xs'
                        >
                          <span>{custom}</span>
                          <button
                            type='button'
                            onClick={() => toggleCategory(custom)}
                            className='hover:text-destructive cursor-pointer rounded-full p-0.5'
                            aria-label={`Xóa danh mục ${custom}`}
                          >
                            <XIcon className='size-3' aria-hidden='true' />
                          </button>
                        </Badge>
                      ))}
                  </div>
                  <div className='flex max-w-sm gap-2 pt-1'>
                    <Input
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          addCustomCategory()
                        }
                      }}
                      placeholder={t(
                        'events.form.customCategoryPlaceholder',
                        'Thêm danh mục khác...'
                      )}
                      className='h-8 text-xs'
                    />
                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      onClick={addCustomCategory}
                      className='h-8 shrink-0 cursor-pointer text-xs'
                    >
                      <PlusIcon className='mr-1 size-3.5' aria-hidden='true' />
                      {t('buttons.add', 'Thêm')}
                    </Button>
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name='description'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required className='text-xs font-semibold'>
                        {t('events.form.eventDescription', 'Mô tả sự kiện')}
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          rows={5}
                          placeholder={t(
                            'events.form.descriptionPlaceholder',
                            'Giới thiệu chi tiết nội dung sự kiện, hoạt động nổi bật, khách mời và lưu ý cho người tham dự...'
                          )}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Card 2: Time & Schedule */}
            <Card className='border-border/80'>
              <CardHeader>
                <CardTitle className='text-base font-semibold'>
                  {t('events.form.scheduleSection', 'Thời gian & Lịch trình')}
                </CardTitle>
                <CardDescription className='text-xs'>
                  {t(
                    'events.form.scheduleDesc',
                    'Thiết lập thời gian diễn ra chính xác và các mốc hoạt động trong ngày.'
                  )}
                </CardDescription>
              </CardHeader>

              <CardContent className='space-y-6'>
                <div className='grid gap-4 sm:grid-cols-2'>
                  {/* Start Date + Time */}
                  <div className='space-y-2'>
                    <FormField
                      control={form.control}
                      name='startAt'
                      render={() => (
                        <FormItem>
                          <FormLabel required className='text-xs font-semibold'>
                            {t('events.form.startDate', 'Bắt đầu')}
                          </FormLabel>
                          <div className='flex gap-2'>
                            <Popover
                              open={startOpen}
                              onOpenChange={setStartOpen}
                            >
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    type='button'
                                    variant='outline'
                                    className={cn(
                                      'flex-1 justify-start text-left font-normal tabular-nums',
                                      !startDate && 'text-muted-foreground'
                                    )}
                                  >
                                    <CalendarIcon className='mr-2 size-4 opacity-70' />
                                    {format(startDate, 'dd/MM/yyyy')}
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent
                                className='w-auto p-0'
                                align='start'
                              >
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
                                    syncDates(
                                      date,
                                      adjustedEnd,
                                      startTime,
                                      endTime
                                    )
                                    setStartOpen(false)
                                  }}
                                />
                              </PopoverContent>
                            </Popover>
                            <Input
                              type='time'
                              value={startTime}
                              onChange={(e) => {
                                const val = e.target.value || '09:00'
                                setStartTime(val)
                                syncDates(startDate, endDate, val, endTime)
                              }}
                              className='w-28 font-mono tabular-nums'
                              aria-label={t(
                                'events.form.startTimeLabel',
                                'Start time'
                              )}
                            />
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* End Date + Time */}
                  <div className='space-y-2'>
                    <FormField
                      control={form.control}
                      name='endAt'
                      render={() => (
                        <FormItem>
                          <div className='flex items-center justify-between'>
                            <FormLabel className='text-xs font-semibold'>
                              {t('events.form.endDate', 'Kết thúc')}
                            </FormLabel>
                            {endDate && (
                              <button
                                type='button'
                                onClick={() => {
                                  setEndDate(undefined)
                                  syncDates(
                                    startDate,
                                    undefined,
                                    startTime,
                                    endTime
                                  )
                                }}
                                className='text-muted-foreground hover:text-foreground cursor-pointer text-[11px] underline'
                              >
                                {t('events.form.clearEnd', 'Cùng ngày')}
                              </button>
                            )}
                          </div>
                          <div className='flex gap-2'>
                            <Popover open={endOpen} onOpenChange={setEndOpen}>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    type='button'
                                    variant='outline'
                                    className={cn(
                                      'flex-1 justify-start text-left font-normal tabular-nums',
                                      !endDate && 'text-muted-foreground'
                                    )}
                                  >
                                    <CalendarIcon className='mr-2 size-4 opacity-70' />
                                    {endDate
                                      ? format(endDate, 'dd/MM/yyyy')
                                      : format(startDate, 'dd/MM/yyyy')}
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent
                                className='w-auto p-0'
                                align='start'
                              >
                                <Calendar
                                  mode='single'
                                  captionLayout='dropdown'
                                  selected={endDate ?? startDate}
                                  onSelect={(date) => {
                                    setEndDate(date)
                                    syncDates(
                                      startDate,
                                      date,
                                      startTime,
                                      endTime
                                    )
                                    setEndOpen(false)
                                  }}
                                  disabled={(date) =>
                                    date <
                                    new Date(
                                      startDate.getFullYear(),
                                      startDate.getMonth(),
                                      startDate.getDate()
                                    )
                                  }
                                />
                              </PopoverContent>
                            </Popover>
                            <Input
                              type='time'
                              value={endTime}
                              onChange={(e) => {
                                const val = e.target.value || '21:00'
                                setEndTime(val)
                                syncDates(startDate, endDate, startTime, val)
                              }}
                              className='w-28 font-mono tabular-nums'
                              aria-label={t(
                                'events.form.endTimeLabel',
                                'End time'
                              )}
                            />
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Date Preview Strip */}
                <div className='bg-muted/40 border-border/60 flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3.5 py-2.5 text-xs'>
                  <span className='text-muted-foreground'>
                    {t('events.form.autoPreview', 'Hiển thị dự kiến:')}
                  </span>
                  <span className='text-foreground font-mono font-semibold tabular-nums'>
                    {datePreviewText}
                  </span>
                </div>

                {/* Dynamic Schedule Timeline Builder */}
                <div className='border-border/60 space-y-3 border-t pt-4'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <Label className='text-xs font-semibold'>
                        {t(
                          'events.form.timelineItems',
                          'Lịch trình hoạt động chi tiết'
                        )}
                      </Label>
                      <p className='text-muted-foreground text-xs'>
                        {t(
                          'events.form.timelineHelp',
                          'Hiển thị theo mốc giờ trên trang chi tiết sự kiện'
                        )}
                      </p>
                    </div>
                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      onClick={() => append({ time: '09:00', activity: '' })}
                      className='cursor-pointer gap-1.5 text-xs'
                    >
                      <PlusIcon className='size-3.5' aria-hidden='true' />
                      <span>
                        {t('events.form.addScheduleItem', 'Thêm mốc giờ')}
                      </span>
                    </Button>
                  </div>

                  {scheduleFields.length === 0 ? (
                    <div className='border-border/60 bg-muted/20 rounded-lg border border-dashed px-4 py-6 text-center text-xs'>
                      <p className='text-muted-foreground'>
                        {t(
                          'events.form.emptySchedule',
                          'Chưa có mốc lịch trình nào. Nhấn "Thêm mốc giờ" để tạo timeline cho sự kiện.'
                        )}
                      </p>
                    </div>
                  ) : (
                    <div className='space-y-2.5'>
                      {scheduleFields.map((fieldItem, index) => (
                        <div
                          key={fieldItem.id}
                          className='flex items-start gap-2'
                        >
                          <FormField
                            control={form.control}
                            name={`schedule.${index}.time`}
                            render={({ field }) => (
                              <FormItem className='w-28 shrink-0'>
                                <FormControl>
                                  <Input
                                    placeholder='09:00'
                                    className='font-mono text-xs tabular-nums'
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`schedule.${index}.activity`}
                            render={({ field }) => (
                              <FormItem className='flex-1'>
                                <FormControl>
                                  <Input
                                    placeholder={t(
                                      'events.form.activityPlaceholder',
                                      'Nội dung hoạt động (VD: Khai mạc & check-in)'
                                    )}
                                    className='text-xs'
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button
                            type='button'
                            variant='ghost'
                            size='icon'
                            onClick={() => remove(index)}
                            className='text-muted-foreground hover:text-destructive size-9 shrink-0 cursor-pointer'
                            aria-label={t('buttons.delete', 'Xóa')}
                          >
                            <Trash2Icon className='size-4' aria-hidden='true' />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Governance & Media Column (4 Cols) */}
          <div className='space-y-6 lg:col-span-4'>
            {/* Card 3: Status & Visibility */}
            <Card className='border-border/80'>
              <CardHeader>
                <CardTitle className='text-base font-semibold'>
                  {t('events.form.governanceSection', 'Trạng thái & Hiển thị')}
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <FormField
                  control={form.control}
                  name='status'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-xs font-semibold'>
                        {t('events.columns.status', 'Trạng thái sự kiện')}
                      </FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger className='w-full'>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value='upcoming'>
                            {t('events.status.upcomingOption', 'Sắp diễn ra')}
                          </SelectItem>
                          <SelectItem value='ongoing'>
                            {t('events.status.ongoingOption', 'Đang diễn ra')}
                          </SelectItem>
                          <SelectItem value='completed'>
                            {t('events.status.completedOption', 'Đã kết thúc')}
                          </SelectItem>
                          <SelectItem value='cancelled'>
                            {t('events.status.cancelledOption', 'Đã hủy')}
                          </SelectItem>
                          <SelectItem value='draft'>
                            {t(
                              'events.status.draftOption',
                              'Bản nháp (ẩn công khai)'
                            )}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription className='text-xs'>
                        {t(
                          'events.form.draftHelp',
                          'Sự kiện ở trạng thái Bản nháp sẽ không xuất hiện trên website công khai.'
                        )}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='isFeaturedFestival'
                  render={({ field }) => (
                    <FormItem className='border-border/70 flex items-center justify-between rounded-lg border p-3'>
                      <div className='space-y-0.5 pr-2'>
                        <FormLabel className='text-xs font-semibold'>
                          {t('events.form.isFeatured', 'Festival tiêu điểm')}
                        </FormLabel>
                        <p className='text-muted-foreground text-[11px]'>
                          {t(
                            'events.form.isFeaturedHelp',
                            'Hiển thị nổi bật tại Hero Banner trên trang Sự kiện'
                          )}
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
                    <FormItem className='border-border/70 flex items-center justify-between rounded-lg border p-3'>
                      <div className='space-y-0.5 pr-2'>
                        <FormLabel className='text-xs font-semibold'>
                          {t('events.form.isRecruiting', 'Mở đơn ứng tuyển')}
                        </FormLabel>
                        <p className='text-muted-foreground text-[11px]'>
                          {t(
                            'events.form.isRecruitingHelp',
                            'Cho phép Cosplayer / Guest / Artist gửi đơn đăng ký'
                          )}
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
              </CardContent>
            </Card>

            {/* Card 4: Ticket Pricing */}
            <Card className='border-border/80'>
              <CardHeader>
                <CardTitle className='text-base font-semibold'>
                  {t('events.form.ticketSection', 'Vé vào cổng')}
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='space-y-2'>
                  <Label className='text-xs font-semibold'>
                    {t('events.form.ticketMode', 'Hình thức vé')}
                  </Label>
                  <Select
                    value={ticketMode}
                    onValueChange={(val: 'paid' | 'free') => {
                      setTicketMode(val)
                      if (val === 'free') {
                        form.setValue('ticketPriceAmount', 0)
                      } else {
                        const currentAmount =
                          form.getValues('ticketPriceAmount') || 100000
                        form.setValue('ticketPriceAmount', currentAmount)
                      }
                    }}
                  >
                    <SelectTrigger className='w-full'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='free'>
                        {t('events.form.ticketFree', 'Miễn phí vào cổng')}
                      </SelectItem>
                      <SelectItem value='paid'>
                        {t('events.form.ticketPaid', 'Có bán vé')}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {ticketMode === 'paid' && (
                  <FormField
                    control={form.control}
                    name='ticketPriceAmount'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='text-xs font-semibold'>
                          {t('events.form.ticketPrice', 'Giá vé từ (VNĐ)')}
                        </FormLabel>
                        <FormControl>
                          <Input
                            type='number'
                            min={0}
                            step={10000}
                            className='font-mono tabular-nums'
                            value={field.value ?? 0}
                            onChange={(e) => {
                              const amount = Math.max(
                                0,
                                Number(e.target.value) || 0
                              )
                              field.onChange(amount)
                            }}
                          />
                        </FormControl>
                        <div className='flex flex-wrap gap-1.5 pt-1'>
                          {TICKET_PRICE_PRESETS.map((preset) => (
                            <Button
                              key={preset}
                              type='button'
                              variant='outline'
                              size='sm'
                              onClick={() => field.onChange(preset)}
                              className='h-6 cursor-pointer px-2 font-mono text-[11px] tabular-nums'
                            >
                              {preset.toLocaleString('vi-VN')}đ
                            </Button>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </CardContent>
            </Card>

            {/* Card 5: Media Assets */}
            <Card className='border-border/80'>
              <CardHeader>
                <CardTitle className='text-base font-semibold'>
                  {t('events.form.mediaSection', 'Hình ảnh truyền thông')}
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-6'>
                <FormField
                  control={form.control}
                  name='imageUrl'
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormControl>
                        <ImagePickerInput
                          label={t(
                            'events.fields.imageUrl',
                            'Ảnh Poster / Card (4:3 hoặc 16:10)'
                          )}
                          required
                          value={field.value || ''}
                          onChange={field.onChange}
                          error={fieldState.error?.message}
                          placeholder='https://...'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='bannerImageUrl'
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormControl>
                        <ImagePickerInput
                          label={t(
                            'events.fields.bannerImageUrl',
                            'Ảnh Hero Banner rộng (Tùy chọn, 16:9)'
                          )}
                          value={field.value || ''}
                          onChange={field.onChange}
                          error={fieldState.error?.message}
                          placeholder='https://...'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        <FormActions footer>{pageActions}</FormActions>
      </form>
    </Form>
  )
}
