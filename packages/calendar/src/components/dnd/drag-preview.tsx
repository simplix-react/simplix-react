import { memo } from "react";

import type { CalendarDragItem } from "./item-types";

interface DragPreviewProps {
  item: CalendarDragItem;
  transform: string;
}

/** Renders the dragged item's original markup at the cursor. */
export const DragPreview = memo(({ item, transform }: DragPreviewProps) => {
  return (
    <div
      style={{
        width: item.width,
        height: item.height,
        transform,
        WebkitTransform: transform,
      }}
    >
      {item.children}
    </div>
  );
});

DragPreview.displayName = "DragPreview";
