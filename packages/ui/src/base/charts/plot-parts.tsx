import { type CSSProperties, type ReactNode, useEffect, useState } from "react";
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

/** The reading that follows the pointer, drawn over everything so no card clips it. */
export function PlotTooltip({ at, children }: { at: PlotPointer | null; children: ReactNode }) {
  if (!at || typeof document === "undefined") return null;
  return createPortal(
    <div
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
