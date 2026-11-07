import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { restApiErrorHandler } from '@/lib/rest-api-handler'
import { useBreadcrumb } from '@/hooks/use-breadcrumb'
import { Main } from '@/components/layout/main'
import { CmsPageForm } from '../cms-page-form'
import { apiCreateCmsPage } from '../queries'
import type { CmsPageFormSchema } from '../schema'

export function PageCmsPageCreate() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  useBreadcrumb([
    {
      title: t('navigation.general.cmsPages', 'CMS Pages'),
      href: '/cms-pages',
    },
    { title: t('buttons.create', 'Create') },
  ])

  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: apiCreateCmsPage,
    onSuccess: (page) => {
      queryClient.invalidateQueries({ queryKey: ['cms-pages'] })
      toast.success(
        t('cmsPages.message.createSuccess', 'Page created successfully')
      )
      navigate(`/cms-pages/${page.id}/show`)
    },
    onError: restApiErrorHandler,
  })

  const handleSubmit = (data: CmsPageFormSchema) => {
    mutation.mutate(data)
  }

  return (
    <>
      <Main fixed fluid className='h-[calc(100svh-4rem)] min-h-0 p-0'>
        <CmsPageForm
          isSubmitting={mutation.isPending}
          onSubmit={handleSubmit}
        />
      </Main>
    </>
  )
}
