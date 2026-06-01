import { useState } from 'react'
import { Star, ImageOff } from 'lucide-react'
import { useTranslation } from '@simplix-react/i18n/react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type Modifier,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useResolvedImageSrc } from '../../file-attachment/use-resolved-image-src'
import { THUMB_STRIP_SIZE } from '../lib/thumbnail-sizes'
import { cn } from '../../../utils/cn'

// Local modifiers (avoids a @dnd-kit/modifiers dependency).
// Lock drag to the horizontal axis.
const restrictToHorizontalAxis: Modifier = ({ transform }) => ({ ...transform, y: 0 })

// Clamp the dragged thumbnail's horizontal travel to the strip bounds so it can't
// be dragged past the ends (smooth, no overscroll drift).
const restrictToParentElement: Modifier = ({ transform, draggingNodeRect, containerNodeRect }) => {
  if (!draggingNodeRect || !containerNodeRect) return transform
  const value = { ...transform }
  if (draggingNodeRect.left + transform.x <= containerNodeRect.left) {
    value.x = containerNodeRect.left - draggingNodeRect.left
  } else if (
    draggingNodeRect.left + draggingNodeRect.width + transform.x >=
    containerNodeRect.left + containerNodeRect.width
  ) {
    value.x =
      containerNodeRect.left +
      containerNodeRect.width -
      draggingNodeRect.left -
      draggingNodeRect.width
  }
  return value
}

export type ThumbState = 'complete' | 'uploading' | 'error'

export interface ThumbItem {
  localId: string
  /** Local object URL for a not-yet-uploaded file (takes precedence). */
  preview?: string
  /** Server attachment id — resolved via fetchBlobUrl (authenticated thumbnail). */
  attachmentId?: string
  /** Public direct URL fallback when no authenticated fetcher is available. */
  fallbackUrl?: string
  state?: ThumbState
  /** Display-only — read from representative flag. No write prop (plan §3.3 reconcile #1). */
  primary?: boolean
  uploadProgress?: number
}

export interface ThumbStripProps {
  items: ThumbItem[]
  activeId?: string
  onActivate: (localId: string) => void
  /** When provided, thumbnails become drag-sortable; reorder moves the underlying list. */
  onReorder?: (fromIndex: number, toIndex: number) => void
  /** Authenticated blob fetcher — resolves thumbnails like the file detail list (issue: webp). */
  fetchBlobUrl?: (attachmentId: string, opts?: { thumbnail?: boolean; size?: number }) => Promise<string>
}

interface ThumbButtonProps {
  item: ThumbItem
  isActive: boolean
  label?: string
  onActivate: (localId: string) => void
  sortable: boolean
  fetchBlobUrl?: (attachmentId: string, opts?: { thumbnail?: boolean; size?: number }) => Promise<string>
}

