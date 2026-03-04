import MapLibreGL, { type MarkerOptions, type ProjectionSpecification } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Protocol } from "pmtiles";
import { noLabels as pmNoLabels } from "protomaps-themes-base";
import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

import { cn } from "../utils/cn";

// ── PMTiles protocol ──

let pmtilesRegistered = false;
function ensurePmtilesProtocol() {
  if (pmtilesRegistered) return;
  const protocol = new Protocol();
  MapLibreGL.addProtocol("pmtiles", protocol.tile);
  pmtilesRegistered = true;
}

function buildPmtilesFallbackStyle(
  tileUrl: string,
  theme: "light" | "dark",
): MapLibreGL.StyleSpecification {
  return {
    version: 8,
    sources: {
      protomaps: {
        type: "vector",
        url: `pmtiles://${tileUrl}`,
      },
    },
    layers: pmNoLabels("protomaps", theme),
  };
}

// ── Online tile probe (cached) ──

let tileProbeCache: boolean | undefined;

if (typeof window !== "undefined") {
  const resetCache = () => { tileProbeCache = undefined; };
  window.addEventListener("online", resetCache);
  window.addEventListener("offline", resetCache);
}

/**
 * Probe whether an online style's tile server is actually reachable.
 * Fetches the style.json, extracts the first vector tile URL, and pings it.
 * Result is cached so only the first Map mount pays the cost.
 */
async function probeOnlineTiles(styleUrl: string): Promise<boolean> {
  if (tileProbeCache !== undefined) return tileProbeCache;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4000);

  try {
    const res = await fetch(styleUrl, { mode: "cors", signal: controller.signal });
    if (!res.ok) throw new Error();

    const style = await res.json() as Record<string, unknown>;
    const sources = style.sources as Record<string, Record<string, unknown>> | undefined;
    if (!sources) { tileProbeCache = true; return true; }

    for (const src of Object.values(sources)) {
      if (src.type !== "vector") continue;

      // Source with inline tile URLs — probe one tile
      if (Array.isArray(src.tiles) && typeof src.tiles[0] === "string") {
        const probeUrl = (src.tiles[0] as string)
          .replace("{z}", "0").replace("{x}", "0").replace("{y}", "0");
        await fetch(probeUrl, { mode: "cors", signal: controller.signal });
        tileProbeCache = true;
        return true;
      }

      // Source with TileJSON URL — probe that endpoint
      if (typeof src.url === "string" && !src.url.startsWith("pmtiles://")) {
        await fetch(src.url, { mode: "cors", signal: controller.signal });
        tileProbeCache = true;
        return true;
      }
    }

    tileProbeCache = true;
    return true;
  } catch {
    tileProbeCache = false;
    return false;
  } finally {
    clearTimeout(timeout);
  }
}

// ── Theme detection ──

const defaultStyles = {
  dark: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
  light: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
};

type Theme = "light" | "dark";

