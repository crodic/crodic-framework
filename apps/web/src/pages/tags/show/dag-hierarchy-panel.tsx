import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ArrowDownIcon,
  GitBranchIcon,
  Link2Icon,
  PlusIcon,
  SearchIcon,
  SplitIcon,
  XIcon,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FormFieldHelp } from '../components/form-field-help'
import { TagCategoryBadge, TagNodeChip } from '../components/tag-badges'
import {
  apiAddTagRelation,
  apiRemoveTagRelation,
  useDataTagAutocomplete,
} from '../queries'
import type { TagDetail, TagRelationType } from '../schema'

type LinkDirection = 'parent' | 'child' | 'related' | 'disambiguation'

interface PendingUnlink {
  sourceTagId: string
  targetTagId: string
  relationType: TagRelationType
  label: string
}

export function DagHierarchyPanel({ tag }: { tag: TagDetail }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [direction, setDirection] = useState<LinkDirection>('child')
  const [searchKeyword, setSearchKeyword] = useState('')
  const [pendingUnlink, setPendingUnlink] = useState<PendingUnlink | null>(null)

  const { data: suggestions = [], isFetching: isSearching } =
    useDataTagAutocomplete(searchKeyword)

  const filteredSuggestions = suggestions.filter((item) => item.id !== tag.id)

  const invalidateGraph = () => {
    queryClient.invalidateQueries({ queryKey: ['tag', tag.id] })
    queryClient.invalidateQueries({ queryKey: ['tags'] })
  }

  const addRelationMutation = useMutation({
    mutationFn: apiAddTagRelation,
    onSuccess: () => {
      toast.success(
        t('tags.messages.relationAdded', 'Semantic relation linked')
      )
      setSearchKeyword('')
      invalidateGraph()
    },
    onError: restApiErrorHandler,
  })

  const removeRelationMutation = useMutation({
    mutationFn: apiRemoveTagRelation,
    onSuccess: () => {
      toast.success(
        t('tags.messages.relationRemoved', 'Semantic relation removed')
      )
      setPendingUnlink(null)
      invalidateGraph()
    },
    onError: restApiErrorHandler,
  })

  const handleLinkTag = (selectedId: string) => {
    if (direction === 'parent') {
      addRelationMutation.mutate({
        sourceTagId: selectedId,
        targetTagId: tag.id,
        relationType: 'hierarchy',
      })
      return
    }
    const relationType: TagRelationType =
      direction === 'child' ? 'hierarchy' : direction
    addRelationMutation.mutate({
      sourceTagId: tag.id,
      targetTagId: selectedId,
      relationType,
    })
  }

  const { parents, children, siblings, related, disambiguations } = tag.graph

  return (
    <>
      <AlertDialog
        open={Boolean(pendingUnlink)}
        onOpenChange={(open) => {
          if (!open) setPendingUnlink(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('tags.hierarchy.unlinkTitle', 'Unlink Tag Relation')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t(
                'tags.hierarchy.unlinkDesc',
                'Are you sure you want to remove this semantic relationship? Transitive closure paths will be recalculated immediately.'
              )}{' '}
              {pendingUnlink ? `(${pendingUnlink.label})` : ''}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={removeRelationMutation.isPending}>
              {t('buttons.cancel', 'Cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={removeRelationMutation.isPending || !pendingUnlink}
              onClick={(e) => {
                e.preventDefault()
                if (!pendingUnlink) return
                removeRelationMutation.mutate({
                  sourceTagId: pendingUnlink.sourceTagId,
                  targetTagId: pendingUnlink.targetTagId,
                  relationType: pendingUnlink.relationType,
                })
              }}
            >
              {removeRelationMutation.isPending ? 'Removing...' : 'Unlink'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className='grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]'>
        {/* Left: 3-Tier Visual Semantic DAG */}
        <div className='space-y-4'>
          {/* Tier 1: Parents */}
          <Card className='shadow-xs'>
            <CardHeader className='pb-3'>
              <CardTitle className='text-sm font-semibold'>
                {t('tags.hierarchy.parents', 'Parent Tags (親タグ)')}
              </CardTitle>
              <CardDescription className='text-xs'>
                {t(
                  'tags.hierarchy.parentsDesc',
                  'Broader concepts that encompass this tag in closure queries.'
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {parents.length === 0 ? (
                <p className='text-muted-foreground text-xs italic'>
                  {t(
                    'tags.hierarchy.rootNode',
                    'Root node — no parent tags linked.'
                  )}
                </p>
              ) : (
                <div className='flex flex-wrap gap-2'>
                  {parents.map((parent) => (
                    <TagNodeChip
                      key={parent.id}
                      name={parent.name}
                      translatedName={parent.translatedName}
                      category={parent.category}
                      isOfficial={parent.isOfficial}
                      usageCount={parent.usageCount}
                      onClick={() => navigate(`/tags/${parent.id}/show`)}
                      trailingAction={
                        <button
                          type='button'
                          aria-label={`Unlink parent tag ${parent.name}`}
                          onClick={() =>
                            setPendingUnlink({
                              sourceTagId: parent.id,
                              targetTagId: tag.id,
                              relationType: 'hierarchy',
                              label: `#${parent.name} → #${tag.name}`,
                            })
                          }
                          className='text-muted-foreground hover:text-destructive ml-1 rounded-xs p-0.5 transition-colors'
                        >
                          <XIcon className='size-3' aria-hidden='true' />
                        </button>
                      }
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Connector: Parent -> Current */}
          <div
            className='my-1 flex items-center justify-center gap-2'
            aria-hidden='true'
          >
            <div className='bg-border h-px w-12' />
            <span className='text-muted-foreground bg-muted/60 border-border/40 inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 font-mono text-[10px] tracking-wider uppercase'>
              <ArrowDownIcon className='text-primary size-3' />
              Parent concept (親タグ)
            </span>
            <div className='bg-border h-px w-12' />
          </div>

          {/* Tier 2: Current Node + Siblings */}
          <div className='grid gap-4 md:grid-cols-2'>
            <Card className='border-primary/50 bg-primary/5 ring-primary/20 relative overflow-hidden shadow-xs ring-2'>
              <div className='bg-primary/10 pointer-events-none absolute top-0 right-0 h-16 w-16 translate-x-4 -translate-y-4 rounded-full blur-xl' />
              <CardHeader className='pb-2'>
                <div className='flex items-center justify-between'>
                  <CardDescription className='text-primary text-[11px] font-semibold tracking-wider uppercase'>
                    {t('tags.hierarchy.currentNode', 'Current Canonical Node')}
                  </CardDescription>
                  <span className='bg-primary flex h-2 w-2 animate-pulse rounded-full' />
                </div>
                <CardTitle className='flex items-center gap-2 text-lg'>
                  <span>#{tag.name}</span>
                  <TagCategoryBadge category={tag.category} />
                </CardTitle>
              </CardHeader>
              <CardContent className='text-muted-foreground text-xs'>
                Slug: <code className='font-mono'>/{tag.slug}</code> ·{' '}
                <span className='text-foreground font-mono font-semibold tabular-nums'>
                  {tag.usageCount.toLocaleString()}
                </span>{' '}
                {t('tags.hierarchy.taggedItems', 'tagged items')}
              </CardContent>
            </Card>

            <Card className='shadow-xs'>
              <CardHeader className='pb-2.5'>
                <CardTitle className='text-sm font-semibold'>
                  {t('tags.hierarchy.siblings', 'Sibling Tags (兄弟タグ)')}
                </CardTitle>
                <CardDescription className='text-xs'>
                  {t(
                    'tags.hierarchy.siblingsDesc',
                    'Tags sharing a common parent node in the taxonomy graph.'
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {siblings.length === 0 ? (
                  <p className='text-muted-foreground text-xs italic'>
                    {t(
                      'tags.hierarchy.noSiblings',
                      'No sibling tags derived from shared parents.'
                    )}
                  </p>
                ) : (
                  <div className='flex flex-wrap gap-1.5'>
                    {siblings.map((sibling) => (
                      <TagNodeChip
                        key={sibling.id}
                        name={sibling.name}
                        translatedName={sibling.translatedName}
                        category={sibling.category}
                        usageCount={sibling.usageCount}
                        onClick={() => navigate(`/tags/${sibling.id}/show`)}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Connector: Current -> Children */}
          <div
            className='my-1 flex items-center justify-center gap-2'
            aria-hidden='true'
          >
            <div className='bg-border h-px w-12' />
            <span className='text-muted-foreground bg-muted/60 border-border/40 inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 font-mono text-[10px] tracking-wider uppercase'>
              <ArrowDownIcon className='text-primary size-3' />
              Sub-concept hierarchy (子タグ)
            </span>
            <div className='bg-border h-px w-12' />
          </div>

          {/* Tier 3: Children */}
          <Card className='shadow-xs'>
            <CardHeader className='pb-3'>
              <CardTitle className='text-sm font-semibold'>
                {t('tags.hierarchy.children', 'Child Tags (子タグ)')}
              </CardTitle>
              <CardDescription className='text-xs'>
                {t(
                  'tags.hierarchy.childrenDesc',
                  'Specific sub-tags automatically included when expanding this tag.'
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {children.length === 0 ? (
                <p className='text-muted-foreground text-xs italic'>
                  {t(
                    'tags.hierarchy.leafNode',
                    'Leaf node — no child sub-tags linked.'
                  )}
                </p>
              ) : (
                <div className='flex flex-wrap gap-2'>
                  {children.map((child) => (
                    <TagNodeChip
                      key={child.id}
                      name={child.name}
                      translatedName={child.translatedName}
                      category={child.category}
                      isOfficial={child.isOfficial}
                      usageCount={child.usageCount}
                      onClick={() => navigate(`/tags/${child.id}/show`)}
                      trailingAction={
                        <button
                          type='button'
                          aria-label={`Unlink child tag ${child.name}`}
                          onClick={() =>
                            setPendingUnlink({
                              sourceTagId: tag.id,
                              targetTagId: child.id,
                              relationType: 'hierarchy',
                              label: `#${tag.name} → #${child.name}`,
                            })
                          }
                          className='text-muted-foreground hover:text-destructive ml-1 rounded-xs p-0.5 transition-colors'
                        >
                          <XIcon className='size-3' aria-hidden='true' />
                        </button>
                      }
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Associative Relations: Related & Disambiguation */}
          <div className='grid gap-4 md:grid-cols-2'>
            <Card className='shadow-xs'>
              <CardHeader className='pb-2.5'>
                <CardTitle className='flex items-center gap-1.5 text-sm font-semibold'>
                  <Link2Icon
                    className='text-primary size-4'
                    aria-hidden='true'
                  />
                  {t('tags.hierarchy.related', 'Related Tags (関連タグ)')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {related.length === 0 ? (
                  <p className='text-muted-foreground text-xs italic'>
                    {t(
                      'tags.hierarchy.noRelated',
                      'No associative related tags linked.'
                    )}
                  </p>
                ) : (
                  <div className='flex flex-wrap gap-2'>
                    {related.map((rel) => (
                      <TagNodeChip
                        key={rel.id}
                        name={rel.name}
                        translatedName={rel.translatedName}
                        category={rel.category}
                        usageCount={rel.usageCount}
                        onClick={() => navigate(`/tags/${rel.id}/show`)}
                        trailingAction={
                          <button
                            type='button'
                            aria-label={`Unlink related tag ${rel.name}`}
                            onClick={() =>
                              setPendingUnlink({
                                sourceTagId: tag.id,
                                targetTagId: rel.id,
                                relationType: 'related',
                                label: `#${tag.name} ↔ #${rel.name}`,
                              })
                            }
                            className='text-muted-foreground hover:text-destructive ml-1 rounded-xs p-0.5 transition-colors'
                          >
                            <XIcon className='size-3' aria-hidden='true' />
                          </button>
                        }
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className='shadow-xs'>
              <CardHeader className='pb-2.5'>
                <CardTitle className='flex items-center gap-1.5 text-sm font-semibold'>
                  <SplitIcon
                    className='size-4 text-amber-500'
                    aria-hidden='true'
                  />
                  {t(
                    'tags.hierarchy.disambiguations',
                    'Disambiguation (曖昧さ回避)'
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {disambiguations.length === 0 ? (
                  <p className='text-muted-foreground text-xs italic'>
                    {t(
                      'tags.hierarchy.noDisambiguations',
                      'No disambiguation tags registered.'
                    )}
                  </p>
                ) : (
                  <div className='flex flex-wrap gap-2'>
                    {disambiguations.map((dis) => (
                      <TagNodeChip
                        key={dis.id}
                        name={dis.name}
                        translatedName={dis.translatedName}
                        category={dis.category}
                        usageCount={dis.usageCount}
                        onClick={() => navigate(`/tags/${dis.id}/show`)}
                        trailingAction={
                          <button
                            type='button'
                            aria-label={`Unlink disambiguation tag ${dis.name}`}
                            onClick={() =>
                              setPendingUnlink({
                                sourceTagId: tag.id,
                                targetTagId: dis.id,
                                relationType: 'disambiguation',
                                label: `#${tag.name} ≠ #${dis.name}`,
                              })
                            }
                            className='text-muted-foreground hover:text-destructive ml-1 rounded-xs p-0.5 transition-colors'
                          >
                            <XIcon className='size-3' aria-hidden='true' />
                          </button>
                        }
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right: Interactive Relation Linker */}
        <div>
          <Card className='sticky top-4 shadow-xs'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2 text-base'>
                <GitBranchIcon
                  className='text-primary size-4'
                  aria-hidden='true'
                />
                {t('tags.hierarchy.addRelation', 'Link Tag Relation')}
              </CardTitle>
              <CardDescription className='text-xs'>
                {t(
                  'tags.hierarchy.roleDesc',
                  'Cycle detection automatically validates the Directed Acyclic Graph (DAG) and updates the transitive closure table.'
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-1.5'>
                <div className='flex items-center gap-1.5'>
                  <label className='text-xs font-medium'>
                    {t('tags.hierarchy.role', 'Relation Role')}
                  </label>
                  <FormFieldHelp tooltip={t('tags.help.dagRole')} />
                </div>
                <Select
                  value={direction}
                  onValueChange={(v) => setDirection(v as LinkDirection)}
                >
                  <SelectTrigger className='w-full'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='parent'>
                      {t('tags.hierarchy.addParentOption', {
                        name: tag.name,
                        defaultValue: `Add Parent Tag (親タグ → #${tag.name})`,
                      })}
                    </SelectItem>
                    <SelectItem value='child'>
                      {t('tags.hierarchy.addChildOption', {
                        name: tag.name,
                        defaultValue: `Add Child Tag (#${tag.name} → 子タグ)`,
                      })}
                    </SelectItem>
                    <SelectItem value='related'>
                      {t(
                        'tags.hierarchy.addRelatedOption',
                        'Add Related Tag (関連タグ)'
                      )}
                    </SelectItem>
                    <SelectItem value='disambiguation'>
                      {t(
                        'tags.hierarchy.addDisambiguationOption',
                        'Add Disambiguation (曖昧さ回避)'
                      )}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <div className='flex items-center gap-1.5'>
                  <label
                    htmlFor='dag-link-search'
                    className='text-xs font-medium'
                  >
                    {t(
                      'tags.hierarchy.searchTag',
                      'Search Canonical Tag to Link'
                    )}
                  </label>
                  <FormFieldHelp tooltip={t('tags.help.dagSearch')} />
                </div>
                <div className='relative'>
                  <SearchIcon
                    className='text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2'
                    aria-hidden='true'
                  />
                  <Input
                    id='dag-link-search'
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    placeholder={t(
                      'tags.hierarchy.searchPlaceholder',
                      'Type tag name or alias...'
                    )}
                    className='pl-9'
                  />
                </div>

                <div className='max-h-72 overflow-y-auto rounded-md border'>
                  {isSearching ? (
                    <p className='text-muted-foreground p-4 text-center text-xs'>
                      {t('tags.hierarchy.searching', 'Searching tags...')}
                    </p>
                  ) : filteredSuggestions.length === 0 ? (
                    <p className='text-muted-foreground p-4 text-center text-xs'>
                      {t('tags.hierarchy.noResults', 'No matching tags found.')}
                    </p>
                  ) : (
                    <div className='divide-y'>
                      {filteredSuggestions.map((candidate) => (
                        <div
                          key={candidate.id}
                          className='hover:bg-muted/40 flex items-center justify-between gap-2 px-3 py-2 text-xs transition-colors'
                        >
                          <div className='min-w-0 flex-1 space-y-0.5'>
                            <div className='flex items-center gap-1.5'>
                              <p className='text-foreground truncate font-medium'>
                                #{candidate.name}
                              </p>
                              <TagCategoryBadge
                                category={candidate.category}
                                className='origin-left scale-90 py-0 text-[10px]'
                              />
                            </div>
                            {candidate.translatedName &&
                              candidate.translatedName !== candidate.name && (
                                <p className='text-muted-foreground truncate text-[11px]'>
                                  {candidate.translatedName}
                                </p>
                              )}
                          </div>
                          <Button
                            type='button'
                            size='sm'
                            variant='outline'
                            disabled={addRelationMutation.isPending}
                            onClick={() => handleLinkTag(candidate.id)}
                            className='h-7 shrink-0 px-2.5 text-xs'
                          >
                            <PlusIcon className='size-3.5' aria-hidden='true' />
                            {t('tags.hierarchy.linkBtn', 'Link')}
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
