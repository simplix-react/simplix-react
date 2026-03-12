import { useCallback, useRef, useState, type ReactNode } from "react";
import { useTranslation } from "@simplix-react/i18n/react";

import type { CommonDetailFieldProps } from "../../crud/shared/types";
import { MapPinIcon, LocateIcon, SunIcon, MoonIcon } from "../../crud/shared/icons";
import { cn } from "../../utils/cn";
import { DetailFieldWrapper } from "../shared/detail-field-wrapper";
import { Map, MapMarker } from "../../base/map/map";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../base/overlay/dialog";

/** Props for the {@link DetailLocationField} component. */
export interface DetailLocationFieldProps extends CommonDetailFieldProps {
  latitude: number;
  longitude: number;
  zoom?: number;
  /** Fallback text when coordinates are empty (0,0). Defaults to em-dash. */
  fallback?: string;
  /** When true, renders nothing if coordinates are empty. Defaults to false. */
  hideWhenEmpty?: boolean;
  /** Custom marker icon. Replaces the default blue dot. */
  markerIcon?: ReactNode;
  /** PMTiles file URL for offline map fallback (e.g. "/offline-map.pmtiles"). */
  fallbackTileUrl?: string;
}

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

/**
 * Read-only location display with map preview.
 * Shows coordinates and a small interactive map.
 * Click the map to open a full-size dialog view.
 */
export function DetailLocationField({
  latitude,
  longitude,
  zoom = 13,
  fallback = "\u2014",
  hideWhenEmpty = false,
  markerIcon,
  fallbackTileUrl,
  label,
  labelKey,
  layout,
  size,
  className,
}: DetailLocationFieldProps) {
  const { t } = useTranslation("simplix/ui");
  const [open, setOpen] = useState(false);
  const hasLocation =
    isValidLatLng(latitude, longitude) && !(latitude === 0 && longitude === 0);

  if (!hasLocation && hideWhenEmpty) return null;

  const dialogMapRef = useRef<maplibregl.Map | null>(null);

  const [mapTheme, setMapTheme] = useState<"light" | "dark">(() =>
    typeof document !== "undefined" && document.documentElement.classList.contains("dark")
      ? "dark"
      : "light",
  );

  const handleFlyBack = useCallback(() => {
    dialogMapRef.current?.flyTo({ center: [longitude, latitude], zoom });
  }, [longitude, latitude, zoom]);

  // Reset theme when dialog opens
  const handleOpenChange = useCallback((v: boolean) => {
    if (v) {
      setMapTheme(
        document.documentElement.classList.contains("dark") ? "dark" : "light",
      );
    }
    setOpen(v);
  }, []);

  return (
    <DetailFieldWrapper
      label={label}
      labelKey={labelKey}
      layout={layout}
      size={size}
      className={className}
    >
      {hasLocation ? (
        <>
          <div className="overflow-hidden rounded-md border">
            <span className="flex items-center justify-between border-b py-0.5 pl-3 pr-0.5">
              <span className="text-muted-foreground text-sm tabular-nums">
                {latitude.toFixed(6)}, {longitude.toFixed(6)}
              </span>
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="inline-flex h-7 items-center gap-1.5 rounded-md border border-input px-2 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                aria-label={t("field.locationTitle")}
              >
                <MapPinIcon className="h-3.5 w-3.5" />
              </button>
            </span>

            <button
              type="button"
              onClick={() => setOpen(true)}
              className="block w-full transition-opacity hover:opacity-90"
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

          <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>{t("field.locationTitle")}</DialogTitle>
                <DialogDescription className="sr-only">
                  {latitude.toFixed(6)}, {longitude.toFixed(6)}
                </DialogDescription>
              </DialogHeader>

              <div className="relative overflow-hidden rounded-md border" style={{ height: "450px" }}>
                <Map
                  ref={(m) => { dialogMapRef.current = m; }}
                  className={mapTheme === "dark" ? "bg-neutral-900" : "bg-neutral-100"}
                  center={[longitude, latitude]}
                  zoom={zoom}
                  theme={mapTheme}
                  projection={{ type: "globe" }}
                  fallbackTileUrl={fallbackTileUrl}
                >
                  <MapMarker longitude={longitude} latitude={latitude}>{markerIcon}</MapMarker>
                </Map>

                {/* Fly back + theme toggle — bottom left */}
                <span className="absolute bottom-2 left-2 z-10 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handleFlyBack}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-black/10 bg-white text-neutral-700 shadow-sm transition-colors hover:bg-neutral-100 dark:bg-neutral-800 dark:text-white dark:hover:bg-neutral-700"
                    aria-label={t("field.detectLocation")}
                  >
                    <LocateIcon className="h-3.5 w-3.5" />
                  </button>

                  <span className="inline-flex overflow-hidden rounded-md border border-black/10 shadow-sm">
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
                </span>

                {/* Coordinates — bottom right */}
                <span className="absolute bottom-2 right-2 z-10 rounded-md bg-black/60 px-2.5 py-1.5 text-sm tabular-nums text-white shadow-sm">
                  {latitude.toFixed(6)}, {longitude.toFixed(6)}
                </span>
              </div>
            </DialogContent>
          </Dialog>
        </>
      ) : (
        <span>{fallback}</span>
      )}
    </DetailFieldWrapper>
  );
}
