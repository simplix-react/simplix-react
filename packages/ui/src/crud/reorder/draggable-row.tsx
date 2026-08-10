import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { flexRender } from "@tanstack/react-table";
import type { Row } from "@tanstack/react-table";

import { cn } from "../../utils/cn";
import type { ColumnWidths } from "../list/column-widths";
import { useFlatUIComponents } from "../../provider/ui-provider";
import type { ReorderConfig } from "../shared";
import { rowClickHandler, rowClickIgnoreForColumn, rowClickIgnoreProps } from "../shared";
import { DragHandleCell } from "./drag-handle";

interface DraggableRowProps<T> {
  row: Row<T>;
  rowId: string;
  isActive?: boolean;
  isSelected?: boolean;
  isDragEnabled: boolean;
  reorderConfig: ReorderConfig<T>;
  onRowClick?: (row: T) => void;
  /** Widths the reader has set, so a sized column's cell is released the same way. */
  columnWidths?: ColumnWidths;
}

export function DraggableRow<T>({
  row,
  rowId,
  isActive,
  isSelected,
  isDragEnabled,
  reorderConfig,
  onRowClick,
  columnWidths,
}: DraggableRowProps<T>) {
  const { TableCell, TableRow } = useFlatUIComponents();
  const canDrag = isDragEnabled && (reorderConfig.canDrag?.(row.original) ?? true);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: rowId,
    disabled: !canDrag,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      className={cn(
        isSelected && "bg-muted/30",
        isActive && "bg-muted/50",
        isDragging && "z-10 opacity-50",
        onRowClick && "cursor-pointer",
      )}
      onClick={rowClickHandler(row.original, onRowClick)}
      data-testid={`list-row-${rowId}`}
    >
      <TableCell className="w-10 px-2" {...rowClickIgnoreProps}>
        <DragHandleCell
          disabled={!canDrag}
          listeners={listeners}
          attributes={attributes}
        />
      </TableCell>
      {row.getVisibleCells().map((cell) => (
        // A column the reader sized, or one declared to flex, zeroes its cell's max-width so the
        // auto table layout stops reading the cell's content as the column's minimum. That is
        // what lets such a column be dragged narrower than what it happens to hold; the cell
        // still renders at the column's width regardless of the zero.
        <TableCell
          key={cell.id}
          className="truncate"
          {...rowClickIgnoreForColumn(cell.column.id)}
          style={
            columnWidths?.[cell.column.id] !== undefined ||
            (cell.column.columnDef.meta as { flexible?: boolean } | undefined)?.flexible
              ? { maxWidth: 0 }
              : undefined
          }
        >
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  );
}
