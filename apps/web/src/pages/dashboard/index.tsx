import axios from 'axios'
import { formatDistanceToNow } from 'date-fns'
import { useQuery } from '@tanstack/react-query'
import type { TFunction } from 'i18next'
import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  CpuIcon,
  DatabaseIcon,
  ExternalLinkIcon,
  HardDriveIcon,
  LayersIcon,
  LayoutGrid,
  RefreshCwIcon,
  ServerIcon,
  WorkflowIcon,
  XCircleIcon,
  ZapIcon,
} from 'lucide-react'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Main } from '@/components/layout/main'
import { DashboardKpiCards } from './components/dashboard-kpi-cards'
import { KosumeAnalyticsTab } from './components/kosume-analytics-tab'
import { QueueMetricsBarChart } from './components/queue-metrics-bar-chart'
import { QueueStatusDonutChart } from './components/queue-status-donut-chart'

type HealthIndicator = {
  status?: string
  [key: string]: unknown
}

type HealthCheckResponse = {
  status: 'ok' | 'error' | 'shutting_down' | string
  info?: Record<string, HealthIndicator>
  error?: Record<string, HealthIndicator>
  details?: Record<string, HealthIndicator>
}

const HEALTH_QUERY_KEY = ['system_health'] as const
const QUEUE_STATS_QUERY_KEY = ['queue_stats'] as const

type QueueStats = {
  name: string
  counts: {
    waiting: number
    active: number
    completed: number
    failed: number
    delayed: number
    paused: number
  }
}

type QueueStatsResponse = {
  bullBoardUrl: string
  queues: QueueStats[]
  updatedAt: string
}

async function apiGetSystemHealth(): Promise<HealthCheckResponse> {
  const apiUrl = new URL(import.meta.env.VITE_API_URL, window.location.origin)
  const healthUrl = `${apiUrl.origin}/health`
  const response = await axios.get<HealthCheckResponse>(healthUrl, {
    timeout: 10000,
    withCredentials: true,
    validateStatus: (status) => status < 500 || status === 503,
  })

  const data = response.data as Record<string, unknown>
  if (
    data &&
    typeof data.statusCode === 'number' &&
    data.statusCode >= 400 &&
    !data.details &&
    !data.info
  ) {
    throw new Error(
      typeof data.message === 'string' ? data.message : 'Service Unavailable'
    )
  }

  return response.data
}

async function apiGetQueueStats(): Promise<QueueStatsResponse> {
  const apiUrl = new URL(import.meta.env.VITE_API_URL, window.location.origin)
  const queuesUrl = `${apiUrl.origin}/health/queues`
  const response = await axios.get<QueueStatsResponse>(queuesUrl, {
    timeout: 10000,
    withCredentials: true,
  })

  return response.data
}

