import type { ReactNode } from 'react'
import { File, Image } from 'lucide-react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useTranslation } from '@simplix-react/i18n/react'
import { formatBytes } from '../../../utils/format-bytes'
import { cn } from '../../../utils/cn'
import { FileListItem } from './file-list-item'
import { FileTypeIcon } from '../atoms/file-type-icon'
import { FileThumbnail } from '../atoms/file-thumbnail'
import { FileActionButton } from './file-action-button'
import { useResolvedImageSrc } from '../use-resolved-image-src'
import { downloadAttachment } from '../download-attachment'
import type { FileAttachmentItem } from '../types'

// ── SortableFileListItem ──────────────────────────────────────────────────────
// Inline sortable wrapper per DEC-5: useSortable + FileListItem in this file.

interface SortableFileListItemProps {
  item: FileAttachmentItem
  type: 'file' | 'image'
  onDelete: (localId: string) => void
  onEdit: (localId: string) => void
  onPreview?: (localId: string) => void
  onRetry: (localId: string) => void
  onCancel: (localId: string) => void
  onSetRepresentative?: (localId: string) => void
  fetchBlobUrl?: (attachmentId: string) => Promise<string>
}


function SortableFileListItem({
  item,
  type,
  onDelete,
  onEdit,
  onPreview,
  onRetry,
  onCancel,
  onSetRepresentative,
  fetchBlobUrl,
}: SortableFileListItemProps) {
  const { t } = useTranslation('simplix/ui')
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: item.localId,
    disabled: item.status !== 'completed',
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const name =
    item.attachment?.originalName ?? item.file?.name ?? t('file.unknownFile')
  const sizeBytes =
    item.attachment?.fileSize ?? item.file?.size

  // Size badge hidden during uploading/pending (brief §E)
  const isInProgress = item.status === 'uploading' || item.status === 'pending'
  const sizeLabel = !isInProgress && sizeBytes != null ? formatBytes(sizeBytes) : undefined

  const extension = name.includes('.')
    ? name.split('.').pop()
    : undefined

  // Resolve the thumbnail src: local preview → authenticated blob (when the host
  // provides fetchBlobUrl) → public `url` fallback. `thumbnailUrl` is a last resort.
  // Only image rows fetch — passing no attachmentId for file rows stops the hook from
  // calling the (image-only) thumbnail endpoint, which 500s for non-image files.
  const isImageRow = type === 'image'
  const resolvedSrc = useResolvedImageSrc({
    preview: isImageRow ? item.preview : undefined,
    attachmentId: isImageRow ? item.attachment?.attachmentId : undefined,
    fallbackUrl: isImageRow ? (item.attachment?.thumbnailUrl ?? item.attachment?.url) : undefined,
    fetchBlobUrl,
    thumbnail: true,
  })
  const hasImage =
    isImageRow &&
    !!(item.preview ||
      item.attachment?.url ||
      item.attachment?.thumbnailUrl ||
      (fetchBlobUrl && item.attachment?.attachmentId))
  const iconSlot =
    hasImage ? (
      <FileThumbnail
        src={resolvedSrc ?? ''}
        representative={item.attachment?.representative}
        onToggleRepresentative={
          item.status === 'completed' && onSetRepresentative
            ? () => onSetRepresentative(item.localId)
            : undefined
        }
        size={40}
      />
    ) : (
      <FileTypeIcon
        extension={extension}
        mimeType={item.attachment?.mimeType ?? item.file?.type}
        fileName={name}
        size={36}
      />
    )

  // Per-state action buttons (brief §E):
  // - uploading/pending: cancel only (no delete, no size)
  // - completed + file: download, edit, delete
  // - completed + image: preview, edit, delete (no download)
  // - error: retry, delete
  const actions = (
    <>
      {isInProgress && (
        <FileActionButton kind="cancel" onClick={() => onCancel(item.localId)} />
      )}
      {item.status === 'completed' && type === 'image' && onPreview && (
        <FileActionButton kind="preview" onClick={() => onPreview(item.localId)} />
      )}
      {item.status === 'completed' && type === 'file' && (
        <FileActionButton kind="download" onClick={() => {
          void downloadAttachment({
            attachmentId: item.attachment?.attachmentId,
            fileName: item.attachment?.originalName ?? item.file?.name,
            url: item.attachment?.url,
            fetchBlobUrl,
          })
        }} />
      )}
      {item.status === 'completed' && (
        <FileActionButton kind="edit" onClick={() => onEdit(item.localId)} />
      )}
      {item.status === 'error' && (
        <FileActionButton kind="retry" onClick={() => onRetry(item.localId)} />
      )}
      {/* delete shown for completed and error only — NOT for uploading/pending (brief §E) */}
      {!isInProgress && (
        <FileActionButton kind="delete" onClick={() => onDelete(item.localId)} />
      )}
    </>
  )

  return (
    <div ref={setNodeRef} style={style}>
      <FileListItem
        name={name}
        sizeLabel={sizeLabel}
        status={item.status}
        progress={item.progress}
        errorMessage={item.error}
        iconSlot={iconSlot}
        actions={actions}
        dragListeners={listeners}
        dragAttributes={attributes}
        isDragging={isDragging}
      />
    </div>
  )
}

