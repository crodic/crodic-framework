import { useEffect } from 'react'
import { ShieldCheck, Sparkles, Workflow } from 'lucide-react'
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
    <div className='bg-background text-foreground selection:bg-primary/20 selection:text-primary relative flex min-h-dvh w-full overflow-x-hidden antialiased'>
      {/* ===== Left Side: Immersive Enterprise Showcase (Visible on lg+) ===== */}
      <div className='relative hidden w-1/2 flex-col justify-between overflow-hidden bg-slate-950 p-10 text-white lg:flex xl:w-7/12 xl:p-14 dark:bg-black'>
        {/* Ambient Glows */}
        <div className='pointer-events-none absolute -top-40 -left-40 size-[32rem] rounded-full bg-blue-600/20 blur-3xl' />
        <div className='pointer-events-none absolute top-1/2 -right-40 size-[28rem] -translate-y-1/2 rounded-full bg-indigo-600/15 blur-3xl' />
        <div className='pointer-events-none absolute -bottom-40 left-1/4 size-[24rem] rounded-full bg-emerald-600/10 blur-3xl' />

        {/* Subtle Decorative Grid Pattern */}
        <div className='pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_70%_70%_at_50%_50%,#000_60%,transparent_100%)] bg-[size:4rem_4rem]' />

        {/* Top Branding Bar */}
        <div className='relative z-10 flex items-center justify-between'>
          <div className='flex items-center gap-3.5'>
            <div className='flex h-12 max-w-[180px] min-w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 shadow-inner backdrop-blur-md'>
              <RuntimeLogo
                className='h-8 w-auto max-w-[150px] object-contain'
                placeholderClassName='h-8 w-8'
              />
            </div>
            <div>
              <span className='text-lg font-bold tracking-tight text-white'>
                Crodic Framework
              </span>
              <p className='text-xs text-slate-400'>Enterprise Platform</p>
            </div>
          </div>

          <div className='inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400 backdrop-blur-md'>
            <span className='size-1.5 animate-pulse rounded-full bg-emerald-400' />
            <span>Operational 99.9%</span>
          </div>
        </div>

        {/* Middle: Value Proposition & Feature Highlights */}
        <div className='relative z-10 my-auto space-y-8 py-10'>
          <div className='max-w-xl space-y-4'>
            <h1 className='bg-gradient-to-br from-white via-slate-100 to-slate-300 bg-clip-text text-3xl font-extrabold tracking-tight text-balance text-transparent sm:text-4xl xl:text-5xl'>
              {t(
                'auth.hero.title',
                'Nền tảng Vận hành & Quản trị Doanh nghiệp Toàn diện'
              )}
            </h1>
            <p className='text-base leading-relaxed text-pretty text-slate-400'>
              {t(
                'auth.hero.description',
                'Kiến trúc Monorepo hiệu năng cao, bảo mật phân quyền RBAC đa cấp, tự động hóa hàng đợi và khả năng tùy biến White-label mạnh mẽ.'
              )}
            </p>
          </div>

          {/* Feature Highlight Cards */}
          <div className='grid max-w-lg gap-3.5'>
            <div className='flex items-start gap-3.5 rounded-xl border border-white/10 bg-white/[0.04] p-3.5 backdrop-blur-md transition-colors hover:bg-white/[0.07]'>
              <div className='flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400'>
                <ShieldCheck className='size-5' />
              </div>
              <div className='min-w-0 flex-1'>
                <p className='text-sm font-semibold text-white'>
                  {t(
                    'auth.hero.feature1Title',
                    'Phân quyền RBAC & Bảo mật 2FA'
                  )}
                </p>
                <p className='mt-0.5 text-xs leading-relaxed text-slate-400'>
                  {t(
                    'auth.hero.feature1Desc',
                    'Kiểm soát quyền truy cập chi tiết theo vai trò và bảo vệ tài khoản với xác thực 2 lớp.'
                  )}
                </p>
              </div>
            </div>

            <div className='flex items-start gap-3.5 rounded-xl border border-white/10 bg-white/[0.04] p-3.5 backdrop-blur-md transition-colors hover:bg-white/[0.07]'>
              <div className='flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/15 text-blue-400'>
                <Workflow className='size-5' />
              </div>
              <div className='min-w-0 flex-1'>
                <p className='text-sm font-semibold text-white'>
                  {t(
                    'auth.hero.feature2Title',
                    'Xử lý Hàng đợi & Giám sát Hệ thống'
                  )}
                </p>
                <p className='mt-0.5 text-xs leading-relaxed text-slate-400'>
                  {t(
                    'auth.hero.feature2Desc',
                    'Hàng đợi BullMQ, Redis cache, Activity logs và theo dõi sức khỏe vi dịch vụ thời gian thực.'
                  )}
                </p>
              </div>
            </div>

            <div className='flex items-start gap-3.5 rounded-xl border border-white/10 bg-white/[0.04] p-3.5 backdrop-blur-md transition-colors hover:bg-white/[0.07]'>
              <div className='flex size-9 shrink-0 items-center justify-center rounded-lg bg-purple-500/15 text-purple-400'>
                <Sparkles className='size-5' />
              </div>
              <div className='min-w-0 flex-1'>
                <p className='text-sm font-semibold text-white'>
                  {t(
                    'auth.hero.feature3Title',
                    'Tùy biến Thương hiệu White-label'
                  )}
                </p>
                <p className='mt-0.5 text-xs leading-relaxed text-slate-400'>
                  {t(
                    'auth.hero.feature3Desc',
                    'Linh hoạt điều chỉnh token màu sắc, phông chữ, logo và tên miền cho từng đối tác.'
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Attribution */}
        <div className='relative z-10 flex items-center justify-between border-t border-white/10 pt-6 text-xs text-slate-400'>
          <p>
            {t(
              'auth.hero.authorQuote',
              '“Thiết kế cho các hệ thống doanh nghiệp đòi hỏi độ tin cậy và tốc độ xử lý cao.”'
            )}
          </p>
          <span className='ms-4 shrink-0 font-medium text-slate-300'>
            Crodic Crystal
          </span>
        </div>
      </div>

      {/* ===== Right Side: Focused Form Area (Centered on Mobile & Tablet) ===== */}
      <div className='relative flex min-h-dvh w-full flex-1 flex-col justify-between p-4 sm:p-8 lg:w-1/2 lg:p-12 xl:w-5/12'>
        {/* Subtle Top Ambient Gradient */}
        <div className='from-primary/5 pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b via-transparent to-transparent' />

        {/* Top Header Controls: Utilities */}
        <div className='relative z-10 flex items-center justify-end'>
          {/* Quick Utility Actions on right */}
          <div className='flex items-center gap-2'>
            <LanguageSwitch />
            <ThemeSwitch />
          </div>
        </div>

        {/* Center Form Container */}
        <div className='relative z-10 my-auto flex w-full flex-col items-center justify-center py-6 sm:py-8'>
          <div className={cn('w-full max-w-md space-y-6', className)}>
            {/* Prominent Brand Logo Header (Visible on Mobile & Desktop) */}
            <div className='flex flex-col items-center justify-center pb-2 text-center'>
              <RuntimeLogo
                className='h-16 w-auto max-w-[280px] object-contain drop-shadow-md sm:h-20 sm:max-w-[340px] lg:h-24'
                placeholderClassName='h-16 sm:h-20 lg:h-24 w-48 sm:w-60'
              />
            </div>

            {/* Auth Form Card */}
            {children}
          </div>
        </div>

        {/* Bottom Footer */}
        <div className='text-muted-foreground relative z-10 pt-4 text-center text-xs'>
          <p>
            © {new Date().getFullYear()} Crodic Framework. Developed by{' '}
            <span className='text-foreground font-medium'>Crodic Crystal</span>.
          </p>
        </div>
      </div>
    </div>
  )
}
