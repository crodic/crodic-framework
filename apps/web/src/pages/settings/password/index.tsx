import { useTranslation } from 'react-i18next'
import { useBreadcrumb } from '@/hooks/use-breadcrumb'
import { ContentSection } from '../components/content-section'
import PasswordForm from './password-form'

export function SettingsPassword() {
  const { t } = useTranslation()

  useBreadcrumb([
    { title: t('settings.title', 'Settings'), href: '/settings' },
    { title: t('navigation.other.password', 'Password') },
  ])
  return (
    <ContentSection
      title={t('settings.password.title')}
      desc={t('settings.password.description')}
    >
      <PasswordForm />
    </ContentSection>
  )
}
