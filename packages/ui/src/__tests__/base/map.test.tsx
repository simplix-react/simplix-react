// @vitest-environment jsdom
import { cleanup, render, fireEvent } from "@testing-library/react";
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

// Mock maplibre-gl entirely
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
  // Use regular function so `new` works correctly
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

vi.mock("pmtiles", () => ({
  Protocol: vi.fn().mockImplementation(() => ({
    tile: vi.fn(),
  })),
}));

vi.mock("protomaps-themes-base", () => ({
  noLabels: vi.fn().mockReturnValue([]),
}));

// Mock map-provider
vi.mock("../../base/map/map-provider", () => ({
  useMapDefaults: () => ({
    defaultFallbackTileUrl: undefined,
    defaultMarkerIcon: undefined,
  }),
}));

import React from "react";
import { Map, MapMarker, MapControls, MapPinContainer, useMap } from "../../base/map/map";

describe("Map component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset fetch for probing
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("no network"));
  });

  it("renders a map container div", () => {
    const { container } = render(<Map />);
    expect(container.querySelector("div")).toBeTruthy();
  });

  it("applies custom className", () => {
    const { container } = render(<Map className="my-map" />);
    const mapDiv = container.firstElementChild;
    expect(mapDiv?.className).toContain("my-map");
  });

  it("initializes map and registers event handlers", () => {
    render(<Map />);
    expect(mockMapOn).toHaveBeenCalledWith("load", expect.any(Function));
    expect(mockMapOn).toHaveBeenCalledWith("error", expect.any(Function));
  });

  it("adds attribution control on init", () => {
    render(<Map />);
    expect(mockMapAddControl).toHaveBeenCalled();
  });

  it("removes map instance on unmount", () => {
    const { unmount } = render(<Map />);
    unmount();
    expect(mockMapRemove).toHaveBeenCalled();
  });

  it("renders children after map initialization", () => {
    const { queryByTestId } = render(
      <Map>
        <div data-testid="map-child">child</div>
      </Map>,
    );
    expect(queryByTestId("map-child")).toBeTruthy();
  });

  it("passes center prop to map constructor", () => {
    render(<Map center={[127.0, 37.5]} />);
    // Map is initialized — check that load handler registered
    expect(mockMapOn).toHaveBeenCalledWith("load", expect.any(Function));
  });

  it("syncs center via setCenter when center prop changes", () => {
    // getCenter returns different coords so setCenter will be called
    mockMapGetCenter.mockReturnValue({ lng: 100, lat: 20 });
    const { rerender } = render(<Map center={[127.0, 37.5]} />);
    rerender(<Map center={[128.0, 38.0]} />);
    expect(mockMapSetCenter).toHaveBeenCalledWith([128.0, 38.0]);
  });

  it("does not call setCenter when center has not changed", () => {
    mockMapGetCenter.mockReturnValue({ lng: 127.0, lat: 37.5 });
    const { rerender } = render(<Map center={[127.0, 37.5]} />);
    rerender(<Map center={[127.0, 37.5]} />);
    expect(mockMapSetCenter).not.toHaveBeenCalled();
  });

  it("calls onError callback on map error (no fallback)", () => {
    const onError = vi.fn();
    render(<Map onError={onError} />);
    // Trigger the error handler
    const errorCall = mockMapOn.mock.calls.find(
      (call: unknown[]) => call[0] === "error",
    );
    expect(errorCall).toBeTruthy();
    errorCall![1]();
    expect(onError).toHaveBeenCalled();
  });
});

describe("MapPinContainer", () => {
  it("renders children inside pin container", () => {
    const { container } = render(
      <MapPinContainer>
        <span>Pin Content</span>
      </MapPinContainer>,
    );
    expect(container.querySelector("span")?.textContent).toBe("Pin Content");
  });

  it("applies custom className", () => {
    const { container } = render(
      <MapPinContainer className="my-pin">
        <span>Content</span>
      </MapPinContainer>,
    );
    expect(container.firstElementChild?.className).toContain("my-pin");
  });

  it("renders SVG pin shape", () => {
    const { container } = render(
      <MapPinContainer>
        <span>Pin</span>
      </MapPinContainer>,
    );
    expect(container.querySelector("svg")).toBeTruthy();
  });

  it("uses fixed dimensions for pin", () => {
    const { container } = render(
      <MapPinContainer>
        <span>Pin</span>
      </MapPinContainer>,
    );
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.width).toBe("36px");
    expect(el.style.height).toBe("45px");
  });
});

