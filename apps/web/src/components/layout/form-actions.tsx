import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/** Repeat the same action content at the start and end of a resource form. */
export function FormActions({
  children,
  footer = false,
}: {
  children: ReactNode
  footer?: boolean
}) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-end gap-2',
        footer && 'border-t pt-6'
      )}
    >
      {children}
    </div>
  )
}
