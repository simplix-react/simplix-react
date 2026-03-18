// @vitest-environment jsdom
import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

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

describe("useUrlSync (URL write path)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockedUseRouter.mockReturnValue(null);
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

  it("writes search to URL after state change with debounce", () => {
    const opts = createOptions();
    const { rerender } = renderHook(
      (props: UseUrlSyncOptions) => useUrlSync(props),
      { initialProps: opts },
    );

    // Change filters
    const updatedOpts = {
      ...opts,
      filters: { search: "hello", values: {} },
    };
    rerender(updatedOpts);

    // Before debounce, replaceState not called
    expect(globalThis.history.replaceState).not.toHaveBeenCalled();

    // Advance timers past debounce (300ms)
    vi.advanceTimersByTime(300);

    expect(globalThis.history.replaceState).toHaveBeenCalledWith(
      null,
      "",
      "/test?q=hello",
    );
  });

  it("writes sort to URL", () => {
    const opts = createOptions();
    const { rerender } = renderHook(
      (props: UseUrlSyncOptions) => useUrlSync(props),
      { initialProps: opts },
    );

    rerender({
      ...opts,
      sort: { field: "name", direction: "desc" as const },
    });

    vi.advanceTimersByTime(300);

    expect(globalThis.history.replaceState).toHaveBeenCalledWith(
      null,
      "",
      "/test?sort=name%3Adesc",
    );
  });

  it("writes page to URL when > 1", () => {
    const opts = createOptions();
    const { rerender } = renderHook(
      (props: UseUrlSyncOptions) => useUrlSync(props),
      { initialProps: opts },
    );

    rerender({
      ...opts,
      pagination: { page: 3, pageSize: 10, total: 50 },
    });

    vi.advanceTimersByTime(300);

    expect(globalThis.history.replaceState).toHaveBeenCalledWith(
      null,
      "",
      "/test?page=3",
    );
  });

  it("clears URL params when state is reset", () => {
    const opts = createOptions();
    const { rerender } = renderHook(
      (props: UseUrlSyncOptions) => useUrlSync(props),
      { initialProps: opts },
    );

    // First update
    rerender({
      ...opts,
      filters: { search: "test", values: {} },
    });
    vi.advanceTimersByTime(300);

    // Reset
    rerender(opts);
    vi.advanceTimersByTime(300);

    expect(globalThis.history.replaceState).toHaveBeenLastCalledWith(
      null,
      "",
      "/test",
    );
  });

  it("writes filter values to URL", () => {
    const opts = createOptions();
    const { rerender } = renderHook(
      (props: UseUrlSyncOptions) => useUrlSync(props),
      { initialProps: opts },
    );

    rerender({
      ...opts,
      filters: { search: "", values: { status: "active" } },
    });

    vi.advanceTimersByTime(300);

    const call = (globalThis.history.replaceState as ReturnType<typeof vi.fn>).mock.calls.at(-1);
    expect(call?.[2]).toContain("filters%5Bstatus%5D=active");
  });

  it("writes array filter values to URL", () => {
    const opts = createOptions();
    const { rerender } = renderHook(
      (props: UseUrlSyncOptions) => useUrlSync(props),
      { initialProps: opts },
    );

    rerender({
      ...opts,
      filters: { search: "", values: { tags: ["a", "b"] } },
    });

    vi.advanceTimersByTime(300);

    const call = (globalThis.history.replaceState as ReturnType<typeof vi.fn>).mock.calls.at(-1);
    const url = call?.[2] as string;
    expect(url).toContain("filters%5Btags%5D=a");
    expect(url).toContain("filters%5Btags%5D=b");
  });

  it("uses router adapter when available", () => {
    const setSearchParams = vi.fn();
    mockedUseRouter.mockReturnValue({
      navigate: vi.fn(),
      getSearchParams: vi.fn().mockReturnValue(new URLSearchParams()),
      setSearchParams,
      useCurrentPath: vi.fn().mockReturnValue("/"),
    });

    const opts = createOptions();
    const { rerender } = renderHook(
      (props: UseUrlSyncOptions) => useUrlSync(props),
      { initialProps: opts },
    );

    rerender({
      ...opts,
      filters: { search: "test", values: {} },
    });

    vi.advanceTimersByTime(300);

    expect(setSearchParams).toHaveBeenCalled();
    expect(globalThis.history.replaceState).not.toHaveBeenCalled();
  });

  it("debounces rapid changes (only last state is written)", () => {
    const opts = createOptions();
    const { rerender } = renderHook(
      (props: UseUrlSyncOptions) => useUrlSync(props),
      { initialProps: opts },
    );

    // Rapid changes
    rerender({ ...opts, filters: { search: "a", values: {} } });
    vi.advanceTimersByTime(100);
    rerender({ ...opts, filters: { search: "ab", values: {} } });
    vi.advanceTimersByTime(100);
    rerender({ ...opts, filters: { search: "abc", values: {} } });
    vi.advanceTimersByTime(300);

    // Only the last value should be written
    const calls = (globalThis.history.replaceState as ReturnType<typeof vi.fn>).mock.calls;
    const lastCall = calls.at(-1);
    expect(lastCall?.[2]).toBe("/test?q=abc");
  });

  it("reads multiple filter values from URL on mount", () => {
    Object.defineProperty(globalThis, "location", {
      value: {
        search: "?filters[status]=active&filters[status]=pending",
        pathname: "/list",
      },
      writable: true,
    });

    const opts = createOptions();
    renderHook(() => useUrlSync(opts));

    expect(opts.setFilters).toHaveBeenCalledWith({
      search: "",
      values: { status: ["active", "pending"] },
    });
  });
});
