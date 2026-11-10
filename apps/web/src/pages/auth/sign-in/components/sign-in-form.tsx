import type { HTMLAttributes } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import { Loader2, LogIn } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/password-input'
import type { LoginSchema } from '../../schema'
import { UnverifiedEmailAlert } from './unverified-email-alert'

interface SignInFormProps extends Omit<
  HTMLAttributes<HTMLFormElement>,
  'onSubmit'
> {
  form: UseFormReturn<LoginSchema>
  isPending: boolean
  unverifiedEmail: string | null
  onSubmit: (data: LoginSchema) => void
}

export function SignInForm({
  className,
  form,
  isPending,
  unverifiedEmail,
  onSubmit,
  ...props
}: SignInFormProps) {
  const { t } = useTranslation()

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('grid gap-4.5 sm:gap-5', className)}
        {...props}
      >
        {unverifiedEmail && <UnverifiedEmailAlert email={unverifiedEmail} />}
        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='text-sm font-medium'>
                {t('auth.signIn.email')}
              </FormLabel>
              <FormControl>
                <Input
                  placeholder='name@example.com'
                  className='h-10 sm:h-10.5'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem className='relative'>
              <FormLabel className='text-sm font-medium'>
                {t('auth.signIn.password')}
              </FormLabel>
              <FormControl>
                <PasswordInput
                  placeholder='********'
                  className='h-10 sm:h-10.5'
                  {...field}
                />
              </FormControl>
              <FormMessage />
              <Link
                to='/forgot-password'
                className='text-muted-foreground hover:text-foreground absolute end-0 -top-0.5 text-sm font-medium transition-colors'
              >
                {t('auth.signIn.messageForgotPassword')}
              </Link>
            </FormItem>
          )}
        />
        <Button
          className='mt-2.5 h-10.5 w-full cursor-pointer gap-2 font-medium shadow-sm transition-all hover:shadow-md sm:mt-3 sm:h-11'
          disabled={isPending}
        >
          {isPending ? (
            <Loader2 className='size-4 animate-spin' aria-hidden='true' />
          ) : (
            <LogIn className='size-4' aria-hidden='true' />
          )}
          {t('auth.signIn.messageSignIn')}
        </Button>
      </form>
    </Form>
  )
}
