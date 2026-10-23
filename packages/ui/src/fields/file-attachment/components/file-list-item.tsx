import type { ReactNode } from 'react'
import type { DraggableAttributes, DraggableSyntheticListeners } from '@dnd-kit/core'
import { useTranslation } from '@simplix-react/i18n/react'
import { partAttributes, slotAttributes } from '../../../design/slot-style'
import { useFlatUIComponents } from '../../../provider/ui-provider'
import { DragHandleCell } from '../../../crud/reorder/drag-handle'
import { UploadProgressBar } from '../atoms/upload-progress-bar'
import type { AttachmentStatus } from '../types'
import {
  fileListItemActionsStyle,
  fileListItemErrorIconStyle,
  fileListItemErrorMessageStyle,
  fileListItemErrorStyle,
  fileListItemNameStyle,
  fileListItemProgressStyle,
  fileListItemRowStyle,
  fileListItemSizeBadgeStyle,
  fileListItemStyle,
} from './file-list-item.style'

export interface FileListItemProps {
  name: string
  sizeLabel?: string
  status: AttachmentStatus
  progress?: number
  errorMessage?: string
  /** Icon or thumbnail slot, rendered as the second column. */
  iconSlot: ReactNode
  /** Action buttons slot, rendered at the end of the row. */
  actions?: ReactNode
  dragListeners?: DraggableSyntheticListeners
  dragAttributes?: DraggableAttributes
  isDragging?: boolean
  /** Hide the drag handle (e.g. image single-active row where reorder lives on the thumb strip). */
  hideHandle?: boolean
}

/**
 * File/image list row atom.
 * Status-branching display: uploading shows progress bar; error shows error panel.
 *
 * Carries className="group" for file-thumbnail hover-star cooperation (plan §5.5-3).
 * DragHandleCell reused from crud/reorder (DEC-5).
 *
 * UD-6: per-item error messages appear inside the row body, not in FieldWrapper.
 */
export function FileListItem({
  name,
  sizeLabel,
  status,
  progress = 0,
  errorMessage,
  iconSlot,
  actions,
  dragListeners,
  dragAttributes,
  isDragging,
  hideHandle,
}: FileListItemProps) {
  const { Badge } = useFlatUIComponents()
  const { t } = useTranslation('simplix/ui')

  return (
    <div
      data-status={status}
      className="group flex flex-col"
      {...slotAttributes(fileListItemStyle, {
        tone: status === 'error' ? 'error' : 'default',
        busy: status === 'uploading' || status === 'pending',
        dragging: isDragging,
      })}
    >
      {/* Main row: gaps/padding step up with container width (@md, @2xl) */}
      <div className="flex min-h-[34px] items-center" {...slotAttributes(fileListItemRowStyle, {})}>
        {!hideHandle && (
          <DragHandleCell
            disabled={status !== 'completed'}
            disabledLabel={t('file.handle.reorderDisabled')}
            listeners={dragListeners}
            attributes={dragAttributes}
          />
        )}

        {/* Icon / thumbnail */}
        <div className="shrink-0">{iconSlot}</div>

        {/* File name */}
        <span className="min-w-0 flex-1 truncate" {...slotAttributes(fileListItemNameStyle, {})}>{name}</span>

        {/* File size badge (UD-9). Wrapper controls visibility so Badge's own display
            isn't overridden: hidden on narrow/medium, shown from @2xl (3rd stage). */}
        {sizeLabel && (
          <span className="hidden shrink-0 @2xl:inline-flex">
            <Badge variant="secondary" {...partAttributes(fileListItemSizeBadgeStyle, {})}>
              {sizeLabel}
            </Badge>
          </span>
        )}

        {/* Actions */}
        {actions && (
          <div className="inline-flex shrink-0" {...slotAttributes(fileListItemActionsStyle, {})}>{actions}</div>
        )}
      </div>

      {/* Uploading/pending expansion: progress bar (brief §E) */}
      {(status === 'uploading' || status === 'pending') && (
        <div {...slotAttributes(fileListItemProgressStyle, {})}>
          <UploadProgressBar value={progress} showPct />
        </div>
      )}

      {/* Error expansion: per-item error body (UD-6) */}
      {status === 'error' && errorMessage && (
        <div className="flex items-center" {...slotAttributes(fileListItemErrorStyle, {})}>
          {/* AlertTriangle inline SVG (no external icon dependency for atoms) */}
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="shrink-0"
            aria-hidden="true"
            {...slotAttributes(fileListItemErrorIconStyle, {})}
          >
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <span {...slotAttributes(fileListItemErrorMessageStyle, {})}>{errorMessage}</span>
        </div>
      )}
    </div>
  )
}
