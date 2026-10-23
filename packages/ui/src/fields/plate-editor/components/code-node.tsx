
import { forwardRef } from 'react'
import type { PlateElementProps, PlateLeafProps } from 'platejs/react'
import { cn } from '../../../utils/cn'
import { slotAttributes } from '../../../design/slot-style'
import { filterPlateProps } from '../lib/filter-plate-props'
import { plateCodeBlockStyle, plateCodeLeafStyle, plateCodeSyntaxStyle } from './code-node.style'

/**
 * Inline code leaf
 */
export const CodeLeaf = forwardRef<HTMLElement, PlateLeafProps>(
  ({ className, children, ...props }, ref) => {
    const domProps = filterPlateProps(props)
    return (
      <code
        ref={ref}
        className={className}
        {...domProps}
        {...slotAttributes(plateCodeLeafStyle, {})}
      >
        {children}
      </code>
    )
  }
)
CodeLeaf.displayName = 'CodeLeaf'

/**
 * Code block element
 */
export const CodeBlockElement = forwardRef<HTMLPreElement, PlateElementProps>(
  ({ className, children, ...props }, ref) => {
    const domProps = filterPlateProps(props)
    return (
      <pre
        ref={ref}
        className={cn('overflow-x-auto whitespace-pre-wrap break-words max-w-full', className)}
        {...domProps}
        {...slotAttributes(plateCodeBlockStyle, {})}
      >
        <code>{children}</code>
      </pre>
    )
  }
)
CodeBlockElement.displayName = 'CodeBlockElement'

/**
 * Code line element (inside code block)
 */
export const CodeLineElement = forwardRef<HTMLDivElement, PlateElementProps>(
  ({ className, children, ...props }, ref) => {
    const domProps = filterPlateProps(props)
    return (
      <div ref={ref} className={className} {...domProps}>
        {children}
      </div>
    )
  }
)
CodeLineElement.displayName = 'CodeLineElement'

/**
 * Code syntax leaf (for syntax highlighting)
 */
export const CodeSyntaxLeaf = forwardRef<HTMLSpanElement, PlateLeafProps & { tokenType?: string }>(
  ({ className, children, leaf, ...props }, ref) => {
    const domProps = filterPlateProps(props)
    // The token type picks the colour; see the plate-code-syntax slot.
    const tokenType = (leaf as { tokenType?: string }).tokenType

    return (
      <span
        ref={ref}
        className={className}
        {...domProps}
        {...slotAttributes(plateCodeSyntaxStyle, { token: tokenType })}
      >
        {children}
      </span>
    )
  }
)
CodeSyntaxLeaf.displayName = 'CodeSyntaxLeaf'
