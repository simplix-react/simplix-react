import { type CSSProperties, type KeyboardEvent, type ReactNode, type RefObject, useEffect, useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";

import { slotAttributes } from "../../design/slot-style";
import {
  plotSkeletonBarStyle,
  plotSkeletonStyle,
  plotSwatchStyle,
  plotTooltipRowStyle,
  plotTooltipStyle,
} from "./plot.style";

/** How a series' marks are painted: filled, hatched, or as a dashed outline. */
export type PlotFill = "solid" | "hatch" | "outline";

/** Where the pointer is, in viewport pixels. */
export interface PlotPointer {
  x: number;
  y: number;
}

/**
 * Whether the plot has been on the screen for one frame.
 *
 * <p>Marks are drawn at rest first (a column at zero height, a line not yet traced) and moved to
 * their place on the next frame, so the transition the declaration names draws them in. With
 * reduced motion the duration token is 0 and they simply appear.
 */
export function useDrawnIn(): boolean {
  const [drawn, setDrawn] = useState(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setDrawn(true));
    return () => cancelAnimationFrame(frame);
  }, []);
  return drawn;
}

/**
 * The drawing's size in its own units, kept equal to the pixels it is drawn at.
 *
 * <p>The width follows the box the plot is given and the height keeps the plot's proportion, so
 * the plot grows and shrinks with its card while axis text, strokes and marks stay at the size
 * their declarations name. A fixed view box would scale them with the card instead.
 *
 * @param svg the plot's drawing
 * @param width the width drawn before the box is measured
 * @param height the height at that width
 */
export function usePlotSize(svg: RefObject<SVGSVGElement | null>, width: number, height: number): { W: number; H: number } {
  const [measured, setMeasured] = useState(width);
  useLayoutEffect(() => {
    const el = svg.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const read = () => {
      const w = Math.round(el.getBoundingClientRect().width);
      if (w > 0) setMeasured(w);
    };
    read();
    const observer = new ResizeObserver(read);
    observer.observe(el);
    return () => observer.disconnect();
  }, [svg]);
  return { W: measured, H: Math.round((measured * height) / width) };
}

/**
 * Reading a plot from the keyboard: focus it, then the arrow keys step through its categories.
 *
 * <p>The reading stands where the pointer would have put it over the category's mark, so a reader
 * with a keyboard sees the same tooltip a reader with a mouse does. Home and End jump to the ends,
 * Escape and leaving the plot put the reading away.
 *
 * @param svg the plot's drawing, whose box places the reading
 * @param count how many categories there are
 * @param hot the category being read, or null
 * @param centre where a category's mark stands across the drawing, in its own units
 * @param width the drawing's width in its own units
 * @param show reads a category at a point, or puts the reading away
 * @returns the props for the element that takes the focus
 */
export function usePlotKeys(
  svg: RefObject<SVGSVGElement | null>,
  count: number,
  hot: number | null,
  centre: (index: number) => number,
  width: number,
  show: (index: number | null, at: PlotPointer | null) => void,
) {
  const readAt = (i: number | null) => {
    const box = svg.current?.getBoundingClientRect();
    if (i === null || !box) return show(null, null);
    show(i, { x: box.left + (box.width * centre(i)) / width, y: box.top + box.height * 0.45 });
  };
  return {
    tabIndex: 0,
    onKeyDown: (e: KeyboardEvent) => {
      const at = hot ?? -1;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") readAt(Math.min(count - 1, at + 1));
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp") readAt(at < 0 ? count - 1 : Math.max(0, at - 1));
      else if (e.key === "Home") readAt(0);
      else if (e.key === "End") readAt(count - 1);
      else if (e.key === "Escape" && hot !== null) readAt(null);
      else return;
      e.preventDefault();
    },
    onBlur: () => readAt(null),
  };
}

/** The reading that follows the pointer, drawn over everything so no card clips it. */
export function PlotTooltip({ at, id, children }: { at: PlotPointer | null; id?: string; children: ReactNode }) {
  if (!at || typeof document === "undefined") return null;
  return createPortal(
    <div
      id={id}
      role="tooltip"
      className="pointer-events-none fixed z-[80] flex flex-col"
      style={{ left: at.x, top: at.y, transform: "translate(14px, -50%)" }}
      {...slotAttributes(plotTooltipStyle, {})}
    >
      {children}
    </div>,
    document.body,
  );
}

/** One line of a tooltip: the series' swatch, its name and its value. */
export function PlotTooltipRow({ color, fill = "solid", children }: { color: string; fill?: PlotFill | "dot"; children: ReactNode }) {
  return (
    <span className="flex items-center" {...slotAttributes(plotTooltipRowStyle, {})}>
      <PlotSwatch color={color} fill={fill} />
      {children}
    </span>
  );
}

/** A series' swatch, painted the way its marks are. */
export function PlotSwatch({ color, fill = "solid" }: { color: string; fill?: PlotFill | "dot" }) {
  return (
    <i
      aria-hidden="true"
      className="inline-block size-2 shrink-0"
      style={{ "--series": color } as CSSProperties}
      {...slotAttributes(plotSwatchStyle, { fill })}
    />
  );
}

/** Stand-in columns in the plot's place while its data is on the way. */
export function PlotSkeleton({ count }: { count: number }) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-[14px_16px_30px_40px] flex items-end" {...slotAttributes(plotSkeletonStyle, {})}>
      {Array.from({ length: count }, (_, i) => (
        <i key={i} className="flex-1" style={{ height: `${30 + ((i * 37) % 60)}%` }} {...slotAttributes(plotSkeletonBarStyle, {})} />
      ))}
    </div>
  );
}

/**
 * The step between gridlines that fits the largest value in four steps.
 *
 * @param largest - the tallest stack or highest reading
 * @returns a step from 5 · 10 · 20 · 25 · 50, or the next power-of-ten multiple beyond them
 */
export function niceStep(largest: number): number {
  const steps = [5, 10, 20, 25, 50];
  const fit = steps.find((n) => Math.max(largest, 1) <= n * 4);
  if (fit) return fit;
  let step = 100;
  while (largest > step * 4) step *= 2;
  return step;
}
