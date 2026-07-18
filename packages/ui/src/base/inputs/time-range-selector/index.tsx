import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "@simplix-react/i18n/react";

import { cn } from "../../../utils/cn";
import { useChartTheme } from "../../charts/apexcharts/use-chart-theme";
import { useMediaQuery } from "../../../hooks/use-media-query";
import { Popover, PopoverContent, PopoverTrigger } from "../../overlay";
import {
  BoundaryMarkers,
  DateTimeInput,
  DragPreviewBox,
  HeatmapCanvas,
  HoverTooltip,
  NavButton,
  NowIndicator,
  PresetBar,
  SelectionBox,
  TimeLabels,
} from "./components";
import { AlertIcon, CalendarIcon } from "./icons";
import {
  bucketToDate,
  buildChartOptions,
  clamp01,
  clampMonthStart,
  computeBoundaryMarkers,
  calendarAnchor,
  computeNowMarkerPct,
  computeTimeLabels,
  formatRangeDisplay,
  getBucketCount,
  makeCustomPreset,
  minutesToMs,
  snapSelectionToBuckets,
  snapToFloor,
} from "./helpers";
import { HEATMAP_THEMES, pickReadableForeground } from "./themes";
import {
  CUSTOM_PRESET_KEY,
  DEFAULT_PRESETS,
  DEFAULT_WINDOW_KEY,
  DRAG_CLICK_THRESHOLD,
  DRAG_PREVIEW_MIN,
  FULL_VIEW_EPSILON,
  MARKER_HIT_FRACTION,
  type TimeRangeSelectorProps,
  type WindowPreset,
} from "./types";

// Public re-exports (preserve the package surface previously owned by this file).
export { HEATMAP_THEMES } from "./themes";
export type { HeatmapColorTheme, HeatmapPalette } from "./themes";
export type { TimeRange, TimeRangeSelectorProps, TimeRangeValue, WindowPreset } from "./types";

type DragMode = "create" | "resize-left" | "resize-right";
interface DragState {
  mode: DragMode;
  startX: number;
  currentX: number;
  anchor?: number;
}

