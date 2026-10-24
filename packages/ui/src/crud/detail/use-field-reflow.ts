import { type RefObject, useLayoutEffect } from "react";

import { readDuration } from "../../utils/motion-duration";

/**
 * Glides the fields of a section grid to their new places when a resize changes how many columns
 * it has, instead of letting them jump (FLIP). Positions are remembered after every resize, so the
 * animation starts from where each field was last painted. Reads `--dur-slow` and `--ease`; a zero
 * duration (reduced motion) turns it off.
 */
export function useFieldReflow(ref: RefObject<HTMLElement | null>): void {
  useLayoutEffect(() => {
    const root = ref.current;
    if (!root || typeof ResizeObserver === "undefined") return;
    // A responsive `Grid` puts its ref on a container-query wrapper around the grid itself.
    const grid = root.classList.contains("grid") ? root : (root.querySelector<HTMLElement>(":scope > .grid") ?? root);
    const place = (el: Element) => {
      const box = el.getBoundingClientRect();
      const origin = grid.getBoundingClientRect();
      return { x: box.left - origin.left, y: box.top - origin.top };
    };
    let last = new Map<Element, { x: number; y: number }>();
    const record = () => {
      last = new Map(Array.from(grid.children, (child) => [child, place(child)]));
    };
    record();
    const observer = new ResizeObserver(() => {
      const style = getComputedStyle(grid);
      const duration = readDuration(style.getPropertyValue("--dur-slow"));
      const easing = style.getPropertyValue("--ease").trim() || "ease-out";
      for (const child of Array.from(grid.children)) {
        const was = last.get(child);
        if (!was || duration <= 0 || typeof (child as HTMLElement).animate !== "function") continue;
        const now = place(child);
        const dx = was.x - now.x;
        const dy = was.y - now.y;
        // A plain width change moves nothing by more than a pixel; only a column switch does.
        if (Math.abs(dx) < 24 && Math.abs(dy) < 8) continue;
        (child as HTMLElement).animate(
          [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "translate(0, 0)" }],
          { duration, easing },
        );
      }
      record();
    });
    observer.observe(grid);
    return () => observer.disconnect();
  }, [ref]);
}
