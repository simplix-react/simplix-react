// @vitest-environment jsdom
import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

import { adaptOrvalList } from "../../crud/list/adapt-orval-list";

function createMockOrvalHook(responseData: unknown) {
  return vi.fn().mockReturnValue({
    data: responseData,
    isLoading: false,
    error: null,
  });
}

describe("adaptOrvalList", () => {
  it("converts 1-based page to 0-based page", () => {
    const useApiHook = createMockOrvalHook({ content: [], totalElements: 0 });
    const useAdapted = adaptOrvalList(useApiHook);

    renderHook(() => useAdapted({ pagination: { type: "offset", page: 3, limit: 10 } }));

    expect(useApiHook).toHaveBeenCalledWith(
      expect.objectContaining({ page: 2, size: 10 }),
      expect.any(Object),
    );
  });

  it("converts sort to Spring Data format", () => {
    const useApiHook = createMockOrvalHook({ content: [], totalElements: 0 });
    const useAdapted = adaptOrvalList(useApiHook);

    renderHook(() =>
      useAdapted({
        pagination: { type: "offset", page: 1, limit: 10 },
        sort: { field: "name", direction: "desc" },
      }),
    );

    expect(useApiHook).toHaveBeenCalledWith(
      expect.objectContaining({ sort: ["name.desc"] }),
      expect.any(Object),
    );
  });

  it("extracts content and totalElements from Spring Data Page response", () => {
    const items = [{ id: 1, name: "A" }, { id: 2, name: "B" }];
    const useApiHook = createMockOrvalHook({
      content: items,
      totalElements: 42,
    });
    const useAdapted = adaptOrvalList<{ id: number; name: string }>(useApiHook);

    const { result } = renderHook(() => useAdapted({ pagination: { type: "offset", page: 1, limit: 10 } }));

    expect(result.current.data).toEqual(items);
    expect(result.current.total).toBe(42);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("passes undefined to hook when no params", () => {
    const useApiHook = createMockOrvalHook(undefined);
    const useAdapted = adaptOrvalList(useApiHook);

    renderHook(() => useAdapted());

    expect(useApiHook).toHaveBeenCalledWith(
      {},
      expect.any(Object),
    );
  });

  it("includes filter values in params (excluding _search and empty values)", () => {
    const useApiHook = createMockOrvalHook({ content: [], totalElements: 0 });
    const useAdapted = adaptOrvalList(useApiHook);

    renderHook(() =>
      useAdapted({
        pagination: { type: "offset", page: 1, limit: 10 },
        filters: {
          _search: "test",
          "status.equals": "active",
          "name.contains": "",
          "role.in": undefined,
          "tags.in": [],
        },
      }),
    );

    const callArgs = useApiHook.mock.calls[0][0];
    expect(callArgs["status.equals"]).toBe("active");
    expect(callArgs._search).toBeUndefined();
    expect(callArgs["name.contains"]).toBeUndefined();
    expect(callArgs["role.in"]).toBeUndefined();
    expect(callArgs["tags.in"]).toBeUndefined();
  });

  it("passes default staleTime and gcTime query options", () => {
    const useApiHook = createMockOrvalHook(undefined);
    const useAdapted = adaptOrvalList(useApiHook);

    renderHook(() => useAdapted());

    expect(useApiHook).toHaveBeenCalledWith(
      expect.anything(),
      { query: { staleTime: 0, gcTime: 0 } },
    );
  });

  it("merges custom query options with defaults", () => {
    const useApiHook = createMockOrvalHook(undefined);
    const useAdapted = adaptOrvalList(useApiHook, {
      queryOptions: { staleTime: 5000, refetchOnWindowFocus: true },
    });

    renderHook(() => useAdapted());

    expect(useApiHook).toHaveBeenCalledWith(
      expect.anything(),
      { query: { staleTime: 5000, gcTime: 0, refetchOnWindowFocus: true } },
    );
  });

  it("applies transformFilters when provided", () => {
    const useApiHook = createMockOrvalHook({ content: [], totalElements: 0 });
    const transformFilters = vi.fn((filters: Record<string, unknown>) => ({
      ...filters,
      transformed: true,
    }));
    const useAdapted = adaptOrvalList(useApiHook, { transformFilters });

    renderHook(() =>
      useAdapted({
        pagination: { type: "offset", page: 1, limit: 10 },
        filters: { "status.equals": "active" },
      }),
    );

    expect(transformFilters).toHaveBeenCalledWith({ "status.equals": "active" });
    const callArgs = useApiHook.mock.calls[0][0];
    expect(callArgs.transformed).toBe(true);
  });

  it("handles loading state from hook", () => {
    const useApiHook = vi.fn().mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });
    const useAdapted = adaptOrvalList(useApiHook);

    const { result } = renderHook(() => useAdapted());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
  });

  it("handles error state from hook", () => {
    const err = new Error("fetch failed");
    const useApiHook = vi.fn().mockReturnValue({
      data: undefined,
      isLoading: false,
      error: err,
    });
    const useAdapted = adaptOrvalList(useApiHook);

    const { result } = renderHook(() => useAdapted());

    expect(result.current.error).toBe(err);
  });
});
