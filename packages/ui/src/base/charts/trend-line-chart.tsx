import { type CSSProperties, type MouseEvent, type ReactNode, useId, useRef, useState } from "react";

import { slotAttributes } from "../../design/slot-style";
import { plotAreaStyle, plotAxisStyle, plotCrosshairStyle, plotGridStyle, plotLineStyle, plotPointStyle, plotStyle } from "./plot.style";
import { type PlotPointer, PlotSkeleton, PlotTooltip, useDrawnIn, usePlotKeys, usePlotSize } from "./plot-parts";

/** One series of a trend line chart. */
export interface TrendLineSeries {
  key: string;
  label: string;
  /** Any CSS colour. */
  color: string;
  values: readonly number[];
  /** `soft` draws a thinner line for a series read as the comparison. */
  weight?: "strong" | "soft";
  /** Tints the region under the line; meant for the one series the chart is about. */
  area?: boolean;
}

export interface TrendLineChartProps {
  label: string;
  categories: readonly string[];
  series: readonly TrendLineSeries[];
  /** The value range of the vertical axis and the step between gridlines. */
  domain: { min: number; max: number; step: number };
  hidden?: ReadonlySet<string>;
  loading?: boolean;
  /** What the tooltip says for one category; absent, no tooltip. */
  tooltip?: (index: number) => ReactNode;
}

/** The drawing's proportion; the size itself follows the card (see `usePlotSize`). */
const PLOT_W = 520;
const PLOT_H = 200;
const L = 34;
const B = 24;
const T = 10;
const R = 10;

/**
 * Readings over time as lines, with a crosshair and the readings at the pointer's category.
 *
 * <p>The pointer snaps to the nearest category: the rule moves there, that category's points show
 * and the tooltip lists every visible series at it. A series switched off fades out rather than
 * leaving, so the scale stays put and the remaining lines do not jump.
 */
export function TrendLineChart({ label, categories, series, domain, hidden, loading = false, tooltip }: TrendLineChartProps) {
  const id = useId().replace(/:/g, "");
  const drawn = useDrawnIn();
  const svg = useRef<SVGSVGElement>(null);
  const { W, H } = usePlotSize(svg, PLOT_W, PLOT_H);
  const [hot, setHot] = useState<number | null>(null);
  const [pointer, setPointer] = useState<PlotPointer | null>(null);

  const last = Math.max(1, categories.length - 1);
  const x = (i: number) => L + ((W - L - R) * i) / last;
  const y = (v: number) => T + (H - T - B) * (1 - (v - domain.min) / (domain.max - domain.min));
  const path = (values: readonly number[]) => values.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join("");
  const ticks: number[] = [];
  for (let v = domain.min; v <= domain.max; v += domain.step) ticks.push(v);

  const move = (e: MouseEvent) => {
    const box = svg.current?.getBoundingClientRect();
    if (!box) return;
    const vx = ((e.clientX - box.left) / box.width) * W;
    setHot(Math.max(0, Math.min(last, Math.round(((vx - L) / (W - L - R)) * last))));
    setPointer({ x: e.clientX, y: e.clientY });
  };
  const leave = () => {
    setHot(null);
    setPointer(null);
  };
  const keys = usePlotKeys(svg, categories.length, hot, x, W, (i, at) => {
    setHot(i);
    setPointer(at);
  });
  const tipId = `${id}-tip`;

  return (
    <div
      className="relative"
      {...(tooltip ? { ...keys, "aria-describedby": hot !== null ? tipId : undefined } : {})}
      {...slotAttributes(plotStyle, { loading })}
    >
      <svg ref={svg} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label} className="block h-auto w-full overflow-visible">
        <defs>
          {series
            .filter((s) => s.area)
            .map((s) => (
              <linearGradient key={s.key} id={`${id}-${s.key}`} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" style={{ stopColor: s.color, stopOpacity: 0.16 }} />
                <stop offset="1" style={{ stopColor: s.color, stopOpacity: 0 }} />
              </linearGradient>
            ))}
        </defs>
        {ticks.map((v) => (
          <g key={v}>
            <line x1={L} x2={W} y1={y(v)} y2={y(v)} {...slotAttributes(plotGridStyle, { base: v === domain.min })} />
            <text x={L - 8} y={y(v) + 4} textAnchor="end" {...slotAttributes(plotAxisStyle, {})}>
              {v}
            </text>
          </g>
        ))}
        <line x1={x(hot ?? 0)} x2={x(hot ?? 0)} y1={T} y2={H - B} {...slotAttributes(plotCrosshairStyle, { on: hot !== null })} />
        {series.map((s) => {
          const shown = !hidden?.has(s.key);
          const d = path(s.values);
          return (
            <g key={s.key} style={{ "--series": s.color } as CSSProperties}>
              {s.area && (
                <path
                  d={`${d}L${x(s.values.length - 1)},${H - B}L${x(0)},${H - B}Z`}
                  style={{ fill: `url(#${id}-${s.key})` }}
                  {...slotAttributes(plotAreaStyle, { shown: shown && drawn })}
                />
              )}
              <path
                d={d}
                pathLength={1}
                style={{ strokeDasharray: 1, strokeDashoffset: drawn ? 0 : 1 }}
                {...slotAttributes(plotLineStyle, { weight: s.weight ?? "strong", shown })}
              />
              {s.values.map((v, i) => (
                <circle key={i} cx={x(i)} cy={y(v)} r={hot === i ? 4.5 : 3} {...slotAttributes(plotPointStyle, { hot: shown && hot === i })} />
              ))}
            </g>
          );
        })}
        {categories.map((c, i) => (
          <text key={i} x={x(i)} y={H - 6} textAnchor="middle" {...slotAttributes(plotAxisStyle, {})}>
            {c}
          </text>
        ))}
        <rect x={L} y={T} width={W - L} height={H - T - B} fill="transparent" onMouseMove={move} onMouseLeave={leave} />
      </svg>
      {loading && <PlotSkeleton count={categories.length} />}
      {tooltip && hot !== null && <PlotTooltip at={pointer} id={tipId}>{tooltip(hot)}</PlotTooltip>}
    </div>
  );
}
