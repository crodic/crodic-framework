import { useTranslation } from 'react-i18next'
import { useBreadcrumb } from '@/hooks/use-breadcrumb'
import { Separator } from '@/components/ui/separator'
import { Main } from '@/components/layout/main'
import { PageHeader } from '@/components/layout/page-shell'
import WebsiteForm from './website-form'

export function SettingsWebsite() {
  const { t } = useTranslation()

  useBreadcrumb([{ title: t('settings.website.title', 'Website Settings') }])

  return (
    <>
      <Main>
        <PageHeader
          title={<>{t('settings.website.title')}</>}
          description={
            <>
              <p className='text-muted-foreground'>
                {t('settings.website.description')}
              </p>
            </>
          }
        />
        <Separator />
        <WebsiteForm />
      </Main>
    </>
  )
}
