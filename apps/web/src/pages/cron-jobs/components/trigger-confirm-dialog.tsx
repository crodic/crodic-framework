import { Play, Loader2 } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import type { CronJobSchema } from '../schema'

interface TriggerConfirmDialogProps {
  job: CronJobSchema | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  isLoading: boolean
}

export function TriggerConfirmDialog({
  job,
  open,
  onOpenChange,
  onConfirm,
  isLoading,
}: TriggerConfirmDialogProps) {
  if (!job) return null

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className='flex items-center gap-2'>
            <Play className='text-primary h-5 w-5' />
            Trigger Cron Job
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to run <strong>{job.name}</strong>{' '}
            immediately? This will execute the job in the background and record
            an execution log.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className='bg-muted/40 space-y-1 rounded-md border p-3 text-sm'>
          <div>
            <span className='text-foreground font-medium'>Job Key: </span>
            <code className='font-mono text-xs'>{job.key}</code>
          </div>
          <div>
            <span className='text-foreground font-medium'>Schedule: </span>
            <code className='font-mono text-xs'>{job.schedule}</code>
          </div>
          <div>
            <span className='text-foreground font-medium'>Category: </span>
            <span>{job.category}</span>
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              onConfirm()
            }}
            disabled={isLoading}
            className='gap-2'
          >
            {isLoading && <Loader2 className='h-4 w-4 animate-spin' />}
            Run Now
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