/**
 * Time range selector with heatmap visualization.
 *
 * <p>Displays a single-row heatmap showing count distribution over a time window.
 * Select a sub-range by dragging (mouse, touch, or pen) or with the keyboard
 * (arrow keys move, Shift+arrows resize, Home/End jump, PageUp/Down navigate),
 * switch window sizes via presets, navigate with ◀ ▶, jump to Now, or pick dates
 * via the calendar. Expanding a selection zooms the view into it (a preset-less
 * "custom" window); the Custom chip zooms back out.
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
  defaultWindow = DEFAULT_WINDOW_KEY,
  minDate,
  maxDate,
  hour12 = false,
  displayZone,
  className,
}: TimeRangeSelectorProps) {
  const { t, locale } = useTranslation("simplix/ui");
  const theme = useChartTheme();
  const isDark = theme.tooltipTheme === "dark";
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const pointerFine = useMediaQuery("(pointer: fine)");

  const presets = presetsProp && presetsProp.length > 0 ? presetsProp : DEFAULT_PRESETS;
  const [activePreset, setActivePreset] = useState<WindowPreset>(
    () =>
      presets.find((p) => p.key === defaultWindow) ??
      presets.find((p) => p.key === DEFAULT_WINDOW_KEY) ??
      presets[Math.min(7, presets.length - 1)] ??
      presets[0],
  );

  // View window
  const [viewFrom, setViewFrom] = useState<Date>(() => {
    const mid = new Date((value.from.getTime() + value.to.getTime()) / 2);
    const halfMs = minutesToMs(activePreset.windowMinutes) / 2;
    return snapToFloor(new Date(mid.getTime() - halfMs), activePreset.bucketMinutes);
  });

  const viewTo = useMemo(() => {
    if (activePreset.key === "1mo") {
      return new Date(viewFrom.getFullYear(), viewFrom.getMonth() + 1, 1);
    }
    return new Date(viewFrom.getTime() + minutesToMs(activePreset.windowMinutes));
  }, [viewFrom, activePreset]);

  const bucketCount = useMemo(() => {
    if (activePreset.key === "1mo") {
      const daysInMonth = (viewTo.getTime() - viewFrom.getTime()) / (24 * 60 * 60 * 1000);
      return Math.round(daysInMonth);
    }
    return getBucketCount(activePreset);
  }, [viewFrom, viewTo, activePreset]);

  const accentColor = useMemo(() => {
    const palette = HEATMAP_THEMES[colorTheme] ?? HEATMAP_THEMES.slate;
    return isDark ? palette.accent.dark : palette.accent.light;
  }, [colorTheme, isDark]);
  const accentForeground = useMemo(() => pickReadableForeground(accentColor), [accentColor]);

  // ── Counts data ──
  const [counts, setCounts] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const [reloadNonce, setReloadNonce] = useState(0);
  const fetchRef = useRef(0);

  useEffect(() => {
    const id = ++fetchRef.current;
    setIsLoading(true);
    setError(false);
    fetchCounts(viewFrom, viewTo, bucketCount)
      .then((data) => {
        if (fetchRef.current === id) setCounts(data);
      })
      .catch(() => {
        if (fetchRef.current === id) {
          setCounts([]);
          setError(true);
        }
      })
      .finally(() => {
        if (fetchRef.current === id) setIsLoading(false);
      });
    // fetchCounts is a dependency so a host filter change (new closure) refetches;
    // the fetchRef id guard discards stale resolves. Hosts should memoize fetchCounts.
  }, [viewFrom, viewTo, bucketCount, reloadNonce, fetchCounts]);

  // ── Now-marker tick (advances in Live mode without an unrelated re-render) ──
  const [nowTick, setNowTick] = useState<number>(() => Date.now());
  useEffect(() => {
    const cadenceMs = Math.min(60000, Math.max(1000, minutesToMs(activePreset.bucketMinutes)));
    const id = setInterval(() => setNowTick(Date.now()), cadenceMs);
    return () => clearInterval(id);
  }, [activePreset.bucketMinutes]);

  // ── External value re-sync: re-center the window when value jumps fully outside it ──
  const viewRef = useRef({ viewFrom, viewTo, preset: activePreset });
  viewRef.current = { viewFrom, viewTo, preset: activePreset };
  useEffect(() => {
    const { viewFrom: vf, viewTo: vt, preset } = viewRef.current;
    if (value.from.getTime() >= vt.getTime() || value.to.getTime() <= vf.getTime()) {
      const mid = new Date((value.from.getTime() + value.to.getTime()) / 2);
      if (preset.key === "1mo") {
        // Month preset re-centers to the 1st of the month containing the value's midpoint.
        setViewFrom(new Date(mid.getFullYear(), mid.getMonth(), 1));
      } else {
        const halfMs = minutesToMs(preset.windowMinutes) / 2;
        setViewFrom(snapToFloor(new Date(mid.getTime() - halfMs), preset.bucketMinutes));
      }
    }
  }, [value]);

  // ── Previous (non-custom) window, restored by the Custom chip's zoom-out ──
  const prevWindowRef = useRef<{ preset: WindowPreset; viewFrom: Date }>({ preset: activePreset, viewFrom });
  useEffect(() => {
    if (activePreset.key !== CUSTOM_PRESET_KEY) {
      prevWindowRef.current = { preset: activePreset, viewFrom };
    }
  }, [activePreset, viewFrom]);

  // ── Selection highlight ──
  const selectionOverlay = useMemo(() => {
    const viewFromMs = viewFrom.getTime();
    const viewToMs = viewTo.getTime();
    const windowMs = viewToMs - viewFromMs;
    if (windowMs <= 0) return null;
    if (value.from.getTime() >= viewToMs || value.to.getTime() <= viewFromMs) return null;
    const left = Math.max(0, (value.from.getTime() - viewFromMs) / windowMs);
    const right = Math.min(1, (value.to.getTime() - viewFromMs) / windowMs);
    if (left <= FULL_VIEW_EPSILON && right >= 1 - FULL_VIEW_EPSILON) return null;
    return { left, right };
  }, [value, viewFrom, viewTo]);

  // ── Derived view geometry ──
  const nowPct = useMemo(() => computeNowMarkerPct(viewFrom, viewTo, nowTick), [viewFrom, viewTo, nowTick]);
  const boundaryMarkers = useMemo(() => computeBoundaryMarkers(viewFrom, viewTo, activePreset), [viewFrom, viewTo, activePreset]);
  const timeLabels = useMemo(
    () => computeTimeLabels(viewFrom, activePreset.windowMinutes, activePreset.bucketMinutes, locale, hour12, displayZone),
    [viewFrom, activePreset, locale, hour12, displayZone],
  );

  const { options: chartOptions, series: chartSeries } = useMemo(
    () =>
      buildChartOptions({
        counts,
        bucketCount,
        viewFrom,
        bucketMinutes: activePreset.bucketMinutes,
        locale,
        hour12,
        timeZone: displayZone,
        maxCount,
        colorTheme,
        colorStepsProp,
        colorStepBaseMinutes,
        isDark,
        theme: { fontFamily: theme.fontFamily, background: theme.background },
        animationsEnabled: !reducedMotion,
      }),
    [counts, bucketCount, viewFrom, activePreset, locale, hour12, displayZone, maxCount, colorTheme, colorStepsProp, colorStepBaseMinutes, isDark, theme, reducedMotion],
  );
  const chartKey = `${isDark ? "d" : "l"}-${activePreset.key}`;

  // Selected-range total (for the assistive-tech summary / live region).
  const selectedCount = useMemo(() => {
    // Sum counts over the selected range intersected with the view (0 when out of view).
    const windowMs = viewTo.getTime() - viewFrom.getTime();
    if (windowMs <= 0) return 0;
    const lf = clamp01((value.from.getTime() - viewFrom.getTime()) / windowMs);
    const rf = clamp01((value.to.getTime() - viewFrom.getTime()) / windowMs);
    const fromB = Math.max(0, Math.floor(lf * bucketCount));
    const toB = Math.min(bucketCount, Math.ceil(rf * bucketCount));
    let sum = 0;
    for (let i = fromB; i < toB; i++) sum += counts[i] ?? 0;
    return sum;
  }, [value, viewFrom, viewTo, bucketCount, counts]);

  const rangeText = formatRangeDisplay(value.from, value.to, locale, hour12, displayZone);
  const ariaSummary = `${rangeText} · ${selectedCount}`;

  // ── Helpers ──
  const clampViewFrom = useCallback(
    (from: Date, preset: WindowPreset): Date => {
      let ms = from.getTime();
      const windowMs = minutesToMs(preset.windowMinutes);
      if (maxDate && ms + windowMs > maxDate.getTime()) ms = maxDate.getTime() - windowMs;
      if (minDate && ms < minDate.getTime()) ms = minDate.getTime();
      return snapToFloor(new Date(ms), preset.bucketMinutes);
    },
    [minDate, maxDate],
  );

  // ── Window handlers ──
  const handlePresetChange = useCallback(
    (preset: WindowPreset) => {
      setActivePreset(preset);
      const now = new Date();
      const windowMs = minutesToMs(preset.windowMinutes);
      const bucketMs = minutesToMs(preset.bucketMinutes);
      let newFrom: Date;
      let newTo: Date;

      if (preset.key === "1mo") {
        newFrom = calendarAnchor(now, displayZone, (w) => new Date(w.getFullYear(), w.getMonth(), 1));
        newTo = calendarAnchor(now, displayZone, (w) => new Date(w.getFullYear(), w.getMonth() + 1, 1));
        setViewFrom(newFrom);
        onChange({ from: newFrom, to: newTo, bucketMinutes: preset.bucketMinutes });
        return;
      } else if (preset.windowMinutes >= 1440) {
        // Day-and-longer windows anchor to the display zone's end of today.
        const todayEnd = calendarAnchor(now, displayZone, (w) => new Date(w.getFullYear(), w.getMonth(), w.getDate() + 1));
        newTo = todayEnd;
        newFrom = new Date(todayEnd.getTime() - windowMs);
      } else {
        newTo = new Date(Math.ceil(now.getTime() / bucketMs) * bucketMs);
        newFrom = new Date(newTo.getTime() - windowMs);
      }

      newFrom = clampViewFrom(newFrom, preset);
      newTo = new Date(newFrom.getTime() + windowMs);
      setViewFrom(newFrom);
      onChange({ from: newFrom, to: newTo, bucketMinutes: preset.bucketMinutes });
    },
    [clampViewFrom, onChange, displayZone],
  );

  const handleNavigate = useCallback(
    (direction: -1 | 1) => {
      if (activePreset.key === "1mo") {
        // Step by whole calendar months (in the display zone) so the window stays month-aligned.
        const from = clampMonthStart(
          calendarAnchor(viewFrom, displayZone, (w) => new Date(w.getFullYear(), w.getMonth() + direction, 1)),
          minDate,
          maxDate,
        );
        const to = calendarAnchor(from, displayZone, (w) => new Date(w.getFullYear(), w.getMonth() + 1, 1));
        setViewFrom(from);
        onChange({ from, to, bucketMinutes: activePreset.bucketMinutes });
        return;
      }
      const shiftMs = minutesToMs(activePreset.windowMinutes);
      let ms = viewFrom.getTime() + direction * shiftMs;
      if (maxDate && ms + shiftMs > maxDate.getTime()) ms = maxDate.getTime() - shiftMs;
      if (minDate && ms < minDate.getTime()) ms = minDate.getTime();
      const newFrom = snapToFloor(new Date(ms), activePreset.bucketMinutes);
      const newTo = new Date(newFrom.getTime() + shiftMs);
      setViewFrom(newFrom);
      onChange({ from: newFrom, to: newTo, bucketMinutes: activePreset.bucketMinutes });
    },
    [activePreset, viewFrom, minDate, maxDate, onChange, displayZone],
  );

  const handleNow = useCallback(() => {
    const now = new Date();
    if (activePreset.key === "1mo") {
      const from = clampMonthStart(
        calendarAnchor(now, displayZone, (w) => new Date(w.getFullYear(), w.getMonth(), 1)),
        minDate,
        maxDate,
      );
      const to = calendarAnchor(from, displayZone, (w) => new Date(w.getFullYear(), w.getMonth() + 1, 1));
      setViewFrom(from);
      onChange({ from, to, bucketMinutes: activePreset.bucketMinutes });
      return;
    }
    const windowMs = minutesToMs(activePreset.windowMinutes);
    const newFrom = clampViewFrom(snapToFloor(new Date(now.getTime() - windowMs / 2), activePreset.bucketMinutes), activePreset);
    const newTo = new Date(newFrom.getTime() + windowMs);
    setViewFrom(newFrom);
    onChange({ from: newFrom, to: newTo, bucketMinutes: activePreset.bucketMinutes });
  }, [activePreset, clampViewFrom, minDate, maxDate, onChange, displayZone]);

  const handleDateRangeChange = useCallback(
    (edited: "from" | "to", d: Date) => {
      // Single-endpoint edit: clamp the edited side against its sibling. A crossing
      // edit is rejected (the field snaps back) rather than swapped, so the typed
      // value never teleports into the other field during per-keystroke editing.
      const from = edited === "from" ? d : value.from;
      const to = edited === "to" ? d : value.to;
      if (to.getTime() <= from.getTime()) return;
      // An explicit calendar range becomes a preset-less custom window (no false preset highlight).
      const custom = makeCustomPreset(presets, from, to);
      setActivePreset(custom);
      setViewFrom(from);
      onChange({ from, to, bucketMinutes: custom.bucketMinutes });
    },
    [value, presets, onChange],
  );

  const handleReset = useCallback(() => {
    onChange({ from: viewFrom, to: viewTo, bucketMinutes: activePreset.bucketMinutes });
  }, [viewFrom, viewTo, activePreset, onChange]);

  const handleExpandToSelection = useCallback(() => {
    if (value.to.getTime() <= value.from.getTime()) return;
    const custom = makeCustomPreset(presets, value.from, value.to);
    setActivePreset(custom);
    setViewFrom(value.from);
    onChange({ from: value.from, to: value.to, bucketMinutes: custom.bucketMinutes });
  }, [value, presets, onChange]);

  const handleZoomOut = useCallback(() => {
    const prev = prevWindowRef.current;
    if (prev && prev.preset.key !== CUSTOM_PRESET_KEY) {
      setActivePreset(prev.preset);
      setViewFrom(prev.viewFrom);
    }
  }, []);

  // ── Pointer drag selection (unified mouse / touch / pen) ──
  const dragContainerRef = useRef<HTMLDivElement>(null);
  const pointerIdRef = useRef<number | null>(null);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const clientXToFraction = useCallback((clientX: number): number => {
    const rect = dragContainerRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return 0;
    return clamp01((clientX - rect.left) / rect.width);
  }, []);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!e.isPrimary) return;
      if (e.pointerType === "mouse" && e.button !== 0) return;
      const x = clientXToFraction(e.clientX);
      // Coarse pointers (touch) get a wider edge grab band than fine pointers.
      const markerHit = pointerFine ? MARKER_HIT_FRACTION : MARKER_HIT_FRACTION * 2.5;
      let mode: DragMode = "create";
      let anchor: number | undefined;
      if (selectionOverlay) {
        if (Math.abs(x - selectionOverlay.left) < markerHit) {
          mode = "resize-left";
          anchor = selectionOverlay.right;
        } else if (Math.abs(x - selectionOverlay.right) < markerHit) {
          mode = "resize-right";
          anchor = selectionOverlay.left;
        }
      }
      dragContainerRef.current?.setPointerCapture(e.pointerId);
      pointerIdRef.current = e.pointerId;
      setDragState({ mode, startX: x, currentX: x, anchor });
      setHoverIdx(null);
    },
    [selectionOverlay, clientXToFraction, pointerFine],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      const x = clientXToFraction(e.clientX);
      if (dragState) {
        setDragState((prev) => (prev ? { ...prev, currentX: x } : null));
        setHoverIdx(null);
        return;
      }
      // Cursor feedback only for fine pointers (mouse/pen); touch has no hover cursor.
      if (pointerFine && dragContainerRef.current) {
        const nearMarker =
          selectionOverlay &&
          (Math.abs(x - selectionOverlay.left) < MARKER_HIT_FRACTION || Math.abs(x - selectionOverlay.right) < MARKER_HIT_FRACTION);
        dragContainerRef.current.style.cursor = nearMarker ? "col-resize" : "crosshair";
      }
      setHoverIdx(Math.min(bucketCount - 1, Math.floor(x * bucketCount)));
    },
    [dragState, bucketCount, selectionOverlay, clientXToFraction, pointerFine],
  );

  const releaseCapture = useCallback(() => {
    const id = pointerIdRef.current;
    if (id != null && dragContainerRef.current?.hasPointerCapture(id)) {
      dragContainerRef.current.releasePointerCapture(id);
    }
    pointerIdRef.current = null;
    if (dragContainerRef.current) dragContainerRef.current.style.cursor = "";
  }, []);

  const handlePointerUp = useCallback(() => {
    releaseCapture();
    if (!dragState) return;
    const bucketMinutes = activePreset.bucketMinutes;

    if (dragState.mode === "resize-left" || dragState.mode === "resize-right") {
      const a = dragState.anchor ?? dragState.startX;
      const sel = snapSelectionToBuckets(Math.min(a, dragState.currentX), Math.max(a, dragState.currentX), viewFrom, bucketCount, bucketMinutes);
      setDragState(null);
      if (sel) onChange({ ...sel, bucketMinutes });
      return;
    }

    const left = Math.min(dragState.startX, dragState.currentX);
    const right = Math.max(dragState.startX, dragState.currentX);
    setDragState(null);
    if (right - left < DRAG_CLICK_THRESHOLD) {
      const clickedBucket = Math.floor(left * bucketCount);
      onChange({
        from: bucketToDate(viewFrom, clickedBucket, bucketMinutes),
        to: bucketToDate(viewFrom, clickedBucket + 1, bucketMinutes),
        bucketMinutes,
      });
      return;
    }
    const sel = snapSelectionToBuckets(left, right, viewFrom, bucketCount, bucketMinutes);
    if (sel) onChange({ ...sel, bucketMinutes });
  }, [dragState, activePreset, viewFrom, bucketCount, onChange, releaseCapture]);

  const handlePointerCancel = useCallback(() => {
    releaseCapture();
    setDragState(null);
    setHoverIdx(null);
  }, [releaseCapture]);

  const handlePointerLeave = useCallback(() => {
    if (!dragState) setHoverIdx(null);
  }, [dragState]);

  // ── Keyboard selection (WCAG 2.1.1) ──
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const key = e.key;
      if (key === "PageUp") { e.preventDefault(); handleNavigate(-1); return; }
      if (key === "PageDown") { e.preventDefault(); handleNavigate(1); return; }
      if (key === "Escape") { e.preventDefault(); handleReset(); return; }
      if (key !== "ArrowLeft" && key !== "ArrowRight" && key !== "Home" && key !== "End") return;
      e.preventDefault();

      const bucketMinutes = activePreset.bucketMinutes;
      const emit = (a: number, b: number) => {
        const lo = Math.max(0, Math.min(a, bucketCount - 1));
        const hi = Math.min(bucketCount, Math.max(b, lo + 1));
        onChange({ from: bucketToDate(viewFrom, lo, bucketMinutes), to: bucketToDate(viewFrom, hi, bucketMinutes), bucketMinutes });
      };

      if (key === "Home") { emit(0, 1); return; }
      if (key === "End") { emit(bucketCount - 1, bucketCount); return; }

      // Recover the selection's bucket bounds. value.from/to are bucket-snapped, so the
      // right edge is an exact integer with possible float noise — round() recovers it
      // (ceil would inflate, floor would deflate); the Math.max guard prevents collapse.
      const hasSel = selectionOverlay != null;
      const fromB = hasSel ? Math.floor(selectionOverlay.left * bucketCount) : 0;
      const toB = hasSel ? Math.max(fromB + 1, Math.round(selectionOverlay.right * bucketCount)) : 0;

      if (!hasSel) {
        if (key === "ArrowRight") emit(0, 1);
        else emit(bucketCount - 1, bucketCount);
        return;
      }

      if (e.shiftKey) {
        // Resize the right edge.
        if (key === "ArrowRight") emit(fromB, toB + 1);
        else emit(fromB, toB - 1);
        return;
      }

      // Move the whole selection by one bucket.
      const width = toB - fromB;
      if (key === "ArrowRight") {
        const nf = Math.min(fromB + 1, bucketCount - width);
        emit(nf, nf + width);
      } else {
        const nf = Math.max(0, fromB - 1);
        emit(nf, nf + width);
      }
    },
    [activePreset, bucketCount, viewFrom, selectionOverlay, onChange, handleNavigate, handleReset],
  );

  const isCustom = activePreset.key === CUSTOM_PRESET_KEY;

  // ── Render ──
  return (
    <div className={cn("relative w-full rounded-lg border border-border bg-card", className)}>
      {/* Controls bar */}
      <div className="flex items-center justify-between px-2 pt-2 pb-1">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-semibold tabular-nums">{rangeText}</span>
          {selectionOverlay && (
            <button
              type="button"
              className="px-1.5 py-0.5 rounded text-[10px] text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              onClick={handleReset}
              aria-label={t("timeRange.clear", { defaultValue: "Clear selection" })}
            >
              ✕
            </button>
          )}
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="inline-flex items-center justify-center h-7 w-7 rounded-md border border-input bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
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
                  onChange={(d) => handleDateRangeChange("from", d)}
                />
                <DateTimeInput
                  label={t("timeRange.to", { defaultValue: "To" })}
                  value={value.to}
                  onChange={(d) => handleDateRangeChange("to", d)}
                />
              </div>
            </PopoverContent>
          </Popover>
          <button
            type="button"
            className="h-7 px-2 rounded-md text-xs font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors border border-input focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            onClick={handleNow}
          >
            {t("timeRange.now", { defaultValue: "Now" })}
          </button>
        </div>

        <PresetBar presets={presets} activeKey={activePreset.key} onSelect={handlePresetChange} isCustom={isCustom} onZoomOut={handleZoomOut} t={t} />
      </div>

      {/* Heatmap with nav buttons */}
      <div className="flex items-center gap-0 px-1">
        <NavButton direction="prev" onClick={() => handleNavigate(-1)} label={t("timeRange.previous", { defaultValue: "Previous" })} />

        <div
          ref={dragContainerRef}
          role="group"
          tabIndex={0}
          aria-label={ariaSummary}
          aria-roledescription={t("timeRange.roleDescription", { defaultValue: "Time range heatmap" })}
          aria-keyshortcuts="ArrowLeft ArrowRight Shift+ArrowLeft Shift+ArrowRight Home End PageUp PageDown Escape"
          aria-busy={isLoading}
          className={cn(
            "relative flex-1 min-w-0 overflow-visible touch-none transition-opacity rounded-sm",
            "[&_.apexcharts-canvas]:outline-none [&_.apexcharts-svg]:outline-none [&_.apexcharts-canvas]:overflow-visible [&_svg]:overflow-visible",
            "select-none cursor-col-resize focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
            "before:content-[''] before:absolute before:-top-1 before:-bottom-1 before:left-0 before:right-0",
            isLoading && "opacity-50",
          )}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
          onPointerLeave={handlePointerLeave}
          onKeyDown={handleKeyDown}
        >
          <HeatmapCanvas chartKey={chartKey} options={chartOptions} series={chartSeries} />

          {selectionOverlay && !dragState && (
            <SelectionBox
              left={selectionOverlay.left}
              right={selectionOverlay.right}
              accentColor={accentColor}
              accentForeground={accentForeground}
              onExpand={handleExpandToSelection}
              onClear={handleReset}
              expandLabel={t("timeRange.expand", { defaultValue: "Expand to selection" })}
              clearLabel={t("timeRange.clear", { defaultValue: "Clear selection" })}
            />
          )}

          {dragState && Math.abs(dragState.currentX - dragState.startX) > DRAG_PREVIEW_MIN && (() => {
            const isResize = dragState.mode === "resize-left" || dragState.mode === "resize-right";
            const a = isResize ? (dragState.anchor ?? dragState.startX) : dragState.startX;
            return (
              <DragPreviewBox
                left={Math.min(a, dragState.currentX)}
                right={Math.max(a, dragState.currentX)}
                accentColor={accentColor}
              />
            );
          })()}

          <NowIndicator pct={nowPct} />
          <BoundaryMarkers markers={boundaryMarkers} />

          {hoverIdx != null && !dragState && (
            <HoverTooltip
              hoverIdx={hoverIdx}
              bucketCount={bucketCount}
              viewFrom={viewFrom}
              bucketMinutes={activePreset.bucketMinutes}
              counts={counts}
              locale={locale}
              hour12={hour12}
              timeZone={displayZone}
            />
          )}

          {error && (
            <div
              className="absolute inset-0 z-30 flex items-center justify-center gap-2 rounded-sm bg-card/85 text-xs text-muted-foreground"
              onPointerDown={(e) => e.stopPropagation()}
            >
              <AlertIcon className="size-3.5 text-destructive" />
              <span>{t("timeRange.loadError", { defaultValue: "Failed to load" })}</span>
              <button
                type="button"
                className="rounded border border-input px-1.5 py-0.5 hover:bg-accent hover:text-accent-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                onClick={() => setReloadNonce((n) => n + 1)}
              >
                {t("timeRange.retry", { defaultValue: "Retry" })}
              </button>
            </div>
          )}
        </div>

        <NavButton direction="next" onClick={() => handleNavigate(1)} label={t("timeRange.next", { defaultValue: "Next" })} />
      </div>

      <TimeLabels labels={timeLabels} />

      {/* Assistive-tech live summary of the selected range + count */}
      <span className="sr-only" aria-live="polite">{ariaSummary}</span>
    </div>
  );
}
