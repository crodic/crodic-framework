'use client'

import * as React from 'react'
import type { Table } from '@tanstack/react-table'
import { Download, Trash2, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { exportTableToCSV } from '@/lib/export'
import {
  ActionBar,
  ActionBarClose,
  ActionBarGroup,
  ActionBarItem,
  ActionBarSelection,
  ActionBarSeparator,
} from '@/components/ui/action-bar'
import { type TagSummary } from '../schema'

interface TagsTableActionBarProps {
  table: Table<TagSummary>
  onDelete: (tags: TagSummary[]) => void
  disabled?: boolean
}

export function TagsTableActionBar({
  table,
  onDelete,
  disabled = false,
}: TagsTableActionBarProps) {
  const { t } = useTranslation()
  const rows = table.getFilteredSelectedRowModel().rows

  const onOpenChange = React.useCallback(
    (open: boolean) => {
      if (!open) {
        table.toggleAllRowsSelected(false)
      }
    },
    [table]
  )

  const onExport = React.useCallback(() => {
    exportTableToCSV(table, {
      excludeColumns: ['select', 'actions'],
      onlySelected: true,
      filename: 'tags-export',
    })
  }, [table])

  return (
    <ActionBar open={rows.length > 0} onOpenChange={onOpenChange}>
      <ActionBarSelection>
        <span className='font-medium tabular-nums'>{rows.length}</span>
        <span>{t('tags.table.selected', 'selected')}</span>
        <ActionBarSeparator />
        <ActionBarClose
          aria-label={t('common.clearSelection', 'Clear selection')}
        >
          <X aria-hidden='true' />
        </ActionBarClose>
      </ActionBarSelection>
      <ActionBarSeparator />
      <ActionBarGroup>
        <ActionBarItem onClick={onExport} disabled={disabled}>
          <Download aria-hidden='true' />
          {t('buttons.export', 'Export')}
        </ActionBarItem>
        <ActionBarItem
          variant='destructive'
          onClick={() => onDelete(rows.map((row) => row.original))}
          disabled={disabled}
        >
          <Trash2 aria-hidden='true' />
          {t('buttons.delete', 'Delete')}
        </ActionBarItem>
      </ActionBarGroup>
    </ActionBar>
  )
}
