import type { ReactNode } from 'react'
import { useTranslation } from '@simplix-react/i18n/react'
import { cn } from '../../../utils/cn'
import { slotAttributes } from '../../../design/slot-style'
import {
  carouselActionsStyle,
  carouselBadgeLabelStyle,
  carouselBadgeRowStyle,
  carouselBadgeTitleStyle,
  carouselBadgeTooltipStyle,
  carouselBottomStyle,
  carouselDotStyle,
  carouselDotsStyle,
  carouselEmptyBodyStyle,
  carouselEmptyDescriptionStyle,
  carouselEmptyIconStyle,
  carouselEmptyStyle,
  carouselEmptyTitleStyle,
  carouselErrorBodyStyle,
  carouselErrorMessageStyle,
  carouselFileBadgeIconStyle,
  carouselFileBadgeStyle,
  carouselFileNameStyle,
  carouselNavStyle,
  carouselProgressFillStyle,
  carouselProgressLabelStyle,
  carouselProgressStyle,
  carouselSceneStyle,
  carouselStageStyle,
  carouselStyle,
} from './carousel.style'

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
      className="relative w-full overflow-hidden"
      data-mode={mode}
      {...slotAttributes(carouselStyle, {})}
    >
      {/* Stage - 16:9 */}
      <div
        className={cn(
          'relative block overflow-hidden',
          // aspect-ratio via tailwind
          'aspect-video',
          // uploading blue gradient overlay and error red overlay: no token for either
          // (styles.css:149,223 and 154-155); the overlay colours are in the stage slot.
          (status === 'uploading' || status === 'error') && [
            "after:absolute after:inset-0 after:content-[''] after:pointer-events-none after:z-[1]",
          ],
        )}
        {...slotAttributes(carouselStageStyle, { status })}
      >
        {/* Drop content (single-empty) */}
        {dropContent ?? null}

        {/* Scene image - apply grayscale filter for error */}
        {status !== 'empty' && !dropContent && scene ? (
          <div
            className="absolute inset-0 w-full h-full"
            {...slotAttributes(carouselSceneStyle, { status })}
          >
            {scene}
          </div>
        ) : null}

        {/* Empty state (no dropContent) */}
        {status === 'empty' && !dropContent ? (
          <div className="absolute inset-0 grid place-items-center" {...slotAttributes(carouselEmptyStyle, {})}>
            <div className="flex flex-col items-center" {...slotAttributes(carouselEmptyBodyStyle, {})}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-10 h-10"
                aria-hidden="true"
                {...slotAttributes(carouselEmptyIconStyle, {})}
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
              <span {...slotAttributes(carouselEmptyTitleStyle, {})}>
                {t('file.stage.emptyTitle')}
              </span>
              <span {...slotAttributes(carouselEmptyDescriptionStyle, {})}>
                {t('file.stage.emptyDesc')}
              </span>
            </div>
          </div>
        ) : null}

        {/* Upload progress bar - single mode only (multi shows it on the thumb + detail row
            already, so 3 bars on the slide is redundant; issue #5). */}
        {status === 'uploading' && mode === 'single' ? (
          <div className="absolute left-6 right-6 bottom-16 h-[5px] z-[3]" {...slotAttributes(carouselProgressStyle, {})}>
            <div
              className="h-full"
              style={{ width: `${pct}%` }}
              {...slotAttributes(carouselProgressFillStyle, {})}
            />
            <span
              className="absolute right-0 top-[-22px]"
              style={{ textShadow: '0 1px 2px rgba(0,0,0,.45)' }}
              {...slotAttributes(carouselProgressLabelStyle, {})}
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
            <div className="flex flex-col items-center" {...slotAttributes(carouselErrorBodyStyle, {})}>
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
                  style={{ textShadow: '0 1px 2px rgba(0,0,0,.45)' }}
                  {...slotAttributes(carouselErrorMessageStyle, {})}
                >
                  {errorMessage}
                </span>
              ) : null}
            </div>
          </div>
        ) : null}

        {/* Nav buttons - multi + complete only (plan §3.5) */}
        {mode === 'multi' && onPrev && onNext && status === 'complete' ? (
          <>
            <button
              type="button"
              className="absolute top-1/2 -translate-y-1/2 left-[14px] w-[38px] h-[38px] grid place-items-center z-[2] cursor-pointer"
              aria-label={t('file.nav.prev')}
              onClick={onPrev}
              {...slotAttributes(carouselNavStyle, {})}
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
              className="absolute top-1/2 -translate-y-1/2 right-[14px] w-[38px] h-[38px] grid place-items-center z-[2] cursor-pointer"
              aria-label={t('file.nav.next')}
              onClick={onNext}
              {...slotAttributes(carouselNavStyle, {})}
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

        {/* Dots - multi, always render (disabled when not complete per plan §3.5) */}
        {mode === 'multi' && totalDots && totalDots > 1 ? (
          <div className="absolute left-1/2 -translate-x-1/2 bottom-[14px] flex z-[1]" {...slotAttributes(carouselDotsStyle, {})}>
            {Array.from({ length: totalDots }).map((_, idx) => (
              <button
                key={idx}
                type="button"
                className="h-[6px] cursor-pointer"
                {...slotAttributes(carouselDotStyle, { active: idx === activeDot })}
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
          <div className="absolute left-0 right-0 bottom-0 flex items-end justify-between pointer-events-none z-[4]" {...slotAttributes(carouselBottomStyle, {})}>
            {fileName ? (
              <span
                // The glass background of the stage overlay has no token (styles.css:192,204-205).
                className="group relative inline-flex items-center pointer-events-auto max-w-[calc(100%-90px)] min-w-0 cursor-default"
                tabIndex={0}
                {...slotAttributes(carouselFileBadgeStyle, {})}
              >
                <svg
                  className="w-[11px] h-[11px] shrink-0"
                  {...slotAttributes(carouselFileBadgeIconStyle, {})}
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
                <span className="truncate min-w-0" {...slotAttributes(carouselFileNameStyle, {})}>
                  {fileName}
                </span>
                {badgeMeta && badgeMeta.length > 0 ? (
                  <span
                    // Same glass bg + opacity as the file-name badge (styles.css:192) - issue #4
                    className="absolute bottom-[calc(100%+8px)] left-0 w-max max-w-[280px] pointer-events-none z-50 invisible group-hover:visible"
                    role="tooltip"
                    {...slotAttributes(carouselBadgeTooltipStyle, {})}
                  >
                    <strong className="block" {...slotAttributes(carouselBadgeTitleStyle, {})}>
                      {t('file.nav.badgeInfo')}
                    </strong>
                    {badgeMeta.map((row) => (
                      <span
                        key={row.label}
                        className="flex items-center"
                        {...slotAttributes(carouselBadgeRowStyle, {})}
                      >
                        <span className="min-w-[32px]" {...slotAttributes(carouselBadgeLabelStyle, {})}>
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
              <div className="inline-flex items-center shrink-0 pointer-events-auto" {...slotAttributes(carouselActionsStyle, {})}>
                {rightActions}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  )
}
