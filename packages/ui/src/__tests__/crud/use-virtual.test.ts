// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";

vi.mock("@tanstack/react-virtual", () => ({
  useVirtualizer: vi.fn().mockReturnValue({
    getVirtualItems: vi.fn().mockReturnValue([]),
    getTotalSize: vi.fn().mockReturnValue(0),
  }),
}));

import { renderHook } from "@testing-library/react";
import { useVirtualList } from "../../crud/list/use-virtual";
import { useVirtualizer } from "@tanstack/react-virtual";

const mockedUseVirtualizer = vi.mocked(useVirtualizer);

describe("useVirtualList", () => {
  it("passes options to useVirtualizer", () => {
    const parentRef = { current: document.createElement("div") };
    const estimateSize = () => 40;

    renderHook(() =>
      useVirtualList({ count: 100, estimateSize, parentRef }),
    );

    expect(mockedUseVirtualizer).toHaveBeenCalledWith({
      count: 100,
      getScrollElement: expect.any(Function),
      estimateSize,
      overscan: 5,
    });
  });

  it("uses custom overscan", () => {
    const parentRef = { current: document.createElement("div") };

    renderHook(() =>
      useVirtualList({ count: 50, estimateSize: () => 30, parentRef, overscan: 10 }),
    );

    expect(mockedUseVirtualizer).toHaveBeenCalledWith(
      expect.objectContaining({ overscan: 10 }),
    );
  });

  it("returns virtualizer, virtualRows, and totalHeight", () => {
    const mockItems = [{ index: 0, start: 0, size: 40, end: 40, key: "0", lane: 0 }];
    mockedUseVirtualizer.mockReturnValue({
      getVirtualItems: vi.fn().mockReturnValue(mockItems),
      getTotalSize: vi.fn().mockReturnValue(4000),
    } as any);

    const parentRef = { current: document.createElement("div") };
    const { result } = renderHook(() =>
      useVirtualList({ count: 100, estimateSize: () => 40, parentRef }),
    );

    expect(result.current.virtualizer).toBeDefined();
    expect(result.current.virtualRows).toEqual(mockItems);
    expect(result.current.totalHeight).toBe(4000);
  });

  it("getScrollElement returns parentRef.current", () => {
    const el = document.createElement("div");
    const parentRef = { current: el };

    renderHook(() =>
      useVirtualList({ count: 10, estimateSize: () => 40, parentRef }),
    );

    const callArgs = mockedUseVirtualizer.mock.calls[mockedUseVirtualizer.mock.calls.length - 1][0];
    expect(callArgs.getScrollElement()).toBe(el);
  });
});
