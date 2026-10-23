import { forwardRef } from 'react'
import type { PlateElementProps } from 'platejs/react'
import { useElement } from 'platejs/react'
import { cn } from '../../../utils/cn'
import { slotAttributes } from '../../../design/slot-style'
import { filterPlateProps } from '../lib/filter-plate-props'
import { plateLinkStyle } from './link-node.style'

// Use TElement from platejs for proper typing
import type { TElement } from 'platejs'

// Define a simple interface for link elements
interface LinkElementType extends TElement {
  url: string
}

export const LinkElement = forwardRef<HTMLAnchorElement, PlateElementProps>(
  ({ className, children, ...props }, ref) => {
    const element = useElement<LinkElementType>()
    const domProps = filterPlateProps(props)

    return (
      <a
        ref={ref}
        href={element.url}
        target="_blank"
        rel="noopener noreferrer"
        className={cn('cursor-pointer', className)}
        {...domProps}
        {...slotAttributes(plateLinkStyle, {})}
      >
        {children}
      </a>
    )
  }
)
LinkElement.displayName = 'LinkElement'
