import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'
import { restApiErrorHandler } from '@/lib/rest-api-handler'
import { useBreadcrumb } from '@/hooks/use-breadcrumb'
import DataLoader from '@/components/layout/data-loader'
import { Main } from '@/components/layout/main'
import { NotFoundError } from '@/pages/errors/not-found-error'
import { EventForm } from '../event-form'
import { apiUpdateAdminEvent, useDataAdminEventById } from '../queries'
import type { EventFormValues } from '../schema'

export function PageEventEdit() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { id } = useParams<{ id: string }>()

  const { data, isFetching } = useDataAdminEventById(id ?? '')

  useBreadcrumb([
    {
      title: t('navigation.kosume.events', 'Quản lý sự kiện'),
      href: '/events',
    },
    {
      title: data ? data.title : `#${id}`,
      href: id ? `/events/${id}/show` : undefined,
    },
    { title: t('buttons.edit', 'Chỉnh sửa') },
  ])

  const mutation = useMutation({
    mutationFn: apiUpdateAdminEvent,
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['admin-events'] })
      queryClient.invalidateQueries({ queryKey: ['admin-event', updated.id] })
      toast.success(t('events.messages.updated', 'Cập nhật sự kiện thành công'))
      navigate(`/events/${updated.id}/show`)
    },
    onError: restApiErrorHandler,
  })

  if (!data && isFetching) return <DataLoader />
  if (!id || !data) return <NotFoundError />

  return (
    <Main className='flex-1'>
      <EventForm
        initialData={data}
        isSubmitting={mutation.isPending}
        onSubmit={(values: EventFormValues) =>
          mutation.mutate({ id, data: values })
        }
      />
    </Main>
  )
}
