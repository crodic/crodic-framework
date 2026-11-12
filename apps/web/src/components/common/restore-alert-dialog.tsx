import { Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface RestoreAlertDialogProps {
  handleRestore: () => void
  isLoading: boolean
  title?: string
  description?: string
  translationValues?: Record<string, string>
  confirmText?: string
  cancelText?: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RestoreAlertDialog({
  handleRestore,
  isLoading,
  title = 'common.popup.restoreTitle',
  description = 'common.popup.restoreDescription',
  translationValues,
  confirmText = 'buttons.confirm',
  cancelText = 'buttons.cancel',
  open,
  onOpenChange,
}: RestoreAlertDialogProps) {
  const { t } = useTranslation()

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t(title as any, translationValues)}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t(description as any, translationValues)}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            {t(cancelText as any) ?? t('buttons.cancel')}
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleRestore} disabled={isLoading}>
            {isLoading ? (
              <Loader2
                className='mr-2 size-4 animate-spin'
                aria-hidden='true'
              />
            ) : null}
            {t(confirmText as any) ?? t('buttons.confirm')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
