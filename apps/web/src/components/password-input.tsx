import * as React from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'

type PasswordInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'type'
> & {
  ref?: React.Ref<HTMLInputElement>
}

export function PasswordInput({
  className,
  disabled,
  ref,
  ...props
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = React.useState(false)

  return (
    <div className='relative w-full'>
      <input
        type={showPassword ? 'text' : 'password'}
        className={cn(
          'border-input placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border bg-transparent px-3 py-1 pe-10 text-sm shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-1 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        disabled={disabled}
        {...props}
      />
      <button
        type='button'
        tabIndex={-1}
        disabled={disabled}
        aria-label={showPassword ? 'Hide password' : 'Show password'}
        className='text-muted-foreground hover:text-foreground absolute end-0 top-0 flex h-full cursor-pointer items-center justify-center px-3 transition-colors hover:bg-transparent focus:outline-hidden disabled:pointer-events-none disabled:opacity-50'
        onClick={() => setShowPassword((prev) => !prev)}
      >
        {showPassword ? (
          <Eye className='size-4 shrink-0' aria-hidden='true' />
        ) : (
          <EyeOff className='size-4 shrink-0' aria-hidden='true' />
        )}
      </button>
    </div>
  )
}
