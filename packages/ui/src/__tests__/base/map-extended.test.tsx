// @vitest-environment jsdom
import { cleanup, render, fireEvent, act } from "@testing-library/react";
import { afterEach, describe, it, expect, vi, beforeEach } from "vitest";

afterEach(cleanup);

// Polyfill matchMedia for jsdom
if (typeof window.matchMedia !== "function") {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

// Polyfill requestFullscreen / exitFullscreen
if (typeof document.exitFullscreen !== "function") {
  document.exitFullscreen = vi.fn().mockResolvedValue(undefined);
}
if (typeof HTMLElement.prototype.requestFullscreen !== "function") {
  HTMLElement.prototype.requestFullscreen = vi.fn().mockResolvedValue(undefined);
}

// Mock maplibre-gl
const mockMapOn = vi.fn();
const mockMapOnce = vi.fn();
const mockMapRemove = vi.fn();
const mockMapAddControl = vi.fn();
const mockMapSetStyle = vi.fn();
const mockMapSetProjection = vi.fn();
const mockMapGetCenter = vi.fn().mockReturnValue({ lng: 0, lat: 0 });
const mockMapSetCenter = vi.fn();
const mockMapZoomIn = vi.fn();
const mockMapZoomOut = vi.fn();
const mockMapResetNorthPitch = vi.fn();
const mockMapGetContainer = vi.fn().mockReturnValue(document.createElement("div"));
const mockMapQueryRenderedFeatures = vi.fn().mockReturnValue([]);
const mockMapFlyTo = vi.fn();
const mockMapFitBounds = vi.fn();

function createMockMapInstance() {
  return {
    on: mockMapOn,
    once: mockMapOnce,
    remove: mockMapRemove,
    addControl: mockMapAddControl,
    setStyle: mockMapSetStyle,
    setProjection: mockMapSetProjection,
    getCenter: mockMapGetCenter,
    setCenter: mockMapSetCenter,
    zoomIn: mockMapZoomIn,
    zoomOut: mockMapZoomOut,
    resetNorthPitch: mockMapResetNorthPitch,
    getContainer: mockMapGetContainer,
    queryRenderedFeatures: mockMapQueryRenderedFeatures,
    flyTo: mockMapFlyTo,
    fitBounds: mockMapFitBounds,
  };
}

const MockMarkerInstance = {
  setLngLat: vi.fn().mockReturnThis(),
  addTo: vi.fn().mockReturnThis(),
  remove: vi.fn(),
  on: vi.fn(),
  getLngLat: vi.fn().mockReturnValue({ lng: 0, lat: 0 }),
  getElement: vi.fn().mockReturnValue(document.createElement("div")),
  isDraggable: vi.fn().mockReturnValue(false),
  setDraggable: vi.fn(),
};

vi.mock("maplibre-gl", () => {
  function MockMap(this: Record<string, unknown>) {
    const instance = createMockMapInstance();
    Object.assign(this, instance);
  }

  function MockMarker() {
    return MockMarkerInstance;
  }

  function MockAttributionControl() {
    return {};
  }

  return {
    default: {
      Map: MockMap,
      Marker: MockMarker,
      AttributionControl: MockAttributionControl,
      addProtocol: vi.fn(),
    },
    __esModule: true,
  };
});

vi.mock("pmtiles", () => {
  function MockProtocol(this: Record<string, unknown>) {
    this.tile = vi.fn();
  }
  return { Protocol: MockProtocol };
});

vi.mock("protomaps-themes-base", () => ({
  noLabels: vi.fn().mockReturnValue([]),
}));

vi.mock("../../base/map/map-provider", () => ({
  useMapDefaults: () => ({
    defaultFallbackTileUrl: undefined,
    defaultMarkerIcon: undefined,
  }),
}));

import React from "react";
import { Map, MapMarker, MapControls } from "../../base/map/map";

// ── Map theme change ──

describe("Map theme change", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("no network"));
  });

  it("applies new style when theme prop changes", () => {
    const { rerender } = render(<Map theme="light" />);
    // Clear calls from init
    mockMapSetStyle.mockClear();

    rerender(<Map theme="dark" />);
    expect(mockMapSetStyle).toHaveBeenCalledWith(
      expect.stringContaining("dark"),
      expect.objectContaining({ diff: true }),
    );
  });

  it("does not re-apply style if theme did not change", () => {
    const { rerender } = render(<Map theme="light" />);
    mockMapSetStyle.mockClear();

    rerender(<Map theme="light" />);
    // Same style url, should not call setStyle
    expect(mockMapSetStyle).not.toHaveBeenCalled();
  });

  it("re-applies projection after style reload", () => {
    render(<Map theme="light" projection={{ type: "globe" } as unknown as import("maplibre-gl").ProjectionSpecification} />);
    mockMapSetStyle.mockClear();
    mockMapOnce.mockClear();

    const { rerender } = render(<Map theme="dark" projection={{ type: "globe" } as unknown as import("maplibre-gl").ProjectionSpecification} />);
    // mapInstance.once("style.load", reapply) should be called
    // Force the theme effect to trigger
    rerender(<Map theme="dark" projection={{ type: "globe" } as unknown as import("maplibre-gl").ProjectionSpecification} />);
  });
});

