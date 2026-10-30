import { type CSSProperties, type ReactNode, type MouseEvent, useId, useRef, useState } from "react";

import { slotAttributes } from "../../design/slot-style";
import { plotAxisStyle, plotBarStyle, plotColumnHitStyle, plotGridStyle, plotStyle } from "./plot.style";
import { type PlotFill, type PlotPointer, PlotSkeleton, PlotTooltip, niceStep, useDrawnIn, usePlotKeys, usePlotSize } from "./plot-parts";

/** One series of a stacked column chart. */
export interface StackedColumnSeries {
  key: string;
  label: string;
  /** Any CSS colour. */
  color: string;
  /** How its segments are painted; `outline` reads as 「not yet」, `hatch` keeps a red series apart from a red accent. */
  fill?: PlotFill;
  /** One value per category, already in the units the stack adds up. */
  values: readonly number[];
}

export interface StackedColumnChartProps {
  /** What the chart is, for a screen reader. */
  label: string;
  categories: readonly string[];
  /** Stacked bottom first, in this order. */
  series: readonly StackedColumnSeries[];
  /** Series the reader switched off; they take no height. */
  hidden?: ReadonlySet<string>;
  /** The category drawn in the text colour, such as today. */
  highlight?: number;
  /** Draws the skeleton in the chart's place while the next data is on the way. */
  loading?: boolean;
  /** What the tooltip says for one category; absent, no tooltip. */
  tooltip?: (index: number) => ReactNode;
}

/** The drawing's proportion; the size itself follows the card (see `usePlotSize`). */
const PLOT_W = 520;
const PLOT_H = 200;
const L = 28;
const B = 24;
const T = 8;

/**
 * Columns of stacked counts per category, with a reading per column under the pointer.
 *
 * <p>Pointing at a column shades it and fades every other column, so the one being read stands
 * out; the tooltip follows the pointer. The vertical scale fits the tallest visible stack in four
 * gridlines, so switching a series off rescales what is left.
 */
export function StackedColumnChart({ label, categories, series, hidden, highlight, loading = false, tooltip }: StackedColumnChartProps) {
  const id = useId();
  const drawn = useDrawnIn();
  const svg = useRef<SVGSVGElement>(null);
  const { W, H } = usePlotSize(svg, PLOT_W, PLOT_H);
  const [hot, setHot] = useState<number | null>(null);
  const [pointer, setPointer] = useState<PlotPointer | null>(null);

  const shown = series.filter((s) => !hidden?.has(s.key));
  const totals = categories.map((_, i) => shown.reduce((sum, s) => sum + (s.values[i] ?? 0), 0));
  const step = niceStep(Math.max(0, ...totals));
  const max = step * 4;
  const y = (v: number) => T + (H - T - B) * (1 - v / max);
  const cw = (W - L) / Math.max(1, categories.length);
  const bw = Math.min(16, cw * 0.32);
  const patternId = (key: string) => `${id.replace(/:/g, "")}-${key}`;

  const move = (i: number) => (e: MouseEvent) => {
    setHot(i);
    setPointer({ x: e.clientX, y: e.clientY });
  };
  const leave = () => {
    setHot(null);
    setPointer(null);
  };
  const keys = usePlotKeys(svg, categories.length, hot, (i) => L + cw * i + cw / 2, W, (i, at) => {
    setHot(i);
    setPointer(at);
  });
  const tipId = `${id.replace(/:/g, "")}-tip`;

  return (
    <div
      className="relative"
      {...(tooltip ? { ...keys, "aria-describedby": hot !== null ? tipId : undefined } : {})}
      {...slotAttributes(plotStyle, { loading })}
    >
      <svg ref={svg} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label} className="block h-auto w-full overflow-visible">
        <defs>
          {series
            .filter((s) => s.fill === "hatch")
            .map((s) => (
              <pattern key={s.key} id={patternId(s.key)} width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <rect width="4" height="4" style={{ fill: s.color }} />
                <line x1="0" y1="0" x2="0" y2="4" style={{ stroke: "var(--card)", strokeWidth: 1.6, strokeOpacity: 0.6 }} />
              </pattern>
            ))}
        </defs>
        {[0, 1, 2, 3, 4].map((g) => (
          <g key={g}>
            <line x1={L} x2={W} y1={y(step * g)} y2={y(step * g)} {...slotAttributes(plotGridStyle, { base: g === 0 })} />
            <text x={L - 8} y={y(step * g) + 4} textAnchor="end" {...slotAttributes(plotAxisStyle, {})}>
              {step * g}
            </text>
          </g>
        ))}
        {categories.map((category, i) => {
          const x = L + cw * i + (cw - bw) / 2;
          let acc = 0;
          return (
            <g key={i} onMouseMove={move(i)} onMouseLeave={leave}>
              <rect x={L + cw * i} y={T} width={cw} height={H - T - B} rx={4} {...slotAttributes(plotColumnHitStyle, { hot: hot === i })} />
              {shown.map((s) => {
                const v = s.values[i] ?? 0;
                if (!v) return null;
                const y1 = y(acc + v);
                const y0 = y(acc);
                acc += v;
                const fill = s.fill ?? "solid";
                return (
                  <rect
                    key={s.key}
                    x={x}
                    width={bw}
                    rx={2}
                    style={
                      {
                        // Geometry as properties, so a rescale (a series switched off, a period
                        // switched) eases the segments to their new height instead of jumping.
                        y: y1,
                        height: Math.max(0, y0 - y1 - 1),
                        "--series": s.color,
                        fill: fill === "hatch" ? `url(#${patternId(s.key)})` : undefined,
                        transformBox: "fill-box",
                        transformOrigin: "50% 100%",
                        transform: drawn ? "scaleY(1)" : "scaleY(0)",
                        transitionDelay: drawn ? `0ms, ${i * 45}ms, 0ms, 0ms` : undefined,
                      } as CSSProperties
                    }
                    {...slotAttributes(plotBarStyle, { fill, dimmed: hot !== null && hot !== i })}
                  />
                );
              })}
              <text x={L + cw * i + cw / 2} y={H - 6} textAnchor="middle" {...slotAttributes(plotAxisStyle, { highlighted: i === highlight })}>
                {category}
              </text>
            </g>
          );
        })}
      </svg>
      {loading && <PlotSkeleton count={categories.length} />}
      {tooltip && hot !== null && <PlotTooltip at={pointer} id={tipId}>{tooltip(hot)}</PlotTooltip>}
    </div>
  );
}
