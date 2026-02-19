// @vitest-environment jsdom
import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { type RefObject } from "react";

import { useContainerWidth } from "../../crud/list/use-container-width";

describe("useContainerWidth", () => {
  let observeMock: ReturnType<typeof vi.fn>;
  let disconnectMock: ReturnType<typeof vi.fn>;
  let resizeCallback: ResizeObserverCallback;

  beforeEach(() => {
    observeMock = vi.fn();
    disconnectMock = vi.fn();

    vi.stubGlobal(
      "ResizeObserver",
      vi.fn().mockImplementation((cb: ResizeObserverCallback) => {
        resizeCallback = cb;
        return { observe: observeMock, disconnect: disconnectMock, unobserve: vi.fn() };
      }),
    );
  });

  it("returns 0 when ref.current is null", () => {
    const ref = { current: null } as RefObject<HTMLElement | null>;
    const { result } = renderHook(() => useContainerWidth(ref));

    expect(result.current).toBe(0);
  });

  it("reads clientWidth on mount", () => {
    const el = document.createElement("div");
    Object.defineProperty(el, "clientWidth", { value: 500 });

    const ref = { current: el } as RefObject<HTMLElement | null>;
    const { result } = renderHook(() => useContainerWidth(ref));

    expect(result.current).toBe(500);
  });

  it("observes the element with ResizeObserver", () => {
    const el = document.createElement("div");
    Object.defineProperty(el, "clientWidth", { value: 300 });

    const ref = { current: el } as RefObject<HTMLElement | null>;
    renderHook(() => useContainerWidth(ref));

    expect(observeMock).toHaveBeenCalledWith(el);
  });

  it("disconnects ResizeObserver on unmount", () => {
    const el = document.createElement("div");
    Object.defineProperty(el, "clientWidth", { value: 300 });

    const ref = { current: el } as RefObject<HTMLElement | null>;
    const { unmount } = renderHook(() => useContainerWidth(ref));

    unmount();

    expect(disconnectMock).toHaveBeenCalled();
  });
});
