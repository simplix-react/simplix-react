import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import { useTranslation } from '@simplix-react/i18n/react'
import { useFlatUIComponents } from '../../../provider/ui-provider'
// CropArea is the single source - defined in lib/crop-image (plan §13-4, W2 ownership)
import type { CropArea } from '../lib/crop-image'
import { partAttributes, slotAttributes } from '../../../design/slot-style'
import { EMPTY_VALUE_TEXT } from '../../../base/display/empty-value'
import {
  cropModalActionsStyle,
  cropModalBodyStyle,
  cropModalCancelStyle,
  cropModalCloseStyle,
  cropModalContentStyle,
  cropModalDimensionsIconStyle,
  cropModalDimensionsStyle,
  cropModalDimensionsValueStyle,
  cropModalFooterStyle,
  cropModalFrameStyle,
  cropModalHandleStyle,
  cropModalHeaderStyle,
  cropModalIconStyle,
  cropModalMetaStyle,
  cropModalRatioStyle,
  cropModalRatiosStyle,
  cropModalSaveStyle,
  cropModalStageStyle,
  cropModalTitleStyle,
} from './crop-modal.style'

export type { CropArea }

export interface CropModalProps {
  open: boolean
  file: File | null
  onClose: () => void
  /** area === null means "original" - upload the source file without cropping. */
  onSave: (area: CropArea | null) => void
  /**
   * Aspect ratio preselected each time the modal opens: -1 = original (default),
   * 0 = free, > 0 = fixed ratio (e.g. 1 for a square avatar crop).
   */
  initialRatio?: number
}

interface Frame {
  l: number
  t: number
  w: number
  h: number
}

// Ratio button definitions. ratio -1 = "original" (no crop). 0 = free, >0 = fixed ratio.
const ASPECTS: { ratio: number; label: string }[] = [
  { ratio: -1, label: 'original' },
  { ratio: 1, label: '1:1' },
  { ratio: 1.7777, label: '16:9' },
  { ratio: 0, label: 'free' },
]

const MIN_SIDE = 40

