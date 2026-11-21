import { useState } from 'react'
import { format } from 'date-fns'
import { Check, Copy, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { CronJobLogSchema } from '../schema'

interface LogDetailDialogProps {
  log: CronJobLogSchema | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function formatDuration(ms?: number | null): string {
  if (ms === null || ms === undefined) return '-'
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(2)}s`
}

export function LogDetailDialog({
  log,
  open,
  onOpenChange,
}: LogDetailDialogProps) {
  const [copied, setCopied] = useState(false)

  if (!log) return null

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='flex max-h-[85vh] max-w-2xl flex-col p-6'>
        <DialogHeader>
          <div className='flex items-center justify-between gap-3'>
            <DialogTitle className='flex items-center gap-2 text-lg font-semibold'>
              Execution Log #{log.id}
            </DialogTitle>
            {log.status === 'RUNNING' && (
              <Badge
                variant='outline'
                className='gap-1 border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
              >
                <Loader2 className='h-3 w-3 animate-spin' />
                Running
              </Badge>
            )}
            {log.status === 'SUCCESS' && (
              <Badge
                variant='outline'
                className='border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
              >
                Success
              </Badge>
            )}
            {log.status === 'FAILED' && (
              <Badge variant='destructive'>Failed</Badge>
            )}
          </div>
          <DialogDescription className='text-muted-foreground font-mono text-xs'>
            {log.jobName} ({log.jobKey})
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className='flex-1 pr-3'>
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
                      <Check className='h-3.5 w-3.5 text-emerald-600' />
                    ) : (
                      <Copy className='h-3.5 w-3.5' />
                    )}
                    {copied ? 'Copied' : 'Copy Stack'}
                  </Button>
                </div>
                <div className='max-h-60 overflow-x-auto rounded-md border bg-slate-950 p-3 font-mono text-xs whitespace-pre text-slate-100'>
                  {log.errorStack}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
