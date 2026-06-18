// Public types, default presets, and tuning constants for the time range selector.

import type { HeatmapColorTheme } from "./themes";

/** A window preset defines a viewing window size and its bucket granularity. */
export interface WindowPreset {
  /** Unique key (e.g., "1h", "1d"). The reserved key "custom" denotes a preset-less window. */
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
  /** Use 12-hour time formatting (AM/PM). @defaultValue false — compact 24-hour, suited to the dense label row. */
  hour12?: boolean;
  /** CSS class */
  className?: string;
}

/** Reserved key for a window that matches no standard preset (see {@link makeCustomPreset}). */
export const CUSTOM_PRESET_KEY = "custom";

/** Default fallback window key when {@link TimeRangeSelectorProps.defaultWindow} is unset/unmatched. */
export const DEFAULT_WINDOW_KEY = "1d";

export const DEFAULT_PRESETS: WindowPreset[] = [
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

// ── Interaction tuning constants ──

/** Threshold (fraction 0–1) for detecting proximity to a selection edge marker. */
export const MARKER_HIT_FRACTION = 0.015;
/** Below this drag width (fraction) a create-gesture is treated as a single-bucket click. */
export const DRAG_CLICK_THRESHOLD = 0.03;
/** Minimum drag width (fraction) before the live drag preview box renders. */
export const DRAG_PREVIEW_MIN = 0.02;
/** Boundary markers within this fraction of either view edge are clipped. */
export const BOUNDARY_CLIP = 0.01;
/** A selection covering at least (1 - 2*epsilon) of the view is treated as "whole view". */
export const FULL_VIEW_EPSILON = 0.001;
/** Heatmap row height in pixels. */
export const CHART_HEIGHT = 20;