export function Dashboard() {
  const { t } = useTranslation()
  const healthQuery = useQuery({
    queryKey: HEALTH_QUERY_KEY,
    queryFn: apiGetSystemHealth,
    refetchInterval: 30_000,
  })
  const queueQuery = useQuery({
    queryKey: QUEUE_STATS_QUERY_KEY,
    queryFn: apiGetQueueStats,
    refetchInterval: 15_000,
  })

  const queues = queueQuery.data?.queues ?? []
  const systemIndicator = healthQuery.data?.details?.system as
    { uptime?: string; [key: string]: unknown } | undefined
  const redisIndicator = healthQuery.data?.details?.redis as
    { latency?: string; status?: string; [key: string]: unknown } | undefined
  const dbIndicator = healthQuery.data?.details?.database as
    { status?: string; [key: string]: unknown } | undefined

  const isGlobalFetching = healthQuery.isFetching || queueQuery.isFetching

  return (
    <>
      <Helmet>
        <title>{t('dashboard.title')}</title>
        <meta name='description' content={t('dashboard.title')} />
      </Helmet>

      {/* ===== Main ===== */}
      <Main className='flex flex-1 flex-col gap-6'>
        <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight text-balance md:text-3xl'>
              {t('dashboard.title')}
            </h1>
            <p className='text-muted-foreground text-sm text-pretty'>
              {t('dashboard.systemHealth.description')}
            </p>
          </div>
          <div className='flex items-center gap-2'>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={() => {
                healthQuery.refetch()
                queueQuery.refetch()
              }}
              disabled={isGlobalFetching}
              className='gap-2'
            >
              <RefreshCwIcon
                className={
                  isGlobalFetching ? 'size-3.5 animate-spin' : 'size-3.5'
                }
              />
              <span>{t('dashboard.systemHealth.refresh', 'Refresh All')}</span>
            </Button>
          </div>
        </div>

        {/* Dashboard Tabs */}
        <Tabs defaultValue='kosume' className='w-full space-y-6'>
          <TabsList className='grid w-full max-w-md grid-cols-2'>
            <TabsTrigger value='kosume' className='gap-2'>
              <LayoutGrid className='text-primary size-4' />
              <span>{t('dashboard.tabs.kosume', 'Nền tảng Kosume')}</span>
            </TabsTrigger>
            <TabsTrigger value='system' className='gap-2'>
              <ServerIcon className='size-4' />
              <span>{t('dashboard.tabs.system', 'Hạ tầng Hệ thống')}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value='kosume' className='space-y-6'>
            <KosumeAnalyticsTab />
          </TabsContent>

          <TabsContent value='system' className='space-y-6'>
            {/* 1. Executive Metric KPI Cards */}
            <DashboardKpiCards
              queues={queues}
              healthStatus={healthQuery.data?.status}
              systemUptime={systemIndicator?.uptime as string | undefined}
              redisLatency={redisIndicator?.latency as string | undefined}
              databaseStatus={dbIndicator?.status as string | undefined}
            />

            {/* 2. shadcn Interactive Charts Row */}
            <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
              <div className='lg:col-span-2'>
                <QueueMetricsBarChart
                  queues={queues}
                  isLoading={queueQuery.isFetching}
                />
              </div>
              <div>
                <QueueStatusDonutChart
                  queues={queues}
                  isLoading={queueQuery.isFetching}
                />
              </div>
            </div>

            {/* 3. Detailed Queue Workers */}
            <QueueMonitoringSection
              data={queueQuery.data}
              isLoading={queueQuery.isFetching}
              onRefresh={() => queueQuery.refetch()}
            />

            {/* 4. Infrastructure Health Checks */}
            <SystemHealthSection
              health={healthQuery.data}
              isLoading={healthQuery.isFetching}
              isError={healthQuery.isError}
              updatedAt={healthQuery.dataUpdatedAt}
              onRefresh={() => healthQuery.refetch()}
            />
          </TabsContent>
        </Tabs>
      </Main>
    </>
  )
}

function SystemHealthSection({
  health,
  isLoading,
  isError,
  updatedAt,
  onRefresh,
}: {
  health?: HealthCheckResponse
  isLoading: boolean
  isError: boolean
  updatedAt: number
  onRefresh: () => void
}) {
  const { t } = useTranslation()
  const overall = getHealthOverall(health, isError, t)
  const indicators = getHealthIndicators(health)

  const renderIndicatorsContent = () => {
    if (isError) {
      return (
        <div className='border-destructive/30 bg-destructive/5 text-destructive rounded-md border p-4 text-sm'>
          {t('dashboard.systemHealth.unreachable')}
        </div>
      )
    }

    if (indicators.length === 0) {
      return (
        <div className='text-muted-foreground rounded-md border border-dashed p-4 text-sm'>
          {isLoading
            ? t('dashboard.systemHealth.checking', 'Checking system health...')
            : t('dashboard.systemHealth.noDetails', 'No health details found.')}
        </div>
      )
    }

    return (
      <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3'>
        {indicators.map((indicator) => (
          <HealthIndicatorCard key={indicator.name} indicator={indicator} />
        ))}
      </div>
    )
  }

  return (
    <Card>
      <CardHeader className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div className='space-y-1.5'>
          <CardTitle className='flex items-center gap-2'>
            <ServerIcon className='text-primary size-5' />
            {t('dashboard.systemHealth.title')}
          </CardTitle>
          <CardDescription>
            {t('dashboard.systemHealth.description')}
          </CardDescription>
        </div>
        <div className='flex flex-wrap items-center gap-2'>
          <Badge variant={overall.variant}>
            <overall.icon className='size-3.5' />
            {overall.label}
          </Badge>
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={onRefresh}
            disabled={isLoading}
          >
            <RefreshCwIcon
              className={isLoading ? 'size-4 animate-spin' : 'size-4'}
            />
            {t('dashboard.systemHealth.refresh')}
          </Button>
        </div>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='grid grid-cols-1 gap-3 sm:grid-cols-3'>
          <HealthSummaryItem
            label={t('dashboard.systemHealth.overallStatus')}
            value={overall.label}
            tone={overall.tone}
          />
          <HealthSummaryItem
            label={t('dashboard.systemHealth.indicators')}
            value={String(indicators.length)}
            tone='neutral'
          />
          <HealthSummaryItem
            label={t('dashboard.systemHealth.lastChecked')}
            value={
              updatedAt
                ? formatDistanceToNow(new Date(updatedAt), { addSuffix: true })
                : t('dashboard.systemHealth.notCheckedYet', 'Not checked yet')
            }
            tone='neutral'
          />
        </div>

        {renderIndicatorsContent()}
      </CardContent>
    </Card>
  )
}

