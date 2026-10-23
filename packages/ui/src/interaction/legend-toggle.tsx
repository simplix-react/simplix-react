import { type CSSProperties, useCallback, useState } from "react";

import { slotAttributes } from "../design/slot-style";
import { legendToggleItemStyle, legendToggleStyle, legendToggleSwatchStyle } from "./legend-toggle.style";

export interface LegendSeries {
  key: string;
  label: string;
  /** Any CSS colour; the swatch is filled with it while the series shows. */
  color: string;
  /** How the swatch is painted, matching the series' marks; defaults to a filled square. */
  fill?: "solid" | "hatch" | "outline" | "dot";
}

/**
 * Which series of a chart are shown, with the last shown one kept on.
 *
 * <p>A chart with every series switched off draws empty axes that read as 「no data」, so the
 * last series refuses to switch off.
 *
 * @param keys - every series key, all shown at first
 * @returns the hidden set, whether a key shows, and a toggle
 */
export function useSeriesVisibility(keys: readonly string[]) {
  const [hidden, setHidden] = useState<ReadonlySet<string>>(() => new Set());
  const toggle = useCallback(
    (key: string) =>
      setHidden((current) => {
        const next = new Set(current);
        if (next.has(key)) next.delete(key);
        else if (keys.filter((k) => !next.has(k)).length > 1) next.add(key);
        return next;
      }),
    [keys],
  );
  return { hidden, isShown: (key: string) => !hidden.has(key), toggle };
}

export interface LegendToggleProps {
  series: readonly LegendSeries[];
  hidden: ReadonlySet<string>;
  onToggle: (key: string) => void;
  className?: string;
}

/** A chart legend whose entries switch their series on and off. */
export function LegendToggle({ series, hidden, onToggle, className }: LegendToggleProps) {
  return (
    <div role="group" className={`flex flex-wrap items-center ${className ?? ""}`.trim()} {...slotAttributes(legendToggleStyle, {})}>
      {series.map((s) => {
        const shown = !hidden.has(s.key);
        return (
          <button
            key={s.key}
            type="button"
            aria-pressed={shown}
            onClick={() => onToggle(s.key)}
            className="inline-flex items-center"
            {...slotAttributes(legendToggleItemStyle, { shown })}
          >
            <span
              data-swatch=""
              aria-hidden="true"
              className="inline-block shrink-0"
              style={{ "--swatch": s.color } as CSSProperties}
              {...slotAttributes(legendToggleSwatchStyle, { fill: s.fill ?? "solid" })}
            />
            {s.label}
          </button>
        );
      })}
    </div>
  );
}
