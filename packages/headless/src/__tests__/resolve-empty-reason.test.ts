import { describe, it, expect } from "vitest";

import { resolveEmptyReason } from "../resolve-empty-reason";

const settled = { hasRows: false, isLoading: false, error: null };

describe("resolveEmptyReason", () => {
  it("returns null when rows are present", () => {
    expect(resolveEmptyReason({ ...settled, hasRows: true })).toBeNull();
  });

  it("returns null while the first load is in flight", () => {
    expect(resolveEmptyReason({ ...settled, isLoading: true })).toBeNull();
  });

  it("returns 'error' for a settled rejection", () => {
    expect(resolveEmptyReason({ ...settled, error: new Error("boom") })).toBe("error");
  });

  it("returns 'unavailable' for a paused query", () => {
    expect(resolveEmptyReason({ ...settled, isPaused: true })).toBe("unavailable");
  });

  it("returns 'unavailable' while a retry is pending", () => {
    expect(resolveEmptyReason({ ...settled, failureCount: 1 })).toBe("unavailable");
  });

  it("ranks a non-success state above the search and filter reasons", () => {
    expect(
      resolveEmptyReason({ ...settled, isPaused: true, hasSearch: true, hasFilters: true }),
    ).toBe("unavailable");
  });

  it("returns 'no-search' for a settled empty result with a search term", () => {
    expect(resolveEmptyReason({ ...settled, hasSearch: true })).toBe("no-search");
  });

  it("returns 'no-filter' for a settled empty result with active filters", () => {
    expect(resolveEmptyReason({ ...settled, hasFilters: true })).toBe("no-filter");
  });

  it("returns 'no-data' for a settled empty result with no conditions", () => {
    expect(resolveEmptyReason({ ...settled, isPaused: false, failureCount: 0 })).toBe("no-data");
  });
});
