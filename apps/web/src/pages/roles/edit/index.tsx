import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router'
import { useBreadcrumb } from '@/hooks/use-breadcrumb'
import DataLoader from '@/components/layout/data-loader'
import { NotFoundError } from '@/pages/errors/not-found-error'
import { useDataRoleEdit } from '../queries'
import { RoleEditForm } from './role-edit-form'

export function PageRoleEdit() {
  const { t } = useTranslation()
  const params = useParams()
  const id = params.id as string

  const { data, isFetching } = useDataRoleEdit(id)

  const roleName = data?.name || (id ? `#${id}` : '')

  useBreadcrumb([
    { title: t('navigation.management.roles', 'Roles'), href: '/roles' },
    { title: roleName, href: id ? `/roles/${id}/show` : undefined },
    { title: t('buttons.edit', 'Edit') },
  ])

  if (isFetching) return <DataLoader />

  if (!data) return <NotFoundError />

  return (
    <>
      <RoleEditForm data={data} />
    </>
  )
}
