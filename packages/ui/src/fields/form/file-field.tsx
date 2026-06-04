import { useEffect, useState } from 'react'
import { useTranslation } from '@simplix-react/i18n/react'
import { FieldWrapper } from '../shared/field-wrapper'
import { useFlatUIComponents } from '../../provider/ui-provider'
import { useFileAttachment } from '../file-attachment/use-file-attachment'
import { useResolvedImageSrc } from '../file-attachment/use-resolved-image-src'
import { downloadAttachment } from '../file-attachment/download-attachment'
import { FileDropzone } from '../file-attachment/atoms/file-dropzone'
import { FileSection } from '../file-attachment/components/file-section'
import { DeleteConfirmDialog } from '../file-attachment/components/delete-confirm-dialog'
import { ImageViewerModal } from '../file-attachment/components/image-viewer-modal'
import { DescriptionEditDialog } from '../file-attachment/components/description-edit-dialog'
import { DEFAULT_MAX_FILES, DEFAULT_MAX_FILE_SIZE } from '../file-attachment/types'
import { formatBytes } from '../../utils/format-bytes'
import type { FileAttachmentItem } from '../file-attachment/types'
import type { FileFieldProps } from '../file-attachment/types'

export type { FileFieldProps }

/**
 * FileField — general-purpose file attachment form field.
 *
 * Wraps FieldWrapper (layout default top, DEC-4 inline body div).
 * Hook wired to dropzone, two file sections (files / images), and 4 dialogs
 * (preview, description edit, delete confirm, validation errors).
 *
 * §J: validationErrors are shown in a Dialog popup, not inline.
 *     FieldWrapper.error carries only the externally-injected error prop.
 */
