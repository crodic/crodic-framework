import { useLayoutEffect, useMemo } from 'react'
import { useLocation } from 'react-router'
import {
  useBreadcrumbStore,
  type BreadcrumbItem,
} from '@/stores/breadcrumb-store'

export type { BreadcrumbItem }

export function useBreadcrumb(items: BreadcrumbItem[]) {
  const setItems = useBreadcrumbStore((state) => state.setItems)
  const clearItems = useBreadcrumbStore((state) => state.clearItems)
  const location = useLocation()

  const serialized = useMemo(
    () =>
      JSON.stringify(
        items.map((item) => ({
          title: typeof item.title === 'string' ? item.title : '',
          href: item.href,
        }))
      ),
    [items]
  )

  useLayoutEffect(() => {
    setItems(items)

    return () => {
      clearItems()
    }
  }, [location.pathname, serialized, setItems, clearItems])
}
