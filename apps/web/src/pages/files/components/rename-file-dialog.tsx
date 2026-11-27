import type { ComponentType, ReactNode } from 'react'
import { useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import { apiUpdateFile, fileQueryKeys } from '../queries'
import type { FileSchema } from '../schema'

const renameSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(255),
})

type RenameFormValues = z.infer<typeof renameSchema>

export interface RenameFileDialogProps {
  page?: boolean
  open: boolean
  file: FileSchema | null
  onOpenChange: (open: boolean) => void
  onRenamed?: (file: FileSchema) => void
}

export function RenameFileDialog({
  page = false,
  open,
  file,
  onOpenChange,
  onRenamed,
}: RenameFileDialogProps) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const form = useForm<RenameFormValues>({
    resolver: zodResolver(renameSchema),
    defaultValues: {
      name: file?.original_name ?? '',
    },
  })

  useEffect(() => {
    if (file) {
      form.reset({ name: file.original_name })
    }
  }, [file, form])

  const mutation = useMutation({
    mutationFn: async (values: RenameFormValues) => {
      if (!file) return
      return apiUpdateFile({
        publicId: file.public_id,
        data: { original_name: values.name },
      })
    },
    onSuccess: (updated) => {
      if (updated) {
        onRenamed?.(updated)
      }
      void queryClient.invalidateQueries({ queryKey: fileQueryKeys.all })
      toast.success(t('files.rename.success', 'File renamed successfully'))
      onOpenChange(false)
    },
    onError: (err: any) => {
      toast.error(
        err?.response?.data?.message ||
          t('files.rename.error', 'Failed to rename file')
      )
    },
  })

  const onSubmit = (values: RenameFormValues) => {
    mutation.mutate(values)
  }

  const Header: ComponentType<PagePartProps> = page
    ? PageSectionHeader
    : DialogHeader
  const Title: ComponentType<PagePartProps> = page ? PageTitle : DialogTitle
  const Footer: ComponentType<PagePartProps> = page ? PageFooter : DialogFooter
  const pageActions = (
    <>
      <Button
        type='button'
        variant='outline'
        onClick={() => onOpenChange(false)}
        disabled={mutation.isPending}
      >
        {t('buttons.cancel', 'Cancel')}
      </Button>
      <Button type='submit' disabled={mutation.isPending}>
        {mutation.isPending
          ? t('buttons.saving', 'Saving...')
          : t('buttons.save', 'Save')}
      </Button>
    </>
  )

  const content = (
    <>
      <Header>
        <Title>{t('files.actions.rename', 'Rename file')}</Title>
      </Header>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
          {page && <FormActions>{pageActions}</FormActions>}

          <FormField
            control={form.control}
            name='name'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('files.table.name', 'File name')}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    autoFocus
                    placeholder='filename.ext'
                    disabled={mutation.isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Footer className='gap-2 sm:gap-0'>{pageActions}</Footer>
        </form>
      </Form>
    </>
  )
  return page ? (
    <div className='flex min-w-0 flex-col gap-6'>{content}</div>
  ) : (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>{content}</DialogContent>
    </Dialog>
  )
}

function PageTitle({ children }: { children?: ReactNode; className?: string }) {
  return <PageHeader title={children} />
}

function PageFooter({
  children,
}: {
  children?: ReactNode
  className?: string
}) {
  return (
    <div className='flex flex-wrap justify-end gap-2 border-t pt-4'>
      {children}
    </div>
  )
}

type PagePartProps = { children?: ReactNode; className?: string }
function PageSectionHeader({ children, className }: PagePartProps) {
  return <header className={className}>{children}</header>
}