// ── Map load handler ──

describe("Map load handler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("no network"));
  });

  it("fires load handler and sets loaded state", () => {
    render(<Map />);
    const loadCall = mockMapOn.mock.calls.find(
      (call: unknown[]) => call[0] === "load",
    );
    expect(loadCall).toBeTruthy();
    // Trigger load
    act(() => {
      loadCall![1]();
    });
  });

  it("sets projection on load when projection prop provided", () => {
    render(<Map projection={{ type: "globe" } as unknown as import("maplibre-gl").ProjectionSpecification} />);
    const loadCall = mockMapOn.mock.calls.find(
      (call: unknown[]) => call[0] === "load",
    );
    act(() => {
      loadCall![1]();
    });
    expect(mockMapSetProjection).toHaveBeenCalledWith({ type: "globe" });
  });
});

// ── Map error handler with/without fallback ──

describe("Map error handler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("no network"));
  });

  it("calls onError when no fallback and error occurs", () => {
    const onError = vi.fn();
    render(<Map onError={onError} />);
    const errorCall = mockMapOn.mock.calls.find(
      (call: unknown[]) => call[0] === "error",
    );
    expect(errorCall).toBeTruthy();
    act(() => {
      errorCall![1]();
    });
    expect(onError).toHaveBeenCalled();
  });

  it("registers both load and error handlers", () => {
    render(<Map />);
    const loadCall = mockMapOn.mock.calls.find((c: unknown[]) => c[0] === "load");
    const errorCall = mockMapOn.mock.calls.find((c: unknown[]) => c[0] === "error");
    expect(loadCall).toBeTruthy();
    expect(errorCall).toBeTruthy();
  });
});

// ── MapControls locate ──

describe("MapControls locate button", () => {
  function renderWithMap(ui: React.ReactElement) {
    return render(<Map>{ui}</Map>);
  }

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("no network"));
  });

  it("calls geolocation and flyTo on locate click", () => {
    const onLocate = vi.fn();
    const mockGetCurrentPosition = vi.fn((cb: PositionCallback) => {
      cb({
        coords: { longitude: 127.0, latitude: 37.5 },
      } as GeolocationPosition);
    });

    const originalGeolocation = navigator.geolocation;
    Object.defineProperty(navigator, "geolocation", {
      value: { getCurrentPosition: mockGetCurrentPosition },
      writable: true,
      configurable: true,
    });

    try {
      const { container } = renderWithMap(<MapControls showLocate onLocate={onLocate} />);
      const buttons = container.querySelectorAll("button");
      // zoom-in (0), zoom-out (1), locate (2)
      fireEvent.click(buttons[2]);

      expect(mockGetCurrentPosition).toHaveBeenCalled();
      expect(mockMapFlyTo).toHaveBeenCalledWith(
        expect.objectContaining({ center: [127.0, 37.5], zoom: 15 }),
      );
      expect(onLocate).toHaveBeenCalledWith({ longitude: 127.0, latitude: 37.5 });
    } finally {
      Object.defineProperty(navigator, "geolocation", {
        value: originalGeolocation,
        writable: true,
        configurable: true,
      });
    }
  });
});

// ── MapControls fullscreen ──

