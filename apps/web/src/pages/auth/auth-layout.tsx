import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { useAuthStore } from '@/stores/auth-store'
import { cn } from '@/lib/utils'
import { LanguageSwitch } from '@/components/language-switch'
import { RuntimeLogo } from '@/components/runtime-logo'
import { ThemeSwitch } from '@/components/theme-switch'

type AuthLayoutProps = {
  children: React.ReactNode
  className?: string
}

export function AuthLayout({ children, className }: AuthLayoutProps) {
  const { t } = useTranslation()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/')
    }
  }, [isAuthenticated, navigate])

  return (
    <div className='bg-background text-foreground flex min-h-dvh flex-col lg:flex-row'>
      <aside className='bg-muted hidden w-1/2 flex-col justify-between border-r p-10 lg:flex xl:p-12'>
        <RuntimeLogo
          className='h-10 w-auto max-w-48 object-contain'
          placeholderClassName='h-10 w-40'
        />
        <div className='max-w-lg space-y-4 py-12'>
          <h1 className='text-3xl font-semibold tracking-tight text-balance'>
            {t(
              'auth.hero.title',
              'Nền tảng Vận hành & Quản trị Doanh nghiệp Toàn diện'
            )}
          </h1>
          <p className='text-muted-foreground text-base leading-relaxed'>
            {t(
              'auth.hero.description',
              'Kiến trúc Monorepo hiệu năng cao, bảo mật phân quyền RBAC đa cấp, tự động hóa hàng đợi và khả năng tùy biến White-label mạnh mẽ.'
            )}
          </p>
        </div>
        <p className='text-muted-foreground text-sm'>Crodic Framework</p>
      </aside>
      <div className='flex min-h-dvh min-w-0 flex-1 flex-col gap-6 p-4 sm:p-6 lg:p-10'>
        <div className='flex justify-end gap-2'>
          <LanguageSwitch />
          <ThemeSwitch />
        </div>
        <div className='my-auto flex justify-center py-6'>
          <div className={cn('w-full max-w-md space-y-6', className)}>
            <RuntimeLogo
              className='mx-auto h-14 w-auto max-w-60 object-contain lg:hidden'
              placeholderClassName='mx-auto h-14 w-48 lg:hidden'
            />
            {children}
          </div>
        </div>
        <p className='text-muted-foreground text-center text-xs'>
          © {new Date().getFullYear()} Crodic Framework. Developed by Crodic
          Crystal.
        </p>
      </div>
    </div>
  )
}
