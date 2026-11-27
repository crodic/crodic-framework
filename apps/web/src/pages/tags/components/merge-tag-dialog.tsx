import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  AlertTriangleIcon,
  ArrowRightIcon,
  BadgeCheckIcon,
  CheckCircle2Icon,
  GitMergeIcon,
  Loader2Icon,
  SearchIcon,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  apiMergeTag,
  useDataMergeTagPreview,
  useDataTagAutocomplete,
} from '../queries'
import type { TagAutocompleteItem, TagSummary } from '../schema'
import { TagCategoryBadge, TagNodeChip } from './tag-badges'

interface MergeTagDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sourceTag: Pick<
    TagSummary,
    'id' | 'name' | 'translatedName' | 'category' | 'usageCount'
  > | null
  onMerged?: (targetTagId: string) => void
}

export function MergeTagDialog({
  open,
  onOpenChange,
  sourceTag,
  onMerged,
}: MergeTagDialogProps) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [keyword, setKeyword] = useState('')
  const [selectedTarget, setSelectedTarget] =
    useState<TagAutocompleteItem | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const { data: suggestions = [], isFetching: isSearching } =
    useDataTagAutocomplete(keyword)

  const filteredSuggestions = suggestions.filter(
    (item) => item.id !== sourceTag?.id
  )

  const { data: preview, isFetching: isLoadingPreview } =
    useDataMergeTagPreview(sourceTag?.id ?? '', selectedTarget?.id ?? '')

  const mergeMutation = useMutation({
    mutationFn: apiMergeTag,
    onSuccess: () => {
      toast.success(
        t('tags.messages.merged', 'Tag merged into target tag successfully')
      )
      queryClient.invalidateQueries({ queryKey: ['tags'] })
      if (sourceTag) {
        queryClient.invalidateQueries({ queryKey: ['tag', sourceTag.id] })
      }
      if (selectedTarget) {
        queryClient.invalidateQueries({ queryKey: ['tag', selectedTarget.id] })
        onMerged?.(selectedTarget.id)
      }
      setConfirmOpen(false)
      setSelectedTarget(null)
      setKeyword('')
      onOpenChange(false)
    },
    onError: restApiErrorHandler,
  })

  if (!sourceTag) return null

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (!next) {
            setSelectedTarget(null)
            setKeyword('')
          }
          onOpenChange(next)
        }}
      >
        <DialogContent
          onOpenAutoFocus={(e) => {
            e.preventDefault()
            document.getElementById('merge-target-search')?.focus()
          }}
          className='border-border/80 flex max-h-[min(90vh,calc(100dvh-2rem))] flex-col gap-0 overflow-hidden rounded-2xl border p-0 shadow-2xl sm:max-w-xl'
        >
          <DialogHeader className='border-border/60 bg-card shrink-0 border-b px-4 pt-4 pb-3 sm:px-6 sm:pt-5 sm:pb-4'>
            <div className='flex items-center gap-3'>
              <div className='border-primary/20 bg-primary/10 text-primary dark:text-primary flex size-10 shrink-0 items-center justify-center rounded-xl border shadow-2xs'>
                <GitMergeIcon className='size-5' aria-hidden='true' />
              </div>
              <div>
                <DialogTitle className='text-foreground text-base font-bold'>
                  {t('tags.merge.title', 'Merge Into Target Tag')}
                </DialogTitle>
                <DialogDescription className='text-xs'>
                  {t(
                    'tags.merge.description',
                    'Atomically migrate all entity attachments, aliases, and DAG edges from this source tag into another canonical tag.'
                  )}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className='min-h-0 flex-1 space-y-4 overflow-y-auto p-4 sm:p-6'>
            {/* Source & Target Comparison Bar */}
            <div className='border-border/70 bg-muted/20 flex flex-col items-stretch justify-between gap-2.5 rounded-xl border p-3 shadow-2xs sm:flex-row sm:items-center sm:gap-3 sm:p-3.5'>
              <div className='space-y-1.5'>
                <span className='text-muted-foreground flex items-center gap-1 text-[11px] font-semibold tracking-wider uppercase'>
                  {t(
                    'tags.merge.sourceLabel',
                    'Source Tag (Will become 301 Alias)'
                  )}
                </span>
                <TagNodeChip
                  name={sourceTag.name}
                  translatedName={sourceTag.translatedName}
                  category={sourceTag.category}
                  usageCount={sourceTag.usageCount}
                />
              </div>

              <div className='bg-background border-border/60 text-muted-foreground flex size-7 shrink-0 items-center justify-center self-center rounded-full border shadow-2xs sm:size-8'>
                <ArrowRightIcon
                  className='size-3.5 rotate-90 sm:size-4 sm:rotate-0'
                  aria-hidden='true'
                />
              </div>

              <div className='space-y-1.5'>
                <span className='text-muted-foreground flex items-center gap-1 text-[11px] font-semibold tracking-wider uppercase'>
                  {t('tags.merge.targetLabel', 'Target Canonical Tag')}
                </span>
                {selectedTarget ? (
                  <TagNodeChip
                    name={selectedTarget.name}
                    translatedName={selectedTarget.translatedName}
                    category={selectedTarget.category}
                    usageCount={selectedTarget.usageCount}
                  />
                ) : (
                  <span className='text-muted-foreground inline-flex items-center rounded-md border border-dashed px-2.5 py-1 text-xs italic'>
                    {t(
                      'tags.merge.selectTargetPrompt',
                      'Select target tag below...'
                    )}
                  </span>
                )}
              </div>
            </div>

            {/* Target Selection & Search */}
            <div className='space-y-2'>
              <label
                htmlFor='merge-target-search'
                className='text-foreground text-xs font-semibold'
              >
                {t('tags.merge.selectTarget', 'Search Target Canonical Tag')}
              </label>
              <div className='relative'>
                <SearchIcon
                  className='text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2'
                  aria-hidden='true'
                />
                <Input
                  id='merge-target-search'
                  autoFocus
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder={t(
                    'tags.merge.searchPlaceholder',
                    'Search by canonical name, translation, or alias...'
                  )}
                  className='bg-background h-9 pl-9 text-xs'
                />
              </div>

              {/* Suggestions Container */}
              <div className='border-border/70 bg-card divide-border/50 max-h-48 divide-y overflow-y-auto rounded-xl border shadow-2xs'>
                {isSearching ? (
                  <div className='space-y-2 p-3'>
                    <Skeleton className='h-8 w-full' />
                    <Skeleton className='h-8 w-full' />
                  </div>
                ) : filteredSuggestions.length === 0 ? (
                  <p className='text-muted-foreground p-6 text-center text-xs'>
                    {t(
                      'tags.merge.noMatches',
                      'No matching canonical tags found.'
                    )}
                  </p>
                ) : (
                  filteredSuggestions.map((item) => {
                    const isSelected = selectedTarget?.id === item.id
                    return (
                      <button
                        key={item.id}
                        type='button'
                        onClick={() => setSelectedTarget(item)}
                        className={cn(
                          'hover:bg-primary/5 flex w-full cursor-pointer items-center justify-between gap-3 px-3.5 py-2.5 text-left text-xs transition-colors',
                          isSelected && 'bg-primary/10 font-semibold'
                        )}
                      >
                        <div className='flex min-w-0 items-center gap-2'>
                          <span className='text-foreground font-bold'>
                            #{item.name}
                          </span>
                          {item.isOfficial && (
                            <BadgeCheckIcon
                              className='text-primary size-3.5 shrink-0'
                              aria-hidden='true'
                            />
                          )}
                          {item.translatedName &&
                            item.translatedName !== item.name && (
                              <span className='text-muted-foreground truncate text-[11px]'>
                                ({item.translatedName})
                              </span>
                            )}
                          {item.matchedAlias && (
                            <Badge
                              variant='secondary'
                              className='px-1 py-0 font-mono text-[9px]'
                            >
                              {t('tags.merge.viaAlias', {
                                alias: item.matchedAlias,
                                defaultValue: `via ${item.matchedAlias}`,
                              })}
                            </Badge>
                          )}
                        </div>
                        <div className='flex shrink-0 items-center gap-2'>
                          <TagCategoryBadge
                            category={item.category}
                            className='py-0 text-[10px]'
                          />
                          <span className='text-muted-foreground font-mono text-[11px] tabular-nums'>
                            {item.usageCount.toLocaleString()}
                          </span>
                          {isSelected && (
                            <CheckCircle2Icon
                              className='text-primary size-4'
                              aria-hidden='true'
                            />
                          )}
                        </div>
                      </button>
                    )
                  })
                )}
              </div>
            </div>

            {/* Atomic DB Impact Preview */}
            {selectedTarget && (
              <div className='border-border/80 bg-muted/10 space-y-3 rounded-xl border p-4 shadow-2xs'>
                <div className='text-foreground flex items-center gap-2 text-xs font-semibold'>
                  <AlertTriangleIcon
                    className='text-primary size-4'
                    aria-hidden='true'
                  />
                  <span>
                    {t('tags.merge.impactPreview', 'Atomic Impact Preview')}
                  </span>
                </div>

                {isLoadingPreview || !preview ? (
                  <div className='grid grid-cols-3 gap-2.5'>
                    <Skeleton className='h-16 w-full rounded-lg' />
                    <Skeleton className='h-16 w-full rounded-lg' />
                    <Skeleton className='h-16 w-full rounded-lg' />
                  </div>
                ) : (
                  <div className='grid grid-cols-3 gap-2.5 text-center'>
                    <div className='border-border/60 bg-background rounded-lg border p-2.5 shadow-2xs'>
                      <p className='text-foreground font-mono text-lg font-bold tabular-nums'>
                        {preview.affectedEntityTagsCount.toLocaleString()}
                      </p>
                      <p className='text-muted-foreground text-[11px] font-medium'>
                        {t('tags.merge.affectedEntities', 'Content Links')}
                      </p>
                    </div>
                    <div className='border-border/60 bg-background rounded-lg border p-2.5 shadow-2xs'>
                      <p className='text-foreground font-mono text-lg font-bold tabular-nums'>
                        {preview.aliasesToTransferCount.toLocaleString()}
                      </p>
                      <p className='text-muted-foreground text-[11px] font-medium'>
                        {t('tags.merge.aliasesTransferred', '301 Aliases')}
                      </p>
                    </div>
                    <div className='border-border/60 bg-background rounded-lg border p-2.5 shadow-2xs'>
                      <p className='text-foreground font-mono text-lg font-bold tabular-nums'>
                        {preview.relationsToRewireCount.toLocaleString()}
                      </p>
                      <p className='text-muted-foreground text-[11px] font-medium'>
                        {t('tags.merge.relationsRewired', 'DAG Edges')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter className='border-border/60 bg-card flex shrink-0 flex-col-reverse gap-2 border-t px-4 py-3 sm:flex-row sm:px-6 sm:py-3.5'>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
              className='w-full cursor-pointer text-xs sm:w-auto'
            >
              {t('buttons.cancel', 'Cancel')}
            </Button>
            <Button
              disabled={!selectedTarget || mergeMutation.isPending}
              onClick={() => setConfirmOpen(true)}
              className='w-full cursor-pointer gap-2 text-xs font-semibold shadow-xs sm:w-auto'
            >
              <GitMergeIcon className='size-4' aria-hidden='true' />
              <span>{t('tags.merge.btnMerge', 'Review & Merge')}</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Alert Dialog */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className='text-balance'>
              {t('tags.merge.confirmTitle', 'Confirm Atomic Tag Merge')}
            </AlertDialogTitle>
            <AlertDialogDescription className='space-y-2 text-pretty'>
              <p>
                {t(
                  'tags.merge.confirmDesc',
                  'This action marks the source tag as merged, converts its name into an orthographic alias, and redirects all SEO traffic permanently.'
                )}
              </p>
              <div className='border-border/60 bg-muted/40 flex items-center justify-center gap-2 rounded-lg border p-2.5 font-mono text-xs'>
                <span className='text-muted-foreground font-bold line-through'>
                  #{sourceTag.name}
                </span>
                <ArrowRightIcon className='text-primary size-3.5' />
                <span className='text-foreground font-bold'>
                  #{selectedTarget?.name}
                </span>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={mergeMutation.isPending}>
              {t('buttons.cancel', 'Cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={mergeMutation.isPending || !selectedTarget}
              onClick={(e) => {
                e.preventDefault()
                if (!selectedTarget) return
                mergeMutation.mutate({
                  sourceTagId: sourceTag.id,
                  targetTagId: selectedTarget.id,
                })
              }}
            >
              {mergeMutation.isPending ? (
                <>
                  <Loader2Icon className='size-4 animate-spin' />
                  <span>{t('tags.merge.merging', 'Merging...')}</span>
                </>
              ) : (
                t('tags.merge.btnConfirm', 'Confirm Merge')
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
