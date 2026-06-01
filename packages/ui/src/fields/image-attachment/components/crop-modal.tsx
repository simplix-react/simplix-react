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
// CropArea is the single source — defined in lib/crop-image (plan §13-4, W2 ownership)
import type { CropArea } from '../lib/crop-image'

export type { CropArea }

export interface CropModalProps {
  open: boolean
  file: File | null
  onClose: () => void
  /** area === null means "original" — upload the source file without cropping. */
  onSave: (area: CropArea | null) => void
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

export function CropModal({ open, file, onClose, onSave }: CropModalProps) {
  const { t } = useTranslation('simplix/ui')
  const { Dialog, DialogContent } = useFlatUIComponents()

  const stageRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const objUrlRef = useRef<string | null>(null)

  const [src, setSrc] = useState<string>('')
  // Default to "original" (no crop) — the source image is uploaded as-is unless the user crops.
  const [ratio, setRatio] = useState(-1)
  const [frame, setFrame] = useState<Frame>({ l: 0, t: 0, w: 0, h: 0 })
  // Natural (source) pixel size — shown in the dimensions badge in original mode.
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

  // Object URL lifecycle — create on open, revoke on close/unmount.
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
    // Each new file opens in "original" mode by default (no crop).
    ratioRef.current = -1
    setRatio(-1)
    setNatural(null)
    return () => {
      if (objUrlRef.current) {
        URL.revokeObjectURL(objUrlRef.current)
        objUrlRef.current = null
      }
    }
  }, [open, file, onClose])

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
      // Original — no crop region; the source file is uploaded as-is on save.
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
          // Lock ratio — drive height from width.
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
      // Original selected — upload the source file without cropping.
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

  // px dimensions label — JS template, not translated (plan §6.2 note).
  // Original mode shows the source image's natural size; crop modes show the crop frame size.
  const dimText =
    ratio === -1
      ? natural
        ? `${natural.w} × ${natural.h} px`
        : '—'
      : frame.w > 0
        ? `${Math.round(frame.w)} × ${Math.round(frame.h)} px`
        : '—'

  return (
    <Dialog open={open} onOpenChange={(v: boolean) => !v && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="p-0 gap-0 overflow-hidden w-[min(640px,100%)] max-w-[min(640px,100%)]"
        aria-labelledby="crop-modal-title"
      >
        {/* Header */}
        <div className="flex items-center px-5 py-[10px] pr-12 border-b border-border min-h-[34px] gap-2">
          <span
            className="w-6 h-6 rounded-sm grid place-items-center shrink-0 bg-[color-mix(in_srgb,var(--success)_12%,transparent)] text-success"
            aria-hidden="true"
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
            className="text-[14px] font-semibold text-foreground leading-[1.3] tracking-[-0.005em] m-0 min-w-0 flex-1 truncate"
          >
            {t('file.crop.title')}
          </h4>
          {/* Custom close button (mimics .fa-imv-close) */}
          <button
            type="button"
            className="absolute top-[13px] right-[14px] w-[28px] h-[28px] grid place-items-center bg-transparent border-none rounded-sm text-muted-foreground cursor-pointer opacity-70 transition-[opacity,background,color] z-[2] hover:opacity-100 hover:bg-muted hover:text-foreground font-[inherit]"
            aria-label={t('file.crop.close')}
            onClick={onClose}
          >
            <svg viewBox="0 0 15 15" fill="none" className="w-[14px] h-[14px]" aria-hidden="true">
              <path
                d="M11.78 4.03a.75.75 0 1 0-1.06-1.06L7.5 6.19 4.28 2.97a.75.75 0 0 0-1.06 1.06L6.44 7.25l-3.22 3.22a.75.75 0 1 0 1.06 1.06L7.5 8.31l3.22 3.22a.75.75 0 1 0 1.06-1.06L8.56 7.25l3.22-3.22Z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>

        {/* Body — dark stage */}
        <div
          className={[
            'flex items-center justify-center overflow-hidden flex-1 min-h-[360px] px-6 py-6',
            // Crop dark stage bg — no token (styles.css:286)
            'bg-[#0f1320]',
          ].join(' ')}
        >
          <div
            ref={stageRef}
            className="relative inline-block max-w-full max-h-[60vh] leading-[0] select-none touch-none"
            style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
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
                    // Original — no crop region.
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
                className={[
                  'absolute border-2 border-dashed border-white outline outline-1 outline-offset-[-2px]',
                  'outline-[rgba(15,19,32,.55)] cursor-move box-border',
                  // Crop scrim via large box-shadow — no token (styles.css:289)
                  'shadow-[0_0_0_9999px_rgba(15,19,32,.6)]',
                ].join(' ')}
                style={{ left: frame.l, top: frame.t, width: frame.w, height: frame.h }}
                onPointerDown={onFramePointerDown}
                onPointerMove={onFramePointerMove}
                onPointerUp={endDrag}
                onPointerCancel={endDrag}
              >
                {/* 3-grid lines via pseudo-elements — implemented with child divs (Tailwind) */}
                {/* Vertical thirds */}
                <div
                  className="absolute pointer-events-none z-[1] top-0 bottom-0"
                  style={{
                    // Crop 3-grid lines — no token (styles.css:291-292)
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
                    // Crop 3-grid lines — no token (styles.css:291-292)
                    top: '33.33%',
                    bottom: '33.33%',
                    borderTop: '1px dashed rgba(255,255,255,.5)',
                    borderBottom: '1px dashed rgba(255,255,255,.5)',
                  }}
                  aria-hidden="true"
                />
                {/* Corner handles — bg-white + border-primary (styles.css:293) */}
                {(['nw', 'ne', 'sw', 'se'] as const).map((dir) => (
                  <span
                    key={dir}
                    // Crop corner handle — semi-hardcoded (styles.css:293)
                    className="absolute w-3 h-3 bg-white border border-primary rounded-sm shadow-[0_1px_2px_rgba(0,0,0,.25)] z-[2]"
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
        <div className="flex justify-between items-center gap-3 px-5 py-[10px] border-t border-border bg-muted/50 min-h-[34px]">
          {/* Meta: dimensions + aspect ratio */}
          <span className="inline-flex items-center gap-[6px] tabular-nums">
            <span
              className="inline-flex items-center gap-[5px] h-[22px] px-2 rounded-full bg-card border border-border text-[11.5px] text-secondary-foreground leading-none font-medium tabular-nums"
              title={t('file.crop.areaLabel')}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="w-[11px] h-[11px] text-muted-foreground"
                aria-hidden="true"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="12" y1="3" x2="12" y2="21" />
              </svg>
              <strong className="font-semibold text-foreground">{dimText}</strong>
            </span>

            {/* Aspect ratio selector */}
            <span
              className="inline-flex items-center gap-1 h-[22px] px-1 rounded-full bg-card border border-border"
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
                    className={[
                      'h-[18px] px-2 text-[11px] font-semibold rounded-full border-none cursor-pointer font-[inherit] leading-none tracking-[-0.005em] transition-[background,color]',
                      ratio === a.ratio
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-transparent text-secondary-foreground hover:text-foreground',
                    ].join(' ')}
                    onClick={() => selectRatio(a.ratio)}
                  >
                    {label}
                  </button>
                )
              })}
            </span>
          </span>

          {/* Action buttons */}
          <div className="inline-flex gap-[6px] shrink-0">
            <button
              type="button"
              className="inline-flex items-center h-[34px] px-4 rounded text-[13px] font-semibold border border-border bg-card text-secondary-foreground cursor-pointer font-[inherit] transition-[background,border-color,color] hover:border-[var(--border-strong,var(--border))]"
              onClick={onClose}
            >
              {t('file.crop.cancel')}
            </button>
            <button
              type="button"
              className="inline-flex items-center h-[34px] px-4 rounded text-[13px] font-semibold border-none bg-primary text-primary-foreground cursor-pointer font-[inherit] transition-[background] hover:bg-[var(--primary-hover,var(--primary))]"
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
