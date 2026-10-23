import { forwardRef } from 'react'
import type { PlateLeafProps } from 'platejs/react'
import { slotAttributes } from '../../../design/slot-style'
import { filterPlateProps } from '../lib/filter-plate-props'
import { plateHighlightStyle, plateKbdStyle } from './mark-node.style'

/**
 * Highlight leaf for highlighted text
 */
export const HighlightLeaf = forwardRef<HTMLElement, PlateLeafProps>(
  ({ className, children, ...props }, ref) => {
    const domProps = filterPlateProps(props)
    return (
      <mark
        ref={ref}
        className={className}
        {...domProps}
        {...slotAttributes(plateHighlightStyle, {})}
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
      <kbd ref={ref} className={className} {...domProps} {...slotAttributes(plateKbdStyle, {})}>
        {children}
      </kbd>
    )
  }
)
KbdLeaf.displayName = 'KbdLeaf'
