import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import ReactApexChart from "react-apexcharts";
import {useTranslation} from "@simplix-react/i18n/react";

import {cn} from "../../utils/cn";
import {hideGridRect, toHex6, useChartTheme} from "../charts/apexcharts/use-chart-theme";
import {Popover, PopoverContent, PopoverTrigger} from "../overlay";
import {DatePicker} from "./date-picker";

// ── Types ──

/** A window preset defines a viewing window size and its bucket granularity. */
export interface WindowPreset {
  /** Unique key (e.g., "1h", "1d") */
  key: string;
  /** Display label */
  label: string;
  /** Window size in minutes */
  windowMinutes: number;
  /** Bucket size in minutes (sub-minute values use fractions, e.g., 10s = 10/60) */
  bucketMinutes: number;
}

/** A simple date range. */
export interface TimeRange {
  from: Date;
  to: Date;
}

/** Date range with bucket information, emitted via onChange. */
export interface TimeRangeValue extends TimeRange {
  /** Current bucket granularity in minutes. Useful for server-side aggregation. */
  bucketMinutes: number;
}

/** Heatmap color theme key. */
export type HeatmapColorTheme = "slate" | "blue" | "emerald" | "violet" | "amber" | "rose";

/** A pair of light/dark palettes for heatmap rendering. */
export interface HeatmapPalette {
  light: string[];
  dark: string[];
  /** Accent color for selection markers, contrasting with the heatmap palette. */
  accent: { light: string; dark: string };
}

/** Built-in heatmap color themes. All use muted/desaturated tones to avoid conflicting with alert colors. */
export const HEATMAP_THEMES: Record<HeatmapColorTheme, HeatmapPalette> = {
  slate: {
    light: ["#f1f5f9", "#cbd5e1", "#94a3b8", "#64748b", "#475569", "#1e293b"],
    dark:  ["#1e293b", "#334155", "#475569", "#64748b", "#94a3b8", "#e2e8f0"],
    accent: { light: "#3b82f6", dark: "#60a5fa" },
  },
  blue: {
    light: ["#f0f7ff", "#c7ddf5", "#8fbce6", "#5a9bd5", "#3578b8", "#1a4e80"],
    dark:  ["#0f1e2e", "#1a3350", "#265078", "#3578b8", "#5a9bd5", "#a8cce8"],
    accent: { light: "#e85d04", dark: "#fb923c" },
  },
  emerald: {
    light: ["#f0fdf6", "#bbf0d4", "#6dd8a6", "#34b578", "#1f8c5a", "#0f5736"],
    dark:  ["#0a1f14", "#0f3524", "#1a5038", "#2b7a56", "#47b07a", "#94dbb5"],
    accent: { light: "#6366f1", dark: "#a5b4fc" },
  },
  violet: {
    light: ["#f5f3ff", "#d4ccf0", "#a896df", "#7e6bc7", "#5b44a8", "#3a2570"],
    dark:  ["#1a1030", "#2a1a50", "#3d2b78", "#5b44a8", "#7e6bc7", "#b8a8e0"],
    accent: { light: "#0891b2", dark: "#22d3ee" },
  },
  amber: {
    light: ["#fefcf0", "#f5e8b8", "#e6ca6e", "#c9a63a", "#a07e20", "#604a0a"],
    dark:  ["#1c1608", "#3a2e10", "#5e4c1e", "#8a7030", "#c9a63a", "#e6d48a"],
    accent: { light: "#7c3aed", dark: "#a78bfa" },
  },
  rose: {
    light: ["#fff5f7", "#f5ccd4", "#e6899a", "#d05570", "#a83050", "#701a32"],
    dark:  ["#1e0a10", "#3a1420", "#5e2838", "#a83050", "#d05570", "#e6a0b0"],
    accent: { light: "#0d9488", dark: "#5eead4" },
  },
};

/** Props for the {@link TimeRangeSelector} component. */
export interface TimeRangeSelectorProps {
  /** Current selected range */
  value: TimeRange;
  /** Range change callback */
  onChange: (range: TimeRangeValue) => void;
  /** Fetch counts for the visible window. Called when view range changes. */
  fetchCounts: (from: Date, to: Date, bucketCount: number) => Promise<number[]>;
  /** Fixed max value for heatmap scale. Auto-calculated if omitted. */
  maxCount?: number;
  /** Color scale step boundaries calibrated to 1-hour buckets (e.g., [1, 3, 5, 10]).
   *  Steps are auto-scaled proportionally when bucket size differs from 1 hour.
   *  0 and max are auto-added. */
  colorSteps?: number[];
  /** Bucket size (in minutes) that colorSteps are calibrated for. @defaultValue 60 */
  colorStepBaseMinutes?: number;
  /** Heatmap color theme. @defaultValue "slate" */
  colorTheme?: HeatmapColorTheme;
  /** Available window presets. Defaults provided if omitted. */
  presets?: WindowPreset[];
  /** Initial window preset key. @defaultValue "1d" */
  defaultWindow?: string;
  /** Earliest allowed date */
  minDate?: Date;
  /** Latest allowed date */
  maxDate?: Date;
  /** CSS class */
  className?: string;
}

