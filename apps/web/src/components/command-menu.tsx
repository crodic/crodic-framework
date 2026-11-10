import React from 'react'
import { US, VN } from 'country-flag-icons/react/3x2'
import { ArrowRight, ChevronRight, Laptop, Moon, Sun } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { useSearch } from '@/context/search-provider'
import { useTheme } from '@/context/theme-provider'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { sidebarLink } from './layout/data/sidebar-link'

export function CommandMenu() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { setTheme } = useTheme()
  const { open, setOpen } = useSearch()

  const runCommand = React.useCallback(
    (command: () => unknown) => {
      setOpen(false)
      command()
    },
    [setOpen]
  )

  return (
    <CommandDialog
      modal
      open={open}
      onOpenChange={setOpen}
      className='w-[calc(100vw-2rem)] max-w-[calc(100vw-2rem)] overflow-hidden sm:w-full sm:max-w-lg'
    >
      <CommandInput placeholder='Type a command or search...' />
      <CommandList className='max-h-72 overflow-x-hidden px-2'>
        <CommandEmpty>No results found.</CommandEmpty>
        {sidebarLink.navGroups.map((group) => (
          <CommandGroup key={group.title} heading={t(group.title as any)}>
            {group.items.map((navItem, i) => {
              if (navItem.url)
                return (
                  <CommandItem
                    key={`${navItem.url}-${i}`}
                    value={navItem.title}
                    onSelect={() => {
                      runCommand(() => navigate(navItem.url))
                    }}
                    className='min-w-0'
                  >
                    <div className='flex size-4 shrink-0 items-center justify-center'>
                      <ArrowRight className='text-muted-foreground/80 size-2' />
                    </div>
                    <span className='min-w-0 flex-1 truncate'>
                      {t(navItem.title as any)}
                    </span>
                  </CommandItem>
                )

              return navItem.items?.map((subItem, i) => (
                <CommandItem
                  key={`${navItem.title}-${subItem.url}-${i}`}
                  value={`${navItem.title}-${subItem.url}`}
                  onSelect={() => {
                    runCommand(() => navigate(subItem.url))
                  }}
                  className='min-w-0'
                >
                  <div className='flex size-4 shrink-0 items-center justify-center'>
                    <ArrowRight className='text-muted-foreground/80 size-2' />
                  </div>
                  <div className='flex min-w-0 flex-1 items-center gap-1.5 truncate'>
                    <span className='truncate'>{t(navItem.title as any)}</span>
                    <ChevronRight className='text-muted-foreground/60 size-3 shrink-0' />
                    <span className='truncate font-medium'>
                      {t(subItem.title as any)}
                    </span>
                  </div>
                </CommandItem>
              ))
            })}
          </CommandGroup>
        ))}
        <CommandSeparator />
        <CommandGroup heading={t('settings.appearance.theme')}>
          <CommandItem onSelect={() => runCommand(() => setTheme('light'))}>
            <Sun /> <span>{t('settings.appearance.light')}</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => setTheme('dark'))}>
            <Moon className='scale-90' />
            <span>{t('settings.appearance.dark')}</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => setTheme('system'))}>
            <Laptop />
            <span>System</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup
          heading={t('config.language.title', 'Ngôn ngữ / Language')}
        >
          <CommandItem
            onSelect={() => runCommand(() => i18n.changeLanguage('vi'))}
          >
            <VN className='mr-1 size-4 rounded-xs shadow-2xs' />
            <span>Tiếng Việt</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => i18n.changeLanguage('en'))}
          >
            <US className='mr-1 size-4 rounded-xs shadow-2xs' />
            <span>English</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