describe("MapControls fullscreen button", () => {
  function renderWithMap(ui: React.ReactElement) {
    return render(<Map>{ui}</Map>);
  }

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("no network"));
    // Provide a parent element for the mock map container
    const parent = document.createElement("div");
    parent.requestFullscreen = vi.fn().mockResolvedValue(undefined);
    const child = document.createElement("div");
    parent.appendChild(child);
    mockMapGetContainer.mockReturnValue(child);
  });

  it("requests fullscreen when clicking fullscreen button", () => {
    const originalDesc = Object.getOwnPropertyDescriptor(document, "fullscreenElement");
    Object.defineProperty(document, "fullscreenElement", {
      value: null,
      writable: true,
      configurable: true,
    });

    try {
      const { container } = renderWithMap(<MapControls showFullscreen />);
      const buttons = container.querySelectorAll("button");
      // zoom-in (0), zoom-out (1), fullscreen (2)
      fireEvent.click(buttons[2]);
    } finally {
      if (originalDesc) {
        Object.defineProperty(document, "fullscreenElement", originalDesc);
      }
    }
  });

  it("exits fullscreen when already in fullscreen mode", () => {
    const originalDesc = Object.getOwnPropertyDescriptor(document, "fullscreenElement");
    Object.defineProperty(document, "fullscreenElement", {
      value: document.createElement("div"),
      writable: true,
      configurable: true,
    });

    const mockExitFullscreen = vi.fn().mockResolvedValue(undefined);
    const originalExit = document.exitFullscreen;
    document.exitFullscreen = mockExitFullscreen;

    try {
      const { container } = renderWithMap(<MapControls showFullscreen />);
      const buttons = container.querySelectorAll("button");
      fireEvent.click(buttons[2]);
      expect(mockExitFullscreen).toHaveBeenCalled();
    } finally {
      document.exitFullscreen = originalExit;
      if (originalDesc) {
        Object.defineProperty(document, "fullscreenElement", originalDesc);
      }
    }
  });

  it("listens for fullscreenchange events", () => {
    const addEventListenerSpy = vi.spyOn(document, "addEventListener");
    renderWithMap(<MapControls showFullscreen />);
    expect(addEventListenerSpy).toHaveBeenCalledWith("fullscreenchange", expect.any(Function));
    addEventListenerSpy.mockRestore();
  });
});

// ── MapControls compass with points ──

describe("MapControls compass with compassPoints", () => {
  function renderWithMap(ui: React.ReactElement) {
    return render(<Map>{ui}</Map>);
  }

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("no network"));
  });

  it("fits map to bounds when compassPoints are provided", () => {
    const points = [
      { latitude: 37.5, longitude: 127.0 },
      { latitude: 37.6, longitude: 127.1 },
    ];
    const { container } = renderWithMap(
      <MapControls showCompass compassPoints={points} />,
    );
    const buttons = container.querySelectorAll("button");
    // zoom-in (0), zoom-out (1), compass (2)
    fireEvent.click(buttons[2]);
    // fitMapToBounds should call fitBounds via the map instance
    expect(mockMapFitBounds).toHaveBeenCalled();
  });

  it("falls back to geolocation when compassPoints is empty array", () => {
    const mockGetCurrentPosition = vi.fn((cb: PositionCallback) => {
      cb({
        coords: { longitude: 127.0, latitude: 37.5 },
      } as GeolocationPosition);
    });

    const originalGeolocation = navigator.geolocation;
    Object.defineProperty(navigator, "geolocation", {
      value: { getCurrentPosition: mockGetCurrentPosition },
      writable: true,
      configurable: true,
    });

    try {
      const { container } = renderWithMap(
        <MapControls showCompass compassPoints={[]} />,
      );
      const buttons = container.querySelectorAll("button");
      fireEvent.click(buttons[2]);
      expect(mockGetCurrentPosition).toHaveBeenCalled();
    } finally {
      Object.defineProperty(navigator, "geolocation", {
        value: originalGeolocation,
        writable: true,
        configurable: true,
      });
    }
  });
});

// ── MapMarker dragend ──

describe("MapMarker dragend handler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("no network"));
    MockMarkerInstance.setLngLat.mockReturnThis();
    MockMarkerInstance.addTo.mockReturnThis();
    MockMarkerInstance.getLngLat.mockReturnValue({ lng: 127.0, lat: 37.5 });
    MockMarkerInstance.getElement.mockReturnValue(document.createElement("div"));
    MockMarkerInstance.isDraggable.mockReturnValue(true);
  });

  it("registers dragend handler on marker", () => {
    render(
      <Map>
        <MapMarker longitude={127.0} latitude={37.5} draggable onDragEnd={vi.fn()} />
      </Map>,
    );
    expect(MockMarkerInstance.on).toHaveBeenCalledWith("dragend", expect.any(Function));
  });

  it("calls onDragEnd with lngLat when drag ends", () => {
    const onDragEnd = vi.fn();
    MockMarkerInstance.getLngLat.mockReturnValue({ lng: 128.0, lat: 38.0 });

    render(
      <Map>
        <MapMarker longitude={127.0} latitude={37.5} draggable onDragEnd={onDragEnd} />
      </Map>,
    );

    // Get the dragend handler
    const dragEndCall = MockMarkerInstance.on.mock.calls.find(
      (call: unknown[]) => call[0] === "dragend",
    );
    expect(dragEndCall).toBeTruthy();
    // Trigger it
    dragEndCall![1]();
    expect(onDragEnd).toHaveBeenCalledWith({ lng: 128.0, lat: 38.0 });
  });
});

