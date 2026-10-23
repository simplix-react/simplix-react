
import {
  type ButtonHTMLAttributes,
  type ComponentPropsWithoutRef,
  type ElementRef,
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react'
import { cn } from '../../../utils/cn'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../../base/overlay/tooltip'
import { Separator } from '../../../base/display/separator'
import { partAttributes, slotAttributes } from '../../../design/slot-style'
import {
  plateFixedToolbarStyle,
  plateToolbarButtonStyle,
  plateToolbarGroupStyle,
  plateToolbarSentinelStyle,
  plateToolbarSeparatorStyle,
  plateToolbarTooltipStyle,
} from './toolbar.style'

export interface ToolbarProps extends HTMLAttributes<HTMLDivElement> {
  /** Orientation of the toolbar */
  orientation?: 'horizontal' | 'vertical'
  /** Enable floating effect when sticky */
  floatingEffect?: boolean
}

/**
 * Fixed toolbar container with optional floating effect
 */
export const FixedToolbar = forwardRef<HTMLDivElement, ToolbarProps>(
  ({ className, orientation = 'horizontal', floatingEffect = true, children, ...props }, ref) => {
    const [isSticky, setIsSticky] = useState(false)
    const sentinelRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
      if (!floatingEffect) return

      const sentinel = sentinelRef.current
      if (!sentinel) return

      const observer = new IntersectionObserver(
        ([entry]) => {
          // When sentinel is not intersecting, toolbar is sticky
          setIsSticky(!entry.isIntersecting)
        },
        { threshold: 0 }
      )

      observer.observe(sentinel)
      return () => observer.disconnect()
    }, [floatingEffect])

    return (
      <>
        {/* Sentinel element to detect sticky state */}
        {floatingEffect && (
          <div
            ref={sentinelRef}
            className="h-px w-full"
            aria-hidden="true"
            {...slotAttributes(plateToolbarSentinelStyle, {})}
          />
        )}
        <div
          ref={ref}
          className={cn(
            'sticky z-50 flex items-center',
            orientation === 'vertical' && 'flex-col',
            // Normal state: no top offset
            !isSticky && 'top-0',
            // Floating state: minimal top offset
            floatingEffect && isSticky && 'top-0.5',
            className
          )}
          role="toolbar"
          aria-orientation={orientation}
          {...props}
          {...slotAttributes(plateFixedToolbarStyle, { floating: floatingEffect && isSticky })}
        >
          {children}
        </div>
      </>
    )
  }
)
FixedToolbar.displayName = 'FixedToolbar'

/**
 * Toolbar group for related buttons
 */
export const ToolbarGroup = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn('flex items-center', className)}
      role="group"
      {...props}
      {...slotAttributes(plateToolbarGroupStyle, {})}
    >
      {children}
    </div>
  )
})
ToolbarGroup.displayName = 'ToolbarGroup'

/**
 * Toolbar separator
 */
export const ToolbarSeparator = forwardRef<
  ElementRef<typeof Separator>,
  ComponentPropsWithoutRef<typeof Separator>
>(({ className, ...props }, ref) => {
  return (
    <Separator
      ref={ref}
      orientation="vertical"
      className={cn('h-4', className)}
      {...props}
      {...partAttributes(plateToolbarSeparatorStyle, {})}
    />
  )
})
ToolbarSeparator.displayName = 'ToolbarSeparator'

export interface ToolbarButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Whether the button is active/pressed */
  pressed?: boolean
  /** Tooltip text */
  tooltip?: string
  /** Icon to display */
  icon?: ReactNode
}

/**
 * Basic toolbar button
 */
export const ToolbarButton = forwardRef<HTMLButtonElement, ToolbarButtonProps>(
  ({ className, pressed, tooltip, icon, children, disabled, ...props }, ref) => {
    const button = (
      <button
        ref={ref}
        type="button"
        aria-pressed={pressed}
        // A tooltip only describes an open trigger, it never names it, so an
        // icon-only toolbar button takes its accessible name from the same
        // word the tooltip carries. A caller-supplied aria-label still wins:
        // it arrives in props, which spread after this.
        aria-label={tooltip}
        disabled={disabled}
        className={cn(
          'inline-flex h-6 min-w-6 items-center justify-center',
          'disabled:pointer-events-none',
          className
        )}
        {...props}
        {...slotAttributes(plateToolbarButtonStyle, { pressed })}
      >
        {icon}
        {children}
      </button>
    )

    if (tooltip) {
      return (
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>{button}</TooltipTrigger>
            <TooltipContent side="bottom" {...partAttributes(plateToolbarTooltipStyle, {})}>
              {tooltip}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    }

    return button
  }
)
ToolbarButton.displayName = 'ToolbarButton'
