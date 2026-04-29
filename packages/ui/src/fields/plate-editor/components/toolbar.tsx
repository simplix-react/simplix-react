
import * as React from 'react'
import { cn } from '../../../utils/cn'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../../base/overlay/tooltip'
import { Separator } from '../../../base/display/separator'

export interface ToolbarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Orientation of the toolbar */
  orientation?: 'horizontal' | 'vertical'
  /** Enable floating effect when sticky */
  floatingEffect?: boolean
}

/**
 * Fixed toolbar container with optional floating effect
 */
export const FixedToolbar = React.forwardRef<HTMLDivElement, ToolbarProps>(
  ({ className, orientation = 'horizontal', floatingEffect = true, children, ...props }, ref) => {
    const [isSticky, setIsSticky] = React.useState(false)
    const sentinelRef = React.useRef<HTMLDivElement>(null)

    React.useEffect(() => {
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
        {floatingEffect && <div ref={sentinelRef} className="h-px w-full -mb-px" aria-hidden="true" />}
        <div
          ref={ref}
          className={cn(
            'sticky z-50 flex items-center gap-0.5 border-b border-border bg-muted/40 px-1 py-0.5',
            // Only transition floating effect properties, not all (prevents animation on hidden toggle)
            'transition-[top,margin,padding,border-radius,box-shadow,transform,background-color] duration-200 ease-out',
            orientation === 'vertical' && 'flex-col',
            // Normal state: no top offset
            !isSticky && 'top-0',
            // Floating state styles: minimal top offset with rounded corners
            floatingEffect && isSticky && [
              'top-0.5 mx-2 rounded-lg border shadow-md',
              'scale-[0.98] py-1',
              'bg-background/95 backdrop-blur-sm',
            ],
            className
          )}
          role="toolbar"
          aria-orientation={orientation}
          {...props}
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
export const ToolbarGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn('flex items-center gap-0.5', className)}
      role="group"
      {...props}
    >
      {children}
    </div>
  )
})
ToolbarGroup.displayName = 'ToolbarGroup'

/**
 * Toolbar separator
 */
export const ToolbarSeparator = React.forwardRef<
  React.ElementRef<typeof Separator>,
  React.ComponentPropsWithoutRef<typeof Separator>
>(({ className, ...props }, ref) => {
  return (
    <Separator
      ref={ref}
      orientation="vertical"
      className={cn('mx-0.5 h-4', className)}
      {...props}
    />
  )
})
ToolbarSeparator.displayName = 'ToolbarSeparator'

export interface ToolbarButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Whether the button is active/pressed */
  pressed?: boolean
  /** Tooltip text */
  tooltip?: string
  /** Icon to display */
  icon?: React.ReactNode
}

/**
 * Basic toolbar button
 */
export const ToolbarButton = React.forwardRef<HTMLButtonElement, ToolbarButtonProps>(
  ({ className, pressed, tooltip, icon, children, disabled, ...props }, ref) => {
    const button = (
      <button
        ref={ref}
        type="button"
        aria-pressed={pressed}
        disabled={disabled}
        className={cn(
          'inline-flex h-6 min-w-6 items-center justify-center rounded px-1 text-xs font-medium transition-colors',
          'hover:bg-accent hover:text-accent-foreground',
          'focus-visible:outline-none',
          'disabled:pointer-events-none disabled:opacity-50',
          pressed && 'bg-accent text-accent-foreground',
          className
        )}
        {...props}
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
            <TooltipContent side="bottom" className="text-xs">
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
