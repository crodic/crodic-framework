import { lazy, Suspense, useEffect, useState } from 'react'
import { format } from 'date-fns'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  BookMarkedIcon,
  HistoryIcon,
  LockIcon,
  RotateCcwIcon,
  SaveIcon,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { restApiErrorHandler } from '@/lib/rest-api-handler'
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

  const [selectedLocale, setSelectedLocale] = useState(initialLocale)
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
      body: `<p>Write the encyclopedia overview for <strong>#${tag.name}</strong>...</p>`,
      featuredImageUrl: '',
      featuredFileId: null,
      changeNote: '',
      isEditLocked: false,
    },
  })

  useEffect(() => {
    if (wiki) {
      form.reset({
        locale: selectedLocale,
        summary: wiki.summary,
        body: wiki.body,
        featuredImageUrl: wiki.featuredImageUrl ?? '',
        featuredFileId: wiki.featuredFileId ?? null,
        changeNote: '',
        isEditLocked: wiki.isEditLocked,
      })
    } else {
      form.reset({
        locale: selectedLocale,
        summary: '',
        body: `<p>Write the encyclopedia overview for <strong>#${tag.name}</strong>...</p>`,
        featuredImageUrl: '',
        featuredFileId: null,
        changeNote: 'Initial encyclopedia article',
        isEditLocked: false,
      })
    }
  }, [form, selectedLocale, tag.name, wiki])

  const upsertMutation = useMutation({
    mutationFn: apiUpsertTagEncyclopedia,
    onSuccess: () => {
      toast.success(t('tags.messages.wikiSaved', 'Encyclopedia article saved'))
      queryClient.invalidateQueries({
        queryKey: ['tag-encyclopedia', tag.id, selectedLocale],
      })
      queryClient.invalidateQueries({ queryKey: ['tag-encyclopedias'] })
      queryClient.invalidateQueries({ queryKey: ['tag', tag.id] })
    },
    onError: restApiErrorHandler,
  })

  const rollbackMutation = useMutation({
    mutationFn: apiRollbackEncyclopediaRevision,
    onSuccess: () => {
      toast.success(
        t('tags.messages.wikiRolledBack', 'Revision restored successfully')
      )
      setRollbackTarget(null)
      queryClient.invalidateQueries({
        queryKey: ['tag-encyclopedia', tag.id, selectedLocale],
      })
      queryClient.invalidateQueries({ queryKey: ['tag-encyclopedias'] })
    },
    onError: restApiErrorHandler,
  })

  return (
    <>
      <AlertDialog
        open={Boolean(rollbackTarget)}
        onOpenChange={(open) => {
          if (!open) setRollbackTarget(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t(
                'tags.encyclopedia.rollbackTitle',
                'Rollback Encyclopedia Revision'
              )}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t(
                'tags.encyclopedia.rollbackDesc',
                'Restoring this revision creates a new immutable snapshot preserving full audit history.'
              )}{' '}
              {rollbackTarget
                ? `(Revision v${rollbackTarget.revisionNumber})`
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

      <div className='grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]'>
        {/* Left: Rich Wiki Editor */}
        <Card className='shadow-xs'>
          <CardHeader className='flex flex-row flex-wrap items-center justify-between gap-3 border-b pb-4'>
            <div>
              <CardTitle className='flex items-center gap-2 text-base'>
                <BookMarkedIcon
                  className='text-primary size-4'
                  aria-hidden='true'
                />
                {t(
                  'tags.encyclopedia.title',
                  'Pixiv Encyclopedia Studio (dic)'
                )}{' '}
                — #{tag.name}
              </CardTitle>
              <CardDescription className='text-xs'>
                {wiki ? (
                  <>
                    {t('tags.encyclopedia.currentRevision', 'Current Revision')}{' '}
                    <span className='font-mono font-medium tabular-nums'>
                      v{wiki.currentRevision}
                    </span>{' '}
                    ·{' '}
                    <span className='font-mono tabular-nums'>
                      {wiki.viewCount.toLocaleString()}
                    </span>{' '}
                    {t('tags.encyclopedia.views', 'views')}
                  </>
                ) : (
                  t(
                    'tags.encyclopedia.noArticle',
                    'No wiki article exists for this locale yet. Save below to publish revision v1.'
                  )
                )}
              </CardDescription>
            </div>

            <div className='flex items-center gap-2'>
              <span className='text-muted-foreground text-xs font-medium'>
                {t('tags.encyclopedia.edition', 'Edition:')}
              </span>
              <Select
                value={selectedLocale}
                onValueChange={(loc) => setSelectedLocale(loc)}
              >
                <SelectTrigger className='h-8 w-40 text-xs'>
                  <SelectValue />
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
          </CardHeader>

          <CardContent className='pt-5'>
            {isFetching ? (
              <div className='space-y-4'>
                <Skeleton className='h-16 w-full' />
                <Skeleton className='h-72 w-full' />
              </div>
            ) : (
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit((values) =>
                    upsertMutation.mutate({ tagId: tag.id, data: values })
                  )}
                  className='space-y-5'
                >
                  <FormField
                    control={form.control}
                    name='summary'
                    render={({ field }) => (
                      <FormItem>
                        <div className='flex items-center gap-1.5'>
                          <FormLabel>
                            {t('tags.encyclopedia.summary', 'Lead Summary')}
                          </FormLabel>
                          <FormFieldHelp tooltip={t('tags.help.wikiSummary')} />
                        </div>
                        <FormControl>
                          <Textarea
                            {...field}
                            rows={2}
                            placeholder={t(
                              'tags.encyclopedia.summaryPlaceholder',
                              'Concise encyclopedia definition displayed in search cards and hover previews...'
                            )}
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
                          <FormLabel>
                            {t(
                              'tags.encyclopedia.body',
                              'Wiki Article Content'
                            )}
                          </FormLabel>
                          <FormFieldHelp tooltip={t('tags.help.wikiBody')} />
                        </div>
                        <FormControl>
                          <div className='overflow-hidden rounded-lg border'>
                            <Suspense
                              fallback={<Skeleton className='h-80 w-full' />}
                            >
                              <TiptapEditor
                                key={`${tag.id}-${selectedLocale}-${wiki?.currentRevision ?? 0}`}
                                output='html'
                                content={field.value}
                                onChangeContent={field.onChange}
                                disabled={upsertMutation.isPending}
                              />
                            </Suspense>
                          </div>
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
                        <div className='flex items-center gap-1.5'>
                          <FormLabel>
                            {t(
                              'tags.encyclopedia.changeNote',
                              'Revision Change Note'
                            )}
                          </FormLabel>
                          <FormFieldHelp
                            tooltip={t('tags.help.wikiChangeNote')}
                          />
                        </div>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder={t(
                              'tags.encyclopedia.changeNotePlaceholder',
                              'e.g. Added lore background and character aliases'
                            )}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className='bg-muted/20 flex flex-col gap-4 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between'>
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
                              <FormLabel className='flex items-center gap-1.5 text-sm leading-snug'>
                                <LockIcon
                                  className='text-muted-foreground size-3.5'
                                  aria-hidden='true'
                                />
                                {t(
                                  'tags.encyclopedia.isEditLocked',
                                  'Lock Community Editing'
                                )}
                              </FormLabel>
                              <FormFieldHelp
                                tooltip={t('tags.help.wikiLock')}
                              />
                            </div>
                            <FormDescription className='text-xs leading-relaxed'>
                              {t(
                                'tags.encyclopedia.isEditLockedDesc',
                                'When enabled, only administrators can edit this wiki article.'
                              )}
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    <Button
                      type='submit'
                      disabled={upsertMutation.isPending}
                      className='shrink-0'
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
                </form>
              </Form>
            )}
          </CardContent>
        </Card>

        {/* Right: Immutable Revision History & Rollback */}
        <Card className='h-fit shadow-xs'>
          <CardHeader className='border-b pb-3'>
            <CardTitle className='flex items-center gap-2 text-base'>
              <HistoryIcon className='text-primary size-4' aria-hidden='true' />
              {t('tags.encyclopedia.revisions', 'Revision History')}
            </CardTitle>
            <CardDescription className='text-xs'>
              {t(
                'tags.encyclopedia.overviewDesc',
                'Immutable snapshots across community contributors and moderators.'
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className='p-0'>
            {!wiki || !wiki.revisions || wiki.revisions.length === 0 ? (
              <p className='text-muted-foreground p-6 text-center text-xs'>
                {t(
                  'tags.encyclopedia.noRevisions',
                  'No revision snapshots recorded for this locale yet.'
                )}
              </p>
            ) : (
              <div className='max-h-140 divide-y overflow-y-auto'>
                {wiki.revisions.map((rev) => {
                  const isCurrent = rev.revisionNumber === wiki.currentRevision
                  return (
                    <div key={rev.id} className='space-y-1.5 p-3.5 text-xs'>
                      <div className='flex items-center justify-between gap-2'>
                        <div className='flex items-center gap-1.5'>
                          <Badge
                            variant={isCurrent ? 'default' : 'outline'}
                            className='font-mono text-[11px] tabular-nums'
                          >
                            v{rev.revisionNumber}
                          </Badge>
                          <span className='font-medium'>
                            {rev.editorName ||
                              t('tags.encyclopedia.contributor', 'Contributor')}
                          </span>
                        </div>
                        {!isCurrent && (
                          <Button
                            type='button'
                            size='sm'
                            variant='ghost'
                            className='h-7 px-2 text-xs'
                            onClick={() => setRollbackTarget(rev)}
                          >
                            <RotateCcwIcon
                              className='size-3'
                              aria-hidden='true'
                            />
                            {t('tags.encyclopedia.rollbackBtn', 'Rollback')}
                          </Button>
                        )}
                      </div>
                      {rev.changeNote && (
                        <p className='text-foreground/90 text-pretty'>
                          {rev.changeNote}
                        </p>
                      )}
                      <p className='text-muted-foreground text-[11px] tabular-nums'>
                        {format(new Date(rev.createdAt), 'dd/MM/yyyy HH:mm')}
                      </p>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
