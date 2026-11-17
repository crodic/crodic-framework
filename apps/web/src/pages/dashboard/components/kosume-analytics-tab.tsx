import {
  ArrowRight,
  Briefcase,
  CalendarDays,
  CheckCircle2,
  Clock,
  Handshake,
  Image as ImageIcon,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useAnalyticsOverview } from '../queries'

export function KosumeAnalyticsTab() {
  const { t } = useTranslation()
  const { data, isLoading } = useAnalyticsOverview()

  if (isLoading) {
    return (
      <div className='space-y-4 pt-2'>
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className='h-28 rounded-lg' />
          ))}
        </div>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className='h-36 rounded-lg' />
          ))}
        </div>
      </div>
    )
  }

  const kpi = data?.kpi || {
    totalUsers: 0,
    totalCosplayers: 0,
    verifiedCosplayers: 0,
    totalPosts: 0,
    featuredPosts: 0,
    totalBookings: 0,
    completedBookings: 0,
    activeEvents: 0,
    openJobs: 0,
    pendingReports: 0,
    pendingPosts: 0,
    pendingBookings: 0,
  }

  const postCategories = data?.postCategories || []
  const bookingStatuses = data?.bookingStatuses || []

  return (
    <div className='space-y-6 pt-2'>
      {/* 1. Main KPI Cards */}
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
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
              <ShieldCheck className='size-3 text-sky-500' />
              <span>{kpi.verifiedCosplayers} cosplayer đã xác minh</span>
            </p>
          </CardContent>
        </Card>

        {/* Posts & Albums */}
        <Card className='border-border/70 shadow-xs'>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-muted-foreground text-sm font-medium'>
              {t('dashboard.kosume.posts', 'Tác phẩm & Bộ ảnh')}
            </CardTitle>
            <ImageIcon className='size-4 text-emerald-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{kpi.totalPosts}</div>
            <p className='text-muted-foreground mt-1 flex items-center gap-1 text-xs'>
              <Sparkles className='size-3 text-amber-500' />
              <span>{kpi.featuredPosts} tác phẩm nổi bật</span>
            </p>
          </CardContent>
        </Card>

        {/* Bookings & Deals */}
        <Card className='border-border/70 shadow-xs'>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-muted-foreground text-sm font-medium'>
              {t('dashboard.kosume.bookings', 'Hợp đồng Booking')}
            </CardTitle>
            <Handshake className='size-4 text-blue-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{kpi.totalBookings}</div>
            <p className='text-muted-foreground mt-1 flex items-center gap-1 text-xs'>
              <CheckCircle2 className='size-3 text-emerald-500' />
              <span>{kpi.completedBookings} giao dịch hoàn tất</span>
            </p>
          </CardContent>
        </Card>

        {/* Events & Casting */}
        <Card className='border-border/70 shadow-xs'>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-muted-foreground text-sm font-medium'>
              {t('dashboard.kosume.eventsAndJobs', 'Sự kiện & Casting')}
            </CardTitle>
            <CalendarDays className='size-4 text-purple-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{kpi.activeEvents}</div>
            <p className='text-muted-foreground mt-1 flex items-center gap-1 text-xs'>
              <Briefcase className='size-3 text-purple-500' />
              <span>{kpi.openJobs} tin tuyển dụng đang mở</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 2. Urgent Moderation & Attention Banners */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
        {/* Pending Reports */}
        <Card className='border-rose-500/20 bg-rose-500/5 shadow-xs'>
          <CardHeader className='pb-2'>
            <div className='flex items-center justify-between'>
              <span className='flex items-center gap-1.5 text-xs font-semibold text-rose-700 dark:text-rose-400'>
                <ShieldAlert className='size-4' />
                Báo cáo vi phạm
              </span>
              <Badge variant='destructive' className='text-xs'>
                {kpi.pendingReports} chờ duyệt
              </Badge>
            </div>
          </CardHeader>
          <CardContent className='space-y-3 pt-1'>
            <p className='text-muted-foreground text-xs'>
              Các nội dung bị người dùng cộng đồng tố cáo vi phạm tiêu chuẩn.
            </p>
            <Button asChild variant='outline' size='sm' className='w-full'>
              <Link to='/content-reports'>
                Xử lý tố cáo
                <ArrowRight className='ml-1.5 size-3.5' />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Pending Posts */}
        <Card className='border-amber-500/20 bg-amber-500/5 shadow-xs'>
          <CardHeader className='pb-2'>
            <div className='flex items-center justify-between'>
              <span className='flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400'>
                <Clock className='size-4' />
                Bài đăng chờ duyệt
              </span>
              <Badge
                variant='secondary'
                className='bg-amber-500/15 text-xs text-amber-700 dark:text-amber-300'
              >
                {kpi.pendingPosts} bài mới
              </Badge>
            </div>
          </CardHeader>
          <CardContent className='space-y-3 pt-1'>
            <p className='text-muted-foreground text-xs'>
              Tác phẩm và album ảnh đang trong hàng chờ kiểm duyệt chất lượng.
            </p>
            <Button asChild variant='outline' size='sm' className='w-full'>
              <Link to='/posts'>
                Duyệt bài đăng
                <ArrowRight className='ml-1.5 size-3.5' />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Pending Bookings */}
        <Card className='border-blue-500/20 bg-blue-500/5 shadow-xs'>
          <CardHeader className='pb-2'>
            <div className='flex items-center justify-between'>
              <span className='flex items-center gap-1.5 text-xs font-semibold text-blue-700 dark:text-blue-400'>
                <Handshake className='size-4' />
                Hợp đồng đang chờ
              </span>
              <Badge
                variant='secondary'
                className='bg-blue-500/15 text-xs text-blue-700 dark:text-blue-300'
              >
                {kpi.pendingBookings} yêu cầu
              </Badge>
            </div>
          </CardHeader>
          <CardContent className='space-y-3 pt-1'>
            <p className='text-muted-foreground text-xs'>
              Các hợp đồng booking trực tiếp cần theo dõi tiến độ phản hồi và
              tranh chấp.
            </p>
            <Button asChild variant='outline' size='sm' className='w-full'>
              <Link to='/bookings'>
                Xem hợp đồng
                <ArrowRight className='ml-1.5 size-3.5' />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* 3. Distribution & Breakdown */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        {/* Album Categories */}
        <Card className='border-border/70 shadow-xs'>
          <CardHeader>
            <CardTitle className='text-sm font-semibold'>
              Phân bổ thể loại bài đăng (Categories)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {postCategories.length === 0 ? (
              <p className='text-muted-foreground py-4 text-center text-xs'>
                Chưa có dữ liệu bài đăng
              </p>
            ) : (
              <div className='space-y-2.5'>
                {postCategories.map((c) => (
                  <div
                    key={c.category}
                    className='flex items-center justify-between text-xs'
                  >
                    <span className='font-medium capitalize'>{c.category}</span>
                    <Badge variant='outline'>{c.count} bài</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Booking Statuses */}
        <Card className='border-border/70 shadow-xs'>
          <CardHeader>
            <CardTitle className='text-sm font-semibold'>
              Trạng thái Booking toàn sàn
            </CardTitle>
          </CardHeader>
          <CardContent>
            {bookingStatuses.length === 0 ? (
              <p className='text-muted-foreground py-4 text-center text-xs'>
                Chưa có dữ liệu giao dịch booking
              </p>
            ) : (
              <div className='space-y-2.5'>
                {bookingStatuses.map((s) => (
                  <div
                    key={s.status}
                    className='flex items-center justify-between text-xs'
                  >
                    <span className='font-medium capitalize'>{s.status}</span>
                    <Badge variant='secondary'>{s.count} hợp đồng</Badge>
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
