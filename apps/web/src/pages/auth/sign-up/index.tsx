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
import { SignUpForm } from './components/sign-up-form'

export function SignUp() {
  const { t } = useTranslation()

  return (
    <AuthLayout>
      <Card className='border-border/70 bg-card/95 relative gap-6 overflow-hidden rounded-2xl py-8 shadow-xl backdrop-blur-md sm:py-10'>
        <CardHeader className='space-y-2 px-6 sm:px-8'>
          <CardTitle className='text-2xl font-bold tracking-tight sm:text-3xl'>
            {t('auth.signUp.title', { defaultValue: 'Create an account' })}
          </CardTitle>
          <CardDescription className='text-muted-foreground text-sm leading-relaxed'>
            {t('auth.signUp.description', {
              defaultValue:
                'Enter your email and password to create an account.',
            })}{' '}
            <br />
            {t('auth.signUp.hasAccount', {
              defaultValue: 'Already have an account?',
            })}{' '}
            <Link
              to='/sign-in'
              className='text-primary font-medium underline underline-offset-4 transition-opacity hover:opacity-85'
            >
              {t('auth.signIn.title', { defaultValue: 'Sign In' })}
            </Link>
          </CardDescription>
        </CardHeader>
        <CardContent className='px-6 sm:px-8'>
          <SignUpForm />
        </CardContent>
        <CardFooter className='px-6 pt-2 sm:px-8 sm:pt-3'>
          <p className='text-muted-foreground mx-auto text-center text-xs leading-relaxed'>
            {t('auth.signUp.termsNotice')}{' '}
            <a
              href='/terms'
              className='text-foreground hover:text-primary underline underline-offset-4 transition-colors'
            >
              {t('auth.signUp.termsOfService')}
            </a>{' '}
            {t('auth.signUp.and')}{' '}
            <a
              href='/privacy'
              className='text-foreground hover:text-primary underline underline-offset-4 transition-colors'
            >
              {t('auth.signUp.privacyPolicy')}
            </a>
            .
          </p>
        </CardFooter>
      </Card>
    </AuthLayout>
  )
}
