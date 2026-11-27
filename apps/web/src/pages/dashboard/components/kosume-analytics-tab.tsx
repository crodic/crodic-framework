import * as React from 'react'
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  Clock,
  Image as ImageIcon,
  ShieldAlert,
  ShieldCheck,
  Star,
  Users,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from 'recharts'
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
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { Skeleton } from '@/components/ui/skeleton'
import { useAnalyticsOverview } from '../queries'

export function KosumeAnalyticsTab() {
  const { t } = useTranslation()
  const { data, isLoading } = useAnalyticsOverview()

  const kpi = React.useMemo(
    () =>
      data?.kpi || {
        totalUsers: 0,
        verifiedUsers: 0,
        totalCosplayers: 0,
        verifiedCosplayers: 0,
        totalPosts: 0,
        featuredPosts: 0,
        totalEvents: 0,
        activeEvents: 0,
        pendingReports: 0,
        pendingPosts: 0,
      },
    [data?.kpi]
  )

  const overviewChartConfig = React.useMemo<ChartConfig>(
    () => ({
      total: {
        label: t('dashboard.kosume.chartSeriesTotal', 'Tổng số lượng'),
        color: 'var(--chart-1)',
      },
      highlighted: {
        label: t(
          'dashboard.kosume.chartSeriesHighlighted',
          'Đã xác minh / Nổi bật / Đang mở'
        ),
        color: 'var(--chart-2)',
      },
    }),
    [t]
  )

  const overviewChartData = React.useMemo(
    () => [
      {
        metric: t('dashboard.kosume.totalUsers', 'Người dùng & Fan'),
        total: kpi.totalUsers,
        highlighted: kpi.verifiedUsers,
      },
      {
        metric: t('dashboard.kosume.cosplayers', 'Cosplayers Nền tảng'),
        total: kpi.totalCosplayers,
        highlighted: kpi.verifiedCosplayers,
      },
      {
        metric: t('dashboard.kosume.posts', 'Tác phẩm & Bộ ảnh'),
        total: kpi.totalPosts,
        highlighted: kpi.featuredPosts,
      },
      {
        metric: t('dashboard.kosume.events', 'Sự kiện & Lễ hội'),
        total: kpi.totalEvents,
        highlighted: kpi.activeEvents,
      },
    ],
    [kpi, t]
  )

  if (isLoading) {
    return (
      <div className='space-y-4 pt-2'>
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className='h-28 rounded-lg' />
          ))}
        </div>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className='h-36 rounded-lg' />
          ))}
        </div>
        <div className='grid grid-cols-1 gap-4 lg:grid-cols-12'>
          <Skeleton className='h-80 rounded-lg lg:col-span-7' />
          <Skeleton className='h-80 rounded-lg lg:col-span-5' />
        </div>
      </div>
    )
  }

  const postCategories = data?.postCategories || []

  return (
    <div className='space-y-6 pt-2'>
      {/* 1. Main KPI Cards */}
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        {/* Total Users */}
        <Card className='border-border/70 shadow-xs'>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-muted-foreground text-sm font-medium'>
              {t('dashboard.kosume.totalUsers', 'Người dùng & Fan')}
            </CardTitle>
            <Users className='text-primary size-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{kpi.totalUsers}</div>
            <p className='text-muted-foreground mt-1 text-xs'>
              {t(
                'dashboard.kosume.totalUsersSub',
                'Tổng thành viên hoạt động trên nền tảng'
              )}
            </p>
          </CardContent>
        </Card>

        {/* Cosplayers */}
        <Card className='border-border/70 shadow-xs'>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-muted-foreground text-sm font-medium'>
              {t('dashboard.kosume.cosplayers', 'Cosplayers Nền tảng')}
            </CardTitle>
            <Users className='text-primary size-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{kpi.totalCosplayers}</div>
            <p className='text-muted-foreground mt-1 flex items-center gap-1 text-xs'>
              <ShieldCheck className='text-primary size-3' />
              <span>
                {t('dashboard.kosume.verifiedCosplayersSub', {
                  count: kpi.verifiedCosplayers,
                  defaultValue: '{{count}} cosplayer đã xác minh',
                })}
              </span>
            </p>
          </CardContent>
        </Card>

        {/* Posts & Albums */}
        <Card className='border-border/70 shadow-xs'>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-muted-foreground text-sm font-medium'>
              {t('dashboard.kosume.posts', 'Tác phẩm & Bộ ảnh')}
            </CardTitle>
            <ImageIcon className='text-primary size-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{kpi.totalPosts}</div>
            <p className='text-muted-foreground mt-1 flex items-center gap-1 text-xs'>
              <Star className='text-primary size-3' />
              <span>
                {t('dashboard.kosume.featuredPostsSub', {
                  count: kpi.featuredPosts,
                  defaultValue: '{{count}} tác phẩm nổi bật',
                })}
              </span>
            </p>
          </CardContent>
        </Card>

        {/* Events & Festivals */}
        <Card className='border-border/70 shadow-xs'>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-muted-foreground text-sm font-medium'>
              {t('dashboard.kosume.events', 'Sự kiện & Lễ hội')}
            </CardTitle>
            <CalendarDays className='text-primary size-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{kpi.activeEvents}</div>
            <p className='text-muted-foreground mt-1 text-xs'>
              {t(
                'dashboard.kosume.activeEventsSub',
                'Sự kiện cosplay đang diễn ra & sắp mở'
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 2. Urgent Moderation & Attention Banners */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        {/* Pending Reports */}
        <Card className='border-destructive/20 bg-destructive/5 shadow-xs'>
          <CardHeader className='pb-2'>
            <div className='flex items-center justify-between'>
              <span className='text-destructive dark:text-destructive flex items-center gap-1.5 text-xs font-semibold'>
                <ShieldAlert className='size-4' />
                {t('dashboard.kosume.pendingReportsTitle', 'Báo cáo vi phạm')}
              </span>
              <Badge variant='destructive' className='text-xs'>
                {t('dashboard.kosume.pendingReportsBadge', {
                  count: kpi.pendingReports,
                  defaultValue: '{{count}} chờ duyệt',
                })}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className='space-y-3 pt-1'>
            <p className='text-muted-foreground text-xs'>
              {t(
                'dashboard.kosume.pendingReportsDesc',
                'Các nội dung bị người dùng cộng đồng tố cáo vi phạm tiêu chuẩn.'
              )}
            </p>
            <Button asChild variant='outline' size='sm' className='w-full'>
              <Link to='/content-reports'>
                {t('dashboard.kosume.pendingReportsAction', 'Xử lý tố cáo')}
                <ArrowRight className='ml-1.5 size-3.5' />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Pending Posts */}
        <Card className='border-primary/20 bg-primary/5 shadow-xs'>
          <CardHeader className='pb-2'>
            <div className='flex items-center justify-between'>
              <span className='text-primary dark:text-primary flex items-center gap-1.5 text-xs font-semibold'>
                <Clock className='size-4' />
                {t('dashboard.kosume.pendingPostsTitle', 'Bài đăng chờ duyệt')}
              </span>
              <Badge
                variant='secondary'
                className='bg-primary/15 text-primary dark:text-primary text-xs'
              >
                {t('dashboard.kosume.pendingPostsBadge', {
                  count: kpi.pendingPosts,
                  defaultValue: '{{count}} bài mới',
                })}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className='space-y-3 pt-1'>
            <p className='text-muted-foreground text-xs'>
              {t(
                'dashboard.kosume.pendingPostsDesc',
                'Tác phẩm và album ảnh đang trong hàng chờ kiểm duyệt chất lượng.'
              )}
            </p>
            <Button asChild variant='outline' size='sm' className='w-full'>
              <Link to='/posts'>
                {t('dashboard.kosume.pendingPostsAction', 'Duyệt bài đăng')}
                <ArrowRight className='ml-1.5 size-3.5' />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* 3. Platform Metrics Chart & Category Distribution */}
      <div className='grid grid-cols-1 gap-4 lg:grid-cols-12'>
        {/* Overview Bar Chart */}
        <Card className='border-border/70 flex flex-col shadow-xs lg:col-span-7'>
          <CardHeader className='pb-2'>
            <CardTitle className='flex items-center gap-2 text-base font-semibold'>
              <BarChart3 className='text-primary size-4' />
              {t(
                'dashboard.kosume.overviewChartTitle',
                'Biểu đồ tổng quan chỉ số nền tảng'
              )}
            </CardTitle>
            <CardDescription>
              {t(
                'dashboard.kosume.overviewChartDesc',
                'Tương quan giữa 4 chỉ số cốt lõi: Người dùng, Cosplayers, Tác phẩm và Sự kiện'
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className='flex-1 pb-4'>
            <ChartContainer
              config={overviewChartConfig}
              className='aspect-auto h-[260px] w-full'
            >
              <BarChart
                data={overviewChartData}
                margin={{ top: 24, right: 12, left: -12, bottom: 0 }}
              >
                <CartesianGrid
                  vertical={false}
                  strokeDasharray='3 3'
                  className='stroke-border/40'
                />
                <XAxis
                  dataKey='metric'
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  className='text-xs font-medium'
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  allowDecimals={false}
                  className='text-muted-foreground text-xs'
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      indicator='dashed'
                      className='w-52 shadow-lg'
                    />
                  }
                />
                <ChartLegend
                  content={<ChartLegendContent />}
                  className='mt-2 flex-wrap gap-4 text-xs'
                />
                <Bar
                  dataKey='total'
                  fill='var(--color-total)'
                  radius={[6, 6, 0, 0]}
                >
                  <LabelList
                    dataKey='total'
                    position='top'
                    offset={6}
                    className='fill-foreground text-[11px] font-medium'
                  />
                </Bar>
                <Bar
                  dataKey='highlighted'
                  fill='var(--color-highlighted)'
                  radius={[6, 6, 0, 0]}
                >
                  <LabelList
                    dataKey='highlighted'
                    position='top'
                    offset={6}
                    className='fill-foreground text-[11px] font-medium'
                  />
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Album Categories */}
        <Card className='border-border/70 shadow-xs lg:col-span-5'>
          <CardHeader>
            <CardTitle className='text-base font-semibold'>
              {t(
                'dashboard.kosume.categoriesTitle',
                'Phân bổ thể loại bài đăng (Categories)'
              )}
            </CardTitle>
            <CardDescription>
              {t(
                'dashboard.kosume.categoriesDesc',
                'Tỷ trọng các nhóm nội dung và bộ ảnh trên hệ thống'
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {postCategories.length === 0 ? (
              <p className='text-muted-foreground py-8 text-center text-xs'>
                {t(
                  'dashboard.kosume.categoriesEmpty',
                  'Chưa có dữ liệu bài đăng'
                )}
              </p>
            ) : (
              <div className='space-y-3'>
                {postCategories.map((c) => (
                  <div
                    key={c.category}
                    className='border-border/50 bg-muted/20 flex items-center justify-between rounded-lg border px-3 py-2 text-xs'
                  >
                    <span className='font-medium capitalize'>{c.category}</span>
                    <Badge variant='outline'>
                      {t('dashboard.kosume.categoriesCount', {
                        count: c.count,
                        defaultValue: '{{count}} bài',
                      })}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
