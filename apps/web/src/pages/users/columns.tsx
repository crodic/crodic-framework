import { format } from 'date-fns'
import type { ColumnDef } from '@tanstack/react-table'
import i18n from '@/i18n'
import {
  BadgeCheck,
  Calendar,
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
      id: ColumnKey.role,
      accessorFn: (row) => row.role,
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          label={i18n.t('users.table.role', 'Vai trò')}
        />
      ),
      cell: ({ row }) => {
        const role = row.original.role
        if (role === 'cosplayer') {
          return (
            <Badge className='border-purple-200 bg-purple-600/15 text-xs text-purple-700 dark:border-purple-800 dark:bg-purple-500/20 dark:text-purple-300'>
              Cosplayer{' '}
              {row.original.cosplayerProfile?.rankingScore
                ? `(${row.original.cosplayerProfile.rankingScore}đ)`
                : ''}
            </Badge>
          )
        }
        if (role === 'recruiter') {
          return (
            <Badge className='border-blue-200 bg-blue-600/15 text-xs text-blue-700 dark:border-blue-800 dark:bg-blue-500/20 dark:text-blue-300'>
              Nhà tuyển dụng / Brand
            </Badge>
          )
        }
        return (
          <Badge variant='outline' className='text-xs'>
            Fan
          </Badge>
        )
      },
      meta: {
        variant: 'select',
        label: i18n.t('users.table.role', 'Vai trò'),
        options: [
          { label: 'Fan', value: 'fan' },
          { label: 'Cosplayer', value: 'cosplayer' },
          { label: 'Nhà tuyển dụng / Brand', value: 'recruiter' },
        ],
      },
      enableColumnFilter: true,
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
        const isVerified = Boolean(row.original.verifiedAt)
        return isVerified ? (
          <Badge variant='outline-success' className='gap-1 text-xs'>
            <BadgeCheck className='size-3 text-emerald-600' />
            Đã xác minh
          </Badge>
        ) : (
          <Badge variant='outline' className='text-muted-foreground text-xs'>
            Chưa xác minh
          </Badge>
        )
      },
      meta: {
        variant: 'select',
        label: i18n.t('users.table.verified', 'Xác minh'),
        options: [
          { label: 'Đã xác minh', value: 'verified' },
          { label: 'Chưa xác minh', value: 'unverified' },
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
