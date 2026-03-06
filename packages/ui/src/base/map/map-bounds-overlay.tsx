import { useEffect, useMemo } from "react";

import type { GeoPoint } from "../../utils/geo";
import { computeBoundingCircle, geoCircle } from "../../utils/geo";
import { useMap } from "./map";

interface MapBoundsOverlayProps {
  points: GeoPoint[];
  paddingM?: number;
  ripple?: {
    count: number;
    spacingM: number;
    cycleMs: number;
  };
}

const DEFAULT_RIPPLE = { count: 5, spacingM: 15, cycleMs: 2500 };

/**
 * Renders a dark mask with a circular hole around the given points,
 * plus optional ripple animation outside the boundary.
 * Must be rendered as a child of {@link Map}.
 */
function MapBoundsOverlay({ points, paddingM = 50, ripple = DEFAULT_RIPPLE }: MapBoundsOverlayProps) {
  const { map, isLoaded } = useMap();

  const bounds = useMemo(() => {
    if (points.length === 0) return null;
    return computeBoundingCircle(points, paddingM);
  }, [points, paddingM]);

  useEffect(() => {
    if (!isLoaded || !map || !bounds) return;

    const { centerLat, centerLng, radiusM } = bounds;
    const circle = geoCircle(centerLat, centerLng, radiusM);
    const { count, spacingM, cycleMs } = ripple;

    // Dark mask (world polygon with circle hole)
    const world: [number, number][] = [[-180, -90], [180, -90], [180, 90], [-180, 90], [-180, -90]];

    map.addSource("bounds-mask", {
      type: "geojson",
      data: { type: "Feature", properties: {}, geometry: { type: "Polygon", coordinates: [world, circle] } },
    });
    map.addLayer({
      id: "bounds-mask-fill",
      type: "fill",
      source: "bounds-mask",
      paint: { "fill-color": "#000", "fill-opacity": 0.2 },
    });

    // Boundary line (dashed)
    map.addSource("bounds-line", {
      type: "geojson",
      data: { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: circle } },
    });
    map.addLayer({
      id: "bounds-line-stroke",
      type: "line",
      source: "bounds-line",
      paint: { "line-color": "#3b82f6", "line-width": 1.5, "line-opacity": 0.5 },
    });

    // Pre-computed ripple circles at intervals beyond boundary
    const rippleWidths = Array.from({ length: count }, () => 0.5 + Math.random() * 2);
    for (let i = 0; i < count; i++) {
      const r = radiusM + spacingM * (i + 1);
      const coords = geoCircle(centerLat, centerLng, r);
      map.addSource(`ripple-${i}`, {
        type: "geojson",
        data: { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: coords } },
      });
      map.addLayer({
        id: `ripple-${i}`,
        type: "line",
        source: `ripple-${i}`,
        paint: { "line-color": "#3b82f6", "line-width": rippleWidths[i], "line-opacity": 0 },
      });
    }

    // Animate ripple opacity (wave expanding outward)
    const m = map;
    let disposed = false;
    let frame: number;
    function animate() {
      if (disposed) return;
      try {
        const t = (performance.now() % cycleMs) / cycleMs;
        for (let i = 0; i < count; i++) {
          const activation = i / count;
          let progress = t - activation;
          if (progress < 0) progress += 1;
          let opacity: number;
          if (progress < 0.15) opacity = progress / 0.15;
          else if (progress < 0.5) opacity = 1 - (progress - 0.15) / 0.35;
          else opacity = 0;
          const intensity = 0.08 + (i / count) * 0.2;
          m.setPaintProperty(`ripple-${i}`, "line-opacity", opacity * intensity);
        }
      } catch { /* map destroyed during route transition */ }
      if (!disposed) frame = requestAnimationFrame(animate);
    }
    animate();

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      try {
        for (let i = count - 1; i >= 0; i--) {
          if (m.getLayer(`ripple-${i}`)) m.removeLayer(`ripple-${i}`);
          if (m.getSource(`ripple-${i}`)) m.removeSource(`ripple-${i}`);
        }
        if (m.getLayer("bounds-line-stroke")) m.removeLayer("bounds-line-stroke");
        if (m.getSource("bounds-line")) m.removeSource("bounds-line");
        if (m.getLayer("bounds-mask-fill")) m.removeLayer("bounds-mask-fill");
        if (m.getSource("bounds-mask")) m.removeSource("bounds-mask");
      } catch { /* map already destroyed during route transition */ }
    };
  }, [isLoaded, map, bounds, ripple]);

  return null;
}

export { MapBoundsOverlay };
export type { MapBoundsOverlayProps };
