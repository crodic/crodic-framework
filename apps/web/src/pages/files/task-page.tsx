import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useNavigate, useSearchParams } from 'react-router'
import { useAuthStore } from '@/stores/auth-store'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Main } from '@/components/layout/main'
import { PageShell } from '@/components/layout/page-shell'
import { RecordPage } from '@/components/layout/record-page'
import { FileInspector } from './components/file-inspector'
import { FolderDialog } from './components/folder-dialog'
import { PreviewDialog } from './components/preview-dialog'
import { RenameFileDialog } from './components/rename-file-dialog'
import {
  apiGetFileByPublicId,
  apiCreateFolder,
  apiRenameFolder,
  fileQueryKeys,
  useDataFileFolders,
} from './queries'

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
export function FileCreatePage({ kind }: { kind: 'folder' | 'rename-folder' }) {
  const { t } = useTranslation()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const client = useQueryClient()
  const folders = useDataFileFolders()
  const folder = params.get('folder')
  const close = () =>
    navigate(folder ? `/files?folder=${encodeURIComponent(folder)}` : '/files')
  const refresh = async () => {
    await Promise.all([
      client.invalidateQueries({ queryKey: fileQueryKeys.all }),
      client.invalidateQueries({ queryKey: fileQueryKeys.folders }),
    ])
  }
  return (
    <Main>
      <PageShell>
        <Button variant='outline' className='w-fit' onClick={close}>
          {t('buttons.back', 'Back')}
        </Button>
        {folders.isPending ? (
          <Skeleton className='h-64 w-full' />
        ) : folders.isError ? (
          <div role='alert' className='space-y-4'>
            <p>{t('recordPage.loadError', 'Unable to load folders.')}</p>
            <Button onClick={() => void folders.refetch()}>
              {t('recordPage.retry', 'Retry')}
            </Button>
          </div>
        ) : (
          <FolderDialog
            page
            open
            title={
              kind === 'folder'
                ? t('files.folders.createTitle')
                : t('files.folders.renameTitle')
            }
            submitLabel={t('buttons.save')}
            parentFolder={kind === 'folder' ? folder : null}
            defaultValue={kind === 'rename-folder' ? (folder ?? '') : ''}
            defaultColor={
              folders.data?.find((item) => item.folder === folder)?.color ??
              undefined
            }
            existingFolders={folders.data?.map((item) => item.folder)}
            onOpenChange={(open) => {
              if (!open) close()
            }}
            onSubmit={async (next, color) => {
              if (kind === 'rename-folder') {
                if (!folder) throw new Error('Missing folder')
                await apiRenameFolder({ folder, data: { folder: next, color } })
              } else await apiCreateFolder({ folder: next, color })
              await refresh()
            }}
          />
        )}
      </PageShell>
    </Main>
  )
}
