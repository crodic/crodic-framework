import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { IconFacebook, IconGithub } from '@/assets/brand-icons'
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

const formSchema = z
  .object({
    email: z.email({
      error: (iss) =>
        iss.input === '' ? 'Please enter your email' : undefined,
    }),
    password: z
      .string()
      .min(1, 'Please enter your password')
      .min(7, 'Password must be at least 7 characters long'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ['confirmPassword'],
  })

export function SignUpForm({
  className,
  ...props
}: React.HTMLAttributes<HTMLFormElement>) {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true)
    // eslint-disable-next-line no-console
    console.log(data)

    setTimeout(() => {
      setIsLoading(false)
    }, 3000)
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('grid gap-4 sm:gap-4.5', className)}
        {...props}
      >
        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='text-sm font-medium'>Email</FormLabel>
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
            <FormItem>
              <FormLabel className='text-sm font-medium'>Password</FormLabel>
              <FormControl>
                <PasswordInput
                  placeholder='********'
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
          name='confirmPassword'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='text-sm font-medium'>
                Confirm Password
              </FormLabel>
              <FormControl>
                <PasswordInput
                  placeholder='********'
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
          Create Account
        </Button>

        <div className='relative my-2 sm:my-3'>
          <div className='absolute inset-0 flex items-center'>
            <span className='border-border/70 w-full border-t' />
          </div>
          <div className='relative flex justify-center text-xs uppercase'>
            <span className='bg-card text-muted-foreground px-2'>
              Or continue with
            </span>
          </div>
        </div>

        <div className='grid grid-cols-2 gap-3'>
          <Button
            variant='outline'
            className='h-10 w-full cursor-pointer gap-2 font-medium'
            type='button'
            disabled={isLoading}
          >
            <IconGithub className='size-4' aria-hidden='true' /> GitHub
          </Button>
          <Button
            variant='outline'
            className='h-10 w-full cursor-pointer gap-2 font-medium'
            type='button'
            disabled={isLoading}
          >
            <IconFacebook className='size-4' aria-hidden='true' /> Facebook
          </Button>
        </div>
      </form>
    </Form>
  )
}