function HealthSummaryItem({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone: 'healthy' | 'warning' | 'critical' | 'neutral'
}) {
  return (
    <div className='min-w-0 rounded-md border p-3'>
      <p className='text-muted-foreground truncate text-xs font-medium'>
        {label}
      </p>
      <p className={cn(getHealthToneClass(tone), 'truncate')}>{value}</p>
    </div>
  )
}

function getIndicatorDetails(
  indicator: { name: string; status: string; detail: HealthIndicator },
  t: TFunction
) {
  const lower = indicator.name.toLowerCase()
  const healthy = indicator.status === 'up'
  const detail = indicator.detail || {}

  if (lower.includes('database')) {
    const resTime = detail.responseTime ? `${detail.responseTime}ms` : '< 5ms'
    return {
      title: t('dashboard.indicators.database', 'PostgreSQL Database'),
      subtitle: t(
        'dashboard.indicators.databaseSub',
        'Primary relational data store'
      ),
      icon: DatabaseIcon,
      accent: 'text-sky-600 dark:text-sky-400 bg-sky-500/10 border-sky-500/20',
      badgeText: healthy
        ? t('dashboard.indicators.operational', 'Operational')
        : t('dashboard.indicators.down', 'Down'),
      badgeVariant: healthy
        ? ('outline-success' as const)
        : ('outline-destructive' as const),
      pulseDotClass: healthy ? 'bg-emerald-500' : 'bg-destructive',
      metrics: [
        {
          label: t('dashboard.indicators.responseTime', 'Response'),
          value: resTime,
        },
        {
          label: t('dashboard.indicators.status', 'Status'),
          value: healthy
            ? t('dashboard.indicators.stable', 'Stable')
            : t('dashboard.indicators.down', 'Down'),
        },
      ],
    }
  }

  if (lower.includes('redis')) {
    const latency = detail.latency ? String(detail.latency) : '< 2ms'
    return {
      title: t('dashboard.indicators.redis', 'Redis In-Memory'),
      subtitle: t('dashboard.indicators.redisSub', 'Cache & message broker'),
      icon: ZapIcon,
      accent:
        'text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20',
      badgeText: healthy
        ? t('dashboard.indicators.operational', 'Operational')
        : t('dashboard.indicators.down', 'Down'),
      badgeVariant: healthy
        ? ('outline-success' as const)
        : ('outline-destructive' as const),
      pulseDotClass: healthy ? 'bg-emerald-500' : 'bg-destructive',
      metrics: [
        {
          label: t('dashboard.indicators.latency', 'Latency'),
          value: latency,
        },
        {
          label: 'Protocol',
          value: 'PONG',
        },
      ],
    }
  }

  if (lower.includes('memory')) {
    return {
      title: t('dashboard.indicators.memory', 'Node.js Heap Memory'),
      subtitle: t(
        'dashboard.indicators.memorySub',
        'API process memory allocation'
      ),
      icon: CpuIcon,
      accent:
        'text-purple-600 dark:text-purple-400 bg-purple-500/10 border-purple-500/20',
      badgeText: healthy
        ? t('dashboard.indicators.normal', 'Normal')
        : t('dashboard.indicators.degraded', 'High'),
      badgeVariant: healthy
        ? ('outline-success' as const)
        : ('outline-warning' as const),
      pulseDotClass: healthy ? 'bg-emerald-500' : 'bg-amber-500',
      metrics: [
        {
          label: t('dashboard.indicators.limit', 'Limit'),
          value: '< 500 MB',
        },
        {
          label: t('dashboard.indicators.status', 'Status'),
          value: healthy
            ? t('dashboard.indicators.safe', 'Safe')
            : t('dashboard.indicators.degraded', 'Elevated'),
        },
      ],
    }
  }

  if (lower.includes('disk') || lower.includes('storage')) {
    return {
      title: t('dashboard.indicators.storage', 'Disk Storage'),
      subtitle: t(
        'dashboard.indicators.storageSub',
        'Server file system capacity'
      ),
      icon: HardDriveIcon,
      accent:
        'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20',
      badgeText: healthy
        ? t('dashboard.indicators.ready', 'Ready')
        : t('dashboard.indicators.degraded', 'Low Space'),
      badgeVariant: healthy
        ? ('outline-success' as const)
        : ('outline-warning' as const),
      pulseDotClass: healthy ? 'bg-emerald-500' : 'bg-amber-500',
      metrics: [
        {
          label: t('dashboard.indicators.threshold', 'Threshold'),
          value: '< 95% used',
        },
        {
          label: t('dashboard.indicators.status', 'Status'),
          value: healthy
            ? t('dashboard.indicators.safe', 'Safe')
            : t('dashboard.indicators.degraded', 'Warning'),
        },
      ],
    }
  }

  if (lower.includes('queue')) {
    const hasFailed = Boolean(detail.hasFailedJobs)
    return {
      title: t('dashboard.indicators.queues', 'BullMQ Queues'),
      subtitle: t(
        'dashboard.indicators.queuesSub',
        'Email, File & Tag background workers'
      ),
      icon: WorkflowIcon,
      accent:
        'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      badgeText: hasFailed
        ? t('dashboard.queues.hasFailed', 'Có job cần xử lý')
        : t('dashboard.indicators.operational', 'Operational'),
      badgeVariant: hasFailed
        ? ('outline-warning' as const)
        : healthy
          ? ('outline-success' as const)
          : ('outline-destructive' as const),
      pulseDotClass: hasFailed
        ? 'bg-amber-500'
        : healthy
          ? 'bg-emerald-500'
          : 'bg-destructive',
      metrics: [
        {
          label: 'Queues',
          value: `3 ${t('dashboard.indicators.active', 'active')}`,
        },
        {
          label: t('dashboard.indicators.failedJobs', 'Failed jobs'),
          value: hasFailed ? '1+' : '0',
        },
      ],
    }
  }

  if (lower.includes('system')) {
    const uptime = typeof detail.uptime === 'string' ? detail.uptime : 'Active'
    const nodeVer =
      typeof detail.nodeVersion === 'string' ? detail.nodeVersion : undefined
    const platform =
      typeof detail.platform === 'string' ? detail.platform : undefined
    return {
      title: t('dashboard.indicators.system', 'System & Runtime'),
      subtitle: t(
        'dashboard.indicators.systemSub',
        'Host environment & Node runtime'
      ),
      icon: ServerIcon,
      accent:
        'text-slate-600 dark:text-slate-400 bg-slate-500/10 border-slate-500/20',
      badgeText: uptime.startsWith('0d') ? uptime : `Uptime ${uptime}`,
      badgeVariant: 'outline-success' as const,
      pulseDotClass: 'bg-emerald-500',
      metrics: [
        ...(nodeVer ? [{ label: 'Node', value: nodeVer }] : []),
        ...(platform ? [{ label: 'OS', value: platform }] : []),
      ],
    }
  }

  return {
    title: formatIndicatorName(indicator.name),
    subtitle: 'System indicator',
    icon: healthy ? CheckCircle2Icon : XCircleIcon,
    accent: healthy
      ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
      : 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20',
    badgeText: indicator.status,
    badgeVariant: healthy
      ? ('outline-success' as const)
      : ('outline-warning' as const),
    pulseDotClass: healthy ? 'bg-emerald-500' : 'bg-amber-500',
    metrics: Object.entries(detail)
      .filter(([k]) => k !== 'status')
      .slice(0, 2)
      .map(([k, v]) => ({ label: k, value: String(v) })),
  }
}

