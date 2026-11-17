import React, { useCallback, useEffect, useRef, useState } from 'react'
import { FolderSearch, ImageOff, ImagePlus, Loader2, XIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import http from '@/lib/http'
import { cn } from '@/lib/utils'
import { FilePickerDialog } from '@/pages/files/file-picker-dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'

type ImageStatus = 'idle' | 'loading' | 'loaded' | 'error'

type Props = {
  label: string
  value: string
  onChange: (value: string) => void
  error?: string
  required?: boolean
  className?: string
  placeholder?: string
  accept?: string
}

export function ImagePickerInput({
  label,
  value,
  onChange,
  error,
  required,
  className,
  placeholder = 'https://...',
  accept = 'image/*',
}: Props) {
  const { t } = useTranslation()
  const [isPickerOpen, setIsPickerOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [imageStatus, setImageStatus] = useState<ImageStatus>('idle')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const trimmed = value?.trim()
    if (!trimmed || !/^(https?:\/\/|blob:|data:image\/)/i.test(trimmed)) {
      setImageStatus('idle')
      return
    }

    let isCurrent = true
    const timer = setTimeout(() => {
      if (!isCurrent) return
      setImageStatus('loading')

      const img = new Image()
      img.src = trimmed
      img.onload = () => {
        if (isCurrent) setImageStatus('loaded')
      }
      img.onerror = () => {
        if (isCurrent) setImageStatus('error')
      }
    }, 200)

    return () => {
      isCurrent = false
      clearTimeout(timer)
    }
  }, [value])

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      setIsUploading(true)
      try {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('folder', 'cms') // you can adjust folder name if needed
        formData.append('disk', 'public')

        const res = await http.post<{ url: string }>(
          '/files/upload',
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        )

        if (res.data?.url) {
          onChange(res.data.url)
          toast.success(t('imagePicker.uploadSuccess'), {
            description: t('imagePicker.storedInLibrary', {
              defaultValue: 'File safely stored in your Media Library',
            }),
          })
        }
      } catch {
        toast.error(t('imagePicker.uploadFailed'))
      } finally {
        setIsUploading(false)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }
    },
    [onChange, t]
  )

  return (
    <div className={cn('space-y-2', className)}>
      <Label>
        {label}
        {required && <span className='text-destructive ms-1'>*</span>}
      </Label>

      <div className='flex flex-col gap-2'>
        <Input
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={!!error}
          className={cn(
            'w-full',
            error && 'border-destructive focus-visible:ring-destructive'
          )}
        />

        <div className='flex items-center gap-2'>
          <Button
            type='button'
            variant='secondary'
            className='flex-1'
            onClick={() => setIsPickerOpen(true)}
            title={t('imagePicker.chooseFromGallery')}
          >
            <FolderSearch className='mr-2 size-4' />
            {t('imagePicker.browse')}
          </Button>

          <Button
            type='button'
            variant='outline'
            className='flex-1'
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            title={t('imagePicker.uploadImage')}
          >
            {isUploading ? (
              <Loader2 className='size-4 animate-spin' />
            ) : (
              <>
                <ImagePlus className='mr-2 size-4' />
                {t('imagePicker.upload')}
              </>
            )}
          </Button>
        </div>

        <input
          ref={fileInputRef}
          id='image-picker-file-input'
          name='image-picker-file-input'
          type='file'
          accept='image/*'
          className='hidden'
          onChange={handleFileSelect}
        />
      </div>

      {/* Image Preview Block (State Machine: loading | error | loaded) */}
      {imageStatus === 'loading' && (
        <div className='bg-muted/20 text-muted-foreground relative mt-2 flex h-[140px] w-full flex-col items-center justify-center rounded-md border border-dashed'>
          <Loader2 className='text-primary size-6 animate-spin' />
          <span className='mt-2 text-xs'>
            {t('imagePicker.loading', 'Đang tải ảnh xem trước...')}
          </span>
        </div>
      )}

      {imageStatus === 'error' && (
        <div className='bg-destructive/5 border-destructive/20 relative mt-2 flex min-h-[110px] w-full flex-col items-center justify-center rounded-md border border-dashed p-4 text-center'>
          <ImageOff className='text-destructive/80 size-6' />
          <p className='text-destructive mt-1.5 text-xs font-medium'>
            {t('imagePicker.cannotLoadPreview', 'Không thể tải ảnh xem trước')}
          </p>
          <p className='text-muted-foreground mt-0.5 max-w-xs truncate text-[11px]'>
            {t(
              'imagePicker.invalidUrlOrNotFound',
              'Đường dẫn không tồn tại hoặc không phải là tệp ảnh hợp lệ'
            )}
          </p>
          <Button
            type='button'
            variant='ghost'
            size='icon'
            aria-label='Remove image'
            className='hover:bg-destructive/10 text-muted-foreground hover:text-destructive absolute top-2 right-2 size-7'
            onClick={() => onChange('')}
            title={t('common.delete', 'Xóa')}
          >
            <XIcon className='size-4' />
          </Button>
        </div>
      )}

      {imageStatus === 'loaded' && (
        <div className='bg-muted/10 relative mt-2 flex w-full items-center justify-center rounded-md border p-1'>
          <img
            src={value}
            alt='Preview'
            className='h-auto max-h-[200px] w-full rounded object-contain'
          />
          <Button
            type='button'
            variant='destructive'
            size='icon'
            aria-label='Remove image'
            className='absolute -top-2 -right-2 size-6 rounded-full shadow-sm'
            onClick={() => onChange('')}
            title={t('common.delete', 'Xóa')}
          >
            <XIcon className='size-3' />
          </Button>
        </div>
      )}

      {error && <p className='text-destructive text-sm'>{error}</p>}

      <FilePickerDialog
        mode='url'
        multiple={false}
        accept={accept}
        value={value || null}
        open={isPickerOpen}
        onOpenChange={setIsPickerOpen}
        onValueChange={(url) => {
          if (url) onChange(url)
        }}
      />
    </div>
  )
}