export function FileField({
  value: _value,
  onChange,
  api,
  onAuthError,
  initialAttachments,
  config,
  languages,
  label,
  labelKey,
  error,
  warning,
  description,
  required,
  disabled,
  className,
  ...variantProps
}: FileFieldProps) {
  const { t } = useTranslation('simplix/ui')
  const {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    Button,
  } = useFlatUIComponents()

  const {
    items,
    addFiles,
    removeItem,
    retryUpload,
    reorderItems,
    updateDescription,
    setRepresentative,
    getFileItems,
    getImageItems,
    validationErrors,
  } = useFileAttachment({
    initialAttachments: initialAttachments ?? [],
    api,
    config: config ?? {},
    onChange,
    onAuthError,
  })

  // §J: validation dialog open state — opens whenever new errors arrive, closable by user.
  const [validationDialogOpen, setValidationDialogOpen] = useState(false)
  useEffect(() => {
    if (validationErrors.length > 0) {
      setValidationDialogOpen(true)
    }
  }, [validationErrors])

  // Dialog state for preview / edit / delete
  const [previewTarget, setPreviewTarget] = useState<FileAttachmentItem | null>(null)
  const [editTarget, setEditTarget] = useState<FileAttachmentItem | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<FileAttachmentItem | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fileItems = getFileItems()
  const imageItems = getImageItems()

  // Viewer image src: 1024px preview for display (download fetches the original separately).
  const previewSrc = useResolvedImageSrc({
    preview: previewTarget?.preview,
    attachmentId: previewTarget?.attachment?.attachmentId,
    fallbackUrl: previewTarget?.attachment?.thumbnailUrl ?? previewTarget?.attachment?.url,
    fetchBlobUrl: api.fetchBlobUrl,
    thumbnail: true,
    size: 1024,
  })

  // §C: currentCount = all items regardless of status (brief §D.1)
  const currentCount = items.length

  // Issue 8: hardcode 10개/10MB defaults when the host provides no config —
  // display (dropzone) and validation (hook) share the same DEFAULT_* source.
  const maxFiles = config?.maxAttachments ?? DEFAULT_MAX_FILES
  const maxFileSize =
    config?.maxFileSize && config.maxFileSize >= 1024 ? config.maxFileSize : DEFAULT_MAX_FILE_SIZE
  const maxSizeLabel = t('file.dropzone.maxSize', { size: formatBytes(maxFileSize) })

  async function handleConfirmDelete() {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await removeItem(deleteTarget.localId)
    } finally {
      setIsDeleting(false)
      setDeleteTarget(null)
    }
  }

  function handleDownload(item: FileAttachmentItem) {
    // Authenticated path (Bearer via fetchBlobUrl) + original filename; falls back to public url.
    void downloadAttachment({
      attachmentId: item.attachment?.attachmentId,
      fileName: item.attachment?.originalName ?? item.file?.name,
      url: item.attachment?.url,
      fetchBlobUrl: api.fetchBlobUrl,
    })
  }

  return (
    <FieldWrapper
      label={label}
      labelKey={labelKey}
      error={error}
      warning={warning}
      description={description}
      required={required}
      disabled={disabled}
      className={className}
      {...variantProps}
    >
      {/* FileAttachmentBody — inline div (DEC-4: no separate component file).
          @container: children adapt to the FIELD's own width (matches Grid primitive),
          so dropzone/list switch layout by container width, not viewport. */}
      <div className="@container flex flex-col gap-4">
        {/* §J: validation errors as Dialog popup (§C dropzone props per brief) */}
        <Dialog
          open={validationDialogOpen && validationErrors.length > 0}
          onOpenChange={(v) => !v && setValidationDialogOpen(false)}
        >
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>{t('file.validation.title')}</DialogTitle>
            </DialogHeader>
            <ul className="space-y-1 text-sm">
              {validationErrors.map((msg, idx) => (
                // eslint-disable-next-line react/no-array-index-key
                <li key={idx}>{msg}</li>
              ))}
            </ul>
            <DialogFooter>
              <Button variant="outline" onClick={() => setValidationDialogOpen(false)}>
                {t('file.validation.close')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* §C: dropzone receives currentCount (all statuses), maxFiles, allowedExtensions, maxSizeLabel */}
        <FileDropzone
          onDrop={addFiles}
          disabled={disabled}
          multiple
          currentCount={currentCount}
          maxFiles={maxFiles}
          allowedExtensions={config?.allowedExtensions}
          maxSizeLabel={maxSizeLabel}
        />

        <FileSection
          type="file"
          items={fileItems}
          onReorder={reorderItems}
          onDelete={(localId) => {
            const item = fileItems.find((i) => i.localId === localId)
            if (item) setDeleteTarget(item)
          }}
          onEdit={(localId) => {
            const item = fileItems.find((i) => i.localId === localId)
            if (item) setEditTarget(item)
          }}
          onRetry={retryUpload}
          onCancel={removeItem}
          fetchBlobUrl={api.fetchBlobUrl}
        />

        <FileSection
          type="image"
          items={imageItems}
          onReorder={reorderItems}
          onDelete={(localId) => {
            const item = imageItems.find((i) => i.localId === localId)
            if (item) setDeleteTarget(item)
          }}
          onEdit={(localId) => {
            const item = imageItems.find((i) => i.localId === localId)
            if (item) setEditTarget(item)
          }}
          onPreview={(localId) => {
            const item = imageItems.find((i) => i.localId === localId)
            if (item) setPreviewTarget(item)
          }}
          onRetry={retryUpload}
          onCancel={removeItem}
          onSetRepresentative={setRepresentative}
          fetchBlobUrl={api.fetchBlobUrl}
        />

        {/* Image preview modal */}
        <ImageViewerModal
          open={!!previewTarget}
          onClose={() => setPreviewTarget(null)}
          fileName={
            previewTarget?.attachment?.originalName ?? previewTarget?.file?.name
          }
          fileSize={
            previewTarget?.attachment?.fileSize != null
              ? formatBytes(previewTarget.attachment.fileSize)
              : undefined
          }
          dimension={
            previewTarget?.attachment?.width && previewTarget?.attachment?.height
              ? `${previewTarget.attachment.width} x ${previewTarget.attachment.height}`
              : undefined
          }
          preview={
            previewSrc ? (
              // raw <img> permitted for content media (AG-6)
              <img
                src={previewSrc}
                alt={
                  previewTarget?.attachment?.originalName ?? previewTarget?.file?.name ?? ''
                }
                className="max-h-[50vh] max-w-full object-contain sm:max-h-[60vh]"
              />
            ) : null
          }
          onDownload={
            previewTarget?.attachment?.attachmentId || previewTarget?.attachment?.url
              ? () => handleDownload(previewTarget)
              : undefined
          }
        />

        {/* Description edit dialog */}
        <DescriptionEditDialog
          open={!!editTarget}
          onClose={() => setEditTarget(null)}
          onSave={(dto) => {
            if (editTarget) {
              void updateDescription(editTarget.localId, {
                descriptionI18n: dto,
              })
            }
          }}
          fileName={editTarget?.attachment?.originalName ?? editTarget?.file?.name}
          initialValue={editTarget?.attachment?.descriptionI18n ?? {}}
          languages={languages ?? []}
        />

        {/* Delete confirm dialog */}
        <DeleteConfirmDialog
          open={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleConfirmDelete}
          fileName={deleteTarget?.attachment?.originalName ?? deleteTarget?.file?.name}
          isDeleting={isDeleting}
        />
      </div>
    </FieldWrapper>
  )
}
