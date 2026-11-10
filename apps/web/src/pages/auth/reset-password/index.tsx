import { useTranslation } from 'react-i18next'
import { Navigate, useSearchParams } from 'react-router'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { AuthLayout } from '../auth-layout'
import { ResetPasswordForm } from './components/reset-password-form'

export function ResetPassword() {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  if (token === null) {
    return <Navigate to='/errors/forbidden' />
  }

  return (
    <AuthLayout>
      <Card className='border-border/70 bg-card/95 relative gap-6 overflow-hidden rounded-2xl py-8 shadow-xl backdrop-blur-md sm:py-10'>
        <CardHeader className='space-y-2 px-6 sm:px-8'>
          <CardTitle className='text-2xl font-bold tracking-tight sm:text-3xl'>
            {t('auth.resetPassword.title')}
          </CardTitle>
          <CardDescription className='text-muted-foreground text-sm leading-relaxed'>
            {t('auth.resetPassword.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className='px-6 sm:px-8'>
          <ResetPasswordForm />
        </CardContent>
        <CardFooter className='px-6 pt-2 sm:px-8 sm:pt-3'>
          <p className='text-muted-foreground mx-auto text-center text-xs leading-relaxed'>
            By continuing, you agree to our{' '}
            <a
              href='/terms'
              className='text-foreground hover:text-primary underline underline-offset-4 transition-colors'
            >
              Terms of Service
            </a>{' '}
            and{' '}
            <a
              href='/privacy'
              className='text-foreground hover:text-primary underline underline-offset-4 transition-colors'
            >
              Privacy Policy
            </a>
            .
          </p>
        </CardFooter>
      </Card>
    </AuthLayout>
  )
}
