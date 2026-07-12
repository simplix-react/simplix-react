import type { ReactNode } from "react";

import type { CalendarItem } from "../../model/types";

/** react-dnd drag source/target key. */
export const ItemTypes = {
  ITEM: "calendar-item",
} as const;

/** Payload carried while dragging a calendar item. */
export interface CalendarDragItem {
  item: CalendarItem;
  children: ReactNode;
  width: number;
  height: number;
  durationMs: number;
}
