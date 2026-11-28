import { useEffect, useId } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
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
import { FormActions } from '@/components/layout/form-actions'
import { PageHeader } from '@/components/layout/page-shell'
import { useCreateTagCategory, useUpdateTagCategory } from './queries'
import {
  tagCategoryFormSchema,
  type TagCategoryFormValues,
  type TagCategorySchema,
} from './schema'

interface TagCategoryEditorProps {
  onClose: () => void
  category: TagCategorySchema | null
}

const COMMON_ICONS = [
  { value: 'Tag' },
  { value: 'Wand2' },
  { value: 'User' },
  { value: 'Palette' },
  { value: 'Camera' },
  { value: 'Shirt' },
  { value: 'BookOpen' },
  { value: 'Heart' },
  { value: 'Film' },
  { value: 'Layers' },
  { value: 'Shield' },
  { value: 'Scissors' },
  { value: 'Flame' },
  { value: 'FolderTree' },
] as const

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

export function TagCategoryEditor({
  onClose,
  category,
}: TagCategoryEditorProps) {
  const { t } = useTranslation()
  const formId = useId()
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
  }, [category, form])

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  const onSubmit = async (values: TagCategoryFormValues) => {
    try {
      if (isEditing && category) {
        await updateMutation.mutateAsync({
          id: category.id,
          data: values,
        })
        toast.success(
          t(
            'tagCategories.toasts.updateSuccess',
            'Cập nhật danh mục thẻ thành công'
          )
        )
      } else {
        await createMutation.mutateAsync(values)
        toast.success(
          t(
            'tagCategories.toasts.createSuccess',
            'Tạo mới danh mục thẻ thành công'
          )
        )
      }
      onClose()
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        t('tagCategories.saveError')
      toast.error(message)
    }
  }

  const pageActions = (
    <>
      <Button
        type='button'
        variant='outline'
        onClick={() => onClose()}
        disabled={isSubmitting}
      >
        {t('tagCategories.dialog.cancel', 'Hủy bỏ')}
      </Button>
      <Button type='submit' form={formId} disabled={isSubmitting}>
        {isSubmitting && <Loader2 className='mr-2 size-4 animate-spin' />}
        {isEditing
          ? t('tagCategories.dialog.save', 'Lưu thay đổi')
          : t('tagCategories.dialog.create', 'Tạo danh mục')}
      </Button>
    </>
  )

  return (
    <>
      <div className='flex w-full min-w-0 flex-col gap-6'>
        <PageHeader
          actions={pageActions}
          title={
            <>
              {isEditing
                ? t('tagCategories.dialog.editTitle', 'Chỉnh sửa danh mục thẻ')
                : t(
                    'tagCategories.dialog.createTitle',
                    'Thêm mới danh mục thẻ'
                  )}
            </>
          }
          description={
            <>
              {isEditing
                ? t(
                    'tagCategories.dialog.editDescription',
                    `Chỉnh sửa thông tin định danh và hiển thị cho danh mục "${category?.name}".`,
                    { name: category?.name }
                  )
                : t(
                    'tagCategories.dialog.createDescription',
                    'Tạo danh mục mới để phân loại và nhóm các thẻ trong hệ thống.'
                  )}
            </>
          }
        />

        <Form {...form}>
          <form
            id={formId}
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-6'
          >
            <div className='grid items-start gap-4 sm:grid-cols-2'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('tagCategories.dialog.nameLabel', 'Tên danh mục')}{' '}
                      <span className='text-destructive'>*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t(
                          'tagCategories.dialog.namePlaceholder',
                          'Ví dụ: Costume & Props'
                        )}
                        {...field}
                      />
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
                    <FormLabel>
                      {t('tagCategories.dialog.slugLabel', 'Slug định danh')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t(
                          'tagCategories.dialog.slugPlaceholder',
                          'Ví dụ: costume'
                        )}
                        disabled={isEditing && category?.isSystem}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className='text-xs'>
                      {isEditing && category?.isSystem
                        ? t(
                            'tagCategories.dialog.slugSystemHelp',
                            'Danh mục hệ thống không cho phép sửa slug'
                          )
                        : t(
                            'tagCategories.dialog.slugAutoHelp',
                            'Để trống để tự động tạo từ tên danh mục'
                          )}
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
                  <FormLabel>
                    {t('tagCategories.dialog.descLabel', 'Mô tả danh mục')}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t(
                        'tagCategories.dialog.descPlaceholder',
                        'Mô tả ngắn gọn về loại thẻ thuộc danh mục này...'
                      )}
                      className='resize-none'
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='grid items-start gap-4 sm:grid-cols-2'>
              <FormField
                control={form.control}
                name='icon'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('tagCategories.dialog.iconLabel', 'Icon hiển thị')}
                    </FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className='w-full'>
                          <SelectValue
                            placeholder={t(
                              'tagCategories.dialog.iconPlaceholder'
                            )}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {COMMON_ICONS.map((icon) => (
                          <SelectItem key={icon.value} value={icon.value}>
                            {t(`tagCategories.icons.${icon.value}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription className='text-xs'>
                      {t(
                        'tagCategories.dialog.iconHelp',
                        'Icon Lucide biểu thị danh mục trong giao diện'
                      )}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='sortOrder'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t(
                        'tagCategories.dialog.sortOrderLabel',
                        'Thứ tự sắp xếp'
                      )}
                    </FormLabel>
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
                      {t(
                        'tagCategories.dialog.sortOrderHelp',
                        'Thứ tự hiển thị (số nhỏ hơn ưu tiên lên đầu)'
                      )}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name='color'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('tagCategories.dialog.colorLabel', 'Màu đại diện (Hex)')}
                  </FormLabel>
                  <div className='space-y-2.5'>
                    <div className='flex items-center gap-2.5'>
                      <div
                        className='size-9 shrink-0 rounded-lg border'
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
                    <div className='flex flex-wrap items-center gap-2'>
                      {COLOR_PRESETS.map((color) => (
                        <button
                          key={color}
                          type='button'
                          onClick={() => field.onChange(color)}
                          className={`hover:ring-muted-foreground/30 size-6 cursor-pointer rounded-md border transition-all hover:ring-2 ${
                            field.value?.toLowerCase() === color.toLowerCase()
                              ? 'ring-primary ring-2 ring-offset-1'
                              : ''
                          }`}
                          style={{ backgroundColor: color }}
                          title={color}
                          aria-label={t('tagCategories.dialog.chooseColor', {
                            color,
                          })}
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
              name='isActive'
              render={({ field }) => (
                <FormItem className='bg-muted/20 flex flex-row items-center justify-between gap-4 rounded-lg border p-4 shadow-xs'>
                  <div className='space-y-0.5'>
                    <FormLabel className='text-sm'>
                      {t(
                        'tagCategories.dialog.activeLabel',
                        'Trạng thái hoạt động'
                      )}
                    </FormLabel>
                    <FormDescription className='text-xs'>
                      {t(
                        'tagCategories.dialog.activeHelp',
                        'Hiển thị danh mục này cho người dùng lựa chọn'
                      )}
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

            <FormActions footer>{pageActions}</FormActions>
          </form>
        </Form>
      </div>
    </>
  )
}
