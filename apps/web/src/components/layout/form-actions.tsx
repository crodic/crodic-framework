import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

/** Shared alignment and spacing for header and footer form actions. */
export function FormActions({
  children,
  footer = false,
  className,
  ...props
}: ComponentProps<'div'> & { footer?: boolean }) {
  return (
    <div
      data-slot='form-actions'
      className={cn(
        'flex w-full flex-wrap items-center justify-end gap-2',
        footer && 'border-t pt-6',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
