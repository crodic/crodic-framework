import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router'
import { useBreadcrumb } from '@/hooks/use-breadcrumb'
import DataLoader from '@/components/layout/data-loader'
import { NotFoundError } from '@/pages/errors/not-found-error'
import { useDataGetUserEdit } from '../queries'
import { UserEditForm } from './user-edit-form'

export function PageUserEdit() {
  const { t } = useTranslation()
  const params = useParams()
  const id = params.id as string

  const { data, isFetching } = useDataGetUserEdit(id)

  const userName = data?.fullName || data?.email || (id ? `#${id}` : '')

  useBreadcrumb([
    { title: t('navigation.management.users', 'Users'), href: '/users' },
    { title: userName, href: id ? `/users/${id}/show` : undefined },
    { title: t('buttons.edit', 'Edit') },
  ])

  if (isFetching) return <DataLoader />

  if (!data) return <NotFoundError />

  return (
    <>
      <UserEditForm data={data} />
    </>
  )
}
