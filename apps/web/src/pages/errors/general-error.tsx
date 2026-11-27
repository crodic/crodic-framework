import { useTranslation } from 'react-i18next'
import { useNavigate, useRouteError } from 'react-router'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'

type GeneralErrorProps = React.HTMLAttributes<HTMLDivElement> & {
  minimal?: boolean
}

export function GeneralError({
  className,
  minimal = false,
}: GeneralErrorProps) {
  const { t } = useTranslation()
  const error = useRouteError() as {
    statusText: string | null
    message: string | null
  } & Error

  const errorMessage = [error.statusText, error.message]
    .filter((i) => i != null && i.length > 0)
    .join(':')

  const navigate = useNavigate()
  return (
    <div
      className={cn(
        'flex min-h-dvh w-full items-center justify-center p-4 sm:p-6',
        className
      )}
    >
      <div className='flex w-full max-w-md flex-col items-center justify-center gap-2 text-center'>
        {!minimal && (
          <h1 className='text-[7rem] leading-tight font-bold tabular-nums'>
            500
          </h1>
        )}
        <span className='font-medium text-balance'>
          {t('errors.general.title')}
        </span>
        <p className='text-muted-foreground text-center text-pretty'>
          {t('errors.general.description')}
        </p>
        <p className='text-destructive text-center'>{errorMessage}</p>
        <Collapsible className='text-muted-foreground'>
          <CollapsibleTrigger>
            <i>{t('errors.general.seeMore')}</i>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <pre>{error.stack}</pre>
          </CollapsibleContent>
        </Collapsible>
        {!minimal && (
          <div className='mt-6 flex flex-wrap justify-center gap-4'>
            <Button variant='outline' onClick={() => navigate(-1)}>
              {t('errors.common.goBack')}
            </Button>
            <Button onClick={() => navigate('/')}>
              {t('errors.common.backHome')}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
