import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { ReactNode } from "react";

import { Flex } from "../../primitives/flex";
import { cn } from "../../utils/cn";
import type { ReorderConfig } from "../shared";
import { DragHandleCell } from "./drag-handle";

type CardDensity = "compact" | "default" | "comfortable";

const cardDensityPadding: Record<CardDensity, string> = {
  compact: "px-3 py-2",
  default: "px-4 py-3",
  comfortable: "px-5 py-4",
};

interface DraggableCardProps<T> {
  row: T;
  rowId: string;
  index: number;
  isActive?: boolean;
  isSelected?: boolean;
  isDragEnabled: boolean;
  reorderConfig: ReorderConfig<T>;
  selectable?: boolean;
  density?: CardDensity;
  onRowClick?: (row: T) => void;
  onSelectionChange?: (index: number) => void;
  /** Pre-rendered action buttons (ReactNode) to show in the title area. */
  cardActions?: ReactNode;
  /** Title area content. */
  cardTitle?: ReactNode;
  /** Content area below the title. */
  cardContent?: ReactNode;
}

export function DraggableCard<T>({
  row,
  rowId,
  index,
  isActive,
  isSelected,
  isDragEnabled,
  reorderConfig,
  selectable,
  density = "default",
  onRowClick,
  onSelectionChange,
  cardActions,
  cardTitle,
  cardContent,
}: DraggableCardProps<T>) {
  const canDrag = isDragEnabled && (reorderConfig.canDrag?.(row) ?? true);

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

  const dp = cardDensityPadding[density];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "rounded-lg border transition-colors hover:bg-muted/50",
        isSelected && "ring-2 ring-primary",
        isActive && "bg-muted/50",
        isDragging && "z-10 opacity-50",
        onRowClick && "cursor-pointer",
      )}
      onClick={onRowClick ? () => onRowClick(row) : undefined}
      data-testid={`list-row-${rowId}`}
    >
      {cardTitle && (
        <Flex align="center" className="border-b px-1 py-1.5 gap-1">
          <div className="flex shrink-0">
            <DragHandleCell
              disabled={!canDrag}
              listeners={listeners}
              attributes={attributes}
            />
          </div>
          <div className="min-w-0 flex-1">{cardTitle}</div>
          <Flex gap="xs" align="center" className="shrink-0 ml-2">
            {cardActions}
            {selectable && (
              <input
                type="checkbox"
                checked={isSelected ?? false}
                onChange={(e) => {
                  e.stopPropagation();
                  onSelectionChange?.(index);
                }}
                className="h-4 w-4 rounded border-gray-300"
                aria-label={`Select row ${index + 1}`}
              />
            )}
          </Flex>
        </Flex>
      )}
      {cardContent && (
        <div className={cn(dp, cardTitle && "pt-2")}>
          {cardContent}
        </div>
      )}
    </div>
  );
}
