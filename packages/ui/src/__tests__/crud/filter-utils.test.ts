import { describe, expect, it } from "vitest";

import {
  makeFilterKey,
  parseFilterKey,
  getFilterLayout,
  insertFilterSeparators,
} from "../../crud/filters/filter-utils";

describe("makeFilterKey", () => {
  it("joins field and operator with dot", () => {
    expect(makeFilterKey("name", "contains")).toBe("name.contains");
  });

  it("works with enum values", () => {
    expect(makeFilterKey("status", "equals")).toBe("status.equals");
  });
});

describe("parseFilterKey", () => {
  it("parses field and operator from dotted key", () => {
    expect(parseFilterKey("name.contains")).toEqual({
      field: "name",
      operator: "contains",
    });
  });

  it("returns null for key without dot", () => {
    expect(parseFilterKey("name")).toBeNull();
  });

  it("splits only on first dot", () => {
    const result = parseFilterKey("a.b.c");
    expect(result).toEqual({ field: "a", operator: "b.c" });
  });
});

describe("getFilterLayout", () => {
  it("returns empty array for 0 filters", () => {
    expect(getFilterLayout(0)).toEqual([]);
  });

  it("returns single row for 1-3 filters", () => {
    expect(getFilterLayout(1)).toEqual([1]);
    expect(getFilterLayout(2)).toEqual([2]);
    expect(getFilterLayout(3)).toEqual([3]);
  });

  it("returns two rows for 4-6 filters", () => {
    expect(getFilterLayout(4)).toEqual([2, 2]);
    expect(getFilterLayout(5)).toEqual([3, 2]);
    expect(getFilterLayout(6)).toEqual([3, 3]);
  });

  it("returns multiple rows for larger counts", () => {
    const layout = getFilterLayout(8);
    const total = layout.reduce((a, b) => a + b, 0);
    expect(total).toBe(8);
    for (const row of layout) {
      expect(row).toBeGreaterThanOrEqual(1);
      expect(row).toBeLessThanOrEqual(4);
    }
  });

  it("returns empty array for negative input", () => {
    expect(getFilterLayout(-1)).toEqual([]);
  });
});

describe("insertFilterSeparators", () => {
  it("returns filters as-is for single row", () => {
    const filters = [
      { type: "text", name: "a" },
      { type: "text", name: "b" },
    ];
    const result = insertFilterSeparators(filters);
    expect(result).toEqual(filters);
  });

  it("inserts separators between rows", () => {
    const filters = [
      { type: "text", name: "a" },
      { type: "text", name: "b" },
      { type: "text", name: "c" },
      { type: "text", name: "d" },
      { type: "text", name: "e" },
    ];
    const result = insertFilterSeparators(filters);
    // Layout: [3, 2] => 3 items + separator + 2 items = 6 total
    const separators = result.filter((item) => item.type === "separator");
    expect(separators).toHaveLength(1);
    expect(result).toHaveLength(6);
  });

  it("returns empty array for no filters", () => {
    expect(insertFilterSeparators([])).toEqual([]);
  });
});
