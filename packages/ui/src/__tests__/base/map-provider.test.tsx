// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { MapProvider, useMapDefaults } from "../../base/map/map-provider";

afterEach(cleanup);

function Consumer() {
  const { defaultFallbackTileUrl, defaultMarkerIcon } = useMapDefaults();
  return (
    <div data-testid="consumer">
      <span data-testid="url">{defaultFallbackTileUrl ?? "none"}</span>
      <span data-testid="icon">{defaultMarkerIcon ?? "no-icon"}</span>
    </div>
  );
}

describe("MapProvider", () => {
  it("provides default values (empty) when no props", () => {
    render(
      <MapProvider>
        <Consumer />
      </MapProvider>,
    );
    expect(screen.getByTestId("url").textContent).toBe("none");
    expect(screen.getByTestId("icon").textContent).toBe("no-icon");
  });

  it("provides fallback tile URL", () => {
    render(
      <MapProvider defaultFallbackTileUrl="/tiles.pmtiles">
        <Consumer />
      </MapProvider>,
    );
    expect(screen.getByTestId("url").textContent).toBe("/tiles.pmtiles");
  });

  it("provides default marker icon", () => {
    render(
      <MapProvider defaultMarkerIcon={<span>M</span>}>
        <Consumer />
      </MapProvider>,
    );
    expect(screen.getByTestId("icon").textContent).toBe("M");
  });

  it("renders children", () => {
    render(
      <MapProvider>
        <span data-testid="child">hello</span>
      </MapProvider>,
    );
    expect(screen.getByTestId("child").textContent).toBe("hello");
  });
});

describe("useMapDefaults", () => {
  it("returns empty object when used outside provider", () => {
    render(<Consumer />);
    expect(screen.getByTestId("url").textContent).toBe("none");
    expect(screen.getByTestId("icon").textContent).toBe("no-icon");
  });
});
