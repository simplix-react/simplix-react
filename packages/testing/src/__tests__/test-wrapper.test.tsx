// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useQueryClient, QueryClient } from "@tanstack/react-query";
import { createTestWrapper } from "../test-wrapper.js";

describe("createTestWrapper", () => {
  it("returns a valid React wrapper component", () => {
    const wrapper = createTestWrapper();
    expect(typeof wrapper).toBe("function");
  });

  it("provides QueryClient context", () => {
    const wrapper = createTestWrapper();
    const { result } = renderHook(() => useQueryClient(), { wrapper });
    expect(result.current).toBeInstanceOf(QueryClient);
  });

  it("uses a default test QueryClient when none is provided", () => {
    const wrapper = createTestWrapper();
    const { result } = renderHook(() => useQueryClient(), { wrapper });
    const defaults = result.current.getDefaultOptions();
    expect(defaults.queries?.retry).toBe(false);
    expect(defaults.queries?.gcTime).toBe(0);
  });

  it("accepts a custom QueryClient", () => {
    const customClient = new QueryClient({
      defaultOptions: {
        queries: { retry: 3, staleTime: 60_000 },
      },
    });
    const wrapper = createTestWrapper({ queryClient: customClient });
    const { result } = renderHook(() => useQueryClient(), { wrapper });
    expect(result.current).toBe(customClient);
    expect(result.current.getDefaultOptions().queries?.retry).toBe(3);
  });
});