// ── FileSection ───────────────────────────────────────────────────────────────

export interface FileSectionProps {
  type: 'file' | 'image'
  title?: string
  items: FileAttachmentItem[]
  onReorder: (fromIndex: number, toIndex: number) => void
  onDelete: (localId: string) => void
  onEdit: (localId: string) => void
  onPreview?: (localId: string) => void
  onRetry: (localId: string) => void
  onCancel: (localId: string) => void
  onSetRepresentative?: (localId: string) => void
  fetchBlobUrl?: (attachmentId: string) => Promise<string>
  children?: ReactNode
}

const SECTION_META = {
  file:  { Icon: File,  i18nKey: 'file.section.files' },
  image: { Icon: Image, i18nKey: 'file.section.images' },
} as const

/**
 * Section with header (icon + title + count) and a sortable dnd-kit list.
 *
 * DEC-5: SortableContext + DndContext scoped per section.
 * SortableFileListItem inline (not a separate file).
 * Returns null when items.length === 0 (UD-9 no empty section).
 * Section titles via t() (brief §A, §E). Count = ALL items in section.
 */
export function FileSection({
  type,
  title,
  items,
  onReorder,
  onDelete,
  onEdit,
  onPreview,
  onRetry,
  onCancel,
  onSetRepresentative,
  fetchBlobUrl,
}: FileSectionProps) {
  const { t } = useTranslation('simplix/ui')
  const sensors = useSensors(useSensor(PointerSensor))

  if (items.length === 0) return null

  const { Icon, i18nKey } = SECTION_META[type]

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const fromIndex = items.findIndex((i) => i.localId === active.id)
    const toIndex = items.findIndex((i) => i.localId === over.id)
    if (fromIndex !== -1 && toIndex !== -1) {
      onReorder(fromIndex, toIndex)
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      {/* Section header: i18n title + total count (all statuses) */}
      <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
        <Icon size={12} aria-hidden="true" />
        <span>{title ?? t(i18nKey)}</span>
        <span className={cn('tabular-nums')}>({items.length})</span>
      </div>

      {/* Sortable list */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={items.map((i) => i.localId)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col gap-1.5">
            {items.map((item) => (
              <SortableFileListItem
                key={item.localId}
                item={item}
                type={type}
                onDelete={onDelete}
                onEdit={onEdit}
                onPreview={onPreview}
                onRetry={onRetry}
                onCancel={onCancel}
                onSetRepresentative={onSetRepresentative}
                fetchBlobUrl={fetchBlobUrl}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}
