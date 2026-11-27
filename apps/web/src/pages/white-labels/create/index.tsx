import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { restApiErrorHandler } from '@/lib/rest-api-handler'
import { useBreadcrumb } from '@/hooks/use-breadcrumb'
import { Button } from '@/components/ui/button'
import { Main } from '@/components/layout/main'
import { PageHeader } from '@/components/layout/page-shell'
import { WhiteLabelForm } from '../components/white-label-form'
import { apiCreateWhiteLabel, whiteLabelQueryKeys } from '../queries'
import type { WhiteLabelFormSchema } from '../schema'

export function PageWhiteLabelCreate() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  useBreadcrumb([
    {
      title: t('navigation.management.whiteLabels', 'White Labels'),
      href: '/white-labels',
    },
    { title: t('buttons.create', 'Create') },
  ])
  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: apiCreateWhiteLabel,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: whiteLabelQueryKeys.all })
      toast.success(
        t('whiteLabels.create.success', {
          defaultValue: 'White-label profile created successfully',
        })
      )
      navigate(`/white-labels/${data.id}/show`)
    },
    onError: restApiErrorHandler,
  })

  const handleSubmit = (formData: WhiteLabelFormSchema) => {
    createMutation.mutate(formData)
  }

  return (
    <>
      <Main className='flex-1'>
        <div className='flex items-center gap-4'>
          <Button
            variant='ghost'
            size='icon'
            onClick={() => navigate('/white-labels')}
            aria-label={t('buttons.back', 'Back')}
          >
            <ArrowLeft className='size-5' />
          </Button>
          <PageHeader
            title={
              <>
                {t('whiteLabels.create.title', {
                  defaultValue: 'Create White Label Profile',
                })}
              </>
            }
            description={
              <>
                <p className='text-muted-foreground text-sm'>
                  {t('whiteLabels.create.description', {
                    defaultValue:
                      'Customize brand logos, typography, metadata, and color themes with live preview.',
                  })}
                </p>
              </>
            }
          />
        </div>

        <WhiteLabelForm
          isSubmitting={createMutation.isPending}
          onSubmit={handleSubmit}
          onCancel={() => navigate('/white-labels')}
        />
      </Main>
    </>
  )
}
