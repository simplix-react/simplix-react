import { memo } from "react";
import { useDragLayer } from "react-dnd";
import type { XYCoord } from "react-dnd";

import { DragPreview } from "./drag-preview";
import type { CalendarDragItem } from "./item-types";

function getItemStyles(
  initialOffset: XYCoord | null,
  currentOffset: XYCoord | null,
  initialClientOffset: XYCoord | null
): { display: "none" } | { transform: string; WebkitTransform: string } {
  if (!initialOffset || !currentOffset || !initialClientOffset) {
    return { display: "none" };
  }

  const offsetX = initialClientOffset.x - initialOffset.x;
  const offsetY = initialClientOffset.y - initialOffset.y;
  const x = currentOffset.x - offsetX;
  const y = currentOffset.y - offsetY;
  const transform = `translate(${x}px, ${y}px)`;

  return { transform, WebkitTransform: transform };
}

/** Fixed overlay that follows the cursor and renders the drag preview. */
export const CustomDragLayer = memo(() => {
  const { isDragging, item, currentOffset, initialOffset, initialClientOffset } = useDragLayer((monitor) => ({
    item: monitor.getItem() as CalendarDragItem | null,
    isDragging: monitor.isDragging(),
    currentOffset: monitor.getClientOffset(),
    initialOffset: monitor.getInitialSourceClientOffset(),
    initialClientOffset: monitor.getInitialClientOffset(),
  }));

  if (!isDragging || !item) return null;

  const styles = getItemStyles(initialOffset, currentOffset, initialClientOffset);
  if ("display" in styles) return null;

  return (
    <div
      style={{
        position: "fixed",
        pointerEvents: "none",
        zIndex: 100,
        left: 0,
        top: 0,
        width: "100%",
        height: "100%",
      }}
    >
      <DragPreview item={item} transform={styles.transform} />
    </div>
  );
});

CustomDragLayer.displayName = "CustomDragLayer";
