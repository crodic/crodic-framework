import { US, VN } from 'country-flag-icons/react/3x2'
import { useTranslation } from 'react-i18next'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const LanguageSelect = () => {
  const { i18n, t } = useTranslation()
  const currentLang = (i18n.resolvedLanguage || i18n.language || 'vi')
    .toLowerCase()
    .startsWith('vi')
    ? 'vi'
    : 'en'

  return (
    <Select
      value={currentLang}
      onValueChange={(value) => i18n.changeLanguage(value)}
    >
      <SelectTrigger className='flex min-w-62.5'>
        <SelectValue placeholder={t('settings.appearance.languages')} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value='en'>
          <div className='flex items-center gap-2'>
            <US title='United States' className='size-4' />
            <p>{t('config.language.english')}</p>
          </div>
        </SelectItem>
        <SelectItem value='vi'>
          <div className='flex items-center gap-2'>
            <VN title='Vietnamese' className='size-4' />
            <p>{t('config.language.vietnamese')}</p>
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  )
}

export default LanguageSelect
