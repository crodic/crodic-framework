import * as React from 'react'
import { ArrowLeftIcon } from 'lucide-react'
import { useNavigate } from 'react-router'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

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
  backLabel = 'Back',
  badges,
  actions,
  children,
  className,
  ...props
}: PageHeaderProps) {
  const navigate = useNavigate()

  return (
    <div
      className={cn(
        'flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4',
        className
      )}
      {...props}
    >
      <div className='flex min-w-0 items-start gap-2.5 sm:gap-4'>
        {backTo !== undefined && (
          <Button
            type='button'
            variant='outline'
            size='icon'
            aria-label={backLabel}
            onClick={() => {
              if (backTo === -1) {
                navigate(-1)
              } else {
                navigate(backTo)
              }
            }}
            className='mt-0.5 size-8 shrink-0'
          >
            <ArrowLeftIcon className='size-4' aria-hidden='true' />
          </Button>
        )}
        <div className='min-w-0 flex-1 space-y-1'>
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

      {(actions || children) && (
        <div className='flex w-full flex-wrap items-center gap-2 self-start sm:w-auto sm:self-auto'>
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