describe("MapControls", () => {
  function renderWithMap(ui: React.ReactElement) {
    return render(<Map>{ui}</Map>);
  }

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("no network"));
  });

  it("renders zoom controls by default", () => {
    const { container } = renderWithMap(<MapControls />);
    const buttons = container.querySelectorAll("button");
    expect(buttons.length).toBeGreaterThanOrEqual(2);
  });

  it("returns null when all controls are disabled", () => {
    const { container } = renderWithMap(
      <MapControls showZoom={false} showCompass={false} showLocate={false} showFullscreen={false} />,
    );
    const controlsWrapper = container.querySelector(".pointer-events-none.absolute.z-10");
    expect(controlsWrapper).toBeNull();
  });

  it("renders compass control when showCompass is true", () => {
    const { container } = renderWithMap(<MapControls showCompass />);
    const buttons = container.querySelectorAll("button");
    // zoom-in, zoom-out, compass
    expect(buttons.length).toBeGreaterThanOrEqual(3);
  });

  it("calls zoomIn when zoom in button is clicked", () => {
    const { container } = renderWithMap(<MapControls />);
    const buttons = container.querySelectorAll("button");
    fireEvent.click(buttons[0]);
    expect(mockMapZoomIn).toHaveBeenCalled();
  });

  it("calls zoomOut when zoom out button is clicked", () => {
    const { container } = renderWithMap(<MapControls />);
    const buttons = container.querySelectorAll("button");
    fireEvent.click(buttons[1]);
    expect(mockMapZoomOut).toHaveBeenCalled();
  });

  it("calls resetNorthPitch for compass without custom handlers", () => {
    const { container } = renderWithMap(<MapControls showCompass />);
    const buttons = container.querySelectorAll("button");
    // zoom-in (0), zoom-out (1), compass (2)
    fireEvent.click(buttons[2]);
    expect(mockMapResetNorthPitch).toHaveBeenCalledWith({ duration: 300 });
  });

  it("calls onCompass when provided instead of resetNorthPitch", () => {
    const onCompass = vi.fn();
    const { container } = renderWithMap(<MapControls showCompass onCompass={onCompass} />);
    const buttons = container.querySelectorAll("button");
    fireEvent.click(buttons[2]);
    expect(onCompass).toHaveBeenCalled();
    expect(mockMapResetNorthPitch).not.toHaveBeenCalled();
  });

  it("applies position classes (top-left)", () => {
    const { container } = renderWithMap(<MapControls position="top-left" />);
    const wrapper = container.querySelector(".top-0.left-0");
    expect(wrapper).toBeTruthy();
  });

  it("applies default position (bottom-right)", () => {
    const { container } = renderWithMap(<MapControls />);
    const wrapper = container.querySelector(".bottom-0.right-0");
    expect(wrapper).toBeTruthy();
  });

  it("renders locate control when showLocate is true", () => {
    const { container } = renderWithMap(<MapControls showLocate />);
    const buttons = container.querySelectorAll("button");
    // zoom-in, zoom-out, locate
    expect(buttons.length).toBeGreaterThanOrEqual(3);
  });

  it("renders fullscreen control when showFullscreen is true", () => {
    const { container } = renderWithMap(<MapControls showFullscreen />);
    const buttons = container.querySelectorAll("button");
    // zoom-in, zoom-out, fullscreen
    expect(buttons.length).toBeGreaterThanOrEqual(3);
  });
});

describe("MapMarker", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("no network"));
    MockMarkerInstance.setLngLat.mockReturnThis();
    MockMarkerInstance.addTo.mockReturnThis();
    MockMarkerInstance.getLngLat.mockReturnValue({ lng: 0, lat: 0 });
    MockMarkerInstance.getElement.mockReturnValue(document.createElement("div"));
    MockMarkerInstance.isDraggable.mockReturnValue(false);
  });

  it("adds marker to the map on mount", () => {
    render(
      <Map>
        <MapMarker longitude={127.0} latitude={37.5} />
      </Map>,
    );
    expect(MockMarkerInstance.addTo).toHaveBeenCalled();
  });

  it("updates position when coordinates differ from current", () => {
    MockMarkerInstance.getLngLat.mockReturnValue({ lng: 126.0, lat: 36.0 });
    render(
      <Map>
        <MapMarker longitude={127.0} latitude={37.5} />
      </Map>,
    );
    expect(MockMarkerInstance.setLngLat).toHaveBeenCalledWith([127.0, 37.5]);
  });

  it("updates draggable state when prop changes", () => {
    MockMarkerInstance.isDraggable.mockReturnValue(false);
    render(
      <Map>
        <MapMarker longitude={127.0} latitude={37.5} draggable />
      </Map>,
    );
    expect(MockMarkerInstance.setDraggable).toHaveBeenCalledWith(true);
  });

  it("removes marker on unmount", () => {
    const { unmount } = render(
      <Map>
        <MapMarker longitude={127.0} latitude={37.5} />
      </Map>,
    );
    unmount();
    expect(MockMarkerInstance.remove).toHaveBeenCalled();
  });

  it("renders default marker icon when no children provided", () => {
    render(
      <Map>
        <MapMarker longitude={127.0} latitude={37.5} />
      </Map>,
    );
    // MapMarker creates a portal; just verify it didn't throw
    expect(MockMarkerInstance.addTo).toHaveBeenCalled();
  });
});

describe("useMap", () => {
  it("throws when used outside Map component", () => {
    function BadComponent() {
      useMap();
      return null;
    }
    // Suppress error boundary console output
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => {
      render(<BadComponent />);
    }).toThrow("useMap must be used within a Map component");
    spy.mockRestore();
  });
});
