import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
  const deleteMutation = useDeleteTagCategory()

  if (!category) return null

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(category.id)
      toast.success(`Đã xóa danh mục "${category.name}"`)
      onOpenChange(false)
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Không thể xóa danh mục này'
      toast.error(message)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Xác nhận xóa danh mục thẻ</DialogTitle>
          <DialogDescription>
            Bạn có chắc chắn muốn xóa danh mục{' '}
            <strong className='text-foreground'>{category.name}</strong> (
            <code className='font-mono text-xs'>{category.slug}</code>)?
            {category.tagCount && category.tagCount > 0 ? (
              <span className='mt-2 block text-xs font-semibold text-amber-600 dark:text-amber-400'>
                Lưu ý: Danh mục này đang gắn với {category.tagCount} thẻ.
              </span>
            ) : null}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className='gap-2 sm:justify-end'>
          <Button
            type='button'
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={deleteMutation.isPending}
          >
            Hủy
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
            Xác nhận xóa
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
