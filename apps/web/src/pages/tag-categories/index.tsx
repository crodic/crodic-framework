import { useCallback, useMemo, useState } from 'react'
import { BookMarked, Plus, Tags } from 'lucide-react'
import { parseAsString } from 'nuqs'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
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

const categoryFilterParsers = {
  name: parseAsString,
  slug: parseAsString,
  isSystem: parseAsString,
  isActive: parseAsString,
} as const

export function PageTagCategoriesOverview() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [selectedCategory, setSelectedCategory] =
    useState<TagCategorySchema | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  useBreadcrumb([
    {
      title: t('navigation.management.tags', 'Tags Governance'),
      href: '/tags',
    },
    {
      title: t('navigation.management.tagCategories', 'Tag Categories'),
    },
  ])

  const handleCreate = useCallback(() => {
    navigate('/tag-categories/create')
  }, [navigate])

  const handleEdit = useCallback(
    (category: TagCategorySchema) => {
      navigate(`/tag-categories/${category.id}/edit`)
    },
    [navigate]
  )

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
    <Main className='flex-1'>
      <PageHeader
        title={t('navigation.management.tagCategories', 'Tag Categories')}
        description={t(
          'tagCategories.description',
          'Define top-level semantic classifications, icons, and theme accents for tags.'
        )}
        actions={
          <div className='flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:gap-2'>
            <Button
              variant='outline'
              onClick={() => navigate('/tags')}
              className='w-full cursor-pointer gap-2 sm:w-auto'
            >
              <Tags
                className='text-muted-foreground size-4'
                aria-hidden='true'
              />
              <span>{t('navigation.management.tags', 'Tags Governance')}</span>
            </Button>
            <Button
              variant='outline'
              onClick={() => navigate('/tag-encyclopedias')}
              className='w-full cursor-pointer gap-2 sm:w-auto'
            >
              <BookMarked
                className='text-muted-foreground size-4'
                aria-hidden='true'
              />
              <span>
                {t(
                  'navigation.management.tagEncyclopedias',
                  'Tag Encyclopedia'
                )}
              </span>
            </Button>
            <Button
              onClick={handleCreate}
              className='gap-2 shadow-xs sm:w-auto'
            >
              <Plus className='size-4' />
              <span>{t('tagCategories.actions.add', 'Thêm danh mục')}</span>
            </Button>
          </div>
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

      <DeleteTagCategoryDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        category={selectedCategory}
      />
    </Main>
  )
}

export default PageTagCategoriesOverview
