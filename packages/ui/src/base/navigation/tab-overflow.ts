/** Which ends of a scrolling strip hide content: the start, the end, both or neither. */
export interface OverflowEdges {
  readonly start: boolean;
  readonly end: boolean;
}

/**
 * Reads which ends of a horizontally scrolling strip have content past them.
 *
 * <p>A pixel of slack is allowed at each end: browsers report fractional scroll positions on
 * zoomed or high-density screens, and an arrow that flickers on at `scrollLeft = 0.5` is an arrow
 * pointing at nothing.
 *
 * @param scrollLeft how far the strip has scrolled from its start
 * @param clientWidth the strip's visible width
 * @param scrollWidth the width of everything in the strip
 */
export function overflowEdges(scrollLeft: number, clientWidth: number, scrollWidth: number): OverflowEdges {
  const slack = 1;
  return {
    start: scrollLeft > slack,
    end: scrollLeft + clientWidth < scrollWidth - slack,
  };
}

/** How far one press of an arrow moves the strip: most of a view, so the last tab seen stays in sight. */
export function arrowStep(clientWidth: number): number {
  return Math.max(48, Math.round(clientWidth * 0.8));
}
