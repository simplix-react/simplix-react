import { forwardRef } from 'react'
import type { PlateElementProps } from 'platejs/react'
import { useElement, useSelected, useFocused } from 'platejs/react'
import { cn } from '../../../utils/cn'
import { slotAttributes } from '../../../design/slot-style'
import { filterPlateProps } from '../lib/filter-plate-props'
import {
  plateImagePictureStyle,
  plateImagePlaceholderBodyStyle,
  plateImagePlaceholderSpinnerStyle,
  plateImagePlaceholderStyle,
  plateImagePlaceholderTextStyle,
  plateImageStyle,
} from './image-node.style'

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
      <div ref={ref} className={className} {...domProps} {...slotAttributes(plateImageStyle, {})}>
        <div className="relative inline-block max-w-full">
          <img
            src={element.url}
            alt={element.caption || ''}
            className="max-w-full h-auto"
            {...slotAttributes(plateImagePictureStyle, { selected: selected && focused })}
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
        className={cn('flex items-center justify-center', className)}
        {...domProps}
        {...slotAttributes(plateImagePlaceholderStyle, {})}
      >
        <div
          className="flex flex-col items-center"
          {...slotAttributes(plateImagePlaceholderBodyStyle, {})}
        >
          <div
            className="h-8 w-8"
            {...slotAttributes(plateImagePlaceholderSpinnerStyle, {})}
          />
          <span {...slotAttributes(plateImagePlaceholderTextStyle, {})}>Uploading...</span>
        </div>
        {children}
      </div>
    )
  }
)
PlaceholderElement.displayName = 'PlaceholderElement'
