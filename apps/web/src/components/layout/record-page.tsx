import type { ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router'
import { useBreadcrumb } from '@/hooks/use-breadcrumb'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Main } from './main'
import { PageHeader, PageHeaderContext, PageShell } from './page-shell'

/** Shared route boundary for record loading, recovery, breadcrumbs and return navigation. */
export function RecordPage<T>({
  title,
  backTo,
  load,
  children,
  create = false,
  showBack = true,
}: {
  title: string
  backTo: string
  load: (id: string) => Promise<T>
  children: (record: T | null, onClose: () => void) => ReactNode
  create?: boolean
  showBack?: boolean
}) {
  const { t } = useTranslation()
  const { id } = useParams()
  const navigate = useNavigate()
  const query = useQuery({
    queryKey: ['record-page', backTo, id],
    queryFn: () => load(id!),
    enabled: !create && !!id,
    // Opening an editor always reads the current server record.
    staleTime: 0,
  })
  useBreadcrumb([
    { title, href: backTo },
    { title: create ? t('recordPage.create', 'Create') : id || title },
  ])
  const close = () => navigate(backTo)
  return (
    <Main>
      <PageShell>
        <PageHeaderContext.Provider
          value={{
            backTo,
            backLabel: t('buttons.back', 'Back'),
            hideBack: create || !showBack,
          }}
        >
          {!create && query.isPending ? (
            <div
              role='status'
              aria-label={t('recordPage.loading', 'Loading')}
              className='space-y-6'
            >
              <Skeleton className='h-8 w-64 max-w-full' />
              <Skeleton className='h-64 w-full' />
            </div>
          ) : !create && (query.isError || !query.data) ? (
            <>
              <PageHeader title={title} />
              <div role='alert' className='space-y-4 rounded-xl border p-6'>
                <p>
                  {t(
                    'recordPage.loadError',
                    'Unable to load this record. Please try again.'
                  )}
                </p>
                <Button variant='outline' onClick={() => void query.refetch()}>
                  {t('recordPage.retry', 'Retry')}
                </Button>
              </div>
            </>
          ) : (
            children(query.data ?? null, close)
          )}
        </PageHeaderContext.Provider>
      </PageShell>
    </Main>
  )
}
