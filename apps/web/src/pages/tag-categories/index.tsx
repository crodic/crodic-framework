import { useCallback, useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { parseAsString } from 'nuqs'
import { useTranslation } from 'react-i18next'
import { useBreadcrumb } from '@/hooks/use-breadcrumb'
import {
  useResourceTable,
  type ResourceQueryBuilderFn,
} from '@/hooks/use-resource-table'
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
        onEdit: handleEdit,
        onDelete: handleDelete,
      }),
    [handleEdit, handleDelete]
  )

  const buildQuery: ResourceQueryBuilderFn<typeof categoryFilterParsers> =
    useCallback((builder, filter) => {
      if (filter.name) {
        builder.ilike('name', filter.name)
      }
      if (filter.slug) {
        builder.ilike('slug', filter.slug)
      }
      if (filter.isSystem) {
        builder.eq('isSystem', filter.isSystem === 'system')
      }
      if (filter.isActive) {
        builder.eq('isActive', filter.isActive === 'active')
      }
    }, [])

  const { table, isFetching } = useResourceTable<
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
      >
        <Button onClick={handleCreate} className='gap-2 shadow-xs'>
          <Plus className='size-4' />
          <span>Thêm danh mục</span>
        </Button>
      </PageHeader>

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
