import { Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { useDeleteTagCategory } from './queries'
import type { TagCategorySchema } from './schema'

interface DeleteTagCategoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category: TagCategorySchema | null
}

export function DeleteTagCategoryDialog({
  open,
  onOpenChange,
  category,
}: DeleteTagCategoryDialogProps) {
  const { t } = useTranslation()
  const deleteMutation = useDeleteTagCategory()

  if (!category) return null

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(category.id)
      toast.success(
        t(
          'tagCategories.deleteDialog.successToast',
          `Đã xóa danh mục "${category.name}"`,
          {
            name: category.name,
          }
        )
      )
      onOpenChange(false)
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        t('tagCategories.deleteDialog.errorToast', 'Không thể xóa danh mục này')
      toast.error(message)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className='sm:max-w-md'>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t('tagCategories.deleteDialog.title', 'Xác nhận xóa danh mục thẻ')}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t(
              'tagCategories.deleteDialog.description',
              `Bạn có chắc chắn muốn xóa danh mục ${category.name} (${category.slug})?`,
              { name: category.name, slug: category.slug }
            )}
            {category.tagCount && category.tagCount > 0 ? (
              <span className='text-primary dark:text-primary mt-2 block text-xs font-semibold'>
                {t(
                  'tagCategories.deleteDialog.tagCountWarning',
                  `Lưu ý: Danh mục này đang gắn với ${category.tagCount} thẻ.`,
                  { count: category.tagCount }
                )}
              </span>
            ) : null}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className='gap-2 sm:justify-end'>
          <Button
            type='button'
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={deleteMutation.isPending}
          >
            {t('tagCategories.deleteDialog.cancel', 'Hủy')}
          </Button>
          <Button
            type='button'
            variant='destructive'
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending && (
              <Loader2 className='mr-2 size-4 animate-spin' />
            )}
            {t('tagCategories.deleteDialog.confirm', 'Xác nhận xóa')}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
