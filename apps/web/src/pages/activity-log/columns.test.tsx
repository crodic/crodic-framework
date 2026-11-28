import { describe, expect, it } from 'vitest'
import { RestQueryBuilder } from '@/lib/query-builder'
import { getActionBadge, getActivitiesTableColumns } from './columns'
import { activityLogActions, ColumnKey } from './schema'

describe('Activity log action filter', () => {
  it('offers the persisted event values and serializes multiple selected actions', () => {
    const column = getActivitiesTableColumns({
      actions: activityLogActions,
    }).find((column) => column.id === ColumnKey.action)
    const values = column?.meta?.options?.map((option) => option.value)

    // These are the events emitted by the audit subscriber, including both
    // permanent and soft deletion under the same delete event.
    expect(values).toEqual(['create', 'update', 'delete', 'restore'])
    expect(
      new RestQueryBuilder()
        .filter('event', [values![0], values![2]])
        .toQueryString()
    ).toBe('filter[event]=create,delete')
    expect(new RestQueryBuilder().filter('event', []).toQueryString()).toBe('')
  })

  it.each([
    ['create', 'success'],
    ['update', 'info'],
    ['delete', 'destructive'],
    ['restore', 'purple'],
    ['INSERT', 'success'],
    ['SOFT_DELETE', 'destructive'],
  ])('renders the %s event with the %s badge', (action, variant) => {
    expect(getActionBadge(action).props.variant).toBe(variant)
  })
})
