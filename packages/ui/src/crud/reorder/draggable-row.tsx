import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { flexRender } from "@tanstack/react-table";
import type { Row } from "@tanstack/react-table";

import { cn } from "../../utils/cn";
import { useFlatUIComponents } from "../../provider/ui-provider";
import type { ReorderConfig } from "../shared";
import { DragHandleCell } from "./drag-handle";

interface DraggableRowProps<T> {
  row: Row<T>;
  rowId: string;
  isActive?: boolean;
  isSelected?: boolean;
  isDragEnabled: boolean;
  reorderConfig: ReorderConfig<T>;
  onRowClick?: (row: T) => void;
}

export function DraggableRow<T>({
  row,
  rowId,
  isActive,
  isSelected,
  isDragEnabled,
  reorderConfig,
  onRowClick,
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
      onClick={onRowClick ? () => onRowClick(row.original) : undefined}
      data-testid={`list-row-${rowId}`}
    >
      <TableCell className="w-10 px-2">
        <DragHandleCell
          disabled={!canDrag}
          listeners={listeners}
          attributes={attributes}
        />
      </TableCell>
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id} className="truncate">
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  );
}
