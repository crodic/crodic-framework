import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AxiosError } from 'axios'
import { useQueryClient } from '@tanstack/react-query'
import { RestQueryBuilder } from '@repo/query-builder'
import {
  Check,
  Folder,
  LayoutGrid,
  List,
  Loader2,
  Plus,
  SearchIcon,
  Upload,
  UploadCloud,
  X,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { restApiErrorHandler } from '@/lib/rest-api-handler'
import { cn } from '@/lib/utils'
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
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatBytes } from './columns'
import { FilePreviewThumbnail } from './file-preview'
import {
  apiCreateFolder,
  apiUploadFile,
  fileQueryKeys,
  useDataFileFolders,
  useDataFileOverview,
  useInfiniteDataFileOverview,
} from './queries'
import type { FileSchema, FolderSchema } from './schema'

export type AcceptSpec = {
  acceptString: string
  label: string
  primaryResourceType?: 'image' | 'video' | 'audio' | 'document'
  isMatch: (file: { mime?: string | null; original_name?: string }) => boolean
}

export function parseAcceptSpec(accept?: string | string[]): AcceptSpec | null {
  if (!accept) return null

  const items = (Array.isArray(accept) ? accept : accept.split(','))
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)

  if (items.length === 0) return null

  const acceptString = items.join(',')

  const isAllImages = items.every(
    (item) =>
      item === 'image/*' ||
      item.startsWith('image/') ||
      ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg', '.avif', '.ico'].some(
        (ext) => item.endsWith(ext)
      )
  )
  const isAllVideos = items.every(
    (item) =>
      item === 'video/*' ||
      item.startsWith('video/') ||
      ['.mp4', '.webm', '.ogg', '.mov', '.mkv'].some((ext) =>
        item.endsWith(ext)
      )
  )
  const isAllAudio = items.every(
    (item) =>
      item === 'audio/*' ||
      item.startsWith('audio/') ||
      ['.mp3', '.wav', '.ogg', '.m4a', '.flac'].some((ext) =>
        item.endsWith(ext)
      )
  )
  const isAllDocs = items.every(
    (item) =>
      item === 'application/pdf' ||
      [
        '.pdf',
        '.doc',
        '.docx',
        '.xls',
        '.xlsx',
        '.ppt',
        '.pptx',
        '.txt',
        '.csv',
      ].some((ext) => item.endsWith(ext))
  )

  const resolvePrimaryCategory = (): {
    primaryResourceType?: 'image' | 'video' | 'audio' | 'document'
    label: string
  } => {
    if (isAllImages) return { primaryResourceType: 'image', label: 'Images' }
    if (isAllVideos) return { primaryResourceType: 'video', label: 'Videos' }
    if (isAllAudio) return { primaryResourceType: 'audio', label: 'Audio' }
    if (isAllDocs)
      return { primaryResourceType: 'document', label: 'Documents' }
    return { label: acceptString }
  }

  const { primaryResourceType, label } = resolvePrimaryCategory()

  const isMatch = (file: { mime?: string | null; original_name?: string }) => {
    const fileMime = (file.mime ?? '').toLowerCase()
    const fileName = (file.original_name ?? '').toLowerCase()

    return items.some((pattern) => {
      if (pattern.endsWith('/*')) {
        const prefix = pattern.slice(0, -2)
        return fileMime.startsWith(`${prefix}/`)
      }
      if (pattern.startsWith('.')) {
        return fileName.endsWith(pattern)
      }
      if (pattern.includes('/')) {
        return fileMime === pattern
      }
      return fileName.endsWith(`.${pattern}`)
    })
  }

  return {
    acceptString,
    label,
    primaryResourceType,
    isMatch,
  }
}

type FilePickerBaseProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description?: string
  resourceType?: string
  accept?: string | string[]
  multiple?: boolean
}

