import { Star } from 'lucide-react'
import { useTranslation } from '@simplix-react/i18n/react'
import { cn } from '../../../utils/cn'
import { useFlatUIComponents } from '../../../provider/ui-provider'

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
      <div className="w-full h-full rounded-sm overflow-hidden bg-muted">
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
          className={cn(
            'absolute inset-0 rounded-sm bg-black/40',
            'opacity-0 group-hover:opacity-100 transition-opacity duration-150',
            'pointer-events-none',
          )}
          aria-hidden="true"
        />
      )}

      {/* Star badge — bottom-right absolute overlay */}
      {isInteractive && (
        <span
          className={cn(
            'absolute -right-[5px] -bottom-[5px] flex items-center justify-center',
            'w-[17px] h-[17px] rounded-full bg-background shadow-sm',
            'transition-opacity duration-150',
            representative
              ? 'opacity-100 scale-100'
              : 'opacity-0 group-hover:opacity-60',
          )}
          aria-hidden="true"
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
          className="absolute -right-[5px] -bottom-[5px] flex items-center justify-center w-[17px] h-[17px] rounded-full bg-background shadow-sm"
          aria-label={t('file.representative.label')}
        >
          <Star
            size={11}
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
