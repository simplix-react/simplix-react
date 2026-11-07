import { describe, expect, it } from "vitest";

import {
  validateCrudSearch,
  parseCrudSearch,
  buildCrudSearch,
} from "../../crud/patterns/crud-search";

describe("validateCrudSearch", () => {
  it("extracts id when it is a string", () => {
    expect(validateCrudSearch({ id: "123" })).toEqual({ id: "123", mode: undefined });
  });

  it("ignores id when it is not a string", () => {
    expect(validateCrudSearch({ id: 123 })).toEqual({ id: undefined, mode: undefined });
  });

  it("extracts mode 'new'", () => {
    expect(validateCrudSearch({ mode: "new" })).toEqual({ id: undefined, mode: "new" });
  });

  it("extracts mode 'edit'", () => {
    expect(validateCrudSearch({ mode: "edit" })).toEqual({ id: undefined, mode: "edit" });
  });

  it("ignores invalid mode", () => {
    expect(validateCrudSearch({ mode: "delete" })).toEqual({ id: undefined, mode: undefined });
  });

  it("returns both id and mode", () => {
    expect(validateCrudSearch({ id: "42", mode: "edit" })).toEqual({ id: "42", mode: "edit" });
  });

  it("returns empty for empty search", () => {
    expect(validateCrudSearch({})).toEqual({ id: undefined, mode: undefined });
  });
});

describe("parseCrudSearch", () => {
  it("returns 'list' view for empty search", () => {
    expect(parseCrudSearch({})).toEqual({ view: "list" });
  });

  it("returns 'new' view when mode is new", () => {
    expect(parseCrudSearch({ mode: "new" })).toEqual({ view: "new" });
  });

  it("returns 'edit' view with id when mode is edit and id exists", () => {
    expect(parseCrudSearch({ id: "42", mode: "edit" })).toEqual({
      view: "edit",
      selectedId: "42",
    });
  });

  it("returns 'detail' view with id when only id is present", () => {
    expect(parseCrudSearch({ id: "42" })).toEqual({
      view: "detail",
      selectedId: "42",
    });
  });

  it("returns 'new' view even when id is present (mode takes priority)", () => {
    expect(parseCrudSearch({ id: "42", mode: "new" })).toEqual({ view: "new" });
  });

  it("returns 'list' view when mode is edit but no id", () => {
    expect(parseCrudSearch({ mode: "edit" })).toEqual({ view: "list" });
  });
});

describe("buildCrudSearch", () => {
  it("builds empty search for list view", () => {
    expect(buildCrudSearch("list")).toEqual({});
  });

  it("builds search for new view", () => {
    expect(buildCrudSearch("new")).toEqual({ mode: "new" });
  });

  it("builds search for edit view with id", () => {
    expect(buildCrudSearch("edit", "42")).toEqual({ id: "42", mode: "edit" });
  });

  it("builds search for detail view with id", () => {
    expect(buildCrudSearch("detail", "42")).toEqual({ id: "42" });
  });

  it("returns empty for edit without id", () => {
    expect(buildCrudSearch("edit")).toEqual({});
  });

  it("returns empty for detail without id", () => {
    expect(buildCrudSearch("detail")).toEqual({});
  });
});

describe("the open tab is addressable", () => {
  // A reader who reloads, or who sends somebody the link, is looking at a tab and expects to still
  // be looking at it. Thirty-eight screens of one console held it in useState and lost it on
  // every reload.
  it("reads a tab out of the search", () => {
    expect(validateCrudSearch({ tab: "history" }).tab).toBe("history");
    expect(validateCrudSearch({ tab: 3 }).tab).toBeUndefined();
  });

  it("carries the tab through every view", () => {
    expect(buildCrudSearch("list", undefined, "history")).toEqual({ tab: "history" });
    expect(buildCrudSearch("detail", "7", "history")).toEqual({ id: "7", tab: "history" });
    expect(buildCrudSearch("edit", "7", "history")).toEqual({ id: "7", mode: "edit", tab: "history" });
    expect(buildCrudSearch("new", undefined, "history")).toEqual({ mode: "new", tab: "history" });
  });

  it("says nothing about a tab where a page has none", () => {
    expect(buildCrudSearch("list")).toEqual({});
    expect(buildCrudSearch("detail", "7")).toEqual({ id: "7" });
  });
});

