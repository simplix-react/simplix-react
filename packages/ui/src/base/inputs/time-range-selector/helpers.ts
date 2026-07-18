// Pure helpers for the time range selector: date/bucket math, formatting,
// boundary/label/now computation, and the ApexCharts options builder. No React.

import { hideGridRect, toHex6 } from "../../charts/apexcharts/use-chart-theme";
import { decodeInstant, serializeInstant } from "../../../utils/rfc3339-date";
import { HEATMAP_THEMES, type HeatmapColorTheme } from "./themes";
import { BOUNDARY_CLIP, CUSTOM_PRESET_KEY, type TimeRange, type WindowPreset } from "./types";

// ── Date / bucket math ──

/** Convert minutes to milliseconds. */
export function minutesToMs(minutes: number): number {
  return minutes * 60 * 1000;
}

/** Number of buckets in a preset window. */
export function getBucketCount(preset: WindowPreset): number {
  return Math.ceil(preset.windowMinutes / preset.bucketMinutes);
}

/** Floor a date down to the nearest bucket boundary. */
export function snapToFloor(date: Date, bucketMinutes: number): Date {
  const ms = minutesToMs(bucketMinutes);
  return new Date(Math.floor(date.getTime() / ms) * ms);
}

/** Start date of the i-th bucket within a view. */
export function bucketToDate(viewFrom: Date, bucketIndex: number, bucketMinutes: number): Date {
  return new Date(viewFrom.getTime() + bucketIndex * minutesToMs(bucketMinutes));
}

/** Clamp a first-of-month date within optional min/max month bounds (used by the 1mo preset). */
export function clampMonthStart(monthStart: Date, minDate?: Date, maxDate?: Date): Date {
  let d = monthStart;
  if (minDate && d.getTime() < minDate.getTime()) {
    d = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
  }
  if (maxDate) {
    const maxMonth = new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);
    if (d.getTime() > maxMonth.getTime()) d = maxMonth;
  }
  return d;
}

/** Clamp a fraction to [0, 1]. */
export function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

/** Closest preset by window duration (returns the first preset for an empty list is impossible — callers pass non-empty). */
export function findPresetByDuration(presets: WindowPreset[], durationMinutes: number): WindowPreset {
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

/**
 * Build a preset-less "custom" window spanning [from, to]. The bucket size is
 * derived to divide the exact window evenly (cell count near the closest standard
 * preset's granularity) so chart cells, tooltip labels, and the bucketCount handed
 * to fetchCounts all agree. Its key ({@link CUSTOM_PRESET_KEY}) is absent from the
 * preset list, so no preset button highlights while it is active.
 */
export function makeCustomPreset(presets: WindowPreset[], from: Date, to: Date): WindowPreset {
  const windowMinutes = (to.getTime() - from.getTime()) / 60000;
  const closest = findPresetByDuration(presets, windowMinutes);
  const targetBuckets = Math.max(1, Math.round(windowMinutes / closest.bucketMinutes));
  const bucketMinutes = windowMinutes / targetBuckets;
  return { key: CUSTOM_PRESET_KEY, label: CUSTOM_PRESET_KEY, windowMinutes, bucketMinutes };
}

/**
 * Snap a raw [left, right] fraction selection to bucket boundaries and convert to
 * dates. Returns null when the snapped span is empty.
 */
export function snapSelectionToBuckets(
  left: number,
  right: number,
  viewFrom: Date,
  bucketCount: number,
  bucketMinutes: number,
): TimeRange | null {
  const fromBucket = Math.floor(left * bucketCount);
  const toBucket = Math.min(bucketCount, Math.ceil(right * bucketCount));
  if (toBucket - fromBucket < 1) return null;
  return {
    from: bucketToDate(viewFrom, fromBucket, bucketMinutes),
    to: bucketToDate(viewFrom, toBucket, bucketMinutes),
  };
}

// ── Formatting ──

/** Resolve the `hour12` option: explicit override wins, otherwise let Intl follow the locale. */
function hourOptions(hour12?: boolean, timeZone?: string): Intl.DateTimeFormatOptions {
  const base: Intl.DateTimeFormatOptions = { hour: "2-digit", minute: "2-digit" };
  if (hour12 !== undefined) base.hour12 = hour12;
  if (timeZone) base.timeZone = timeZone;
  return base;
}

export function formatBucketLabel(
  date: Date,
  bucketMinutes: number,
  locale?: string,
  hour12?: boolean,
  timeZone?: string,
): string {
  const loc = locale || undefined;
  if (bucketMinutes >= 1440) {
    return date.toLocaleDateString(loc, { month: "2-digit", day: "2-digit", ...(timeZone ? { timeZone } : {}) });
  }
  return date.toLocaleTimeString(loc, hourOptions(hour12, timeZone));
}

export function formatRangeDisplay(
  from: Date,
  to: Date,
  locale?: string,
  hour12?: boolean,
  timeZone?: string,
): string {
  // Same-day is judged in the display zone (browser zone when omitted).
  const dayKey = (d: Date) => d.toLocaleDateString("en-CA", timeZone ? { timeZone } : undefined);
  const sameDay = dayKey(from) === dayKey(to);

  const loc = locale || undefined;
  const dateOpts: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    ...(timeZone ? { timeZone } : {}),
  };
  const timeOpts = hourOptions(hour12, timeZone);

  if (sameDay) {
    return `${from.toLocaleDateString(loc, dateOpts)} ${from.toLocaleTimeString(loc, timeOpts)} — ${to.toLocaleTimeString(loc, timeOpts)}`;
  }
  return `${from.toLocaleDateString(loc, dateOpts)} ${from.toLocaleTimeString(loc, timeOpts)} — ${to.toLocaleDateString(loc, dateOpts)} ${to.toLocaleTimeString(loc, timeOpts)}`;
}

