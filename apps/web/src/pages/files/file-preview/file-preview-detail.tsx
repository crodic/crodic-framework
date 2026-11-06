import { lazy, Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import type { FileSchema } from '../schema'
import { DocumentPreviewViewer } from './document-preview-viewer'
import { ImagePreviewViewer } from './image-preview-viewer'
import {
  isPreviewableAudio,
  isPreviewableImage,
  isPreviewableVideo,
} from './preview-utils'

const AudioMediaPlayer = lazy(() =>
  import('./audio-media-player').then((m) => ({ default: m.AudioMediaPlayer }))
)
const VideoMediaPlayer = lazy(() =>
  import('./video-media-player').then((m) => ({ default: m.VideoMediaPlayer }))
)

export function FilePreviewDetail({
  file,
  url,
  className,
}: {
  file: FileSchema
  url?: string
  className?: string
}) {
  const previewUrl = url ?? file.url

  if (isPreviewableVideo(file)) {
    return (
      <Suspense fallback={<Skeleton className='h-64 w-full rounded-xl' />}>
        <VideoMediaPlayer src={previewUrl} className={className} />
      </Suspense>
    )
  }

  if (isPreviewableAudio(file)) {
    return (
      <Suspense fallback={<Skeleton className='h-48 w-full rounded-xl' />}>
        <AudioMediaPlayer
          src={previewUrl}
          title={file.original_name}
          className={className}
        />
      </Suspense>
    )
  }

  if (isPreviewableImage(file)) {
    return (
      <ImagePreviewViewer
        src={previewUrl}
        alt={file.original_name}
        className={className}
      />
    )
  }

  return (
    <DocumentPreviewViewer file={file} url={previewUrl} className={className} />
  )
}