function ThumbButton({ item, isActive, label, onActivate, sortable, fetchBlobUrl }: ThumbButtonProps) {
  const isUploading = item.state === 'uploading'
  const isError = item.state === 'error'
  const draggable = sortable && item.state === 'complete'

  // Resolve the thumbnail the same way the file detail list does (authenticated thumbnail blob).
  // If the thumbnail itself can't load (e.g. backend can't generate a webp thumbnail) we show a
  // lightweight icon placeholder — never the full-size image (that would be a bandwidth hazard).
  const [failed, setFailed] = useState(false)
  const src = useResolvedImageSrc({
    preview: item.preview,
    attachmentId: item.attachmentId,
    fallbackUrl: item.fallbackUrl,
    fetchBlobUrl,
    thumbnail: true,
    size: THUMB_STRIP_SIZE,
  })

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.localId,
    disabled: !draggable,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <button
      ref={setNodeRef}
      style={style}
      type="button"
      className={cn(
        'relative w-[74px] h-[74px] rounded shrink-0 cursor-pointer p-0 font-[inherit]',
        // No overflow-hidden here so the representative star (offset outside) is not clipped;
        // the image + overlays are clipped by an inner rounded wrapper instead.
        'border border-border bg-muted',
        'transition-[outline,transform,border-color]',
        // Active blue glow — no token (styles.css:218)
        isActive &&
          !isError && [
            'outline outline-2 outline-primary outline-offset-2 border-transparent',
            'shadow-[0_0_0_4px_rgba(36,107,253,.14),0_6px_16px_rgba(36,107,253,.22),0_2px_6px_rgba(36,107,253,.12)]',
          ],
        // Error + active red glow — no token (styles.css:231)
        isActive &&
          isError && [
            'outline outline-2 outline-destructive outline-offset-2 border-transparent',
            'shadow-[0_0_0_4px_rgba(200,53,31,.14),0_6px_16px_rgba(200,53,31,.22),0_2px_6px_rgba(200,53,31,.12)]',
          ],
        !isActive && !isError && 'hover:-translate-y-[1px]',
        draggable && 'cursor-grab active:cursor-grabbing',
        isDragging && 'z-10 opacity-80',
      )}
      aria-label={isError ? label : undefined}
      onClick={() => onActivate(item.localId)}
      {...attributes}
      {...listeners}
    >
      {/* Image + status overlays — clipped to the rounded box (star sits outside, below) */}
      <span className="absolute inset-0 rounded-[inherit] overflow-hidden">
      {/* Scene image — or an icon placeholder when the thumbnail can't be loaded */}
      {failed ? (
        <span className="grid h-full w-full place-items-center bg-muted text-muted-foreground" aria-hidden="true">
          <ImageOff className="h-6 w-6" />
        </span>
      ) : src ? (
        <img
          src={src}
          alt=""
          className={cn(
            'w-full h-full object-cover block',
            // Error grayscale + red overlay — no token (styles.css:154-155,226-227)
            isError && 'grayscale brightness-50',
          )}
          aria-hidden="true"
          draggable={false}
          onError={() => setFailed(true)}
        />
      ) : null}

      {/* Uploading overlay — blue gradient — no token (styles.css:149,223) */}
      {isUploading ? (
        <span
          className={cn(
            'absolute inset-0 pointer-events-none rounded-[inherit]',
            // Upload progress blue gradient — no token (styles.css:149,223)
            'bg-[linear-gradient(180deg,rgba(18,104,179,0)_0%,rgba(18,104,179,.55)_100%)]',
          )}
          aria-hidden="true"
        />
      ) : null}

      {/* Error red overlay — no token (styles.css:154-155,226-227) */}
      {isError ? (
        <span
          className="absolute inset-0 pointer-events-none rounded-[inherit] bg-[rgba(200,53,31,.55)]"
          aria-hidden="true"
        />
      ) : null}

      {/* Uploading progress bar — fill nested in the track so its width is relative to the
          track (inset 6px each side), not the full thumb; otherwise it overflows/clips (issue #5). */}
      {isUploading ? (
        <span
          className="absolute left-[6px] right-[6px] bottom-[6px] h-[3px] rounded-full bg-white/35 z-[2] overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,.2)]"
          aria-hidden="true"
        >
          <span
            className="block h-full rounded-full bg-white"
            style={{ width: `${Math.max(0, Math.min(100, item.uploadProgress ?? 0))}%` }}
          />
        </span>
      ) : null}

      {/* Error badge icon */}
      {isError ? (
        <span
          className="absolute inset-0 grid place-items-center z-[2] pointer-events-none"
          aria-hidden="true"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="#fff"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.4"
            className="w-6 h-6"
            style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,.5))' }}
          >
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </span>
      ) : null}

      </span>

      {/* Representative star — identical to FileThumbnail (bg circle + gold star),
          rendered outside the clip wrapper so the offset badge is never cut off. */}
      {item.primary ? (
        <span
          className="absolute -right-[5px] -bottom-[5px] z-[4] flex items-center justify-center w-[17px] h-[17px] rounded-full bg-background shadow-sm"
          aria-hidden="true"
        >
          <Star
            size={11}
            // Star color: #FFC107 fill / #5C3A10 stroke (no token equivalent — matches FileThumbnail)
            style={{ color: '#FFC107', fill: '#FFC107', stroke: '#5C3A10' }}
          />
        </span>
      ) : null}
    </button>
  )
}

export function ThumbStrip({ items, activeId, onActivate, onReorder, fetchBlobUrl }: ThumbStripProps) {
  const { t } = useTranslation('simplix/ui')
  const sortable = !!onReorder
  const sensors = useSensors(
    // distance constraint keeps plain clicks (onActivate) working alongside drag-to-reorder
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!onReorder || !over || active.id === over.id) return
    const fromIndex = items.findIndex((i) => i.localId === active.id)
    const toIndex = items.findIndex((i) => i.localId === over.id)
    if (fromIndex !== -1 && toIndex !== -1) onReorder(fromIndex, toIndex)
  }

  const strip = (
    <div className="flex gap-[10px] mt-[14px] px-1 py-[6px] overflow-x-auto overflow-y-visible [scrollbar-width:thin]">
      {items.map((item) => (
        <ThumbButton
          key={item.localId}
          item={item}
          isActive={item.localId === activeId}
          label={item.state === 'error' ? t('file.thumb.uploadFailed') : undefined}
          onActivate={onActivate}
          sortable={sortable}
          fetchBlobUrl={fetchBlobUrl}
        />
      ))}
    </div>
  )

  if (!sortable) return strip

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      // Lock to horizontal + clamp within the strip so the dragged thumb can't drift
      // vertically or escape the container (smoother than manual transform zeroing).
      modifiers={[restrictToHorizontalAxis, restrictToParentElement]}
      // Disable auto-scroll — otherwise dragging scrolls the page vertically (issue: keeps
      // moving downward). The strip is horizontal-only; no auto-scroll needed.
      autoScroll={false}
    >
      <SortableContext items={items.map((i) => i.localId)} strategy={horizontalListSortingStrategy}>
        {strip}
      </SortableContext>
    </DndContext>
  )
}
