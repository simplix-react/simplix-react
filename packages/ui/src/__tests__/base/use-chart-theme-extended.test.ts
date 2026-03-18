// @vitest-environment jsdom
import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

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

import { useChartTheme, toHex6 } from "../../base/charts/apexcharts/use-chart-theme";

describe("useChartTheme", () => {
  beforeEach(() => {
    // Reset document classes
    document.documentElement.className = "";
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns a theme object with expected keys", () => {
    const { result } = renderHook(() => useChartTheme());
    expect(result.current).toHaveProperty("foreground");
    expect(result.current).toHaveProperty("mutedForeground");
    expect(result.current).toHaveProperty("border");
    expect(result.current).toHaveProperty("borderLight");
    expect(result.current).toHaveProperty("background");
    expect(result.current).toHaveProperty("fontFamily", "inherit");
    expect(result.current).toHaveProperty("tooltipTheme");
  });

  it("returns light tooltip theme when no dark class", () => {
    document.documentElement.classList.remove("dark");
    const { result } = renderHook(() => useChartTheme());
    expect(result.current.tooltipTheme).toBe("light");
  });

  it("returns dark tooltip theme when dark class is present", () => {
    document.documentElement.classList.add("dark");
    const { result } = renderHook(() => useChartTheme());
    expect(result.current.tooltipTheme).toBe("dark");
  });

  it("updates theme when document class changes", async () => {
    document.documentElement.classList.remove("dark");
    const { result } = renderHook(() => useChartTheme());
    expect(result.current.tooltipTheme).toBe("light");

    // Simulate class change via MutationObserver
    await act(async () => {
      document.documentElement.classList.add("dark");
      // MutationObserver is async, need to flush
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.tooltipTheme).toBe("dark");
  });

  it("uses rgba borderLight for light mode", () => {
    document.documentElement.classList.remove("dark");
    const { result } = renderHook(() => useChartTheme());
    expect(result.current.borderLight).toContain("rgba(0,0,0,");
  });

  it("uses rgba borderLight for dark mode", () => {
    document.documentElement.classList.add("dark");
    const { result } = renderHook(() => useChartTheme());
    expect(result.current.borderLight).toContain("rgba(255,255,255,");
  });
});

describe("toHex6 (extended)", () => {
  it("handles 3-char hex by returning first 7 chars", () => {
    // toHex6 just slices first 7 chars from hex strings
    expect(toHex6("#abc")).toBe("#abc");
  });

  it("handles rgb with no spaces", () => {
    expect(toHex6("rgb(0,0,0)")).toBe("#000000");
  });
});
