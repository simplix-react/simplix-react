// @vitest-environment jsdom
import { renderHook, act } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { useServerSearchOptions } from "../../crud/list/use-server-search-options";

function makeSearchHook(data: unknown) {
  return vi.fn().mockReturnValue({ data, isLoading: false });
}

function makeLoadingHook() {
  return vi.fn().mockReturnValue({ data: undefined, isLoading: true });
}

describe("useServerSearchOptions", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns empty options and false isLoading when query is below minQueryLength", () => {
    const useHook = makeSearchHook({ content: [{ id: "1", name: "Alpha" }] });
    const { result } = renderHook(() =>
      useServerSearchOptions(useHook, {
        searchField: "name",
        toOption: (item: { id: string; name: string }) => ({ label: item.name, value: item.id }),
      }),
    );
    // initial state — no query set yet
    expect(result.current.options).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });

  it("debounces the query by debounceMs before triggering search", () => {
    const useHook = makeSearchHook({ content: [] });
    const { result } = renderHook(() =>
      useServerSearchOptions(useHook, {
        searchField: "name",
        toOption: (item: { id: string; name: string }) => ({ label: item.name, value: item.id }),
        debounceMs: 300,
      }),
    );

    act(() => result.current.onSearch("ab"));
    // hook not yet called with search params — debounce has not elapsed
    expect(useHook).not.toHaveBeenCalledWith(
      expect.objectContaining({ "name.contains": "ab" }),
      expect.anything(),
    );

    act(() => { vi.advanceTimersByTime(300); });
    expect(useHook).toHaveBeenCalledWith(
      expect.objectContaining({ "name.contains": "ab", page: "0", size: "20" }),
      expect.anything(),
    );
  });

  it("maps Page.content items through toOption", () => {
    const useHook = makeSearchHook({ content: [{ id: "1", name: "Alpha" }, { id: "2", name: "Beta" }] });
    const { result } = renderHook(() =>
      useServerSearchOptions(useHook, {
        searchField: "name",
        toOption: (item: { id: string; name: string }) => ({ label: item.name, value: item.id }),
        minQueryLength: 0,
      }),
    );
    act(() => { vi.advanceTimersByTime(300); });
    expect(result.current.options).toEqual([
      { label: "Alpha", value: "1" },
      { label: "Beta", value: "2" },
    ]);
  });

  it("prepends selectedOption when its value is not in search results", () => {
    const useHook = makeSearchHook({ content: [{ id: "2", name: "Beta" }] });
    const selectedOption = { label: "Alpha", value: "1" };
    const { result } = renderHook(() =>
      useServerSearchOptions(useHook, {
        searchField: "name",
        toOption: (item: { id: string; name: string }) => ({ label: item.name, value: item.id }),
        selectedOption,
        minQueryLength: 0,
      }),
    );
    act(() => { vi.advanceTimersByTime(300); });
    expect(result.current.options[0]).toEqual(selectedOption);
    expect(result.current.options).toHaveLength(2);
  });

  it("does not prepend selectedOption when its value is already in results", () => {
    const useHook = makeSearchHook({ content: [{ id: "1", name: "Alpha" }] });
    const selectedOption = { label: "Alpha", value: "1" };
    const { result } = renderHook(() =>
      useServerSearchOptions(useHook, {
        searchField: "name",
        toOption: (item: { id: string; name: string }) => ({ label: item.name, value: item.id }),
        selectedOption,
        minQueryLength: 0,
      }),
    );
    act(() => { vi.advanceTimersByTime(300); });
    expect(result.current.options).toHaveLength(1);
  });

  it("passes staleTime 30000 and gcTime 300000 to Orval hook", () => {
    const useHook = makeSearchHook({ content: [] });
    renderHook(() =>
      useServerSearchOptions(useHook, {
        searchField: "name",
        toOption: (item: { id: string; name: string }) => ({ label: item.name, value: item.id }),
        minQueryLength: 0,
      }),
    );
    act(() => { vi.advanceTimersByTime(300); });
    expect(useHook).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        query: expect.objectContaining({ staleTime: 30_000, gcTime: 300_000 }),
      }),
    );
  });

  it("passes static params alongside search params", () => {
    const useHook = makeSearchHook({ content: [] });
    const { result } = renderHook(() =>
      useServerSearchOptions(useHook, {
        searchField: "name",
        toOption: (item: { id: string; name: string }) => ({ label: item.name, value: item.id }),
        params: { status: "ACTIVE" },
        minQueryLength: 0,
      }),
    );
    act(() => { result.current.onSearch("a"); });
    act(() => { vi.advanceTimersByTime(300); });
    expect(useHook).toHaveBeenCalledWith(
      expect.objectContaining({ status: "ACTIVE", "name.contains": "a" }),
      expect.anything(),
    );
  });

  it("reflects isLoading true when query is active and Orval hook is loading", () => {
    const useHook = makeLoadingHook();
    const { result } = renderHook(() =>
      useServerSearchOptions(useHook, {
        searchField: "name",
        toOption: (item: { id: string; name: string }) => ({ label: item.name, value: item.id }),
        minQueryLength: 0,
      }),
    );
    act(() => { vi.advanceTimersByTime(300); });
    expect(result.current.isLoading).toBe(true);
  });
});
