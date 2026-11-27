import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { restApiErrorHandler } from '@/lib/rest-api-handler'
import { useBreadcrumb } from '@/hooks/use-breadcrumb'
import { Main } from '@/components/layout/main'
import { apiCreateTag } from '../queries'
import type { TagFormValues } from '../schema'
import { TagForm } from '../tag-form'

export function PageTagCreate() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  useBreadcrumb([
    {
      title: t('navigation.management.tags', 'Tags Governance'),
      href: '/tags',
    },
    { title: t('buttons.create', 'Create') },
  ])

  const mutation = useMutation({
    mutationFn: apiCreateTag,
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ['tags'] })
      toast.success(t('tags.messages.created', 'Tag created successfully'))
      navigate(`/tags/${created.id}/show`)
    },
    onError: restApiErrorHandler,
  })

  return (
    <Main className='flex-1'>
      <TagForm
        isSubmitting={mutation.isPending}
        onSubmit={(values: TagFormValues) => mutation.mutate(values)}
      />
    </Main>
  )
}
