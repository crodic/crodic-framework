// import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { AuthLayout } from '../auth-layout'
import { ForgotPasswordForm } from './components/forgot-password-form'

export function ForgotPassword() {
  const { t } = useTranslation()
  return (
    <AuthLayout>
      <Card className='border-border/70 bg-card/95 relative gap-6 overflow-hidden rounded-2xl py-8 shadow-xl backdrop-blur-md sm:py-10'>
        <CardHeader className='space-y-2 px-6 sm:px-8'>
          <CardTitle className='text-2xl font-bold tracking-tight sm:text-3xl'>
            {t('auth.forgotPassword.title')}
          </CardTitle>
          <CardDescription className='text-muted-foreground text-sm leading-relaxed'>
            {t('auth.forgotPassword.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className='px-6 sm:px-8'>
          <ForgotPasswordForm />
        </CardContent>
        <CardFooter className='px-6 pt-2 sm:px-8 sm:pt-3'>
          <p className='text-muted-foreground mx-auto text-center text-xs leading-relaxed'>
            Remember your password?{' '}
            <Link
              to='/sign-in'
              className='text-primary font-medium underline underline-offset-4 transition-opacity hover:opacity-85'
            >
              Sign in
            </Link>
            .
          </p>
        </CardFooter>
      </Card>
    </AuthLayout>
  )
}
