import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useTranslation } from "@simplix-react/i18n/react";

import type { CommonFieldProps } from "../../crud/shared/types";
import { MapPinIcon, MagnifyingGlassIcon, LocateIcon, SunIcon, MoonIcon, XIcon } from "../../crud/shared/icons";
import { useUIComponents } from "../../provider/ui-provider";
import { cn } from "../../utils/cn";
import { Map, MapMarker } from "../../base/map/map";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../base/overlay/dialog";
import { FieldWrapper } from "../shared/field-wrapper";

/** Props for the {@link LocationPickerField} component. */
export interface LocationPickerFieldProps extends CommonFieldProps {
  latitude: number;
  longitude: number;
  onLocationChange: (lat: number, lng: number) => void;
  zoom?: number;
  mapHeight?: string;
  /** Custom marker icon. Replaces the default blue dot. */
  markerIcon?: ReactNode;
  /** PMTiles file URL for offline map fallback (e.g. "/offline-map.pmtiles"). */
  fallbackTileUrl?: string;
}

// Default center: Seoul
const DEFAULT_LAT = 37.5665;
const DEFAULT_LNG = 126.978;

function isValidLatLng(lat: number, lng: number): boolean {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}

function safeCenter(lat: number, lng: number): { lat: number; lng: number } {
  if (lat === 0 && lng === 0) return { lat: DEFAULT_LAT, lng: DEFAULT_LNG };
  if (!isValidLatLng(lat, lng)) return { lat: DEFAULT_LAT, lng: DEFAULT_LNG };
  return { lat, lng };
}

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

/**
 * Map-based location picker field with dialog.
 * Shows coordinates inline with a button to open a map dialog.
 * Falls back to manual number inputs when offline.
 */
export function LocationPickerField({
  latitude,
  longitude,
  onLocationChange,
  zoom = 13,
  mapHeight = "400px",
  markerIcon,
  fallbackTileUrl,
  label,
  labelKey,
  error,
  description,
  required,
  disabled,
  className,
  ...variantProps
}: LocationPickerFieldProps) {
  const { Input } = useUIComponents();
  const { t } = useTranslation("simplix/ui");
  const [open, setOpen] = useState(false);
  const [online, setOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true,
  );
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const canUseMap = (online || !!fallbackTileUrl) && !mapError;
  const hasLocation = isValidLatLng(latitude, longitude) && !(latitude === 0 && longitude === 0);

  const formatCoord = (v: number) =>
    v === 0 ? "0" : v.toFixed(6);

  return (
    <FieldWrapper
      label={label}
      labelKey={labelKey}
      error={error}
      description={description}
      required={required}
      disabled={disabled}
      className={className}
      {...variantProps}
    >
      {canUseMap ? (
        <>
        {hasLocation ? (
          <div className="overflow-hidden rounded-md border">
            <span className="flex items-center justify-between border-b py-0.5 pl-3 pr-0.5">
              <span className="text-muted-foreground text-sm tabular-nums">
                {formatCoord(latitude)}, {formatCoord(longitude)}
              </span>
              <span className="flex items-center gap-0.5">
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => onLocationChange(0, 0)}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
                  aria-label="Clear location"
                >
                  <XIcon className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => setOpen(true)}
                  className="inline-flex h-7 items-center gap-1.5 rounded-md border border-input px-2 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
                  aria-label="Select location on map"
                >
                  <MapPinIcon className="h-3.5 w-3.5" />
                </button>
              </span>
            </span>

            <button
              type="button"
              disabled={disabled}
              onClick={() => setOpen(true)}
              className="block w-full transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-50"
            >
              <div className="pointer-events-none h-[150px] bg-neutral-100 dark:bg-neutral-900">
                <Map
                  center={[longitude, latitude]}
                  zoom={zoom}
                  interactive={false}
                  fallbackTileUrl={fallbackTileUrl}
                >
                  <MapMarker longitude={longitude} latitude={latitude}>{markerIcon}</MapMarker>
                </Map>
              </div>
            </button>
          </div>
        ) : (
          <button
            type="button"
            disabled={disabled}
            onClick={() => setOpen(true)}
            className="flex h-8 w-full items-center justify-between rounded-md border border-input bg-background px-3 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
          >
            <span>{t("field.selectLocationPrompt")}</span>
            <MapPinIcon className="h-4 w-4" />
          </button>
        )}

        <LocationPickerDialog
          open={open}
          onOpenChange={setOpen}
          latitude={latitude}
          longitude={longitude}
          zoom={zoom}
          mapHeight={mapHeight}
          onConfirm={(lat, lng) => {
            onLocationChange(lat, lng);
            setOpen(false);
          }}
          onMapError={() => setMapError(true)}
          markerIcon={markerIcon}
          fallbackTileUrl={fallbackTileUrl}
        />
        </>
      ) : (
        <span className="flex items-center gap-2">
          <Input
            type="number"
            value={latitude === 0 ? "" : String(latitude)}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const v = e.target.value === "" ? 0 : Number(e.target.value);
              if (!Number.isNaN(v)) onLocationChange(v, longitude);
            }}
            placeholder="Latitude"
            step="any"
            disabled={disabled}
            className="w-32"
          />
          <Input
            type="number"
            value={longitude === 0 ? "" : String(longitude)}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const v = e.target.value === "" ? 0 : Number(e.target.value);
              if (!Number.isNaN(v)) onLocationChange(latitude, v);
            }}
            placeholder="Longitude"
            step="any"
            disabled={disabled}
            className="w-32"
          />
          <button
            type="button"
            disabled
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-input bg-background text-muted-foreground opacity-50"
            title="Map unavailable offline"
            aria-label="Map unavailable"
          >
            <MapPinIcon className="h-4 w-4" />
          </button>
        </span>
      )}
    </FieldWrapper>
  );
}

