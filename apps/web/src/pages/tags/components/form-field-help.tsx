import { CircleAlert } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface FormFieldHelpProps {
  tooltip: string
  className?: string
}

export function FormFieldHelp({ tooltip, className }: FormFieldHelpProps) {
  return (
    <Tooltip delayDuration={150}>
      <TooltipTrigger asChild>
        <button
          type='button'
          tabIndex={-1}
          aria-label={tooltip}
          onClick={(e) => e.preventDefault()}
          className={cn(
            'text-muted-foreground/60 hover:text-primary inline-flex size-4 shrink-0 cursor-help items-center justify-center transition-colors',
            className
          )}
        >
          <CircleAlert className='size-3.5' aria-hidden='true' />
        </button>
      </TooltipTrigger>
      <TooltipContent
        side='top'
        align='start'
        sideOffset={4}
        className='max-w-xs text-xs leading-relaxed text-pretty'
      >
        {tooltip}
      </TooltipContent>
    </Tooltip>
  )
}
