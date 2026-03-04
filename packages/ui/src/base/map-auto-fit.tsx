import { useEffect } from "react";

import type { GeoPoint, MapFitOptions } from "../utils/geo";
import { fitMapToBounds } from "../utils/geo";
import { useMap } from "./map";

interface MapAutoFitProps {
  points: GeoPoint[];
  fitOptions?: MapFitOptions;
}

/**
 * Automatically fits the map viewport to the given points.
 * Must be rendered as a child of {@link Map}.
 */
function MapAutoFit({ points, fitOptions }: MapAutoFitProps) {
  const { map, isLoaded } = useMap();

  useEffect(() => {
    if (!isLoaded || !map || points.length === 0) return;
    fitMapToBounds(map, points, fitOptions);
  }, [isLoaded, map, points, fitOptions]);

  return null;
}

export { MapAutoFit };
export type { MapAutoFitProps };
