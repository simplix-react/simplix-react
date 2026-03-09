import { describe, expect, it, vi } from "vitest";

import {
  isValidCoord,
  computeBounds,
  fitMapToBounds,
  toRad,
  haversineDistance,
  destinationPoint,
  geoCircle,
  computeBoundingCircle,
} from "../../utils/geo";

describe("isValidCoord", () => {
  it("returns true for valid coordinates", () => {
    expect(isValidCoord({ latitude: 37.5665, longitude: 126.978 })).toBe(true);
  });

  it("rejects null latitude", () => {
    expect(isValidCoord({ latitude: null, longitude: 126.978 })).toBe(false);
  });

  it("rejects undefined longitude", () => {
    expect(isValidCoord({ latitude: 37.5665, longitude: undefined })).toBe(false);
  });

  it("rejects (0, 0) coordinates", () => {
    expect(isValidCoord({ latitude: 0, longitude: 0 })).toBe(false);
  });

  it("rejects out-of-range latitude", () => {
    expect(isValidCoord({ latitude: 91, longitude: 0 })).toBe(false);
    expect(isValidCoord({ latitude: -91, longitude: 0 })).toBe(false);
  });

  it("rejects out-of-range longitude", () => {
    expect(isValidCoord({ latitude: 0, longitude: 181 })).toBe(false);
    expect(isValidCoord({ latitude: 0, longitude: -181 })).toBe(false);
  });

  it("accepts boundary values", () => {
    expect(isValidCoord({ latitude: 90, longitude: 180 })).toBe(true);
    expect(isValidCoord({ latitude: -90, longitude: -180 })).toBe(true);
  });
});

describe("computeBounds", () => {
  it("returns null for empty array", () => {
    expect(computeBounds([])).toBeNull();
  });

  it("computes bounds for a single point", () => {
    const bounds = computeBounds([{ latitude: 37.5, longitude: 127.0 }]);
    expect(bounds).toEqual({ west: 127.0, south: 37.5, east: 127.0, north: 37.5 });
  });

  it("computes bounds for multiple points", () => {
    const bounds = computeBounds([
      { latitude: 37.5, longitude: 126.9 },
      { latitude: 35.1, longitude: 129.0 },
      { latitude: 33.5, longitude: 126.5 },
    ]);
    expect(bounds).toEqual({
      west: 126.5,
      south: 33.5,
      east: 129.0,
      north: 37.5,
    });
  });
});

describe("fitMapToBounds", () => {
  it("does nothing for empty points", () => {
    const map = { flyTo: vi.fn(), fitBounds: vi.fn() };
    fitMapToBounds(map, []);
    expect(map.flyTo).not.toHaveBeenCalled();
    expect(map.fitBounds).not.toHaveBeenCalled();
  });

  it("uses flyTo for a single point", () => {
    const map = { flyTo: vi.fn(), fitBounds: vi.fn() };
    fitMapToBounds(map, [{ latitude: 37.5, longitude: 127.0 }]);
    expect(map.flyTo).toHaveBeenCalledWith({
      center: [127.0, 37.5],
      zoom: 15,
    });
    expect(map.fitBounds).not.toHaveBeenCalled();
  });

  it("uses fitBounds for multiple points", () => {
    const map = { flyTo: vi.fn(), fitBounds: vi.fn() };
    fitMapToBounds(map, [
      { latitude: 37.5, longitude: 126.9 },
      { latitude: 35.1, longitude: 129.0 },
    ]);
    expect(map.fitBounds).toHaveBeenCalledWith(
      [[126.9, 35.1], [129.0, 37.5]],
      { padding: 50, maxZoom: 15 },
    );
    expect(map.flyTo).not.toHaveBeenCalled();
  });

  it("applies custom options", () => {
    const map = { flyTo: vi.fn(), fitBounds: vi.fn() };
    fitMapToBounds(
      map,
      [{ latitude: 37.5, longitude: 127.0 }],
      { zoom: 10 },
    );
    expect(map.flyTo).toHaveBeenCalledWith({
      center: [127.0, 37.5],
      zoom: 10,
    });
  });
});

describe("toRad", () => {
  it("converts degrees to radians", () => {
    expect(toRad(180)).toBeCloseTo(Math.PI);
    expect(toRad(90)).toBeCloseTo(Math.PI / 2);
    expect(toRad(0)).toBe(0);
  });
});

describe("haversineDistance", () => {
  it("returns 0 for same point", () => {
    expect(haversineDistance(37.5, 127.0, 37.5, 127.0)).toBe(0);
  });

  it("calculates approximate distance between Seoul and Busan", () => {
    // Seoul (37.5665, 126.978) to Busan (35.1796, 129.0756) ~ 325 km
    const distance = haversineDistance(37.5665, 126.978, 35.1796, 129.0756);
    expect(distance).toBeGreaterThan(300_000);
    expect(distance).toBeLessThan(350_000);
  });
});

describe("destinationPoint", () => {
  it("returns a longitude/latitude pair", () => {
    const [lng, lat] = destinationPoint(37.5, 127.0, 1000, 0);
    expect(typeof lng).toBe("number");
    expect(typeof lat).toBe("number");
    // Moving north should increase latitude
    expect(lat).toBeGreaterThan(37.5);
  });
});

describe("geoCircle", () => {
  it("returns steps + 1 coordinates (closed ring)", () => {
    const coords = geoCircle(37.5, 127.0, 1000, 16);
    expect(coords).toHaveLength(17);
  });

  it("defaults to 64 steps", () => {
    const coords = geoCircle(37.5, 127.0, 1000);
    expect(coords).toHaveLength(65);
  });

  it("returns [lng, lat] tuples", () => {
    const coords = geoCircle(37.5, 127.0, 500, 4);
    for (const [lng, lat] of coords) {
      expect(typeof lng).toBe("number");
      expect(typeof lat).toBe("number");
    }
  });
});

describe("computeBoundingCircle", () => {
  it("computes center as average of points", () => {
    const result = computeBoundingCircle([
      { latitude: 37.0, longitude: 127.0 },
      { latitude: 38.0, longitude: 128.0 },
    ]);
    expect(result.centerLat).toBeCloseTo(37.5);
    expect(result.centerLng).toBeCloseTo(127.5);
  });

  it("radius includes padding", () => {
    const result = computeBoundingCircle(
      [{ latitude: 37.5, longitude: 127.0 }],
      100,
    );
    // Single point: max distance is 0, so radius = 0 + padding
    expect(result.radiusM).toBe(100);
  });

  it("defaults to 50m padding", () => {
    const result = computeBoundingCircle([
      { latitude: 37.5, longitude: 127.0 },
    ]);
    expect(result.radiusM).toBe(50);
  });
});
