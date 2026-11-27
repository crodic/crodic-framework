import { format } from 'date-fns'
import type { ColumnDef } from '@tanstack/react-table'
import { Eye, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header'
import {
  TableRowAction,
  TableRowActions,
} from '@/components/data-table/table-row-actions'
import { ColumnKey, type CronJobLogSchema } from './schema'

interface GetCronJobLogColumnsProps {
  onViewDetails: (log: CronJobLogSchema) => void
}

function formatDuration(ms?: number | null): string {
  if (ms === null || ms === undefined) return '-'
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(2)}s`
}

export function getCronJobLogColumns({
  onViewDetails,
}: GetCronJobLogColumnsProps): ColumnDef<CronJobLogSchema>[] {
  return [
    {
      id: ColumnKey.status,
      accessorFn: (row) => row.status,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='Status' />
      ),
      cell: ({ row }) => {
        const status = row.original.status
        if (status === 'RUNNING') {
          return (
            <Badge
              variant='outline'
              className='border-primary bg-primary/10 text-primary dark:bg-primary/10 dark:text-primary gap-1'
            >
              <Loader2 className='h-3 w-3 animate-spin' />
              Running
            </Badge>
          )
        }
        if (status === 'SUCCESS') {
          return (
            <Badge
              variant='outline'
              className='border-primary bg-primary/10 text-primary dark:bg-primary/10 dark:text-primary'
            >
              Success
            </Badge>
          )
        }
        return <Badge variant='destructive'>Failed</Badge>
      },
      enableColumnFilter: true,
      meta: {
        variant: 'multiSelect',
        label: 'Status',
        options: [
          { label: 'Running', value: 'RUNNING' },
          { label: 'Success', value: 'SUCCESS' },
          { label: 'Failed', value: 'FAILED' },
        ],
      },
    },
    {
      id: ColumnKey.jobName,
      accessorFn: (row) => row.jobName,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='Job' />
      ),
      cell: ({ row }) => (
        <div className='flex flex-col'>
          <span className='text-foreground font-medium'>
            {row.original.jobName}
          </span>
          <span className='text-muted-foreground font-mono text-xs'>
            {row.original.jobKey}
          </span>
        </div>
      ),
      enableColumnFilter: true,
      meta: {
        variant: 'text',
        placeholder: 'Search job name...',
      },
    },
    {
      id: ColumnKey.triggerType,
      accessorFn: (row) => row.triggerType,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='Trigger' />
      ),
      cell: ({ row }) => (
        <Badge
          variant={
            row.original.triggerType === 'MANUAL' ? 'secondary' : 'outline'
          }
        >
          {row.original.triggerType}
        </Badge>
      ),
      enableColumnFilter: true,
      meta: {
        variant: 'multiSelect',
        label: 'Trigger',
        options: [
          { label: 'Scheduled', value: 'SCHEDULED' },
          { label: 'Manual', value: 'MANUAL' },
        ],
      },
    },
    {
      id: ColumnKey.startedAt,
      accessorFn: (row) => row.startedAt,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='Started At' />
      ),
      cell: ({ row }) => (
        <span className='text-muted-foreground text-sm whitespace-nowrap'>
          {row.original.startedAt
            ? format(new Date(row.original.startedAt), 'dd/MM/yyyy HH:mm:ss')
            : '-'}
        </span>
      ),
    },
    {
      id: ColumnKey.durationMs,
      accessorFn: (row) => row.durationMs,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='Duration' />
      ),
      cell: ({ row }) => (
        <span className='font-mono text-xs'>
          {formatDuration(row.original.durationMs)}
        </span>
      ),
    },
    {
      id: ColumnKey.summary,
      accessorFn: (row) => row.summary ?? row.errorMessage ?? '',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='Summary / Result' />
      ),
      cell: ({ row }) => {
        const text = row.original.summary || row.original.errorMessage || '-'
        const isError = Boolean(row.original.errorMessage)
        return (
          <p
            className={`max-w-[340px] truncate text-xs ${
              isError ? 'text-destructive font-medium' : 'text-muted-foreground'
            }`}
            title={text}
          >
            {text}
          </p>
        )
      },
    },
    {
      id: 'actions',
      header: () => <span className='sr-only'>Actions</span>,
      cell: ({ row }) => (
        <TableRowActions>
          <TableRowAction
            label={'Actions'}
            icon={<Eye className='h-4 w-4' />}
            onSelect={() => {
              onViewDetails(row.original)
            }}
          />
        </TableRowActions>
      ),
      enableSorting: false,
    },
  ]
}
