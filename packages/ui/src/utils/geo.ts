// ── Coordinate validation ──

interface HasCoords {
  latitude?: number | null;
  longitude?: number | null;
}

type WithValidCoords<T> = T & { latitude: number; longitude: number };

/**
 * Type guard that narrows items to those with valid latitude/longitude.
 * Rejects null/undefined, (0,0), and out-of-range values.
 */
function isValidCoord<T extends HasCoords>(item: T): item is WithValidCoords<T> {
  const { latitude: lat, longitude: lng } = item;
  return lat != null && lng != null && !(lat === 0 && lng === 0) &&
    lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

// ── Bounds ──

interface Bounds {
  west: number;
  south: number;
  east: number;
  north: number;
}

type GeoPoint = { latitude: number; longitude: number };

function computeBounds(points: GeoPoint[]): Bounds | null {
  if (points.length === 0) return null;

  let west = Infinity, south = Infinity, east = -Infinity, north = -Infinity;
  for (const p of points) {
    if (p.longitude < west) west = p.longitude;
    if (p.latitude < south) south = p.latitude;
    if (p.longitude > east) east = p.longitude;
    if (p.latitude > north) north = p.latitude;
  }
  return { west, south, east, north };
}

interface MapFitOptions {
  padding?: number;
  maxZoom?: number;
  zoom?: number;
}

const DEFAULT_MAP_FIT_OPTIONS: Required<MapFitOptions> = { padding: 50, maxZoom: 15, zoom: 15 };

/**
 * Fit a MapLibre map instance to the given points.
 * Single-point case uses flyTo; multi-point uses fitBounds.
 */
function fitMapToBounds(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- MapLibre map duck-type with library-specific signatures
  map: { flyTo: (...args: any[]) => any; fitBounds: (...args: any[]) => any },
  points: GeoPoint[],
  options?: MapFitOptions,
): void {
  if (points.length === 0) return;

  const { padding, maxZoom, zoom } = { ...DEFAULT_MAP_FIT_OPTIONS, ...options };

  if (points.length === 1) {
    map.flyTo({ center: [points[0].longitude, points[0].latitude], zoom });
    return;
  }

  const bounds = computeBounds(points);
  if (!bounds) return;
  map.fitBounds([[bounds.west, bounds.south], [bounds.east, bounds.north]], { padding, maxZoom });
}

// ── Geographic calculations ──

const EARTH_RADIUS_M = 6371000;

function toRad(deg: number): number {
  return deg * Math.PI / 180;
}

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return EARTH_RADIUS_M * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function destinationPoint(lat: number, lon: number, distM: number, bearingRad: number): [number, number] {
  const d = distM / EARTH_RADIUS_M;
  const p1 = toRad(lat);
  const l1 = toRad(lon);
  const p2 = Math.asin(Math.sin(p1) * Math.cos(d) + Math.cos(p1) * Math.sin(d) * Math.cos(bearingRad));
  const l2 = l1 + Math.atan2(Math.sin(bearingRad) * Math.sin(d) * Math.cos(p1), Math.cos(d) - Math.sin(p1) * Math.sin(p2));
  return [l2 * 180 / Math.PI, p2 * 180 / Math.PI];
}

function geoCircle(lat: number, lng: number, radiusM: number, steps = 64): Array<[number, number]> {
  const coords: Array<[number, number]> = [];
  for (let i = 0; i <= steps; i++) {
    coords.push(destinationPoint(lat, lng, radiusM, (2 * Math.PI * i) / steps));
  }
  return coords;
}

function computeBoundingCircle(points: GeoPoint[], paddingM = 50) {
  const n = points.length;
  const cLat = points.reduce((s, p) => s + p.latitude, 0) / n;
  const cLng = points.reduce((s, p) => s + p.longitude, 0) / n;
  let maxD = 0;
  for (const p of points) {
    const d = haversineDistance(cLat, cLng, p.latitude, p.longitude);
    if (d > maxD) maxD = d;
  }
  return { centerLat: cLat, centerLng: cLng, radiusM: maxD + paddingM };
}

export {
  isValidCoord,
  computeBounds,
  fitMapToBounds,
  DEFAULT_MAP_FIT_OPTIONS,
  toRad,
  haversineDistance,
  destinationPoint,
  geoCircle,
  computeBoundingCircle,
};
export type { Bounds, GeoPoint, HasCoords, MapFitOptions, WithValidCoords };
