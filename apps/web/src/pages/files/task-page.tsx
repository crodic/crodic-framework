import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Navigate, useNavigate, useSearchParams } from 'react-router'
import { useAuthStore } from '@/stores/auth-store'
import { RecordPage } from '@/components/layout/record-page'
import { FileInspector } from './components/file-inspector'
import { PreviewDialog } from './components/preview-dialog'
import { RenameFileDialog } from './components/rename-file-dialog'
import { apiGetFileByPublicId, useDataFileFolders } from './queries'

export function FileRecordPage({ edit = false }: { edit?: boolean }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const client = useQueryClient()
  const ability = useAuthStore((s) => s.ability)
  const folders = useDataFileFolders()
  return (
    <RecordPage
      title={t('navigation.management.files', 'Files')}
      backTo='/files'
      load={apiGetFileByPublicId}
    >
      {(file, onClose) =>
        edit ? (
          <RenameFileDialog
            page
            open
            file={file}
            onOpenChange={(open) => {
              if (!open) onClose()
            }}
          />
        ) : (
          <>
            <PreviewDialog
              page
              file={file}
              onOpenChange={(open) => {
                if (!open) onClose()
              }}
            />
            <FileInspector
              page
              open
              file={file}
              folders={folders.data ?? []}
              onOpenChange={() => {}}
              onFileUpdated={(updated) =>
                client.setQueryData(
                  ['record-page', '/files', updated.public_id],
                  updated
                )
              }
              onRestore={(item) =>
                navigate('/files', {
                  state: { fileTask: 'restore', file: item },
                })
              }
              onPermanentDelete={(item) =>
                navigate('/files', {
                  state: { fileTask: 'permanent-delete', file: item },
                })
              }
              onPreview={() => window.scrollTo({ top: 0, behavior: 'instant' })}
              onCopyUrl={(item) => {
                void navigator.clipboard.writeText(item.url)
              }}
              onMove={(item) =>
                navigate('/files', { state: { fileTask: 'move', file: item } })
              }
              onDelete={(item) =>
                navigate('/files', {
                  state: { fileTask: 'delete', file: item },
                })
              }
              onRename={(item) =>
                navigate(`/files/${encodeURIComponent(item.public_id)}/edit`)
              }
              onShare={(item) =>
                navigate('/files', { state: { fileTask: 'share', file: item } })
              }
              canUpdate={ability.can('update', 'FILE')}
              canDelete={ability.can('delete', 'FILE')}
            />
          </>
        )
      }
    </RecordPage>
  )
}
/** Preserve existing folder URLs while opening the file manager dialog. */
export function FileCreatePage({ kind }: { kind: 'folder' | 'rename-folder' }) {
  const [params] = useSearchParams()
  return (
    <Navigate
      to={{ pathname: '/files', search: params.toString() ? `?${params}` : '' }}
      replace
      state={{ folderTask: kind, folder: params.get('folder') }}
    />
  )
}
