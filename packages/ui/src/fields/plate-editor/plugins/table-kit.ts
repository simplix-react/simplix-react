
import {
  TablePlugin,
  TableRowPlugin,
  TableCellPlugin,
  TableCellHeaderPlugin,
} from '@platejs/table/react'

import {
  TableElement,
  TableRowElement,
  TableCellElement,
  TableHeaderCellElement,
} from '../components/table-node'

/**
 * Table kit options
 */
export interface TableKitOptions {
  /** Initial table width in pixels (default: 100%) */
  initialTableWidth?: number
  /** Minimum column width in pixels (default: 48) */
  minColumnWidth?: number
  /** Disable cell merging (default: false - merging enabled) */
  disableMerge?: boolean
}

/**
 * Create table kit with custom options
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createTableKit = (options?: TableKitOptions): any[] => {
  const {
    initialTableWidth,
    minColumnWidth = 48,
    disableMerge = false,
  } = options || {}

  return [
    TablePlugin.configure({
      node: { component: TableElement },
      options: {
        initialTableWidth,
        minColumnWidth,
        disableMerge,
      },
    }),
    TableRowPlugin.withComponent(TableRowElement),
    TableCellPlugin.withComponent(TableCellElement),
    TableCellHeaderPlugin.withComponent(TableHeaderCellElement),
  ]
}

/**
 * Table functionality with default options
 * Features:
 * - Cell merging enabled
 * - Minimum column width: 48px
 * - Row/column insert/delete operations
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const TableKit: any[] = createTableKit()
