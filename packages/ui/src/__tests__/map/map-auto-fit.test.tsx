// @vitest-environment jsdom
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, it, expect, vi } from "vitest";

afterEach(cleanup);

// Mock useMap hook
const mockMap = {
  fitBounds: vi.fn(),
};

vi.mock("../../base/map/map", () => ({
  useMap: () => ({
    map: mockMap,
    isLoaded: true,
  }),
}));

// Mock geo utility
vi.mock("../../utils/geo", () => ({
  fitMapToBounds: vi.fn(),
}));

import React from "react";
import { MapAutoFit } from "../../base/map/map-auto-fit";
import { fitMapToBounds } from "../../utils/geo";

describe("MapAutoFit", () => {
  it("renders nothing (returns null)", () => {
    const { container } = render(
      <MapAutoFit
        points={[{ longitude: 126.97, latitude: 37.56 }]}
      />,
    );
    expect(container.innerHTML).toBe("");
  });

  it("calls fitMapToBounds when loaded with points", () => {
    render(
      <MapAutoFit
        points={[
          { longitude: 126.97, latitude: 37.56 },
          { longitude: 139.69, latitude: 35.68 },
        ]}
      />,
    );
    expect(fitMapToBounds).toHaveBeenCalledWith(
      mockMap,
      [
        { longitude: 126.97, latitude: 37.56 },
        { longitude: 139.69, latitude: 35.68 },
      ],
      undefined,
    );
  });

  it("does not call fitMapToBounds when points is empty", () => {
    vi.mocked(fitMapToBounds).mockClear();
    render(<MapAutoFit points={[]} />);
    expect(fitMapToBounds).not.toHaveBeenCalled();
  });

  it("passes fitOptions to fitMapToBounds", () => {
    vi.mocked(fitMapToBounds).mockClear();
    const fitOptions = { padding: 50 };
    render(
      <MapAutoFit
        points={[{ longitude: 126.97, latitude: 37.56 }]}
        fitOptions={fitOptions}
      />,
    );
    expect(fitMapToBounds).toHaveBeenCalledWith(
      mockMap,
      [{ longitude: 126.97, latitude: 37.56 }],
      fitOptions,
    );
  });
});
