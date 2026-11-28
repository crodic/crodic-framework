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
          description={<>{t('settings.website.description')}</>}
        />
        <Separator className='my-4 lg:my-6' />
        <WebsiteForm />
      </Main>
    </>
  )
}