// ── Default Presets ──

const DEFAULT_PRESETS: WindowPreset[] = [
  { key: "5m", label: "5m", windowMinutes: 5, bucketMinutes: 10 / 60 },
  { key: "10m", label: "10m", windowMinutes: 10, bucketMinutes: 20 / 60 },
  { key: "30m", label: "30m", windowMinutes: 30, bucketMinutes: 1 },
  { key: "1h", label: "1h", windowMinutes: 60, bucketMinutes: 5 },
  { key: "3h", label: "3h", windowMinutes: 180, bucketMinutes: 10 },
  { key: "6h", label: "6h", windowMinutes: 360, bucketMinutes: 15 },
  { key: "12h", label: "12h", windowMinutes: 720, bucketMinutes: 30 },
  { key: "1d", label: "1d", windowMinutes: 1440, bucketMinutes: 60 },
  { key: "3d", label: "3d", windowMinutes: 4320, bucketMinutes: 180 },
  { key: "7d", label: "7d", windowMinutes: 10080, bucketMinutes: 360 },
  { key: "1mo", label: "1mo", windowMinutes: 43200, bucketMinutes: 1440 },
];

// ── Helpers ──

function getBucketCount(preset: WindowPreset): number {
  return Math.ceil(preset.windowMinutes / preset.bucketMinutes);
}

function snapToFloor(date: Date, bucketMinutes: number): Date {
  const ms = bucketMinutes * 60 * 1000;
  return new Date(Math.floor(date.getTime() / ms) * ms);
}

function findPresetByDuration(presets: WindowPreset[], durationMinutes: number): WindowPreset {
  let closest = presets[0];
  let minDiff = Infinity;
  for (const p of presets) {
    const diff = Math.abs(p.windowMinutes - durationMinutes);
    if (diff < minDiff) {
      minDiff = diff;
      closest = p;
    }
  }
  return closest;
}

function formatBucketLabel(date: Date, bucketMinutes: number, locale?: string): string {
  const loc = locale || undefined;
  if (bucketMinutes >= 1440) {
    return date.toLocaleDateString(loc, { month: "2-digit", day: "2-digit" });
  }
  return date.toLocaleTimeString(loc, { hour: "2-digit", minute: "2-digit", hour12: false });
}

function formatRangeDisplay(from: Date, to: Date, locale?: string): string {
  const sameDay =
    from.getFullYear() === to.getFullYear() &&
    from.getMonth() === to.getMonth() &&
    from.getDate() === to.getDate();

  const loc = locale || undefined;
  const dateOpts: Intl.DateTimeFormatOptions = { year: "numeric", month: "2-digit", day: "2-digit" };
  const timeOpts: Intl.DateTimeFormatOptions = { hour: "2-digit", minute: "2-digit", hour12: false };

  if (sameDay) {
    return `${from.toLocaleDateString(loc, dateOpts)} ${from.toLocaleTimeString(loc, timeOpts)} — ${to.toLocaleTimeString(loc, timeOpts)}`;
  }
  return `${from.toLocaleDateString(loc, dateOpts)} ${from.toLocaleTimeString(loc, timeOpts)} — ${to.toLocaleDateString(loc, dateOpts)} ${to.toLocaleTimeString(loc, timeOpts)}`;
}

// ── Component ──

/**
 * Time range selector with heatmap visualization.
 *
 * <p>Displays a single-row heatmap showing count distribution over a time window.
 * Users can select sub-ranges via drag, switch window sizes via presets, navigate
 * with ◀ ▶ buttons, or pick dates directly via calendar.
 *
 * @example
 * ```tsx
 * <TimeRangeSelector
 *   value={{ from: startOfDay, to: endOfDay }}
 *   onChange={setTimeRange}
 *   fetchCounts={async (from, to, buckets) => api.getCounts(from, to, buckets)}
 * />
 * ```
 */
