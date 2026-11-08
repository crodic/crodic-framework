import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ArrowDownIcon,
  ArrowRightIcon,
  BadgeCheckIcon,
  CheckIcon,
  GitBranchIcon,
  Link2Icon,
  Loader2Icon,
  PlusIcon,
  SearchIcon,
  SplitIcon,
  XIcon,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { restApiErrorHandler } from '@/lib/rest-api-handler'
import { cn } from '@/lib/utils'
import { useDebounce } from '@/hooks/use-debounce'
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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

  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [direction, setDirection] = useState<LinkDirection>('child')
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedQuery = useDebounce(searchQuery.trim(), 200)
  const [linkingId, setLinkingId] = useState<string | null>(null)

  // Unlink State
  const [pendingUnlink, setPendingUnlink] = useState<PendingUnlink | null>(null)

  // Fast Autocomplete query (matches canonical names, aliases, and translations)
  const { data: suggestions = [], isFetching: isSearching } =
    useDataTagAutocomplete(debouncedQuery, 'en')

  const invalidateGraph = () => {
    queryClient.invalidateQueries({ queryKey: ['tag', tag.id] })
    queryClient.invalidateQueries({ queryKey: ['tags'] })
  }

  const addRelationMutation = useMutation({
    mutationFn: apiAddTagRelation,
    onSuccess: () => {
      toast.success(
        t('tags.messages.relationAdded', 'Đã thêm liên kết ngữ nghĩa')
      )
      setLinkingId(null)
      invalidateGraph()
    },
    onError: (err) => {
      setLinkingId(null)
      restApiErrorHandler(err as any)
    },
  })

  const removeRelationMutation = useMutation({
    mutationFn: apiRemoveTagRelation,
    onSuccess: () => {
      toast.success(
        t('tags.messages.relationRemoved', 'Đã gỡ liên kết ngữ nghĩa')
      )
      setPendingUnlink(null)
      invalidateGraph()
    },
    onError: restApiErrorHandler,
  })

  const openDialog = (targetDirection: LinkDirection) => {
    setDirection(targetDirection)
    setSearchQuery('')
    setIsDialogOpen(true)
  }

  const handleLink = (candidateId: string) => {
    setLinkingId(candidateId)
    if (direction === 'parent') {
      addRelationMutation.mutate({
        sourceTagId: candidateId,
        targetTagId: tag.id,
        relationType: 'hierarchy',
      })
      return
    }
    const relationType: TagRelationType =
      direction === 'child' ? 'hierarchy' : direction
    addRelationMutation.mutate({
      sourceTagId: tag.id,
      targetTagId: candidateId,
      relationType,
    })
  }

  const { parents, children, siblings, related, disambiguations } = tag.graph

  const isAlreadyLinked = (candidateId: string): boolean => {
    if (direction === 'parent') return parents.some((p) => p.id === candidateId)
    if (direction === 'child') return children.some((c) => c.id === candidateId)
    if (direction === 'related')
      return related.some((r) => r.id === candidateId)
    if (direction === 'disambiguation')
      return disambiguations.some((d) => d.id === candidateId)
    return false
  }

  const candidates = suggestions.filter((item) => item.id !== tag.id)

  return (
    <>
      {/* Unlink Confirmation Dialog */}
      <AlertDialog
        open={Boolean(pendingUnlink)}
        onOpenChange={(open) => {
          if (!open) setPendingUnlink(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('tags.hierarchy.unlinkTitle', 'Huỷ liên kết Quan hệ Thẻ')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t(
                'tags.hierarchy.unlinkDesc',
                'Bạn có chắc chắn muốn gỡ mối quan hệ ngữ nghĩa này? Bảng bao đóng bắc cầu (closure table) sẽ được tính toán lại ngay lập tức.'
              )}{' '}
              {pendingUnlink ? `(${pendingUnlink.label})` : ''}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={removeRelationMutation.isPending}>
              {t('buttons.cancel', 'Hủy')}
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
              {removeRelationMutation.isPending ? 'Đang gỡ...' : 'Gỡ liên kết'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modern Spotlight-Style Tag Linking Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className='border-border/80 gap-0 overflow-hidden rounded-2xl border p-0 shadow-2xl sm:max-w-xl md:max-w-2xl'>
          {/* Header Bar */}
          <DialogHeader className='border-border/60 bg-card border-b px-6 pt-5 pb-4'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <div className='bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-xl'>
                  <GitBranchIcon className='size-5' aria-hidden='true' />
                </div>
                <div>
                  <DialogTitle className='text-foreground text-base font-bold'>
                    Liên kết Quan hệ Ngữ nghĩa Thẻ
                  </DialogTitle>
                  <p className='text-muted-foreground text-xs'>
                    Thiết lập phân cấp và liên kết cho{' '}
                    <strong>#{tag.name}</strong>
                  </p>
                </div>
              </div>
            </div>

            {/* Segmented Pill Direction Selector */}
            <div className='bg-muted/60 border-border/40 mt-4 flex items-center gap-1.5 rounded-xl border p-1'>
              <button
                type='button'
                onClick={() => setDirection('parent')}
                className={cn(
                  'flex-1 cursor-pointer rounded-lg py-1.5 text-center text-xs font-semibold transition-all',
                  direction === 'parent'
                    ? 'bg-background text-primary shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                Thẻ Cha (Parent)
              </button>
              <button
                type='button'
                onClick={() => setDirection('child')}
                className={cn(
                  'flex-1 cursor-pointer rounded-lg py-1.5 text-center text-xs font-semibold transition-all',
                  direction === 'child'
                    ? 'bg-background text-emerald-600 shadow-xs dark:text-emerald-400'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                Thẻ Con (Child)
              </button>
              <button
                type='button'
                onClick={() => setDirection('related')}
                className={cn(
                  'flex-1 cursor-pointer rounded-lg py-1.5 text-center text-xs font-semibold transition-all',
                  direction === 'related'
                    ? 'bg-background text-sky-600 shadow-xs dark:text-sky-400'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                Thẻ Liên Quan (Related)
              </button>
              <button
                type='button'
                onClick={() => setDirection('disambiguation')}
                className={cn(
                  'flex-1 cursor-pointer rounded-lg py-1.5 text-center text-xs font-semibold transition-all',
                  direction === 'disambiguation'
                    ? 'bg-background text-amber-600 shadow-xs dark:text-amber-400'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                Đồng Âm (Disambig)
              </button>
            </div>

            {/* Helper explanation line */}
            <div className='text-muted-foreground mt-2.5 flex items-center gap-1.5 px-1 text-xs'>
              <span className='text-foreground font-medium'>
                {direction === 'parent' &&
                  `Thẻ được chọn sẽ là cha bao quát #${tag.name}`}
                {direction === 'child' &&
                  `#{tag.name} sẽ là cha bao quát thẻ được chọn`}
                {direction === 'related' &&
                  `Mối quan hệ ngang hàng cùng chủ đề với #${tag.name}`}
                {direction === 'disambiguation' &&
                  `Phân biệt nghĩa / đồng âm khác ngữ cảnh với #${tag.name}`}
              </span>
            </div>
          </DialogHeader>

          {/* Spotlight Search Bar */}
          <div className='border-border/60 bg-muted/20 flex h-13 items-center gap-3 border-b px-6'>
            <SearchIcon
              className='text-primary size-4 shrink-0'
              aria-hidden='true'
            />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder='Gõ tên thẻ, bản dịch hoặc alias (VD: Frieren, Fantasy, Original)...'
              className='placeholder:text-muted-foreground flex-1 bg-transparent text-sm font-medium outline-none'
              autoFocus
            />
            {isSearching ? (
              <Loader2Icon className='text-primary size-4 shrink-0 animate-spin' />
            ) : searchQuery ? (
              <button
                type='button'
                onClick={() => setSearchQuery('')}
                className='text-muted-foreground hover:text-foreground cursor-pointer'
              >
                <XIcon className='size-4' />
              </button>
            ) : null}
          </div>

          {/* Results List (Clean, borderless, spacious, spotlight style) */}
          <div className='max-h-[380px] space-y-1 overflow-y-auto p-3'>
            {candidates.length === 0 && !isSearching ? (
              <div className='space-y-2 p-10 text-center'>
                <p className='text-foreground text-sm font-medium'>
                  {searchQuery
                    ? 'Không tìm thấy thẻ phù hợp'
                    : 'Gõ tên thẻ hoặc alias để tìm kiếm'}
                </p>
                <p className='text-muted-foreground text-xs'>
                  Hệ thống tự động tìm kiếm qua tên chuẩn, bản dịch đa ngôn ngữ
                  và từ đồng nghĩa alias.
                </p>
              </div>
            ) : (
              candidates.map((item) => {
                const alreadyLinked = isAlreadyLinked(item.id)
                const isCurrentlyLinking = linkingId === item.id

                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (!alreadyLinked && !isCurrentlyLinking) {
                        handleLink(item.id)
                      }
                    }}
                    className={cn(
                      'group flex cursor-pointer items-center justify-between gap-4 rounded-xl px-4 py-3 transition-all',
                      alreadyLinked
                        ? 'bg-muted/30 cursor-default opacity-60'
                        : 'hover:bg-primary/5 hover:border-primary/20 border border-transparent'
                    )}
                  >
                    {/* Left: Tag Information */}
                    <div className='min-w-0 flex-1 space-y-1'>
                      <div className='flex flex-wrap items-center gap-2'>
                        <span className='text-foreground group-hover:text-primary font-mono text-sm font-bold transition-colors'>
                          #{item.name}
                        </span>
                        {item.isOfficial && (
                          <BadgeCheckIcon
                            className='text-primary size-3.5 shrink-0'
                            aria-hidden='true'
                          />
                        )}
                        <TagCategoryBadge
                          category={item.category}
                          className='py-0 text-[10px]'
                        />
                        {item.translatedName &&
                          item.translatedName !== item.name && (
                            <span className='text-muted-foreground truncate text-xs'>
                              ({item.translatedName})
                            </span>
                          )}
                      </div>

                      <div className='text-muted-foreground flex flex-wrap items-center gap-3 font-mono text-xs'>
                        {item.matchedAlias ? (
                          <span className='text-primary/90 bg-primary/10 rounded px-1.5 py-0.5 font-sans text-[11px] font-medium'>
                            Khớp alias: {item.matchedAlias}
                          </span>
                        ) : null}
                        <span>/{item.slug}</span>
                        <span>•</span>
                        <span className='tabular-nums'>
                          {item.usageCount?.toLocaleString() ?? 0} lượt dùng
                        </span>
                      </div>
                    </div>

                    {/* Right: State / Action */}
                    <div className='flex shrink-0 items-center gap-2'>
                      {alreadyLinked ? (
                        <span className='text-muted-foreground bg-muted inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium'>
                          <CheckIcon className='size-3 text-emerald-500' />
                          Đã liên kết
                        </span>
                      ) : isCurrentlyLinking ? (
                        <div className='text-primary flex items-center gap-1.5 px-2 py-1 text-xs font-medium'>
                          <Loader2Icon className='size-3.5 animate-spin' />
                          <span>Đang liên kết...</span>
                        </div>
                      ) : (
                        <span className='text-primary bg-primary/10 inline-flex items-center gap-1 rounded-lg px-3 py-1 text-xs font-semibold opacity-0 transition-opacity group-hover:opacity-100'>
                          <span>Liên kết</span>
                          <ArrowRightIcon className='size-3' />
                        </span>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Footer Bar */}
          <div className='border-border/60 bg-muted/10 text-muted-foreground flex items-center justify-between border-t px-6 py-3 text-xs'>
            <span>Bấm trực tiếp vào hàng thẻ bất kỳ để liên kết nhanh</span>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={() => setIsDialogOpen(false)}
              className='h-8 cursor-pointer text-xs'
            >
              Đóng
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 100% Full-Width Semantic DAG Workspace */}
      <div className='space-y-6'>
        {/* Header Action Bar */}
        <div className='border-border/80 bg-card flex flex-wrap items-center justify-between gap-4 rounded-2xl border p-5 shadow-2xs'>
          <div className='flex items-center gap-3'>
            <div className='bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-xl'>
              <GitBranchIcon className='size-5' aria-hidden='true' />
            </div>
            <div>
              <h2 className='text-foreground text-base font-semibold'>
                Cây Phân Cấp Ngữ Nghĩa (DAG Hierarchy)
              </h2>
              <p className='text-muted-foreground text-xs'>
                Mô hình hóa quan hệ cha - con, đồng cấp, liên quan và phân biệt
                đồng âm.
              </p>
            </div>
          </div>

          <div className='flex flex-wrap items-center gap-2'>
            <Button
              type='button'
              onClick={() => openDialog('child')}
              className='h-9 cursor-pointer gap-2 text-xs font-semibold shadow-2xs'
            >
              <PlusIcon className='size-4' aria-hidden='true' />
              <span>Thiết lập Quan hệ Thẻ</span>
            </Button>
          </div>
        </div>

        {/* Tier 1: Parents (Thẻ Cha) */}
        <Card className='border-border/80 shadow-xs'>
          <CardHeader className='flex flex-row items-center justify-between pb-3'>
            <div className='space-y-0.5'>
              <div className='flex items-center gap-2'>
                <CardTitle className='text-sm font-semibold'>
                  {t('tags.hierarchy.parents', 'Thẻ Cha')}
                </CardTitle>
                <Badge
                  variant='outline'
                  className='font-mono text-xs tabular-nums'
                >
                  {parents.length}
                </Badge>
              </div>
              <CardDescription className='text-xs'>
                {t(
                  'tags.hierarchy.parentsDesc',
                  'Khái niệm bao quát hơn chứa thẻ này trong truy vấn phân cấp.'
                )}
              </CardDescription>
            </div>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={() => openDialog('parent')}
              className='text-primary hover:text-primary hover:bg-primary/10 h-8 cursor-pointer gap-1.5 text-xs shadow-2xs'
            >
              <PlusIcon className='size-3.5' aria-hidden='true' />
              <span>Thêm Thẻ Cha</span>
            </Button>
          </CardHeader>
          <CardContent>
            {parents.length === 0 ? (
              <p className='text-muted-foreground py-2 text-xs italic'>
                {t(
                  'tags.hierarchy.rootNode',
                  'Thẻ gốc (Root taxonomy node) — chưa liên kết thẻ cha nào.'
                )}
              </p>
            ) : (
              <div className='flex flex-wrap gap-2.5'>
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
                        className='text-muted-foreground hover:text-destructive ml-1 cursor-pointer rounded-xs p-0.5 transition-colors'
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

        {/* Visual Connector: Parents -> Current Node */}
        <div
          className='flex items-center justify-center gap-3'
          aria-hidden='true'
        >
          <div className='bg-border h-px max-w-xs flex-1' />
          <span className='text-muted-foreground bg-muted/60 border-border/60 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-[11px] font-medium'>
            <ArrowDownIcon className='text-primary size-3.5' />
            Kế thừa phân cấp (Is-A / Inheritance)
          </span>
          <div className='bg-border h-px max-w-xs flex-1' />
        </div>

        {/* Tier 2: Current Node & Siblings */}
        <div className='grid gap-6 md:grid-cols-2'>
          {/* Current Node Highlight Card */}
          <Card className='border-primary/50 bg-primary/5 ring-primary/20 relative overflow-hidden shadow-xs ring-2'>
            <div className='bg-primary/10 pointer-events-none absolute top-0 right-0 h-24 w-24 translate-x-6 -translate-y-6 rounded-full blur-2xl' />
            <CardHeader className='pb-3'>
              <div className='flex items-center justify-between'>
                <span className='text-primary inline-flex items-center gap-1.5 text-[11px] font-bold tracking-wider uppercase'>
                  <span className='bg-primary size-2 animate-pulse rounded-full' />
                  {t('tags.hierarchy.currentNode', 'Thẻ Hiện Tại')}
                </span>
                <Badge
                  variant='outline'
                  className='bg-background/80 font-mono text-[11px]'
                >
                  Taxonomy Focus
                </Badge>
              </div>
              <CardTitle className='flex flex-wrap items-center gap-2.5 text-xl font-bold'>
                <span>#{tag.name}</span>
                {tag.isOfficial && (
                  <BadgeCheckIcon
                    className='text-primary size-4.5 shrink-0'
                    aria-hidden='true'
                  />
                )}
                <TagCategoryBadge category={tag.category} />
              </CardTitle>
            </CardHeader>
            <CardContent className='text-muted-foreground space-y-1.5 text-xs'>
              <div className='flex items-center gap-2'>
                <span>Slug:</span>
                <code className='text-foreground bg-background/60 rounded border px-1.5 py-0.5 font-mono font-semibold'>
                  /{tag.slug}
                </code>
              </div>
              <div className='flex items-center gap-2'>
                <span>Sử dụng:</span>
                <span className='text-foreground font-mono font-semibold tabular-nums'>
                  {tag.usageCount.toLocaleString()}
                </span>
                <span>{t('tags.hierarchy.taggedItems', 'lượt gắn thẻ')}</span>
              </div>
            </CardContent>
          </Card>

          {/* Siblings (Thẻ Cùng Cấp) */}
          <Card className='border-border/80 shadow-xs'>
            <CardHeader className='pb-3'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <CardTitle className='text-sm font-semibold'>
                    {t('tags.hierarchy.siblings', 'Thẻ Cùng Cấp')}
                  </CardTitle>
                  <Badge
                    variant='outline'
                    className='font-mono text-xs tabular-nums'
                  >
                    {siblings.length}
                  </Badge>
                </div>
              </div>
              <CardDescription className='text-xs'>
                {t(
                  'tags.hierarchy.siblingsDesc',
                  'Các thẻ có chung Thẻ Cha trong đồ thị phân loại.'
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {siblings.length === 0 ? (
                <p className='text-muted-foreground py-2 text-xs italic'>
                  {t(
                    'tags.hierarchy.noSiblings',
                    'Chưa có thẻ cùng cấp từ thẻ cha chung.'
                  )}
                </p>
              ) : (
                <div className='flex flex-wrap gap-2'>
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

        {/* Visual Connector: Current Node -> Children */}
        <div
          className='flex items-center justify-center gap-3'
          aria-hidden='true'
        >
          <div className='bg-border h-px max-w-xs flex-1' />
          <span className='text-muted-foreground bg-muted/60 border-border/60 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-[11px] font-medium'>
            <ArrowDownIcon className='size-3.5 text-emerald-500' />
            Phân nhánh thẻ con (Sub-types / Specialization)
          </span>
          <div className='bg-border h-px max-w-xs flex-1' />
        </div>

        {/* Tier 3: Children (Thẻ Con) */}
        <Card className='border-border/80 shadow-xs'>
          <CardHeader className='flex flex-row items-center justify-between pb-3'>
            <div className='space-y-0.5'>
              <div className='flex items-center gap-2'>
                <CardTitle className='text-sm font-semibold'>
                  {t('tags.hierarchy.children', 'Thẻ Con')}
                </CardTitle>
                <Badge
                  variant='outline'
                  className='font-mono text-xs tabular-nums'
                >
                  {children.length}
                </Badge>
              </div>
              <CardDescription className='text-xs'>
                {t(
                  'tags.hierarchy.childrenDesc',
                  'Các thẻ con cụ thể tự động được bao hàm khi mở rộng tìm kiếm thẻ này.'
                )}
              </CardDescription>
            </div>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={() => openDialog('child')}
              className='text-primary hover:text-primary hover:bg-primary/10 h-8 cursor-pointer gap-1.5 text-xs shadow-2xs'
            >
              <PlusIcon className='size-3.5' aria-hidden='true' />
              <span>Thêm Thẻ Con</span>
            </Button>
          </CardHeader>
          <CardContent>
            {children.length === 0 ? (
              <p className='text-muted-foreground py-2 text-xs italic'>
                {t(
                  'tags.hierarchy.leafNode',
                  'Thẻ lá (Leaf tag) — chưa có thẻ con trực thuộc.'
                )}
              </p>
            ) : (
              <div className='flex flex-wrap gap-2.5'>
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
                        className='text-muted-foreground hover:text-destructive ml-1 cursor-pointer rounded-xs p-0.5 transition-colors'
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

        {/* Tier 4: Associative & Disambiguation Relations */}
        <div className='grid gap-6 md:grid-cols-2'>
          {/* Related Tags */}
          <Card className='border-border/80 shadow-xs'>
            <CardHeader className='flex flex-row items-center justify-between pb-3'>
              <div className='space-y-0.5'>
                <div className='flex items-center gap-2'>
                  <Link2Icon
                    className='text-primary size-4'
                    aria-hidden='true'
                  />
                  <CardTitle className='text-sm font-semibold'>
                    {t('tags.hierarchy.related', 'Thẻ Liên Quan')}
                  </CardTitle>
                  <Badge
                    variant='outline'
                    className='font-mono text-xs tabular-nums'
                  >
                    {related.length}
                  </Badge>
                </div>
                <CardDescription className='text-xs'>
                  Liên kết ngữ nghĩa ngang hàng giữa các khái niệm.
                </CardDescription>
              </div>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() => openDialog('related')}
                className='text-primary hover:text-primary hover:bg-primary/10 h-8 cursor-pointer gap-1.5 text-xs shadow-2xs'
              >
                <PlusIcon className='size-3.5' aria-hidden='true' />
                <span>Thêm Liên Kết</span>
              </Button>
            </CardHeader>
            <CardContent>
              {related.length === 0 ? (
                <p className='text-muted-foreground py-2 text-xs italic'>
                  {t(
                    'tags.hierarchy.noRelated',
                    'Chưa có liên kết ngang hàng.'
                  )}
                </p>
              ) : (
                <div className='flex flex-wrap gap-2.5'>
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
                          className='text-muted-foreground hover:text-destructive ml-1 cursor-pointer rounded-xs p-0.5 transition-colors'
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

          {/* Disambiguation Tags */}
          <Card className='border-border/80 shadow-xs'>
            <CardHeader className='flex flex-row items-center justify-between pb-3'>
              <div className='space-y-0.5'>
                <div className='flex items-center gap-2'>
                  <SplitIcon
                    className='size-4 text-amber-500'
                    aria-hidden='true'
                  />
                  <CardTitle className='text-sm font-semibold'>
                    {t('tags.hierarchy.disambiguations', 'Phân Biệt Đồng Âm')}
                  </CardTitle>
                  <Badge
                    variant='outline'
                    className='font-mono text-xs tabular-nums'
                  >
                    {disambiguations.length}
                  </Badge>
                </div>
                <CardDescription className='text-xs'>
                  Các thẻ có từ ngữ tương đồng nhưng khác biệt ngữ cảnh.
                </CardDescription>
              </div>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() => openDialog('disambiguation')}
                className='text-primary hover:text-primary hover:bg-primary/10 h-8 cursor-pointer gap-1.5 text-xs shadow-2xs'
              >
                <PlusIcon className='size-3.5' aria-hidden='true' />
                <span>Thêm Đồng Âm</span>
              </Button>
            </CardHeader>
            <CardContent>
              {disambiguations.length === 0 ? (
                <p className='text-muted-foreground py-2 text-xs italic'>
                  {t(
                    'tags.hierarchy.noDisambiguations',
                    'Không có phân định đồng âm.'
                  )}
                </p>
              ) : (
                <div className='flex flex-wrap gap-2.5'>
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
                          className='text-muted-foreground hover:text-destructive ml-1 cursor-pointer rounded-xs p-0.5 transition-colors'
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
    </>
  )
}
