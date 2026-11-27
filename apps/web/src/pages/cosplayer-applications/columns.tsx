import type { ColumnDef } from '@tanstack/react-table'
import i18n from '@/i18n'
import { CheckCircle, Clock, Eye, Mail, User, XCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header'
import {
  TableRowAction,
  TableRowActions,
} from '@/components/data-table/table-row-actions'
import type { CosplayerApplicationSchema } from './schema'

interface GetColumnsProps {
  onReview: (application: CosplayerApplicationSchema) => void
}

export function getCosplayerApplicationsColumns({
  onReview,
}: GetColumnsProps): ColumnDef<CosplayerApplicationSchema>[] {
  return [
    {
      id: 'id',
      accessorFn: (row) => row.id,
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          label={i18n.t('cosplayerApplications.columns.id', 'Application ID')}
        />
      ),
      cell: ({ row }) => (
        <span className='text-xs font-medium'>#{row.original.id}</span>
      ),
      size: 80,
      enableSorting: true,
    },
    {
      id: 'user',
      header: i18n.t('cosplayerApplications.columns.applicant', 'Applicant'),
      cell: ({ row }) => {
        const app = row.original
        return (
          <div className='flex items-center gap-2.5'>
            <div className='bg-primary/10 text-primary relative flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full text-xs font-semibold'>
              {app.user?.avatar ? (
                <img
                  src={app.user.avatar}
                  alt={app.user?.fullName || ''}
                  className='size-full object-cover'
                />
              ) : (
                <User className='size-4' />
              )}
            </div>
            <div className='flex min-w-0 flex-col'>
              <span className='text-foreground truncate text-xs font-medium'>
                {app.user?.fullName || app.stageName}
              </span>
              <span className='text-muted-foreground flex items-center gap-1 truncate text-[11px]'>
                <Mail className='size-3 shrink-0' />
                {app.user?.email}
              </span>
            </div>
          </div>
        )
      },
      enableSorting: false,
    },
    {
      id: 'stageName',
      accessorFn: (row) => row.stageName,
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          label={i18n.t(
            'cosplayerApplications.columns.stageName',
            'Stage name'
          )}
        />
      ),
      cell: ({ row }) => (
        <span className='text-primary text-xs font-semibold'>
          {row.original.stageName}
        </span>
      ),
      meta: {
        label: i18n.t('cosplayerApplications.columns.stageName', 'Stage name'),
        placeholder: i18n.t(
          'cosplayerApplications.columns.stageNamePlaceholder',
          'Search by stage name...'
        ),
        variant: 'text',
      },
      enableColumnFilter: true,
      enableSorting: true,
    },
    {
      id: 'bio',
      header: i18n.t('cosplayerApplications.columns.bio', 'Introduction'),
      cell: ({ row }) => (
        <p className='text-muted-foreground max-w-[240px] truncate text-xs'>
          {row.original.bio}
        </p>
      ),
      enableSorting: false,
    },
    {
      id: 'status',
      accessorFn: (row) => row.status,
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          label={i18n.t('common.status', 'Status')}
        />
      ),
      cell: ({ row }) => {
        const status = row.original.status
        if (status === 'APPROVED') {
          return (
            <Badge variant='outline-success' className='gap-1 text-xs'>
              <CheckCircle className='size-3' />{' '}
              {i18n.t('cosplayerApplications.status.approved', 'Approved')}
            </Badge>
          )
        }
        if (status === 'REJECTED') {
          return (
            <Badge variant='destructive' className='gap-1 text-xs'>
              <XCircle className='size-3' />{' '}
              {i18n.t('cosplayerApplications.status.rejected', 'Rejected')}
            </Badge>
          )
        }
        return (
          <Badge variant='outline-warning' className='gap-1 text-xs'>
            <Clock className='size-3' />{' '}
            {i18n.t('cosplayerApplications.status.pending', 'Pending')}
          </Badge>
        )
      },
      meta: {
        variant: 'select',
        label: i18n.t('common.status', 'Status'),
        options: [
          {
            label: i18n.t('cosplayerApplications.status.pending', 'Pending'),
            value: 'PENDING',
          },
          {
            label: i18n.t('cosplayerApplications.status.approved', 'Approved'),
            value: 'APPROVED',
          },
          {
            label: i18n.t('cosplayerApplications.status.rejected', 'Rejected'),
            value: 'REJECTED',
          },
        ],
      },
      enableColumnFilter: true,
      enableSorting: true,
    },
    {
      id: 'portfolioCount',
      header: i18n.t('cosplayerApplications.columns.portfolio', 'Portfolio'),
      cell: ({ row }) => {
        const count = row.original.portfolioUrls?.length || 0
        return (
          <span className='text-muted-foreground text-xs'>
            {count > 0
              ? i18n.t(
                  'cosplayerApplications.portfolio.count',
                  '{{count}} images',
                  { count }
                )
              : i18n.t('cosplayerApplications.portfolio.empty', 'None')}
          </span>
        )
      },
      enableSorting: false,
    },
    {
      id: 'createdAt',
      accessorFn: (row) => row.createdAt,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='Ngày nộp' />
      ),
      cell: ({ row }) => {
        const date = new Date(row.original.createdAt)
        return (
          <span className='text-muted-foreground text-xs'>
            {date.toLocaleDateString(i18n.language, {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        )
      },
      enableSorting: true,
    },
    {
      id: 'actions',
      header: i18n.t('common.actions', 'Actions'),
      cell: ({ row }) => (
        <TableRowActions>
          <TableRowAction
            label={i18n.t('cosplayerApplications.actions.review', 'Review')}
            icon={<Eye className='size-3.5' />}
            onSelect={() => onReview(row.original)}
          />
        </TableRowActions>
      ),
      size: 110,
      enableSorting: false,
    },
  ]
}