export function TimeRangeSelector({
  value,
  onChange,
  fetchCounts,
  maxCount,
  colorSteps: colorStepsProp,
  colorStepBaseMinutes = 60,
  colorTheme = "slate",
  presets: presetsProp,
  defaultWindow = "1d",
  minDate,
  maxDate,
  className,
}: TimeRangeSelectorProps) {
  const { t, locale } = useTranslation("simplix/ui");
  const theme = useChartTheme();
  const isDark = theme.tooltipTheme === "dark";

  const presets = presetsProp ?? DEFAULT_PRESETS;
  const [activePreset, setActivePreset] = useState<WindowPreset>(
    () => presets.find((p) => p.key === defaultWindow) ?? presets[7],
  );

  // View window
  const [viewFrom, setViewFrom] = useState<Date>(() => {
    const mid = new Date((value.from.getTime() + value.to.getTime()) / 2);
    const halfMs = (activePreset.windowMinutes * 60 * 1000) / 2;
    return snapToFloor(new Date(mid.getTime() - halfMs), activePreset.bucketMinutes);
  });

  const viewTo = useMemo(() => {
    if (activePreset.key === "1mo") {
      // Dynamic: 1st of next month from viewFrom's month
      return new Date(viewFrom.getFullYear(), viewFrom.getMonth() + 1, 1);
    }
    return new Date(viewFrom.getTime() + activePreset.windowMinutes * 60 * 1000);
  }, [viewFrom, activePreset]);

  const bucketCount = useMemo(() => {
    if (activePreset.key === "1mo") {
      // Days in the month
      const daysInMonth = (viewTo.getTime() - viewFrom.getTime()) / (24 * 60 * 60 * 1000);
      return Math.round(daysInMonth);
    }
    return getBucketCount(activePreset);
  }, [viewFrom, viewTo, activePreset]);

  // Accent color for selection markers
  const accentColor = useMemo(() => {
    const palette = HEATMAP_THEMES[colorTheme] ?? HEATMAP_THEMES.slate;
    return isDark ? palette.accent.dark : palette.accent.light;
  }, [colorTheme, isDark]);

  // Counts data
  const [counts, setCounts] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const fetchRef = useRef(0);

  useEffect(() => {
    const id = ++fetchRef.current;
    setIsLoading(true);
    fetchCounts(viewFrom, viewTo, bucketCount)
      .then((data) => {
        if (fetchRef.current === id) setCounts(data);
      })
      .catch(() => {
        if (fetchRef.current === id) setCounts([]);
      })
      .finally(() => {
        if (fetchRef.current === id) setIsLoading(false);
      });
  }, [viewFrom, viewTo, bucketCount, fetchCounts]);

  // ── Helpers ──

  /** Clamp viewFrom so the window stays within minDate/maxDate and snaps to bucket */
  const clampViewFrom = useCallback(
    (from: Date, preset: WindowPreset): Date => {
      let ms = from.getTime();
      const windowMs = preset.windowMinutes * 60 * 1000;
      if (maxDate && ms + windowMs > maxDate.getTime()) {
        ms = maxDate.getTime() - windowMs;
      }
      if (minDate && ms < minDate.getTime()) {
        ms = minDate.getTime();
      }
      return snapToFloor(new Date(ms), preset.bucketMinutes);
    },
    [minDate, maxDate],
  );

  // ── Handlers ──

  const handlePresetChange = useCallback(
    (preset: WindowPreset) => {
      setActivePreset(preset);
      const now = new Date();
      const windowMs = preset.windowMinutes * 60 * 1000;
      const bucketMs = preset.bucketMinutes * 60 * 1000;
      let newFrom: Date;
      let newTo: Date;

      if (preset.key === "1mo") {
        // 1mo → 1st of current month to 1st of next month (actual month length)
        newFrom = new Date(now.getFullYear(), now.getMonth(), 1);
        newTo = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        const actualWindowMs = newTo.getTime() - newFrom.getTime();
        const daysInMonth = actualWindowMs / (24 * 60 * 60 * 1000);
        setViewFrom(newFrom);
        onChange({ from: newFrom, to: newTo, bucketMinutes: 1440 });
        return;
      } else if (preset.windowMinutes >= 1440) {
        // 1d+ → end at today 24:00 (midnight of tomorrow)
        const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        newTo = todayEnd;
        newFrom = new Date(todayEnd.getTime() - windowMs);
      } else {
        // < 1d → end at now (snapped to bucket), start = now - window
        newTo = new Date(Math.ceil(now.getTime() / bucketMs) * bucketMs);
        newFrom = new Date(newTo.getTime() - windowMs);
      }

      newFrom = clampViewFrom(newFrom, preset);
      newTo = new Date(newFrom.getTime() + windowMs);
      setViewFrom(newFrom);
      onChange({ from: newFrom, to: newTo, bucketMinutes: preset.bucketMinutes });
    },
    [clampViewFrom, onChange],
  );

  const handleNavigate = useCallback(
    (direction: -1 | 1) => {
      const shiftMs = activePreset.windowMinutes * 60 * 1000;
      let ms = viewFrom.getTime() + direction * shiftMs;
      if (maxDate && ms + shiftMs > maxDate.getTime()) ms = maxDate.getTime() - shiftMs;
      if (minDate && ms < minDate.getTime()) ms = minDate.getTime();
      const newFrom = snapToFloor(new Date(ms), activePreset.bucketMinutes);
      const newTo = new Date(newFrom.getTime() + shiftMs);
      setViewFrom(newFrom);
      onChange({ from: newFrom, to: newTo, bucketMinutes: activePreset.bucketMinutes });
    },
    [activePreset, viewFrom, minDate, maxDate, onChange],
  );

  const handleNow = useCallback(() => {
    const now = new Date();
    const windowMs = activePreset.windowMinutes * 60 * 1000;
    const halfMs = windowMs / 2;
    const newFrom = clampViewFrom(snapToFloor(new Date(now.getTime() - halfMs), activePreset.bucketMinutes), activePreset);
    const newTo = new Date(newFrom.getTime() + windowMs);
    setViewFrom(newFrom);
    onChange({ from: newFrom, to: newTo, bucketMinutes: activePreset.bucketMinutes });
  }, [activePreset, clampViewFrom, onChange]);

  const handleDateRangeChange = useCallback(
    (range: { from?: Date; to?: Date }) => {
      if (!range.from || !range.to) return;
      const durationMin = (range.to.getTime() - range.from.getTime()) / 60000;
      const newPreset = findPresetByDuration(presets, durationMin);
      setActivePreset(newPreset);
      setViewFrom(snapToFloor(range.from, newPreset.bucketMinutes));
      onChange({ from: range.from, to: range.to, bucketMinutes: newPreset.bucketMinutes });
    },
    [presets, onChange],
  );

  // ── Selection highlight ──

  const selectionOverlay = useMemo(() => {
    const viewFromMs = viewFrom.getTime();
    const viewToMs = viewTo.getTime();
    const windowMs = viewToMs - viewFromMs;
    if (windowMs <= 0) return null;

    // Check if selection falls within view
    if (value.from.getTime() >= viewToMs || value.to.getTime() <= viewFromMs) return null;

    const left = Math.max(0, (value.from.getTime() - viewFromMs) / windowMs);
    const right = Math.min(1, (value.to.getTime() - viewFromMs) / windowMs);

    // If selection covers entire view, no overlay needed
    if (left <= 0.001 && right >= 0.999) return null;

    return { left, right };
  }, [value, viewFrom, viewTo]);

  // ── Drag Selection ──

  const dragContainerRef = useRef<HTMLDivElement>(null);
  /** Drag mode: "create" = new selection, "resize-left"/"resize-right" = move one marker edge */
  const [dragState, setDragState] = useState<{
    mode: "create" | "resize-left" | "resize-right";
    startX: number;
    currentX: number;
    /** Anchor edge position (the fixed edge during resize) */
    anchor?: number;
  } | null>(null);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  /** Threshold (in fraction 0–1) for detecting marker proximity */
  const MARKER_HIT = 0.015;

  /** Convert a clientX to a 0–1 fraction within the drag container, clamped. */
  const clientXToFraction = useCallback((clientX: number): number => {
    const rect = dragContainerRef.current?.getBoundingClientRect();
    if (!rect) return 0;
    return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  }, []);

  // Document-level drag handlers (registered on drag start, cleaned up on drag end)
  const docMoveRef = useRef<((e: MouseEvent) => void) | null>(null);
  const docUpRef = useRef<((e: MouseEvent) => void) | null>(null);

  const cleanupDocListeners = useCallback(() => {
    if (docMoveRef.current) { document.removeEventListener("mousemove", docMoveRef.current); docMoveRef.current = null; }
    if (docUpRef.current) { document.removeEventListener("mouseup", docUpRef.current); docUpRef.current = null; }
  }, []);

  const handleDragStart = useCallback((e: React.MouseEvent) => {
    const rect = dragContainerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left) / rect.width;

    let mode: "create" | "resize-left" | "resize-right" = "create";
    let anchor: number | undefined;

    // Check if click is near an existing selection marker
    if (selectionOverlay) {
      if (Math.abs(x - selectionOverlay.left) < MARKER_HIT) {
        mode = "resize-left";
        anchor = selectionOverlay.right;
      } else if (Math.abs(x - selectionOverlay.right) < MARKER_HIT) {
        mode = "resize-right";
        anchor = selectionOverlay.left;
      }
    }

    setDragState({ mode, startX: x, currentX: x, anchor });

    // Register document-level listeners so drag continues outside the component
    cleanupDocListeners();
    docMoveRef.current = (ev: MouseEvent) => {
      const frac = clientXToFraction(ev.clientX);
      setDragState((prev) => prev ? { ...prev, currentX: frac } : null);
      setHoverIdx(null);
    };
    docUpRef.current = () => {
      cleanupDocListeners();
      dragEndRef.current();
    };
    document.addEventListener("mousemove", docMoveRef.current);
    document.addEventListener("mouseup", docUpRef.current);
  }, [selectionOverlay, clientXToFraction, cleanupDocListeners]);

  const handleDragMove = useCallback((e: React.MouseEvent) => {
    const x = clientXToFraction(e.clientX);
    if (dragState) {
      // Handled by document listener
      return;
    }
    // Cursor style: show resize cursor near markers
    if (selectionOverlay && (Math.abs(x - selectionOverlay.left) < MARKER_HIT || Math.abs(x - selectionOverlay.right) < MARKER_HIT)) {
      if (dragContainerRef.current) dragContainerRef.current.style.cursor = "col-resize";
    } else {
      if (dragContainerRef.current) dragContainerRef.current.style.cursor = "crosshair";
    }
    setHoverIdx(Math.min(bucketCount - 1, Math.floor(x * bucketCount)));
  }, [dragState, bucketCount, selectionOverlay, clientXToFraction]);

  const dragEndRef = useRef<() => void>(() => {});

  const handleDragEnd = useCallback(() => {
    if (!dragState) return;
    const bucketMs = activePreset.bucketMinutes * 60 * 1000;

    if (dragState.mode === "resize-left" || dragState.mode === "resize-right") {
      // Resize: anchor is the fixed edge, currentX is the moved edge
      const a = dragState.anchor!;
      const b = dragState.currentX;
      const left = Math.min(a, b);
      const right = Math.max(a, b);
      const fromBucket = Math.floor(left * bucketCount);
      const toBucket = Math.min(bucketCount, Math.ceil(right * bucketCount));
      if (toBucket - fromBucket < 1) { setDragState(null); return; }
      const selFrom = new Date(viewFrom.getTime() + fromBucket * bucketMs);
      const selTo = new Date(viewFrom.getTime() + toBucket * bucketMs);
      setDragState(null);
      onChange({ from: selFrom, to: selTo, bucketMinutes: activePreset.bucketMinutes });
      return;
    }

    // Create mode
    const left = Math.min(dragState.startX, dragState.currentX);
    const right = Math.max(dragState.startX, dragState.currentX);
    setDragState(null);

    if (right - left < 0.03) {
      // Click — select single bucket
      const clickedBucket = Math.floor(left * bucketCount);
      const selFrom = new Date(viewFrom.getTime() + clickedBucket * bucketMs);
      const selTo = new Date(viewFrom.getTime() + (clickedBucket + 1) * bucketMs);
      onChange({ from: selFrom, to: selTo, bucketMinutes: activePreset.bucketMinutes });
      return;
    }

    // Drag — snap to bucket boundaries
    const fromBucket = Math.floor(left * bucketCount);
    const toBucket = Math.min(bucketCount, Math.ceil(right * bucketCount));
    if (toBucket - fromBucket < 1) return;

    const selFrom = new Date(viewFrom.getTime() + fromBucket * bucketMs);
    const selTo = new Date(viewFrom.getTime() + toBucket * bucketMs);
    onChange({ from: selFrom, to: selTo, bucketMinutes: activePreset.bucketMinutes });
  }, [dragState, viewFrom, activePreset, bucketCount, onChange]);

  // Keep ref in sync so document mouseup can call latest handleDragEnd
  dragEndRef.current = handleDragEnd;

  // Cleanup document listeners on unmount
  useEffect(() => cleanupDocListeners, [cleanupDocListeners]);

  // ── Chart Data ──

  const { chartOptions, chartSeries } = useMemo(() => {
    const bucketMs = activePreset.bucketMinutes * 60 * 1000;
    const data = Array.from({ length: bucketCount }, (_, i) => ({
      x: formatBucketLabel(new Date(viewFrom.getTime() + i * bucketMs), activePreset.bucketMinutes, locale),
      y: counts[i] ?? 0,
    }));

    const allValues = counts.length > 0 ? counts : [0];
    const effectiveMax = maxCount ?? Math.max(1, ...allValues);
    const scaleFactor = activePreset.bucketMinutes / colorStepBaseMinutes;

    const steps: number[] = (() => {
      if (colorStepsProp) {
        // User-defined steps scaled by bucket size
        return colorStepsProp.map((s) => Math.max(1, Math.round(s * scaleFactor)));
      }
      // Auto-generate exponential steps: lower values are denser
      // e.g., max=100 → [1, 4, 15, 50], max=1000 → [1, 8, 60, 500]
      if (effectiveMax <= 1) return [1];
      const stepCount = Math.min(4, Math.max(2, Math.floor(Math.log10(effectiveMax)) + 1));
      const result: number[] = [];
      for (let i = 1; i <= stepCount; i++) {
        const t = i / (stepCount + 1); // 0 < t < 1
        const raw = Math.pow(effectiveMax, t); // exponential interpolation
        // Snap to nice number
        const magnitude = Math.pow(10, Math.floor(Math.log10(raw)));
        const nice = Math.round(raw / magnitude) * magnitude;
        const v = Math.max(1, nice);
        if (v < effectiveMax && (result.length === 0 || v > result[result.length - 1])) {
          result.push(v);
        }
      }
      return result.length > 0 ? result : [Math.ceil(effectiveMax / 2)];
    })();
    // palette: [0-color, step1, step2, ..., max-color] — need steps.length + 2 colors
    const palette = HEATMAP_THEMES[colorTheme] ?? HEATMAP_THEMES.slate;
    const basePalette = isDark ? palette.dark : palette.light;

    const options: ApexCharts.ApexOptions = {
      chart: {
        type: "heatmap",
        toolbar: { show: false },
        fontFamily: theme.fontFamily,
        sparkline: { enabled: true },
        animations: { enabled: true, speed: 400, dynamicAnimation: { enabled: true, speed: 300 } },
        selection: { enabled: false },
        zoom: { enabled: false },
        events: {
          mounted: hideGridRect,
          updated: hideGridRect,
          click: undefined,
        },
      },
      plotOptions: {
        heatmap: {
          radius: 3,
          enableShades: false,
          colorScale: {
            ranges: (() => {
              const ranges: { from: number; to: number; color: string; name: string }[] = [];
              // 0 range
              ranges.push({ from: 0, to: 0, color: basePalette[0], name: "0" });
              // step ranges
              let prev = 1;
              for (let i = 0; i < steps.length; i++) {
                const colorIdx = Math.min(i + 1, basePalette.length - 2);
                ranges.push({ from: prev, to: steps[i], color: basePalette[colorIdx], name: `${prev}–${steps[i]}` });
                prev = steps[i] + 1;
              }
              // max+ range
              if (prev <= effectiveMax) {
                ranges.push({ from: prev, to: effectiveMax, color: basePalette[basePalette.length - 1], name: `${prev}+` });
              }
              return ranges;
            })(),
          },
        },
      },
      stroke: { width: 2, colors: [toHex6(theme.background)] },
      xaxis: {
        labels: { show: false },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: { show: false, labels: { show: false } },
      grid: { show: false },
      legend: { show: false },
      dataLabels: { enabled: false },
      tooltip: { enabled: false },
      states: {
        hover: { filter: { type: "none" } },
        active: { filter: { type: "none" } },
      },
    };

    return {
      chartOptions: options,
      chartSeries: [{ name: "", data }],
    };
  }, [counts, bucketCount, activePreset, viewFrom, maxCount, theme, isDark]);

  const handleReset = useCallback(() => {
    onChange({ from: viewFrom, to: viewTo, bucketMinutes: activePreset.bucketMinutes });
  }, [viewFrom, viewTo, activePreset, onChange]);

  // ── Render ──

  return (
    <div className={cn("relative w-full rounded-lg border border-border bg-card", className)}>
      {/* Controls bar — above heatmap */}
      <div className="flex items-center justify-between px-2 pt-2 pb-1">
        {/* Range display + reset + calendar + now */}
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-semibold tabular-nums">
            {formatRangeDisplay(value.from, value.to, locale)}
          </span>
          {selectionOverlay && (
            <button
              type="button"
              className="px-1.5 py-0.5 rounded text-[10px] text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
              onClick={handleReset}
              aria-label="Reset"
            >
              ✕
            </button>
          )}
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="inline-flex items-center justify-center h-7 w-7 rounded-md border border-input bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                aria-label={t("timeRange.calendar", { defaultValue: "Calendar" })}
              >
                <CalendarIcon className="size-3.5" />
              </button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-auto p-3">
              <div className="flex flex-col gap-3">
                <DateTimeInput
                  label={t("timeRange.from", { defaultValue: "From" })}
                  value={value.from}
                  onChange={(d) => handleDateRangeChange({ from: d, to: value.to })}
                />
                <DateTimeInput
                  label={t("timeRange.to", { defaultValue: "To" })}
                  value={value.to}
                  onChange={(d) => handleDateRangeChange({ from: value.from, to: d })}
                />
              </div>
            </PopoverContent>
          </Popover>
          <button
            type="button"
            className="h-7 px-2 rounded-md text-xs font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors border border-input"
            onClick={handleNow}
          >
            {t("timeRange.now", { defaultValue: "Now" })}
          </button>
        </div>

        {/* Presets */}
        <div className="flex gap-0.5">
          {presets.map((preset) => (
            <button
              key={preset.key}
              type="button"
              className={cn(
                "px-2 py-0.5 rounded text-xs font-medium transition-colors",
                activePreset.key === preset.key
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
              onClick={() => handlePresetChange(preset)}
            >
              {(() => {
                const match = preset.key.match(/^(\d+)(\w+)$/);
                if (!match) return preset.label;
                const [, num, unit] = match;
                return `${num}${t(`timeRange.units.${unit}`, { defaultValue: unit })}`;
              })()}
            </button>
          ))}
        </div>
      </div>

      {/* Heatmap with nav buttons */}
      <div className="flex items-center gap-0 px-1">
        {/* ◀ button */}
        <button
          type="button"
          className="shrink-0 flex items-center justify-center w-6 h-[20px] text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => handleNavigate(-1)}
          aria-label={t("timeRange.previous", { defaultValue: "Previous" })}
        >
          <ChevronLeftIcon className="size-3.5" />
        </button>

        {/* Heatmap with drag overlay */}
        <div
          ref={dragContainerRef}
          className={cn("relative flex-1 min-w-0 overflow-visible transition-opacity [&_.apexcharts-canvas]:outline-none [&_.apexcharts-svg]:outline-none [&_.apexcharts-canvas]:overflow-visible [&_svg]:overflow-visible select-none cursor-col-resize before:content-[''] before:absolute before:-top-1 before:-bottom-1 before:left-0 before:right-0", isLoading && "opacity-50")}
          onMouseDown={handleDragStart}
          onMouseMove={handleDragMove}
          onMouseUp={handleDragEnd}
          onMouseLeave={() => { if (!dragState) setHoverIdx(null); }}
        >
          <ReactApexChart
            key={`${isDark ? "d" : "l"}-${activePreset.key}-${viewFrom.getTime()}`}
            type="heatmap"
            options={chartOptions}
            series={chartSeries}
            height={20}
          />
          {/* Selected range — transparent box with accent border + dismiss button */}
          {selectionOverlay && !dragState && (
            <div
              className="group/sel absolute rounded-[3px]"
              style={{
                left: `calc(${selectionOverlay.left * 100}% - 3px)`,
                top: -2,
                bottom: -2,
                width: `calc(${(selectionOverlay.right - selectionOverlay.left) * 100}% + 6px)`,
                border: `2px solid ${accentColor}`,
              }}
            >
              <button
                type="button"
                className="absolute top-0 bottom-0 right-0 hidden group-hover/sel:flex items-center justify-center w-2.5 rounded-none z-10"
                style={{ backgroundColor: accentColor, color: "#fff" }}
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => { e.stopPropagation(); handleReset(); }}
                aria-label="Clear selection"
              >
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M2 2l4 4M6 2l-4 4" />
                </svg>
              </button>
            </div>
          )}
          {/* Drag selection overlay — markers follow mouse, dimmed area snaps to bucket */}
          {dragState && Math.abs(dragState.currentX - dragState.startX) > 0.02 && (() => {
            const isResize = dragState.mode === "resize-left" || dragState.mode === "resize-right";
            // Raw positions (follow mouse)
            const rawLeft = isResize ? Math.min(dragState.anchor!, dragState.currentX) : Math.min(dragState.startX, dragState.currentX);
            const rawRight = isResize ? Math.max(dragState.anchor!, dragState.currentX) : Math.max(dragState.startX, dragState.currentX);
            return (
              <>
                {/* Selection box — follows mouse */}
                <div
                  className="absolute rounded-[3px] pointer-events-none"
                  style={{
                    left: `calc(${rawLeft * 100}% - 3px)`,
                    top: -2,
                    bottom: -2,
                    width: `calc(${(rawRight - rawLeft) * 100}% + 6px)`,
                    border: `2px solid ${accentColor}`,
                  }}
                />
              </>
            );
          })()}
          {/* Current time indicator — inverted triangle + vertical line */}
          {(() => {
            const nowMs = Date.now();
            const windowMs = viewTo.getTime() - viewFrom.getTime();
            const pct = (nowMs - viewFrom.getTime()) / windowMs;
            if (pct < 0 || pct > 1) return null;
            return (
              <div className="absolute pointer-events-none" style={{ left: `${pct * 100}%`, top: 0, bottom: 0 }}>
                <div className="absolute -translate-x-1/2" style={{ top: 0, width: 0, height: 0, borderLeft: "4px solid transparent", borderRight: "4px solid transparent", borderTop: "5px solid var(--destructive, #ef4444)" }} />
                <div className="absolute -translate-x-1/2 bottom-0 w-px bg-destructive/60" style={{ top: 5 }} />
              </div>
            );
          })()}
          {/* Time boundary markers (local time aligned) */}
          {(() => {
            const windowMs = viewTo.getTime() - viewFrom.getTime();
            const markers: number[] = [];
            const start = viewFrom;

            if (activePreset.windowMinutes <= 60) {
              // ≤1h → hourly boundaries (local HH:00)
              const d = new Date(start);
              d.setMinutes(0, 0, 0);
              d.setHours(d.getHours() + 1);
              while (d.getTime() < viewTo.getTime()) {
                const pct = (d.getTime() - start.getTime()) / windowMs;
                if (pct > 0.01 && pct < 0.99) markers.push(pct);
                d.setHours(d.getHours() + 1);
              }
            } else if (activePreset.windowMinutes <= 1440) {
              // ≤1d → 12h boundaries (local 00:00, 12:00)
              const d = new Date(start);
              d.setMinutes(0, 0, 0);
              const h = d.getHours();
              d.setHours(h < 12 ? 12 : 24);
              while (d.getTime() < viewTo.getTime()) {
                const pct = (d.getTime() - start.getTime()) / windowMs;
                if (pct > 0.01 && pct < 0.99) markers.push(pct);
                d.setHours(d.getHours() + 12);
              }
            } else if (activePreset.key === "1mo") {
              // 1mo → no markers (already day-level buckets)
            } else {
              // >1d → daily boundaries (local midnight 00:00)
              const d = new Date(start);
              d.setHours(0, 0, 0, 0);
              d.setDate(d.getDate() + 1);
              while (d.getTime() < viewTo.getTime()) {
                const pct = (d.getTime() - start.getTime()) / windowMs;
                if (pct > 0.01 && pct < 0.99) markers.push(pct);
                d.setDate(d.getDate() + 1);
              }
            }

            return markers.map((pct, i) => (
              <div
                key={i}
                className="absolute top-0 bottom-0 pointer-events-none z-10"
                style={{ left: `calc(${pct * 100}% - 0.5px)`, width: 0, borderLeft: "1px dashed var(--foreground, #333)", opacity: 0.4 }}
              />
            ));
          })()}
          {/* Hover tooltip — positioned below hovered cell */}
          {hoverIdx != null && !dragState && (
            <div
              className="absolute pointer-events-none z-50"
              style={{
                left: `${((hoverIdx + 0.5) / bucketCount) * 100}%`,
                bottom: -2,
                transform: "translate(-50%, 100%)",
              }}
            >
              <div className="flex flex-col items-center">
                <svg width="10" height="5" className="-mb-[1px] text-foreground" style={{ filter: "drop-shadow(0 -1px 1px rgb(0 0 0 / 0.1))" }}>
                  <polygon points="0,5 10,5 5,0" fill="currentColor" />
                </svg>
                <div className="rounded-md bg-foreground px-2 py-0.5 text-xs text-background shadow-md whitespace-nowrap">
                  {formatBucketLabel(new Date(viewFrom.getTime() + hoverIdx * activePreset.bucketMinutes * 60 * 1000), activePreset.bucketMinutes, locale)}
                  {" — "}
                  <span className="font-semibold">{counts[hoverIdx] ?? 0}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ▶ button */}
        <button
          type="button"
          className="shrink-0 flex items-center justify-center w-6 h-[20px] text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => handleNavigate(1)}
          aria-label={t("timeRange.next", { defaultValue: "Next" })}
        >
          <ChevronRightIcon className="size-3.5" />
        </button>
      </div>

      {/* Time labels — interval based on window size */}
      <div className="relative mx-7 h-4 mb-2 pointer-events-none">
        {(() => {
          const windowMs = activePreset.windowMinutes * 60 * 1000;
          // Pick label interval: aim for ~120min steps, min 1 bucket
          const labelIntervalMin = activePreset.windowMinutes <= 60 ? 10
            : activePreset.windowMinutes <= 360 ? 30
            : activePreset.windowMinutes <= 1440 ? 120
            : activePreset.windowMinutes <= 10080 ? 720
            : 1440;
          const labels: { pct: number; text: string }[] = [];
          const startMs = viewFrom.getTime();
          for (let ms = 0; ms <= windowMs; ms += labelIntervalMin * 60 * 1000) {
            const date = new Date(startMs + ms);
            labels.push({ pct: ms / windowMs, text: formatBucketLabel(date, activePreset.bucketMinutes, locale) });
          }
          return labels.map((l, i) => (
            <span
              key={i}
              className="absolute text-[11px] text-muted-foreground tabular-nums -translate-x-1/2"
              style={{ left: `${l.pct * 100}%` }}
            >
              {l.text}
            </span>
          ));
        })()}
      </div>

    </div>
  );
}

// ── DateTimeInput (inline date + time picker) ──

function DateTimeInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: Date;
  onChange: (d: Date) => void;
}) {
  const hours = value.getHours().toString().padStart(2, "0");
  const minutes = value.getMinutes().toString().padStart(2, "0");

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <DatePicker
          value={value}
          onChange={(d) => {
            if (!d) return;
            const next = new Date(d);
            next.setHours(value.getHours(), value.getMinutes(), 0, 0);
            onChange(next);
          }}
          clearable={false}
          className="h-8 text-xs"
        />
        <div className="flex items-center gap-1">
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
            className="w-10 h-8 rounded-md border border-input bg-background px-1 text-center text-xs"
          />
          <span className="text-muted-foreground">:</span>
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
            className="w-10 h-8 rounded-md border border-input bg-background px-1 text-center text-xs"
          />
        </div>
      </div>
    </div>
  );
}

