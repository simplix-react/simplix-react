// @vitest-environment jsdom
import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

import { useOrvalOptions } from "../../crud/list/use-orval-options";

describe("useOrvalOptions", () => {
  it("maps paginated content to options", () => {
    const mockHook = vi.fn(() => ({
      data: {
        content: [
          { id: 1, name: "Alpha" },
          { id: 2, name: "Beta" },
        ],
      },
      isLoading: false,
    }));

    const { result } = renderHook(() =>
      useOrvalOptions(mockHook, {
        toOption: (item: { id: number; name: string }) => ({
          label: item.name,
          value: String(item.id),
        }),
      }),
    );

    expect(result.current.options).toEqual([
      { label: "Alpha", value: "1" },
      { label: "Beta", value: "2" },
    ]);
    expect(result.current.isLoading).toBe(false);
  });

  it("returns empty options when data is null", () => {
    const mockHook = vi.fn(() => ({
      data: null,
      isLoading: false,
    }));

    const { result } = renderHook(() =>
      useOrvalOptions(mockHook, {
        toOption: (item: { id: number; name: string }) => ({
          label: item.name,
          value: String(item.id),
        }),
      }),
    );

    expect(result.current.options).toEqual([]);
  });

  it("returns empty options when data is undefined", () => {
    const mockHook = vi.fn(() => ({
      data: undefined,
      isLoading: true,
    }));

    const { result } = renderHook(() =>
      useOrvalOptions(mockHook, {
        toOption: (item: { id: number; name: string }) => ({
          label: item.name,
          value: String(item.id),
        }),
      }),
    );

    expect(result.current.options).toEqual([]);
    expect(result.current.isLoading).toBe(true);
  });

  it("returns empty options when content is missing", () => {
    const mockHook = vi.fn(() => ({
      data: { totalElements: 0 },
      isLoading: false,
    }));

    const { result } = renderHook(() =>
      useOrvalOptions(mockHook, {
        toOption: (item: { id: number; name: string }) => ({
          label: item.name,
          value: String(item.id),
        }),
      }),
    );

    expect(result.current.options).toEqual([]);
  });

  it("uses default params when none provided", () => {
    const mockHook = vi.fn(() => ({
      data: { content: [] },
      isLoading: false,
    }));

    renderHook(() =>
      useOrvalOptions(mockHook, {
        toOption: (item: { id: number; name: string }) => ({
          label: item.name,
          value: String(item.id),
        }),
      }),
    );

    expect(mockHook).toHaveBeenCalledWith({ page: 0, size: 100 });
  });

  it("forwards custom params to the query hook", () => {
    const mockHook = vi.fn(() => ({
      data: { content: [] },
      isLoading: false,
    }));

    renderHook(() =>
      useOrvalOptions(mockHook, {
        toOption: (item: { id: number; name: string }) => ({
          label: item.name,
          value: String(item.id),
        }),
        params: { page: 0, size: 50, sort: "name,asc" },
      }),
    );

    expect(mockHook).toHaveBeenCalledWith({ page: 0, size: 50, sort: "name,asc" });
  });

  it("includes icon in option when toOption returns one", () => {
    const mockHook = vi.fn(() => ({
      data: {
        content: [{ id: 1, name: "Alpha", icon: "star" }],
      },
      isLoading: false,
    }));

    const { result } = renderHook(() =>
      useOrvalOptions(mockHook, {
        toOption: (item: { id: number; name: string; icon: string }) => ({
          label: item.name,
          value: String(item.id),
          icon: item.icon,
        }),
      }),
    );

    expect(result.current.options[0].icon).toBe("star");
  });

  it("reflects isLoading state from the query hook", () => {
    const mockHook = vi.fn(() => ({
      data: undefined,
      isLoading: true,
    }));

    const { result } = renderHook(() =>
      useOrvalOptions(mockHook, {
        toOption: (item: { id: number; name: string }) => ({
          label: item.name,
          value: String(item.id),
        }),
      }),
    );

    expect(result.current.isLoading).toBe(true);
  });
});
