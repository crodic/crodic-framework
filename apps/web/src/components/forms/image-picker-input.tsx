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
  const [imageError, setImageError] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setImageError(false)
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

      <div className='flex items-center gap-2'>
        <Input
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={!!error}
          className={cn(
            'flex-1',
            error && 'border-destructive focus-visible:ring-destructive'
          )}
        />

        <Button
          type='button'
          variant='secondary'
          size='sm'
          className='shrink-0'
          onClick={() => setIsPickerOpen(true)}
          title={t('imagePicker.chooseFromGallery', 'Chọn từ thư viện')}
        >
          <FolderSearch className='mr-1.5 size-4' />
          {t('imagePicker.browse', 'Duyệt')}
        </Button>

        <Button
          type='button'
          variant='outline'
          size='sm'
          className='shrink-0'
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          title={t('imagePicker.uploadImage', 'Tải ảnh')}
        >
          {isUploading ? (
            <Loader2 className='size-4 animate-spin' />
          ) : (
            <>
              <ImagePlus className='mr-1.5 size-4' />
              {t('imagePicker.upload', 'Tải lên')}
            </>
          )}
        </Button>

        <input
          ref={fileInputRef}
          id='image-picker-file-input'
          name='image-picker-file-input'
          type='file'
          accept={accept}
          className='hidden'
          onChange={handleFileSelect}
        />
      </div>

      {/* Image Preview Card */}
      {value && (
        <div className='bg-muted/40 relative mt-2 flex items-center gap-3 rounded-lg border p-2 text-xs'>
          <div className='border-border/60 bg-background relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-md border'>
            {imageError ? (
              <ImageOff className='text-muted-foreground/60 size-5' />
            ) : (
              <img
                src={value}
                alt='Preview'
                className='h-full w-full object-cover'
                onError={() => setImageError(true)}
                onLoad={() => setImageError(false)}
              />
            )}
          </div>
          <div className='min-w-0 flex-1'>
            <p className='text-foreground truncate font-medium'>{value}</p>
            <p className='text-muted-foreground mt-0.5 text-[11px]'>
              {imageError
                ? t(
                    'imagePicker.cannotLoadPreview',
                    'Không thể tải ảnh xem trước'
                  )
                : t('imagePicker.imageLoaded', 'Ảnh xem trước khả dụng')}
            </p>
          </div>
          <Button
            type='button'
            variant='ghost'
            size='icon'
            aria-label='Remove image'
            className='text-muted-foreground hover:text-destructive size-7 shrink-0'
            onClick={() => onChange('')}
            title={t('common.delete', 'Xóa')}
          >
            <XIcon className='size-4' />
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
