import { ArrowLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router'
import { Button } from '@/components/ui/button'
import { LanguageSwitch } from '@/components/language-switch'
import { RuntimeLogo } from '@/components/runtime-logo'
import { ThemeSwitch } from '@/components/theme-switch'

interface LegalLayoutProps {
  children: React.ReactNode
  title: string
  subtitle: string
  lastUpdated: string
}

export function LegalLayout({
  children,
  title,
  subtitle,
  lastUpdated,
}: LegalLayoutProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <div className='bg-background text-foreground selection:bg-primary/20 selection:text-primary min-h-screen antialiased'>
      {/* Sticky Glass Header */}
      <header className='border-border/60 bg-background/85 sticky top-0 z-50 w-full border-b backdrop-blur-md'>
        <div className='mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6 lg:px-8'>
          <div className='flex items-center gap-3'>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => {
                if (window.history.length > 1) {
                  navigate(-1)
                } else {
                  navigate('/sign-in')
                }
              }}
              className='text-muted-foreground hover:text-foreground cursor-pointer gap-1.5'
            >
              <ArrowLeft className='size-4' />
              <span className='hidden sm:inline'>
                {t('common.back', { defaultValue: 'Quay lại' })}
              </span>
            </Button>
            <div className='bg-border h-4 w-px' />
            <Link to='/' className='flex items-center gap-2.5'>
              <RuntimeLogo
                className='h-8 w-auto'
                placeholderClassName='h-8 w-20'
              />
              <span className='hidden text-base font-bold tracking-tight sm:inline'>
                Crodic Framework
              </span>
            </Link>
          </div>

          <div className='flex items-center gap-2'>
            <LanguageSwitch />
            <ThemeSwitch />
            <Button
              variant='outline'
              size='sm'
              asChild
              className='hidden cursor-pointer sm:inline-flex'
            >
              <Link to='/sign-in'>
                {t('auth.signIn.title', { defaultValue: 'Sign In' })}
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className='mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8'>
        {/* Hero Section */}
        <div className='border-border/60 mb-10 space-y-3 border-b pb-8 sm:mb-14'>
          <div className='border-primary/20 bg-primary/10 text-primary inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium'>
            <span>{lastUpdated}</span>
          </div>
          <h1 className='text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl'>
            {title}
          </h1>
          <p className='text-muted-foreground max-w-2xl text-base leading-relaxed sm:text-lg'>
            {subtitle}
          </p>
        </div>

        {/* Content Body */}
        <div className='text-foreground/90 space-y-10'>{children}</div>

        {/* Bottom Switch Links */}
        <div className='border-border/60 text-muted-foreground mt-16 flex flex-col items-center justify-between gap-4 border-t pt-8 text-sm sm:flex-row'>
          <div className='flex items-center gap-4'>
            <Link
              to='/terms'
              className='hover:text-primary underline underline-offset-4 transition-colors'
            >
              {t('legal.termsLink', { defaultValue: 'Terms of Service' })}
            </Link>
            <span>•</span>
            <Link
              to='/privacy'
              className='hover:text-primary underline underline-offset-4 transition-colors'
            >
              {t('legal.privacyLink', { defaultValue: 'Privacy Policy' })}
            </Link>
          </div>
          <p>© {new Date().getFullYear()} Crodic Framework · Crodic Crystal</p>
        </div>
      </main>
    </div>
  )
}
