// @vitest-environment jsdom
import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { type ReactNode } from "react";

vi.mock("../../adapters/router-provider", () => ({
  useRouter: vi.fn().mockReturnValue(null),
}));

import { useUrlSync, type UseUrlSyncOptions } from "../../crud/list/use-url-sync";
import { useRouter } from "../../adapters/router-provider";

const mockedUseRouter = vi.mocked(useRouter);

function createOptions(overrides?: Partial<UseUrlSyncOptions>): UseUrlSyncOptions {
  return {
    filters: { search: "", values: {} },
    sort: null,
    pagination: { page: 1, pageSize: 10, total: 0 },
    setFilters: vi.fn(),
    setSort: vi.fn(),
    setPage: vi.fn(),
    ...overrides,
  };
}

describe("useUrlSync", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockedUseRouter.mockReturnValue(null);
    // Reset location
    Object.defineProperty(globalThis, "location", {
      value: { search: "", pathname: "/test" },
      writable: true,
    });
    Object.defineProperty(globalThis, "history", {
      value: { replaceState: vi.fn() },
      writable: true,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("reads initial state from URL search params on mount", () => {
    Object.defineProperty(globalThis, "location", {
      value: { search: "?q=hello&sort=name:desc&page=3&filters[status]=active", pathname: "/list" },
      writable: true,
    });

    const opts = createOptions();
    renderHook(() => useUrlSync(opts));

    expect(opts.setFilters).toHaveBeenCalledWith({
      search: "hello",
      values: { status: "active" },
    });
    expect(opts.setSort).toHaveBeenCalledWith("name", "desc");
    expect(opts.setPage).toHaveBeenCalledWith(3);
  });

  it("does not call setters when URL has no params", () => {
    const opts = createOptions();
    renderHook(() => useUrlSync(opts));

    expect(opts.setFilters).not.toHaveBeenCalled();
    expect(opts.setSort).not.toHaveBeenCalled();
    expect(opts.setPage).not.toHaveBeenCalled();
  });

  it("does not call setPage when page is 1", () => {
    Object.defineProperty(globalThis, "location", {
      value: { search: "?page=1", pathname: "/list" },
      writable: true,
    });

    const opts = createOptions();
    renderHook(() => useUrlSync(opts));

    expect(opts.setPage).not.toHaveBeenCalled();
  });

  it("reads from router adapter when available", () => {
    const mockRouter = {
      navigate: vi.fn(),
      getSearchParams: vi.fn().mockReturnValue(new URLSearchParams("q=test&sort=id:asc&page=2")),
      setSearchParams: vi.fn(),
      useCurrentPath: vi.fn().mockReturnValue("/"),
    };
    mockedUseRouter.mockReturnValue(mockRouter);

    const opts = createOptions();
    renderHook(() => useUrlSync(opts));

    expect(mockRouter.getSearchParams).toHaveBeenCalled();
    expect(opts.setFilters).toHaveBeenCalledWith({
      search: "test",
      values: {},
    });
    expect(opts.setSort).toHaveBeenCalledWith("id", "asc");
    expect(opts.setPage).toHaveBeenCalledWith(2);
  });

  it("only reads URL once (on mount)", () => {
    Object.defineProperty(globalThis, "location", {
      value: { search: "?q=hello", pathname: "/list" },
      writable: true,
    });

    const opts = createOptions();
    const { rerender } = renderHook(() => useUrlSync(opts));

    // Reset mock to verify it's not called again
    (opts.setFilters as ReturnType<typeof vi.fn>).mockClear();
    rerender();

    expect(opts.setFilters).not.toHaveBeenCalled();
  });
});
