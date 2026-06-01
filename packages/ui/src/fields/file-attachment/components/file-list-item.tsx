import type { ReactNode } from 'react'
import type { DraggableAttributes, DraggableSyntheticListeners } from '@dnd-kit/core'
import { cn } from '../../../utils/cn'
import { useFlatUIComponents } from '../../../provider/ui-provider'
import { DragHandleCell } from '../../../crud/reorder/drag-handle'
import { UploadProgressBar } from '../atoms/upload-progress-bar'
import type { AttachmentStatus } from '../types'

export interface FileListItemProps {
  name: string
  sizeLabel?: string
  status: AttachmentStatus
  progress?: number
  errorMessage?: string
  /** Icon or thumbnail slot — rendered as the second column. */
  iconSlot: ReactNode
  /** Action buttons slot — rendered at the end of the row. */
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

  return (
    <div
      data-status={status}
      className={cn(
        'group flex flex-col rounded border border-input bg-card transition-shadow',
        (status === 'uploading' || status === 'pending') && 'opacity-70',
        status === 'error' && 'border-destructive/30',
        isDragging && 'shadow-lg',
      )}
    >
      {/* Main row — gaps/padding step up with container width (@md, @2xl) */}
      <div className="flex min-h-[40px] items-center gap-2 px-2.5 py-2.5 @md:gap-3 @md:px-3">
        {!hideHandle && (
          <DragHandleCell
            disabled={status !== 'completed'}
            listeners={dragListeners}
            attributes={dragAttributes}
          />
        )}

        {/* Icon / thumbnail */}
        <div className="shrink-0">{iconSlot}</div>

        {/* File name */}
        <span className="min-w-0 flex-1 truncate text-sm font-semibold">{name}</span>

        {/* File size badge (UD-9). Wrapper controls visibility so Badge's own display
            isn't overridden: hidden on narrow/medium, shown from @2xl (3rd stage). */}
        {sizeLabel && (
          <span className="hidden shrink-0 @2xl:inline-flex">
            <Badge variant="secondary" className="text-xs tabular-nums">
              {sizeLabel}
            </Badge>
          </span>
        )}

        {/* Actions */}
        {actions && (
          <div className="inline-flex shrink-0 gap-0.5">{actions}</div>
        )}
      </div>

      {/* Uploading/pending expansion — progress bar (brief §E) */}
      {(status === 'uploading' || status === 'pending') && (
        <div className="border-t border-dashed px-4 py-1.5 bg-muted/40">
          <UploadProgressBar value={progress} showPct />
        </div>
      )}

      {/* Error expansion — per-item error body (UD-6) */}
      {status === 'error' && errorMessage && (
        <div className="flex items-center gap-1.5 border-t border-dashed border-destructive/30 bg-destructive/5 px-4 py-1.5">
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
            className="shrink-0 text-destructive"
            aria-hidden="true"
          >
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <span className="text-[11px] text-destructive">{errorMessage}</span>
        </div>
      )}
    </div>
  )
}
