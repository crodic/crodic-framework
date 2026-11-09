import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'

export function MaintenanceError() {
  const { t } = useTranslation()

  return (
    <div className='flex min-h-dvh w-full items-center justify-center p-4 sm:p-6'>
      <div className='flex w-full max-w-md flex-col items-center justify-center gap-2 text-center'>
        <h1 className='text-[7rem] leading-tight font-bold tabular-nums'>
          503
        </h1>
        <span className='font-medium text-balance'>
          {t('errors.maintenance.title')}
        </span>
        <p className='text-muted-foreground text-center text-pretty'>
          {t('errors.maintenance.description')}
        </p>
        <div className='mt-6 flex gap-4'>
          <Button variant='outline'>{t('errors.maintenance.learnMore')}</Button>
        </div>
      </div>
    </div>
  )
}
