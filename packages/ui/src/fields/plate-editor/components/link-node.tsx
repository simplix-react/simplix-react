
import { forwardRef } from 'react'
import type { PlateElementProps } from 'platejs/react'
import { useElement } from 'platejs/react'
import { cn } from '../../../utils/cn'
import { filterPlateProps } from '../lib/filter-plate-props'

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
        className={cn(
          'text-primary underline underline-offset-4 hover:text-primary/80 cursor-pointer',
          className
        )}
        {...domProps}
      >
        {children}
      </a>
    )
  }
)
LinkElement.displayName = 'LinkElement'
