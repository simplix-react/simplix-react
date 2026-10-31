import { describe, expect, it } from "vitest";

import { buildSearchableParams, SEARCHABLE_KEYWORD_PARAM } from "../build-searchable-params";

describe("buildSearchableParams", () => {
  it("sends a sort when the state names a field and a direction", () => {
    const params = buildSearchableParams({ sort: { field: "endpointName", direction: "asc" } });
    expect(params.sort).toEqual(["endpointName.asc"]);
  });

  // The defect this guards: a sort state that exists while its field is still undefined used to
  // pass a truthiness check on the object and serialise as the literal `undefined.undefined`. The
  // server's parser matches `field.asc` / `field.desc` and rejects everything else, so every list
  // holding such a state answered 400 the moment it loaded — and the object being present is
  // exactly what makes the emptiness invisible to a guard that only asks whether it is there.
  it("sends no sort when the state has no field", () => {
    const params = buildSearchableParams({
      sort: { field: undefined, direction: undefined } as never,
    });
    expect(params.sort).toBeUndefined();
  });

  it("sends no sort when the state names a field but no direction", () => {
    const params = buildSearchableParams({ sort: { field: "endpointName" } as never });
    expect(params.sort).toBeUndefined();
  });

  it("sends no sort when there is no sort state at all", () => {
    expect(buildSearchableParams({}).sort).toBeUndefined();
  });

  describe("free text", () => {
    it("is dropped when no searchKey is given, since the server refuses a key without an operator", () => {
      const params = buildSearchableParams({ filters: { _search: "kim" } });
      expect(params).toEqual({});
    });

    it("goes out trimmed under the searchKey", () => {
      const params = buildSearchableParams({ filters: { _search: " kim " } }, { searchKey: SEARCHABLE_KEYWORD_PARAM });
      expect(params).toEqual({ keyword: "kim" });
    });

    it("is not sent when it is blank", () => {
      const params = buildSearchableParams({ filters: { _search: "   " } }, { searchKey: SEARCHABLE_KEYWORD_PARAM });
      expect(params).toEqual({});
    });

    it("sits beside the committed filters", () => {
      const params = buildSearchableParams(
        { filters: { _search: "kim", "status.in": ["ACTIVE"] } },
        { searchKey: SEARCHABLE_KEYWORD_PARAM },
      );
      expect(params).toEqual({ keyword: "kim", "status.in": ["ACTIVE"] });
    });

    it("yields to a filter the reader committed on the same key", () => {
      const params = buildSearchableParams(
        { filters: { _search: "kim", "username.contains": "lee" } },
        { searchKey: "username.contains" },
      );
      expect(params).toEqual({ "username.contains": "lee" });
    });

    it("survives a transformFilters that does not pass _search through", () => {
      const params = buildSearchableParams(
        { filters: { _search: "kim", "a.equals": "1" } },
        { searchKey: SEARCHABLE_KEYWORD_PARAM, transformFilters: ({ _search, ...rest }) => rest },
      );
      expect(params).toEqual({ keyword: "kim", "a.equals": "1" });
    });
  });
});
