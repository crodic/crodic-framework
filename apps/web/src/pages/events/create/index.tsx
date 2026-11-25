import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { restApiErrorHandler } from '@/lib/rest-api-handler'
import { useBreadcrumb } from '@/hooks/use-breadcrumb'
import { Main } from '@/components/layout/main'
import { EventForm } from '../event-form'
import { apiCreateAdminEvent } from '../queries'
import type { EventFormValues } from '../schema'

export function PageEventCreate() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  useBreadcrumb([
    {
      title: t('navigation.kosume.events', 'Quản lý sự kiện'),
      href: '/events',
    },
    { title: t('buttons.create', 'Tạo mới') },
  ])

  const mutation = useMutation({
    mutationFn: apiCreateAdminEvent,
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ['admin-events'] })
      toast.success(
        t('events.messages.created', 'Đã tạo sự kiện mới thành công')
      )
      navigate(`/events/${created.id}/show`)
    },
    onError: restApiErrorHandler,
  })

  return (
    <Main className='flex flex-1 flex-col gap-6'>
      <EventForm
        isSubmitting={mutation.isPending}
        onSubmit={(values: EventFormValues) => mutation.mutate(values)}
      />
    </Main>
  )
}
