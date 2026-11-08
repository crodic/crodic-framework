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
  SparklesIcon,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DeleteAlertDialog } from '@/components/common/delete-alert-dialog'
import DataLoader from '@/components/layout/data-loader'
import { Main } from '@/components/layout/main'
import { NotFoundError } from '@/pages/errors/not-found-error'
import { MergeTagDialog } from '../components/merge-tag-dialog'
import {
  TagCategoryBadge,
  TagSafetyBadge,
  TagStatusBadge,
} from '../components/tag-badges'
import { apiDeleteTag, useDataTagById } from '../queries'
import type { TagAlias, TagTranslation } from '../schema'
import { DagHierarchyPanel } from './dag-hierarchy-panel'
import { EncyclopediaEditorPanel } from './encyclopedia-editor-panel'

export function PageTagShow() {
  const { id } = useParams<{ id: string }>()
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()

  const activeTab = searchParams.get('tab') || 'hierarchy'
  const initialWikiLocale = searchParams.get('locale') || i18n.language || 'en'

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

  if (isFetching) return <DataLoader />
  if (!id || !tag) return <NotFoundError />

  return (
    <>
      <DeleteAlertDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title={t('tags.dialogs.deleteTitle', 'Delete Canonical Tag')}
        description={t(
          'tags.dialogs.deleteDesc',
          'Are you sure you want to delete #{{name}}? Community artworks and pages will be decoupled.',
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

      <Main className='flex flex-1 flex-col gap-6'>
        {/* Executive Studio Header Card */}
        <div className='bg-card border-border/80 rounded-2xl border p-5 shadow-2xs backdrop-blur-xs sm:p-6'>
          {/* Top Row: Title, Category Badges & Action Toolbar */}
          <div className='border-border/60 flex flex-wrap items-center justify-between gap-4 border-b pb-5'>
            <div className='flex items-center gap-3'>
              <Button
                variant='outline'
                size='icon'
                onClick={() => navigate('/tags')}
                className='size-9 shrink-0 cursor-pointer shadow-2xs'
                aria-label={t('buttons.back', 'Back')}
              >
                <ArrowLeftIcon className='size-4' aria-hidden='true' />
              </Button>

              <div className='flex flex-wrap items-center gap-2.5'>
                <div className='group/header-name flex items-center gap-1.5'>
                  <h1 className='text-foreground text-2xl font-bold tracking-tight sm:text-3xl'>
                    #{tag.name}
                  </h1>
                  <button
                    type='button'
                    onClick={() => copyToClipboard(tag.name, 'name')}
                    aria-label={t('tags.actions.copyName', 'Copy tag name')}
                    className='text-muted-foreground hover:text-foreground hover:bg-muted shrink-0 cursor-pointer rounded-md p-1 opacity-70 transition-opacity hover:opacity-100'
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
                <TagStatusBadge status={tag.status} />
              </div>
            </div>

            {/* Right Action Cluster */}
            <div className='flex flex-wrap items-center gap-2'>
              <Button
                variant='outline'
                size='sm'
                asChild
                className='h-9 cursor-pointer shadow-2xs'
              >
                <a
                  href={`${clientUrl}/en/tags/${tag.slug}`}
                  target='_blank'
                  rel='noreferrer'
                  className='gap-1.5'
                >
                  <ExternalLinkIcon className='size-3.5' aria-hidden='true' />
                  <span>{t('tags.show.publicPage', 'Trang công khai')}</span>
                </a>
              </Button>

              {!tag.isSystem && tag.status !== 'merged' && (
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => setIsMergeOpen(true)}
                  className='h-9 cursor-pointer gap-1.5 shadow-2xs'
                >
                  <GitMergeIcon className='size-3.5' aria-hidden='true' />
                  <span>{t('tags.show.merge', 'Hợp nhất')}</span>
                </Button>
              )}

              <Button
                size='sm'
                onClick={() => navigate(`/tags/${tag.id}/edit`)}
                className='h-9 cursor-pointer gap-1.5 shadow-xs'
              >
                <EditIcon className='size-3.5' aria-hidden='true' />
                <span>{t('buttons.edit', 'Chỉnh sửa')}</span>
              </Button>

              {!tag.isSystem && (
                <Button
                  variant='destructive'
                  size='sm'
                  onClick={() => setIsDeleteOpen(true)}
                  className='h-9 cursor-pointer gap-1.5 shadow-xs'
                >
                  <TrashIcon className='size-3.5' aria-hidden='true' />
                  <span>{t('buttons.delete', 'Xóa')}</span>
                </Button>
              )}
            </div>
          </div>

          {/* Bottom Row: Metadata & Governance Badges Strip */}
          <div className='flex flex-wrap items-center gap-3 pt-4 text-xs'>
            <TagCategoryBadge category={tag.category} />
            <TagSafetyBadge safetyRating={tag.safetyRating} />

            {tag.isOfficial && (
              <Badge
                variant='secondary'
                className='text-primary gap-1 text-[11px] font-semibold shadow-2xs'
              >
                <BadgeCheckIcon
                  className='text-primary size-3.5'
                  aria-hidden='true'
                />
                {t('tags.flags.official', 'Chính thức')}
              </Badge>
            )}
            {tag.isSystem && (
              <Badge
                variant='outline'
                className='gap-1 border-amber-500/30 text-[11px] font-semibold text-amber-600 dark:text-amber-400'
              >
                <LockIcon className='size-3' aria-hidden='true' />
                {t('tags.flags.system', 'Hệ thống bảo vệ')}
              </Badge>
            )}

            <span className='text-border select-none'>•</span>

            <div className='border-border/70 bg-muted/30 inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 font-mono text-[11px]'>
              <span className='text-muted-foreground'>Slug:</span>
              <span className='text-foreground font-semibold'>/{tag.slug}</span>
              <button
                type='button'
                onClick={() => copyToClipboard(tag.slug, 'slug')}
                aria-label={t('tags.actions.copySlug', 'Copy slug')}
                className='text-muted-foreground hover:text-foreground ml-0.5 cursor-pointer'
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

            <span className='text-border select-none'>•</span>

            <div className='text-muted-foreground inline-flex items-center gap-1.5'>
              <TagIcon className='text-primary size-3.5' aria-hidden='true' />
              <span>{t('tags.show.usage', 'Lượt dùng:')}</span>
              <span className='text-foreground font-mono font-bold tabular-nums'>
                {tag.usageCount?.toLocaleString() ?? 0}
              </span>
            </div>

            <span className='text-border select-none'>•</span>

            <div className='text-muted-foreground inline-flex items-center gap-1.5'>
              <FlameIcon
                className='size-3.5 text-amber-500'
                aria-hidden='true'
              />
              <span>{t('tags.show.trending', 'Xu hướng:')}</span>
              <span className='text-foreground font-mono font-bold tabular-nums'>
                {tag.trendingScore?.toFixed(1) ?? '0.0'}
              </span>
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
          className='flex flex-1 flex-col gap-5'
        >
          <TabsList className='bg-muted/40 w-fit rounded-xl border p-1'>
            <TabsTrigger
              value='hierarchy'
              className='gap-2 rounded-lg text-xs font-semibold'
            >
              <GitBranchIcon className='size-4' aria-hidden='true' />
              {t('tags.studio.tabHierarchy', 'Cây Phân cấp Ngữ nghĩa (DAG)')}
            </TabsTrigger>
            <TabsTrigger
              value='encyclopedia'
              className='gap-2 rounded-lg text-xs font-semibold'
            >
              <BookMarkedIcon className='size-4' aria-hidden='true' />
              {t('tags.studio.tabEncyclopedia', 'Từ điển Wiki (dic)')}
            </TabsTrigger>
            <TabsTrigger
              value='metadata'
              className='gap-2 rounded-lg text-xs font-semibold'
            >
              <LanguagesIcon className='size-4' aria-hidden='true' />
              {t('tags.studio.tabMetadata', 'Bản dịch & Tên biến thể')}
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
              {/* Translations Card */}
              <Card className='border-border/80 shadow-2xs'>
                <CardHeader className='border-b px-5 py-4'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2.5'>
                      <div className='bg-primary/10 text-primary flex size-8 items-center justify-center rounded-lg'>
                        <LanguagesIcon
                          className='size-4.5'
                          aria-hidden='true'
                        />
                      </div>
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
                    </div>
                    <Badge
                      variant='outline'
                      className='font-mono text-xs tabular-nums'
                    >
                      {tag.translations?.length || 0}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className='p-5'>
                  {!tag.translations || tag.translations.length === 0 ? (
                    <div className='border-border/70 text-muted-foreground rounded-xl border border-dashed p-6 text-center text-xs'>
                      {t(
                        'tags.show.noTranslations',
                        'No localized translations configured yet.'
                      )}
                    </div>
                  ) : (
                    <div className='grid gap-3'>
                      {tag.translations.map((tr: TagTranslation) => (
                        <div
                          key={tr.id}
                          className='border-border/70 bg-card hover:border-border rounded-xl border p-3.5 shadow-2xs transition-all'
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
              <Card className='border-border/80 shadow-2xs'>
                <CardHeader className='border-b px-5 py-4'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2.5'>
                      <div className='bg-primary/10 text-primary flex size-8 items-center justify-center rounded-lg'>
                        <SparklesIcon className='size-4.5' aria-hidden='true' />
                      </div>
                      <div>
                        <CardTitle className='text-base font-semibold'>
                          {t(
                            'tags.form.aliasesSection',
                            'Tên biến thể & Từ đồng nghĩa (Aliases)'
                          )}
                        </CardTitle>
                        <CardDescription className='text-xs'>
                          {t(
                            'tags.show.aliasesDesc',
                            'Keywords that automatically resolve and 301-redirect to this canonical tag.'
                          )}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge
                      variant='outline'
                      className='font-mono text-xs tabular-nums'
                    >
                      {tag.aliases?.length || 0}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className='p-5'>
                  {!tag.aliases || tag.aliases.length === 0 ? (
                    <div className='border-border/70 text-muted-foreground rounded-xl border border-dashed p-6 text-center text-xs'>
                      {t(
                        'tags.show.noAliases',
                        'No orthographic aliases registered yet.'
                      )}
                    </div>
                  ) : (
                    <div className='flex flex-wrap gap-2'>
                      {tag.aliases.map((al: TagAlias) => (
                        <div
                          key={al.id}
                          className='group border-border/70 bg-card hover:border-foreground/30 flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs shadow-2xs transition-all'
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
