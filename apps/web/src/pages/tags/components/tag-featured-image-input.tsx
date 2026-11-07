import React, { useCallback, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { FolderSearch, ImagePlus, Loader2, XIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import http from '@/lib/http'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FilePickerDialog } from '@/pages/files/file-picker-dialog'
import { fileQueryKeys } from '@/pages/files/queries'

interface TagFeaturedImageInputProps {
  label: string
  urlValue: string
  onSelect: (payload: { url: string; fileId: string | null }) => void
  error?: string
  disabled?: boolean
  className?: string
}

export function TagFeaturedImageInput({
  label,
  urlValue,
  onSelect,
  error,
  disabled = false,
  className,
}: TagFeaturedImageInputProps) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [isPickerOpen, setIsPickerOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      setIsUploading(true)
      try {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('folder', 'tags')
        formData.append('disk', 'public')

        const res = await http.post<{ id?: string; url?: string }>(
          '/files/upload',
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        )

        if (res.data?.url) {
          onSelect({
            url: res.data.url,
            fileId: res.data.id ? String(res.data.id) : null,
          })
          await queryClient.invalidateQueries({ queryKey: fileQueryKeys.all })
          toast.success(
            t('imagePicker.uploadSuccess', 'Image uploaded successfully'),
            {
              description: t(
                'imagePicker.storedInLibrary',
                'File safely stored in your Media Library'
              ),
            }
          )
        }
      } catch {
        toast.error(t('imagePicker.uploadFailed', 'Failed to upload image'))
      } finally {
        setIsUploading(false)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }
    },
    [onSelect, queryClient, t]
  )

  return (
    <div className={cn('space-y-2', className)}>
      <Label className='text-sm font-medium'>{label}</Label>

      <div className='bg-muted/15 space-y-3 rounded-xl border p-3.5'>
        <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
          <Input
            placeholder='https://... or choose from library / upload'
            value={urlValue}
            disabled={disabled}
            onChange={(e) =>
              onSelect({
                url: e.target.value,
                fileId: null,
              })
            }
            aria-invalid={Boolean(error)}
            className={cn(
              'bg-background h-9 flex-1 font-mono text-xs',
              error && 'border-destructive focus-visible:ring-destructive'
            )}
          />

          <div className='flex shrink-0 items-center gap-2'>
            <Button
              type='button'
              variant='secondary'
              size='sm'
              className='h-9 flex-1 px-3 sm:flex-none'
              disabled={disabled}
              onClick={() => setIsPickerOpen(true)}
              title={t(
                'imagePicker.chooseFromGallery',
                'Choose from Media Library'
              )}
            >
              <FolderSearch className='size-4' aria-hidden='true' />
              {t('imagePicker.browse', 'Browse')}
            </Button>

            <Button
              type='button'
              variant='outline'
              size='sm'
              className='bg-background h-9 flex-1 px-3 sm:flex-none'
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || isUploading}
              title={t('imagePicker.uploadImage', 'Upload image')}
            >
              {isUploading ? (
                <Loader2 className='size-4 animate-spin' aria-hidden='true' />
              ) : (
                <>
                  <ImagePlus className='size-4' aria-hidden='true' />
                  {t('imagePicker.upload', 'Upload')}
                </>
              )}
            </Button>
          </div>

          <input
            ref={fileInputRef}
            type='file'
            accept='image/*'
            className='hidden'
            onChange={handleFileUpload}
          />
        </div>

        {urlValue && (
          <div className='bg-background relative overflow-hidden rounded-lg border'>
            <img
              src={urlValue}
              alt='Featured header preview'
              className='aspect-[21/9] max-h-44 w-full object-cover'
              onError={(e) => {
                ;(e.target as HTMLImageElement).style.display = 'none'
              }}
              onLoad={(e) => {
                ;(e.target as HTMLImageElement).style.display = 'block'
              }}
            />
            <Button
              type='button'
              variant='secondary'
              size='sm'
              aria-label='Remove featured image'
              disabled={disabled}
              className='bg-background/90 hover:bg-destructive hover:text-destructive-foreground absolute top-2.5 right-2.5 h-7 gap-1 px-2.5 text-xs shadow-xs backdrop-blur-xs transition-colors'
              onClick={() => onSelect({ url: '', fileId: null })}
            >
              <XIcon className='size-3.5' aria-hidden='true' />
              {t('buttons.remove', 'Remove')}
            </Button>
          </div>
        )}
      </div>

      {error && <p className='text-destructive text-xs'>{error}</p>}

      <FilePickerDialog
        mode='url'
        multiple={false}
        accept='image/*'
        value={urlValue || null}
        open={isPickerOpen}
        onOpenChange={setIsPickerOpen}
        onValueChange={(url, file) => {
          onSelect({
            url: url ?? '',
            fileId: file?.id ? String(file.id) : null,
          })
        }}
      />
    </div>
  )
}