function HealthIndicatorCard({
  indicator,
}: {
  indicator: { name: string; status: string; detail: HealthIndicator }
}) {
  const { t } = useTranslation()
  const info = getIndicatorDetails(indicator, t)
  const Icon = info.icon

  return (
    <div className='bg-card hover:border-foreground/20 flex flex-col justify-between rounded-xl border p-3.5 shadow-2xs transition-all duration-200 hover:shadow-sm sm:p-4'>
      <div className='flex items-start justify-between gap-2.5'>
        <div className='flex min-w-0 items-center gap-2.5 sm:gap-3'>
          <div
            className={cn(
              'flex size-9 shrink-0 items-center justify-center rounded-lg border sm:size-10',
              info.accent
            )}
          >
            <Icon className='size-4 sm:size-5' />
          </div>
          <div className='min-w-0 flex-1'>
            <p className='text-foreground truncate text-xs font-semibold sm:text-sm'>
              {info.title}
            </p>
            <p className='text-muted-foreground mt-0.5 truncate text-[11px] sm:text-xs'>
              {info.subtitle}
            </p>
          </div>
        </div>
        <Badge
          variant={info.badgeVariant}
          className='shrink-0 gap-1.5 px-2 py-0.5 text-[11px] font-medium sm:text-xs'
        >
          <span
            className={cn(
              'size-1.5 animate-pulse rounded-full',
              info.pulseDotClass
            )}
          />
          {info.badgeText}
        </Badge>
      </div>

      {info.metrics.length > 0 && (
        <div className='border-border/60 mt-3.5 grid grid-cols-2 gap-2 border-t pt-3 text-xs'>
          {info.metrics.map((m, idx) => (
            <div
              key={idx}
              className='bg-muted/50 dark:bg-muted/30 flex min-w-0 flex-col justify-center rounded-lg px-2.5 py-1.5'
            >
              <span className='text-muted-foreground truncate text-[10px] font-normal sm:text-[11px]'>
                {m.label}
              </span>
              <span className='text-foreground mt-0.5 truncate text-xs font-semibold tabular-nums sm:text-sm'>
                {m.value}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function QueueMonitoringSection({
  data,
  isLoading,
  onRefresh,
}: {
  data?: QueueStatsResponse
  isLoading: boolean
  onRefresh: () => void
}) {
  const { t } = useTranslation()
  const queues = data?.queues ?? []
  const hasFailedJobs = queues.some((q) => (q.counts?.failed ?? 0) > 0)

  return (
    <Card>
      <CardHeader className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div className='space-y-1.5'>
          <CardTitle className='flex items-center gap-2'>
            <WorkflowIcon className='text-primary size-5' />
            {t('dashboard.queues.title')}
          </CardTitle>
          <CardDescription>{t('dashboard.queues.description')}</CardDescription>
        </div>
        <div className='flex flex-wrap items-center gap-2'>
          <Badge
            variant={hasFailedJobs ? 'outline-warning' : 'outline-success'}
          >
            {hasFailedJobs
              ? t('dashboard.queues.hasFailed')
              : t('dashboard.queues.healthy')}
          </Badge>
          {data?.bullBoardUrl && (
            <Button asChild variant='default' size='sm'>
              <a
                href={data.bullBoardUrl}
                target='_blank'
                rel='noreferrer'
                className='gap-1.5'
              >
                <ExternalLinkIcon className='size-3.5' />
                {t('dashboard.queues.openBullBoard')}
              </a>
            </Button>
          )}
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={onRefresh}
            disabled={isLoading}
          >
            <RefreshCwIcon
              className={isLoading ? 'size-4 animate-spin' : 'size-4'}
            />
            {t('dashboard.systemHealth.refresh')}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {queues.length === 0 ? (
          <div className='text-muted-foreground rounded-md border border-dashed p-4 text-sm'>
            {isLoading
              ? 'Loading queue metrics...'
              : t('dashboard.queues.noQueues')}
          </div>
        ) : (
          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
            {queues.map((queue) => {
              const counts = queue.counts || {
                waiting: 0,
                active: 0,
                completed: 0,
                failed: 0,
              }
              const queueHasError = (counts.failed ?? 0) > 0

              const getQueueStatusText = () => {
                if (counts.active > 0) {
                  return `${counts.active} ${t('dashboard.queues.active')}`
                }
                if (queueHasError) {
                  return `${counts.failed} ${t('dashboard.queues.failed')}`
                }
                return 'Idle'
              }

              return (
                <div
                  key={queue.name}
                  className='space-y-3 rounded-lg border p-4'
                >
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                      <LayersIcon className='text-muted-foreground size-4' />
                      <span className='font-semibold capitalize'>
                        {queue.name} Queue
                      </span>
                    </div>
                    <Badge
                      variant={queueHasError ? 'outline-warning' : 'outline'}
                      className='text-xs'
                    >
                      {getQueueStatusText()}
                    </Badge>
                  </div>
                  <div className='grid grid-cols-2 gap-2 text-center text-xs sm:grid-cols-4'>
                    <div className='bg-muted/50 rounded p-2'>
                      <p className='text-muted-foreground font-medium'>
                        {t('dashboard.queues.waiting')}
                      </p>
                      <p className='mt-1 text-sm font-semibold tabular-nums'>
                        {formatNumber(counts.waiting)}
                      </p>
                    </div>
                    <div className='bg-muted/50 rounded p-2'>
                      <p className='text-muted-foreground font-medium'>
                        {t('dashboard.queues.active')}
                      </p>
                      <p
                        className={`mt-1 text-sm font-semibold tabular-nums ${
                          counts.active > 0 ? 'text-primary font-bold' : ''
                        }`}
                      >
                        {formatNumber(counts.active)}
                      </p>
                    </div>
                    <div className='bg-muted/50 rounded p-2'>
                      <p className='text-muted-foreground font-medium'>
                        {t('dashboard.queues.completed')}
                      </p>
                      <p className='mt-1 text-sm font-semibold text-emerald-600 tabular-nums dark:text-emerald-400'>
                        {formatNumber(counts.completed)}
                      </p>
                    </div>
                    <div className='bg-muted/50 rounded p-2'>
                      <p className='text-muted-foreground font-medium'>
                        {t('dashboard.queues.failed')}
                      </p>
                      <p
                        className={`mt-1 text-sm font-semibold tabular-nums ${
                          queueHasError
                            ? 'font-semibold text-amber-600 dark:text-amber-400'
                            : ''
                        }`}
                      >
                        {formatNumber(counts.failed)}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function getHealthOverall(
  health: HealthCheckResponse | undefined,
  isError: boolean,
  t: TFunction
) {
  if (isError) {
    return {
      label: t('dashboard.indicators.unreachable', 'Unreachable'),
      tone: 'critical' as const,
      variant: 'outline-destructive' as const,
      icon: XCircleIcon,
    }
  }

  if (!health) {
    return {
      label: t('dashboard.indicators.checking', 'Checking'),
      tone: 'neutral' as const,
      variant: 'outline' as const,
      icon: RefreshCwIcon,
    }
  }

  if (health.status === 'ok') {
    return {
      label: t('dashboard.indicators.operational', 'Operational'),
      tone: 'healthy' as const,
      variant: 'outline-success' as const,
      icon: CheckCircle2Icon,
    }
  }

  if (health.status === 'shutting_down') {
    return {
      label: t('dashboard.indicators.shuttingDown', 'Shutting down'),
      tone: 'warning' as const,
      variant: 'outline-warning' as const,
      icon: AlertTriangleIcon,
    }
  }

  return {
    label: t('dashboard.indicators.degraded', 'Degraded'),
    tone: 'warning' as const,
    variant: 'outline-warning' as const,
    icon: AlertTriangleIcon,
  }
}

function getHealthIndicators(health?: HealthCheckResponse) {
  const details: Record<string, HealthIndicator> = {
    ...(health?.info ?? {}),
    ...(health?.details ?? {}),
  }

  if (health?.error && typeof health.error === 'object') {
    Object.assign(details, health.error)
  }

  return Object.entries(details).map(([name, detail]) => ({
    name,
    status: detail?.status ?? 'unknown',
    detail: detail ?? {},
  }))
}

function getHealthToneClass(
  tone: 'healthy' | 'warning' | 'critical' | 'neutral'
) {
  const base = 'mt-1 text-lg font-semibold tabular-nums'

  if (tone === 'healthy') return `${base} text-emerald-600`
  if (tone === 'warning') return `${base} text-amber-600`
  if (tone === 'critical') return `${base} text-destructive`

  return base
}

function formatIndicatorName(name: string) {
  return name.replace(/[_-]/g, ' ')
}

function formatNumber(value?: number | null) {
  return new Intl.NumberFormat().format(value ?? 0)
}
