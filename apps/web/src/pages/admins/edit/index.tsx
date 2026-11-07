import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router'
import { useBreadcrumb } from '@/hooks/use-breadcrumb'
import DataLoader from '@/components/layout/data-loader'
import { NotFoundError } from '@/pages/errors/not-found-error'
import { useDataGetAdminEdit } from '../queries'
import { AdminEditForm } from './admin-edit-form'

export function PageAdminEdit() {
  const { t } = useTranslation()
  const params = useParams()
  const id = params.id as string

  const { data, isFetching } = useDataGetAdminEdit(id)

  const adminName = data?.fullName || data?.email || (id ? `#${id}` : '')

  useBreadcrumb([
    { title: t('navigation.management.admins', 'Admins'), href: '/admins' },
    { title: adminName, href: id ? `/admins/${id}/show` : undefined },
    { title: t('buttons.edit', 'Edit') },
  ])

  if (isFetching) return <DataLoader />

  if (!data) return <NotFoundError />

  return (
    <>
      <AdminEditForm data={data} />
    </>
  )
}
