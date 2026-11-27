import { useEffect, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  Loader2Icon,
  LockIcon,
  PlusIcon,
  SaveIcon,
  TagsIcon,
  XIcon,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { restApiErrorHandler } from '@/lib/rest-api-handler'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import {
  apiSyncEntityTagsAdmin,
  useDataEntityTags,
  useDataTagAutocomplete,
} from '../queries'
import type { TaggableEntityType } from '../schema'

export function AdminEntityTagPanel({
  entityType,
  entityId,
}: {
  entityType: TaggableEntityType
  entityId: string
}) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const { data, isFetching } = useDataEntityTags(entityType, entityId)

  const [draftTags, setDraftTags] = useState<string[]>([])
  const [editLocked, setEditLocked] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [isDirty, setIsDirty] = useState(false)

  useEffect(() => {
    if (data) {
      setDraftTags(data.tags.map((item) => item.name))
      setEditLocked(data.tagEditLocked)
      setIsDirty(false)
    }
  }, [data])

  const { data: suggestions = [] } = useDataTagAutocomplete(inputValue)

  const syncMutation = useMutation({
    mutationFn: apiSyncEntityTagsAdmin,
    onSuccess: () => {
      toast.success(t('tags.entitySync.saved', 'Entity tags synchronized'))
      setIsDirty(false)
      queryClient.invalidateQueries({
        queryKey: ['entity-tags', entityType, entityId],
      })
    },
    onError: restApiErrorHandler,
  })

  const maxTags = data?.maxTags ?? 10

  const addTagToken = (raw: string) => {
    const cleaned = raw.replace(/^#+/, '').trim()
    if (!cleaned || cleaned.startsWith('-')) return
    if (draftTags.length >= maxTags) {
      toast.error(`Maximum ${maxTags} tags allowed per item.`)
      return
    }
    if (
      draftTags.some(
        (existing) => existing.toLowerCase() === cleaned.toLowerCase()
      )
    ) {
      setInputValue('')
      return
    }
    setDraftTags((prev) => [...prev, cleaned])
    setInputValue('')
    setIsDirty(true)
  }

  const removeAt = (idx: number) => {
    setDraftTags((prev) => prev.filter((_, i) => i !== idx))
    setIsDirty(true)
  }

  const moveTag = (idx: number, delta: -1 | 1) => {
    const targetIdx = idx + delta
    if (targetIdx < 0 || targetIdx >= draftTags.length) return
    setDraftTags((prev) => {
      const copy = [...prev]
      const [moved] = copy.splice(idx, 1)
      copy.splice(targetIdx, 0, moved)
      return copy
    })
    setIsDirty(true)
  }

  return (
    <Card className='border-border/80 gap-0 overflow-hidden shadow-2xs'>
      <CardHeader className='bg-muted/30 flex flex-row items-center justify-between gap-3 border-b px-5 py-4'>
        <div className='space-y-0.5'>
          <CardTitle className='flex items-center gap-2 text-sm font-semibold'>
            <TagsIcon className='text-primary size-4' aria-hidden='true' />
            <span>
              {t(
                'tags.entitySync.title',
                'Tagged Taxonomy (10-Tag Folksonomy Governance)'
              )}
            </span>
          </CardTitle>
          <CardDescription className='text-xs'>
            {t(
              'tags.entitySync.desc',
              'Author tags (*) are protected from community deletion.'
            )}
          </CardDescription>
        </div>
        <Badge
          variant={draftTags.length >= maxTags ? 'destructive' : 'outline'}
          className='font-mono text-xs tabular-nums'
        >
          <span role='status' aria-atomic='true'>
            {draftTags.length} / {maxTags}
          </span>
        </Badge>
      </CardHeader>

      <CardContent className='space-y-4 p-5'>
        {isFetching ? (
          <div className='space-y-2.5'>
            <Skeleton className='h-9 w-full rounded-lg' />
            <Skeleton className='h-9 w-2/3 rounded-lg' />
          </div>
        ) : (
          <>
            {/* Tag Chips with Accessible Keyboard Reordering */}
            {draftTags.length === 0 ? (
              <p className='text-muted-foreground py-2 text-xs italic'>
                {t(
                  'tags.entitySync.emptyPrompt',
                  'No canonical tags attached yet. Add up to 10 tags below.'
                )}
              </p>
            ) : (
              <div className='flex flex-wrap gap-2'>
                {draftTags.map((tagName, idx) => (
                  <div
                    key={`${tagName}-${idx}`}
                    className='bg-card hover:border-foreground/30 border-border/80 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs shadow-2xs transition-all'
                  >
                    <span
                      className='text-primary font-bold'
                      title={t('tags.entitySync.authorTag', 'Author Tag')}
                    >
                      *
                    </span>
                    <span className='max-w-40 truncate font-semibold tracking-tight'>
                      #{tagName}
                    </span>
                    <div className='border-border/60 ml-0.5 inline-flex items-center gap-0.5 border-l pl-1'>
                      <button
                        type='button'
                        disabled={idx === 0}
                        aria-label={`Move tag ${tagName} left`}
                        onClick={() => moveTag(idx, -1)}
                        className='text-muted-foreground hover:text-foreground cursor-pointer rounded p-0.5 transition-colors disabled:opacity-30'
                      >
                        <ChevronLeftIcon
                          className='size-3'
                          aria-hidden='true'
                        />
                      </button>
                      <button
                        type='button'
                        disabled={idx === draftTags.length - 1}
                        aria-label={`Move tag ${tagName} right`}
                        onClick={() => moveTag(idx, 1)}
                        className='text-muted-foreground hover:text-foreground cursor-pointer rounded p-0.5 transition-colors disabled:opacity-30'
                      >
                        <ChevronRightIcon
                          className='size-3'
                          aria-hidden='true'
                        />
                      </button>
                      <button
                        type='button'
                        aria-label={`Remove tag ${tagName}`}
                        onClick={() => removeAt(idx)}
                        className='text-muted-foreground hover:bg-destructive/15 hover:text-destructive ml-0.5 cursor-pointer rounded p-0.5 transition-colors'
                      >
                        <XIcon className='size-3' aria-hidden='true' />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Inline Autocomplete Add */}
            {draftTags.length < maxTags && (
              <div className='space-y-2'>
                <div className='flex gap-2'>
                  <div className='relative flex-1'>
                    <Input
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          addTagToken(inputValue)
                        }
                      }}
                      placeholder={t(
                        'tags.entitySync.inputPlaceholder',
                        'Add canonical tag (e.g. Cyberpunk, Fantasy)...'
                      )}
                      className='h-9 text-xs'
                    />
                  </div>
                  <Button
                    type='button'
                    size='sm'
                    variant='outline'
                    className='h-9 shrink-0 cursor-pointer gap-1.5 px-3 text-xs font-semibold'
                    disabled={!inputValue.trim()}
                    onClick={() => addTagToken(inputValue)}
                  >
                    <PlusIcon className='size-3.5' aria-hidden='true' />
                    <span>{t('buttons.add', 'Add')}</span>
                  </Button>
                </div>

                {inputValue.trim().length > 0 && suggestions.length > 0 && (
                  <div className='bg-popover border-border/80 max-h-40 divide-y overflow-y-auto rounded-xl border shadow-md'>
                    {suggestions.slice(0, 6).map((sug) => (
                      <button
                        key={sug.id}
                        type='button'
                        onClick={() => addTagToken(sug.name)}
                        className='hover:bg-primary/5 flex w-full cursor-pointer items-center justify-between px-3 py-2 text-left text-xs'
                      >
                        <span className='text-foreground truncate font-semibold'>
                          #{sug.name}
                          {sug.translatedName &&
                            sug.translatedName !== sug.name && (
                              <span className='text-muted-foreground ml-1.5 font-normal'>
                                ({sug.translatedName})
                              </span>
                            )}
                        </span>
                        <span className='text-muted-foreground font-mono text-[11px] tabular-nums'>
                          {sug.usageCount.toLocaleString()}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Work-Level Community Tag Lock */}
            <div className='border-border/70 bg-muted/20 flex items-center justify-between gap-3 rounded-xl border p-3.5 shadow-2xs'>
              <div className='flex items-center gap-2.5 text-xs'>
                <div className='bg-primary/10 text-primary dark:text-primary shrink-0 rounded-lg p-1.5'>
                  <LockIcon className='size-3.5' aria-hidden='true' />
                </div>
                <div className='space-y-0.5'>
                  <span className='text-foreground font-semibold'>
                    {t('tags.entity.freezeEdits', 'Freeze community tag edits')}
                  </span>
                  <p className='text-muted-foreground text-[11px]'>
                    {t(
                      'tags.entity.freezeEditsDesc',
                      'When locked, community contributors cannot add or remove tags on this entity.'
                    )}
                  </p>
                </div>
              </div>
              <Switch
                checked={editLocked}
                onCheckedChange={(checked) => {
                  setEditLocked(checked)
                  setIsDirty(true)
                }}
                aria-label={t(
                  'tags.entity.freezeEdits',
                  'Freeze community tag edits'
                )}
              />
            </div>

            <Button
              type='button'
              size='sm'
              className='w-full cursor-pointer gap-2 text-xs font-semibold shadow-xs'
              disabled={!isDirty || syncMutation.isPending}
              onClick={() =>
                syncMutation.mutate({
                  entityType,
                  entityId,
                  tags: draftTags,
                  tagEditLocked: editLocked,
                })
              }
            >
              {syncMutation.isPending ? (
                <>
                  <Loader2Icon className='size-3.5 animate-spin' />
                  <span>{t('tags.entitySync.saving', 'Syncing Tags...')}</span>
                </>
              ) : (
                <>
                  <SaveIcon className='size-3.5' aria-hidden='true' />
                  <span>
                    {t('tags.entitySync.saveBtn', 'Save Author Tags')}
                  </span>
                </>
              )}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}
