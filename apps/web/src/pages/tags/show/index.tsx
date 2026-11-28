import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
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
  Wand2Icon,
  TagIcon,
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
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { DeleteAlertDialog } from '@/components/common/delete-alert-dialog'
import DataLoader from '@/components/layout/data-loader'
import { Main } from '@/components/layout/main'
import { PageHeader } from '@/components/layout/page-shell'
import { NotFoundError } from '@/pages/errors/not-found-error'
import { MergeTagDialog } from '../components/merge-tag-dialog'
import {
  TagCategoryBadge,
  TagSafetyBadge,
  TagStatusBadge,
} from '../components/tag-badges'
import { apiDeleteTag, useDataTagById } from '../queries'
import type { TagAlias, TagTranslation } from '../schema'
import { resolveValidTagLocale } from '../schema'
import { DagHierarchyPanel } from './dag-hierarchy-panel'
import { EncyclopediaEditorPanel } from './encyclopedia-editor-panel'

export function PageTagShow() {
  const { id } = useParams<{ id: string }>()
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()

  const activeTab = searchParams.get('tab') || 'hierarchy'
  const initialWikiLocale = resolveValidTagLocale(
    searchParams.get('locale') || i18n.resolvedLanguage || i18n.language
  )

  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isMergeOpen, setIsMergeOpen] = useState(false)
  const [copiedItem, setCopiedItem] = useState<'name' | 'slug' | null>(null)

  const { data: tag, isFetching } = useDataTagById(id ?? '')

  useBreadcrumb([
    {
      title: t('navigation.management.tags', 'Tags Governance'),
      href: '/tags',
    },
    { title: tag ? `#${tag.name}` : `#${id}` },
  ])

  const copyToClipboard = (text: string, type: 'name' | 'slug') => {
    navigator.clipboard.writeText(text)
    setCopiedItem(type)
    toast.success(t('tags.actions.copied', 'Copied to clipboard'))
    setTimeout(() => {
      setCopiedItem(null)
    }, 1500)
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

  const clientUrl = import.meta.env.VITE_CLIENT_URL || 'https://crodic.net'

  if (!tag && isFetching) return <DataLoader />
  if (!id || !tag) return <NotFoundError />

  const totalDagRelations =
    (tag.graph.parents?.length ?? 0) +
    (tag.graph.children?.length ?? 0) +
    (tag.graph.siblings?.length ?? 0) +
    (tag.graph.related?.length ?? 0) +
    (tag.graph.disambiguations?.length ?? 0)

  const translationsCount = tag.translations?.length ?? 0
  const aliasesCount = tag.aliases?.length ?? 0

  return (
    <>
      <DeleteAlertDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title={t('tags.dialogs.deleteTitle', 'Delete Canonical Tag')}
        description={t(
          'tags.dialogs.deleteDesc',
          'Are you sure you want to delete #{{name}}? Associated community artworks and pages will be decoupled.',
          { name: tag.name }
        )}
        handleDelete={() => deleteMutation.mutate(tag.id)}
        isLoading={deleteMutation.isPending}
      />

      <MergeTagDialog
        open={isMergeOpen}
        onOpenChange={setIsMergeOpen}
        sourceTag={tag}
        onMerged={(targetId) => navigate(`/tags/${targetId}/show`)}
      />

      <Main className='flex-1'>
        {/* Tag summary */}
        <div className='space-y-6'>
          {/* Top Row: Title, Category Badges & Action Toolbar */}
          <PageHeader
            title={<>#{tag.name}</>}
            backTo='/tags'
            backLabel={t('buttons.back')}
            badges={
              <>
                <Tooltip delayDuration={200}>
                  <TooltipTrigger asChild>
                    <button
                      type='button'
                      onClick={() => copyToClipboard(tag.name, 'name')}
                      aria-label={t('tags.actions.copyName', 'Copy tag name')}
                      className='text-muted-foreground hover:text-foreground hover:bg-muted shrink-0 cursor-pointer rounded-md p-1 opacity-70 transition-opacity hover:opacity-100 focus-visible:opacity-100'
                    >
                      {copiedItem === 'name' ? (
                        <CheckIcon
                          className='text-primary size-3.5'
                          aria-hidden='true'
                        />
                      ) : (
                        <CopyIcon className='size-3.5' aria-hidden='true' />
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side='top' className='text-xs'>
                    {copiedItem === 'name'
                      ? t('tags.actions.copied', 'Copied!')
                      : t('tags.actions.copyName', 'Copy tag name')}
                  </TooltipContent>
                </Tooltip>
                <div className='flex flex-wrap items-center gap-1.5'>
                  <TagStatusBadge status={tag.status} />
                  <TagCategoryBadge category={tag.category} />
                  <TagSafetyBadge safetyRating={tag.safetyRating} />

                  {tag.isOfficial && (
                    <Badge
                      variant='secondary'
                      className='border-primary/20 bg-primary/10 text-primary gap-1 text-[11px] font-semibold shadow-2xs'
                    >
                      <BadgeCheckIcon
                        className='text-primary size-3.5'
                        aria-hidden='true'
                      />
                      {t('tags.flags.official', 'Official Curated')}
                    </Badge>
                  )}

                  {tag.isSystem && (
                    <Badge
                      variant='outline-warning'
                      className='gap-1 text-[11px] font-semibold'
                    >
                      <LockIcon className='size-3' aria-hidden='true' />
                      {t('tags.flags.system', 'System Protected')}
                    </Badge>
                  )}
                </div>
              </>
            }
            description={
              <div className='text-muted-foreground flex flex-wrap items-center gap-2 text-xs'>
                <div className='border-border/70 bg-background/60 inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 font-mono text-[11px]'>
                  <span>/{tag.slug}</span>
                  <button
                    type='button'
                    onClick={() => copyToClipboard(tag.slug, 'slug')}
                    aria-label={t('tags.actions.copySlug', 'Copy slug')}
                    className='text-muted-foreground hover:text-foreground cursor-pointer'
                  >
                    {copiedItem === 'slug' ? (
                      <CheckIcon
                        className='text-primary size-3'
                        aria-hidden='true'
                      />
                    ) : (
                      <CopyIcon className='size-3' aria-hidden='true' />
                    )}
                  </button>
                </div>

                {tag.translatedName && tag.translatedName !== tag.name && (
                  <>
                    <span>•</span>
                    <span className='text-foreground/85 font-medium'>
                      {tag.translatedName}
                    </span>
                  </>
                )}
              </div>
            }
            actions={
              <div className='grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center sm:justify-end'>
                <Button
                  variant='outline'
                  size='sm'
                  asChild
                  className='h-9 w-full cursor-pointer shadow-2xs sm:w-auto'
                >
                  <a
                    href={`${clientUrl}/en/tags/${tag.slug}`}
                    target='_blank'
                    rel='noreferrer'
                    className='gap-1.5'
                  >
                    <ExternalLinkIcon className='size-3.5' aria-hidden='true' />
                    <span>{t('tags.show.publicPage', 'Public Hub')}</span>
                  </a>
                </Button>

                {!tag.isSystem && tag.status !== 'merged' && (
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => setIsMergeOpen(true)}
                    className='h-9 w-full cursor-pointer gap-1.5 shadow-2xs sm:w-auto'
                  >
                    <GitMergeIcon
                      className='text-primary size-3.5'
                      aria-hidden='true'
                    />
                    <span>
                      {t('tags.actions.mergeTag', 'Merge Into Tag...')}
                    </span>
                  </Button>
                )}

                <Button
                  size='sm'
                  onClick={() => navigate(`/tags/${tag.id}/edit`)}
                  className='h-9 w-full cursor-pointer gap-1.5 shadow-xs sm:w-auto'
                >
                  <EditIcon className='size-3.5' aria-hidden='true' />
                  <span>{t('buttons.edit', 'Edit')}</span>
                </Button>

                {!tag.isSystem && (
                  <Button
                    variant='destructive'
                    size='sm'
                    onClick={() => setIsDeleteOpen(true)}
                    className='h-9 w-full cursor-pointer gap-1.5 shadow-xs sm:w-auto'
                  >
                    <TrashIcon className='size-3.5' aria-hidden='true' />
                    <span>{t('buttons.delete', 'Delete')}</span>
                  </Button>
                )}
              </div>
            }
          />

          {/* Bottom Row: Executive Metrics Strip */}
          <div className='grid grid-cols-2 gap-3 pt-5 sm:grid-cols-4'>
            <div className='bg-muted/40 border-border/60 rounded-xl border p-3'>
              <div className='text-muted-foreground flex items-center gap-1.5 text-xs font-medium'>
                <TagIcon className='text-primary size-3.5' aria-hidden='true' />
                <span>{t('tags.table.usageCount', 'Usage Count')}</span>
              </div>
              <p className='text-foreground mt-1 font-mono text-xl font-bold tracking-tight tabular-nums'>
                {tag.usageCount?.toLocaleString() ?? 0}
              </p>
            </div>

            <div className='bg-muted/40 border-border/60 rounded-xl border p-3'>
              <div className='text-muted-foreground flex items-center gap-1.5 text-xs font-medium'>
                <FlameIcon
                  className='text-primary size-3.5'
                  aria-hidden='true'
                />
                <span>{t('tags.table.trendingScore', 'Trending Score')}</span>
              </div>
              <p className='text-foreground mt-1 font-mono text-xl font-bold tracking-tight tabular-nums'>
                {tag.trendingScore?.toFixed(1) ?? '0.0'}
              </p>
            </div>

            <div className='bg-muted/40 border-border/60 rounded-xl border p-3'>
              <div className='text-muted-foreground flex items-center gap-1.5 text-xs font-medium'>
                <GitBranchIcon
                  className='text-primary size-3.5'
                  aria-hidden='true'
                />
                <span>{t('tags.show.metricRelations', 'DAG Relations')}</span>
              </div>
              <p className='text-foreground mt-1 font-mono text-xl font-bold tracking-tight tabular-nums'>
                {totalDagRelations}
              </p>
            </div>

            <div className='bg-muted/40 border-border/60 rounded-xl border p-3'>
              <div className='text-muted-foreground flex items-center gap-1.5 text-xs font-medium'>
                <BookMarkedIcon
                  className='text-primary size-3.5'
                  aria-hidden='true'
                />
                <span>{t('tags.show.metricEditions', 'Wiki Editions')}</span>
              </div>
              <p className='text-foreground mt-1 font-mono text-xl font-bold tracking-tight tabular-nums'>
                {translationsCount}
              </p>
            </div>
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
          className='flex flex-1 flex-col gap-6'
        >
          <div className='-mx-1 w-full [scrollbar-width:none] overflow-x-auto px-1'>
            <TabsList className='h-auto min-w-full justify-start gap-1 p-1 sm:h-9 sm:w-fit sm:justify-center'>
              <TabsTrigger
                value='hierarchy'
                className='shrink-0 gap-1.5 px-3 py-1.5 text-xs sm:text-sm'
              >
                <GitBranchIcon className='size-4' aria-hidden='true' />
                <span>
                  {t('tags.studio.tabHierarchy', 'Semantic DAG Hierarchy')}
                </span>
                <Badge
                  variant='secondary'
                  className='ml-0.5 h-4 px-1.5 font-mono text-[10px] tabular-nums'
                >
                  {totalDagRelations}
                </Badge>
              </TabsTrigger>

              <TabsTrigger
                value='encyclopedia'
                className='shrink-0 gap-1.5 px-3 py-1.5 text-xs sm:text-sm'
              >
                <BookMarkedIcon className='size-4' aria-hidden='true' />
                <span>
                  {t(
                    'tags.studio.tabEncyclopedia',
                    'Community Encyclopedia (dic)'
                  )}
                </span>
              </TabsTrigger>

              <TabsTrigger
                value='metadata'
                className='shrink-0 gap-1.5 px-3 py-1.5 text-xs sm:text-sm'
              >
                <LanguagesIcon className='size-4' aria-hidden='true' />
                <span>
                  {t('tags.studio.tabMetadata', 'Translations & Aliases')}
                </span>
                <Badge
                  variant='outline'
                  className='ml-0.5 h-4 px-1.5 font-mono text-[10px] tabular-nums'
                >
                  {translationsCount + aliasesCount}
                </Badge>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent
            value='hierarchy'
            className='m-0 focus-visible:outline-none'
          >
            <DagHierarchyPanel tag={tag} />
          </TabsContent>

          <TabsContent
            value='encyclopedia'
            className='m-0 focus-visible:outline-none'
          >
            <EncyclopediaEditorPanel
              tag={tag}
              initialLocale={initialWikiLocale}
            />
          </TabsContent>

          <TabsContent
            value='metadata'
            className='m-0 focus-visible:outline-none'
          >
            <div className='grid gap-6 md:grid-cols-2'>
              {/* Translations Card */}
              <Card className='border-border/80 flex flex-col gap-0 shadow-xs'>
                <CardHeader>
                  <div className='flex items-center justify-between'>
                    <div>
                      <CardTitle className='text-base font-semibold'>
                        {t(
                          'tags.form.translationsSection',
                          'Multilingual Translations'
                        )}
                      </CardTitle>
                      <CardDescription className='text-xs'>
                        {t(
                          'tags.show.translationsDesc',
                          'Localized names and short summaries served in autocomplete and hover previews.'
                        )}
                      </CardDescription>
                    </div>
                    <Badge
                      variant='outline'
                      className='font-mono text-xs tabular-nums'
                    >
                      {tag.translations?.length || 0}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className='flex flex-1 flex-col justify-center p-4'>
                  {!tag.translations || tag.translations.length === 0 ? (
                    <Empty className='border-0 p-2 sm:p-4 md:p-6'>
                      <EmptyHeader>
                        <EmptyMedia variant='icon'>
                          <LanguagesIcon className='size-5' />
                        </EmptyMedia>
                        <EmptyTitle className='text-sm'>
                          {t(
                            'tags.show.noTranslations',
                            'No localized translations configured yet.'
                          )}
                        </EmptyTitle>
                        <EmptyDescription className='text-xs'>
                          {t(
                            'tags.form.translationsDesc',
                            'Provide localized display names and concise hover summaries across supported languages.'
                          )}
                        </EmptyDescription>
                      </EmptyHeader>
                    </Empty>
                  ) : (
                    <div className='grid gap-3'>
                      {tag.translations.map((tr: TagTranslation) => (
                        <div
                          key={tr.id}
                          className='border-border/70 bg-card hover:border-border rounded-xl border p-4 transition-colors'
                        >
                          <div className='border-border/50 flex items-center justify-between border-b pb-2.5'>
                            <div className='flex items-center gap-2'>
                              <Badge
                                variant='outline'
                                className='bg-muted/40 font-mono text-[10px] font-bold tracking-wider uppercase'
                              >
                                {tr.locale}
                              </Badge>
                              <span className='text-foreground text-sm font-bold'>
                                #{tr.translatedName}
                              </span>
                            </div>
                            <span className='text-muted-foreground font-mono text-[10px]'>
                              locale: {tr.locale}
                            </span>
                          </div>
                          {tr.shortSummary ? (
                            <p className='text-muted-foreground mt-2 text-xs leading-relaxed italic'>
                              &ldquo;{tr.shortSummary}&rdquo;
                            </p>
                          ) : (
                            <p className='text-muted-foreground/60 mt-2 text-[11px] italic'>
                              {t(
                                'tags.show.noSummary',
                                'No hover tooltip summary provided.'
                              )}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Aliases Card */}
              <Card className='border-border/80 flex flex-col gap-0 shadow-xs'>
                <CardHeader>
                  <div className='flex items-center justify-between'>
                    <div>
                      <CardTitle className='text-base font-semibold'>
                        {t('tags.form.aliasesSection', 'Orthographic Aliases')}
                      </CardTitle>
                      <CardDescription className='text-xs'>
                        {t(
                          'tags.show.aliasesDesc',
                          'Keywords that automatically resolve and 301-redirect to this canonical tag.'
                        )}
                      </CardDescription>
                    </div>
                    <Badge
                      variant='outline'
                      className='font-mono text-xs tabular-nums'
                    >
                      {tag.aliases?.length || 0}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className='flex flex-1 flex-col justify-center p-4'>
                  {!tag.aliases || tag.aliases.length === 0 ? (
                    <Empty className='border-0 p-2 sm:p-4 md:p-6'>
                      <EmptyHeader>
                        <EmptyMedia variant='icon'>
                          <Wand2Icon className='size-5' />
                        </EmptyMedia>
                        <EmptyTitle className='text-sm'>
                          {t(
                            'tags.show.noAliases',
                            'No orthographic aliases registered yet.'
                          )}
                        </EmptyTitle>
                        <EmptyDescription className='text-xs'>
                          {t(
                            'tags.show.aliasesDesc',
                            'Keywords that automatically resolve and 301-redirect to this canonical tag.'
                          )}
                        </EmptyDescription>
                      </EmptyHeader>
                    </Empty>
                  ) : (
                    <div className='flex flex-wrap gap-2'>
                      {tag.aliases.map((al: TagAlias) => (
                        <div
                          key={al.id}
                          className='group border-border/70 bg-card hover:border-foreground/30 flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs transition-colors'
                        >
                          <span className='text-foreground text-xs font-bold'>
                            {al.aliasName}
                          </span>
                          <span className='bg-muted text-muted-foreground rounded px-1.5 py-0.5 font-mono text-[10px] uppercase'>
                            {al.aliasType}
                          </span>
                          {al.locale && (
                            <span className='text-muted-foreground font-mono text-[10px] uppercase'>
                              [{al.locale}]
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
export const TagShowPage = PageTagShow
