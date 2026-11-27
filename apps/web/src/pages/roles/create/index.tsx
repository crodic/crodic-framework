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
import { FormActions } from '@/components/layout/form-actions'
import { Main } from '@/components/layout/main'
import { PageHeader } from '@/components/layout/page-shell'
import { useDataPermissionFormOptions } from '@/pages/permissions/queries'
import { RolePermissionsField } from '../components/role-permissions-field'
import { validateAssignablePermissionIds } from '../permission-matrix.helper'
import { apiCreateRole } from '../queries'
import { roleFormSchema, type RoleFormSchema } from '../schema'

export default function PageRoleCreate() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  useBreadcrumb([
    { title: t('navigation.management.roles', 'Roles'), href: '/roles' },
    { title: t('buttons.create', 'Create') },
  ])
  const queryClient = useQueryClient()

  const form = useForm<RoleFormSchema>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: {
      name: '',
      permissionIds: [],
    },
  })

  const permissionsQuery = useDataPermissionFormOptions()

  const createRoleMutate = useMutation({
    mutationFn: apiCreateRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] })
      toast.success('Role created successfully')
      navigate('/roles')
    },
    onError: restApiErrorHandler,
  })

  const onSubmit = (values: RoleFormSchema) => {
    const assignablePermissionIds = new Set(
      (permissionsQuery.data ?? []).map((permission) => permission.id)
    )

    if (
      !validateAssignablePermissionIds(
        values.permissionIds,
        assignablePermissionIds
      )
    ) {
      form.setError('permissionIds', {
        message: 'Invalid permission selected',
      })
      toast.error('Invalid permission selected')
      return
    }

    createRoleMutate.mutate(values)
  }

  const pageActions = (
    <>
      <Button type='button' variant='outline' onClick={() => navigate(-1)}>
        <ArrowLeftIcon className='size-4' aria-hidden='true' />
        {t('buttons.cancel')}
      </Button>
      <Button
        type='submit'
        disabled={
          createRoleMutate.isPending ||
          permissionsQuery.isLoading ||
          permissionsQuery.isError
        }
      >
        <SaveIcon className='size-4' aria-hidden='true' />
        {t('buttons.save')}
      </Button>
    </>
  )

  return (
    <>
      <Main>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
            <PageHeader
              title={<>{t('roles.create.title')}</>}
              actions={pageActions}
            />

            <Card>
              <CardContent className='grid grid-cols-1 items-start gap-8 md:grid-cols-3'>
                <FormField
                  control={form.control}
                  name='name'
                  render={({ field }) => (
                    <FormItem className='md:col-span-3'>
                      <FormLabel required>{t('roles.create.name')}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder={t('roles.create.name')}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <RolePermissionsField
                  form={form}
                  permissions={permissionsQuery.data ?? []}
                  isLoading={permissionsQuery.isLoading}
                  isError={permissionsQuery.isError}
                  disabled={createRoleMutate.isPending}
                />
              </CardContent>
            </Card>

            <FormActions footer>{pageActions}</FormActions>
          </form>
        </Form>
      </Main>
    </>
  )
}
