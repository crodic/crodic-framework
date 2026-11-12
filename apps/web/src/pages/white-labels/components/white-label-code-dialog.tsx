import { FileCodeIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

type WhiteLabelCodeDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  cssText: string
  onCopyCss: () => void
}

export function WhiteLabelCodeDialog({
  open,
  onOpenChange,
  cssText,
  onCopyCss,
}: WhiteLabelCodeDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='flex max-h-[min(90vh,calc(100dvh-2rem))] w-[calc(100%-1.5rem)] flex-col gap-0 overflow-hidden p-0 shadow-2xl sm:max-w-4xl'>
        <DialogHeader className='shrink-0 border-b px-4 py-3 pr-10 text-left sm:px-6 sm:py-4'>
          <DialogTitle className='text-sm font-semibold sm:text-base'>
            Theme CSS Code View
          </DialogTitle>
          <DialogDescription className='line-clamp-2 text-xs sm:line-clamp-none'>
            Generated shadcn & Tailwind CSS variables matching your active
            profile.
          </DialogDescription>
        </DialogHeader>
        <div className='bg-muted/30 min-h-0 flex-1 overflow-auto'>
          <pre className='overflow-x-auto p-3.5 font-mono text-[11px] leading-relaxed whitespace-pre sm:p-5 sm:text-xs'>
            <code>{cssText}</code>
          </pre>
        </div>
        <DialogFooter className='bg-background flex shrink-0 items-center justify-end border-t px-4 py-3 sm:px-6 sm:py-3.5'>
          <Button
            type='button'
            size='sm'
            variant='outline'
            className='w-full sm:w-auto'
            onClick={onCopyCss}
          >
            <FileCodeIcon className='me-1.5 size-4' />
            Copy CSS
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
