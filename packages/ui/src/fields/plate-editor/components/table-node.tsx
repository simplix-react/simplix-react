
import { forwardRef } from 'react'
import type { PlateElementProps } from 'platejs/react'
import { useElement } from 'platejs/react'
import { cn } from '../../../utils/cn'
import type { TElement } from 'platejs'
import { filterPlateProps } from '../lib/filter-plate-props'

// Define interfaces for table elements
interface TableCellElementType extends TElement {
  header?: boolean
  colSpan?: number
  rowSpan?: number
}

/**
 * Table element with selection and margin support
 */
export const TableElement = forwardRef<HTMLTableElement, PlateElementProps>(
  ({ className, children, ...props }, ref) => {
    const domProps = filterPlateProps(props)

    return (
      <div className="my-4 overflow-x-auto">
        <table
          ref={ref}
          className={cn(
            'w-full border-collapse border border-border',
            className
          )}
          {...domProps}
        >
          <tbody>{children}</tbody>
        </table>
      </div>
    )
  }
)
TableElement.displayName = 'TableElement'

/**
 * Table row element
 */
export const TableRowElement = forwardRef<HTMLTableRowElement, PlateElementProps>(
  ({ className, children, ...props }, ref) => {
    const domProps = filterPlateProps(props)

    return (
      <tr ref={ref} className={cn('border-b border-border', className)} {...domProps}>
        {children}
      </tr>
    )
  }
)
TableRowElement.displayName = 'TableRowElement'

/**
 * Table cell element with selection, borders, and resize support
 */
export const TableCellElement = forwardRef<HTMLTableCellElement, PlateElementProps>(
  ({ className, children, style, ...props }, ref) => {
    const element = useElement<TableCellElementType>()
    const isHeader = element.header
    const Component = isHeader ? 'th' : 'td'
    const domProps = filterPlateProps(props)

    return (
      <Component
        ref={ref}
        className={cn(
          'relative border border-border p-2 text-left align-top',
          isHeader && 'bg-muted font-semibold',
          className
        )}
        colSpan={element.colSpan}
        rowSpan={element.rowSpan}
        style={style}
        {...domProps}
      >
        {children}
      </Component>
    )
  }
)
TableCellElement.displayName = 'TableCellElement'

/**
 * Table header cell element
 */
export const TableHeaderCellElement = forwardRef<HTMLTableCellElement, PlateElementProps>(
  ({ className, children, style, ...props }, ref) => {
    const element = useElement<TableCellElementType>()
    const domProps = filterPlateProps(props)

    return (
      <th
        ref={ref}
        className={cn(
          'relative border border-border bg-muted p-2 text-left font-semibold align-top',
          className
        )}
        colSpan={element.colSpan}
        rowSpan={element.rowSpan}
        style={style}
        {...domProps}
      >
        {children}
      </th>
    )
  }
)
TableHeaderCellElement.displayName = 'TableHeaderCellElement'