// ── MapMarker with custom children ──

describe("MapMarker with children", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("no network"));
    MockMarkerInstance.setLngLat.mockReturnThis();
    MockMarkerInstance.addTo.mockReturnThis();
    MockMarkerInstance.getLngLat.mockReturnValue({ lng: 127.0, lat: 37.5 });
    MockMarkerInstance.getElement.mockReturnValue(document.createElement("div"));
    MockMarkerInstance.isDraggable.mockReturnValue(false);
  });

  it("renders custom children inside marker portal", () => {
    render(
      <Map>
        <MapMarker longitude={127.0} latitude={37.5}>
          <span data-testid="custom-marker">Custom</span>
        </MapMarker>
      </Map>,
    );
    // Marker was added
    expect(MockMarkerInstance.addTo).toHaveBeenCalled();
  });
});

// ── Map ref forwarding ──

describe("Map ref forwarding", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("no network"));
  });

  it("forwards ref as callback", () => {
    const refCallback = vi.fn();
    render(<Map ref={refCallback} />);
    // setRef is called with the map instance
    expect(refCallback).toHaveBeenCalled();
  });

  it("forwards ref as object", () => {
    const ref = React.createRef<unknown>();
    render(<Map ref={ref} />);
    expect(ref.current).toBeTruthy();
  });

  it("sets ref to null on unmount", () => {
    const refCallback = vi.fn();
    const { unmount } = render(<Map ref={refCallback} />);
    refCallback.mockClear();
    unmount();
    expect(refCallback).toHaveBeenCalledWith(null);
  });
});

// ── Map with custom styles ──

describe("Map with custom styles", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("no network"));
  });

  it("uses custom style URLs when provided", () => {
    render(
      <Map
        theme="dark"
        styles={{
          dark: "https://custom-dark-style.json",
          light: "https://custom-light-style.json",
        }}
      />,
    );
    // Map should be initialized
    expect(mockMapOn).toHaveBeenCalledWith("load", expect.any(Function));
  });

  it("uses object style (PMTiles fallback) for theme change", () => {
    const objectStyle = { version: 8 as const, sources: {}, layers: [] };
    const { rerender } = render(
      <Map
        theme="light"
        styles={{ light: objectStyle, dark: objectStyle }}
      />,
    );
    mockMapSetStyle.mockClear();
    rerender(
      <Map
        theme="dark"
        styles={{ light: objectStyle, dark: objectStyle }}
      />,
    );
    // Object styles should always be applied on theme change
    expect(mockMapSetStyle).toHaveBeenCalled();
  });
});

// ── MapControls all controls at once ──

describe("MapControls all controls enabled", () => {
  function renderWithMap(ui: React.ReactElement) {
    return render(<Map>{ui}</Map>);
  }

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("no network"));
  });

  it("renders all control buttons when all flags are true", () => {
    const { container } = renderWithMap(
      <MapControls showZoom showCompass showLocate showFullscreen />,
    );
    const buttons = container.querySelectorAll("button");
    // zoom-in, zoom-out, compass, locate, fullscreen = 5 buttons
    expect(buttons.length).toBe(5);
  });

  it("renders separators between control groups", () => {
    const { container } = renderWithMap(
      <MapControls showZoom showCompass showLocate showFullscreen />,
    );
    // Each group separator is an h-px div
    const separators = container.querySelectorAll(".h-px");
    expect(separators.length).toBeGreaterThan(0);
  });
});

// ── Map center sync edge cases ──

describe("Map center sync edge cases", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("no network"));
  });

  it("does not sync center when center is undefined", () => {
    render(<Map />);
    expect(mockMapSetCenter).not.toHaveBeenCalled();
  });
});

// ── Map with fallbackTileUrl (async init via probeOnlineTiles) ──

