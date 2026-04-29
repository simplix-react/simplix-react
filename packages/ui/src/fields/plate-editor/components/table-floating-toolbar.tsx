
import {
  Trash2,
  Combine,
  SplitSquareHorizontal,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react'
import { useEditorRef, useEditorSelector } from 'platejs/react'
import { useTableMergeState } from '@platejs/table/react'
import {
  insertTableRow,
  insertTableColumn,
  deleteRow,
  deleteColumn,
  deleteTable,
  mergeTableCells,
  splitTableCell,
  getTableAbove,
} from '@platejs/table'

import { cn } from '../../../utils/cn'
import { Button } from '../../../base/controls/button'
import { Separator } from '../../../base/display/separator'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../../base/overlay/tooltip'
import { useTranslation } from '@simplix-react/i18n/react'

export interface TableFloatingToolbarProps {
  className?: string
}

/**
 * Floating toolbar that appears when cursor is inside a table
 * Shows quick actions for row/column operations
 */
export function TableFloatingToolbar({ className }: TableFloatingToolbarProps) {
  const editor = useEditorRef()
  const { t } = useTranslation("simplix/ui")
  const { canMerge, canSplit } = useTableMergeState()

  // Check if cursor is inside a table
  const isInTable = useEditorSelector(
    (editor) => !!getTableAbove(editor),
    []
  )

  // Get table element for positioning
  const tableEntry = useEditorSelector(
    (editor) => getTableAbove(editor),
    []
  )

  // Don't render if not in a table
  if (!isInTable || !tableEntry) {
    return null
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
    <TooltipProvider delayDuration={0}>
      <div
        className={cn(
          'flex items-center gap-0.5 rounded-md border bg-background p-1 shadow-md',
          'animate-in fade-in-0 zoom-in-95',
          className
        )}
      >
        {/* Row operations */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handleInsertRowAbove}
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            {t('plateEditor.table.insertRowAbove')}
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handleInsertRowBelow}
            >
              <ArrowDown className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            {t('plateEditor.table.insertRowBelow')}
          </TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="mx-0.5 h-5" />

        {/* Column operations */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handleInsertColumnLeft}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            {t('plateEditor.table.insertColumnLeft')}
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handleInsertColumnRight}
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            {t('plateEditor.table.insertColumnRight')}
          </TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="mx-0.5 h-5" />

        {/* Cell operations */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handleMergeCells}
              disabled={!canMerge}
            >
              <Combine className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            {t('plateEditor.table.mergeCells')}
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handleSplitCell}
              disabled={!canSplit}
            >
              <SplitSquareHorizontal className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            {t('plateEditor.table.splitCell')}
          </TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="mx-0.5 h-5" />

        {/* Delete operations */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive hover:text-destructive"
              onClick={handleDeleteRow}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            {t('plateEditor.table.deleteRow')}
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive hover:text-destructive"
              onClick={handleDeleteColumn}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            {t('plateEditor.table.deleteColumn')}
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive hover:text-destructive"
              onClick={handleDeleteTable}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            {t('plateEditor.table.deleteTable')}
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  )
}