/** Detect theme from document class (Tailwind convention: "dark" class = dark, else light). */
function getDocumentTheme(): Theme {
  if (typeof document === "undefined") return "light";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function useResolvedTheme(themeProp?: Theme): Theme {
  const [detectedTheme, setDetectedTheme] = useState<Theme>(
    () => getDocumentTheme(),
  );

  useEffect(() => {
    if (themeProp) return;

    // When class changes, a theme system is in use —
    // absence of "dark" means light mode (standard Tailwind convention).
    const observer = new MutationObserver(() => {
      setDetectedTheme(
        document.documentElement.classList.contains("dark") ? "dark" : "light",
      );
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemChange = (e: MediaQueryListEvent) => {
      if (!getDocumentTheme()) {
        setDetectedTheme(e.matches ? "dark" : "light");
      }
    };
    mediaQuery.addEventListener("change", handleSystemChange);

    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener("change", handleSystemChange);
    };
  }, [themeProp]);

  return themeProp ?? detectedTheme;
}

// ── Map context ──

type MapContextValue = {
  map: MapLibreGL.Map | null;
  isLoaded: boolean;
};

const MapContext = createContext<MapContextValue | null>(null);

/** Access the MapLibre map instance from a child component. */
function useMap() {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error("useMap must be used within a Map component");
  }
  return context;
}

// ── Map component ──

type MapStyleOption = string | MapLibreGL.StyleSpecification;

/** Props for the {@link Map} component. */
type MapProps = {
  children?: ReactNode;
  className?: string;
  theme?: Theme;
  styles?: { light?: MapStyleOption; dark?: MapStyleOption };
  projection?: ProjectionSpecification;
  onError?: () => void;
  /** PMTiles file URL for offline fallback (e.g. "/offline-map.pmtiles"). */
  fallbackTileUrl?: string;
} & Omit<MapLibreGL.MapOptions, "container" | "style">;

type MapRef = MapLibreGL.Map;

const Map = forwardRef<MapRef, MapProps>(function Map(
  { children, className, theme: themeProp, styles, projection, center, onError, fallbackTileUrl, ...props },
  ref,
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<MapLibreGL.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const currentStyleRef = useRef<MapStyleOption | null>(null);
  const isFallbackRef = useRef(false);
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;
  const projectionRef = useRef(projection);
  projectionRef.current = projection;
  const fallbackTileUrlRef = useRef(fallbackTileUrl);
  fallbackTileUrlRef.current = fallbackTileUrl;
  const resolvedTheme = useResolvedTheme(themeProp);

  const mapStyles = useMemo(
    () => ({
      dark: styles?.dark ?? defaultStyles.dark,
      light: styles?.light ?? defaultStyles.light,
    }),
    [styles],
  );

  const setRef = useCallback(
    (map: MapLibreGL.Map | null) => {
      if (typeof ref === "function") ref(map as MapRef);
      else if (ref) (ref as React.MutableRefObject<MapRef | null>).current = map;
    },
    [ref],
  );

  // Initialize
  useEffect(() => {
    if (!containerRef.current) return;

    // Pre-register PMTiles protocol when fallback is available
    if (fallbackTileUrl) ensurePmtilesProtocol();

    const el = containerRef.current;
    let map: MapLibreGL.Map | null = null;
    let disposed = false;
    let fallbackTimer: ReturnType<typeof setTimeout> | undefined;

    const initMap = (style: MapStyleOption) => {
      if (disposed || !el) return;
      currentStyleRef.current = style;

      map = new MapLibreGL.Map({
        container: el,
        style,
        center,
        renderWorldCopies: false,
        attributionControl: false,
        ...props,
      });
      map.addControl(new MapLibreGL.AttributionControl({ compact: true }));

      const localMap = map;

      localMap.on("load", () => {
        if (disposed) return;
        setIsLoaded(true);
        if (projectionRef.current) localMap.setProjection(projectionRef.current);
        el.querySelector(".maplibregl-compact-show")
          ?.classList.remove("maplibregl-compact-show");

        // After load, verify tiles actually rendered (handles tile-only CORS failures)
        if (fallbackTileUrlRef.current && !isFallbackRef.current) {
          fallbackTimer = setTimeout(() => {
            if (disposed || isFallbackRef.current) return;
            if (localMap.queryRenderedFeatures().length === 0) {
              isFallbackRef.current = true;
              const theme = getDocumentTheme();
              const s = buildPmtilesFallbackStyle(fallbackTileUrlRef.current!, theme);
              currentStyleRef.current = s;
              localMap.setStyle(s);
            }
          }, 3000);
        }
      });

      localMap.on("error", () => {
        if (fallbackTileUrlRef.current && !isFallbackRef.current) {
          clearTimeout(fallbackTimer);
          isFallbackRef.current = true;
          tileProbeCache = undefined; // Invalidate cache — tiles are failing
          const theme = getDocumentTheme();
          const s = buildPmtilesFallbackStyle(fallbackTileUrlRef.current, theme);
          currentStyleRef.current = s;
          localMap.setStyle(s);
          return;
        }
        onErrorRef.current?.();
      });

      setMapInstance(localMap);
      setRef(localMap);
    };

    // Determine initial style: probe tile server when fallback is available
    const cartoStyle = resolvedTheme === "dark" ? mapStyles.dark : mapStyles.light;

    if (fallbackTileUrl && typeof cartoStyle === "string") {
      probeOnlineTiles(cartoStyle).then((reachable) => {
        if (disposed) return;
        if (reachable) {
          initMap(cartoStyle);
        } else {
          isFallbackRef.current = true;
          initMap(buildPmtilesFallbackStyle(fallbackTileUrl, getDocumentTheme()));
        }
      });
    } else {
      initMap(cartoStyle);
    }

    return () => {
      disposed = true;
      clearTimeout(fallbackTimer);
      if (map) {
        map.remove();
        setIsLoaded(false);
        setMapInstance(null);
        setRef(null);
      }
    };
    // intentionally run once on mount
  }, []);

  // Handle theme change
  useEffect(() => {
    if (!mapInstance) return;

    const newStyle = isFallbackRef.current && fallbackTileUrl
      ? buildPmtilesFallbackStyle(fallbackTileUrl, resolvedTheme)
      : resolvedTheme === "dark" ? mapStyles.dark : mapStyles.light;

    // For object styles (PMTiles), always apply on theme change
    if (typeof newStyle === "string" && currentStyleRef.current === newStyle) return;

    currentStyleRef.current = newStyle;
    mapInstance.setStyle(newStyle, { diff: typeof newStyle === "string" });

    // Re-apply projection after style reload
    if (projectionRef.current) {
      const reapply = () => mapInstance.setProjection(projectionRef.current!);
      mapInstance.once("style.load", reapply);
    }
  }, [mapInstance, resolvedTheme, mapStyles, fallbackTileUrl]);

  // Sync center prop
  const centerLng = Array.isArray(center) ? center[0] : undefined;
  const centerLat = Array.isArray(center) ? center[1] : undefined;

  useEffect(() => {
    if (!mapInstance || centerLng == null || centerLat == null) return;
    const cur = mapInstance.getCenter();
    if (Math.abs(cur.lng - centerLng) > 1e-8 || Math.abs(cur.lat - centerLat) > 1e-8) {
      mapInstance.setCenter([centerLng, centerLat]);
    }
  }, [mapInstance, centerLng, centerLat]);

  const contextValue = useMemo(
    () => ({ map: mapInstance, isLoaded }),
    [mapInstance, isLoaded],
  );

  return (
    <MapContext.Provider value={contextValue}>
      <div ref={containerRef} className={cn("relative h-full w-full", className)}>
        {mapInstance && children}
      </div>
    </MapContext.Provider>
  );
});

// ── MapMarker component ──

/** Props for the {@link MapMarker} component. */
type MapMarkerProps = {
  longitude: number;
  latitude: number;
  children?: ReactNode;
  onDragEnd?: (lngLat: { lng: number; lat: number }) => void;
} & Omit<MarkerOptions, "element">;

function MapMarker({
  longitude,
  latitude,
  children,
  onDragEnd,
  draggable = false,
  ...markerOptions
}: MapMarkerProps) {
  const { map } = useMap();

  const onDragEndRef = useRef(onDragEnd);
  onDragEndRef.current = onDragEnd;

  const marker = useMemo(() => {
    const el = document.createElement("div");
    const instance = new MapLibreGL.Marker({
      ...markerOptions,
      element: el,
      draggable,
    }).setLngLat([longitude, latitude]);

    const handleDragEnd = () => {
      const lngLat = instance.getLngLat();
      onDragEndRef.current?.({ lng: lngLat.lng, lat: lngLat.lat });
    };
    instance.on("dragend", handleDragEnd);

    return instance;
    // intentionally run once on mount
  }, []);

  useEffect(() => {
    if (!map) return;
    marker.addTo(map);
    return () => { marker.remove(); };
    // intentionally run once on mount
  }, [map]);

  // Sync position
  if (marker.getLngLat().lng !== longitude || marker.getLngLat().lat !== latitude) {
    marker.setLngLat([longitude, latitude]);
  }
  if (marker.isDraggable() !== draggable) {
    marker.setDraggable(draggable);
  }

  const el = marker.getElement();
  if (!el) return null;

  return createPortal(
    <div className="relative cursor-pointer">
      {children ?? <DefaultMarkerIcon />}
    </div>,
    el,
  );
}

function DefaultMarkerIcon() {
  return (
    <div className="relative h-4 w-4 rounded-full border-2 border-white bg-blue-500 shadow-lg" />
  );
}

// ── MapPinContainer ──

/** Props for the {@link MapPinContainer} component. */
type MapPinContainerProps = {
  children?: ReactNode;
  className?: string;
};

/**
 * Pin-shaped marker wrapper for use as MapMarker children.
 * Uses an SVG teardrop pin shape (based on Lucide MapPin) with children centered in the circle area.
 * The tip of the pin sits at the coordinate.
 */
function MapPinContainer({ children, className }: MapPinContainerProps) {
  return (
    <div
      className={cn("relative", className)}
      style={{ width: 36, height: 45, transform: "translateY(-50%)" }}
    >
      <svg
        viewBox="3 1 18 22"
        className="absolute inset-0 h-full w-full drop-shadow-md"
      >
        <path
          d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"
          className="fill-white dark:fill-neutral-800"
        />
      </svg>
      <div className="absolute left-1/2 top-[41%] -translate-x-1/2 -translate-y-1/2">
        {children}
      </div>
    </div>
  );
}

export { Map, MapMarker, MapPinContainer, useMap };
export type { MapProps, MapMarkerProps, MapPinContainerProps, MapRef, MapContextValue };
