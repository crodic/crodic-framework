import { useCallback, useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { parseAsString } from 'nuqs'
import { useTranslation } from 'react-i18next'
import { useBreadcrumb } from '@/hooks/use-breadcrumb'
import {
  useRestResourceTable,
  type RestResourceQueryBuilderFn,
} from '@/hooks/use-rest-resource-table'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/data-table/data-table'
import { DataTableSortList } from '@/components/data-table/data-table-sort-list'
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar'
import { Main } from '@/components/layout/main'
import { PageHeader } from '@/components/layout/page-shell'
import { getTagCategoriesColumns } from './columns'
import { DeleteTagCategoryDialog } from './delete-dialog'
import { useDataTagCategories } from './queries'
import type { TagCategorySchema } from './schema'
import { TagCategoryDialog } from './tag-category-dialog'

const categoryFilterParsers = {
  name: parseAsString,
  slug: parseAsString,
  isSystem: parseAsString,
  isActive: parseAsString,
} as const

export function PageTagCategoriesOverview() {
  const { t } = useTranslation()
  const [selectedCategory, setSelectedCategory] =
    useState<TagCategorySchema | null>(null)
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  useBreadcrumb([
    { title: t('navigation.management.tags', 'Quản trị Thẻ') },
    {
      title: t('navigation.management.tagCategories', 'Danh mục Thẻ'),
    },
  ])

  const handleCreate = useCallback(() => {
    setSelectedCategory(null)
    setIsFormDialogOpen(true)
  }, [])

  const handleEdit = useCallback((category: TagCategorySchema) => {
    setSelectedCategory(category)
    setIsFormDialogOpen(true)
  }, [])

  const handleDelete = useCallback((category: TagCategorySchema) => {
    setSelectedCategory(category)
    setIsDeleteDialogOpen(true)
  }, [])

  const columns = useMemo(
    () =>
      getTagCategoriesColumns({
        t,
        onEdit: handleEdit,
        onDelete: handleDelete,
      }),
    [t, handleEdit, handleDelete]
  )

  const buildQuery: RestResourceQueryBuilderFn<typeof categoryFilterParsers> =
    useCallback((builder, filter) => {
      builder
        .filter('name', filter.name)
        .filter('slug', filter.slug)
        .filter(
          'isSystem',
          filter.isSystem !== undefined && filter.isSystem !== null
            ? filter.isSystem === 'system'
            : undefined
        )
        .filter(
          'isActive',
          filter.isActive !== undefined && filter.isActive !== null
            ? filter.isActive === 'active'
            : undefined
        )
    }, [])

  const { table, isFetching } = useRestResourceTable<
    TagCategorySchema,
    typeof categoryFilterParsers
  >({
    columns,
    allowedSorts: ['sortOrder', 'name', 'createdAt', 'updatedAt'],
    filterParsers: categoryFilterParsers,
    queryHook: useDataTagCategories,
    buildQuery,
    getRowId: (originalRow) => originalRow.id,
    clearOnDefault: true,
  })

  return (
    <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
      <PageHeader
        title={t('navigation.management.tagCategories', 'Danh mục Thẻ')}
        actions={
          <Button onClick={handleCreate} className='gap-2 shadow-xs'>
            <Plus className='size-4' />
            <span>{t('tagCategories.actions.add', 'Thêm danh mục')}</span>
          </Button>
        }
      />

      <DataTable
        table={table}
        onClickRowAction={handleEdit}
        isFetching={isFetching}
      >
        <DataTableToolbar table={table}>
          <DataTableSortList table={table} align='end' />
        </DataTableToolbar>
      </DataTable>

      <TagCategoryDialog
        open={isFormDialogOpen}
        onOpenChange={setIsFormDialogOpen}
        category={selectedCategory}
      />

      <DeleteTagCategoryDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        category={selectedCategory}
      />
    </Main>
  )
}

export default PageTagCategoriesOverview
