import React, { useCallback, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { FolderSearch, ImagePlus, InfoIcon, Loader2, XIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import http from '@/lib/http'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FilePickerDialog } from '@/pages/files/file-picker-dialog'
import { fileQueryKeys } from '@/pages/files/queries'
import { FormFieldHelp } from './form-field-help'

interface TagFeaturedImageInputProps {
  label: string
  urlValue: string
  onSelect: (payload: { url: string; fileId: string | null }) => void
  error?: string
  disabled?: boolean
  className?: string
  tooltip?: string
}

export function TagFeaturedImageInput({
  label,
  urlValue,
  onSelect,
  error,
  disabled = false,
  className,
  tooltip,
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
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-1.5'>
          <Label className='text-foreground text-xs font-semibold'>
            {label}
          </Label>
          {tooltip && <FormFieldHelp tooltip={tooltip} />}
        </div>
        <span className='text-muted-foreground inline-flex items-center gap-1 text-[11px]'>
          <InfoIcon className='size-3' aria-hidden='true' />
          {t(
            'tags.encyclopedia.fallbackNotice',
            'Automatic cross-locale image fallback'
          )}
        </span>
      </div>

      <div className='border-border/70 bg-muted/15 space-y-3.5 rounded-xl border p-4 shadow-2xs'>
        <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
          <Input
            placeholder={t(
              'imagePicker.urlOrLibraryPlaceholder',
              'https://... or choose from media library / upload file'
            )}
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
              className='h-9 flex-1 cursor-pointer px-3.5 text-xs font-semibold sm:flex-none'
              disabled={disabled}
              onClick={() => setIsPickerOpen(true)}
              title={t(
                'imagePicker.chooseFromGallery',
                'Choose from Media Library'
              )}
            >
              <FolderSearch
                className='text-primary size-4'
                aria-hidden='true'
              />
              <span>{t('imagePicker.browse', 'Browse Library')}</span>
            </Button>

            <Button
              type='button'
              variant='outline'
              size='sm'
              className='bg-background h-9 flex-1 cursor-pointer px-3.5 text-xs font-semibold sm:flex-none'
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || isUploading}
              title={t('imagePicker.uploadImage', 'Upload image file')}
            >
              {isUploading ? (
                <Loader2 className='size-4 animate-spin' aria-hidden='true' />
              ) : (
                <>
                  <ImagePlus className='size-4' aria-hidden='true' />
                  <span>{t('imagePicker.upload', 'Upload')}</span>
                </>
              )}
            </Button>
          </div>

          <input
            ref={fileInputRef}
            id='tag-featured-image-file'
            name='tag-featured-image-file'
            type='file'
            accept='image/*'
            className='hidden'
            onChange={handleFileUpload}
          />
        </div>

        {urlValue && (
          <div className='border-border/80 bg-background/80 relative flex items-center justify-center overflow-hidden rounded-xl border p-3 shadow-2xs'>
            <img
              src={urlValue}
              alt={t('imagePicker.previewAlt', 'Featured header preview')}
              className='max-h-64 w-auto max-w-full rounded-lg object-contain shadow-2xs transition-all'
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
              aria-label={t('buttons.remove', 'Remove')}
              disabled={disabled}
              className='bg-background/90 hover:bg-destructive absolute top-2.5 right-2.5 h-8 cursor-pointer gap-1.5 px-2.5 text-xs shadow-xs backdrop-blur-xs transition-colors hover:text-white'
              onClick={() => onSelect({ url: '', fileId: null })}
            >
              <XIcon className='size-3.5' aria-hidden='true' />
              <span>{t('buttons.remove', 'Remove')}</span>
            </Button>
          </div>
        )}
      </div>

      {error && <p className='text-destructive text-xs font-medium'>{error}</p>}

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