/**
 * Zone-aware calendar anchor: runs local-field calendar math on `at`'s wall
 * clock IN `zone` and returns the true boundary instant. Without a zone the
 * math runs on the browser-local fields (legacy behavior).
 */
export function calendarAnchor(at: Date, zone: string | undefined, build: (wall: Date) => Date): Date {
  if (!zone) return build(at);
  const carrier = decodeInstant(at, zone);
  if (!carrier) return build(at);
  const iso = serializeInstant(build(carrier), zone);
  return iso ? new Date(iso) : build(at);
}

// ── View-relative computation (markers, labels, now) ──

/** Position (0–1) of the current time within the view, or null if outside / window invalid. */
export function computeNowMarkerPct(viewFrom: Date, viewTo: Date, nowMs: number): number | null {
  const windowMs = viewTo.getTime() - viewFrom.getTime();
  if (!(windowMs > 0)) return null;
  const pct = (nowMs - viewFrom.getTime()) / windowMs;
  if (pct < 0 || pct > 1) return null;
  return pct;
}

/**
 * Local-time boundary marker positions (0–1) within the view. Each boundary is
 * reconstructed from civil time fields (new Date(y, m, d, h)) so it stays correct
 * across DST transitions instead of incrementally mutating an hour counter.
 */
export function computeBoundaryMarkers(viewFrom: Date, viewTo: Date, preset: WindowPreset): number[] {
  const windowMs = viewTo.getTime() - viewFrom.getTime();
  if (!(windowMs > 0)) return [];

  const markers: number[] = [];
  const viewToMs = viewTo.getTime();
  const push = (t: number) => {
    const pct = (t - viewFrom.getTime()) / windowMs;
    if (pct > BOUNDARY_CLIP && pct < 1 - BOUNDARY_CLIP) markers.push(pct);
  };

  const y = viewFrom.getFullYear();
  const mo = viewFrom.getMonth();
  const da = viewFrom.getDate();

  // Branch on the actual window duration (custom windows included); only the
  // month preset opts out, since its buckets are already day-level.
  if (preset.key === "1mo") {
    // no extra markers
  } else if (preset.windowMinutes <= 60) {
    // ≤1h → hourly boundaries (local HH:00)
    const startHour = viewFrom.getHours() + 1;
    for (let i = 0; ; i++) {
      const d = new Date(y, mo, da, startHour + i);
      if (d.getTime() >= viewToMs) break;
      push(d.getTime());
    }
  } else if (preset.windowMinutes <= 1440) {
    // ≤1d → 12h boundaries (local 00:00, 12:00)
    const startHour = viewFrom.getHours() < 12 ? 12 : 24;
    for (let i = 0; ; i++) {
      const d = new Date(y, mo, da, startHour + i * 12);
      if (d.getTime() >= viewToMs) break;
      push(d.getTime());
    }
  } else {
    // >1d → daily boundaries (local midnight 00:00)
    for (let i = 1; ; i++) {
      const d = new Date(y, mo, da + i);
      if (d.getTime() >= viewToMs) break;
      push(d.getTime());
    }
  }

  return markers;
}

/** Time-axis label positions/texts for the row below the heatmap. */
export function computeTimeLabels(
  viewFrom: Date,
  windowMinutes: number,
  bucketMinutes: number,
  locale?: string,
  hour12?: boolean,
  timeZone?: string,
): { pct: number; text: string }[] {
  const windowMs = minutesToMs(windowMinutes);
  if (!(windowMs > 0)) return [];

  const labelIntervalMin = windowMinutes <= 60 ? 10
    : windowMinutes <= 360 ? 30
    : windowMinutes <= 1440 ? 120
    : windowMinutes <= 10080 ? 720
    : 1440;

  const labels: { pct: number; text: string }[] = [];
  const startMs = viewFrom.getTime();
  for (let ms = 0; ms <= windowMs; ms += minutesToMs(labelIntervalMin)) {
    labels.push({ pct: ms / windowMs, text: formatBucketLabel(new Date(startMs + ms), bucketMinutes, locale, hour12, timeZone) });
  }
  return labels;
}

