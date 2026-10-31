// Presentational subcomponents for the time range selector. These are pure of
// interaction logic; the parent wires handlers and passes computed geometry.

import { memo, useEffect, useRef, useState } from "react";
import ReactApexChart from "react-apexcharts";

import { cn } from "../../../utils/cn";
import { slotAttributes } from "../../../design/slot-style";
import { DatePicker } from "../date-picker";
import { formatBucketLabel } from "./helpers";
import { ChevronLeftIcon, ChevronRightIcon, ClearIcon } from "./icons";
import { CHART_HEIGHT, CUSTOM_PRESET_KEY, type WindowPreset } from "./types";
import {
  timeRangeCustomChipClearStyle,
  timeRangeCustomChipStyle,
  timeRangeFieldColonStyle,
  timeRangeFieldInputStyle,
  timeRangeFieldLabelStyle,
  timeRangeFieldRowStyle,
  timeRangeFieldStyle,
  timeRangeFieldTimeStyle,
  timeRangeLabelStyle,
  timeRangeLabelsStyle,
  timeRangeNavButtonStyle,
  timeRangeNowLineStyle,
  timeRangePresetSelectStyle,
  timeRangePresetStyle,
  timeRangePresetsStyle,
  timeRangeSelectionBoxStyle,
  timeRangeTooltipArrowStyle,
  timeRangeTooltipCountStyle,
  timeRangeTooltipStyle,
} from "./time-range-selector.style";

type TFunc = (key: string, opts?: { defaultValue?: string }) => string;

// ── Heatmap canvas (memoized so drag/hover re-renders do not redraw the chart) ──

interface HeatmapCanvasProps {
  chartKey: string;
  options: ApexCharts.ApexOptions;
  series: { name: string; data: { x: string; y: number }[] }[];
}

export const HeatmapCanvas = memo(function HeatmapCanvas({ chartKey, options, series }: HeatmapCanvasProps) {
  return (
    <ReactApexChart key={chartKey} type="heatmap" options={options} series={series} height={CHART_HEIGHT} />
  );
});

// ── Navigation arrows ──

export function NavButton({ direction, onClick, label }: { direction: "prev" | "next"; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      className="shrink-0 flex items-center justify-center w-6 h-5"
      onClick={onClick}
      aria-label={label}
      {...slotAttributes(timeRangeNavButtonStyle, {})}
    >
      {direction === "prev" ? <ChevronLeftIcon className="size-3.5" /> : <ChevronRightIcon className="size-3.5" />}
    </button>
  );
}

// ── Preset bar (with optional custom chip) ──

function formatPresetLabel(preset: WindowPreset, t: TFunc): string {
  // Default label: split a `<number><unit>` key and translate only the unit suffix.
  const match = preset.key.match(/^(\d+)(\w+)$/);
  const fallback = match ? `${match[1]}${t(`timeRange.units.${match[2]}`, { defaultValue: match[2] })}` : preset.label;
  // Allow a localizer/host to override the whole label per preset key.
  return t(`timeRange.presets.${preset.key}`, { defaultValue: fallback });
}

interface PresetBarProps {
  presets: WindowPreset[];
  activeKey: string;
  onSelect: (preset: WindowPreset) => void;
  isCustom: boolean;
  onZoomOut: () => void;
  /** Whether a span is selected — the two selection actions only mean something then. */
  t: TFunc;
}

/**
 * Below this controls-bar width the eleven presets no longer fit beside the range badge, and
 * the row folds into a select. Measured on the bar rather than on the preset group itself: the
 * group is what gets squeezed, so its own width never tells you it has run out of room.
 */
const PRESET_ROW_MIN_PX = 620;

