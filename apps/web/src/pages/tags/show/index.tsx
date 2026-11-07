import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeftIcon,
  BadgeCheckIcon,
  BookMarkedIcon,
  CheckIcon,
  CopyIcon,
  EditIcon,
  ExternalLinkIcon,
  FlameIcon,
  GitBranchIcon,
  GitMergeIcon,
  LanguagesIcon,
  LockIcon,
  TrashIcon,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams, useSearchParams } from 'react-router'
import { toast } from 'sonner'
import { restApiErrorHandler } from '@/lib/rest-api-handler'
import { useBreadcrumb } from '@/hooks/use-breadcrumb'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DeleteAlertDialog } from '@/components/common/delete-alert-dialog'
import DataLoader from '@/components/layout/data-loader'
import { Main } from '@/components/layout/main'
import { NotFoundError } from '@/pages/errors/not-found-error'
import { FormFieldHelp } from '../components/form-field-help'
import { MergeTagDialog } from '../components/merge-tag-dialog'
import {
  TagCategoryBadge,
  TagSafetyBadge,
  TagStatusBadge,
} from '../components/tag-badges'
import { apiDeleteTag, useDataTagById } from '../queries'
import { DagHierarchyPanel } from './dag-hierarchy-panel'
import { EncyclopediaEditorPanel } from './encyclopedia-editor-panel'

