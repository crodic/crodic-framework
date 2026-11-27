import { format } from 'date-fns'
import type { ColumnDef } from '@tanstack/react-table'
import i18n from '@/i18n'
import {
  BadgeCheck,
  Calendar,
  CheckCircle2,
  MailIcon,
  TextIcon,
  UserRoundCheckIcon,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header'
import { ColumnKey, type UserSchema } from '../users/schema'
import ComponentTableRowActions from './component-table-row-action'

export function getUsersTableColumns(): ColumnDef<UserSchema>[] {
  return [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          aria-label='Select all'
          className='translate-y-0.5'
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          aria-label='Select row'
          className='translate-y-0.5'
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
        />
      ),
      enableHiding: false,
      enableSorting: false,
      size: 40,
      minSize: 40,
    },
    {
      id: ColumnKey.id,
      accessorFn: (row) => row.id,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='ID' />
      ),
      cell: ({ row }) => <p className='truncate'>{row.original.id}</p>,
      meta: {
        label: 'ID',
        placeholder: 'Search by ID...',
        variant: 'text',
        icon: UserRoundCheckIcon,
      },
      enableColumnFilter: true,
      enableHiding: false,
      enableSorting: false,
      minSize: 100,
    },
    {
      id: ColumnKey.email,
      accessorFn: (row) => row.email,
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          label={i18n.t('users.table.email')}
        />
      ),
      cell: ({ row }) => <div className='truncate'>{row.original.email}</div>,
      meta: {
        label: i18n.t('users.table.email'),
        placeholder: i18n.t('users.table.email'),
        variant: 'text',
        icon: MailIcon,
      },
      enableSorting: false,
      enableColumnFilter: true,
      enableHiding: false,
    },
    {
      id: ColumnKey.fullName,
      accessorFn: (row) => row.fullName,
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          label={i18n.t('users.table.fullName')}
        />
      ),
      cell: ({ row }) => (
        <div className='truncate'>
          <div className='font-medium'>{row.original.fullName}</div>
          {row.original.username && (
            <div className='text-muted-foreground text-xs'>
              @{row.original.username}
            </div>
          )}
        </div>
      ),
      meta: {
        label: i18n.t('users.table.fullName'),
        placeholder: i18n.t('users.table.fullName'),
        variant: 'text',
        icon: TextIcon,
      },
      enableSorting: false,
      enableColumnFilter: true,
      enableHiding: false,
    },
    {
      id: ColumnKey.verifiedAt,
      accessorFn: (row) => (row.verifiedAt ? 'verified' : 'unverified'),
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          label={i18n.t('users.table.verified', 'Xác minh')}
        />
      ),
      cell: ({ row }) => {
        const isEmailVerified = Boolean(row.original.verifiedAt)
        const isCosplayerVerified = Boolean(
          row.original.cosplayerProfile?.isVerified
        )
        return (
          <div className='flex flex-col gap-1'>
            {isEmailVerified ? (
              <Badge variant='outline-success' className='gap-1 text-xs'>
                <BadgeCheck className='text-primary size-3' />
                {i18n.t('users.table.emailVerified', 'Email đã xác minh')}
              </Badge>
            ) : (
              <Badge
                variant='outline'
                className='text-muted-foreground text-xs'
              >
                {i18n.t('users.table.emailUnverified', 'Chưa xác minh email')}
              </Badge>
            )}
            {row.original.cosplayerProfile &&
              (isCosplayerVerified ? (
                <Badge
                  variant='outline'
                  className='border-primary/40 text-primary gap-1 text-xs'
                >
                  <CheckCircle2 className='text-primary size-3' />
                  {i18n.t(
                    'users.table.cosplayerVerified',
                    'Tích xanh Cosplayer'
                  )}
                </Badge>
              ) : (
                <Badge
                  variant='outline'
                  className='text-muted-foreground/70 text-xs'
                >
                  {i18n.t(
                    'users.table.cosplayerUnverified',
                    'Chưa duyệt tích xanh'
                  )}
                </Badge>
              ))}
          </div>
        )
      },
      meta: {
        variant: 'select',
        label: i18n.t('users.table.verified', 'Xác minh'),
        options: [
          {
            label: i18n.t('users.table.filterVerified', 'Đã xác minh email'),
            value: 'verified',
          },
          {
            label: i18n.t(
              'users.table.filterUnverified',
              'Chưa xác minh email'
            ),
            value: 'unverified',
          },
        ],
      },
      enableColumnFilter: true,
    },
    {
      id: ColumnKey.status,
      accessorFn: (row) => (row.deletedAt ? 'deleted' : 'active'),
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          label={i18n.t('common.status', 'Status')}
        />
      ),
      meta: {
        variant: 'select',
        label: i18n.t('common.status', 'Status'),
        options: [
          {
            label: i18n.t('common.status.active', 'Active'),
            value: 'active',
          },
          {
            label: i18n.t('common.status.deleted', 'Deleted'),
            value: 'deleted',
          },
        ],
      },
      cell: ({ row }) => {
        const isDeleted = Boolean(row.original.deletedAt)
        return isDeleted ? (
          <Badge variant='destructive' className='text-xs'>
            {i18n.t('common.status.deleted', 'Deleted')}
          </Badge>
        ) : (
          <Badge variant='outline-success' className='text-xs'>
            {i18n.t('common.status.active', 'Active')}
          </Badge>
        )
      },
      enableColumnFilter: true,
      enableHiding: false,
      enableSorting: false,
    },
    {
      id: ColumnKey.createdAt,
      accessorFn: (row) => row.createdAt,
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          label={i18n.t('users.table.createdAt')}
        />
      ),
      meta: {
        label: i18n.t('users.table.createdAt'),
        variant: 'dateRange',
        icon: Calendar,
      },
      cell: ({ row }) => (
        <p>{format(new Date(row.original.createdAt), 'dd/MM/yyyy HH:mm')}</p>
      ),
      enableColumnFilter: true,
    },
    {
      id: 'actions',
      accessorKey: 'actions',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          label={i18n.t('users.table.actions')}
        />
      ),
      cell: ({ row }) => <ComponentTableRowActions row={row} />,
      size: 40,
      enableColumnFilter: false,
      enableHiding: false,
      enableSorting: false,
    },
  ]
}
