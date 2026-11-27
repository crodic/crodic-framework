import { useState } from 'react'
import { format } from 'date-fns'
import { Check, Copy, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/layout/page-shell'
import type { CronJobLogSchema } from '../schema'

interface LogDetailProps {
  log: CronJobLogSchema | null
}

function formatDuration(ms?: number | null): string {
  if (ms === null || ms === undefined) return '-'
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(2)}s`
}

export function LogDetail({ log }: LogDetailProps) {
  const [copied, setCopied] = useState(false)

  if (!log) return null

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <div className='flex w-full min-w-0 flex-col gap-6'>
        <PageHeader
          title={<>Execution Log #{log.id}</>}
          description={
            <>
              {log.jobName} ({log.jobKey})
            </>
          }
        />
        <div className='flex items-center justify-between gap-3'>
          {log.status === 'RUNNING' && (
            <Badge
              variant='outline'
              className='border-primary bg-primary/10 text-primary dark:bg-primary/10 dark:text-primary gap-1'
            >
              <Loader2 className='h-3 w-3 animate-spin' />
              Running
            </Badge>
          )}
          {log.status === 'SUCCESS' && (
            <Badge
              variant='outline'
              className='border-primary bg-primary/10 text-primary dark:bg-primary/10 dark:text-primary'
            >
              Success
            </Badge>
          )}
          {log.status === 'FAILED' && (
            <Badge variant='destructive'>Failed</Badge>
          )}
        </div>

        <div className='min-w-0'>
          <div className='space-y-4 text-sm'>
            {/* Meta Grid */}
            <div className='bg-muted/30 grid grid-cols-2 gap-3 rounded-lg border p-4 sm:grid-cols-3'>
              <div>
                <span className='text-muted-foreground block text-xs'>
                  Trigger Type
                </span>
                <span className='font-medium'>{log.triggerType}</span>
              </div>
              <div>
                <span className='text-muted-foreground block text-xs'>
                  Duration
                </span>
                <span className='font-mono font-medium'>
                  {formatDuration(log.durationMs)}
                </span>
              </div>
              <div>
                <span className='text-muted-foreground block text-xs'>
                  Triggered By Admin
                </span>
                <span className='font-medium'>
                  {log.triggeredByAdminId
                    ? `Admin #${log.triggeredByAdminId}`
                    : 'System Scheduler'}
                </span>
              </div>
              <div>
                <span className='text-muted-foreground block text-xs'>
                  Started At
                </span>
                <span className='text-xs'>
                  {log.startedAt
                    ? format(new Date(log.startedAt), 'dd/MM/yyyy HH:mm:ss')
                    : '-'}
                </span>
              </div>
              <div>
                <span className='text-muted-foreground block text-xs'>
                  Finished At
                </span>
                <span className='text-xs'>
                  {log.finishedAt
                    ? format(new Date(log.finishedAt), 'dd/MM/yyyy HH:mm:ss')
                    : '-'}
                </span>
              </div>
              <div>
                <span className='text-muted-foreground block text-xs'>
                  Created At
                </span>
                <span className='text-xs'>
                  {log.createdAt
                    ? format(new Date(log.createdAt), 'dd/MM/yyyy HH:mm:ss')
                    : '-'}
                </span>
              </div>
            </div>

            {/* Summary */}
            {log.summary && (
              <div className='space-y-1.5'>
                <h4 className='text-muted-foreground text-xs font-semibold tracking-wider uppercase'>
                  Execution Summary
                </h4>
                <div className='bg-muted/40 rounded-md border p-3 font-mono text-xs whitespace-pre-wrap'>
                  {log.summary}
                </div>
              </div>
            )}

            {/* Error Message */}
            {log.errorMessage && (
              <div className='space-y-1.5'>
                <h4 className='text-destructive text-xs font-semibold tracking-wider uppercase'>
                  Error Message
                </h4>
                <div className='border-destructive/30 bg-destructive/10 text-destructive rounded-md border p-3 font-mono text-xs whitespace-pre-wrap'>
                  {log.errorMessage}
                </div>
              </div>
            )}

            {/* Error Stack */}
            {log.errorStack && (
              <div className='space-y-1.5'>
                <div className='flex items-center justify-between'>
                  <h4 className='text-destructive text-xs font-semibold tracking-wider uppercase'>
                    Stack Trace
                  </h4>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='h-7 gap-1 text-xs'
                    onClick={() => handleCopy(log.errorStack!)}
                  >
                    {copied ? (
                      <Check className='text-primary h-3.5 w-3.5' />
                    ) : (
                      <Copy className='h-3.5 w-3.5' />
                    )}
                    {copied ? 'Copied' : 'Copy Stack'}
                  </Button>
                </div>
                <div className='bg-muted text-foreground max-h-60 overflow-x-auto rounded-md border p-3 font-mono text-xs whitespace-pre'>
                  {log.errorStack}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
