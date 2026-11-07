import { useEffect, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
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
    <Card className='gap-0 overflow-hidden py-0 shadow-xs'>
      <CardHeader className='bg-muted/30 flex flex-row items-center justify-between gap-2 border-b px-5 py-3.5'>
        <div>
          <CardTitle className='flex items-center gap-2 text-sm font-semibold'>
            <TagsIcon className='text-primary size-4' aria-hidden='true' />
            {t(
              'tags.entitySync.title',
              'Tagged Taxonomy (Pixiv 10-Tag Governance)'
            )}
          </CardTitle>
          <CardDescription className='text-[11px]'>
            Author tags (*) are protected from community deletion.
          </CardDescription>
        </div>
        <Badge variant='outline' className='font-mono text-xs tabular-nums'>
          <span role='status' aria-atomic='true'>
            {draftTags.length} / {maxTags}
          </span>
        </Badge>
      </CardHeader>

      <CardContent className='space-y-4 p-5'>
        {isFetching ? (
          <div className='space-y-2'>
            <Skeleton className='h-8 w-full' />
            <Skeleton className='h-8 w-2/3' />
          </div>
        ) : (
          <>
            {/* Tag Chips with Accessible Keyboard Reordering */}
            {draftTags.length === 0 ? (
              <p className='text-muted-foreground text-xs italic'>
                No canonical tags attached yet. Add up to {maxTags} tags below.
              </p>
            ) : (
              <div className='flex flex-wrap gap-1.5'>
                {draftTags.map((tagName, idx) => (
                  <div
                    key={`${tagName}-${idx}`}
                    className='bg-muted/40 inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs whitespace-nowrap'
                  >
                    <span
                      className='text-primary font-semibold'
                      title='Author Tag'
                    >
                      *
                    </span>
                    <span className='max-w-36 truncate font-medium'>
                      #{tagName}
                    </span>
                    <div className='ml-0.5 inline-flex items-center border-l pl-1'>
                      <button
                        type='button'
                        disabled={idx === 0}
                        aria-label={`Move tag ${tagName} left`}
                        onClick={() => moveTag(idx, -1)}
                        className='text-muted-foreground hover:text-foreground disabled:opacity-30'
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
                        className='text-muted-foreground hover:text-foreground disabled:opacity-30'
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
                        className='text-muted-foreground hover:text-destructive ml-0.5'
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
              <div className='space-y-1.5'>
                <div className='flex gap-1.5'>
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addTagToken(inputValue)
                      }
                    }}
                    placeholder='Add canonical or new tag...'
                    className='h-8 text-xs'
                  />
                  <Button
                    type='button'
                    size='sm'
                    variant='outline'
                    className='h-8 shrink-0 px-2.5'
                    disabled={!inputValue.trim()}
                    onClick={() => addTagToken(inputValue)}
                  >
                    <PlusIcon className='size-3.5' aria-hidden='true' />
                    Add
                  </Button>
                </div>

                {inputValue.trim().length > 0 && suggestions.length > 0 && (
                  <div className='bg-popover max-h-36 divide-y overflow-y-auto rounded-md border shadow-xs'>
                    {suggestions.slice(0, 6).map((sug) => (
                      <button
                        key={sug.id}
                        type='button'
                        onClick={() => addTagToken(sug.name)}
                        className='hover:bg-muted/60 flex w-full items-center justify-between px-2.5 py-1.5 text-left text-xs'
                      >
                        <span className='truncate font-medium'>
                          #{sug.name}
                          {sug.translatedName &&
                            sug.translatedName !== sug.name && (
                              <span className='text-muted-foreground ml-1 font-normal'>
                                ({sug.translatedName})
                              </span>
                            )}
                        </span>
                        <span className='text-muted-foreground font-mono text-[11px] tabular-nums'>
                          {sug.usageCount}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Work-Level Community Tag Lock */}
            <div className='flex items-center justify-between gap-2 rounded-md border p-2.5'>
              <div className='flex items-center gap-2 text-xs'>
                <LockIcon
                  className='text-muted-foreground size-3.5 shrink-0'
                  aria-hidden='true'
                />
                <span>Freeze community tag edits</span>
              </div>
              <Switch
                checked={editLocked}
                onCheckedChange={(checked) => {
                  setEditLocked(checked)
                  setIsDirty(true)
                }}
                aria-label='Freeze community tag edits'
              />
            </div>

            <Button
              type='button'
              size='sm'
              className='w-full'
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
              <SaveIcon className='size-3.5' aria-hidden='true' />
              {syncMutation.isPending ? 'Syncing Tags...' : 'Save Author Tags'}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}
