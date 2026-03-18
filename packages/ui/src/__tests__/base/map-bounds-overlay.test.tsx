// @vitest-environment jsdom
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, it, expect, vi, beforeEach } from "vitest";

afterEach(cleanup);

// Mock useMap hook
const mockAddSource = vi.fn();
const mockAddLayer = vi.fn();
const mockRemoveSource = vi.fn();
const mockRemoveLayer = vi.fn();
const mockGetSource = vi.fn().mockReturnValue(true);
const mockGetLayer = vi.fn().mockReturnValue(true);
const mockSetPaintProperty = vi.fn();

const mockMap = {
  addSource: mockAddSource,
  addLayer: mockAddLayer,
  removeSource: mockRemoveSource,
  removeLayer: mockRemoveLayer,
  getSource: mockGetSource,
  getLayer: mockGetLayer,
  setPaintProperty: mockSetPaintProperty,
};

vi.mock("../../base/map/map", () => ({
  useMap: () => ({
    map: mockMap,
    isLoaded: true,
  }),
}));

// Mock geo utility
vi.mock("../../utils/geo", () => ({
  computeBoundingCircle: vi.fn().mockReturnValue({
    centerLat: 37.5,
    centerLng: 127.0,
    radiusM: 150,
  }),
  geoCircle: vi.fn().mockReturnValue([[127.0, 37.5], [127.001, 37.501], [127.0, 37.5]]),
}));

// Mock requestAnimationFrame
vi.spyOn(globalThis, "requestAnimationFrame").mockImplementation(() => {
  return 1;
});
vi.spyOn(globalThis, "cancelAnimationFrame").mockImplementation(() => {});

import React from "react";
import { MapBoundsOverlay } from "../../base/map/map-bounds-overlay";
import { computeBoundingCircle } from "../../utils/geo";

describe("MapBoundsOverlay", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders nothing (returns null)", () => {
    const { container } = render(
      <MapBoundsOverlay
        points={[{ longitude: 127.0, latitude: 37.5 }]}
      />,
    );
    expect(container.innerHTML).toBe("");
  });

  it("adds mask source and layer when loaded with points", () => {
    render(
      <MapBoundsOverlay
        points={[
          { longitude: 127.0, latitude: 37.5 },
          { longitude: 128.0, latitude: 38.0 },
        ]}
      />,
    );
    expect(computeBoundingCircle).toHaveBeenCalledWith(
      [{ longitude: 127.0, latitude: 37.5 }, { longitude: 128.0, latitude: 38.0 }],
      50,
    );
    expect(mockAddSource).toHaveBeenCalledWith("bounds-mask", expect.any(Object));
    expect(mockAddLayer).toHaveBeenCalledWith(
      expect.objectContaining({ id: "bounds-mask-fill", type: "fill" }),
    );
  });

  it("adds boundary line source and layer", () => {
    render(
      <MapBoundsOverlay
        points={[{ longitude: 127.0, latitude: 37.5 }]}
      />,
    );
    expect(mockAddSource).toHaveBeenCalledWith("bounds-line", expect.any(Object));
    expect(mockAddLayer).toHaveBeenCalledWith(
      expect.objectContaining({ id: "bounds-line-stroke", type: "line" }),
    );
  });

  it("adds ripple sources and layers", () => {
    render(
      <MapBoundsOverlay
        points={[{ longitude: 127.0, latitude: 37.5 }]}
        ripple={{ count: 3, spacingM: 10, cycleMs: 2000 }}
      />,
    );
    // Should create 3 ripple sources/layers
    for (let i = 0; i < 3; i++) {
      expect(mockAddSource).toHaveBeenCalledWith(`ripple-${i}`, expect.any(Object));
      expect(mockAddLayer).toHaveBeenCalledWith(
        expect.objectContaining({ id: `ripple-${i}`, type: "line" }),
      );
    }
  });

  it("uses default ripple config when not provided", () => {
    render(
      <MapBoundsOverlay
        points={[{ longitude: 127.0, latitude: 37.5 }]}
      />,
    );
    // Default ripple count is 5
    for (let i = 0; i < 5; i++) {
      expect(mockAddSource).toHaveBeenCalledWith(`ripple-${i}`, expect.any(Object));
    }
  });

  it("does not add sources when points is empty", () => {
    render(<MapBoundsOverlay points={[]} />);
    expect(mockAddSource).not.toHaveBeenCalled();
    expect(mockAddLayer).not.toHaveBeenCalled();
  });

  it("uses custom paddingM", () => {
    render(
      <MapBoundsOverlay
        points={[{ longitude: 127.0, latitude: 37.5 }]}
        paddingM={100}
      />,
    );
    expect(computeBoundingCircle).toHaveBeenCalledWith(
      [{ longitude: 127.0, latitude: 37.5 }],
      100,
    );
  });

  it("cleans up sources and layers on unmount", () => {
    const { unmount } = render(
      <MapBoundsOverlay
        points={[{ longitude: 127.0, latitude: 37.5 }]}
        ripple={{ count: 2, spacingM: 10, cycleMs: 2000 }}
      />,
    );
    unmount();
    expect(mockRemoveLayer).toHaveBeenCalledWith("bounds-mask-fill");
    expect(mockRemoveSource).toHaveBeenCalledWith("bounds-mask");
    expect(mockRemoveLayer).toHaveBeenCalledWith("bounds-line-stroke");
    expect(mockRemoveSource).toHaveBeenCalledWith("bounds-line");
    for (let i = 0; i < 2; i++) {
      expect(mockRemoveLayer).toHaveBeenCalledWith(`ripple-${i}`);
      expect(mockRemoveSource).toHaveBeenCalledWith(`ripple-${i}`);
    }
  });

  it("cancels animation frame on unmount", () => {
    const { unmount } = render(
      <MapBoundsOverlay
        points={[{ longitude: 127.0, latitude: 37.5 }]}
      />,
    );
    unmount();
    expect(cancelAnimationFrame).toHaveBeenCalled();
  });

  it("starts animation after adding sources", () => {
    render(
      <MapBoundsOverlay
        points={[{ longitude: 127.0, latitude: 37.5 }]}
      />,
    );
    expect(requestAnimationFrame).toHaveBeenCalled();
  });
});

describe("MapBoundsOverlay with empty points", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not add sources when points array is empty", () => {
    render(<MapBoundsOverlay points={[]} />);
    expect(mockAddSource).not.toHaveBeenCalled();
  });
});
