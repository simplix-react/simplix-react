import { cn } from "../../lib/cn";
import { dotBgClass } from "../../lib/item-colors";
import type { CalendarColor } from "../../model/types";

export function EventBullet({ color, className }: { color: CalendarColor; className?: string }) {
  return <div className={cn("size-2 rounded-full", dotBgClass(color), className)} />;
}
