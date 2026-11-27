import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Slot as SlotPrimitive } from 'radix-ui'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-full border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90',
        destructive:
          'border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
        outline:
          'text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground',
        success:
          'border-transparent bg-emerald-500/15 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300 [a&]:hover:bg-emerald-500/25',
        warning:
          'border-transparent bg-amber-500/15 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300 [a&]:hover:bg-amber-500/25',
        info: 'border-transparent bg-sky-500/15 text-sky-700 dark:bg-sky-400/15 dark:text-sky-300 [a&]:hover:bg-sky-500/25',
        purple:
          'border-transparent bg-violet-500/15 text-violet-700 dark:bg-violet-400/15 dark:text-violet-300 [a&]:hover:bg-violet-500/25',
        'outline-success':
          'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-300 [a&]:hover:bg-emerald-500/20',
        'outline-warning':
          'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-300 [a&]:hover:bg-amber-500/20',
        'outline-destructive':
          'border-destructive/30 bg-destructive/10 text-destructive [a&]:hover:bg-destructive/20',
        'outline-info':
          'border-sky-500/30 bg-sky-500/10 text-sky-700 dark:border-sky-400/30 dark:bg-sky-400/10 dark:text-sky-300 [a&]:hover:bg-sky-500/20',
        'solid-success':
          'border-transparent bg-emerald-600 text-white [a&]:hover:bg-emerald-700 dark:bg-emerald-500 dark:text-emerald-950',
        'solid-warning':
          'border-transparent bg-amber-500 text-amber-950 [a&]:hover:bg-amber-600 dark:bg-amber-400',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<'span'> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? SlotPrimitive.Slot : 'span'

  return (
    <Comp
      data-slot='badge'
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
