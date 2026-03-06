import { useCallback, useEffect, useRef, useState } from "react";

import type { GeoPoint, MapFitOptions } from "../../utils/geo";
import { DEFAULT_MAP_FIT_OPTIONS, fitMapToBounds } from "../../utils/geo";
import { Button } from "../controls/button";

// ── useMapNavigator hook ──

interface UseMapNavigatorOptions<T extends GeoPoint> {
  items: T[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mapRef: React.RefObject<{ flyTo: (...args: any[]) => any; fitBounds: (...args: any[]) => any } | null>;
  fitOptions?: MapFitOptions;
}

interface UseMapNavigatorResult {
  focusedIndex: number;
  navigateTo: (index: number) => void;
  handlePrev: () => void;
  handleNext: () => void;
  fitAll: () => void;
}

function useMapNavigator<T extends GeoPoint>({ items, mapRef, fitOptions }: UseMapNavigatorOptions<T>): UseMapNavigatorResult {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const itemsRef = useRef(items);
  itemsRef.current = items;
  const optionsRef = useRef(fitOptions);
  optionsRef.current = fitOptions;

  useEffect(() => {
    setFocusedIndex(0);
  }, [items]);

  const flyToItem = useCallback((item: GeoPoint) => {
    const map = mapRef.current;
    if (!map) return;
    const zoom = optionsRef.current?.zoom ?? DEFAULT_MAP_FIT_OPTIONS.zoom;
    map.flyTo({ center: [item.longitude, item.latitude], zoom });
  }, [mapRef]);

  const navigateTo = useCallback((index: number) => {
    setFocusedIndex(index);
    const item = itemsRef.current[index];
    if (item) flyToItem(item);
  }, [flyToItem]);

  const handlePrev = useCallback(() => {
    const len = itemsRef.current.length;
    if (len === 0) return;
    setFocusedIndex((prev) => {
      const next = prev <= 0 ? len - 1 : prev - 1;
      const item = itemsRef.current[next];
      if (item) flyToItem(item);
      return next;
    });
  }, [flyToItem]);

  const handleNext = useCallback(() => {
    const len = itemsRef.current.length;
    if (len === 0) return;
    setFocusedIndex((prev) => {
      const next = prev >= len - 1 ? 0 : prev + 1;
      const item = itemsRef.current[next];
      if (item) flyToItem(item);
      return next;
    });
  }, [flyToItem]);

  const fitAll = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    fitMapToBounds(map, itemsRef.current, optionsRef.current);
  }, [mapRef]);

  return { focusedIndex, navigateTo, handlePrev, handleNext, fitAll };
}

// ── MapNavigator component ──

interface MapNavigatorProps {
  total: number;
  focusedIndex: number;
  label?: string;
  fallbackLabel?: string;
  onPrev: () => void;
  onNext: () => void;
  onSelect?: () => void;
}

function MapNavigator({ total, focusedIndex, label, fallbackLabel, onPrev, onNext, onSelect }: MapNavigatorProps) {
  if (total === 0) return null;

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center p-3" style={{ zIndex: 10 }}>
      <div className="pointer-events-auto flex items-center rounded-md border bg-background shadow-md">
        <Button size="icon-sm" variant="ghost" className="rounded-none rounded-l-md" onClick={onPrev}>
          <ChevronLeftIcon />
        </Button>
        <div className="w-px bg-border" />
        <button
          type="button"
          className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium hover:bg-accent transition-colors whitespace-nowrap"
          onClick={onSelect}
        >
          <span className="tabular-nums text-muted-foreground">{String(focusedIndex + 1).padStart(2, "0")}</span>
          <span className="max-w-32 truncate">{label ?? fallbackLabel}</span>
          <span className="text-muted-foreground">/ {total}</span>
        </button>
        <div className="w-px bg-border" />
        <Button size="icon-sm" variant="ghost" className="rounded-none rounded-r-md" onClick={onNext}>
          <ChevronRightIcon />
        </Button>
      </div>
    </div>
  );
}

// Inline SVG icons to avoid lucide-react dependency in framework
function ChevronLeftIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
  );
}

export { MapNavigator, useMapNavigator };
export type { MapNavigatorProps, UseMapNavigatorOptions, UseMapNavigatorResult };
