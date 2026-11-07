import { useTranslation } from 'react-i18next'
import { useBreadcrumb } from '@/hooks/use-breadcrumb'
import { ContentSection } from '../components/content-section'
import { AppearanceForm } from './appearance-form'

export function SettingsAppearance() {
  const { t } = useTranslation()

  useBreadcrumb([
    { title: t('settings.title', 'Settings'), href: '/settings' },
    { title: t('navigation.other.appearance', 'Appearance') },
  ])
  return (
    <ContentSection
      title={t('settings.appearance.title')}
      desc={t('settings.appearance.description')}
    >
      <AppearanceForm />
    </ContentSection>
  )
}
