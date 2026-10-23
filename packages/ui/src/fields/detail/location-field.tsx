import { useCallback, useRef, useState, type ReactNode } from "react";
import { useTranslation } from "@simplix-react/i18n/react";

import type { CommonDetailFieldProps } from "../../crud/shared/types";
import { MapPinIcon, LocateIcon, SunIcon, MoonIcon } from "../../crud/shared/icons";
import { slotAttributes } from "../../design/slot-style";
import { detailFallback } from "../shared/detail-fallback";
import { DetailFieldWrapper } from "../shared/detail-field-wrapper";
import {
  detailLocationFieldControlsStyle,
  detailLocationFieldCoordinatesBadgeStyle,
  detailLocationFieldCoordinatesStyle,
  detailLocationFieldFlyBackStyle,
  detailLocationFieldFrameStyle,
  detailLocationFieldHeaderStyle,
  detailLocationFieldOpenStyle,
  detailLocationFieldPreviewButtonStyle,
  detailLocationFieldPreviewStyle,
  detailLocationFieldThemeButtonStyle,
  detailLocationFieldThemeGroupStyle,
  detailLocationMapBackground,
} from "./location-field.style";
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
  /** Fallback text when coordinates are empty (0,0). Defaults to the shared no-value badge. */
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
  fallback,
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

  if (!hasLocation && hideWhenEmpty) return null;

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
          <div className="overflow-hidden" {...slotAttributes(detailLocationFieldFrameStyle, {})}>
            <span className="flex items-center justify-between" {...slotAttributes(detailLocationFieldHeaderStyle, {})}>
              <span {...slotAttributes(detailLocationFieldCoordinatesStyle, {})}>
                {latitude.toFixed(6)}, {longitude.toFixed(6)}
              </span>
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="inline-flex h-7 items-center"
                aria-label={t("field.locationTitle")}
                {...slotAttributes(detailLocationFieldOpenStyle, {})}
              >
                <MapPinIcon className="h-3.5 w-3.5" />
              </button>
            </span>

            <button
              type="button"
              onClick={() => setOpen(true)}
              className="block w-full"
              aria-label={t("field.openMap")}
              {...slotAttributes(detailLocationFieldPreviewButtonStyle, {})}
            >
              <div className="pointer-events-none h-[150px]" {...slotAttributes(detailLocationFieldPreviewStyle, {})}>
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

              <div className="relative overflow-hidden" style={{ height: "450px" }} {...slotAttributes(detailLocationFieldFrameStyle, {})}>
                <Map
                  ref={(m) => { dialogMapRef.current = m; }}
                  className={detailLocationMapBackground[mapTheme]}
                  center={[longitude, latitude]}
                  zoom={zoom}
                  theme={mapTheme}
                  projection={{ type: "globe" }}
                  fallbackTileUrl={fallbackTileUrl}
                >
                  <MapMarker longitude={longitude} latitude={latitude}>{markerIcon}</MapMarker>
                </Map>

                {/* Fly back + theme toggle - bottom left */}
                <span className="absolute bottom-2 left-2 z-10 flex items-center" {...slotAttributes(detailLocationFieldControlsStyle, {})}>
                  <button
                    type="button"
                    onClick={handleFlyBack}
                    className="inline-flex h-7 w-7 items-center justify-center"
                    aria-label={t("field.detectLocation")}
                    {...slotAttributes(detailLocationFieldFlyBackStyle, {})}
                  >
                    <LocateIcon className="h-3.5 w-3.5" />
                  </button>

                  <span className="inline-flex overflow-hidden" {...slotAttributes(detailLocationFieldThemeGroupStyle, {})}>
                    <button
                      type="button"
                      onClick={() => setMapTheme("light")}
                      className="inline-flex h-7 w-7 items-center justify-center"
                      aria-label={t("field.mapLight")}
                      {...slotAttributes(detailLocationFieldThemeButtonStyle, {
                        state: mapTheme === "light" ? "light-on" : "light-off",
                      })}
                    >
                      <SunIcon className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setMapTheme("dark")}
                      className="inline-flex h-7 w-7 items-center justify-center"
                      aria-label={t("field.mapDark")}
                      {...slotAttributes(detailLocationFieldThemeButtonStyle, {
                        state: mapTheme === "dark" ? "dark-on" : "dark-off",
                      })}
                    >
                      <MoonIcon className="h-3.5 w-3.5" />
                    </button>
                  </span>
                </span>

                {/* Coordinates - bottom right */}
                <span className="absolute bottom-2 right-2 z-10" {...slotAttributes(detailLocationFieldCoordinatesBadgeStyle, {})}>
                  {latitude.toFixed(6)}, {longitude.toFixed(6)}
                </span>
              </div>
            </DialogContent>
          </Dialog>
        </>
      ) : (
        detailFallback(fallback)
      )}
    </DetailFieldWrapper>
  );
}
