
import { forwardRef } from 'react'
import type { PlateLeafProps } from 'platejs/react'
import { cn } from '../../../utils/cn'
import { filterPlateProps } from '../lib/filter-plate-props'

/**
 * Highlight leaf for highlighted text
 */
export const HighlightLeaf = forwardRef<HTMLElement, PlateLeafProps>(
  ({ className, children, ...props }, ref) => {
    const domProps = filterPlateProps(props)
    return (
      <mark
        ref={ref}
        className={cn('bg-yellow-200 dark:bg-yellow-800/50 px-0.5', className)}
        {...domProps}
      >
        {children}
      </mark>
    )
  }
)
HighlightLeaf.displayName = 'HighlightLeaf'

/**
 * Kbd leaf for keyboard shortcuts display
 */
export const KbdLeaf = forwardRef<HTMLElement, PlateLeafProps>(
  ({ className, children, ...props }, ref) => {
    const domProps = filterPlateProps(props)
    return (
      <kbd
        ref={ref}
        className={cn(
          'rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-xs shadow-sm',
          className
        )}
        {...domProps}
      >
        {children}
      </kbd>
    )
  }
)
KbdLeaf.displayName = 'KbdLeaf'