export function CropModal({ open, file, onClose, onSave, initialRatio = -1 }: CropModalProps) {
  const { t } = useTranslation('simplix/ui')
  const { Dialog, DialogContent } = useFlatUIComponents()

  const stageRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const objUrlRef = useRef<string | null>(null)

  const [src, setSrc] = useState<string>('')
  // Default to "original" (no crop) - the source image is uploaded as-is unless the user crops.
  const [ratio, setRatio] = useState(-1)
  const [frame, setFrame] = useState<Frame>({ l: 0, t: 0, w: 0, h: 0 })
  // Natural (source) pixel size - shown in the dimensions badge in original mode.
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null)

  // Live mirrors so window-level pointer handlers avoid stale closures.
  const geoRef = useRef<Frame>({ l: 0, t: 0, w: 0, h: 0 })
  const ratioRef = useRef(-1)
  const dragRef = useRef<{ dx: number; dy: number } | null>(null)

  // Clamp into stage bounds and commit to both state and live mirror.
  const applyFrame = useCallback((l: number, t: number, w: number, h: number) => {
    const stage = stageRef.current
    if (!stage) return
    const sw = stage.clientWidth
    const sh = stage.clientHeight
    w = Math.max(MIN_SIDE, Math.min(w, sw))
    h = Math.max(MIN_SIDE, Math.min(h, sh))
    l = Math.max(0, Math.min(l, sw - w))
    t = Math.max(0, Math.min(t, sh - h))
    const g = { l, t, w, h }
    geoRef.current = g
    setFrame(g)
  }, [])

  const initFrame = useCallback(
    (r: number) => {
      const stage = stageRef.current
      if (!stage) return
      const w = stage.clientWidth
      const h = stage.clientHeight
      let cw: number
      let ch: number
      if (r > 0) {
        const side = Math.min(w, h) * 0.7
        cw = r >= 1 ? side : side * r
        ch = r >= 1 ? side / r : side
      } else {
        cw = w * 0.7
        ch = h * 0.7
      }
      applyFrame((w - cw) / 2, (h - ch) / 2, cw, ch)
    },
    [applyFrame],
  )

  // Object URL lifecycle - create on open, revoke on close/unmount.
  useEffect(() => {
    if (!open || !file) {
      setSrc('')
      return
    }
    if (!/^image\//.test(file.type)) {
      onClose()
      return
    }
    const url = URL.createObjectURL(file)
    objUrlRef.current = url
    setSrc(url)
    // Each new file opens in the caller's initial mode (default: original, no crop).
    ratioRef.current = initialRatio
    setRatio(initialRatio)
    setNatural(null)
    return () => {
      if (objUrlRef.current) {
        URL.revokeObjectURL(objUrlRef.current)
        objUrlRef.current = null
      }
    }
  }, [open, file, onClose, initialRatio])

  // ESC close + body scroll lock while open.
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      document.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  const selectRatio = (r: number) => {
    ratioRef.current = r
    setRatio(r)
    if (r === -1) {
      // Original - no crop region; the source file is uploaded as-is on save.
      geoRef.current = { l: 0, t: 0, w: 0, h: 0 }
      setFrame({ l: 0, t: 0, w: 0, h: 0 })
    } else {
      initFrame(r)
    }
  }

  // Frame drag-move.
  const onFramePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).dataset.cropHandle) return
    const r = e.currentTarget.getBoundingClientRect()
    dragRef.current = { dx: e.clientX - r.left, dy: e.clientY - r.top }
    e.currentTarget.setPointerCapture?.(e.pointerId)
    e.preventDefault()
  }

  const onFramePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current
    const stage = stageRef.current
    if (!drag || !stage) return
    const sr = stage.getBoundingClientRect()
    const l = e.clientX - sr.left - drag.dx
    const t = e.clientY - sr.top - drag.dy
    applyFrame(l, t, geoRef.current.w, geoRef.current.h)
  }

  const endDrag = () => {
    dragRef.current = null
  }

  // Corner-handle resize (window-level listeners for the gesture duration).
  const onHandlePointerDown =
    (dir: 'nw' | 'ne' | 'sw' | 'se') => (e: ReactPointerEvent<HTMLSpanElement>) => {
      e.stopPropagation()
      e.preventDefault()
      const start = {
        x: e.clientX,
        y: e.clientY,
        l: geoRef.current.l,
        t: geoRef.current.t,
        w: geoRef.current.w,
        h: geoRef.current.h,
      }
      const onMove = (ev: PointerEvent) => {
        const dx = ev.clientX - start.x
        const dy = ev.clientY - start.y
        let l = start.l
        let t = start.t
        let w = start.w
        let h = start.h
        if (dir === 'se') { w = start.w + dx; h = start.h + dy }
        if (dir === 'sw') { l = start.l + dx; w = start.w - dx; h = start.h + dy }
        if (dir === 'ne') { t = start.t + dy; w = start.w + dx; h = start.h - dy }
        if (dir === 'nw') { l = start.l + dx; t = start.t + dy; w = start.w - dx; h = start.h - dy }
        if (ratioRef.current > 0) {
          // Lock ratio - drive height from width.
          h = w / ratioRef.current
          if (dir === 'nw' || dir === 'ne') {
            t = start.t + (start.h - h)
          }
        }
        applyFrame(l, t, w, h)
      }
      const onUp = () => {
        window.removeEventListener('pointermove', onMove)
        window.removeEventListener('pointerup', onUp)
      }
      window.addEventListener('pointermove', onMove)
      window.addEventListener('pointerup', onUp)
    }

  const handleSave = () => {
    if (ratioRef.current === -1) {
      // Original selected - upload the source file without cropping.
      onSave(null)
      onClose()
      return
    }
    const img = imgRef.current
    if (img) {
      // Map displayed-stage pixels -> natural image pixels (plan §4.1[3])
      const scaleX = img.naturalWidth / img.clientWidth || 1
      const scaleY = img.naturalHeight / img.clientHeight || 1
      onSave({
        x: Math.round(frame.l * scaleX),
        y: Math.round(frame.t * scaleY),
        width: Math.round(frame.w * scaleX),
        height: Math.round(frame.h * scaleY),
      })
    }
    onClose()
  }

  // px dimensions label - JS template, not translated (plan §6.2 note).
  // Original mode shows the source image's natural size; crop modes show the crop frame size.
  const dimText =
    ratio === -1
      ? natural
        ? `${natural.w} × ${natural.h} px`
        : EMPTY_VALUE_TEXT
      : frame.w > 0
        ? `${Math.round(frame.w)} × ${Math.round(frame.h)} px`
        : EMPTY_VALUE_TEXT

  return (
    <Dialog open={open} onOpenChange={(v: boolean) => !v && onClose()}>
      <DialogContent
        showCloseButton={false}
        flush
        className="overflow-hidden w-[min(640px,100%)] max-w-[min(640px,100%)]"
        {...partAttributes(cropModalContentStyle, {})}
        aria-labelledby="crop-modal-title"
      >
        {/* Header */}
        <div className="flex items-center min-h-[34px]" {...slotAttributes(cropModalHeaderStyle, {})}>
          <span
            className="w-6 h-6 grid place-items-center shrink-0"
            aria-hidden="true"
            {...slotAttributes(cropModalIconStyle, {})}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-3 h-3"
              aria-hidden="true"
            >
              <path d="M6.13 1 6 16a2 2 0 0 0 2 2h15" />
              <path d="M1 6.13 16 6a2 2 0 0 1 2 2v15" />
            </svg>
          </span>
          <h4
            id="crop-modal-title"
            className="min-w-0 flex-1 truncate"
            {...slotAttributes(cropModalTitleStyle, {})}
          >
            {t('file.crop.title')}
          </h4>
          {/* Custom close button (mimics .fa-imv-close) */}
          <button
            type="button"
            className="absolute top-[13px] right-[14px] w-7 h-7 grid place-items-center cursor-pointer z-[2]"
            aria-label={t('file.crop.close')}
            onClick={onClose}
            {...slotAttributes(cropModalCloseStyle, {})}
          >
            <svg viewBox="0 0 15 15" fill="none" className="w-[14px] h-[14px]" aria-hidden="true">
              <path
                d="M11.78 4.03a.75.75 0 1 0-1.06-1.06L7.5 6.19 4.28 2.97a.75.75 0 0 0-1.06 1.06L6.44 7.25l-3.22 3.22a.75.75 0 1 0 1.06 1.06L7.5 8.31l3.22 3.22a.75.75 0 1 0 1.06-1.06L8.56 7.25l3.22-3.22Z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>

        {/* Body - dark stage */}
        <div
          className="flex items-center justify-center overflow-hidden flex-1 min-h-90"
          {...slotAttributes(cropModalBodyStyle, {})}
        >
          <div
            ref={stageRef}
            className="relative inline-block max-w-full max-h-[60vh] select-none touch-none"
            style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
            {...slotAttributes(cropModalStageStyle, {})}
          >
            {src ? (
              <img
                ref={imgRef}
                src={src}
                alt={t('file.crop.altText')}
                className="block max-w-full max-h-[60vh] w-auto h-auto pointer-events-none"
                style={{ WebkitUserDrag: 'none' } as CSSProperties}
                onLoad={() => {
                  const el = imgRef.current
                  if (el) setNatural({ w: el.naturalWidth, h: el.naturalHeight })
                  if (ratioRef.current === -1) {
                    // Original - no crop region.
                    geoRef.current = { l: 0, t: 0, w: 0, h: 0 }
                    setFrame({ l: 0, t: 0, w: 0, h: 0 })
                  } else {
                    initFrame(ratioRef.current)
                  }
                }}
              />
            ) : null}
            {frame.w > 0 ? (
              <div
                className="absolute cursor-move box-border"
                style={{ left: frame.l, top: frame.t, width: frame.w, height: frame.h }}
                {...slotAttributes(cropModalFrameStyle, {})}
                onPointerDown={onFramePointerDown}
                onPointerMove={onFramePointerMove}
                onPointerUp={endDrag}
                onPointerCancel={endDrag}
              >
                {/* 3-grid lines via pseudo-elements - implemented with child divs (Tailwind) */}
                {/* Vertical thirds */}
                <div
                  className="absolute pointer-events-none z-[1] top-0 bottom-0"
                  style={{
                    // Crop 3-grid lines - no token (styles.css:291-292)
                    left: '33.33%',
                    right: '33.33%',
                    borderLeft: '1px dashed rgba(255,255,255,.5)',
                    borderRight: '1px dashed rgba(255,255,255,.5)',
                  }}
                  aria-hidden="true"
                />
                {/* Horizontal thirds */}
                <div
                  className="absolute pointer-events-none z-[1] left-0 right-0"
                  style={{
                    // Crop 3-grid lines - no token (styles.css:291-292)
                    top: '33.33%',
                    bottom: '33.33%',
                    borderTop: '1px dashed rgba(255,255,255,.5)',
                    borderBottom: '1px dashed rgba(255,255,255,.5)',
                  }}
                  aria-hidden="true"
                />
                {/* Corner handles - bg-white + border-primary (styles.css:293) */}
                {(['nw', 'ne', 'sw', 'se'] as const).map((dir) => (
                  <span
                    key={dir}
                    // Crop corner handle - semi-hardcoded (styles.css:293)
                    className="absolute w-3 h-3 z-[2]"
                    {...slotAttributes(cropModalHandleStyle, {})}
                    style={{
                      top: dir === 'nw' || dir === 'ne' ? -7 : undefined,
                      bottom: dir === 'sw' || dir === 'se' ? -7 : undefined,
                      left: dir === 'nw' || dir === 'sw' ? -7 : undefined,
                      right: dir === 'ne' || dir === 'se' ? -7 : undefined,
                      cursor:
                        dir === 'nw' || dir === 'se'
                          ? 'nwse-resize'
                          : 'nesw-resize',
                    }}
                    data-crop-handle="true"
                    onPointerDown={onHandlePointerDown(dir)}
                  />
                ))}
              </div>
            ) : null}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center min-h-[34px]" {...slotAttributes(cropModalFooterStyle, {})}>
          {/* Meta: dimensions + aspect ratio */}
          <span className="inline-flex items-center" {...slotAttributes(cropModalMetaStyle, {})}>
            <span
              className="inline-flex items-center h-[22px]"
              {...slotAttributes(cropModalDimensionsStyle, {})}
              title={t('file.crop.areaLabel')}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="w-[11px] h-[11px]"
                aria-hidden="true"
                {...slotAttributes(cropModalDimensionsIconStyle, {})}
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="12" y1="3" x2="12" y2="21" />
              </svg>
              <strong {...slotAttributes(cropModalDimensionsValueStyle, {})}>{dimText}</strong>
            </span>

            {/* Aspect ratio selector */}
            <span
              className="inline-flex items-center h-[22px]"
              {...slotAttributes(cropModalRatiosStyle, {})}
              role="group"
              aria-label={t('file.crop.aspectLabel')}
            >
              {ASPECTS.map((a) => {
                const label =
                  a.label === 'free'
                    ? t('file.crop.ratioFree')
                    : a.label === 'original'
                      ? t('file.crop.ratioOriginal')
                      : a.label
                return (
                  <button
                    key={a.label}
                    type="button"
                    className="h-[18px] cursor-pointer"
                    {...slotAttributes(cropModalRatioStyle, { selected: ratio === a.ratio })}
                    onClick={() => selectRatio(a.ratio)}
                  >
                    {label}
                  </button>
                )
              })}
            </span>
          </span>

          {/* Action buttons */}
          <div className="inline-flex shrink-0" {...slotAttributes(cropModalActionsStyle, {})}>
            <button
              type="button"
              className="inline-flex items-center h-[34px] cursor-pointer"
              {...slotAttributes(cropModalCancelStyle, {})}
              onClick={onClose}
            >
              {t('file.crop.cancel')}
            </button>
            <button
              type="button"
              className="inline-flex items-center h-[34px] cursor-pointer"
              {...slotAttributes(cropModalSaveStyle, {})}
              onClick={handleSave}
            >
              {t('file.crop.save')}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
