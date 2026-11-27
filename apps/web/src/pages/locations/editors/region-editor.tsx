import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { restApiErrorHandler } from '@/lib/rest-api-handler'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { FormActions } from '@/components/layout/form-actions'
import { PageHeader } from '@/components/layout/page-shell'
import { apiCreateRegion, apiUpdateRegion } from '../queries'
import {
  type RegionFormSchema,
  regionFormSchema,
  type RegionSchema,
} from '../schema'

interface RegionEditorProps {
  onClose: () => void
  region?: RegionSchema | null
}

export function RegionEditor({ onClose, region }: RegionEditorProps) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const isEdit = !!region

  const form = useForm<RegionFormSchema>({
    resolver: zodResolver(regionFormSchema),
    defaultValues: {
      name: '',
    },
  })

  useEffect(() => {
    if (region) {
      form.reset({
        name: region.name,
      })
    } else {
      form.reset({
        name: '',
      })
    }
  }, [region, form])

  const mutation = useMutation({
    mutationFn: (values: RegionFormSchema) =>
      isEdit
        ? apiUpdateRegion({ id: region.id, data: values })
        : apiCreateRegion(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['regions'] })
      queryClient.invalidateQueries({ queryKey: ['public-regions'] })
      toast.success(
        isEdit
          ? t('locations.region.updated', 'Region updated successfully')
          : t('locations.region.created', 'Region created successfully')
      )
      onClose()
    },
    onError: restApiErrorHandler,
  })

  const onSubmit = (values: RegionFormSchema) => {
    mutation.mutate(values)
  }

  const submitLabel = mutation.isPending
    ? t('buttons.saving', 'Saving...')
    : t(
        isEdit ? 'buttons.save' : 'buttons.create',
        isEdit ? 'Save Changes' : 'Create'
      )

  const pageActions = (
    <FormActions>
      <Button
        type='button'
        variant='outline'
        disabled={mutation.isPending}
        onClick={() => onClose()}
      >
        {t('buttons.cancel', 'Cancel')}
      </Button>
      <Button type='submit' disabled={mutation.isPending}>
        {submitLabel}
      </Button>
    </FormActions>
  )

  return (
    <>
      <div className='flex w-full min-w-0 flex-col gap-6'>
        <PageHeader
          title={
            <>
              {isEdit
                ? t('locations.region.editTitle', 'Edit Region')
                : t('locations.region.createTitle', 'Create Region')}
            </>
          }
          description={
            <>
              {t(
                'locations.region.dialogDesc',
                'Enter the details for this geographical region.'
              )}
            </>
          }
        />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            {pageActions}

            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('locations.fields.name', 'Name')}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t(
                        'locations.region.namePlaceholder',
                        'e.g. Asia, Europe'
                      )}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormActions footer>{pageActions}</FormActions>
          </form>
        </Form>
      </div>
    </>
  )
}
