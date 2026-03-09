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
