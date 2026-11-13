import * as React from 'react'
import {
  CheckCircle2Icon,
  ClockIcon,
  DatabaseIcon,
  ServerIcon,
  WorkflowIcon,
  ZapIcon,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import type { QueueItem } from './queue-metrics-bar-chart'

interface DashboardKpiCardsProps {
  queues: QueueItem[]
  healthStatus?: string
  systemUptime?: string
  redisLatency?: string
  databaseStatus?: string
}

export function DashboardKpiCards({
  queues,
  healthStatus = 'ok',
  systemUptime = 'N/A',
  redisLatency = '< 5ms',
  databaseStatus = 'up',
}: DashboardKpiCardsProps) {
  const { t } = useTranslation()

  const { totalCompleted, totalActive, totalWaiting, totalFailed } =
    React.useMemo(() => {
      let completed = 0
      let active = 0
      let waiting = 0
      let failed = 0

      for (const q of queues) {
        completed += q.counts.completed ?? 0
        active += q.counts.active ?? 0
        waiting += q.counts.waiting ?? 0
        failed += q.counts.failed ?? 0
      }

      return {
        totalCompleted: completed,
        totalActive: active,
        totalWaiting: waiting,
        totalFailed: failed,
      }
    }, [queues])

  const isHealthy = healthStatus === 'ok'

  return (
    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
      {/* 1. System Health Status Card */}
      <Card className='border-border/70 relative gap-0 overflow-hidden p-4 shadow-xs'>
        <div className='flex items-center justify-between'>
          <span className='text-muted-foreground text-xs font-semibold tracking-wider uppercase'>
            {t('dashboard.kpi.systemState', 'System Status')}
          </span>
          <div
            className={cn(
              'flex size-8 items-center justify-center rounded-lg',
              isHealthy
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                : 'bg-destructive/10 text-destructive'
            )}
          >
            <ServerIcon className='size-4' />
          </div>
        </div>
        <div className='mt-2.5 flex items-baseline gap-2'>
          <span className='text-2xl font-bold tracking-tight'>
            {isHealthy ? 'Operational' : 'Attention'}
          </span>
          <Badge
            variant={isHealthy ? 'outline-success' : 'destructive'}
            className='text-[10px] font-semibold'
          >
            99.9% Uptime
          </Badge>
        </div>
        <p className='text-muted-foreground mt-1.5 flex items-center gap-1.5 text-xs'>
          <ClockIcon className='size-3.5' />
          <span>Uptime: {systemUptime}</span>
        </p>
      </Card>

      {/* 2. Total Completed Jobs */}
      <Card className='border-border/70 relative gap-0 overflow-hidden p-4 shadow-xs'>
        <div className='flex items-center justify-between'>
          <span className='text-muted-foreground text-xs font-semibold tracking-wider uppercase'>
            {t('dashboard.kpi.completedJobs', 'Completed Jobs')}
          </span>
          <div className='flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'>
            <CheckCircle2Icon className='size-4' />
          </div>
        </div>
        <div className='mt-2.5 flex items-baseline gap-2'>
          <span className='text-2xl font-bold tracking-tight tabular-nums'>
            {totalCompleted.toLocaleString()}
          </span>
          <span className='text-muted-foreground text-xs'>processed</span>
        </div>
        <p className='text-muted-foreground mt-1.5 text-xs'>
          {totalFailed > 0 ? (
            <span className='text-destructive font-medium'>
              {totalFailed} failed job(s)
            </span>
          ) : (
            <span className='font-medium text-emerald-600 dark:text-emerald-400'>
              Zero error in active runs
            </span>
          )}
        </p>
      </Card>

      {/* 3. BullMQ Active Tasks */}
      <Card className='border-border/70 relative gap-0 overflow-hidden p-4 shadow-xs'>
        <div className='flex items-center justify-between'>
          <span className='text-muted-foreground text-xs font-semibold tracking-wider uppercase'>
            {t('dashboard.kpi.activeQueues', 'Queue Activity')}
          </span>
          <div className='bg-primary/10 text-primary flex size-8 items-center justify-center rounded-lg'>
            <WorkflowIcon className='size-4' />
          </div>
        </div>
        <div className='mt-2.5 flex items-baseline gap-2'>
          <span className='text-2xl font-bold tracking-tight tabular-nums'>
            {queues.length}
          </span>
          <span className='text-muted-foreground text-xs'>active queues</span>
        </div>
        <div className='text-muted-foreground mt-1.5 flex items-center gap-2 text-xs'>
          <span
            className={cn(
              'font-semibold tabular-nums',
              totalActive > 0 ? 'text-primary' : ''
            )}
          >
            {totalActive} running
          </span>
          <span>•</span>
          <span className='tabular-nums'>{totalWaiting} waiting</span>
        </div>
      </Card>

      {/* 4. Redis Cache & Database Latency */}
      <Card className='border-border/70 relative gap-0 overflow-hidden p-4 shadow-xs'>
        <div className='flex items-center justify-between'>
          <span className='text-muted-foreground text-xs font-semibold tracking-wider uppercase'>
            {t('dashboard.kpi.storageCache', 'Redis & DB Core')}
          </span>
          <div className='flex size-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400'>
            <ZapIcon className='size-4' />
          </div>
        </div>
        <div className='mt-2.5 flex items-baseline gap-2'>
          <span className='text-2xl font-bold tracking-tight text-amber-600 tabular-nums dark:text-amber-400'>
            {redisLatency}
          </span>
          <span className='text-muted-foreground text-xs'>ping latency</span>
        </div>
        <p className='text-muted-foreground mt-1.5 flex items-center gap-1.5 text-xs'>
          <DatabaseIcon className='size-3.5 text-emerald-600 dark:text-emerald-400' />
          <span className='capitalize'>PostgreSQL {databaseStatus}</span>
        </p>
      </Card>
    </div>
  )
}
