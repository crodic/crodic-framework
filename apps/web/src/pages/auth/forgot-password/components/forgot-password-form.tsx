import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight, Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
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
import { apiForgotPassword } from '../../queries'
import { forgotPasswordSchema, type ForgotPasswordSchema } from '../../schema'

export function ForgotPasswordForm({
  className,
  ...props
}: React.HTMLAttributes<HTMLFormElement>) {
  const { t } = useTranslation()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<ForgotPasswordSchema>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  })

  function onSubmit(data: ForgotPasswordSchema) {
    setIsLoading(true)

    toast.promise(apiForgotPassword(data.email), {
      loading: 'Sending email...',
      success: () => {
        setIsLoading(false)
        form.reset()
        return `Email sent to ${data.email}`
      },
      error: 'Error',
    })
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('grid gap-4.5 sm:gap-5', className)}
        {...props}
      >
        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='text-sm font-medium'>
                {t('auth.forgotPassword.email')}
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
        <Button
          className='mt-2.5 h-10.5 w-full cursor-pointer gap-2 font-medium shadow-sm transition-all hover:shadow-md sm:mt-3 sm:h-11'
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className='size-4 animate-spin' aria-hidden='true' />
          ) : (
            <ArrowRight className='size-4' aria-hidden='true' />
          )}
          {t('buttons.continue')}
        </Button>
      </form>
    </Form>
  )
}
