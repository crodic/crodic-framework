import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'
import { restApiErrorHandler } from '@/lib/rest-api-handler'
import { useBreadcrumb } from '@/hooks/use-breadcrumb'
import DataLoader from '@/components/layout/data-loader'
import { Main } from '@/components/layout/main'
import { NotFoundError } from '@/pages/errors/not-found-error'
import { CmsPageForm } from '../cms-page-form'
import { apiUpdateCmsPage, useDataCmsPageById } from '../queries'
import type { CmsPageFormSchema } from '../schema'

export function PageCmsPageEdit() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { id } = useParams()
  const { data, isFetching } = useDataCmsPageById(id ?? '')

  const pageTitle = data?.translations?.[0]?.title || (id ? `#${id}` : '')

  useBreadcrumb([
    {
      title: t('navigation.general.cmsPages', 'CMS Pages'),
      href: '/cms-pages',
    },
    { title: pageTitle, href: id ? `/cms-pages/${id}/show` : undefined },
    { title: t('buttons.edit', 'Edit') },
  ])
  const mutation = useMutation({
    mutationFn: apiUpdateCmsPage,
    onSuccess: (page) => {
      queryClient.invalidateQueries({ queryKey: ['cms-pages'] })
      queryClient.invalidateQueries({ queryKey: ['cms-page', page.id] })
      toast.success(
        t('cmsPages.message.updateSuccess', 'Page updated successfully')
      )
      navigate(`/cms-pages/${page.id}/show`)
    },
    onError: restApiErrorHandler,
  })

  if (isFetching) return <DataLoader />
  if (!id || !data) return <NotFoundError />

  const handleSubmit = (formData: CmsPageFormSchema) => {
    mutation.mutate({ id, data: formData })
  }

  return (
    <>
      <Main fixed fluid className='h-[calc(100svh-4rem)] min-h-0 p-0'>
        <CmsPageForm
          initialData={data}
          isSubmitting={mutation.isPending}
          onSubmit={handleSubmit}
        />
      </Main>
    </>
  )
}
