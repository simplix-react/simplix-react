// @vitest-environment jsdom
import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

import { useMapNavigator } from "../../base/map/map-navigator";

interface TestPoint {
  longitude: number;
  latitude: number;
  name: string;
}

const items: TestPoint[] = [
  { longitude: 126.97, latitude: 37.56, name: "Seoul" },
  { longitude: 139.69, latitude: 35.68, name: "Tokyo" },
  { longitude: 116.39, latitude: 39.90, name: "Beijing" },
];

describe("useMapNavigator", () => {
  function createMapRef() {
    return {
      current: {
        flyTo: vi.fn(),
        fitBounds: vi.fn(),
      },
    };
  }

  it("initializes with focusedIndex 0", () => {
    const mapRef = createMapRef();
    const { result } = renderHook(() =>
      useMapNavigator({ items, mapRef }),
    );
    expect(result.current.focusedIndex).toBe(0);
  });

  it("navigateTo sets focusedIndex and calls flyTo", () => {
    const mapRef = createMapRef();
    const { result } = renderHook(() =>
      useMapNavigator({ items, mapRef }),
    );

    act(() => result.current.navigateTo(2));
    expect(result.current.focusedIndex).toBe(2);
    expect(mapRef.current.flyTo).toHaveBeenCalledWith(
      expect.objectContaining({
        center: [116.39, 39.90],
      }),
    );
  });

  it("handleNext cycles forward", () => {
    const mapRef = createMapRef();
    const { result } = renderHook(() =>
      useMapNavigator({ items, mapRef }),
    );

    act(() => result.current.handleNext());
    expect(result.current.focusedIndex).toBe(1);

    act(() => result.current.handleNext());
    expect(result.current.focusedIndex).toBe(2);

    // Wraps around
    act(() => result.current.handleNext());
    expect(result.current.focusedIndex).toBe(0);
  });

  it("handlePrev cycles backward", () => {
    const mapRef = createMapRef();
    const { result } = renderHook(() =>
      useMapNavigator({ items, mapRef }),
    );

    // Wraps around from 0 to last
    act(() => result.current.handlePrev());
    expect(result.current.focusedIndex).toBe(2);

    act(() => result.current.handlePrev());
    expect(result.current.focusedIndex).toBe(1);
  });

  it("handleNext does nothing when items is empty", () => {
    const mapRef = createMapRef();
    const { result } = renderHook(() =>
      useMapNavigator({ items: [], mapRef }),
    );

    act(() => result.current.handleNext());
    expect(result.current.focusedIndex).toBe(0);
    expect(mapRef.current.flyTo).not.toHaveBeenCalled();
  });

  it("handlePrev does nothing when items is empty", () => {
    const mapRef = createMapRef();
    const { result } = renderHook(() =>
      useMapNavigator({ items: [], mapRef }),
    );

    act(() => result.current.handlePrev());
    expect(result.current.focusedIndex).toBe(0);
    expect(mapRef.current.flyTo).not.toHaveBeenCalled();
  });

  it("resets focusedIndex when items change", () => {
    const mapRef = createMapRef();
    const { result, rerender } = renderHook(
      ({ items: hookItems }) => useMapNavigator({ items: hookItems, mapRef }),
      { initialProps: { items } },
    );

    act(() => result.current.navigateTo(2));
    expect(result.current.focusedIndex).toBe(2);

    rerender({ items: [items[0]] });
    expect(result.current.focusedIndex).toBe(0);
  });

  it("fitAll calls fitBounds on the map ref", () => {
    const mapRef = createMapRef();
    const { result } = renderHook(() =>
      useMapNavigator({ items, mapRef }),
    );

    act(() => result.current.fitAll());
    expect(mapRef.current.fitBounds).toHaveBeenCalled();
  });

  it("navigateTo does nothing when mapRef.current is null", () => {
    const mapRef = { current: null };
    const { result } = renderHook(() =>
      useMapNavigator({ items, mapRef }),
    );

    act(() => result.current.navigateTo(1));
    // Should not throw
    expect(result.current.focusedIndex).toBe(1);
  });
});
