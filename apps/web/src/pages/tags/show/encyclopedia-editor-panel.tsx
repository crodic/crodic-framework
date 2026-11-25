import { lazy, Suspense, useEffect, useState } from 'react'
import { format } from 'date-fns'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  BookMarkedIcon,
  CheckIcon,
  ClockIcon,
  GlobeIcon,
  HistoryIcon,
  LockIcon,
  RotateCcwIcon,
  SaveIcon,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router'
import { toast } from 'sonner'
import { restApiErrorHandler } from '@/lib/rest-api-handler'
import { cn } from '@/lib/utils'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { FormFieldHelp } from '../components/form-field-help'
import { TagFeaturedImageInput } from '../components/tag-featured-image-input'
import {
  apiRollbackEncyclopediaRevision,
  apiUpsertTagEncyclopedia,
  useDataTagEncyclopediaByTag,
} from '../queries'
import {
  TAG_LOCALES,
  resolveValidTagLocale,
  tagEncyclopediaFormSchema,
  type TagDetail,
  type TagEncyclopediaFormValues,
  type TagEncyclopediaRevision,
} from '../schema'

const TiptapEditor = lazy(() => import('@/components/editor/tiptap-editor'))

export function EncyclopediaEditorPanel({
  tag,
  initialLocale = 'en',
}: {
  tag: TagDetail
  initialLocale?: string
}) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const [searchParams, setSearchParams] = useSearchParams()

  const [selectedLocale, setSelectedLocale] = useState(() =>
    resolveValidTagLocale(searchParams.get('locale') || initialLocale)
  )

  useEffect(() => {
    const urlLocale = searchParams.get('locale')
    if (urlLocale) {
      const valid = resolveValidTagLocale(urlLocale)
      if (valid !== selectedLocale) {
        setSelectedLocale(valid)
      }
    }
  }, [searchParams, selectedLocale])

  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [rollbackTarget, setRollbackTarget] =
    useState<TagEncyclopediaRevision | null>(null)

  const { data: wiki, isFetching } = useDataTagEncyclopediaByTag(
    tag.id,
    selectedLocale
  )

  const form = useForm<TagEncyclopediaFormValues>({
    resolver: zodResolver(tagEncyclopediaFormSchema),
    defaultValues: {
      locale: selectedLocale,
      summary: '',
      body: '',
      featuredImageUrl: '',
      featuredFileId: null,
      changeNote: '',
      isEditLocked: false,
    },
  })

  const handleLocaleChange = (locRaw: string) => {
    const nextLocale = resolveValidTagLocale(locRaw)
    if (nextLocale === selectedLocale) return

    setSelectedLocale(nextLocale)

    const next = new URLSearchParams(searchParams)
    next.set('locale', nextLocale)
    setSearchParams(next, { replace: true })
  }

  useEffect(() => {
    if (!wiki || wiki.locale !== selectedLocale) {
      return
    }

    if (wiki.currentRevision > 0) {
      form.reset({
        locale: selectedLocale,
        summary: wiki.summary ?? '',
        body: wiki.body ?? '',
        featuredImageUrl: wiki.featuredImageUrl ?? '',
        featuredFileId: wiki.featuredFileId ?? null,
        changeNote: '',
        isEditLocked: wiki.isEditLocked ?? false,
      })
    } else {
      form.reset({
        locale: selectedLocale,
        summary: '',
        body: '',
        featuredImageUrl: '',
        featuredFileId: null,
        changeNote: '',
        isEditLocked: false,
      })
    }
  }, [form, selectedLocale, wiki])

  const upsertMutation = useMutation({
    mutationFn: apiUpsertTagEncyclopedia,
    onSuccess: (data) => {
      toast.success(
        t('tags.messages.wikiSaved', 'Encyclopedia article saved successfully')
      )
      queryClient.setQueryData(
        ['tag-encyclopedia', tag.id, selectedLocale],
        data
      )
      form.reset({
        locale: selectedLocale,
        summary: data.summary ?? '',
        body: data.body ?? '',
        featuredImageUrl: data.featuredImageUrl ?? '',
        featuredFileId: data.featuredFileId ?? null,
        changeNote: '',
        isEditLocked: data.isEditLocked ?? false,
      })
      queryClient.invalidateQueries({
        queryKey: ['tag-encyclopedia', tag.id, selectedLocale],
      })
      queryClient.invalidateQueries({ queryKey: ['tag-encyclopedias'] })
    },
    onError: restApiErrorHandler,
  })

  const rollbackMutation = useMutation({
    mutationFn: apiRollbackEncyclopediaRevision,
    onSuccess: (data) => {
      toast.success(
        t('tags.messages.wikiRolledBack', 'Revision restored successfully')
      )
      setRollbackTarget(null)
      queryClient.setQueryData(
        ['tag-encyclopedia', tag.id, selectedLocale],
        data
      )
      form.reset({
        locale: selectedLocale,
        summary: data.summary ?? '',
        body: data.body ?? '',
        featuredImageUrl: data.featuredImageUrl ?? '',
        featuredFileId: data.featuredFileId ?? null,
        changeNote: '',
        isEditLocked: data.isEditLocked ?? false,
      })
      queryClient.invalidateQueries({
        queryKey: ['tag-encyclopedia', tag.id, selectedLocale],
      })
      queryClient.invalidateQueries({ queryKey: ['tag-encyclopedias'] })
    },
    onError: restApiErrorHandler,
  })

  const currentLocaleObj = TAG_LOCALES.find((l) => l.value === selectedLocale)
  const currentLocaleLabel = currentLocaleObj?.label ?? selectedLocale
  const revisionsCount = wiki?.revisions?.length ?? 0

  const handleApplyPresetNote = (note: string) => {
    form.setValue('changeNote', note, { shouldDirty: true })
  }

  return (
    <>
      {/* Rollback Confirmation Alert Dialog */}
      <AlertDialog
        open={Boolean(rollbackTarget)}
        onOpenChange={(open) => {
          if (!open) setRollbackTarget(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('tags.encyclopedia.rollbackTitle', 'Restore Wiki Revision')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t(
                'tags.encyclopedia.rollbackDesc',
                'Restoring this revision will create a new immutable revision snapshot preserving complete audit history.'
              )}{' '}
              {rollbackTarget
                ? t('tags.encyclopedia.revisionLabel', {
                    revision: rollbackTarget.revisionNumber,
                    defaultValue: `(Revision v${rollbackTarget.revisionNumber})`,
                  })
                : ''}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={rollbackMutation.isPending}>
              {t('buttons.cancel', 'Cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={rollbackMutation.isPending || !rollbackTarget || !wiki}
              onClick={(e) => {
                e.preventDefault()
                if (!wiki || !rollbackTarget) return
                rollbackMutation.mutate({
                  encyclopediaId: wiki.id,
                  revisionNumber: rollbackTarget.revisionNumber,
                })
              }}
            >
              {rollbackMutation.isPending
                ? t('tags.encyclopedia.restoringBtn', 'Restoring...')
                : t('tags.encyclopedia.restoreAction', 'Restore Revision')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Slide-out Revision History Drawer (Sheet) */}
      <Sheet open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <SheetContent
          side='right'
          className='flex w-full flex-col p-0 sm:max-w-md'
        >
          <SheetHeader className='border-b px-6 py-4'>
            <div>
              <SheetTitle className='text-base font-semibold'>
                {t('tags.encyclopedia.revisions', 'Revision History')}
              </SheetTitle>
              <SheetDescription className='text-xs'>
                {t('tags.encyclopedia.revisionsDesc', {
                  name: tag.name,
                  locale: currentLocaleLabel,
                  count: revisionsCount,
                  defaultValue: `#${tag.name} • ${currentLocaleLabel} edition (${revisionsCount} records)`,
                })}
              </SheetDescription>
            </div>
          </SheetHeader>

          <div className='flex-1 overflow-y-auto p-5'>
            {!wiki || !wiki.revisions || wiki.revisions.length === 0 ? (
              <Empty className='p-8'>
                <EmptyHeader>
                  <EmptyMedia variant='icon'>
                    <HistoryIcon className='size-5' />
                  </EmptyMedia>
                  <EmptyTitle className='text-sm'>
                    {t(
                      'tags.encyclopedia.noRevisions',
                      'No revision history recorded for this edition yet.'
                    )}
                  </EmptyTitle>
                  <EmptyDescription className='text-xs'>
                    {t(
                      'tags.encyclopedia.revisionSnapshotTip',
                      'Each time you save, an immutable snapshot will be recorded here.'
                    )}
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <div className='before:bg-border/70 relative space-y-4 pl-6 before:absolute before:top-2 before:bottom-2 before:left-2.5 before:w-0.5'>
                {wiki.revisions.map((rev) => {
                  const isCurrent = rev.revisionNumber === wiki.currentRevision
                  const editorDisplayName =
                    rev.editorName ||
                    t('tags.encyclopedia.contributor', 'Contributor')
                  const initials = editorDisplayName.slice(0, 2).toUpperCase()

                  return (
                    <div key={rev.id} className='group relative'>
                      {/* Timeline Node Dot */}
                      <div
                        className={cn(
                          'ring-background absolute top-1.5 -left-6 flex size-5 items-center justify-center rounded-full ring-4 transition-all',
                          isCurrent
                            ? 'bg-primary text-primary-foreground shadow-2xs'
                            : 'bg-muted border-border text-muted-foreground group-hover:border-primary/50 border'
                        )}
                      >
                        {isCurrent ? (
                          <CheckIcon
                            className='size-2.5 stroke-3'
                            aria-hidden='true'
                          />
                        ) : (
                          <span className='font-mono text-[9px] font-bold'>
                            {rev.revisionNumber}
                          </span>
                        )}
                      </div>

                      {/* Revision Card */}
                      <div
                        className={cn(
                          'rounded-xl border p-3.5 text-xs shadow-2xs transition-all',
                          isCurrent
                            ? 'border-primary/50 bg-primary/5 ring-primary/20 ring-1'
                            : 'border-border/70 bg-card hover:border-border'
                        )}
                      >
                        <div className='flex items-center justify-between gap-2'>
                          <div className='flex min-w-0 items-center gap-2'>
                            <div className='bg-muted text-foreground border-border/50 flex size-6 shrink-0 items-center justify-center rounded-full border font-mono text-[10px] font-bold'>
                              {initials}
                            </div>
                            <div className='flex min-w-0 flex-wrap items-center gap-1.5'>
                              <span className='text-foreground truncate text-xs font-semibold'>
                                {editorDisplayName}
                              </span>
                              {isCurrent ? (
                                <Badge className='h-4 px-1.5 text-[9px] font-bold uppercase'>
                                  {t(
                                    'tags.encyclopedia.currentBadge',
                                    'Current'
                                  )}
                                </Badge>
                              ) : (
                                <Badge
                                  variant='outline'
                                  className='h-4 px-1 py-0 font-mono text-[10px]'
                                >
                                  v{rev.revisionNumber}
                                </Badge>
                              )}
                            </div>
                          </div>

                          {!isCurrent && (
                            <Button
                              type='button'
                              size='sm'
                              variant='ghost'
                              className='text-muted-foreground hover:text-foreground h-7 shrink-0 cursor-pointer gap-1 px-2 text-[11px]'
                              onClick={() => setRollbackTarget(rev)}
                            >
                              <RotateCcwIcon
                                className='size-3'
                                aria-hidden='true'
                              />
                              <span>
                                {t('tags.encyclopedia.rollbackBtn', 'Restore')}
                              </span>
                            </Button>
                          )}
                        </div>

                        {rev.changeNote && (
                          <p className='border-border/60 bg-muted/40 text-foreground/90 mt-2 rounded-lg border px-2.5 py-1.5 text-[11px] leading-relaxed italic'>
                            &ldquo;{rev.changeNote}&rdquo;
                          </p>
                        )}

                        <div className='text-muted-foreground mt-2 flex items-center gap-1.5 text-[10px] tabular-nums'>
                          <ClockIcon
                            className='size-3 opacity-70'
                            aria-hidden='true'
                          />
                          <span>
                            {format(
                              new Date(rev.createdAt),
                              'dd/MM/yyyy • HH:mm:ss'
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* 100% Full-Width Wiki Studio Editor */}
      <Card className='border-border/80 shadow-xs'>
        <CardHeader className='flex flex-col gap-3.5 border-b pb-4 sm:flex-row sm:items-center sm:justify-between'>
          <div className='space-y-1'>
            <CardTitle className='flex flex-wrap items-center gap-2 text-base font-semibold'>
              <BookMarkedIcon
                className='text-primary size-4.5'
                aria-hidden='true'
              />
              <span>
                {t(
                  'tags.encyclopedia.title',
                  'Community Encyclopedia Studio (dic)'
                )}{' '}
                — #{tag.name}
              </span>
            </CardTitle>
            <CardDescription className='text-xs'>
              {wiki ? (
                <>
                  {t(
                    'tags.encyclopedia.currentRevision',
                    'Current Edition Revision'
                  )}{' '}
                  <span className='text-foreground font-mono font-bold tabular-nums'>
                    v{wiki.currentRevision}
                  </span>{' '}
                  ·{' '}
                  <span className='text-foreground font-mono font-bold tabular-nums'>
                    {wiki.viewCount.toLocaleString()}
                  </span>{' '}
                  {t('tags.encyclopedia.views', 'views')}
                </>
              ) : (
                t(
                  'tags.encyclopedia.noArticle',
                  'No wiki article published for this locale yet. Save below to create revision v1.'
                )
              )}
            </CardDescription>
          </div>

          <div className='flex w-full flex-wrap items-center justify-between gap-2.5 sm:w-auto sm:justify-end'>
            {/* Edition Selector */}
            <div className='flex items-center gap-1.5'>
              <GlobeIcon
                className='text-muted-foreground size-3.5'
                aria-hidden='true'
              />
              <span className='text-muted-foreground text-xs font-medium'>
                {t('tags.encyclopedia.edition', 'Edition:')}
              </span>
              <Select value={selectedLocale} onValueChange={handleLocaleChange}>
                <SelectTrigger className='h-8 w-36 text-xs font-medium'>
                  <SelectValue
                    placeholder={t('tags.encyclopedia.colEdition', 'Edition')}
                  />
                </SelectTrigger>
                <SelectContent>
                  {TAG_LOCALES.map((loc) => (
                    <SelectItem key={loc.value} value={loc.value}>
                      {loc.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Slide-out Revision History Trigger Button */}
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={() => setIsHistoryOpen(true)}
              className='h-8 cursor-pointer gap-1.5 text-xs font-medium shadow-2xs'
            >
              <HistoryIcon
                className='text-primary size-3.5'
                aria-hidden='true'
              />
              <span>
                {t('tags.encyclopedia.revisions', 'Revision History')}
              </span>
              <Badge
                variant='secondary'
                className='ml-0.5 h-4 px-1.5 font-mono text-[10px] tabular-nums'
              >
                {revisionsCount}
              </Badge>
            </Button>
          </div>
        </CardHeader>

        <CardContent className='pt-6'>
          {!wiki && isFetching ? (
            <div className='space-y-5'>
              <Skeleton className='h-20 w-full' />
              <Skeleton className='h-96 w-full' />
              <Skeleton className='h-12 w-full' />
            </div>
          ) : (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit((values) =>
                  upsertMutation.mutate({ tagId: tag.id, data: values })
                )}
                className='space-y-6'
              >
                <FormField
                  control={form.control}
                  name='summary'
                  render={({ field }) => (
                    <FormItem>
                      <div className='flex items-center gap-1.5'>
                        <FormLabel className='text-xs font-semibold'>
                          {t(
                            'tags.encyclopedia.summary',
                            'Opening Summary Definition'
                          )}
                        </FormLabel>
                        <FormFieldHelp tooltip={t('tags.help.wikiSummary')} />
                      </div>
                      <FormControl>
                        <Textarea
                          {...field}
                          rows={2}
                          placeholder={t(
                            'tags.encyclopedia.summaryPlaceholder',
                            'Concise editorial definition displayed in search results and hover popovers...'
                          )}
                          className='text-xs leading-relaxed font-medium'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='body'
                  render={({ field }) => (
                    <FormItem>
                      <div className='flex items-center gap-1.5'>
                        <FormLabel className='text-xs font-semibold'>
                          {t(
                            'tags.encyclopedia.body',
                            'Wiki Article Rich Content'
                          )}
                        </FormLabel>
                        <FormFieldHelp tooltip={t('tags.help.wikiBody')} />
                      </div>
                      <FormControl>
                        <Suspense
                          fallback={
                            <Skeleton className='h-72 w-full rounded-xl' />
                          }
                        >
                          <TiptapEditor
                            key={`${tag.id}-${selectedLocale}`}
                            output='html'
                            content={field.value}
                            onChangeContent={field.onChange}
                            disabled={upsertMutation.isPending}
                            className='w-full'
                          />
                        </Suspense>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='featuredImageUrl'
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormControl>
                        <TagFeaturedImageInput
                          label={t(
                            'tags.encyclopedia.featuredImage',
                            'Featured Header Image'
                          )}
                          urlValue={field.value || ''}
                          disabled={upsertMutation.isPending}
                          error={fieldState.error?.message}
                          tooltip={t('tags.help.wikiFeaturedImage')}
                          onSelect={({ url, fileId }) => {
                            field.onChange(url)
                            form.setValue('featuredFileId', fileId, {
                              shouldDirty: true,
                            })
                          }}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='changeNote'
                  render={({ field }) => (
                    <FormItem>
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-1.5'>
                          <FormLabel className='text-xs font-semibold'>
                            {t(
                              'tags.encyclopedia.changeNote',
                              'Revision Change Note'
                            )}
                          </FormLabel>
                          <FormFieldHelp
                            tooltip={t('tags.help.wikiChangeNote')}
                          />
                        </div>

                        {/* Quick preset chips */}
                        <div className='flex items-center gap-1.5'>
                          <button
                            type='button'
                            onClick={() =>
                              handleApplyPresetNote(
                                t(
                                  'tags.encyclopedia.initialChangeNote',
                                  'Initial encyclopedia article'
                                )
                              )
                            }
                            className='bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer rounded-md px-2 py-0.5 text-[11px] transition-colors'
                          >
                            + Initial
                          </button>
                          <button
                            type='button'
                            onClick={() =>
                              handleApplyPresetNote(
                                'Expanded character lore & background'
                              )
                            }
                            className='bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer rounded-md px-2 py-0.5 text-[11px] transition-colors'
                          >
                            + Lore
                          </button>
                          <button
                            type='button'
                            onClick={() =>
                              handleApplyPresetNote(
                                'Fixed typos and clarified phrasing'
                              )
                            }
                            className='bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer rounded-md px-2 py-0.5 text-[11px] transition-colors'
                          >
                            + Typos
                          </button>
                        </div>
                      </div>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder={t(
                            'tags.encyclopedia.changeNotePlaceholder',
                            'e.g. Added franchise origin, character design details, and appearance history'
                          )}
                          className='text-xs font-medium'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Bottom Action Cluster */}
                <div className='bg-muted/30 border-border/70 flex flex-col gap-4 rounded-xl border p-4 shadow-2xs sm:flex-row sm:items-center sm:justify-between'>
                  <FormField
                    control={form.control}
                    name='isEditLocked'
                    render={({ field }) => (
                      <FormItem className='flex flex-row items-center gap-3 space-y-0'>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className='space-y-0.5'>
                          <div className='flex items-center gap-1.5'>
                            <FormLabel className='flex cursor-pointer items-center gap-1.5 text-xs leading-snug font-semibold'>
                              <LockIcon
                                className='text-muted-foreground size-3.5'
                                aria-hidden='true'
                              />
                              {t(
                                'tags.encyclopedia.isEditLocked',
                                'Lock Community Editing'
                              )}
                            </FormLabel>
                            <FormFieldHelp tooltip={t('tags.help.wikiLock')} />
                          </div>
                          <FormDescription className='text-muted-foreground text-[11px] leading-relaxed'>
                            {t(
                              'tags.encyclopedia.isEditLockedDesc',
                              'When enabled, only Administrators can edit this wiki edition.'
                            )}
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <div className='flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center'>
                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      onClick={() => setIsHistoryOpen(true)}
                      className='h-9 w-full cursor-pointer gap-1.5 text-xs shadow-2xs sm:w-auto'
                    >
                      <HistoryIcon
                        className='text-primary size-3.5'
                        aria-hidden='true'
                      />
                      <span>
                        {t('tags.encyclopedia.revisions', 'Revision History')}
                      </span>
                      <Badge
                        variant='secondary'
                        className='h-4 px-1.5 font-mono text-[10px]'
                      >
                        {revisionsCount}
                      </Badge>
                    </Button>

                    <Button
                      type='submit'
                      disabled={upsertMutation.isPending}
                      className='h-9 w-full shrink-0 cursor-pointer gap-2 text-xs font-semibold shadow-xs sm:w-auto'
                    >
                      <SaveIcon className='size-4' aria-hidden='true' />
                      {upsertMutation.isPending
                        ? t(
                            'tags.encyclopedia.savingRevision',
                            'Publishing Revision...'
                          )
                        : t(
                            'tags.encyclopedia.saveRevision',
                            'Save & Publish Revision'
                          )}
                    </Button>
                  </div>
                </div>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </>
  )
}
