
import { useTranslation } from '@simplix-react/i18n/react'
import { useState } from 'react'

import { slotAttributes } from '../../../design/slot-style'
import {
  plateTableGridCellStyle,
  plateTableGridCellsStyle,
  plateTableGridLabelStyle,
  plateTableGridStyle,
} from './table-grid-picker.style'

export interface TableGridPickerProps {
  /** Maximum number of rows in the grid (default: 8) */
  maxRows?: number
  /** Maximum number of columns in the grid (default: 8) */
  maxCols?: number
  /** Callback when a grid size is selected */
  onSelect?: (rows: number, cols: number) => void
  /** Label format function */
  formatLabel?: (rows: number, cols: number) => string
}

/**
 * Grid picker for selecting table dimensions
 * Allows users to hover and click to select rows x columns
 */
export function TableGridPicker({
  maxRows = 8,
  maxCols = 8,
  onSelect,
  formatLabel = (rows, cols) => `${cols} x ${rows}`,
}: TableGridPickerProps) {
  const { t } = useTranslation('simplix/ui')
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null)

  const handleCellHover = (row: number, col: number) => {
    setHoveredCell({ row, col })
  }

  const handleCellClick = (row: number, col: number) => {
    onSelect?.(row, col)
  }

  const handleMouseLeave = () => {
    setHoveredCell(null)
  }

  const isCellHighlighted = (row: number, col: number) => {
    if (!hoveredCell) return false
    return row <= hoveredCell.row && col <= hoveredCell.col
  }

  return (
    <div onMouseLeave={handleMouseLeave} {...slotAttributes(plateTableGridStyle, {})}>
      <div className="grid" style={{ gridTemplateColumns: `repeat(${maxCols}, 1fr)` }} {...slotAttributes(plateTableGridCellsStyle, {})}>
        {Array.from({ length: maxRows }, (_, rowIndex) =>
          Array.from({ length: maxCols }, (_, colIndex) => {
            const row = rowIndex + 1
            const col = colIndex + 1
            const isHighlighted = isCellHighlighted(row, col)

            return (
              <button
                key={`${row}-${col}`}
                type="button"
                aria-label={t('plateEditor.table.gridSize', { rows: row, cols: col })}
                className="h-4 w-4"
                {...slotAttributes(plateTableGridCellStyle, { highlighted: isHighlighted })}
                onMouseEnter={() => handleCellHover(row, col)}
                onClick={() => handleCellClick(row, col)}
              />
            )
          })
        )}
      </div>
      {hoveredCell && (
        <div {...slotAttributes(plateTableGridLabelStyle, {})}>
          {formatLabel(hoveredCell.row, hoveredCell.col)}
        </div>
      )}
    </div>
  )
}
