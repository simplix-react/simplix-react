import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useTranslation } from "@simplix-react/i18n/react";
import type { ReactNode } from "react";

import { Flex } from "../../primitives/flex";
import { slotAttributes, partAttributes } from "../../design/slot-style";
import { cn } from "../../utils/cn";
import type { ReorderConfig } from "../shared";
import { rowClickHandler, rowClickIgnoreProps } from "../shared";
import {
  crudCardActionsStyle,
  crudCardBodyStyle,
  crudCardHeaderStyle,
  crudSelectCheckboxStyle,
  crudCardStyle,
} from "../shared/crud-card.style";
import { DragHandleCell } from "./drag-handle";

type CardDensity = "compact" | "default" | "comfortable";

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
  const { t } = useTranslation("simplix/ui");
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(isDragging && "z-10", onRowClick && "cursor-pointer")}
      {...slotAttributes(crudCardStyle, { selected: isSelected, active: isActive, dragging: isDragging })}
      onClick={rowClickHandler(row, onRowClick)}
      data-testid={`list-row-${rowId}`}
    >
      {cardTitle && (
        <Flex align="center" {...partAttributes(crudCardHeaderStyle, {})}>
          <div className="flex shrink-0" {...rowClickIgnoreProps}>
            <DragHandleCell
              disabled={!canDrag}
              listeners={listeners}
              attributes={attributes}
            />
          </div>
          <div className="min-w-0 flex-1">{cardTitle}</div>
          <Flex gap="xs" align="center" className="shrink-0" {...rowClickIgnoreProps} {...partAttributes(crudCardActionsStyle, {})}>
            {cardActions}
            {selectable && (
              <input
                type="checkbox"
                checked={isSelected ?? false}
                onChange={() => onSelectionChange?.(index)}
                className="h-4 w-4"
                {...slotAttributes(crudSelectCheckboxStyle, {})}
                aria-label={t("list.selectRow", { index: index + 1 })}
              />
            )}
          </Flex>
        </Flex>
      )}
      {cardContent && (
        <div {...slotAttributes(crudCardBodyStyle, { density, titled: Boolean(cardTitle) })}>
          {cardContent}
        </div>
      )}
    </div>
  );
}
