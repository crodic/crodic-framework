import { useState } from 'react'
import { format } from 'date-fns'
import {
  Clock,
  Play,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type { CronJobSchema } from '../schema'

interface CronJobCardsProps {
  jobs: CronJobSchema[]
  onTriggerJob: (job: CronJobSchema) => void
  isTriggering: boolean
  onRefresh: () => void
}

function formatDuration(ms?: number | null): string {
  if (ms === null || ms === undefined) return '-'
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(2)}s`
}

export function CronJobCards({
  jobs,
  onTriggerJob,
  isTriggering,
  onRefresh,
}: CronJobCardsProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')

  const categories = [
    'ALL',
    ...Array.from(new Set(jobs.map((j) => j.category))),
  ]

  const filteredJobs =
    selectedCategory === 'ALL'
      ? jobs
      : jobs.filter((j) => j.category === selectedCategory)

  return (
    <div className='space-y-4'>
      {/* Filters & Actions */}
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <div className='flex flex-wrap gap-1.5'>
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size='sm'
              className='h-8 text-xs'
              onClick={() => setSelectedCategory(category)}
            >
              {category === 'ALL' ? 'All Categories' : category}
            </Button>
          ))}
        </div>
        <Button
          variant='outline'
          size='sm'
          className='ml-auto h-8 gap-1.5 text-xs'
          onClick={onRefresh}
        >
          <RefreshCw className='h-3.5 w-3.5' />
          Refresh
        </Button>
      </div>

      {/* Grid of Cron Jobs */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
        {filteredJobs.map((job) => {
          const isSuccess = job.lastStatus === 'SUCCESS'
          const isFailed = job.lastStatus === 'FAILED'
          const isRunning = job.lastStatus === 'RUNNING'

          return (
            <Card
              key={job.key}
              className='hover:border-primary/40 flex flex-col justify-between transition-colors'
            >
              <CardHeader className='pb-3'>
                <div className='flex items-start justify-between gap-2'>
                  <div className='space-y-1'>
                    <CardTitle className='text-base leading-tight font-semibold'>
                      {job.name}
                    </CardTitle>
                    <span className='text-muted-foreground block font-mono text-xs'>
                      {job.key}
                    </span>
                  </div>
                  <Badge variant='secondary' className='shrink-0 text-[10px]'>
                    {job.category}
                  </Badge>
                </div>
                <CardDescription className='mt-1 line-clamp-2 text-xs'>
                  {job.description}
                </CardDescription>
              </CardHeader>

              <CardContent className='space-y-3 pb-3 text-xs'>
                {/* Schedule badge */}
                <div className='bg-muted/50 flex items-center gap-2 rounded-md border px-2.5 py-1.5'>
                  <Clock className='text-muted-foreground h-3.5 w-3.5 shrink-0' />
                  <span className='text-muted-foreground'>Schedule:</span>
                  <code className='text-foreground font-mono font-semibold'>
                    {job.schedule}
                  </code>
                </div>

                {/* Last Run Info */}
                <div className='bg-muted/20 space-y-1.5 rounded-md border p-2.5'>
                  <div className='flex items-center justify-between'>
                    <span className='text-muted-foreground'>Last Status:</span>
                    {isRunning && (
                      <Badge
                        variant='outline'
                        className='border-blue-500 py-0 text-[10px] text-blue-600 dark:text-blue-400'
                      >
                        Running
                      </Badge>
                    )}
                    {isSuccess && (
                      <Badge
                        variant='outline'
                        className='flex items-center gap-1 border-emerald-500 py-0 text-[10px] text-emerald-600 dark:text-emerald-400'
                      >
                        <CheckCircle2 className='h-3 w-3' /> Success
                      </Badge>
                    )}
                    {isFailed && (
                      <Badge
                        variant='destructive'
                        className='flex items-center gap-1 py-0 text-[10px]'
                      >
                        <XCircle className='h-3 w-3' /> Failed
                      </Badge>
                    )}
                    {!job.lastStatus && (
                      <Badge
                        variant='outline'
                        className='text-muted-foreground flex items-center gap-1 py-0 text-[10px]'
                      >
                        <AlertCircle className='h-3 w-3' /> Never Run
                      </Badge>
                    )}
                  </div>

                  <div className='text-muted-foreground flex items-center justify-between'>
                    <span>Last Executed:</span>
                    <span className='text-foreground font-medium'>
                      {job.lastRunAt
                        ? format(new Date(job.lastRunAt), 'dd/MM/yyyy HH:mm')
                        : 'Never'}
                    </span>
                  </div>

                  {job.lastDurationMs !== null &&
                    job.lastDurationMs !== undefined && (
                      <div className='text-muted-foreground flex items-center justify-between'>
                        <span>Duration:</span>
                        <span className='text-foreground font-mono font-medium'>
                          {formatDuration(job.lastDurationMs)}
                        </span>
                      </div>
                    )}

                  {job.lastSummary && (
                    <div className='text-muted-foreground border-muted/50 mt-1 truncate border-t pt-1 text-[11px]'>
                      {job.lastSummary}
                    </div>
                  )}
                </div>
              </CardContent>

              <CardFooter className='pt-1'>
                <Button
                  variant='outline'
                  size='sm'
                  className='hover:bg-primary hover:text-primary-foreground w-full gap-2 text-xs transition-colors'
                  onClick={() => onTriggerJob(job)}
                  disabled={isTriggering || isRunning}
                >
                  <Play className='h-3.5 w-3.5' />
                  Run Now
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