export function PresetBar({ presets, activeKey, onSelect, isCustom, onZoomOut, t }: PresetBarProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const el = ref.current?.parentElement;
    if (!el || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(([entry]) => setCompact(entry.contentRect.width < PRESET_ROW_MIN_PX));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const customChip = isCustom && (
    <button
      type="button"
      className="flex items-center"
      {...slotAttributes(timeRangeCustomChipStyle, {})}
      onClick={onZoomOut}
      aria-label={t("timeRange.zoomOut", { defaultValue: "Zoom out to preset window" })}
      title={t("timeRange.zoomOut", { defaultValue: "Zoom out to preset window" })}
    >
      {t("timeRange.custom", { defaultValue: "Custom" })}
      <span
        className="inline-flex items-center justify-center size-3.5"
        aria-hidden="true"
        {...slotAttributes(timeRangeCustomChipClearStyle, {})}
      >
        <ClearIcon size={8} />
      </span>
    </button>
  );

  // Narrow: one control instead of eleven. The presets are mutually exclusive, so a select says
  // the same thing as the row and costs a line instead of a wrap.
  if (compact) {
    return (
      <div
        ref={ref}
        className="flex items-center"
        {...slotAttributes(timeRangePresetsStyle, { layout: "compact" })}
      >
        {customChip}
        <select
          className="h-6"
          {...slotAttributes(timeRangePresetSelectStyle, {})}
          value={activeKey}
          onChange={(e) => {
            const picked = presets.find((p) => p.key === e.target.value);
            if (picked) onSelect(picked);
          }}
          aria-label={t("timeRange.window", { defaultValue: "Window" })}
        >
          {presets.map((preset) => (
            <option key={preset.key} value={preset.key}>
              {formatPresetLabel(preset, t)}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className="flex items-center"
      {...slotAttributes(timeRangePresetsStyle, { layout: "row" })}
    >
      {customChip}
      {presets.map((preset) => (
        <button
          key={preset.key}
          type="button"
          aria-pressed={activeKey === preset.key}
          {...slotAttributes(timeRangePresetStyle, { active: activeKey === preset.key })}
          onClick={() => onSelect(preset)}
        >
          {formatPresetLabel(preset, t)}
        </button>
      ))}
    </div>
  );
}

// ── Selection box with always-visible action bars ──

interface SelectionBoxProps {
  left: number;
  right: number;
  accentColor: string;
}

/**
 * The span of the strip that is currently selected.
 *
 * <p>A marker only. What can be done with the selection — zoom into it, drop it — sits with the
 * window controls above, where the eye already goes for anything that changes the window, rather
 * than pinned to an edge that moves as the selection is dragged.
 */
export function SelectionBox({ left, right, accentColor }: SelectionBoxProps) {
  return (
    <div
      className="absolute pointer-events-none"
      {...slotAttributes(timeRangeSelectionBoxStyle, {})}
      style={{
        left: `calc(${left * 100}% - 1px)`,
        top: -1,
        bottom: -1,
        width: `calc(${(right - left) * 100}% + 2px)`,
        // Dashed and hairline: the selection marks a span of the strip, and a solid band that
        // heavy competes with the density it is supposed to be framing.
        border: `1.5px dashed ${accentColor}`,
      }}
    />
  );
}

// ── Live drag preview box (no actions, follows the pointer) ──

export function DragPreviewBox({ left, right, accentColor }: { left: number; right: number; accentColor: string }) {
  return (
    <div
      className="absolute pointer-events-none"
      {...slotAttributes(timeRangeSelectionBoxStyle, {})}
      style={{
        left: `calc(${left * 100}% - 1px)`,
        top: -1,
        bottom: -1,
        width: `calc(${(right - left) * 100}% + 2px)`,
        border: `1.5px dashed ${accentColor}`,
      }}
    />
  );
}

// ── Current-time indicator ──

export function NowIndicator({ pct }: { pct: number | null }) {
  if (pct == null) return null;
  return (
    <div className="absolute pointer-events-none z-20" style={{ left: `${pct * 100}%`, top: 0, bottom: 0 }}>
      <div className="absolute -translate-x-1/2" style={{ top: 0, width: 0, height: 0, borderLeft: "4px solid transparent", borderRight: "4px solid transparent", borderTop: "5px solid var(--destructive, #ef4444)" }} />
      <div
        className="absolute -translate-x-1/2 bottom-0 w-px"
        style={{ top: 5 }}
        {...slotAttributes(timeRangeNowLineStyle, {})}
      />
    </div>
  );
}

// ── Local-time boundary markers ──

export function BoundaryMarkers({ markers }: { markers: number[] }) {
  return (
    <>
      {markers.map((pct, i) => (
        <div
          key={i}
          className="absolute top-0 bottom-0 pointer-events-none z-10"
          style={{ left: `calc(${pct * 100}% - 0.5px)`, width: 0, borderLeft: "1px dashed var(--foreground, #333)", opacity: 0.4 }}
        />
      ))}
    </>
  );
}

// ── Hover tooltip ──

interface HoverTooltipProps {
  hoverIdx: number;
  bucketCount: number;
  viewFrom: Date;
  bucketMinutes: number;
  counts: number[];
  locale?: string;
  hour12?: boolean;
  timeZone?: string;
}

export function HoverTooltip({ hoverIdx, bucketCount, viewFrom, bucketMinutes, counts, locale, hour12, timeZone }: HoverTooltipProps) {
  return (
    <div
      className="absolute pointer-events-none z-50"
      style={{ left: `${((hoverIdx + 0.5) / bucketCount) * 100}%`, bottom: -2, transform: "translate(-50%, 100%)" }}
    >
      <div className="flex flex-col items-center">
        <svg width="10" height="5" {...slotAttributes(timeRangeTooltipArrowStyle, {})} style={{ filter: "drop-shadow(0 -1px 1px rgb(0 0 0 / 0.1))" }} aria-hidden="true">
          <polygon points="0,5 10,5 5,0" fill="currentColor" />
        </svg>
        <div className="whitespace-nowrap" {...slotAttributes(timeRangeTooltipStyle, {})}>
          {formatBucketLabel(new Date(viewFrom.getTime() + hoverIdx * bucketMinutes * 60 * 1000), bucketMinutes, locale, hour12, timeZone)}
          {" — "}
          <span {...slotAttributes(timeRangeTooltipCountStyle, {})}>{counts[hoverIdx] ?? 0}</span>
        </div>
      </div>
    </div>
  );
}

// ── Time labels row (first/last anchored to avoid edge clipping) ──

/** Roughly how much room one axis label needs before its neighbour starts touching it. */
const LABEL_MIN_PX = 56;

export function TimeLabels({ labels }: { labels: { pct: number; text: string }[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Every nth label, where n is whatever keeps them from colliding at this width. Dropping
  // labels is what a narrow axis needs; overlapping them reads as neither.
  const step = width > 0 && labels.length > 1
    ? Math.max(1, Math.ceil((labels.length * LABEL_MIN_PX) / width))
    : 1;

  return (
    <div
      ref={ref}
      className="relative h-4 pointer-events-none"
      {...slotAttributes(timeRangeLabelsStyle, {})}
    >
      {labels.map((l, i) => {
        // The last label always survives: it names where the window ends.
        if (i % step !== 0 && i !== labels.length - 1) return null;
        const atStart = l.pct <= 0.001;
        const atEnd = l.pct >= 0.999;
        const translate = atStart ? "translate-x-0" : atEnd ? "-translate-x-full" : "-translate-x-1/2";
        return (
          <span
            key={i}
            className={cn("absolute whitespace-nowrap", translate)}
            style={{ left: `${l.pct * 100}%` }}
            {...slotAttributes(timeRangeLabelStyle, {})}
          >
            {l.text}
          </span>
        );
      })}
    </div>
  );
}

// ── Date + time input (calendar popover body) ──

export function DateTimeInput({ label, value, onChange }: { label: string; value: Date; onChange: (d: Date) => void }) {
  const hours = value.getHours().toString().padStart(2, "0");
  const minutes = value.getMinutes().toString().padStart(2, "0");

  return (
    <div className="flex flex-col" {...slotAttributes(timeRangeFieldStyle, {})}>
      <span {...slotAttributes(timeRangeFieldLabelStyle, {})}>{label}</span>
      <div className="flex items-center" {...slotAttributes(timeRangeFieldRowStyle, {})}>
        <DatePicker
          value={value}
          onChange={(d) => {
            if (!d) return;
            const next = new Date(d);
            next.setHours(value.getHours(), value.getMinutes(), 0, 0);
            onChange(next);
          }}
          clearable={false}
          className="h-8"
        />
        <div className="flex items-center" {...slotAttributes(timeRangeFieldTimeStyle, {})}>
          <input
            type="text"
            inputMode="numeric"
            value={hours}
            onChange={(e) => {
              const v = e.target.value.replace(/\D/g, "").slice(0, 2);
              const h = Math.min(23, Math.max(0, parseInt(v) || 0));
              const next = new Date(value);
              next.setHours(h);
              onChange(next);
            }}
            className="w-10 h-8"
            {...slotAttributes(timeRangeFieldInputStyle, {})}
          />
          <span {...slotAttributes(timeRangeFieldColonStyle, {})}>:</span>
          <input
            type="text"
            inputMode="numeric"
            value={minutes}
            onChange={(e) => {
              const v = e.target.value.replace(/\D/g, "").slice(0, 2);
              const m = Math.min(59, Math.max(0, parseInt(v) || 0));
              const next = new Date(value);
              next.setMinutes(m);
              onChange(next);
            }}
            className="w-10 h-8"
            {...slotAttributes(timeRangeFieldInputStyle, {})}
          />
        </div>
      </div>
    </div>
  );
}

// Re-export for the custom chip key check.
export { CUSTOM_PRESET_KEY };
