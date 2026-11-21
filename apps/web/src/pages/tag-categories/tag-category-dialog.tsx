import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { useCreateTagCategory, useUpdateTagCategory } from './queries'
import {
  tagCategoryFormSchema,
  type TagCategoryFormValues,
  type TagCategorySchema,
} from './schema'

interface TagCategoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category: TagCategorySchema | null
}

const COMMON_ICONS = [
  { value: 'Tag', label: 'Tag (Thẻ)' },
  { value: 'Sparkles', label: 'Sparkles (Lấp lánh / Đặc biệt)' },
  { value: 'User', label: 'User (Nhân vật / Character)' },
  { value: 'Palette', label: 'Palette (Nghệ thuật / Artist)' },
  { value: 'Camera', label: 'Camera (Nhiếp ảnh / Cosplay)' },
  { value: 'Shirt', label: 'Shirt (Trang phục / Costume)' },
  { value: 'BookOpen', label: 'BookOpen (Tác phẩm / Copyright)' },
  { value: 'Heart', label: 'Heart (Fandom / Yêu thích)' },
  { value: 'Film', label: 'Film (Phim ảnh / Video)' },
  { value: 'Layers', label: 'Layers (Phân loại / Meta)' },
  { value: 'Shield', label: 'Shield (Hệ thống / Bảo mật)' },
  { value: 'Scissors', label: 'Scissors (Chế tác / Props)' },
  { value: 'Flame', label: 'Flame (Xu hướng / Hot)' },
  { value: 'FolderTree', label: 'FolderTree (Danh mục cha)' },
]

const COLOR_PRESETS = [
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#a855f7', // violet
  '#ec4899', // pink
  '#f43f5e', // rose
  '#f97316', // orange
  '#eab308', // yellow
  '#10b981', // emerald
  '#06b6d4', // cyan
  '#64748b', // slate
]

export function TagCategoryDialog({
  open,
  onOpenChange,
  category,
}: TagCategoryDialogProps) {
  const isEditing = Boolean(category)
  const createMutation = useCreateTagCategory()
  const updateMutation = useUpdateTagCategory()

  const form = useForm<TagCategoryFormValues>({
    resolver: zodResolver(tagCategoryFormSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      color: '#3b82f6',
      icon: 'Tag',
      sortOrder: 0,
      isActive: true,
    },
  })

  useEffect(() => {
    if (open) {
      if (category) {
        form.reset({
          name: category.name,
          slug: category.slug || '',
          description: category.description || '',
          color: category.color || '#3b82f6',
          icon: category.icon || 'Tag',
          sortOrder: category.sortOrder ?? 0,
          isActive: category.isActive,
        })
      } else {
        form.reset({
          name: '',
          slug: '',
          description: '',
          color: '#3b82f6',
          icon: 'Tag',
          sortOrder: 0,
          isActive: true,
        })
      }
    }
  }, [open, category, form])

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  const onSubmit = async (values: TagCategoryFormValues) => {
    try {
      if (isEditing && category) {
        await updateMutation.mutateAsync({
          id: category.id,
          data: values,
        })
        toast.success('Cập nhật danh mục thẻ thành công')
      } else {
        await createMutation.mutateAsync(values)
        toast.success('Tạo mới danh mục thẻ thành công')
      }
      onOpenChange(false)
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Có lỗi xảy ra, vui lòng thử lại'
      toast.error(message)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[90vh] max-w-xl overflow-y-auto sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Chỉnh sửa danh mục thẻ' : 'Thêm mới danh mục thẻ'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? `Chỉnh sửa thông tin định danh và hiển thị cho danh mục "${category?.name}".`
              : 'Tạo danh mục mới để phân loại và nhóm các thẻ trong hệ thống.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <div className='grid gap-4 sm:grid-cols-2'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Tên danh mục <span className='text-destructive'>*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder='Ví dụ: Costume & Props' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='slug'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug định danh</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Ví dụ: costume'
                        disabled={isEditing && category?.isSystem}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className='text-xs'>
                      {isEditing && category?.isSystem
                        ? 'Danh mục hệ thống không cho phép sửa slug'
                        : 'Để trống để tự động tạo từ tên danh mục'}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả danh mục</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Mô tả ngắn gọn về loại thẻ thuộc danh mục này...'
                      className='resize-none'
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='grid gap-4 sm:grid-cols-2'>
              <FormField
                control={form.control}
                name='color'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Màu đại diện (Hex)</FormLabel>
                    <div className='space-y-2'>
                      <div className='flex items-center gap-2'>
                        <div
                          className='size-8 shrink-0 rounded-lg border shadow-xs'
                          style={{ backgroundColor: field.value || '#3b82f6' }}
                        />
                        <FormControl>
                          <Input
                            placeholder='#3b82f6'
                            className='font-mono text-xs'
                            {...field}
                          />
                        </FormControl>
                      </div>
                      <div className='flex flex-wrap gap-1.5'>
                        {COLOR_PRESETS.map((color) => (
                          <button
                            key={color}
                            type='button'
                            onClick={() => field.onChange(color)}
                            className='size-5 rounded-md border transition-transform hover:scale-110'
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='icon'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Icon hiển thị</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Chọn icon' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {COMMON_ICONS.map((icon) => (
                          <SelectItem key={icon.value} value={icon.value}>
                            {icon.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription className='text-xs'>
                      Icon Lucide biểu thị danh mục trong giao diện
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className='grid gap-4 sm:grid-cols-2'>
              <FormField
                control={form.control}
                name='sortOrder'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thứ tự sắp xếp</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        min={0}
                        placeholder='0'
                        value={field.value}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === '' ? 0 : Number(e.target.value)
                          )
                        }
                      />
                    </FormControl>
                    <FormDescription className='text-xs'>
                      Thứ tự hiển thị (số nhỏ hơn ưu tiên lên đầu)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='isActive'
                render={({ field }) => (
                  <FormItem className='flex flex-row items-center justify-between rounded-lg border p-3 shadow-xs'>
                    <div className='space-y-0.5'>
                      <FormLabel className='text-sm'>
                        Trạng thái hoạt động
                      </FormLabel>
                      <FormDescription className='text-xs'>
                        Hiển thị danh mục này cho người dùng lựa chọn
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className='gap-2 pt-2'>
              <Button
                type='button'
                variant='outline'
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Hủy bỏ
              </Button>
              <Button type='submit' disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className='mr-2 size-4 animate-spin' />
                )}
                {isEditing ? 'Lưu thay đổi' : 'Tạo danh mục'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
