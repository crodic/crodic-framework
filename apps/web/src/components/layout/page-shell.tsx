import * as React from 'react'
import { ArrowLeftIcon } from 'lucide-react'
import { useNavigate } from 'react-router'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export const PageHeaderContext = React.createContext<{
  backTo?: string | -1
  backLabel?: string
  hideBack?: boolean
}>({})

interface PageShellProps extends React.HTMLAttributes<HTMLDivElement> {
  fixed?: boolean
}

export function PageShell({
  className,
  fixed,
  children,
  ...props
}: PageShellProps) {
  return (
    <div
      className={cn(
        'flex w-full min-w-0 flex-col gap-6',
        fixed && 'flex-1 overflow-hidden',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

interface PageHeaderProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'title'
> {
  title: React.ReactNode
  description?: React.ReactNode
  backTo?: string | -1
  backLabel?: string
  badges?: React.ReactNode
  actions?: React.ReactNode
}

export function PageHeader({
  title,
  description,
  backTo,
  backLabel,
  badges,
  actions,
  children,
  className,
  ...props
}: PageHeaderProps) {
  const navigate = useNavigate()
  const inherited = React.useContext(PageHeaderContext)
  const resolvedBackTo = backTo ?? inherited.backTo
  const resolvedBackLabel = backLabel ?? inherited.backLabel ?? 'Back'

  return (
    <div
      className={cn(
        'flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between',
        className
      )}
      {...props}
    >
      <div className='flex min-w-0 flex-1 items-start gap-3'>
        <div className='min-w-0 flex-1 space-y-2'>
          <div className='flex flex-wrap items-center gap-2'>
            <h1 className='text-2xl font-semibold tracking-tight text-balance break-words'>
              {title}
            </h1>
            {badges}
          </div>
          {description && (
            <div className='text-muted-foreground text-sm text-pretty'>
              {description}
            </div>
          )}
        </div>
      </div>

      {(resolvedBackTo !== undefined || actions || children) && (
        <div className='flex w-full flex-wrap items-center gap-2 lg:w-auto lg:shrink-0'>
          {resolvedBackTo !== undefined && !inherited.hideBack && (
            <Button
              type='button'
              variant='outline'
              onClick={() => {
                if (resolvedBackTo === -1) navigate(-1)
                else navigate(resolvedBackTo)
              }}
            >
              <ArrowLeftIcon className='size-4' aria-hidden='true' />
              {resolvedBackLabel}
            </Button>
          )}
          {actions || children}
        </div>
      )}
    </div>
  )
}

export function PageBody({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('flex flex-col gap-4 sm:gap-6', className)} {...props}>
      {children}
    </div>
  )
}
