import { useEffect, useState } from 'react'
import type { LocaleConfig } from '@simplix-react/i18n'
import { useTranslation } from '@simplix-react/i18n/react'
import { FieldWrapper } from '../shared/field-wrapper'
import { useFlatUIComponents } from '../../provider/ui-provider'
import { useFileAttachment } from '../file-attachment/use-file-attachment'
import { useResolvedImageSrc } from '../file-attachment/use-resolved-image-src'
import { downloadAttachment } from '../file-attachment/download-attachment'
import { ImageViewerModal } from '../file-attachment/components/image-viewer-modal'
import { DescriptionEditDialog } from '../file-attachment/components/description-edit-dialog'
import { DeleteConfirmDialog } from '../file-attachment/components/delete-confirm-dialog'
import { FileActionButton } from '../file-attachment/components/file-action-button'
import { FileThumbnail } from '../file-attachment/atoms/file-thumbnail'
import { FileDropzone } from '../file-attachment/atoms/file-dropzone'
import { FileListItem } from '../file-attachment/components/file-list-item'
import { formatBytes } from '../../utils/format-bytes'
import { resolveMaxFileSize } from '../file-attachment/types'
import { useResolvedFileFieldConfig } from '../../config/file-policy-context'
import { Carousel } from '../image-attachment/components/carousel'
import { ThumbStrip } from '../image-attachment/components/thumb-strip'
import { StageDropzone } from '../image-attachment/components/stage-dropzone'
import { CropModal } from '../image-attachment/components/crop-modal'
import { cropImageToFile } from '../image-attachment/lib/crop-image'
import type { CommonFieldProps } from '../../crud/shared/types'
import type {
  AttachmentRecord,
  FileFieldApi,
  FileFieldConfig,
  FileAttachmentItem,
} from '../file-attachment/types'
import type { CropArea } from '../image-attachment/lib/crop-image'
import type { CarouselStatus } from '../image-attachment/components/carousel'
import type { ThumbItem } from '../image-attachment/components/thumb-strip'
import {
  CAROUSEL_SCENE_SIZE,
  DETAIL_ROW_SIZE,
  PREVIEW_MODAL_SIZE,
  shouldServeOriginal,
} from '../image-attachment/lib/thumbnail-sizes'

export interface ImageFieldProps extends CommonFieldProps {
  // ── borrowed (FileFieldProps isomorph — types.ts:117-139) ──
  value: AttachmentRecord[]
  onChange: (value: AttachmentRecord[]) => void
  onAuthError?: (error: unknown) => void
  initialAttachments?: AttachmentRecord[]
  api: FileFieldApi
  config?: FileFieldConfig
  languages?: LocaleConfig[]
  // ── new ──
  /**
   * Maximum number of images that can be attached.
   *   1  → Single mode (StageDropzone + crop + bottom-right actions, representative toggle off)
   *   >=2 → Multi mode (compact Dropzone + ThumbStrip + FileList, representative toggle on)
   * OQ-2: maxCount serves as both mode selector and effective attachment limit.
   *       config.maxAttachments is overridden by maxCount.
   */
  maxCount: number
}

