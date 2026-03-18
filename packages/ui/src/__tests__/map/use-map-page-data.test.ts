// @vitest-environment jsdom
import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useMapPageData } from "../../map/use-map-page-data";

interface TestItem {
  id: string;
  lat: number | null;
  lng: number | null;
}

const hasValidCoords = (item: TestItem): boolean =>
  item.lat != null && item.lng != null && item.lat !== 0 && item.lng !== 0;

describe("useMapPageData", () => {
  it("returns only items with valid coordinates", () => {
    const data: TestItem[] = [
      { id: "1", lat: 37.5, lng: 127.0 },
      { id: "2", lat: null, lng: null },
      { id: "3", lat: 35.1, lng: 129.0 },
    ];

    const { result } = renderHook(() =>
      useMapPageData({ data, isLoading: false, hasValidCoords }),
    );

    expect(result.current.validItems).toHaveLength(2);
    expect(result.current.validItems[0]!.id).toBe("1");
    expect(result.current.validItems[1]!.id).toBe("3");
  });

  it("returns empty array when no items have valid coordinates", () => {
    const data: TestItem[] = [
      { id: "1", lat: null, lng: null },
      { id: "2", lat: 0, lng: 0 },
    ];

    const { result } = renderHook(() =>
      useMapPageData({ data, isLoading: false, hasValidCoords }),
    );

    expect(result.current.validItems).toHaveLength(0);
  });

  it("returns empty array when data is empty", () => {
    const { result } = renderHook(() =>
      useMapPageData({ data: [], isLoading: false, hasValidCoords }),
    );

    expect(result.current.validItems).toHaveLength(0);
  });

  it("passes through isLoading state", () => {
    const { result } = renderHook(() =>
      useMapPageData({ data: [], isLoading: true, hasValidCoords }),
    );

    expect(result.current.isLoading).toBe(true);
  });

  it("returns isLoading false when loading is complete", () => {
    const { result } = renderHook(() =>
      useMapPageData({ data: [], isLoading: false, hasValidCoords }),
    );

    expect(result.current.isLoading).toBe(false);
  });

  it("returns all items when all have valid coordinates", () => {
    const data: TestItem[] = [
      { id: "1", lat: 37.5, lng: 127.0 },
      { id: "2", lat: 35.1, lng: 129.0 },
      { id: "3", lat: 33.5, lng: 126.5 },
    ];

    const { result } = renderHook(() =>
      useMapPageData({ data, isLoading: false, hasValidCoords }),
    );

    expect(result.current.validItems).toHaveLength(3);
  });

  it("memoizes validItems across re-renders with same data", () => {
    const data: TestItem[] = [
      { id: "1", lat: 37.5, lng: 127.0 },
    ];

    const { result, rerender } = renderHook(
      ({ data, isLoading }) => useMapPageData({ data, isLoading, hasValidCoords }),
      { initialProps: { data, isLoading: false } },
    );

    const first = result.current.validItems;

    rerender({ data, isLoading: false });

    expect(result.current.validItems).toBe(first);
  });

  it("uses custom hasValidCoords predicate", () => {
    const customPredicate = (item: TestItem) => item.lat !== null && item.lat > 36;
    const data: TestItem[] = [
      { id: "1", lat: 37.5, lng: 127.0 },
      { id: "2", lat: 35.1, lng: 129.0 },
      { id: "3", lat: 38.0, lng: 126.0 },
    ];

    const { result } = renderHook(() =>
      useMapPageData({ data, isLoading: false, hasValidCoords: customPredicate }),
    );

    expect(result.current.validItems).toHaveLength(2);
    expect(result.current.validItems[0]!.id).toBe("1");
    expect(result.current.validItems[1]!.id).toBe("3");
  });
});