export function PageTagShow() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { id } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()

  const activeTab = searchParams.get('tab') || 'hierarchy'
  const initialWikiLocale = searchParams.get('locale') || 'en'

  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isMergeOpen, setIsMergeOpen] = useState(false)
  const [copiedItem, setCopiedItem] = useState<string | null>(null)

  const { data: tag, isFetching } = useDataTagById(id ?? '')

  useBreadcrumb([
    {
      title: t('navigation.management.tags', 'Tags Governance'),
      href: '/tags',
    },
    { title: tag ? `#${tag.name}` : `#${id}` },
  ])

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopiedItem(type)
    toast.success(t('tags.actions.copied', 'Copied to clipboard'))
    setTimeout(() => setCopiedItem(null), 2000)
  }

  const deleteMutation = useMutation({
    mutationFn: apiDeleteTag,
    onSuccess: () => {
      toast.success(t('tags.messages.deleted', 'Tag deleted successfully'))
      queryClient.invalidateQueries({ queryKey: ['tags'] })
      navigate('/tags')
    },
    onError: restApiErrorHandler,
  })

  if (isFetching) return <DataLoader />
  if (!id || !tag) return <NotFoundError />

  const clientUrl = import.meta.env.VITE_CLIENT_URL || 'http://localhost:3000'

  return (
    <>
      <DeleteAlertDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        handleDelete={() => deleteMutation.mutate(tag.id)}
        isLoading={deleteMutation.isPending}
      />

      <MergeTagDialog
        open={isMergeOpen}
        onOpenChange={setIsMergeOpen}
        sourceTag={tag}
        onMerged={(targetId) => navigate(`/tags/${targetId}/show`)}
      />

      <Main className='flex flex-1 flex-col gap-5 sm:gap-6'>
        {/* Governance Studio Header */}
        <div className='bg-card/60 flex flex-wrap items-start justify-between gap-4 rounded-xl border p-4 shadow-2xs backdrop-blur-xs sm:p-5'>
          <div className='space-y-2.5'>
            <div className='flex flex-wrap items-center gap-2'>
              <div className='group/header-name flex items-center gap-1.5'>
                <h1 className='text-foreground text-2xl font-bold tracking-tight text-balance'>
                  #{tag.name}
                </h1>
                <button
                  type='button'
                  onClick={() => copyToClipboard(tag.name, 'name')}
                  aria-label={t('tags.actions.copyName', 'Copy tag name')}
                  className='text-muted-foreground hover:text-foreground hover:bg-muted shrink-0 cursor-pointer rounded-sm p-1 opacity-60 transition-opacity hover:opacity-100'
                >
                  {copiedItem === 'name' ? (
                    <CheckIcon
                      className='size-3.5 text-emerald-500'
                      aria-hidden='true'
                    />
                  ) : (
                    <CopyIcon className='size-3.5' aria-hidden='true' />
                  )}
                </button>
              </div>

              <TagCategoryBadge category={tag.category} />
              <TagSafetyBadge safetyRating={tag.safetyRating} />
              <TagStatusBadge status={tag.status} />
              {tag.isOfficial && (
                <Badge variant='secondary' className='gap-1'>
                  <BadgeCheckIcon
                    className='text-primary size-3.5'
                    aria-hidden='true'
                  />
                  {t('tags.flags.official', 'Official')}
                </Badge>
              )}
              {tag.isSystem && (
                <Badge
                  variant='outline'
                  className='border-muted-foreground/30 gap-1'
                >
                  <LockIcon className='size-3' aria-hidden='true' />
                  {t('tags.flags.system', 'System Protected')}
                </Badge>
              )}
            </div>

            <div className='text-muted-foreground flex flex-wrap items-center gap-4 text-xs'>
              <div className='inline-flex items-center gap-1.5'>
                <span>Slug:</span>
                <code className='bg-muted text-foreground/90 rounded px-1.5 py-0.5 font-mono text-[11px]'>
                  /{tag.slug}
                </code>
                <button
                  type='button'
                  onClick={() => copyToClipboard(tag.slug, 'slug')}
                  aria-label={t('tags.actions.copySlug', 'Copy slug')}
                  className='text-muted-foreground hover:text-foreground hover:bg-muted shrink-0 cursor-pointer rounded-sm p-0.5 opacity-60 transition-opacity hover:opacity-100'
                >
                  {copiedItem === 'slug' ? (
                    <CheckIcon
                      className='size-3 text-emerald-500'
                      aria-hidden='true'
                    />
                  ) : (
                    <CopyIcon className='size-3' aria-hidden='true' />
                  )}
                </button>
              </div>

              <span className='inline-flex items-center gap-1 tabular-nums'>
                {t('tags.show.usage', 'Usage:')}{' '}
                <strong className='text-foreground font-mono font-semibold'>
                  {tag.usageCount.toLocaleString()}
                </strong>
              </span>

              <span className='inline-flex items-center gap-1 tabular-nums'>
                <FlameIcon
                  className='size-3.5 text-amber-500'
                  aria-hidden='true'
                />
                {t('tags.show.trending', 'Trending:')}{' '}
                <strong className='text-foreground font-mono font-semibold'>
                  {tag.trendingScore.toFixed(1)}
                </strong>
              </span>
            </div>
          </div>

          <div className='flex flex-wrap items-center gap-2'>
            <Button variant='outline' onClick={() => navigate('/tags')}>
              <ArrowLeftIcon className='size-4' aria-hidden='true' />
              {t('buttons.back', 'Back')}
            </Button>

            <Button variant='outline' asChild>
              <a
                href={`${clientUrl}/en/tags/${tag.slug}`}
                target='_blank'
                rel='noreferrer'
              >
                <ExternalLinkIcon className='size-4' aria-hidden='true' />
                {t('tags.show.publicPage', 'Public Tag Page')}
              </a>
            </Button>

            {!tag.isSystem && tag.status !== 'merged' && (
              <Button variant='outline' onClick={() => setIsMergeOpen(true)}>
                <GitMergeIcon className='size-4' aria-hidden='true' />
                {t('tags.show.merge', 'Merge')}
              </Button>
            )}

            <Button onClick={() => navigate(`/tags/${tag.id}/edit`)}>
              <EditIcon className='size-4' aria-hidden='true' />
              {t('buttons.edit', 'Edit')}
            </Button>

            {!tag.isSystem && (
              <Button
                variant='destructive'
                onClick={() => setIsDeleteOpen(true)}
              >
                <TrashIcon className='size-4' aria-hidden='true' />
                {t('buttons.delete', 'Delete')}
              </Button>
            )}
          </div>
        </div>

        {/* Studio Workspace Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(nextTab) => {
            const next = new URLSearchParams(searchParams)
            next.set('tab', nextTab)
            setSearchParams(next, { replace: true })
          }}
          className='flex flex-1 flex-col gap-5'
        >
          <TabsList className='w-fit'>
            <TabsTrigger value='hierarchy' className='gap-2'>
              <GitBranchIcon className='size-4' aria-hidden='true' />
              {t('tags.studio.tabHierarchy', 'Semantic DAG Hierarchy')}
            </TabsTrigger>
            <TabsTrigger value='encyclopedia' className='gap-2'>
              <BookMarkedIcon className='size-4' aria-hidden='true' />
              {t('tags.studio.tabEncyclopedia', 'Encyclopedia Wiki (dic)')}
            </TabsTrigger>
            <TabsTrigger value='metadata' className='gap-2'>
              <LanguagesIcon className='size-4' aria-hidden='true' />
              {t('tags.studio.tabMetadata', 'Translations & Aliases')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value='hierarchy' className='m-0'>
            <DagHierarchyPanel tag={tag} />
          </TabsContent>

          <TabsContent value='encyclopedia' className='m-0'>
            <EncyclopediaEditorPanel
              tag={tag}
              initialLocale={initialWikiLocale}
            />
          </TabsContent>

          <TabsContent value='metadata' className='m-0'>
            <div className='grid gap-6 md:grid-cols-2'>
              <Card className='shadow-xs'>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2 text-base'>
                    {t(
                      'tags.form.translationsSection',
                      'Multilingual Translations'
                    )}
                    <FormFieldHelp tooltip={t('tags.help.translations')} />
                  </CardTitle>
                  <CardDescription>
                    {t(
                      'tags.show.translationsDesc',
                      'Localized names and short summaries served in autocomplete and hover previews.'
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!tag.translations || tag.translations.length === 0 ? (
                    <p className='text-muted-foreground text-xs italic'>
                      {t(
                        'tags.show.noTranslations',
                        'No localized translations configured yet.'
                      )}
                    </p>
                  ) : (
                    <div className='divide-y'>
                      {tag.translations.map((tr) => (
                        <div key={tr.id} className='space-y-1 py-3 first:pt-0'>
                          <div className='flex items-center gap-2'>
                            <Badge
                              variant='outline'
                              className='font-mono text-[11px] uppercase'
                            >
                              {tr.locale}
                            </Badge>
                            <span className='text-sm font-semibold'>
                              {tr.translatedName}
                            </span>
                          </div>
                          {tr.shortSummary && (
                            <p className='text-muted-foreground text-xs leading-relaxed text-pretty'>
                              {tr.shortSummary}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className='shadow-xs'>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2 text-base'>
                    {t(
                      'tags.form.aliasesSection',
                      'Orthographic Aliases (表記揺れ)'
                    )}
                    <FormFieldHelp tooltip={t('tags.help.aliases')} />
                  </CardTitle>
                  <CardDescription>
                    {t(
                      'tags.show.aliasesDesc',
                      'Keywords that automatically resolve and 301-redirect to this canonical tag.'
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!tag.aliases || tag.aliases.length === 0 ? (
                    <p className='text-muted-foreground text-xs italic'>
                      {t(
                        'tags.show.noAliases',
                        'No orthographic aliases registered yet.'
                      )}
                    </p>
                  ) : (
                    <div className='flex flex-wrap gap-2'>
                      {tag.aliases.map((al) => (
                        <div
                          key={al.id}
                          className='bg-muted/30 inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs'
                        >
                          <span className='font-medium'>{al.aliasName}</span>
                          <Badge
                            variant='secondary'
                            className='px-1.5 py-0 text-[10px]'
                          >
                            {al.aliasType}
                          </Badge>
                          {al.locale && (
                            <span className='text-muted-foreground font-mono text-[10px] uppercase'>
                              {al.locale}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </Main>
    </>
  )
}