// ── Inline Icons ──

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <path d="M8.84182 3.13514C9.04327 3.32401 9.05348 3.64042 8.86462 3.84188L5.43521 7.49991L8.86462 11.1579C9.05348 11.3594 9.04327 11.6758 8.84182 11.8647C8.64036 12.0535 8.32394 12.0433 8.13508 11.8419L4.38508 7.84188C4.20477 7.64955 4.20477 7.35027 4.38508 7.15794L8.13508 3.15794C8.32394 2.95648 8.64036 2.94628 8.84182 3.13514Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd" />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <path d="M6.1584 3.13508C6.35985 2.94621 6.67627 2.95642 6.86514 3.15788L10.6151 7.15788C10.7954 7.3502 10.7954 7.64949 10.6151 7.84182L6.86514 11.8418C6.67627 12.0433 6.35985 12.0535 6.1584 11.8646C5.95694 11.6757 5.94673 11.3593 6.1356 11.1579L9.56501 7.49985L6.1356 3.84182C5.94673 3.64036 5.95694 3.32394 6.1584 3.13508Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd" />
    </svg>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <path d="M4.5 1C4.77614 1 5 1.22386 5 1.5V2H10V1.5C10 1.22386 10.2239 1 10.5 1C10.7761 1 11 1.22386 11 1.5V2H12.5C13.3284 2 14 2.67157 14 3.5V12.5C14 13.3284 13.3284 14 12.5 14H2.5C1.67157 14 1 13.3284 1 12.5V3.5C1 2.67157 1.67157 2 2.5 2H4V1.5C4 1.22386 4.22386 1 4.5 1ZM10 3V3.5C10 3.77614 10.2239 4 10.5 4C10.7761 4 11 3.77614 11 3.5V3H12.5C12.7761 3 13 3.22386 13 3.5V5H2V3.5C2 3.22386 2.22386 3 2.5 3H4V3.5C4 3.77614 4.22386 4 4.5 4C4.77614 4 5 3.77614 5 3.5V3H10ZM2 6V12.5C2 12.7761 2.22386 13 2.5 13H12.5C12.7761 13 13 12.7761 13 12.5V6H2Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd" />
    </svg>
  );
}