// ── Dialog ──

interface LocationPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  latitude: number;
  longitude: number;
  zoom: number;
  mapHeight: string;
  onConfirm: (lat: number, lng: number) => void;
  onMapError: () => void;
  markerIcon?: ReactNode;
  fallbackTileUrl?: string;
}

function LocationPickerDialog({
  open,
  onOpenChange,
  latitude,
  longitude,
  zoom,
  mapHeight,
  onConfirm,
  onMapError,
  markerIcon,
  fallbackTileUrl,
}: LocationPickerDialogProps) {
  const { Button } = useUIComponents();
  const { t } = useTranslation("simplix/ui");
  const center = safeCenter(latitude, longitude);

  const [tempLat, setTempLat] = useState(center.lat);
  const [tempLng, setTempLng] = useState(center.lng);
  const [mapTheme, setMapTheme] = useState<"light" | "dark">(() =>
    typeof document !== "undefined" && document.documentElement.classList.contains("dark")
      ? "dark"
      : "light",
  );
  const mapRef = useRef<maplibregl.Map | null>(null);

  // Reset temp when dialog opens
  useEffect(() => {
    if (open) {
      const c = safeCenter(latitude, longitude);
      setTempLat(c.lat);
      setTempLng(c.lng);
      setMapTheme(
        document.documentElement.classList.contains("dark") ? "dark" : "light",
      );
    }
  }, [open, latitude, longitude]);

  const handleMapClick = useCallback((e: maplibregl.MapMouseEvent) => {
    setTempLat(e.lngLat.lat);
    setTempLng(e.lngLat.lng);
  }, []);

  // Attach click handler to map
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !open) return;

    map.on("click", handleMapClick);
    return () => { map.off("click", handleMapClick); };
  }, [open, handleMapClick]);

  const [locating, setLocating] = useState(false);

  const handleSearchSelect = useCallback(
    (lat: number, lng: number) => {
      setTempLat(lat);
      setTempLng(lng);
      mapRef.current?.flyTo({ center: [lng, lat], zoom: 15 });
    },
    [],
  );

  const handleLocate = useCallback(() => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setTempLat(lat);
        setTempLng(lng);
        mapRef.current?.flyTo({ center: [lng, lat], zoom: 15 });
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("field.selectLocation")}</DialogTitle>
          <DialogDescription className="sr-only">
            {t("field.clickOrDragToSelect")}
          </DialogDescription>
        </DialogHeader>

        <span className="flex items-center gap-2">
          <span className="flex-1">
            <GeoSearch onSelect={handleSearchSelect} />
          </span>
          <button
            type="button"
            disabled={locating}
            onClick={handleLocate}
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-input bg-background text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
            title={t("field.detectLocation")}
            aria-label={t("field.detectLocation")}
          >
            <LocateIcon className={cn("h-4 w-4", locating && "animate-pulse")} />
          </button>
        </span>

        <div className="relative overflow-hidden rounded-md border" style={{ height: mapHeight }}>
          <Map
            ref={(m) => {
              mapRef.current = m;
              if (m) m.on("click", handleMapClick);
            }}
            className={mapTheme === "dark" ? "bg-neutral-900" : "bg-neutral-100"}
            center={[center.lng, center.lat]}
            zoom={zoom}
            theme={mapTheme}
            projection={{ type: "globe" }}
            onError={onMapError}
            fallbackTileUrl={fallbackTileUrl}
          >
            <MapMarker
              longitude={tempLng}
              latitude={tempLat}
              draggable
              onDragEnd={({ lng, lat }) => {
                setTempLat(lat);
                setTempLng(lng);
              }}
            >
              {markerIcon}
            </MapMarker>
          </Map>

          {/* Theme toggle — bottom left */}
          <span className="absolute bottom-2 left-2 z-10 inline-flex overflow-hidden rounded-md border border-black/10 shadow-sm">
            <button
              type="button"
              onClick={() => setMapTheme("light")}
              className={cn(
                "inline-flex h-7 w-7 items-center justify-center transition-colors",
                mapTheme === "light"
                  ? "bg-white text-neutral-800"
                  : "bg-black/40 text-white/70 hover:text-white",
              )}
              aria-label="Light map"
            >
              <SunIcon className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setMapTheme("dark")}
              className={cn(
                "inline-flex h-7 w-7 items-center justify-center transition-colors",
                mapTheme === "dark"
                  ? "bg-neutral-800 text-white"
                  : "bg-white/80 text-neutral-400 hover:text-neutral-600",
              )}
              aria-label="Dark map"
            >
              <MoonIcon className="h-3.5 w-3.5" />
            </button>
          </span>

          {/* Coordinates — bottom right */}
          <span className="absolute bottom-2 right-2 z-10 rounded-md bg-black/60 px-2.5 py-1.5 text-sm tabular-nums text-white shadow-sm">
            {tempLat.toFixed(6)}, {tempLng.toFixed(6)}
          </span>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            {t("field.cancelLocation")}
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => onConfirm(tempLat, tempLng)}
          >
            {t("field.confirmLocation")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Geocoding search ──

function GeoSearch({ onSelect }: { onSelect: (lat: number, lng: number) => void }) {
  const { Input } = useUIComponents();
  const { t } = useTranslation("simplix/ui");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`,
        );
        if (res.ok) {
          const data = (await res.json()) as NominatimResult[];
          setResults(data);
          setShowResults(true);
        }
      } catch {
        // Silently fail on network error
      }
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [query]);

  return (
    <div className="relative">
      <span className="relative flex items-center">
        <MagnifyingGlassIcon className="pointer-events-none absolute left-2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          value={query}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
          placeholder={t("field.searchLocation")}
          className="pl-8"
          onFocus={() => results.length > 0 && setShowResults(true)}
          onBlur={() => setTimeout(() => setShowResults(false), 200)}
        />
      </span>

      {showResults && results.length > 0 && (
        <ul className="absolute z-50 mt-1 max-h-48 w-full overflow-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md">
          {results.map((r) => (
            <li key={r.place_id}>
              <button
                type="button"
                className={cn(
                  "w-full rounded-sm px-2 py-1.5 text-left text-sm",
                  "hover:bg-accent hover:text-accent-foreground",
                  "focus:bg-accent focus:text-accent-foreground focus:outline-none",
                )}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onSelect(Number(r.lat), Number(r.lon));
                  setQuery(r.display_name.split(",").slice(0, 2).join(","));
                  setShowResults(false);
                }}
              >
                <span className="line-clamp-2 text-xs">{r.display_name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
