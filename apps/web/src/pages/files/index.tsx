import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router'
import { useAuthStore } from '@/stores/auth-store'
import { useBreadcrumb } from '@/hooks/use-breadcrumb'
import { Button } from '@/components/ui/button'
import { DeleteAlertDialog } from '@/components/common/delete-alert-dialog'
import { DataTable } from '@/components/data-table/data-table'
import { DataTableSortList } from '@/components/data-table/data-table-sort-list'
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar'
import { Main } from '@/components/layout/main'
import {
  DeleteFolderDialog,
  FileDropzoneOverlay,
  FileGridToolbar,
  FileGridView,
  FilesHeader,
  FilesSubSidebar,
  FolderCardGrid,
  MoveFileDialog,
  QuickFilterChips,
  ShareUrlDialog,
  StorageCategoryCards,
} from './components'
import { UploadDialog } from './components/upload-dialog'
import { bulkDownloadFiles } from './download-helper'
import { FilePickerDialog } from './file-picker-dialog'
import { FilesTableActionBar } from './file-table-action-bar'
import { useDataFileStorageStats } from './queries'
import { useFileManagerCore } from './use-file-manager-core'

export function PageFileOverview() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const ability = useAuthStore((state) => state.ability)

  useBreadcrumb([{ title: t('navigation.management.files', 'Files') }])

  const {
    // Navigation & View
    activeView,
    handleViewChange,
    activeFolder,
    viewMode,
    handleViewModeChange,
    activeCategory,
    handleFolderSelect,
    handleCategorySelect,
    handleDropFiles,
    search,
    setSearch,
    starredCount,
    trashCount,
    isStarred,
    toggleStar,

    // Data & Collections
    folders,
    currentFiles,
    totalItems,
    isFetching,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    table,

    // Modal States & Setters
    uploadOpen,
    droppedFiles,
    setUploadOpen,
    setDroppedFiles,
    setPreviewFile,
    pickerOpen,
    setPickerOpen,
    pickedUrl,
    setPickedUrl,
    movingFile,
    setMovingFile,
    setRenamingFile,
    sharingFile,
    setSharingFile,
    deletingFile,
    setDeletingFile,
    permanentDeletingFile,
    setPermanentDeletingFile,
    bulkDeletingFiles,
    setBulkDeletingFiles,
    bulkPermanentDeletingFiles,
    setBulkPermanentDeletingFiles,
    deletingFolder,
    setDeletingFolder,
    deleteFolderFiles,
    setDeleteFolderFiles,

    // Actions & Operations
    invalidateFiles,
    handleInspectFile,
    handleMoveFile,
    copyFileUrl,
    deleteFileMutation,
    restoreFileMutation,
    permanentDeleteFileMutation,
    deleteFolderMutation,
    bulkDeleteFileMutation,
    bulkRestoreFilesMutation,
    bulkPermanentDeleteFilesMutation,
  } = useFileManagerCore()

  const { mutate: restoreFromRecord } = restoreFileMutation

  useEffect(() => {
    const task = location.state?.fileTask
    const file = location.state?.file
    if (!task || !file) return
    if (task === 'move') setMovingFile(file)
    if (task === 'delete') setDeletingFile(file)
    if (task === 'share') setSharingFile(file)
    if (task === 'restore') restoreFromRecord(file)
    if (task === 'permanent-delete') setPermanentDeletingFile(file)
    navigate(location.pathname + location.search, {
      replace: true,
      state: null,
    })
  }, [
    location,
    navigate,
    setMovingFile,
    setDeletingFile,
    setSharingFile,
    restoreFromRecord,
    setPermanentDeletingFile,
  ])

  const { data: globalStats } = useDataFileStorageStats(null)
  const { data: folderStats } = useDataFileStorageStats(activeFolder)
  const effectiveStats = activeFolder ? folderStats : globalStats

  return (
    <>
      <FileDropzoneOverlay
        activeFolder={activeFolder}
        onDropFiles={handleDropFiles}
        disabled={!ability.can('create', 'FILE')}
      />

      <Main>
        {/* Top Header with Breadcrumbs, Search, Quick Actions & View Toggle */}
        <FilesHeader
          view={activeView}
          activeFolder={activeFolder}
          onSelectFolder={handleFolderSelect}
          search={search}
          onSearchChange={setSearch}
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
          onUploadClick={() => {
            setDroppedFiles([])
            setUploadOpen(true)
          }}
          onCreateFolderClick={() =>
            navigate(
              `/files/folders/create${activeFolder ? `?folder=${encodeURIComponent(activeFolder)}` : ''}`
            )
          }
          onOpenPicker={() => setPickerOpen(true)}
          totalItems={totalItems}
          isFetching={isFetching}
          canCreate={ability.can('create', 'FILE')}
        />

        {/* Demo Picker Result indicator (if used) */}
        {pickedUrl && (
          <div className='bg-muted/40 flex items-center justify-between rounded-lg border px-3 py-1.5 text-xs'>
            <span className='text-muted-foreground truncate'>
              {t('files.picker.demoValue')}: {pickedUrl}
            </span>
            <Button
              variant='ghost'
              size='sm'
              className='h-6 text-xs'
              onClick={() => setPickedUrl(null)}
            >
              Clear
            </Button>
          </div>
        )}

        {/* Main Body Layout: Left Sub-Sidebar + Workspace Content */}
        <div className='grid gap-5 lg:grid-cols-[240px_minmax(0,1fr)] xl:grid-cols-[260px_minmax(0,1fr)]'>
          {/* Left Sub-Sidebar (Square UI style) */}
          <FilesSubSidebar
            view={activeView}
            onViewChange={handleViewChange}
            folders={folders}
            activeFolder={activeFolder}
            totalFiles={globalStats?.totalCount ?? totalItems ?? 0}
            starredCount={starredCount}
            trashCount={trashCount}
            storageStats={globalStats}
            onSelectFolder={handleFolderSelect}
            onUploadClick={() => {
              setDroppedFiles([])
              setUploadOpen(true)
            }}
            onCreateFolderClick={() =>
              navigate(
                `/files/folders/create${activeFolder ? `?folder=${encodeURIComponent(activeFolder)}` : ''}`
              )
            }
            onRenameFolder={(folder) => {
              navigate(
                `/files/folders/edit?folder=${encodeURIComponent(folder)}`
              )
            }}
            onDeleteFolder={(folder) => setDeletingFolder(folder)}
            canCreate={ability.can('create', 'FILE')}
            canUpdate={ability.can('update', 'FILE')}
            canDelete={ability.can('delete', 'FILE')}
          />

          {/* Right Workspace Content */}
          <div className='flex min-w-0 flex-1 flex-col gap-5'>
            {/* Storage Category Cards (Only in All Files root view) */}
            {activeView === 'all' && activeFolder === null && (
              <StorageCategoryCards
                files={currentFiles}
                statsData={effectiveStats}
                activeCategory={activeCategory}
                onSelectCategory={handleCategorySelect}
              />
            )}

            {/* Quick Access Folders for current directory */}
            {activeView === 'all' &&
              (() => {
                const currentSubfolders = folders.filter((f) =>
                  activeFolder === null
                    ? !f.parent || f.depth === 0
                    : f.parent === activeFolder
                )
                if (currentSubfolders.length === 0) return null

                return (
                  <FolderCardGrid
                    folders={currentSubfolders}
                    activeFolder={activeFolder}
                    onSelectFolder={handleFolderSelect}
                    onRenameFolder={(folder) => {
                      navigate(
                        `/files/folders/edit?folder=${encodeURIComponent(folder)}`
                      )
                    }}
                    onDeleteFolder={(folder) => setDeletingFolder(folder)}
                    canUpdate={ability.can('update', 'FILE')}
                    canDelete={ability.can('delete', 'FILE')}
                  />
                )
              })()}

            {/* Grid View Mode */}
            {viewMode === 'grid' ? (
              <div className='flex flex-col gap-4'>
                <FileGridToolbar
                  table={table}
                  activeCategory={activeCategory}
                  onSelectCategory={handleCategorySelect}
                />

                <FileGridView
                  inspectedFile={null}
                  files={currentFiles}
                  table={table}
                  isFetching={isFetching}
                  onInspectFile={handleInspectFile}
                  onPreviewFile={setPreviewFile}
                  onCopyUrl={copyFileUrl}
                  onMoveFile={setMovingFile}
                  onDeleteFile={setDeletingFile}
                  onRestoreFile={(file) => restoreFileMutation.mutate(file)}
                  onPermanentDeleteFile={setPermanentDeletingFile}
                  onRenameFile={setRenamingFile}
                  onShareFile={setSharingFile}
                  isStarred={isStarred}
                  onToggleStar={toggleStar}
                  canUpdate={ability.can('update', 'FILE')}
                  canDelete={ability.can('delete', 'FILE')}
                  hasNextPage={hasNextPage}
                  isFetchingNextPage={isFetchingNextPage}
                  fetchNextPage={fetchNextPage}
                  totalItems={totalItems}
                />
              </div>
            ) : (
              /* Table View Mode */
              <div className='flex flex-col gap-3'>
                <QuickFilterChips
                  activeType={activeCategory}
                  onSelectType={handleCategorySelect}
                />
                <DataTable
                  table={table}
                  onClickRowAction={handleInspectFile}
                  isFetching={isFetching}
                >
                  <DataTableToolbar table={table}>
                    <DataTableSortList table={table} />
                  </DataTableToolbar>
                </DataTable>
              </div>
            )}
          </div>
        </div>
      </Main>

      {/* Bulk Action Bar */}
      <FilesTableActionBar
        table={table}
        onDelete={(files) => setBulkDeletingFiles(files)}
        onRestore={(files) => bulkRestoreFilesMutation.mutate(files)}
        onPermanentDelete={(files) => setBulkPermanentDeletingFiles(files)}
        onBulkDownload={(files) => void bulkDownloadFiles(files)}
        isTrash={activeView === 'trash'}
        disabled={ability.can('delete', 'FILE') === false}
      />

      <UploadDialog
        open={uploadOpen}
        folder={activeFolder}
        folders={folders}
        initialFiles={droppedFiles}
        onOpenChange={(open) => {
          setUploadOpen(open)
          if (!open) setDroppedFiles([])
        }}
        onUploaded={invalidateFiles}
        onCreateLocalFolder={handleFolderSelect}
      />

      {/* Move File Dialog */}
      <MoveFileDialog
        file={movingFile}
        folders={folders}
        onOpenChange={(open) => !open && setMovingFile(null)}
        onMoved={handleMoveFile}
      />

      {/* Share URL Dialog */}
      <ShareUrlDialog
        open={Boolean(sharingFile)}
        file={sharingFile}
        onOpenChange={(open) => !open && setSharingFile(null)}
      />

      {/* Delete Folder Dialog */}
      <DeleteFolderDialog
        folder={deletingFolder}
        deleteFiles={deleteFolderFiles}
        isLoading={deleteFolderMutation.isPending}
        onDeleteFilesChange={setDeleteFolderFiles}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingFolder(null)
            setDeleteFolderFiles(false)
          }
        }}
        onConfirm={() => {
          if (!deletingFolder) return
          deleteFolderMutation.mutate({
            folder: deletingFolder,
            deleteFiles: deleteFolderFiles,
          })
        }}
      />

      {/* Delete Single File Alert */}
      {deletingFile && (
        <DeleteAlertDialog
          open={Boolean(deletingFile)}
          onOpenChange={(open) => !open && setDeletingFile(null)}
          handleDelete={() => deleteFileMutation.mutate(deletingFile.public_id)}
          isLoading={deleteFileMutation.isPending}
          title='files.delete.title'
          description='files.delete.description'
        />
      )}

      {/* Delete Bulk Files Alert */}
      {bulkDeletingFiles.length > 0 && (
        <DeleteAlertDialog
          open={bulkDeletingFiles.length > 0}
          onOpenChange={(open) => !open && setBulkDeletingFiles([])}
          handleDelete={() => bulkDeleteFileMutation.mutate(bulkDeletingFiles)}
          isLoading={bulkDeleteFileMutation.isPending}
          title='files.delete.bulkTitle'
          description='files.delete.bulkDescription'
          translationValues={{ count: String(bulkDeletingFiles.length) }}
        />
      )}

      {/* Permanent Delete Single File Alert */}
      {permanentDeletingFile && (
        <DeleteAlertDialog
          open={Boolean(permanentDeletingFile)}
          onOpenChange={(open) => !open && setPermanentDeletingFile(null)}
          handleDelete={() =>
            permanentDeleteFileMutation.mutate(permanentDeletingFile)
          }
          isLoading={permanentDeleteFileMutation.isPending}
          title='files.delete.permanentTitle'
          description='files.delete.permanentDescription'
        />
      )}

      {/* Permanent Delete Bulk Files Alert */}
      {bulkPermanentDeletingFiles.length > 0 && (
        <DeleteAlertDialog
          open={bulkPermanentDeletingFiles.length > 0}
          onOpenChange={(open) => !open && setBulkPermanentDeletingFiles([])}
          handleDelete={() =>
            bulkPermanentDeleteFilesMutation.mutate(bulkPermanentDeletingFiles)
          }
          isLoading={bulkPermanentDeleteFilesMutation.isPending}
          title='files.delete.bulkPermanentTitle'
          description='files.delete.bulkPermanentDescription'
          translationValues={{
            count: String(bulkPermanentDeletingFiles.length),
          }}
        />
      )}

      {/* File Picker Dialog (reusable demo) */}
      <FilePickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        mode='url'
        value={pickedUrl}
        onValueChange={(value) => setPickedUrl(value)}
      />
    </>
  )
}
export default PageFileOverview
