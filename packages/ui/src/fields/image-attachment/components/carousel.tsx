import type { ReactNode } from 'react'
import { useTranslation } from '@simplix-react/i18n/react'
import { cn } from '../../../utils/cn'

export type CarouselStatus = 'empty' | 'uploading' | 'complete' | 'error'

export interface InfoBadgeMeta {
  label: string
  value: string
}

export interface CarouselProps {
  mode?: 'single' | 'multi'
  status?: CarouselStatus
  scene?: ReactNode
  totalDots?: number
  activeDot?: number
  onDotClick?: (idx: number) => void
  onPrev?: () => void
  onNext?: () => void
  fileName?: string
  badgeMeta?: InfoBadgeMeta[]
  uploadProgress?: number
  errorMessage?: string
  rightActions?: ReactNode
  dropContent?: ReactNode
}

export function Carousel({
  mode = 'multi',
  status = 'complete',
  scene,
  totalDots,
  activeDot = 0,
  onDotClick,
  onPrev,
  onNext,
  fileName,
  badgeMeta,
  uploadProgress = 0,
  errorMessage,
  rightActions,
  dropContent,
}: CarouselProps) {
  const { t } = useTranslation('simplix/ui')
  const pct = Math.max(0, Math.min(100, uploadProgress))

  return (
    <div
      className="relative w-full overflow-hidden rounded border border-border bg-muted mt-[18px]"
      data-mode={mode}
    >
      {/* Stage — 16:9 */}
      <div
        className={cn(
          'relative block overflow-hidden',
          // aspect-ratio via tailwind
          'aspect-video',
          // uploading blue gradient overlay — no token (styles.css:149,223)
          status === 'uploading' && [
            "after:absolute after:inset-0 after:content-[''] after:pointer-events-none after:z-[1]",
            'after:bg-[linear-gradient(180deg,rgba(18,104,179,0)_0%,rgba(18,104,179,.55)_100%)]',
          ],
          // error grayscale + red overlay — no token (styles.css:154-155)
          status === 'error' && [
            "after:absolute after:inset-0 after:content-[''] after:pointer-events-none after:z-[1]",
            'after:bg-[rgba(200,53,31,.55)]',
          ],
        )}
      >
        {/* Drop content (single-empty) */}
        {dropContent ?? null}

        {/* Scene image — apply grayscale filter for error */}
        {status !== 'empty' && !dropContent && scene ? (
          <div
            className={cn(
              'absolute inset-0 w-full h-full',
              status === 'error' && [
                // Error grayscale + red overlay — no token (styles.css:154-155,226-227)
                '[&>*]:grayscale [&>*]:brightness-50',
              ],
            )}
          >
            {scene}
          </div>
        ) : null}

        {/* Empty state (no dropContent) */}
        {status === 'empty' && !dropContent ? (
          <div className="absolute inset-0 grid place-items-center bg-muted text-muted-foreground">
            <div className="flex flex-col items-center gap-2 p-5 text-center">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-10 h-10 text-muted-foreground"
                aria-hidden="true"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
              <span className="text-[13.5px] font-semibold text-secondary-foreground">
                {t('file.stage.emptyTitle')}
              </span>
              <span className="text-[12px] text-muted-foreground">
                {t('file.stage.emptyDesc')}
              </span>
            </div>
          </div>
        ) : null}

        {/* Upload progress bar — single mode only (multi shows it on the thumb + detail row
            already, so 3 bars on the slide is redundant; issue #5). */}
        {status === 'uploading' && mode === 'single' ? (
          <div className="absolute left-6 right-6 bottom-16 h-[5px] rounded-full bg-white/35 z-[3] shadow-[0_1px_2px_rgba(0,0,0,.2)]">
            <div
              className="h-full rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,.2)]"
              style={{ width: `${pct}%` }}
            />
            <span
              className="absolute right-0 top-[-22px] font-mono text-[11px] font-semibold text-white tracking-[.01em] text-shadow tabular-nums"
              style={{ textShadow: '0 1px 2px rgba(0,0,0,.45)' }}
            >
              {pct}%
            </span>
          </div>
        ) : null}

        {/* Error overlay icon */}
        {status === 'error' ? (
          <div
            className="absolute inset-0 grid place-items-center z-[2] pointer-events-none"
            aria-hidden="true"
          >
            <div className="flex flex-col items-center gap-2.5 text-center px-5">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="#fff"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.4"
                className="w-[46px] h-[46px]"
                style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,.5))' }}
                aria-hidden="true"
              >
                <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              {errorMessage ? (
                <span
                  className="text-[12.5px] font-semibold text-white tracking-[.01em]"
                  style={{ textShadow: '0 1px 2px rgba(0,0,0,.45)' }}
                >
                  {errorMessage}
                </span>
              ) : null}
            </div>
          </div>
        ) : null}

        {/* Nav buttons — multi + complete only (plan §3.5) */}
        {mode === 'multi' && onPrev && onNext && status === 'complete' ? (
          <>
            <button
              type="button"
              className="absolute top-1/2 -translate-y-1/2 left-[14px] w-[38px] h-[38px] rounded-full bg-white/95 border-none grid place-items-center shadow-md text-foreground z-[2] cursor-pointer transition-transform hover:bg-white hover:scale-105 font-[inherit]"
              aria-label={t('file.nav.prev')}
              onClick={onPrev}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.4"
                className="w-4 h-4"
                aria-hidden="true"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button
              type="button"
              className="absolute top-1/2 -translate-y-1/2 right-[14px] w-[38px] h-[38px] rounded-full bg-white/95 border-none grid place-items-center shadow-md text-foreground z-[2] cursor-pointer transition-transform hover:bg-white hover:scale-105 font-[inherit]"
              aria-label={t('file.nav.next')}
              onClick={onNext}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.4"
                className="w-4 h-4"
                aria-hidden="true"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </>
        ) : null}

        {/* Dots — multi, always render (disabled when not complete per plan §3.5) */}
        {mode === 'multi' && totalDots && totalDots > 1 ? (
          <div className="absolute left-1/2 -translate-x-1/2 bottom-[14px] flex gap-[5px] z-[1]">
            {Array.from({ length: totalDots }).map((_, idx) => (
              <button
                key={idx}
                type="button"
                className={cn(
                  'h-[6px] rounded-full border-none p-0 cursor-pointer transition-[width,background]',
                  idx === activeDot
                    ? 'bg-white w-[16px] rounded-[3px]'
                    : 'bg-white/45 w-[6px]',
                )}
                aria-label={t('file.nav.dotLabel', {
                  index: idx + 1,
                  total: totalDots,
                })}
                disabled={status !== 'complete'}
                onClick={() => onDotClick?.(idx)}
              />
            ))}
          </div>
        ) : null}

        {/* Stage bottom: info-badge + rightActions (always visible when not empty+no dropContent) */}
        {(fileName || rightActions) && status !== 'empty' && !dropContent ? (
          <div className="absolute left-0 right-0 bottom-0 px-[14px] py-3 flex items-end justify-between gap-3 pointer-events-none z-[4]">
            {fileName ? (
              <span
                className={cn(
                  'group relative inline-flex items-center gap-[6px] pointer-events-auto',
                  // Glass bg for stage overlay — no token (styles.css:192,204-205)
                  'bg-[rgba(20,22,30,.62)] backdrop-blur-[8px]',
                  'text-white px-[11px] py-[6px] rounded text-[11.5px] tracking-[.01em] font-medium',
                  'max-w-[calc(100%-90px)] min-w-0 shadow-[0_1px_2px_rgba(0,0,0,.18)] cursor-default',
                )}
                tabIndex={0}
              >
                <svg
                  className="w-[11px] h-[11px] shrink-0 opacity-70"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="M21 15l-5-5L5 21" />
                </svg>
                <span className="font-mono text-[11px] font-semibold whitespace-nowrap overflow-hidden text-ellipsis min-w-0 tracking-[.005em]">
                  {fileName}
                </span>
                {badgeMeta && badgeMeta.length > 0 ? (
                  <span
                    className={cn(
                      'absolute bottom-[calc(100%+8px)] left-0',
                      // Same glass bg + opacity as the file-name badge (styles.css:192) — issue #4
                      'bg-[rgba(20,22,30,.62)] backdrop-blur-[8px] text-white text-[11.5px] leading-[1.5] py-[7px] px-[11px] rounded',
                      'w-max max-w-[280px] text-left font-[500] tracking-[.01em]',
                      'pointer-events-none z-50 opacity-0 invisible',
                      'group-hover:opacity-100 group-hover:visible',
                      'transition-[opacity,transform]',
                    )}
                    role="tooltip"
                  >
                    <strong className="block font-mono font-semibold text-white mb-[3px] text-[10.5px] opacity-75 tracking-[.04em] uppercase">
                      {t('file.nav.badgeInfo')}
                    </strong>
                    {badgeMeta.map((row) => (
                      <span
                        key={row.label}
                        className="flex items-center gap-[6px] font-mono text-[10.5px] text-white/90 tabular-nums leading-[1.5]"
                      >
                        <span className="text-white/60 min-w-[32px] uppercase tracking-[.06em] text-[9.5px] font-semibold">
                          {row.label}
                        </span>
                        {row.value}
                      </span>
                    ))}
                  </span>
                ) : null}
              </span>
            ) : (
              <span />
            )}
            {rightActions ? (
              // White card pill behind the actions so they're distinguishable from the image /
              // empty background (same idea as the file detail row's white background).
              <div className="inline-flex items-center gap-[2px] shrink-0 pointer-events-auto rounded-md bg-card/95 px-1 py-1 shadow-sm backdrop-blur-sm">
                {rightActions}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  )
}
