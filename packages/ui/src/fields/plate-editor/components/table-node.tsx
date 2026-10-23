
import { forwardRef } from 'react'
import type { PlateElementProps } from 'platejs/react'
import { useElement } from 'platejs/react'
import { cn } from '../../../utils/cn'
import { slotAttributes } from '../../../design/slot-style'
import type { TElement } from 'platejs'
import { filterPlateProps } from '../lib/filter-plate-props'
import {
  plateTableCellStyle,
  plateTableHeaderCellStyle,
  plateTableRowStyle,
  plateTableScrollStyle,
  plateTableStyle,
} from './table-node.style'

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
      <div className="overflow-x-auto" {...slotAttributes(plateTableScrollStyle, {})}>
        <table
          ref={ref}
          className={cn('w-full', className)}
          {...domProps}
          {...slotAttributes(plateTableStyle, {})}
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
      <tr ref={ref} className={className} {...domProps} {...slotAttributes(plateTableRowStyle, {})}>
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
        className={cn('relative align-top', className)}
        colSpan={element.colSpan}
        rowSpan={element.rowSpan}
        style={style}
        {...domProps}
        {...slotAttributes(plateTableCellStyle, { header: !!isHeader })}
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
        className={cn('relative align-top', className)}
        colSpan={element.colSpan}
        rowSpan={element.rowSpan}
        style={style}
        {...domProps}
        {...slotAttributes(plateTableHeaderCellStyle, {})}
      >
        {children}
      </th>
    )
  }
)
TableHeaderCellElement.displayName = 'TableHeaderCellElement'
