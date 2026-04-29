
import * as React from 'react'
import { cn } from '../../../utils/cn'

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
  const [hoveredCell, setHoveredCell] = React.useState<{ row: number; col: number } | null>(null)

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
    <div className="p-2" onMouseLeave={handleMouseLeave}>
      <div className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(${maxCols}, 1fr)` }}>
        {Array.from({ length: maxRows }, (_, rowIndex) =>
          Array.from({ length: maxCols }, (_, colIndex) => {
            const row = rowIndex + 1
            const col = colIndex + 1
            const isHighlighted = isCellHighlighted(row, col)

            return (
              <button
                key={`${row}-${col}`}
                type="button"
                className={cn(
                  'h-4 w-4 border border-border rounded-[2px] transition-colors',
                  isHighlighted
                    ? 'bg-primary border-primary'
                    : 'bg-background hover:border-primary/50'
                )}
                onMouseEnter={() => handleCellHover(row, col)}
                onClick={() => handleCellClick(row, col)}
              />
            )
          })
        )}
      </div>
      {hoveredCell && (
        <div className="mt-2 text-center text-sm text-muted-foreground">
          {formatLabel(hoveredCell.row, hoveredCell.col)}
        </div>
      )}
    </div>
  )
}
