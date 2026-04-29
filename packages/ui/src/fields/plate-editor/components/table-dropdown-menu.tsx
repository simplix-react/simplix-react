
import {
  Table,
  Trash2,
  Combine,
  SplitSquareHorizontal,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Grid3X3,
  SquareDashed,
  Rows3,
  Columns3,
} from 'lucide-react'
import { useEditorRef } from 'platejs/react'
import { useTableMergeState } from '@platejs/table/react'
import {
  insertTable,
  insertTableRow,
  insertTableColumn,
  deleteRow,
  deleteColumn,
  deleteTable,
  mergeTableCells,
  splitTableCell,
} from '@platejs/table'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '../../../base/navigation/dropdown-menu'
import { ToolbarButton, type ToolbarButtonProps } from './toolbar'
import { useTranslation } from '@simplix-react/i18n/react'
import { TableGridPicker } from './table-grid-picker'

export interface TableDropdownMenuProps extends Omit<ToolbarButtonProps, 'onClick'> {}

/**
 * Table dropdown menu with grid picker and organized submenus
 * Structure: Table (grid picker), Cell, Row, Column, Delete table
 */
export function TableDropdownMenu({ children, ...props }: TableDropdownMenuProps) {
  const editor = useEditorRef()
  const { t } = useTranslation("simplix/ui")
  const { canMerge, canSplit } = useTableMergeState()

  // Insert table with selected dimensions
  const handleInsertTable = (rows: number, cols: number) => {
    insertTable(editor, { rowCount: rows, colCount: cols, header: true })
  }

  // Row operations
  const handleInsertRowAbove = () => {
    insertTableRow(editor, { before: true })
  }

  const handleInsertRowBelow = () => {
    insertTableRow(editor)
  }

  const handleDeleteRow = () => {
    deleteRow(editor)
  }

  // Column operations
  const handleInsertColumnLeft = () => {
    insertTableColumn(editor, { before: true })
  }

  const handleInsertColumnRight = () => {
    insertTableColumn(editor)
  }

  const handleDeleteColumn = () => {
    deleteColumn(editor)
  }

  // Cell operations
  const handleMergeCells = () => {
    mergeTableCells(editor)
  }

  const handleSplitCell = () => {
    splitTableCell(editor)
  }

  // Table operations
  const handleDeleteTable = () => {
    deleteTable(editor)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <ToolbarButton tooltip={t('plateEditor.table.menu')} {...props}>
          {children || <Table className="h-4 w-4" />}
        </ToolbarButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[180px]">
        {/* Table - Insert with grid picker */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Grid3X3 className="mr-2 h-4 w-4" />
            {t('plateEditor.table.table')}
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="p-0">
            <TableGridPicker
              maxRows={8}
              maxCols={8}
              onSelect={handleInsertTable}
            />
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* Cell operations */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <SquareDashed className="mr-2 h-4 w-4" />
            {t('plateEditor.table.cell')}
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem onClick={handleMergeCells} disabled={!canMerge}>
              <Combine className="mr-2 h-4 w-4" />
              {t('plateEditor.table.mergeCells')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleSplitCell} disabled={!canSplit}>
              <SplitSquareHorizontal className="mr-2 h-4 w-4" />
              {t('plateEditor.table.splitCell')}
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* Row operations */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Rows3 className="mr-2 h-4 w-4" />
            {t('plateEditor.table.row')}
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem onClick={handleInsertRowAbove}>
              <ArrowUp className="mr-2 h-4 w-4" />
              {t('plateEditor.table.insertRowAbove')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleInsertRowBelow}>
              <ArrowDown className="mr-2 h-4 w-4" />
              {t('plateEditor.table.insertRowBelow')}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleDeleteRow} className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              {t('plateEditor.table.deleteRow')}
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* Column operations */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Columns3 className="mr-2 h-4 w-4" />
            {t('plateEditor.table.column')}
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem onClick={handleInsertColumnLeft}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('plateEditor.table.insertColumnLeft')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleInsertColumnRight}>
              <ArrowRight className="mr-2 h-4 w-4" />
              {t('plateEditor.table.insertColumnRight')}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleDeleteColumn} className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              {t('plateEditor.table.deleteColumn')}
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSeparator />

        {/* Delete Table */}
        <DropdownMenuItem onClick={handleDeleteTable} className="text-destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          {t('plateEditor.table.deleteTable')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
