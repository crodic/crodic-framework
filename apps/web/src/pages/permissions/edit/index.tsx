import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeftIcon, SaveIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router'
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
import { Textarea } from '@/components/ui/textarea'
import DataLoader from '@/components/layout/data-loader'
import { Main } from '@/components/layout/main'
import { PageHeader } from '@/components/layout/page-shell'
import { NotFoundError } from '@/pages/errors/not-found-error'
import { apiEditPermission, useDataPermissionEdit } from '../queries'
import { permissionFormSchema, type PermissionFormSchema } from '../schema'

export function PagePermissionEdit() {
  const { t } = useTranslation()
  const params = useParams()
  const id = params.id as string
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data, isFetching } = useDataPermissionEdit(id)

  const permName = data?.name || (id ? `#${id}` : '')

  useBreadcrumb([
    {
      title: t('navigation.management.permissions', 'Permissions'),
      href: '/permissions',
    },
    { title: permName, href: id ? `/permissions/${id}/show` : undefined },
    { title: t('buttons.edit', 'Edit') },
  ])

  const form = useForm<PermissionFormSchema>({
    resolver: zodResolver(permissionFormSchema),
    defaultValues: {
      group: '',
      description: '',
    },
  })

  useEffect(() => {
    if (!data) return

    form.reset({
      group: data.group,
      description: data.description ?? '',
    })
  }, [data, form])

  const editPermissionMutation = useMutation({
    mutationFn: apiEditPermission,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions'] })
      queryClient.invalidateQueries({ queryKey: ['permission', params.id] })
      queryClient.invalidateQueries({ queryKey: ['permission_form_options'] })
      toast.success('Permission metadata updated successfully')
      navigate(-1)
    },
    onError: restApiErrorHandler,
  })

  const onSubmit = (values: PermissionFormSchema) => {
    if (!data) return

    editPermissionMutation.mutate({ id: data.id, data: values })
  }

  if (isFetching) return <DataLoader />

  if (!data) return <NotFoundError />

  return (
    <>
      <Main>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <PageHeader
              title={<>Edit Permission Metadata</>}
              description={<>{data.key}</>}
              actions={
                <>
                  <div className='flex items-center gap-2'>
                    <Button
                      type='button'
                      variant='outline'
                      onClick={() => navigate(-1)}
                    >
                      <ArrowLeftIcon className='size-4' aria-hidden='true' />
                      Cancel
                    </Button>
                    <Button
                      type='submit'
                      disabled={editPermissionMutation.isPending}
                    >
                      <SaveIcon className='size-4' aria-hidden='true' />
                      Save
                    </Button>
                  </div>
                </>
              }
            />

            <Card>
              <CardHeader>
                <CardTitle>{data.name}</CardTitle>
                <CardDescription>
                  Only group and description are editable. The permission key
                  and name are synced from source code.
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-6'>
                <FormField
                  control={form.control}
                  name='group'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>Group</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder='Permission group' />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='description'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          value={field.value ?? ''}
                          placeholder='Describe what this permission allows'
                          rows={5}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </form>
        </Form>
      </Main>
    </>
  )
}
