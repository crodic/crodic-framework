import { Edit2Icon } from 'lucide-react'
import { useNavigate } from 'react-router'
import {
  TableRowAction,
  TableRowActions,
} from '@/components/data-table/table-row-actions'
import type { PermissionSchema } from './schema'

export default function ComponentTableRowActions({
  row,
}: {
  row: { original: PermissionSchema }
}) {
  const navigate = useNavigate()

  return (
    <TableRowActions>
      <TableRowAction
        label={'Edit permission'}
        icon={
          <Edit2Icon size={16} aria-hidden='true' className='text-primary' />
        }
        onSelect={() => navigate(`/permissions/${row.original.id}/edit`)}
      />
    </TableRowActions>
  )
}
