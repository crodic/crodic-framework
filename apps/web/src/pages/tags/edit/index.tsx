import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'
import { restApiErrorHandler } from '@/lib/rest-api-handler'
import { useBreadcrumb } from '@/hooks/use-breadcrumb'
import DataLoader from '@/components/layout/data-loader'
import { Main } from '@/components/layout/main'
import { NotFoundError } from '@/pages/errors/not-found-error'
import { apiUpdateTag, useDataTagById } from '../queries'
import type { TagFormValues } from '../schema'
import { TagForm } from '../tag-form'

export function PageTagEdit() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { id } = useParams()

  const { data, isFetching } = useDataTagById(id ?? '')

  useBreadcrumb([
    {
      title: t('navigation.management.tags', 'Tags Governance'),
      href: '/tags',
    },
    {
      title: data ? `#${data.name}` : `#${id}`,
      href: id ? `/tags/${id}/show` : undefined,
    },
    { title: t('buttons.edit', 'Edit') },
  ])

  const mutation = useMutation({
    mutationFn: apiUpdateTag,
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['tags'] })
      queryClient.invalidateQueries({ queryKey: ['tag', updated.id] })
      toast.success(t('tags.messages.updated', 'Tag updated successfully'))
      navigate(`/tags/${updated.id}/show`)
    },
    onError: restApiErrorHandler,
  })

  if (isFetching) return <DataLoader />
  if (!id || !data) return <NotFoundError />

  return (
    <Main className='flex flex-1 flex-col gap-6'>
      <TagForm
        initialData={data}
        isSubmitting={mutation.isPending}
        onSubmit={(values: TagFormValues) =>
          mutation.mutate({ id, data: values })
        }
      />
    </Main>
  )
}
