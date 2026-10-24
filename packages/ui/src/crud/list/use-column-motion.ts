import { type RefObject, useLayoutEffect, useRef } from "react";

import { readDuration } from "../../utils/motion-duration";

/** Every cell of one column: the header cell and the body cells at the same position, group headings excluded. */
function columnCells(table: HTMLTableElement, position: number): HTMLElement[] {
  return Array.from(
    table.querySelectorAll<HTMLElement>(`tr > :nth-child(${position + 1}):not([colspan])`),
  );
}

/**
 * Moves a table's columns instead of letting them jump when the set of shown columns changes:
 * a column that arrives (the list widened, the reader turned it on) fades and slides in, and the
 * columns that stay glide from where they were to where they now sit. Reads `--dur-slow` and
 * `--ease` from the table, so a reader who asked for less motion gets the end state at once.
 *
 * @param containerRef - an element holding the table
 * @param columnIds - the shown columns in order, as the header row draws them
 */
export function useColumnMotion(containerRef: RefObject<HTMLElement | null>, columnIds: readonly string[]): void {
  const previous = useRef<{ key: string; lefts: Map<string, number> } | null>(null);
  const key = columnIds.join("\u0000");

  // Runs after every commit, so the remembered positions are those of the last paint (the list
  // re-renders on each width change) rather than those of the last column change.
  useLayoutEffect(() => {
    const table = containerRef.current?.querySelector("table");
    if (!table) {
      previous.current = null;
      return;
    }
    // Measured from the table's own edge, so a page that scrolled or a panel that moved the whole
    // table is not read as a column moving.
    const origin = table.getBoundingClientRect().left;
    const heads = Array.from(table.querySelectorAll<HTMLElement>("thead tr:first-child > th"));
    const lefts = new Map<string, number>();
    columnIds.forEach((id, i) => {
      const head = heads[i];
      if (head) lefts.set(id, head.getBoundingClientRect().left - origin);
    });
    const before = previous.current;
    previous.current = { key, lefts };
    if (!before || before.key === key || typeof table.animate !== "function") return;

    const style = getComputedStyle(table);
    const duration = readDuration(style.getPropertyValue("--dur-slow"));
    if (duration <= 0) return;
    const easing = style.getPropertyValue("--ease").trim() || "ease-out";

    columnIds.forEach((id, i) => {
      const now = lefts.get(id);
      if (now === undefined) return;
      const was = before.lefts.get(id);
      if (was === undefined) {
        for (const cell of columnCells(table, i)) {
          cell.animate(
            [{ opacity: 0, transform: "translateX(12px)" }, { opacity: 1, transform: "none" }],
            { duration, easing },
          );
        }
        return;
      }
      const dx = was - now;
      if (Math.abs(dx) < 1) return;
      for (const cell of columnCells(table, i)) {
        cell.animate([{ transform: `translateX(${dx}px)` }, { transform: "none" }], { duration, easing });
      }
    });
  });
}
