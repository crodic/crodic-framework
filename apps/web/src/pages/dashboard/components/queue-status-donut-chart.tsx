import * as React from 'react'
import { PieChartIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Label, Pie, PieChart } from 'recharts'
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
import type { QueueItem } from './queue-metrics-bar-chart'

interface QueueStatusDonutChartProps {
  queues: QueueItem[]
  isLoading?: boolean
}

export function QueueStatusDonutChart({ queues }: QueueStatusDonutChartProps) {
  const { t } = useTranslation()

  const chartConfig = React.useMemo<ChartConfig>(
    () => ({
      jobs: {
        label: t('dashboard.queues.jobs', 'Jobs'),
      },
      completed: {
        label: t('dashboard.queues.completed', 'Completed'),
        color: 'var(--chart-2)',
      },
      active: {
        label: t('dashboard.queues.active', 'Active'),
        color: 'var(--chart-1)',
      },
      waiting: {
        label: t('dashboard.queues.waiting', 'Waiting'),
        color: 'var(--chart-4)',
      },
      failed: {
        label: t('dashboard.queues.failed', 'Failed'),
        color: 'var(--destructive)',
      },
    }),
    [t]
  )

  const { chartData, totalJobs, successRate } = React.useMemo(() => {
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

    const total = completed + active + waiting + failed
    const rate =
      total > 0 && completed + failed > 0
        ? Math.round((completed / (completed + failed)) * 100)
        : 100

    const data = [
      {
        status: 'completed',
        label: 'Completed',
        count: completed,
        fill: 'var(--color-completed)',
      },
      {
        status: 'active',
        label: 'Active',
        count: active,
        fill: 'var(--color-active)',
      },
      {
        status: 'waiting',
        label: 'Waiting',
        count: waiting,
        fill: 'var(--color-waiting)',
      },
      {
        status: 'failed',
        label: 'Failed',
        count: failed,
        fill: 'var(--color-failed)',
      },
    ].filter((item) => item.count > 0)

    // Fallback if no counts yet
    if (data.length === 0) {
      data.push({
        status: 'completed',
        label: 'Completed',
        count: 0,
        fill: 'var(--muted)',
      })
    }

    return { chartData: data, totalJobs: total, successRate: rate }
  }, [queues])

  return (
    <Card className='flex flex-col'>
      <CardHeader className='pb-2'>
        <div className='flex items-center justify-between'>
          <CardTitle className='flex items-center gap-2 text-base font-semibold'>
            <PieChartIcon className='text-primary size-4' />
            {t('dashboard.queues.statusDistribution', 'Job Distribution')}
          </CardTitle>
          {totalJobs > 0 && (
            <span className='rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400'>
              {successRate}% Success
            </span>
          )}
        </div>
        <CardDescription>
          {t(
            'dashboard.queues.distributionDesc',
            'Total aggregate jobs status across all active queues'
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className='flex-1 pb-4'>
        <ChartContainer
          config={chartConfig}
          className='mx-auto aspect-square max-h-[260px]'
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey='count'
              nameKey='status'
              innerRadius={65}
              outerRadius={95}
              strokeWidth={3}
              paddingAngle={chartData.length > 1 ? 4 : 0}
            >
              <Label
                position='center'
                content={({ viewBox }) => {
                  if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                    const cx = viewBox.cx
                    const cy = viewBox.cy
                    return (
                      <g>
                        <text
                          x={cx}
                          y={(cy || 0) - 11}
                          textAnchor='middle'
                          dominantBaseline='central'
                          className='fill-foreground text-3xl font-bold'
                        >
                          {totalJobs.toLocaleString()}
                        </text>
                        <text
                          x={cx}
                          y={(cy || 0) + 15}
                          textAnchor='middle'
                          dominantBaseline='central'
                          className='fill-muted-foreground text-xs font-medium'
                        >
                          {totalJobs === 1
                            ? t('dashboard.queues.singleJob', 'Total Job')
                            : t('dashboard.queues.totalJobs', 'Total Jobs')}
                        </text>
                      </g>
                    )
                  }
                }}
              />
            </Pie>
            <ChartLegend
              content={<ChartLegendContent nameKey='status' />}
              className='-translate-y-1 flex-wrap justify-center gap-3 text-xs'
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
