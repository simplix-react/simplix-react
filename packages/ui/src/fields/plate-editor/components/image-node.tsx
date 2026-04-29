
import { forwardRef } from 'react'
import type { PlateElementProps } from 'platejs/react'
import { useElement, useSelected, useFocused } from 'platejs/react'
import { cn } from '../../../utils/cn'
import { filterPlateProps } from '../lib/filter-plate-props'

// Use TElement from platejs for proper typing
import type { TElement } from 'platejs'

// Define a simple interface for image elements
interface ImageElementType extends TElement {
  url: string
  caption?: string
}

export const ImageElement = forwardRef<HTMLDivElement, PlateElementProps>(
  ({ className, children, ...props }, ref) => {
    const element = useElement<ImageElementType>()
    const selected = useSelected()
    const focused = useFocused()
    const domProps = filterPlateProps(props)

    return (
      <div ref={ref} className={cn('my-4', className)} {...domProps}>
        <div className="relative inline-block max-w-full">
          <img
            src={element.url}
            alt={element.caption || ''}
            className={cn(
              'max-w-full h-auto rounded-md',
              selected && focused && 'ring-2 ring-primary ring-offset-2'
            )}
          />
        </div>
        {children}
      </div>
    )
  }
)
ImageElement.displayName = 'ImageElement'

/**
 * Placeholder element for uploading images
 */
export const PlaceholderElement = forwardRef<HTMLDivElement, PlateElementProps>(
  ({ className, children, ...props }, ref) => {
    const domProps = filterPlateProps(props)
    return (
      <div
        ref={ref}
        className={cn(
          'my-4 flex items-center justify-center rounded-md border-2 border-dashed border-muted-foreground/25 bg-muted/50 p-8',
          className
        )}
        {...domProps}
      >
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="text-sm">Uploading...</span>
        </div>
        {children}
      </div>
    )
  }
)
PlaceholderElement.displayName = 'PlaceholderElement'
