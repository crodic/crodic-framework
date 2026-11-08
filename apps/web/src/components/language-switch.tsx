import { US, VN } from 'country-flag-icons/react/3x2'
import { Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function LanguageSwitch() {
  const { i18n, t } = useTranslation()
  const currentLang = (i18n.language || 'en').toLowerCase().startsWith('vi')
    ? 'vi'
    : 'en'

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          size='icon'
          aria-label={t('common.changeLanguage', 'Change language')}
          className='hover:bg-muted/80 relative scale-95 cursor-pointer rounded-full transition-colors'
        >
          {currentLang === 'vi' ? (
            <VN title='Tiếng Việt' className='size-4.5 rounded-xs shadow-2xs' />
          ) : (
            <US title='English' className='size-4.5 rounded-xs shadow-2xs' />
          )}
          <span className='sr-only'>
            {currentLang === 'vi' ? 'Tiếng Việt' : 'English'}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-40'>
        <DropdownMenuItem
          onClick={() => i18n.changeLanguage('vi')}
          className='flex cursor-pointer items-center justify-between'
        >
          <div className='flex items-center gap-2.5'>
            <VN title='Tiếng Việt' className='size-4 rounded-xs shadow-2xs' />
            <span className='text-xs font-medium'>Tiếng Việt</span>
          </div>
          {currentLang === 'vi' && (
            <Check className='text-primary size-3.5' aria-hidden='true' />
          )}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => i18n.changeLanguage('en')}
          className='flex cursor-pointer items-center justify-between'
        >
          <div className='flex items-center gap-2.5'>
            <US title='English' className='size-4 rounded-xs shadow-2xs' />
            <span className='text-xs font-medium'>English</span>
          </div>
          {currentLang === 'en' && (
            <Check className='text-primary size-3.5' aria-hidden='true' />
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
