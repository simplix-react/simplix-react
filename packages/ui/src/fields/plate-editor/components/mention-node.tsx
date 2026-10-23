import { forwardRef } from 'react'
import type { PlateElementProps } from 'platejs/react'
import { useElement, useSelected, useFocused } from 'platejs/react'
import { cn } from '../../../utils/cn'
import { slotAttributes } from '../../../design/slot-style'
import { filterPlateProps } from '../lib/filter-plate-props'
import { plateMentionInputStyle, plateMentionStyle } from './mention-node.style'

// Use TElement from platejs for proper typing
import type { TElement } from 'platejs'

// Define a simple interface for mention elements
interface MentionElementType extends TElement {
  value: string
}

/**
 * Mention element (inline)
 */
export const MentionElement = forwardRef<HTMLSpanElement, PlateElementProps>(
  ({ className, children, ...props }, ref) => {
    const element = useElement<MentionElementType>()
    const selected = useSelected()
    const focused = useFocused()
    const domProps = filterPlateProps(props)

    return (
      <span
        ref={ref}
        data-slate-value={element.value}
        contentEditable={false}
        className={cn('inline-flex items-center', className)}
        {...domProps}
        {...slotAttributes(plateMentionStyle, { selected: selected && focused })}
      >
        @{element.value}
        {children}
      </span>
    )
  }
)
MentionElement.displayName = 'MentionElement'

/**
 * Mention input element (while typing mention)
 */
export const MentionInputElement = forwardRef<HTMLSpanElement, PlateElementProps>(
  ({ className, children, ...props }, ref) => {
    const domProps = filterPlateProps(props)
    return (
      <span
        ref={ref}
        className={cn('inline-block', className)}
        {...domProps}
        {...slotAttributes(plateMentionInputStyle, {})}
      >
        {children}
      </span>
    )
  }
)
MentionInputElement.displayName = 'MentionInputElement'
