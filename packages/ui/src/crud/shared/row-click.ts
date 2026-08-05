import type { MouseEvent } from "react";

/**
 * Marks a region whose own controls own the press — a row's selection checkbox,
 * its action buttons, its drag handle. `onRowClick` never sees a press that
 * started inside one.
 *
 * Without it the whole `<tr>` carries the handler and the caller cannot tell
 * which cell a press came from, so ticking a checkbox also opens the detail the
 * row leads to.
 */
export const ROW_CLICK_IGNORE_ATTR = "data-row-click-ignore";

/** Column ids the list renders for controls rather than for data. */
const CONTROL_COLUMN_IDS = new Set(["_selection", "_actions"]);

/** Spread onto a cell or wrapper to keep its presses out of `onRowClick`. */
export const rowClickIgnoreProps = { [ROW_CLICK_IGNORE_ATTR]: "" } as const;

/** The same props for a generated column, or nothing for a data column. */
export function rowClickIgnoreForColumn(
  columnId: string,
): typeof rowClickIgnoreProps | undefined {
  return CONTROL_COLUMN_IDS.has(columnId) ? rowClickIgnoreProps : undefined;
}

/**
 * Wraps a row handler so presses from a marked region are dropped. Returns
 * `undefined` when there is no handler, so the row stays unclickable.
 */
export function rowClickHandler<T, E extends HTMLElement>(
  row: T,
  onRowClick: ((row: T) => void) | undefined,
): ((event: MouseEvent<E>) => void) | undefined {
  if (!onRowClick) return undefined;
  return (event: MouseEvent<E>) => {
    const target = event.target;
    if (target instanceof Element && target.closest(`[${ROW_CLICK_IGNORE_ATTR}]`)) {
      return;
    }
    onRowClick(row);
  };
}
