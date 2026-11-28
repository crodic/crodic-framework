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
import { Card, CardContent } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import AutoCompleteSelectControl from '@/components/forms/auto-complete-select-control'
import { DatePickerForm } from '@/components/forms/date-picker-form'
import { PhoneInput } from '@/components/forms/phone-input'
import { FormActions } from '@/components/layout/form-actions'
import { Main } from '@/components/layout/main'
import { PageHeader } from '@/components/layout/page-shell'
import { PasswordInput } from '@/components/password-input'
import { useDataRoleFormOptions } from '@/pages/roles/queries'
import { apiCreateAdmin } from '../queries'
import { type AdminCreateSchema, adminCreateSchema } from '../schema'

export function PageAdminCreate() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  useBreadcrumb([
    { title: t('navigation.management.admins', 'Admins'), href: '/admins' },
    { title: t('buttons.create', 'Create') },
  ])
  const queryClient = useQueryClient()

  const { data, isLoading } = useDataRoleFormOptions()

  const form = useForm<AdminCreateSchema>({
    defaultValues: {
      roleIds: [],
    },
    resolver: zodResolver(adminCreateSchema),
  })

  const createAdminMutation = useMutation({
    mutationFn: apiCreateAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins'] })
      toast.success('Admin created successfully')
      navigate(-1)
    },
    onError: restApiErrorHandler,
  })

  const onSubmit = (values: AdminCreateSchema) => {
    createAdminMutation.mutate(values)
  }

  return (
    <>
      <Main className='flex flex-1 flex-col'>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <PageHeader
              title={<>{t('adminUsers.create.title')}</>}
              actions={
                <>
                  <FormActions>
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
                  </FormActions>
                </>
              }
              description={<>{t('adminUsers.create.description')}</>}
            />

            <Card>
              <CardContent className='grid grid-cols-1 gap-6 md:grid-cols-3'>
                <FormField
                  control={form.control}
                  name='email'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>
                        {t('adminUsers.create.email')}
                      </FormLabel>
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
                        {t('adminUsers.create.firstName')}
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
                      <FormLabel required>
                        {t('adminUsers.create.lastName')}
                      </FormLabel>
                      <FormControl>
                        <Input placeholder='Doe' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='phone'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t('adminUsers.create.phoneNumber')}
                      </FormLabel>
                      <FormControl>
                        <PhoneInput
                          placeholder={t(
                            'adminUsers.create.phoneNumberPlaceholder'
                          )}
                          defaultCountry='VN'
                          international
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='birthday'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('adminUsers.create.birthday')}</FormLabel>
                      <FormControl>
                        <DatePickerForm
                          placeholder={t(
                            'adminUsers.create.birthdayPlaceholder'
                          )}
                          field={field}
                          disabled={(date: Date) =>
                            date > new Date() || date < new Date('1900-01-01')
                          }
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
                      <FormLabel required>
                        {t('adminUsers.create.password')}
                      </FormLabel>
                      <FormControl>
                        <PasswordInput placeholder='*******' {...field} />
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
                        {t('adminUsers.create.confirmPassword')}
                      </FormLabel>
                      <FormControl>
                        <PasswordInput placeholder='*******' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='roleIds'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>
                        {t('adminUsers.create.role')}
                      </FormLabel>
                      <FormControl>
                        <AutoCompleteSelectControl
                          {...field}
                          options={
                            data?.map((c) => ({
                              id: c.id,
                              name: c.name,
                            })) || []
                          }
                          isClearable={false}
                          isMulti
                          isLoading={isLoading}
                          placeholder='Select role'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className='md:col-span-3'>
                  <FormField
                    control={form.control}
                    name='bio'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('adminUsers.create.bio')}</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            value={field.value ?? ''}
                            placeholder={t('adminUsers.create.bioPlaceholder')}
                          ></Textarea>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <FormActions footer>
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
            </FormActions>
          </form>
        </Form>
      </Main>
    </>
  )
}