export function ImageField({
  value: _value,
  onChange,
  api,
  onAuthError,
  initialAttachments,
  config: configProp,
  languages,
  maxCount,
  label,
  labelKey,
  error,
  warning,
  description,
  required,
  disabled,
  className,
  ...variantProps
}: ImageFieldProps) {
  const { t } = useTranslation('simplix/ui')
  // Precedence Y: injected server policy wins per field, instance config fills gaps.
  const config = useResolvedFileFieldConfig(configProp)
  const {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    Button,
  } = useFlatUIComponents()

  // OQ-2: maxCount overrides config.maxAttachments as the effective attachment limit.
  const {
    items,
    addFiles,
    removeItem,
    retryUpload,
    reorderItems,
    updateDescription,
    setRepresentative,
    getImageItems,
    validationErrors,
  } = useFileAttachment({
    initialAttachments: initialAttachments ?? [],
    api,
    config: { ...config, maxAttachments: maxCount },
    onChange,
    onAuthError,
  })

  // Validation dialog
  const [validationDialogOpen, setValidationDialogOpen] = useState(false)
  useEffect(() => {
    if (validationErrors.length > 0) {
      setValidationDialogOpen(true)
    }
  }, [validationErrors])

  // Per-item dialog state
  const [previewTarget, setPreviewTarget] = useState<FileAttachmentItem | null>(null)
  const [editTarget, setEditTarget] = useState<FileAttachmentItem | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<FileAttachmentItem | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Single mode: crop file state
  const [cropFile, setCropFile] = useState<File | null>(null)

  // Multi mode: active image id
  const [activeId, setActiveId] = useState<string | null>(null)

  const imageItems = getImageItems()

  // Initialize activeId when first item arrives (Multi mode)
  useEffect(() => {
    if (maxCount >= 2 && imageItems.length > 0 && activeId === null) {
      setActiveId(imageItems[0].localId)
    }
  }, [imageItems.length, maxCount, activeId])

  // Single mode: show the representative image, falling back to the first when none is set (issue #5).
  const representativeItem = imageItems.find((i) => i.attachment?.representative === true)
  // Multi: if the stored activeId no longer exists (the active item was deleted/cancelled),
  // fall back to the first item *in the same render* so the carousel never flashes the empty
  // state before the activeId state catches up (issue #2).
  const activeIdExists = activeId != null && imageItems.some((i) => i.localId === activeId)
  const effectiveActiveId =
    maxCount === 1
      ? (representativeItem?.localId ?? imageItems[0]?.localId ?? null)
      : activeIdExists
        ? activeId
        : (imageItems[0]?.localId ?? null)
  const activeItem = imageItems.find((i) => i.localId === effectiveActiveId) ?? null

  // Carousel status derived from active item (plan §3.5)
  const carouselStatus: CarouselStatus =
    !activeItem
      ? 'empty'
      : activeItem.status === 'completed'
        ? 'complete'
        : activeItem.status === 'uploading' || activeItem.status === 'pending'
          ? 'uploading'
          : 'error'

  // Active dot index for Multi mode nav
  const activeIndex = imageItems.findIndex((i) => i.localId === effectiveActiveId)

  // Preview src for ImageViewerModal — 1024px static thumbnail, OR the original
  // for animated GIF/WebP so the animation is preserved. (Download still fetches
  // the original separately.)
  const previewIsAnimated = shouldServeOriginal(previewTarget?.attachment?.mimeType)
  const previewSrc = useResolvedImageSrc({
    preview: previewTarget?.preview,
    attachmentId: previewTarget?.attachment?.attachmentId,
    fallbackUrl: previewTarget?.attachment?.thumbnailUrl ?? previewTarget?.attachment?.url,
    fetchBlobUrl: api.fetchBlobUrl,
    thumbnail: !previewIsAnimated,
    size: previewIsAnimated ? undefined : PREVIEW_MODAL_SIZE,
  })

  // Src for carousel scene image — 512px static thumbnail, OR the original for
  // animated GIF/WebP so the slide keeps animating.
  const activeIsAnimated = shouldServeOriginal(activeItem?.attachment?.mimeType)
  const activeSrc = useResolvedImageSrc({
    preview: activeItem?.status === 'completed' ? undefined : activeItem?.preview,
    attachmentId: activeItem?.attachment?.attachmentId,
    fallbackUrl: activeItem?.attachment?.thumbnailUrl ?? activeItem?.attachment?.url,
    fetchBlobUrl: api.fetchBlobUrl,
    thumbnail: !activeIsAnimated,
    size: activeIsAnimated ? undefined : CAROUSEL_SCENE_SIZE,
  })

  // Separate small static-thumbnail src for the detail row (NOT the full content
  // used by the scene). Always a 128px thumbnail — animated images show the first
  // frame here by design.
  const activeThumbSrc = useResolvedImageSrc({
    preview: activeItem?.status === 'completed' ? undefined : activeItem?.preview,
    attachmentId: activeItem?.attachment?.attachmentId,
    fallbackUrl: activeItem?.attachment?.thumbnailUrl ?? activeItem?.attachment?.url,
    fetchBlobUrl: api.fetchBlobUrl,
    thumbnail: true,
    size: DETAIL_ROW_SIZE,
  })

  // Crop: handle save from CropModal (plan §4.1)
  async function handleCropSave(area: CropArea | null) {
    if (!cropFile) return
    // null area = "original" selected — upload the source file unchanged (no crop).
    const fileToUpload = area ? await cropImageToFile(cropFile, area) : cropFile
    await addFiles([fileToUpload])
    setCropFile(null)
  }

  // Delete flow
  async function handleConfirmDelete() {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await removeItem(deleteTarget.localId)
      // If deleted item was active, reset activeId
      if (effectiveActiveId === deleteTarget.localId) {
        const remaining = imageItems.filter((i) => i.localId !== deleteTarget.localId)
        setActiveId(remaining.length > 0 ? remaining[0].localId : null)
      }
    } finally {
      setIsDeleting(false)
      setDeleteTarget(null)
    }
  }

  // Multi nav handlers
  function handlePrev() {
    if (imageItems.length < 2) return
    const idx = imageItems.findIndex((i) => i.localId === effectiveActiveId)
    const newIdx = (idx - 1 + imageItems.length) % imageItems.length
    setActiveId(imageItems[newIdx].localId)
  }

  function handleNext() {
    if (imageItems.length < 2) return
    const idx = imageItems.findIndex((i) => i.localId === effectiveActiveId)
    const newIdx = (idx + 1) % imageItems.length
    setActiveId(imageItems[newIdx].localId)
  }

  // ThumbStrip items derived from imageItems
  const thumbItems: ThumbItem[] = imageItems.map((item) => ({
    localId: item.localId,
    // Local preview only while uploading; once completed use the small server thumbnail
    // (avoids holding full-size originals — e.g. large GIFs — at 74px in the strip).
    preview: item.status === 'completed' ? undefined : item.preview,
    attachmentId: item.attachment?.attachmentId,
    fallbackUrl: item.attachment?.thumbnailUrl ?? item.attachment?.url,
    state:
      item.status === 'completed'
        ? 'complete'
        : item.status === 'uploading' || item.status === 'pending'
          ? 'uploading'
          : 'error',
    primary: item.attachment?.representative === true,
    uploadProgress: item.progress,
  }))

  // InfoBadgeMeta for carousel (name / size / dimensions — shown in the hover tooltip).
  // During upload/error the item has no `attachment` yet, so fall back to the local File
  // (otherwise the filename badge + tooltip disappear mid-upload).
  const activeAttachment = activeItem?.attachment
  const activeName = activeAttachment?.originalName ?? activeItem?.file?.name
  const activeSize = activeAttachment?.fileSize ?? activeItem?.file?.size
  const badgeMeta = activeItem
    ? [
        ...(activeName ? [{ label: t('file.nav.metaName'), value: activeName }] : []),
        ...(activeSize != null
          ? [{ label: t('file.nav.metaSize'), value: formatBytes(activeSize) }]
          : []),
        ...(activeAttachment?.width && activeAttachment?.height
          ? [{ label: t('file.nav.metaDimension'), value: `${activeAttachment.width} x ${activeAttachment.height}` }]
          : []),
      ]
    : undefined

  // Per-item action buttons — shared by the single-mode carousel rightActions and the
  // multi-mode active detail row (identical button set, status-branched).
  function buildItemActions(item: FileAttachmentItem) {
    if (item.status === 'uploading' || item.status === 'pending') {
      return <FileActionButton kind="cancel" onClick={() => void removeItem(item.localId)} />
    }
    if (item.status === 'error') {
      return (
        <>
          <FileActionButton kind="retry" onClick={() => void retryUpload(item.localId)} />
          <FileActionButton kind="delete" onClick={() => setDeleteTarget(item)} />
        </>
      )
    }
    // completed
    return (
      <>
        <FileActionButton kind="preview" onClick={() => setPreviewTarget(item)} />
        <FileActionButton kind="edit" onClick={() => setEditTarget(item)} />
        <FileActionButton kind="delete" onClick={() => setDeleteTarget(item)} />
      </>
    )
  }

  const currentCount = items.length
  const maxFileSize = resolveMaxFileSize(config)
  // Always-shown dropzone size label (issue #3) — defaults to 10MB when no config injected.
  const maxSizeLabel = t('file.dropzone.maxSize', { size: formatBytes(maxFileSize) })
  // Image-only field: default the displayed allowed extensions when the host injects none,
  // so both the Multi and Single dropzones always show the same extension list.
  const imageExtensions = config?.allowedExtensions ?? ['jpg', 'jpeg', 'png', 'webp', 'gif']

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
      <div className="@container flex flex-col gap-4">

        {/* Validation dialog */}
        <Dialog
          open={validationDialogOpen && validationErrors.length > 0}
          onOpenChange={(v: boolean) => !v && setValidationDialogOpen(false)}
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

        {/* ── Multi mode (maxCount >= 2) ── */}
        {maxCount >= 2 ? (
          <>
            {/* Compact dropzone — in-flow FileDropzone (StageDropzone is absolute, single-empty only) */}
            <FileDropzone
              multiple
              accept="image/*"
              title={t('file.stage.dropTitle')}
              cta={t('file.stage.dropCta')}
              currentCount={currentCount}
              maxFiles={maxCount}
              maxSizeLabel={maxSizeLabel}
              allowedExtensions={imageExtensions}
              onDrop={(files) => void addFiles(files)}
              disabled={disabled}
            />

            {/* Carousel */}
            <Carousel
              mode="multi"
              status={carouselStatus}
              scene={
                activeSrc ? (
                  // raw <img> permitted for content media (AG-6). object-contain so the whole
                  // image is visible (long side maxes at 100%) — no cropping (issue #4).
                  <img
                    src={activeSrc}
                    alt={activeAttachment?.originalName ?? ''}
                    className="absolute inset-0 w-full h-full object-contain"
                    aria-hidden="true"
                  />
                ) : undefined
              }
              totalDots={imageItems.length}
              activeDot={activeIndex >= 0 ? activeIndex : 0}
              onDotClick={(idx) => {
                const item = imageItems[idx]
                if (item) setActiveId(item.localId)
              }}
              onPrev={carouselStatus === 'complete' ? handlePrev : undefined}
              onNext={carouselStatus === 'complete' ? handleNext : undefined}
              fileName={activeName}
              badgeMeta={badgeMeta}
              uploadProgress={activeItem?.progress}
              errorMessage={activeItem?.error}
            />

            {/* ThumbStrip — display-only primary; drag to reorder (issue #2) */}
            <ThumbStrip
              items={thumbItems}
              activeId={effectiveActiveId ?? undefined}
              onActivate={setActiveId}
              onReorder={(from, to) => void reorderItems(from, to)}
              fetchBlobUrl={api.fetchBlobUrl}
            />

            {/* Detail list — active item only (issue #6) using the shared FileField row
                design (issue #2). Reorder lives on the thumb strip, so the row hides its handle. */}
            {activeItem ? (
              <FileListItem
                name={
                  activeItem.attachment?.originalName ??
                  activeItem.file?.name ??
                  t('file.unknownFile')
                }
                sizeLabel={
                  activeItem.status !== 'uploading' &&
                  activeItem.status !== 'pending' &&
                  activeItem.attachment?.fileSize != null
                    ? formatBytes(activeItem.attachment.fileSize)
                    : undefined
                }
                status={activeItem.status}
                progress={activeItem.progress}
                errorMessage={activeItem.error}
                hideHandle
                iconSlot={
                  activeThumbSrc ? (
                    <FileThumbnail
                      src={activeThumbSrc}
                      representative={activeItem.attachment?.representative === true}
                      onToggleRepresentative={
                        activeItem.status === 'completed' && activeItem.attachment?.attachmentId
                          ? () => void setRepresentative(activeItem.localId)
                          : undefined
                      }
                      size={40}
                    />
                  ) : (
                    <span className="block h-10 w-10 rounded-sm bg-muted" />
                  )
                }
                actions={buildItemActions(activeItem)}
              />
            ) : null}
          </>
        ) : (
          /* ── Single mode (maxCount === 1) ── */
          <Carousel
            mode="single"
            status={carouselStatus}
            scene={
              activeSrc ? (
                // raw <img> permitted for content media (AG-6). object-contain so the whole
                // image is visible (long side maxes at 100%) — no cropping (issue #4).
                <img
                  src={activeSrc}
                  alt={activeAttachment?.originalName ?? ''}
                  className="absolute inset-0 w-full h-full object-contain"
                  aria-hidden="true"
                />
              ) : undefined
            }
            dropContent={
              carouselStatus === 'empty' ? (
                <StageDropzone
                  onDrop={(file) => setCropFile(file)}
                  maxFiles={1}
                  currentCount={currentCount}
                  maxSizeLabel={maxSizeLabel}
                  allowedExtensions={imageExtensions}
                  accept="image/*"
                />
              ) : undefined
            }
            fileName={activeName}
            badgeMeta={badgeMeta}
            uploadProgress={activeItem?.progress}
            errorMessage={activeItem?.error}
            rightActions={
              carouselStatus === 'empty' || !activeItem ? undefined : buildItemActions(activeItem)
            }
          />
        )}

        {/* Common dialogs */}
        <ImageViewerModal
          open={!!previewTarget}
          onClose={() => setPreviewTarget(null)}
          fileName={previewTarget?.attachment?.originalName ?? previewTarget?.file?.name}
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
                alt={previewTarget?.attachment?.originalName ?? previewTarget?.file?.name ?? ''}
                className="max-h-[50vh] max-w-full object-contain sm:max-h-[60vh]"
              />
            ) : null
          }
          onDownload={
            previewTarget?.attachment?.attachmentId || previewTarget?.attachment?.url
              ? () =>
                  void downloadAttachment({
                    attachmentId: previewTarget.attachment?.attachmentId,
                    fileName:
                      previewTarget.attachment?.originalName ?? previewTarget.file?.name,
                    url: previewTarget.attachment?.url,
                    fetchBlobUrl: api.fetchBlobUrl,
                  })
              : undefined
          }
        />

        <DescriptionEditDialog
          open={!!editTarget}
          onClose={() => setEditTarget(null)}
          onSave={(dto) => {
            if (editTarget) {
              void updateDescription(editTarget.localId, { descriptionI18n: dto })
            }
          }}
          fileName={editTarget?.attachment?.originalName ?? editTarget?.file?.name}
          initialValue={editTarget?.attachment?.descriptionI18n ?? {}}
          languages={languages ?? []}
        />

        <DeleteConfirmDialog
          open={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={() => void handleConfirmDelete()}
          fileName={deleteTarget?.attachment?.originalName ?? deleteTarget?.file?.name}
          isDeleting={isDeleting}
        />

        {/* Single mode: CropModal (plan §4.1) */}
        {maxCount === 1 ? (
          <CropModal
            open={cropFile !== null}
            file={cropFile}
            onClose={() => setCropFile(null)}
            onSave={(area) => { void handleCropSave(area) }}
          />
        ) : null}
      </div>
    </FieldWrapper>
  )
}
