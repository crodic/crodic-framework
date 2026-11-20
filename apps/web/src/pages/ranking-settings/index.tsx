import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Calculator,
  CheckCircle2,
  Clock,
  Flame,
  RefreshCw,
  Save,
  Trophy,
  Users,
  Zap,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useBreadcrumb } from '@/hooks/use-breadcrumb'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
import { Switch } from '@/components/ui/switch'
import { Main } from '@/components/layout/main'
import { PageHeader } from '@/components/layout/page-shell'
import {
  apiTriggerRankingRecalculate,
  apiUpdateRankingSettings,
  RANKING_PREVIEW_QUERY_KEY,
  RANKING_SETTINGS_QUERY_KEY,
  useRankingPreview,
  useRankingSettings,
} from './queries'
import {
  rankingSettingsFormSchema,
  type RankingSettingsFormValues,
} from './schema'

export function PageRankingSettings() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  useBreadcrumb([
    { title: t('navigation.kosume.title', 'Quản trị Kosume') },
    { title: t('navigation.kosume.ranking', 'Cấu hình Bảng xếp hạng') },
  ])

  const { data: settings, isLoading } = useRankingSettings()
  const { data: previewList = [], isLoading: isLoadingPreview } =
    useRankingPreview()

  const form = useForm<RankingSettingsFormValues>({
    resolver: zodResolver(rankingSettingsFormSchema),
    defaultValues: {
      likesWeight: 2,
      followersWeight: 5,
      enableCronJob: true,
      enableFallbackRealtime: true,
    },
  })

  useEffect(() => {
    if (settings) {
      form.reset({
        likesWeight: settings.likesWeight,
        followersWeight: settings.followersWeight,
        enableCronJob: settings.enableCronJob,
        enableFallbackRealtime: settings.enableFallbackRealtime,
      })
    }
  }, [settings, form])

  const watchedLikesWeight = form.watch('likesWeight') || 2
  const watchedFollowersWeight = form.watch('followersWeight') || 5

  const updateMutation = useMutation({
    mutationFn: apiUpdateRankingSettings,
    onSuccess: (data) => {
      queryClient.setQueryData(RANKING_SETTINGS_QUERY_KEY, data)
      queryClient.invalidateQueries({ queryKey: RANKING_PREVIEW_QUERY_KEY })
      toast.success(
        t(
          'rankingSettings.messages.saved',
          'Lưu cấu hình bảng xếp hạng thành công'
        )
      )
    },
    onError: () => {
      toast.error(
        t(
          'rankingSettings.messages.error',
          'Không thể lưu cấu hình bảng xếp hạng'
        )
      )
    },
  })

  const recalculateMutation = useMutation({
    mutationFn: apiTriggerRankingRecalculate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RANKING_SETTINGS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: RANKING_PREVIEW_QUERY_KEY })
      toast.success(
        t(
          'rankingSettings.messages.recalculated',
          'Đã chụp snapshot và tính toán lại bảng xếp hạng thành công!'
        )
      )
    },
    onError: () => {
      toast.error(
        t(
          'rankingSettings.messages.recalculateError',
          'Lỗi khi tính toán lại bảng xếp hạng'
        )
      )
    },
  })

  const onSubmit = (values: RankingSettingsFormValues) => {
    updateMutation.mutate(values)
  }

  const handleTriggerRecalculate = () => {
    recalculateMutation.mutate()
  }

  return (
    <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
      <PageHeader
        title={
          <div className='flex items-center gap-2'>
            <Trophy className='text-primary size-6' />
            <span>
              {t(
                'navigation.kosume.ranking',
                'Cấu hình Bảng Xếp Hạng & Tự động hóa'
              )}
            </span>
          </div>
        }
        description={t(
          'rankingSettings.subtitle',
          'Điều chỉnh trọng số tính điểm động cho Cosplayer, quản lý Cron Job snapshot định kỳ và dự phòng Real-time.'
        )}
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
          <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
            {/* 1. Công thức tính điểm động */}
            <Card className='border-border/80 shadow-xs'>
              <CardHeader>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <div className='bg-primary/10 text-primary flex size-8 items-center justify-center rounded-lg'>
                      <Calculator className='size-4' />
                    </div>
                    <div>
                      <CardTitle className='text-base font-bold'>
                        {t(
                          'rankingSettings.formulaTitle',
                          'Công thức Tính điểm Động'
                        )}
                      </CardTitle>
                      <CardDescription className='text-xs'>
                        {t(
                          'rankingSettings.formulaDesc',
                          'Hệ số nhân áp dụng cho lượt tương tác của Cosplayer'
                        )}
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className='space-y-5'>
                {/* Visual Formula Badge */}
                <div className='bg-muted/40 border-border/60 flex flex-col items-center justify-center gap-1 rounded-xl border p-3 text-center'>
                  <span className='text-muted-foreground text-xs font-medium'>
                    {t('rankingSettings.currentFormula', 'Công thức hiện tại')}
                  </span>
                  <div className='text-foreground flex flex-wrap items-center justify-center gap-2 text-sm font-bold'>
                    <span className='text-primary'>Điểm Xếp Hạng</span>
                    <span>=</span>
                    <Badge variant='outline' className='gap-1 font-semibold'>
                      <Flame className='size-3 text-orange-500' />
                      Likes × {watchedLikesWeight}
                    </Badge>
                    <span>+</span>
                    <Badge variant='outline' className='gap-1 font-semibold'>
                      <Users className='size-3 text-blue-500' />
                      Followers × {watchedFollowersWeight}
                    </Badge>
                  </div>
                </div>

                <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                  {/* Likes Weight */}
                  <FormField
                    control={form.control}
                    name='likesWeight'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='text-xs font-semibold'>
                          {t('rankingSettings.likesWeight', 'Hệ số Lượt Thích')}
                        </FormLabel>
                        <FormControl>
                          <Input
                            type='number'
                            min={0}
                            max={100}
                            step={0.5}
                            disabled={isLoading}
                            value={field.value}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormDescription className='text-[11px]'>
                          {t(
                            'rankingSettings.likesWeightDesc',
                            'Số điểm nhân cho mỗi lượt thích (Mặc định: 2)'
                          )}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Followers Weight */}
                  <FormField
                    control={form.control}
                    name='followersWeight'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='text-xs font-semibold'>
                          {t(
                            'rankingSettings.followersWeight',
                            'Hệ số Lượt Theo Dõi'
                          )}
                        </FormLabel>
                        <FormControl>
                          <Input
                            type='number'
                            min={0}
                            max={100}
                            step={0.5}
                            disabled={isLoading}
                            value={field.value}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormDescription className='text-[11px]'>
                          {t(
                            'rankingSettings.followersWeightDesc',
                            'Số điểm nhân cho mỗi follower (Mặc định: 5)'
                          )}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* 2. Tự động hóa & Cron Job */}
            <Card className='border-border/80 shadow-xs'>
              <CardHeader>
                <div className='flex items-center gap-2'>
                  <div className='bg-primary/10 text-primary flex size-8 items-center justify-center rounded-lg'>
                    <Clock className='size-4' />
                  </div>
                  <div>
                    <CardTitle className='text-base font-bold'>
                      {t(
                        'rankingSettings.cronTitle',
                        'Tự động hóa Snapshot & Cron Job'
                      )}
                    </CardTitle>
                    <CardDescription className='text-xs'>
                      {t(
                        'rankingSettings.cronDesc',
                        'Cấu hình tiến trình chụp snapshot thứ hạng định kỳ'
                      )}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className='space-y-4'>
                {/* Enable Cron Job Switch */}
                <FormField
                  control={form.control}
                  name='enableCronJob'
                  render={({ field }) => (
                    <FormItem className='border-border/60 flex flex-row items-center justify-between rounded-xl border p-3'>
                      <div className='space-y-0.5'>
                        <FormLabel className='text-xs font-bold'>
                          {t(
                            'rankingSettings.enableCronJob',
                            'Kích hoạt Cron Job Tự Động'
                          )}
                        </FormLabel>
                        <FormDescription className='text-[11px]'>
                          {t(
                            'rankingSettings.cronJobScheduleInfo',
                            'Tự động chạy vào 00:00 Thứ Hai hàng tuần & ngày mùng 1 hàng tháng'
                          )}
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isLoading}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* Enable Realtime Fallback Switch */}
                <FormField
                  control={form.control}
                  name='enableFallbackRealtime'
                  render={({ field }) => (
                    <FormItem className='border-border/60 flex flex-row items-center justify-between rounded-xl border p-3'>
                      <div className='space-y-0.5'>
                        <FormLabel className='text-xs font-bold'>
                          {t(
                            'rankingSettings.enableFallbackRealtime',
                            'Fallback Tính Điểm Thời Gian Thực'
                          )}
                        </FormLabel>
                        <FormDescription className='text-[11px]'>
                          {t(
                            'rankingSettings.fallbackInfo',
                            'Tự tính từ database nếu chưa có snapshot để bảng xếp hạng không bao giờ bị rỗng'
                          )}
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isLoading}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* Trigger Snapshot Now Section */}
                <div className='bg-muted/20 border-border/60 flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3'>
                  <div>
                    <span className='text-muted-foreground block text-[11px]'>
                      {t(
                        'rankingSettings.lastRun',
                        'Lần chạy snapshot gần nhất'
                      )}
                      :{' '}
                      <strong className='text-foreground font-semibold'>
                        {settings?.lastSnapshotAt
                          ? new Date(settings.lastSnapshotAt).toLocaleString()
                          : t('rankingSettings.neverRun', 'Chưa chạy')}
                      </strong>
                    </span>
                  </div>

                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={handleTriggerRecalculate}
                    disabled={recalculateMutation.isPending}
                    className='cursor-pointer gap-1.5 rounded-lg text-xs font-semibold'
                  >
                    <RefreshCw
                      className={`size-3.5 ${
                        recalculateMutation.isPending ? 'animate-spin' : ''
                      }`}
                    />
                    <span>
                      {recalculateMutation.isPending
                        ? t('rankingSettings.running', 'Đang tính toán...')
                        : t('rankingSettings.runNow', 'Chạy Snapshot Ngay')}
                    </span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 3. Live Preview Bảng Xếp Hạng */}
          <Card className='border-border/80 shadow-xs'>
            <CardHeader>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <div className='bg-primary/10 text-primary flex size-8 items-center justify-center rounded-lg'>
                    <Zap className='size-4' />
                  </div>
                  <div>
                    <CardTitle className='text-base font-bold'>
                      {t(
                        'rankingSettings.previewTitle',
                        'Xem trước Bảng Điểm Thực tế'
                      )}
                    </CardTitle>
                    <CardDescription className='text-xs'>
                      {t(
                        'rankingSettings.previewDesc',
                        'Top Cosplayer được tính toán trực tiếp từ database theo công thức'
                      )}
                    </CardDescription>
                  </div>
                </div>

                <Badge variant='secondary' className='text-xs font-semibold'>
                  {previewList.length} Cosplayers
                </Badge>
              </div>
            </CardHeader>

            <CardContent>
              {isLoadingPreview ? (
                <div className='flex min-h-[160px] items-center justify-center'>
                  <RefreshCw className='text-primary size-6 animate-spin' />
                </div>
              ) : previewList.length === 0 ? (
                <div className='text-muted-foreground py-8 text-center text-xs'>
                  {t(
                    'rankingSettings.noPreview',
                    'Chưa có hồ sơ Cosplayer nào trong hệ thống'
                  )}
                </div>
              ) : (
                <div className='divide-border/60 divide-y'>
                  {previewList.slice(0, 5).map((item) => {
                    const dynamicScore =
                      item.likesCount * watchedLikesWeight +
                      item.followersCount * watchedFollowersWeight

                    return (
                      <div
                        key={item.id || item.handle}
                        className='flex items-center justify-between py-3 text-xs'
                      >
                        <div className='flex items-center gap-3'>
                          <span
                            className={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                              item.rank === 1
                                ? 'bg-amber-500/20 text-amber-500'
                                : item.rank === 2
                                  ? 'bg-slate-300/20 text-slate-400'
                                  : item.rank === 3
                                    ? 'bg-amber-700/20 text-amber-600'
                                    : 'text-muted-foreground'
                            }`}
                          >
                            #{item.rank}
                          </span>

                          <Avatar className='size-8 border'>
                            <AvatarImage
                              src={item.avatarUrl}
                              alt={item.displayName}
                            />
                            <AvatarFallback>
                              {item.displayName?.slice(0, 1) || 'C'}
                            </AvatarFallback>
                          </Avatar>

                          <div>
                            <div className='flex items-center gap-1 font-bold'>
                              <span>{item.displayName}</span>
                              {item.isVerified && (
                                <CheckCircle2 className='text-primary size-3' />
                              )}
                            </div>
                            <span className='text-muted-foreground text-[10px]'>
                              {item.handle} • {item.roleLabel}
                            </span>
                          </div>
                        </div>

                        <div className='flex items-center gap-4 text-right'>
                          <div className='text-[11px]'>
                            <span className='text-muted-foreground'>
                              {item.likesCount.toLocaleString()} likes •{' '}
                              {item.followersCount.toLocaleString()} followers
                            </span>
                          </div>

                          <div className='min-w-[90px]'>
                            <span className='text-primary text-sm font-extrabold'>
                              {Math.round(dynamicScore).toLocaleString()}{' '}
                              <span className='text-[10px] font-normal'>
                                pts
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Form Submit Button */}
          <div className='flex justify-end pt-2'>
            <Button
              type='submit'
              disabled={updateMutation.isPending}
              className='cursor-pointer gap-2 rounded-xl px-6 font-semibold shadow-xs'
            >
              <Save className='size-4' />
              <span>
                {updateMutation.isPending
                  ? t('common.saving', 'Đang lưu...')
                  : t('common.saveSettings', 'Lưu Cài Đặt')}
              </span>
            </Button>
          </div>
        </form>
      </Form>
    </Main>
  )
}
export default PageRankingSettings
