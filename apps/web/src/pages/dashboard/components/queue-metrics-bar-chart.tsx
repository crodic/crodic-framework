import * as React from 'react'
import { LayersIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
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

export type QueueItem = {
  name: string
  counts: {
    waiting: number
    active: number
    completed: number
    failed: number
    delayed?: number
    paused?: number
  }
}

interface QueueMetricsBarChartProps {
  queues: QueueItem[]
  isLoading?: boolean
}

export function QueueMetricsBarChart({
  queues,
  isLoading,
}: QueueMetricsBarChartProps) {
  const { t } = useTranslation()
  const [layoutMode, setLayoutMode] = React.useState<'grouped' | 'stacked'>(
    'grouped'
  )

  const chartConfig = React.useMemo<ChartConfig>(
    () => ({
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

  const chartData = React.useMemo(() => {
    return queues.map((q) => {
      const displayName =
        q.name === 'file'
          ? 'File Queue'
          : q.name === 'email'
            ? 'Email Queue'
            : `${q.name.charAt(0).toUpperCase() + q.name.slice(1)} Queue`

      return {
        queue: displayName,
        completed: q.counts.completed ?? 0,
        active: q.counts.active ?? 0,
        waiting: q.counts.waiting ?? 0,
        failed: q.counts.failed ?? 0,
      }
    })
  }, [queues])

  if (queues.length === 0) {
    return (
      <Card className='flex flex-col items-center justify-center p-8 text-center'>
        <p className='text-muted-foreground text-sm'>
          {isLoading
            ? 'Loading queue metrics...'
            : t(
                'dashboard.queues.noQueues',
                'No active background queues detected.'
              )}
        </p>
      </Card>
    )
  }

  return (
    <Card className='flex flex-col'>
      <CardHeader className='flex flex-col gap-2 pb-2 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <CardTitle className='flex items-center gap-2 text-base font-semibold'>
            <LayersIcon className='text-primary size-4' />
            {t(
              'dashboard.queues.throughputTitle',
              'Queue Throughput & Workload'
            )}
          </CardTitle>
          <CardDescription>
            {t(
              'dashboard.queues.throughputDesc',
              'Live job counts comparison across background BullMQ workers'
            )}
          </CardDescription>
        </div>
        <div className='flex items-center gap-1.5 self-end sm:self-auto'>
          <Button
            type='button'
            variant={layoutMode === 'grouped' ? 'secondary' : 'ghost'}
            size='sm'
            onClick={() => setLayoutMode('grouped')}
            className='h-7 px-2.5 text-xs'
          >
            Grouped
          </Button>
          <Button
            type='button'
            variant={layoutMode === 'stacked' ? 'secondary' : 'ghost'}
            size='sm'
            onClick={() => setLayoutMode('stacked')}
            className='h-7 px-2.5 text-xs'
          >
            Stacked
          </Button>
        </div>
      </CardHeader>
      <CardContent className='flex-1 pb-4'>
        <ChartContainer
          config={chartConfig}
          className='aspect-auto h-[260px] w-full'
        >
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 10, left: -10, bottom: 0 }}
          >
            <CartesianGrid
              vertical={false}
              strokeDasharray='3 3'
              className='stroke-border/40'
            />
            <XAxis
              dataKey='queue'
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
                  className='w-48 shadow-lg'
                />
              }
            />
            <ChartLegend
              content={<ChartLegendContent />}
              className='mt-2 flex-wrap gap-4 text-xs'
            />
            <Bar
              dataKey='completed'
              fill='var(--color-completed)'
              radius={layoutMode === 'stacked' ? 0 : [4, 4, 0, 0]}
              stackId={layoutMode === 'stacked' ? 'a' : undefined}
            />
            <Bar
              dataKey='active'
              fill='var(--color-active)'
              radius={layoutMode === 'stacked' ? 0 : [4, 4, 0, 0]}
              stackId={layoutMode === 'stacked' ? 'a' : undefined}
            />
            <Bar
              dataKey='waiting'
              fill='var(--color-waiting)'
              radius={layoutMode === 'stacked' ? 0 : [4, 4, 0, 0]}
              stackId={layoutMode === 'stacked' ? 'a' : undefined}
            />
            <Bar
              dataKey='failed'
              fill='var(--color-failed)'
              radius={layoutMode === 'stacked' ? [4, 4, 0, 0] : [4, 4, 0, 0]}
              stackId={layoutMode === 'stacked' ? 'a' : undefined}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