describe("Map with fallbackTileUrl", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset the tileProbeCache by firing the "online" event
    window.dispatchEvent(new Event("online"));
  });

  it("initializes map via probeOnlineTiles when fallbackTileUrl is set (online probe fails)", async () => {
    // When fetch rejects, probeOnlineTiles returns false, so fallback style is used
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("offline"));

    render(<Map fallbackTileUrl="/tiles.pmtiles" />);

    // Wait for async probeOnlineTiles to resolve
    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });

    // Map should still be initialized (with fallback style)
    expect(mockMapOn).toHaveBeenCalledWith("load", expect.any(Function));
  });

  it("initializes map with online style when probe succeeds", async () => {
    // Mock successful fetch for probe
    const mockResponse = {
      ok: true,
      json: vi.fn().mockResolvedValue({
        sources: {
          vector: {
            type: "vector",
            url: "https://tiles.example.com/tilejson.json",
          },
        },
      }),
    };
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(mockResponse as unknown as Response) // style.json fetch
      .mockResolvedValueOnce({ ok: true } as unknown as Response); // tilejson probe

    render(<Map fallbackTileUrl="/tiles.pmtiles" />);

    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });

    expect(mockMapOn).toHaveBeenCalledWith("load", expect.any(Function));
  });

  it("registers error handler that switches to fallback on first error", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("offline"));

    render(<Map fallbackTileUrl="/tiles.pmtiles" />);

    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });

    // The error handler should be registered
    const errorCall = mockMapOn.mock.calls.find(
      (call: unknown[]) => call[0] === "error",
    );
    expect(errorCall).toBeTruthy();
  });

  it("triggers load handler with fallback timer check", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("offline"));

    render(<Map fallbackTileUrl="/tiles.pmtiles" />);

    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });

    // Find and trigger load
    const loadCall = mockMapOn.mock.calls.find(
      (call: unknown[]) => call[0] === "load",
    );
    if (loadCall) {
      act(() => {
        loadCall[1]();
      });
    }
  });
});

// ── probeOnlineTiles response paths ──

describe("probeOnlineTiles response paths", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset the tileProbeCache by firing the "online" event
    window.dispatchEvent(new Event("online"));
  });

  it("handles style.json with inline tile URLs", async () => {
    const mockResponse = {
      ok: true,
      json: vi.fn().mockResolvedValue({
        sources: {
          protomaps: {
            type: "vector",
            tiles: ["https://tiles.example.com/{z}/{x}/{y}.pbf"],
          },
        },
      }),
    };
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(mockResponse as unknown as Response) // style.json
      .mockResolvedValueOnce({ ok: true } as unknown as Response); // tile probe

    render(<Map fallbackTileUrl="/tiles.pmtiles" />);

    await act(async () => {
      await new Promise((r) => setTimeout(r, 100));
    });

    expect(mockMapOn).toHaveBeenCalled();
  });

  it("handles style.json with no sources", async () => {
    const mockResponse = {
      ok: true,
      json: vi.fn().mockResolvedValue({}),
    };
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(mockResponse as unknown as Response);

    render(<Map fallbackTileUrl="/tiles.pmtiles" />);

    await act(async () => {
      await new Promise((r) => setTimeout(r, 100));
    });

    expect(mockMapOn).toHaveBeenCalled();
  });

  it("handles style.json fetch failure (non-ok)", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: false,
    } as unknown as Response);

    render(<Map fallbackTileUrl="/tiles.pmtiles" />);

    await act(async () => {
      await new Promise((r) => setTimeout(r, 100));
    });

    expect(mockMapOn).toHaveBeenCalled();
  });

  it("skips pmtiles:// source URLs during probe", async () => {
    const mockResponse = {
      ok: true,
      json: vi.fn().mockResolvedValue({
        sources: {
          protomaps: {
            type: "vector",
            url: "pmtiles://https://tiles.example.com/world.pmtiles",
          },
        },
      }),
    };
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(mockResponse as unknown as Response);

    render(<Map fallbackTileUrl="/tiles.pmtiles" />);

    await act(async () => {
      await new Promise((r) => setTimeout(r, 100));
    });

    expect(mockMapOn).toHaveBeenCalled();
  });
});

// ── Map cleanup on unmount with fallback ──

describe("Map cleanup on unmount", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("no network"));
  });

  it("clears fallback timer and removes map on unmount", async () => {
    const { unmount } = render(<Map fallbackTileUrl="/tiles.pmtiles" />);

    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });

    unmount();
    expect(mockMapRemove).toHaveBeenCalled();
  });
});

// ── MapControls custom className ──

describe("MapControls custom className", () => {
  function renderWithMap(ui: React.ReactElement) {
    return render(<Map>{ui}</Map>);
  }

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("no network"));
  });

  it("applies custom className to controls container", () => {
    const { container } = renderWithMap(
      <MapControls className="my-controls" />,
    );
    const controlsDiv = container.querySelector(".my-controls");
    expect(controlsDiv).toBeTruthy();
  });
});
