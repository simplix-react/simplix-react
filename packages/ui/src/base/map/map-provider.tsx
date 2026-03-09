import { createContext, useContext, type ReactNode } from "react";

export interface MapProviderProps {
  /** Default PMTiles file URL for offline fallback, used by Map when its own fallbackTileUrl is not set. */
  defaultFallbackTileUrl?: string;
  /** Default marker icon ReactNode, used by MapMarker when no children are provided. */
  defaultMarkerIcon?: ReactNode;
  children: ReactNode;
}

export interface MapProviderContextValue {
  defaultFallbackTileUrl?: string;
  defaultMarkerIcon?: ReactNode;
}

const MapProviderContext = createContext<MapProviderContextValue>({});

export function MapProvider({ defaultFallbackTileUrl, defaultMarkerIcon, children }: MapProviderProps) {
  return (
    <MapProviderContext.Provider value={{ defaultFallbackTileUrl, defaultMarkerIcon }}>
      {children}
    </MapProviderContext.Provider>
  );
}

export function useMapDefaults(): MapProviderContextValue {
  return useContext(MapProviderContext);
}
