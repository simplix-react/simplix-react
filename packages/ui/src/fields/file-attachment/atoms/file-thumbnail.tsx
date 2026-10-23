import { Star } from 'lucide-react'
import { useTranslation } from '@simplix-react/i18n/react'
import { cn } from '../../../utils/cn'
import { slotAttributes } from '../../../design/slot-style'
import { useFlatUIComponents } from '../../../provider/ui-provider'
import {
  fileThumbnailImageStyle,
  fileThumbnailOverlayStyle,
  fileThumbnailStarStyle,
  fileThumbnailStaticStarStyle,
} from './file-thumbnail.style'

export interface FileThumbnailProps {
  src: string
  representative?: boolean
  onToggleRepresentative?: () => void
  ariaLabel?: string
  /** Container size in pixels. Defaults to 56. */
  size?: number
}

/**
 * Image thumbnail atom with representative (star) badge.
 *
 * raw <img> is allowed for content media (AG-6 / plan §5.3).
 * Star badge colors are hardcoded: no token equivalent exists (R4-7 / plan §5.3).
 *   - Active fill: #FFC107  stroke: #5C3A10
 *
 * Hover: semi-transparent black overlay (bg-black/40) + Tooltip via useFlatUIComponents.
 * The parent FileListItem must carry className="group" for group-hover to work.
 */
export function FileThumbnail({
  src,
  representative,
  onToggleRepresentative,
  ariaLabel,
  size = 56,
}: FileThumbnailProps) {
  const { t } = useTranslation('simplix/ui')
  const { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } = useFlatUIComponents()

  const isInteractive = !!onToggleRepresentative
  const tooltipLabel = representative
    ? t('file.representative.unset')
    : t('file.representative.set')

  const thumbnail = (
    <div
      className={cn(
        'relative shrink-0',
        isInteractive && 'cursor-pointer',
      )}
      style={{ width: size, height: size }}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      aria-pressed={isInteractive ? representative : undefined}
      aria-label={isInteractive ? (ariaLabel ?? tooltipLabel) : undefined}
      onClick={isInteractive ? onToggleRepresentative : undefined}
      onKeyDown={
        isInteractive
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') onToggleRepresentative?.()
            }
          : undefined
      }
    >
      {/* Thumbnail image */}
      <div className="w-full h-full overflow-hidden" {...slotAttributes(fileThumbnailImageStyle, {})}>
        {/* raw <img> permitted for content media (AG-6) */}
        <img
          src={src}
          alt=""
          className="w-full h-full object-cover"
          aria-hidden="true"
        />
      </div>

      {/* Semi-transparent black hover overlay (brief §F) */}
      {isInteractive && (
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
          {...slotAttributes(fileThumbnailOverlayStyle, {})}
        />
      )}

      {/* Star badge - bottom-right absolute overlay */}
      {isInteractive && (
        <span
          className="absolute -right-[5px] -bottom-[5px] flex items-center justify-center w-[17px] h-[17px]"
          aria-hidden="true"
          {...slotAttributes(fileThumbnailStarStyle, { representative })}
        >
          <Star
            size={11}
            // Star color: #FFC107 / fill when active (no token equivalent, hardcoded per plan §5.3/R4-7)
            style={{
              color: representative ? '#FFC107' : 'currentColor',
              fill: representative ? '#FFC107' : 'none',
              stroke: representative ? '#5C3A10' : 'currentColor',
            }}
          />
        </span>
      )}

      {/* Non-interactive representative star (display-only) */}
      {!isInteractive && representative && (
        <span
          className="absolute -right-[5px] -bottom-[5px] flex items-center justify-center w-[17px] h-[17px]"
          aria-label={t('file.representative.label')}
          {...slotAttributes(fileThumbnailStaticStarStyle, {})}
        >
          <Star
            size={11}
            // Star color: #FFC107 / fill always-on (display-only) (no token equivalent, hardcoded per plan §5.3/R4-7)
            style={{ color: '#FFC107', fill: '#FFC107', stroke: '#5C3A10' }}
          />
        </span>
      )}
    </div>
  )

  if (!isInteractive) {
    return thumbnail
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {thumbnail}
        </TooltipTrigger>
        <TooltipContent>{tooltipLabel}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
