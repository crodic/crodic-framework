import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeftIcon, SaveIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { restApiErrorHandler } from '@/lib/rest-api-handler'
import { useBreadcrumb } from '@/hooks/use-breadcrumb'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { FormActions } from '@/components/layout/form-actions'
import { Main } from '@/components/layout/main'
import { PageHeader } from '@/components/layout/page-shell'
import { PasswordInput } from '@/components/password-input'
import { CosplayerProfileFields } from '../components/cosplayer-profile-fields'
import { apiCreateUser } from '../queries'
import {
  serializeCosplayerProfilePayload,
  userCreateSchema,
  type UserCreateSchema,
} from '../schema'

export function PageUserCreate() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  useBreadcrumb([
    { title: t('navigation.management.users', 'Users'), href: '/users' },
    { title: t('buttons.create', 'Create') },
  ])
  const queryClient = useQueryClient()

  const form = useForm<UserCreateSchema>({
    defaultValues: {},
    resolver: zodResolver(userCreateSchema),
  })

  const createUserMutation = useMutation({
    mutationFn: apiCreateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('User created successfully')
      navigate(-1)
    },
    onError: restApiErrorHandler,
  })

  const onSubmit = (values: UserCreateSchema) => {
    const payload: Record<string, unknown> = {
      firstName: values.firstName,
      lastName: values.lastName ?? '',
      email: values.email,
      password: values.password,
      confirmPassword: values.confirmPassword,
    }
    if (values.username?.trim()) {
      payload.username = values.username.trim()
    }
    if (values.cosplayerProfile) {
      const serialized = serializeCosplayerProfilePayload(
        values.cosplayerProfile
      )
      if (serialized) {
        payload.cosplayerProfile = serialized
      }
    }
    createUserMutation.mutate(payload)
  }

  const pageActions = (
    <>
      <Button
        variant='outline'
        type='button'
        onClick={() => {
          void navigate(-1)
        }}
      >
        <ArrowLeftIcon className='size-4' aria-hidden='true' />
        {t('buttons.cancel')}
      </Button>
      <Button type='submit'>
        <SaveIcon className='size-4' aria-hidden='true' />
        {t('buttons.save')}
      </Button>
    </>
  )

  return (
    <>
      <Main className='flex-1'>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <PageHeader
              title={<>{t('users.create.title')}</>}
              actions={pageActions}
            />

            <Card>
              <CardHeader>
                <CardTitle> {t('users.create.title')}</CardTitle>
                <CardDescription>
                  {t('users.create.description')}
                </CardDescription>
              </CardHeader>
              <CardContent className='grid grid-cols-1 gap-6 md:grid-cols-3'>
                <FormField
                  control={form.control}
                  name='email'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>{t('users.create.email')}</FormLabel>
                      <FormControl>
                        <Input placeholder='test@example.com' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='firstName'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>
                        {t('users.create.firstName')}
                      </FormLabel>
                      <FormControl>
                        <Input placeholder='John' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='lastName'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('users.create.lastName')}</FormLabel>
                      <FormControl>
                        <Input placeholder='Doe' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='username'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder='kiriko_cos' {...field} />
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
                      <FormLabel required>
                        {t('users.create.password')}
                      </FormLabel>
                      <FormControl>
                        <PasswordInput placeholder='***********' {...field} />
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
                      <FormLabel required>
                        {t('users.create.confirmPassword')}
                      </FormLabel>
                      <FormControl>
                        <PasswordInput placeholder='***********' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <CosplayerProfileFields control={form.control} />

            <FormActions footer>{pageActions}</FormActions>
          </form>
        </Form>
      </Main>
    </>
  )
}
