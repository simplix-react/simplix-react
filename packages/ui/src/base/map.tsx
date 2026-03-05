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
import { useMapDefaults } from "./map-provider";

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
  { children, className, theme: themeProp, styles, projection, center, onError, fallbackTileUrl: fallbackTileUrlProp, ...props },
  ref,
) {
  const mapDefaults = useMapDefaults();
  const fallbackTileUrl = fallbackTileUrlProp ?? mapDefaults.defaultFallbackTileUrl;
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

// ── MapControls component ──

type MapControlsPosition = "top-left" | "top-right" | "bottom-left" | "bottom-right";

/** Props for the {@link MapControls} component. */
type MapControlsProps = {
  /** Placement location for the controls. */
  position?: MapControlsPosition;
  /** Enable zoom in/out buttons. */
  showZoom?: boolean;
  /** Enable compass button to reset bearing. */
  showCompass?: boolean;
  /** Enable locate button for user's location. */
  showLocate?: boolean;
  /** Enable fullscreen toggle button. */
  showFullscreen?: boolean;
  /** Additional CSS classes for the control group. */
  className?: string;
  /** Callback with user coordinates when located. */
  onLocate?: (coords: { longitude: number; latitude: number }) => void;
  /** Custom handler for compass button. Replaces default resetNorthPitch. */
  onCompass?: () => void;
};

const POSITION_CLASSES: Record<MapControlsPosition, string> = {
  "top-left": "top-0 left-0",
  "top-right": "top-0 right-0",
  "bottom-left": "bottom-0 left-0",
  "bottom-right": "bottom-0 right-0",
};

function MapControlButton({ onClick, children, className: cls }: { onClick: () => void; children: ReactNode; className?: string }) {
  return (
    <button
      type="button"
      className={cn(
        "flex h-8 w-8 items-center justify-center text-foreground/80 hover:bg-accent hover:text-foreground transition-colors",
        cls,
      )}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

/**
 * Map control buttons rendered inside a {@link Map} component.
 * Uses `useMap()` context to control the map instance.
 */
function MapControls({
  position = "bottom-right",
  showZoom = true,
  showCompass = false,
  showLocate = false,
  showFullscreen = false,
  className,
  onLocate,
  onCompass,
}: MapControlsProps) {
  const { map } = useMap();
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleLocate = useCallback(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      const coords = { longitude: pos.coords.longitude, latitude: pos.coords.latitude };
      if (map) map.flyTo({ center: [coords.longitude, coords.latitude], zoom: 15 });
      onLocate?.(coords);
    });
  }, [map, onLocate]);

  const handleFullscreen = useCallback(() => {
    const container = map?.getContainer()?.parentElement;
    if (!container) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
      setIsFullscreen(false);
    } else {
      container.requestFullscreen();
      setIsFullscreen(true);
    }
  }, [map]);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  const controls: ReactNode[] = [];

  if (showZoom) {
    controls.push(
      <MapControlButton key="zoom-in" onClick={() => map?.zoomIn()}>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
      </MapControlButton>,
      <div key="zoom-sep" className="h-px w-full bg-border" />,
      <MapControlButton key="zoom-out" onClick={() => map?.zoomOut()}>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /></svg>
      </MapControlButton>,
    );
  }

  if (showCompass) {
    if (controls.length > 0) controls.push(<div key="compass-sep" className="h-px w-full bg-border" />);
    controls.push(
      <MapControlButton key="compass" onClick={() => onCompass ? onCompass() : map?.resetNorthPitch({ duration: 300 })}>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" /></svg>
      </MapControlButton>,
    );
  }

  if (showLocate) {
    if (controls.length > 0) controls.push(<div key="locate-sep" className="h-px w-full bg-border" />);
    controls.push(
      <MapControlButton key="locate" onClick={handleLocate}>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="2" x2="5" y1="12" y2="12" /><line x1="19" x2="22" y1="12" y2="12" /><line x1="12" x2="12" y1="2" y2="5" /><line x1="12" x2="12" y1="19" y2="22" /><circle cx="12" cy="12" r="7" /><circle cx="12" cy="12" r="3" /></svg>
      </MapControlButton>,
    );
  }

  if (showFullscreen) {
    if (controls.length > 0) controls.push(<div key="fs-sep" className="h-px w-full bg-border" />);
    controls.push(
      <MapControlButton key="fullscreen" onClick={handleFullscreen}>
        {isFullscreen ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3" /><path d="M21 8h-3a2 2 0 0 1-2-2V3" /><path d="M3 16h3a2 2 0 0 1 2 2v3" /><path d="M16 21v-3a2 2 0 0 1 2-2h3" /></svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2" /><path d="M17 3h2a2 2 0 0 1 2 2v2" /><path d="M21 17v2a2 2 0 0 1-2 2h-2" /><path d="M7 21H5a2 2 0 0 1-2-2v-2" /></svg>
        )}
      </MapControlButton>,
    );
  }

  if (controls.length === 0) return null;

  return (
    <div
      className={cn("pointer-events-none absolute z-10 p-3", POSITION_CLASSES[position])}
    >
      <div className={cn("pointer-events-auto flex flex-col rounded-md border bg-background shadow-md overflow-hidden", className)}>
        {controls}
      </div>
    </div>
  );
}

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

  const defaults = useMapDefaults();

  return createPortal(
    <div className="relative cursor-pointer">
      {children ?? defaults.defaultMarkerIcon ?? <DefaultMarkerIcon />}
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

export { Map, MapControls, MapMarker, MapPinContainer, useMap };
export type { MapProps, MapControlsProps, MapMarkerProps, MapPinContainerProps, MapRef, MapContextValue };