describe("the list filters are addressable", () => {
  // A tile reading "4 failed jobs" opens the list it counts only if the address can carry the
  // filter, and a reader who reloads or shares the link expects to still be looking at it.
  it("keeps a string and an array of strings, and a one-element array stays an array", () => {
    expect(validateCrudSearch({ filters: { "status.equals": "FAILED", "kind.in": ["A", "B"], "type.in": ["A"] } }).filters).toEqual({
      "status.equals": "FAILED",
      "kind.in": ["A", "B"],
      "type.in": ["A"],
    });
  });

  it("has no filters when the search names none", () => {
    expect(validateCrudSearch({}).filters).toBeUndefined();
    expect(validateCrudSearch({ filters: {} }).filters).toBeUndefined();
  });

  it("drops a filters value that is not an object, without throwing", () => {
    for (const filters of ["status.in=A", 3, true, null, ["status.in"], undefined]) {
      expect(() => validateCrudSearch({ filters })).not.toThrow();
      expect(validateCrudSearch({ filters }).filters).toBeUndefined();
    }
  });

  it("drops a value that is a number, a boolean, a nested object or an array holding one", () => {
    expect(
      validateCrudSearch({
        filters: {
          "a.equals": 5,
          "b.equals": true,
          "c.equals": { nested: "x" },
          "d.in": ["x", 2],
          "e.in": [["x"]],
          "f.equals": null,
          "keep.equals": "kept",
        },
      }).filters,
    ).toEqual({ "keep.equals": "kept" });
  });

  it("drops an empty value, an empty array and an empty member, so nothing sends a blank condition", () => {
    expect(validateCrudSearch({ filters: { "a.equals": "", "b.in": [], "c.in": ["", "x"], "d.in": [""] } }).filters).toEqual({
      "c.in": ["x"],
    });
  });

  it("never lets a filter use a key that addresses the view", () => {
    expect(validateCrudSearch({ filters: { id: "9", mode: "new", tab: "t", "status.in": ["A"] } }).filters).toEqual({
      "status.in": ["A"],
    });
    expect(validateCrudSearch({ filters: { id: "9", mode: "new", tab: "t" } }).filters).toBeUndefined();
  });

  it("leaves id, mode and tab as they were read", () => {
    expect(validateCrudSearch({ id: "7", mode: "edit", tab: "log", filters: { id: "x", "status.in": ["A"] } })).toEqual({
      id: "7",
      mode: "edit",
      tab: "log",
      filters: { "status.in": ["A"] },
    });
  });

  it("keeps a key named __proto__ as data", () => {
    const parsed = validateCrudSearch(JSON.parse('{"filters":{"__proto__":"x","a.equals":"y"}}'));
    expect(Object.getPrototypeOf(parsed.filters)).toBe(Object.prototype);
    expect(Object.keys(parsed.filters ?? {})).toEqual(["__proto__", "a.equals"]);
  });

  it("carries the filters through every view", () => {
    const filters = { "status.in": ["FAILED"] };
    expect(buildCrudSearch("list", undefined, undefined, filters)).toEqual({ filters });
    expect(buildCrudSearch("detail", "7", "history", filters)).toEqual({ id: "7", tab: "history", filters });
    expect(buildCrudSearch("edit", "7", undefined, filters)).toEqual({ id: "7", mode: "edit", filters });
    expect(buildCrudSearch("new", undefined, "history", filters)).toEqual({ mode: "new", tab: "history", filters });
  });

  it("says nothing about filters where the page has none", () => {
    expect(buildCrudSearch("list")).toEqual({});
    expect(buildCrudSearch("detail", "7", "history")).toEqual({ id: "7", tab: "history" });
    expect("filters" in buildCrudSearch("detail", "7")).toBe(false);
  });

  it("reads the filters back with the view", () => {
    const filters = { "status.in": ["FAILED"] };
    expect(parseCrudSearch({ filters })).toEqual({ view: "list", filters });
    expect(parseCrudSearch({ id: "7", filters })).toEqual({ view: "detail", selectedId: "7", filters });
    expect(parseCrudSearch({ id: "7", mode: "edit", filters })).toEqual({ view: "edit", selectedId: "7", filters });
    expect(parseCrudSearch({ mode: "new", filters })).toEqual({ view: "new", filters });
  });
});
