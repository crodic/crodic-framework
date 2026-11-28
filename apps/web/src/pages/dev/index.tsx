import { FlaskConical, Layers, TableProperties } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Main } from '@/components/layout/main'
import { PageHeader } from '@/components/layout/page-shell'
import { FormExamplesDemo } from './examples'
import { ExpandingDataTableDemo } from './ui-preview'

export function PageDevPlayground() {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') || 'forms'

  const handleTabChange = (tab: string) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        next.set('tab', tab)
        return next
      },
      { replace: true }
    )
  }

  return (
    <>
      <Main className=''>
        <PageHeader
          title={<>{t('dev.playground.title')}</>}
          description={<>{t('dev.playground.description')}</>}
          badges={
            <>
              <FlaskConical className='size-5' />
              <Badge
                variant='outline-warning'
                className='font-mono text-xs font-semibold'
              >
                {t('dev.playground.badge')}
              </Badge>
            </>
          }
        />

        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className='w-full space-y-6'
        >
          <TabsList>
            <TabsTrigger value='forms' className='gap-2'>
              <Layers className='size-4' />
              <span>{t('dev.playground.tabForms')}</span>
            </TabsTrigger>
            <TabsTrigger value='table' className='gap-2'>
              <TableProperties className='size-4' />
              <span>{t('dev.playground.tabTable')}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value='forms'
            className='space-y-6 focus-visible:outline-none'
          >
            <FormExamplesDemo />
          </TabsContent>

          <TabsContent
            value='table'
            className='space-y-6 focus-visible:outline-none'
          >
            <div className='space-y-6'>
              <div className='flex flex-col gap-1'>
                <h2 className='text-lg font-semibold tracking-tight'>
                  {t('dev.playground.uiPreviewTitle')}
                </h2>
                <p className='text-muted-foreground text-sm'>
                  {t('dev.playground.uiPreviewDesc')}
                </p>
              </div>
              <ExpandingDataTableDemo />
            </div>
          </TabsContent>
        </Tabs>
      </Main>
    </>
  )
}
