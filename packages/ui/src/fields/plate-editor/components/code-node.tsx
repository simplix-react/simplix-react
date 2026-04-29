
import { forwardRef } from 'react'
import type { PlateElementProps, PlateLeafProps } from 'platejs/react'
import { cn } from '../../../utils/cn'
import { filterPlateProps } from '../lib/filter-plate-props'

/**
 * Inline code leaf
 */
export const CodeLeaf = forwardRef<HTMLElement, PlateLeafProps>(
  ({ className, children, ...props }, ref) => {
    const domProps = filterPlateProps(props)
    return (
      <code
        ref={ref}
        className={cn(
          'bg-muted px-1.5 py-0.5 rounded text-sm font-mono',
          className
        )}
        {...domProps}
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
        className={cn(
          'my-4 overflow-x-auto rounded-lg bg-muted p-4 font-mono text-sm',
          'whitespace-pre-wrap break-words max-w-full',
          className
        )}
        {...domProps}
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
      <div ref={ref} className={cn('', className)} {...domProps}>
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
    // Map token types to colors
    const tokenColors: Record<string, string> = {
      comment: 'text-gray-500',
      prolog: 'text-gray-500',
      doctype: 'text-gray-500',
      cdata: 'text-gray-500',
      punctuation: 'text-gray-400',
      property: 'text-blue-400',
      tag: 'text-pink-400',
      boolean: 'text-orange-400',
      number: 'text-orange-400',
      constant: 'text-orange-400',
      symbol: 'text-orange-400',
      selector: 'text-green-400',
      'attr-name': 'text-green-400',
      string: 'text-green-400',
      char: 'text-green-400',
      builtin: 'text-cyan-400',
      operator: 'text-yellow-400',
      entity: 'text-yellow-400',
      url: 'text-yellow-400',
      variable: 'text-red-400',
      atrule: 'text-purple-400',
      'attr-value': 'text-purple-400',
      function: 'text-blue-400',
      keyword: 'text-purple-400',
      regex: 'text-red-400',
      important: 'text-red-400 font-bold',
    }

    const tokenType = (leaf as { tokenType?: string }).tokenType
    const colorClass = tokenType ? tokenColors[tokenType] : ''

    return (
      <span ref={ref} className={cn(colorClass, className)} {...domProps}>
        {children}
      </span>
    )
  }
)
CodeSyntaxLeaf.displayName = 'CodeSyntaxLeaf'