// ── Chart options ──

/** Compute heatmap color-scale step boundaries. */
export function computeColorSteps(effectiveMax: number, colorStepsProp: number[] | undefined, scaleFactor: number): number[] {
  if (colorStepsProp) {
    return colorStepsProp.map((s) => Math.max(1, Math.round(s * scaleFactor)));
  }
  // Auto-generate exponential steps: lower values are denser.
  if (effectiveMax <= 1) return [1];
  const stepCount = Math.min(4, Math.max(2, Math.floor(Math.log10(effectiveMax)) + 1));
  const result: number[] = [];
  for (let i = 1; i <= stepCount; i++) {
    const t = i / (stepCount + 1);
    const raw = Math.pow(effectiveMax, t);
    const magnitude = Math.pow(10, Math.floor(Math.log10(raw)));
    const nice = Math.round(raw / magnitude) * magnitude;
    const v = Math.max(1, nice);
    if (v < effectiveMax && (result.length === 0 || v > result[result.length - 1])) {
      result.push(v);
    }
  }
  return result.length > 0 ? result : [Math.ceil(effectiveMax / 2)];
}

interface ColorRange { from: number; to: number; color: string; name: string }

/** Build ApexCharts heatmap color-scale ranges from steps + palette. */
export function buildColorScaleRanges(steps: number[], basePalette: string[], effectiveMax: number): ColorRange[] {
  const ranges: ColorRange[] = [];
  ranges.push({ from: 0, to: 0, color: basePalette[0], name: "0" });
  let prev = 1;
  for (let i = 0; i < steps.length; i++) {
    const colorIdx = Math.min(i + 1, basePalette.length - 2);
    ranges.push({ from: prev, to: steps[i], color: basePalette[colorIdx], name: `${prev}–${steps[i]}` });
    prev = steps[i] + 1;
  }
  if (prev <= effectiveMax) {
    ranges.push({ from: prev, to: effectiveMax, color: basePalette[basePalette.length - 1], name: `${prev}+` });
  }
  return ranges;
}

export interface ChartTheme {
  fontFamily: string;
  background: string;
}

export interface BuildChartParams {
  counts: number[];
  bucketCount: number;
  viewFrom: Date;
  bucketMinutes: number;
  locale?: string;
  hour12?: boolean;
  timeZone?: string;
  maxCount?: number;
  colorTheme: HeatmapColorTheme;
  colorStepsProp?: number[];
  colorStepBaseMinutes: number;
  isDark: boolean;
  theme: ChartTheme;
  animationsEnabled: boolean;
}

/** Build the ApexCharts options + series for the heatmap row. */
export function buildChartOptions(params: BuildChartParams): {
  options: ApexCharts.ApexOptions;
  series: { name: string; data: { x: string; y: number }[] }[];
} {
  const {
    counts, bucketCount, viewFrom, bucketMinutes, locale, hour12, timeZone, maxCount,
    colorTheme, colorStepsProp, colorStepBaseMinutes, isDark, theme, animationsEnabled,
  } = params;

  const bucketMs = minutesToMs(bucketMinutes);
  const data = Array.from({ length: bucketCount }, (_, i) => ({
    x: formatBucketLabel(new Date(viewFrom.getTime() + i * bucketMs), bucketMinutes, locale, hour12, timeZone),
    y: counts[i] ?? 0,
  }));

  const allValues = counts.length > 0 ? counts : [0];
  const effectiveMax = maxCount ?? Math.max(1, ...allValues);
  const scaleFactor = bucketMinutes / colorStepBaseMinutes;
  const steps = computeColorSteps(effectiveMax, colorStepsProp, scaleFactor);

  const palette = HEATMAP_THEMES[colorTheme] ?? HEATMAP_THEMES.slate;
  const basePalette = isDark ? palette.dark : palette.light;

  const options: ApexCharts.ApexOptions = {
    chart: {
      type: "heatmap",
      toolbar: { show: false },
      fontFamily: theme.fontFamily,
      sparkline: { enabled: true },
      animations: animationsEnabled
        ? { enabled: true, speed: 400, dynamicAnimation: { enabled: true, speed: 300 } }
        : { enabled: false },
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
        colorScale: { ranges: buildColorScaleRanges(steps, basePalette, effectiveMax) },
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

  return { options, series: [{ name: "", data }] };
}