export type FilePickerDialogProps =
  | (FilePickerBaseProps & {
      mode: 'file'
      multiple?: false
      value?: FileSchema | null
      onValueChange: (value: FileSchema | null) => void
    })
  | (FilePickerBaseProps & {
      mode: 'file'
      multiple: true
      value?: FileSchema[]
      onValueChange: (value: FileSchema[]) => void
    })
  | (FilePickerBaseProps & {
      mode: 'url'
      multiple?: false
      value?: string | null
      onValueChange: (value: string | null, file?: FileSchema) => void
    })
  | (FilePickerBaseProps & {
      mode: 'url'
      multiple: true
      value?: string[]
      onValueChange: (value: string[], files: FileSchema[]) => void
    })

export function FilePickerDialog(props: FilePickerDialogProps) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const multiple = props.multiple === true

  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [activeFolder, setActiveFolder] = useState<string | null>(null)
  const [targetUploadFolder, setTargetUploadFolder] =
    useState<string>('__root__')
  const [selectedFiles, setSelectedFiles] = useState<FileSchema[]>([])
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  const loadMoreRef = useRef<HTMLDivElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const dragCounterRef = useRef(0)

  // Parse accept specification
  const acceptSpec = useMemo(
    () => parseAcceptSpec(props.accept),
    [props.accept]
  )

  // Debounce search input by 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  // Reset or pre-populate initial selection when dialog opens
  useEffect(() => {
    if (!props.open) {
      dragCounterRef.current = 0
      setIsDragging(false)
      return
    }

    if (!props.value || props.mode !== 'file') return

    const initialFiles = Array.isArray(props.value)
      ? (props.value as FileSchema[])
      : [props.value as FileSchema]
    setSelectedFiles(initialFiles)
  }, [props.open, props.mode, props.value])

  const effectiveResourceType =
    props.resourceType ?? acceptSpec?.primaryResourceType

  const params = useMemo(() => {
    const builder = new RestQueryBuilder()
      .limit(32)
      .sortBy('createdAt', 'desc')
      .search(search)

    if (effectiveResourceType) {
      builder.filter('resource_type', effectiveResourceType)
    }

    if (activeFolder) {
      builder.filter('folder', activeFolder)
    }

    return builder.build()
  }, [activeFolder, effectiveResourceType, search])

  // Total across all folders (including root) — only needs meta.totalItems
  const allFilesParams = useMemo(() => {
    const builder = new RestQueryBuilder().limit(1).search(search)
    if (effectiveResourceType) {
      builder.filter('resource_type', effectiveResourceType)
    }
    return builder.build()
  }, [effectiveResourceType, search])

  const { data, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage } =
    useInfiniteDataFileOverview(params)
  const { data: folders = [] } = useDataFileFolders()
  const { data: allFilesData } = useDataFileOverview(allFilesParams, {
    enabled: props.open,
  })

  const rawFiles = useMemo(
    () => data?.pages.flatMap((page) => page.data) ?? [],
    [data]
  )

  // Filter client-side if acceptSpec requires specific mime/extension matching
  const files = useMemo(() => {
    if (!acceptSpec) return rawFiles
    return rawFiles.filter((file) => acceptSpec.isMatch(file))
  }, [rawFiles, acceptSpec])

  const currentPage = data?.pages[data.pages.length - 1]
  const visibleTotal = currentPage?.meta.totalItems ?? 0
  const allFilesCount = allFilesData?.meta.totalItems ?? 0

  // Match URL-based pre-selection with fetched files once loaded
  useEffect(() => {
    if (!props.open || props.mode !== 'url' || !props.value) return

    if (Array.isArray(props.value)) {
      const urls = new Set(props.value as string[])
      const matched = files.filter((f) => urls.has(f.url))
      if (matched.length === 0) return

      setSelectedFiles((current) => {
        const currentIds = new Set(current.map((c) => c.public_id))
        const toAdd = matched.filter((m) => !currentIds.has(m.public_id))
        return toAdd.length > 0 ? [...current, ...toAdd] : current
      })
      return
    }

    const url = props.value as string
    const matched = files.find((f) => f.url === url)
    if (!matched) return

    setSelectedFiles((current) =>
      current.some((c) => c.public_id === matched.public_id)
        ? current
        : [matched]
    )
  }, [props.open, props.mode, props.value, files])

  // Infinite scroll observer
  useEffect(() => {
    const target = loadMoreRef.current
    if (!target) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          void fetchNextPage()
        }
      },
      { rootMargin: '240px' }
    )

    observer.observe(target)
    return () => observer.disconnect()
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, files.length])

  const handleFolderSelect = (folder: string | null) => {
    setActiveFolder(folder)
    setTargetUploadFolder(folder ?? '__root__')
    setSearchInput('')
    setSearch('')
  }

  const handleCreateFolder = async (folderName: string) => {
    try {
      const targetFolder =
        activeFolder &&
        !folderName.startsWith(`${activeFolder}/`) &&
        !folderName.includes('/')
          ? `${activeFolder}/${folderName}`
          : folderName
      await apiCreateFolder({ folder: targetFolder })
      void queryClient.invalidateQueries({ queryKey: fileQueryKeys.folders })
      setActiveFolder(targetFolder)
      setTargetUploadFolder(targetFolder)
      toast.success(
        t('files.folders.createSuccess', 'Folder created successfully')
      )
    } catch (err) {
      if (err instanceof AxiosError) {
        restApiErrorHandler(err)
        return
      }

      toast.error(
        err instanceof Error ? err.message : 'Failed to create folder'
      )
    }
  }

  const toggleFile = (file: FileSchema) => {
    setSelectedFiles((current) => {
      const exists = current.some((item) => item.public_id === file.public_id)

      if (!multiple) {
        return exists ? [] : [file]
      }

      if (exists) {
        return current.filter((item) => item.public_id !== file.public_id)
      }

      return [...current, file]
    })
  }

  // Upload handler with explicit target folder support
  const handleUploadFiles = useCallback(
    async (uploadedFileList: File[]) => {
      if (uploadedFileList.length === 0) return

      // Validate accept
      if (acceptSpec) {
        const invalidFile = uploadedFileList.find(
          (file) =>
            !acceptSpec.isMatch({
              mime: file.type,
              original_name: file.name,
            })
        )
        if (invalidFile) {
          toast.error(
            t('files.picker.invalidType', {
              types: acceptSpec.label,
            })
          )
          return
        }
      }

      const uploadFolder =
        targetUploadFolder === '__root__' ? null : targetUploadFolder
      const folderDisplayName = uploadFolder ?? t('files.folders.root', 'Root')

      setIsUploading(true)
      const toastId = toast.loading(
        t('files.picker.uploading', { count: uploadedFileList.length })
      )

      try {
        const newlyUploaded: FileSchema[] = []

        for (const file of uploadedFileList) {
          const uploaded = await apiUploadFile({
            file,
            folder: uploadFolder,
            optimize: true,
          })
          newlyUploaded.push(uploaded)
        }

        toast.success(
          t('files.picker.uploadedToFolder', {
            count: newlyUploaded.length,
            folder: folderDisplayName,
          }),
          { id: toastId }
        )

        // Invalidate queries so the new files appear in the library
        void queryClient.invalidateQueries({ queryKey: fileQueryKeys.all })
        void queryClient.invalidateQueries({ queryKey: fileQueryKeys.folders })

        // Switch to the folder where file was uploaded if not already there
        if (activeFolder !== uploadFolder) {
          setActiveFolder(uploadFolder)
        }

        // Auto-select the newly uploaded file(s)
        setSelectedFiles((current) => {
          if (!multiple) {
            return [newlyUploaded[0]]
          }
          const currentIds = new Set(current.map((c) => c.public_id))
          const filteredNew = newlyUploaded.filter(
            (item) => !currentIds.has(item.public_id)
          )
          return [...filteredNew, ...current]
        })
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Upload failed'
        toast.error(message, { id: toastId })
      } finally {
        setIsUploading(false)
      }
    },
    [acceptSpec, activeFolder, multiple, queryClient, t, targetUploadFolder]
  )

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = Array.from(e.target.files ?? [])
    if (fileList.length > 0) {
      void handleUploadFiles(fileList)
    }
    e.target.value = ''
  }

  // Drag & drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounterRef.current += 1
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounterRef.current -= 1
    if (dragCounterRef.current <= 0) {
      dragCounterRef.current = 0
      setIsDragging(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounterRef.current = 0
    setIsDragging(false)

    const droppedFiles = Array.from(e.dataTransfer.files)
    if (droppedFiles.length > 0) {
      void handleUploadFiles(droppedFiles)
    }
  }

  const emitSelectionChange = () => {
    if (props.mode === 'url' && props.multiple === true) {
      props.onValueChange(
        selectedFiles.map((file) => file.url),
        selectedFiles
      )
      return
    }
    if (props.mode === 'url') {
      const [file] = selectedFiles
      props.onValueChange(file?.url ?? null, file)
      return
    }
    if (props.multiple === true) {
      props.onValueChange(selectedFiles)
      return
    }
    props.onValueChange(selectedFiles[0] ?? null)
  }

  const handleConfirm = () => {
    if (selectedFiles.length === 0) return

    emitSelectionChange()
    setSelectedFiles([])
    props.onOpenChange(false)
  }

  const renderLoadMoreStatus = () => {
    if (isFetchingNextPage) {
      return (
        <>
          <Loader2 className='size-3.5 animate-spin' />
          {t('files.picker.loadingMore')}
        </>
      )
    }
    if (hasNextPage) {
      return t('files.picker.loadMoreHint', {
        count: files.length,
        total: visibleTotal,
      })
    }
    return t('files.picker.loadedAll', {
      count: files.length,
      total: visibleTotal,
    })
  }

  const currentUploadFolderLabel =
    targetUploadFolder === '__root__'
      ? t('files.folders.root', 'Root')
      : targetUploadFolder

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent
        className='flex h-[min(90vh,900px)] flex-col sm:max-w-5xl lg:max-w-6xl'
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {/* Hidden native input for direct upload */}
        <input
          ref={fileInputRef}
          id='file-picker-direct-upload'
          name='file-picker-direct-upload'
          type='file'
          accept={acceptSpec?.acceptString}
          multiple={multiple}
          className='hidden'
          onChange={handleFileInputChange}
        />

        {/* Drag & Drop Visual Overlay */}
        {isDragging && (
          <div className='bg-background/85 pointer-events-none absolute inset-0 z-50 flex flex-col items-center justify-center gap-3 backdrop-blur-xs'>
            <UploadCloud className='text-primary size-10 animate-bounce' />
            <p className='text-base font-semibold'>
              {t('files.picker.dropzoneTitle', 'Drop files to upload')}
            </p>
            <p className='text-muted-foreground text-sm'>
              {t('files.picker.dropzoneSubtitle', {
                folder: currentUploadFolderLabel,
              })}
            </p>
          </div>
        )}

        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            {props.title ?? t('files.picker.title')}
            {acceptSpec && (
              <Badge variant='secondary'>{acceptSpec.label}</Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            {props.description ?? t('files.picker.description')}
          </DialogDescription>
        </DialogHeader>

        {/* Toolbar */}
        <div className='flex flex-wrap items-center gap-2'>
          <div className='relative min-w-48 flex-1 sm:max-w-sm'>
            <SearchIcon className='text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2' />
            <Input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder={t('files.picker.search')}
              className='pl-9'
            />
          </div>
          {searchInput && (
            <Button
              type='button'
              variant='ghost'
              size='icon'
              onClick={() => {
                setSearchInput('')
                setSearch('')
              }}
              aria-label={t('dataTable.filter.clear', 'Clear search')}
            >
              <X />
            </Button>
          )}

          <div className='ml-auto flex items-center gap-2'>
            <Select
              value={targetUploadFolder}
              onValueChange={setTargetUploadFolder}
            >
              <SelectTrigger
                className='w-40'
                aria-label={t('files.picker.uploadTo', 'Upload to:')}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='__root__'>
                  📁 {t('files.folders.root', 'Root')}
                </SelectItem>
                {folders.map((f) => {
                  const depth = f.depth ?? f.folder.split('/').length - 1
                  const displayName =
                    f.name ?? f.folder.split('/').pop() ?? f.folder
                  return (
                    <SelectItem
                      key={f.folder}
                      value={f.folder}
                      style={{ paddingLeft: `${8 + depth * 12}px` }}
                      title={f.folder}
                    >
                      📁 {displayName}
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
            <Button
              type='button'
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
            >
              {isUploading ? <Loader2 className='animate-spin' /> : <Upload />}
              {t('files.picker.upload', 'Upload')}
            </Button>
            <Button
              type='button'
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size='icon'
              onClick={() => setViewMode('grid')}
              title={t('files.view.grid')}
              aria-label={t('files.view.grid')}
            >
              <LayoutGrid />
            </Button>
            <Button
              type='button'
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size='icon'
              onClick={() => setViewMode('list')}
              title={t('files.view.table')}
              aria-label={t('files.view.table')}
            >
              <List />
            </Button>
          </div>
        </div>

        {/* Content Body: Sidebar + File List */}
        <div className='grid min-h-0 flex-1 grid-cols-1 overflow-hidden rounded-lg border md:grid-cols-[220px_minmax(0,1fr)]'>
          <FilePickerFolderPane
            folders={folders}
            activeFolder={activeFolder}
            allFilesCount={allFilesCount}
            onSelect={handleFolderSelect}
            onCreateFolder={handleCreateFolder}
          />

          <div className='relative min-h-0 overflow-hidden'>
            <ScrollArea className='h-full'>
              {viewMode === 'grid' ? (
                <div className='grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 lg:grid-cols-4'>
                  {files.map((file) => {
                    const selected = selectedFiles.some(
                      (item) => item.public_id === file.public_id
                    )
                    return (
                      <button
                        key={file.public_id}
                        type='button'
                        className={cn(
                          'group bg-card text-card-foreground hover:border-primary/60 relative flex flex-col overflow-hidden rounded-xl border text-left transition-all duration-150',
                          selected
                            ? 'border-primary ring-primary/30 shadow-md ring-2'
                            : 'border-border/80 hover:shadow-xs'
                        )}
                        onClick={() => toggleFile(file)}
                      >
                        {/* Thumbnail Stage */}
                        <div className='bg-muted/50 relative flex aspect-4/3 w-full items-center justify-center overflow-hidden'>
                          <FilePreviewThumbnail file={file} />

                          {/* Selection Checkmark */}
                          {selected && (
                            <span className='bg-primary text-primary-foreground ring-background absolute top-2 right-2 flex size-5 items-center justify-center rounded-full shadow-xs ring-2'>
                              <Check className='size-3 stroke-[2.5]' />
                            </span>
                          )}

                          {/* Disk Badge */}
                          {file.disk && (
                            <span className='bg-background/80 text-muted-foreground py-0.2 absolute bottom-1.5 left-1.5 rounded px-1 font-mono text-[9px] uppercase backdrop-blur-xs'>
                              {file.disk}
                            </span>
                          )}
                        </div>

                        {/* Card Info */}
                        <div className='space-y-0.5 p-2.5'>
                          <p
                            className='truncate text-xs font-semibold'
                            title={file.original_name}
                          >
                            {file.original_name}
                          </p>
                          <div className='text-muted-foreground flex items-center justify-between text-[11px]'>
                            <span className='truncate'>
                              {file.folder ?? t('files.folders.root')}
                            </span>
                            <span className='shrink-0 font-mono font-medium'>
                              {formatBytes(file.size)}
                            </span>
                          </div>
                        </div>
                      </button>
                    )
                  })}

                  {!isFetching && files.length === 0 && (
                    <div className='text-muted-foreground col-span-full py-16 text-center text-xs'>
                      <div className='border-border/60 bg-muted/30 mx-auto mb-2 flex size-12 items-center justify-center rounded-2xl border'>
                        <UploadCloud className='text-muted-foreground/60 size-6' />
                      </div>
                      <p className='text-foreground text-sm font-medium'>
                        {t('files.picker.empty')}
                      </p>
                      <p className='text-muted-foreground mt-1'>
                        {t('files.picker.dropzoneSubtitle', {
                          folder: currentUploadFolderLabel,
                        })}
                      </p>
                    </div>
                  )}

                  {files.length > 0 && (
                    <div
                      ref={loadMoreRef}
                      className='text-muted-foreground col-span-full flex min-h-12 items-center justify-center gap-2 text-xs'
                    >
                      {renderLoadMoreStatus()}
                    </div>
                  )}
                </div>
              ) : (
                /* List View */
                <div className='divide-border/60 flex flex-col divide-y p-3'>
                  {files.map((file) => {
                    const selected = selectedFiles.some(
                      (item) => item.public_id === file.public_id
                    )
                    return (
                      <button
                        key={file.public_id}
                        type='button'
                        className={cn(
                          'hover:bg-muted/60 flex items-center gap-3 rounded-lg p-2 text-left transition-colors',
                          selected && 'bg-primary/5'
                        )}
                        onClick={() => toggleFile(file)}
                      >
                        <div className='bg-muted/50 border-border/80 relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-md border'>
                          <FilePreviewThumbnail file={file} />
                          {selected && (
                            <span className='bg-primary text-primary-foreground ring-background absolute top-1 right-1 flex size-4 items-center justify-center rounded-full ring-1'>
                              <Check className='size-2.5' />
                            </span>
                          )}
                        </div>
                        <div className='min-w-0 flex-1'>
                          <p className='truncate text-xs font-semibold'>
                            {file.original_name}
                          </p>
                          <div className='text-muted-foreground flex items-center gap-2 text-[11px]'>
                            <span>
                              {file.folder ?? t('files.folders.root')}
                            </span>
                            <span>•</span>
                            <span className='font-mono'>
                              {formatBytes(file.size)}
                            </span>
                            {file.mime && (
                              <>
                                <span>•</span>
                                <span className='font-mono'>{file.mime}</span>
                              </>
                            )}
                          </div>
                        </div>
                        {file.disk && (
                          <Badge
                            variant='outline'
                            className='shrink-0 font-mono text-[10px] uppercase'
                          >
                            {file.disk}
                          </Badge>
                        )}
                      </button>
                    )
                  })}

                  {!isFetching && files.length === 0 && (
                    <div className='text-muted-foreground py-16 text-center text-xs'>
                      {t('files.picker.empty')}
                    </div>
                  )}

                  {files.length > 0 && (
                    <div
                      ref={loadMoreRef}
                      className='text-muted-foreground flex min-h-10 items-center justify-center gap-2 py-3 text-xs'
                    >
                      {renderLoadMoreStatus()}
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>

        <DialogFooter className='sm:items-center sm:justify-between'>
          <div className='flex items-center gap-2'>
            {selectedFiles.length > 0 ? (
              <>
                <Badge variant='secondary'>
                  {t('files.picker.selectedCount', {
                    count: selectedFiles.length,
                  })}
                </Badge>
                <Button
                  type='button'
                  variant='ghost'
                  size='sm'
                  onClick={() => setSelectedFiles([])}
                >
                  {t('files.picker.clearSelection', 'Clear selection')}
                </Button>
              </>
            ) : (
              <span className='text-muted-foreground text-sm'>
                {activeFolder ?? t('files.folders.all', 'All files')}
              </span>
            )}
          </div>

          <div className='flex items-center gap-2'>
            <Button variant='outline' onClick={() => props.onOpenChange(false)}>
              {t('buttons.cancel')}
            </Button>
            <Button
              disabled={selectedFiles.length === 0}
              onClick={handleConfirm}
            >
              {multiple
                ? t('files.picker.selectCount', {
                    count: selectedFiles.length,
                  })
                : t('files.picker.select')}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function FilePickerFolderPane({
  folders,
  activeFolder,
  allFilesCount,
  onSelect,
  onCreateFolder,
}: {
  folders: FolderSchema[]
  activeFolder: string | null
  allFilesCount: number
  onSelect: (folder: string | null) => void
  onCreateFolder?: (folder: string) => Promise<void>
}) {
  const { t } = useTranslation()
  const [isCreating, setIsCreating] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleCreate = async () => {
    const trimmed = newFolderName.trim()
    if (!trimmed || !onCreateFolder) return
    setIsSubmitting(true)
    try {
      await onCreateFolder(trimmed)
      setNewFolderName('')
      setIsCreating(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <aside className='flex max-h-40 min-h-0 flex-col gap-1 border-b p-2 md:max-h-none md:border-r md:border-b-0'>
      <div className='flex items-center justify-between px-2 py-1'>
        <h3 className='text-muted-foreground text-xs font-semibold tracking-wider uppercase'>
          {t('files.folders.title')}
        </h3>
        <div className='flex items-center gap-1'>
          <Badge variant='secondary'>{folders.length}</Badge>
          {onCreateFolder && (
            <Button
              type='button'
              variant='ghost'
              size='icon-xs'
              onClick={() => setIsCreating((prev) => !prev)}
              title={t('files.picker.newFolder', 'New folder')}
              aria-label={t('files.picker.newFolder', 'New folder')}
            >
              <Plus />
            </Button>
          )}
        </div>
      </div>

      {isCreating && (
        <div className='flex items-center gap-1 p-1'>
          <Input
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') void handleCreate()
              if (e.key === 'Escape') setIsCreating(false)
            }}
            placeholder='Folder name...'
            autoFocus
          />
          <Button
            type='button'
            size='icon'
            disabled={!newFolderName.trim() || isSubmitting}
            onClick={() => void handleCreate()}
            aria-label={t('buttons.save', 'Create folder')}
          >
            {isSubmitting ? <Loader2 className='animate-spin' /> : <Check />}
          </Button>
        </div>
      )}

      <Button
        type='button'
        variant={activeFolder === null ? 'secondary' : 'ghost'}
        className='justify-start'
        onClick={() => onSelect(null)}
      >
        <Folder />
        <span className='min-w-0 flex-1 truncate text-left'>
          {t('files.folders.all')}
        </span>
        <span className='text-muted-foreground text-xs'>{allFilesCount}</span>
      </Button>

      <ScrollArea className='min-h-0 flex-1'>
        <div className='flex flex-col gap-1'>
          {folders.map((folder) => {
            const depth = folder.depth ?? folder.folder.split('/').length - 1
            const displayName =
              folder.name ?? folder.folder.split('/').pop() ?? folder.folder

            return (
              <Button
                key={folder.folder}
                type='button'
                variant={activeFolder === folder.folder ? 'secondary' : 'ghost'}
                style={{ paddingLeft: `${12 + depth * 12}px` }}
                className='justify-start'
                title={folder.folder}
                onClick={() => onSelect(folder.folder)}
              >
                <Folder />
                <span className='min-w-0 flex-1 truncate text-left'>
                  {displayName}
                </span>
                <span className='text-muted-foreground text-xs'>
                  {folder.count}
                </span>
              </Button>
            )
          })}
        </div>
      </ScrollArea>
    </aside>
  )
}
