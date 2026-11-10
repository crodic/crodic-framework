import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router'
import { toast } from 'sonner'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { AuthLayout } from '../auth-layout'
import { UserAuthForm } from './user-auth-form'

export function SignIn() {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'
  const verification = searchParams.get('verification')
  const handledVerificationRef = useRef<string | null>(null)

  useEffect(() => {
    if (
      !verification ||
      handledVerificationRef.current === verification ||
      (verification !== 'success' && verification !== 'failed')
    ) {
      return
    }

    handledVerificationRef.current = verification

    if (verification === 'success') {
      toast.success(t('auth.signIn.messageVerifySuccess'))
    }

    if (verification === 'failed') {
      toast.error(t('auth.signIn.messageVerifyFailed'))
    }

    const nextSearchParams = new URLSearchParams(searchParams)

    nextSearchParams.delete('verification')
    setSearchParams(nextSearchParams, { replace: true })
  }, [searchParams, setSearchParams, t, verification])

  return (
    <AuthLayout>
      <Card className='border-border/70 bg-card/95 relative gap-6 overflow-hidden rounded-2xl py-8 shadow-xl backdrop-blur-md sm:py-10'>
        <CardHeader className='space-y-2 px-6 sm:px-8'>
          <CardTitle className='text-2xl font-bold tracking-tight sm:text-3xl'>
            {t('auth.signIn.title')}
          </CardTitle>
          <CardDescription className='text-muted-foreground text-sm leading-relaxed'>
            {t('auth.signIn.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className='px-6 sm:px-8'>
          <UserAuthForm redirectTo={redirect} />
        </CardContent>
        <CardFooter className='px-6 pt-2 sm:px-8 sm:pt-3'>
          <p className='text-muted-foreground mx-auto text-center text-xs leading-relaxed'>
            By signing in, you agree to our{' '}
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
