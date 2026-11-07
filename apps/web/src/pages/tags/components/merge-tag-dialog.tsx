import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ArrowRightIcon,
  GitMergeIcon,
  SearchIcon,
  TriangleAlertIcon,
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
import { FormFieldHelp } from './form-field-help'
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
        <DialogContent className='sm:max-w-xl'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2 text-balance'>
              <GitMergeIcon
                className='text-primary size-4 shrink-0'
                aria-hidden='true'
              />
              {t('tags.merge.title', 'Merge Into Target Tag')}
              <FormFieldHelp tooltip={t('tags.help.merge')} />
            </DialogTitle>
            <DialogDescription className='text-pretty'>
              {t(
                'tags.merge.description',
                'Atomically migrate all entity attachments, aliases, and DAG edges from this source tag into another canonical tag.'
              )}
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-4 py-1'>
            <div className='bg-muted/30 flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3'>
              <div className='space-y-1'>
                <span className='text-muted-foreground flex items-center gap-1 text-[11px] font-medium tracking-wider uppercase'>
                  {t(
                    'tags.merge.sourceLabel',
                    'Source Tag (Will become 301 Alias)'
                  )}
                  <FormFieldHelp tooltip={t('tags.help.mergeSource')} />
                </span>
                <TagNodeChip
                  name={sourceTag.name}
                  translatedName={sourceTag.translatedName}
                  category={sourceTag.category}
                  usageCount={sourceTag.usageCount}
                />
              </div>
              <ArrowRightIcon
                className='text-muted-foreground size-4 shrink-0'
                aria-hidden='true'
              />
              <div className='space-y-1'>
                <span className='text-muted-foreground flex items-center gap-1 text-[11px] font-medium tracking-wider uppercase'>
                  {t('tags.merge.targetLabel', 'Target Canonical Tag')}
                  <FormFieldHelp tooltip={t('tags.help.mergeTarget')} />
                </span>
                {selectedTarget ? (
                  <TagNodeChip
                    name={selectedTarget.name}
                    translatedName={selectedTarget.translatedName}
                    category={selectedTarget.category}
                    usageCount={selectedTarget.usageCount}
                  />
                ) : (
                  <span className='text-muted-foreground text-xs italic'>
                    {t(
                      'tags.merge.selectTargetPrompt',
                      'Select a target below...'
                    )}
                  </span>
                )}
              </div>
            </div>

            <div className='space-y-2'>
              <label
                htmlFor='merge-target-search'
                className='text-xs font-medium'
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
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder={t(
                    'tags.merge.searchPlaceholder',
                    'Search by canonical name, translation, or alias...'
                  )}
                  className='pl-9'
                />
              </div>

              <div className='max-h-48 overflow-y-auto rounded-md border'>
                {isSearching ? (
                  <div className='space-y-2 p-3'>
                    <Skeleton className='h-7 w-full' />
                    <Skeleton className='h-7 w-full' />
                  </div>
                ) : filteredSuggestions.length === 0 ? (
                  <p className='text-muted-foreground p-4 text-center text-xs'>
                    {t(
                      'tags.merge.noMatches',
                      'No matching canonical tags found.'
                    )}
                  </p>
                ) : (
                  <div className='divide-y'>
                    {filteredSuggestions.map((item) => {
                      const isSelected = selectedTarget?.id === item.id
                      return (
                        <button
                          key={item.id}
                          type='button'
                          onClick={() => setSelectedTarget(item)}
                          className={`hover:bg-muted/60 flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-xs transition-colors ${
                            isSelected ? 'bg-primary/10 font-medium' : ''
                          }`}
                        >
                          <div className='flex min-w-0 items-center gap-2'>
                            <span className='truncate font-medium'>
                              #{item.name}
                            </span>
                            {item.translatedName &&
                              item.translatedName !== item.name && (
                                <span className='text-muted-foreground truncate'>
                                  ({item.translatedName})
                                </span>
                              )}
                            {item.matchedAlias && (
                              <span className='text-muted-foreground truncate text-[11px]'>
                                {t('tags.merge.viaAlias', {
                                  alias: item.matchedAlias,
                                  defaultValue: `via ${item.matchedAlias}`,
                                })}
                              </span>
                            )}
                          </div>
                          <div className='flex shrink-0 items-center gap-2'>
                            <TagCategoryBadge category={item.category} />
                            <span className='text-muted-foreground font-mono tabular-nums'>
                              {item.usageCount.toLocaleString()}
                            </span>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            {selectedTarget && (
              <div className='rounded-lg border p-3.5'>
                <div className='mb-2 flex items-center gap-1.5 text-xs font-semibold'>
                  <TriangleAlertIcon
                    className='size-3.5 text-amber-500'
                    aria-hidden='true'
                  />
                  <span>
                    {t(
                      'tags.merge.impactPreview',
                      'Impact Preview (Atomic DB Transaction)'
                    )}
                  </span>
                </div>
                {isLoadingPreview || !preview ? (
                  <div className='grid grid-cols-3 gap-2'>
                    <Skeleton className='h-14 w-full' />
                    <Skeleton className='h-14 w-full' />
                    <Skeleton className='h-14 w-full' />
                  </div>
                ) : (
                  <div className='grid grid-cols-3 gap-2 text-center'>
                    <div className='bg-muted/30 rounded-md border p-2.5'>
                      <p className='text-lg font-semibold tabular-nums'>
                        {preview.affectedEntityTagsCount.toLocaleString()}
                      </p>
                      <p className='text-muted-foreground text-[11px]'>
                        {t(
                          'tags.merge.affectedEntities',
                          'Content Links Migrated'
                        )}
                      </p>
                    </div>
                    <div className='bg-muted/30 rounded-md border p-2.5'>
                      <p className='text-lg font-semibold tabular-nums'>
                        {preview.aliasesToTransferCount.toLocaleString()}
                      </p>
                      <p className='text-muted-foreground text-[11px]'>
                        {t(
                          'tags.merge.aliasesTransferred',
                          'Aliases + Redirects'
                        )}
                      </p>
                    </div>
                    <div className='bg-muted/30 rounded-md border p-2.5'>
                      <p className='text-lg font-semibold tabular-nums'>
                        {preview.relationsToRewireCount.toLocaleString()}
                      </p>
                      <p className='text-muted-foreground text-[11px]'>
                        {t('tags.merge.relationsRewired', 'DAG Edges Rewired')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant='outline' onClick={() => onOpenChange(false)}>
              {t('buttons.cancel', 'Cancel')}
            </Button>
            <Button
              disabled={!selectedTarget || mergeMutation.isPending}
              onClick={() => setConfirmOpen(true)}
            >
              <GitMergeIcon className='size-4' aria-hidden='true' />
              {t('tags.merge.btnMerge', 'Review & Merge')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className='text-balance'>
              {t('tags.merge.confirmTitle', 'Confirm Atomic Tag Merge')}
            </AlertDialogTitle>
            <AlertDialogDescription className='text-pretty'>
              {t(
                'tags.merge.confirmDesc',
                'This action marks the source tag as merged, converts its name into an orthographic alias, and redirects all SEO traffic permanently.'
              )}{' '}
              <strong>#{sourceTag.name}</strong> &rarr;{' '}
              <strong>#{selectedTarget?.name}</strong>
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
              {mergeMutation.isPending
                ? t('tags.merge.merging', 'Merging...')
                : t('tags.merge.btnConfirm', 'Confirm Merge')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
