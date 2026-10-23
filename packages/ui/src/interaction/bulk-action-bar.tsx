import type { ReactNode } from "react";

import { Button } from "../base/controls/button";
import { slotAttributes } from "../design/slot-style";
import { bulkActionBarActionsStyle, bulkActionBarCountStyle, bulkActionBarStyle } from "./bulk-action-bar.style";

export interface BulkActionBarProps {
  /** How many rows are selected; the bar shows while this is above 0. */
  count: number;
  /** The sentence beside the count, e.g. 「건 선택됨」. */
  countLabel: ReactNode;
  /** The actions the selection can take, as buttons. */
  children: ReactNode;
  /** Clears the selection. */
  onClear: () => void;
  /** The clear button's label, e.g. 「선택 해제」. */
  clearLabel: string;
  className?: string;
}

/**
 * The actions for the rows a reader has selected, in a bar that rises over the list.
 *
 * <p>It stays mounted while nothing is selected so its arrival and departure animate; it is then
 * hidden from assistive technology and takes no pointer. Escape clears the selection from
 * anywhere in the bar.
 */
export function BulkActionBar({ count, countLabel, children, onClear, clearLabel, className }: BulkActionBarProps) {
  const open = count > 0;
  return (
    <div
      role="toolbar"
      aria-hidden={!open}
      inert={!open}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClear();
      }}
      className={`flex items-center ${className ?? ""}`.trim()}
      {...slotAttributes(bulkActionBarStyle, { open })}
    >
      <span {...slotAttributes(bulkActionBarCountStyle, {})}>{count}</span>
      <span>{countLabel}</span>
      <span className="flex flex-1 flex-wrap items-center justify-end" {...slotAttributes(bulkActionBarActionsStyle, {})}>
        {children}
      </span>
      <Button variant="ghost" size="sm" onClick={onClear}>
        {clearLabel}
      </Button>
    </div>
  );
}
