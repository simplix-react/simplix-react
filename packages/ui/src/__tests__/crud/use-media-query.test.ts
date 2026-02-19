// @vitest-environment jsdom
import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { useMediaQuery } from "../../crud/list/use-media-query";

describe("useMediaQuery", () => {
  let listeners: Array<() => void>;
  let mockMatches: boolean;

  beforeEach(() => {
    listeners = [];
    mockMatches = false;

    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: mockMatches,
        media: query,
        addEventListener: vi.fn((_event: string, handler: () => void) => {
          listeners.push(handler);
        }),
        removeEventListener: vi.fn(),
      })),
    });
  });

  it("returns false when query does not match", () => {
    mockMatches = false;
    const { result } = renderHook(() => useMediaQuery("(min-width: 768px)"));

    expect(result.current).toBe(false);
  });

  it("returns true when query matches", () => {
    mockMatches = true;
    const { result } = renderHook(() => useMediaQuery("(min-width: 768px)"));

    expect(result.current).toBe(true);
  });

  it("passes the query string to matchMedia", () => {
    renderHook(() => useMediaQuery("(max-width: 1024px)"));

    expect(window.matchMedia).toHaveBeenCalledWith("(max-width: 1024px)");
  });

  it("re-creates matchMedia when query changes", () => {
    const { rerender } = renderHook(
      ({ query }) => useMediaQuery(query),
      { initialProps: { query: "(min-width: 768px)" } },
    );

    rerender({ query: "(min-width: 1024px)" });

    expect(window.matchMedia).toHaveBeenCalledWith("(min-width: 1024px)");
  });
});
