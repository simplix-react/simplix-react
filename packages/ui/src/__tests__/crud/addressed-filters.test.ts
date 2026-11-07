import { describe, expect, it } from "vitest";

import {
  addressedFiltersKey,
  decodeAddressedFilters,
  encodeAddressedFilters,
} from "../../crud/list/addressed-filters";

describe("decodeAddressedFilters", () => {
  it("reads a membership operator as an array, a lone string included", () => {
    expect(decodeAddressedFilters({ "status.in": "FAILED", "kind.notIn": ["A", "B"] })).toEqual({
      "status.in": ["FAILED"],
      "kind.notIn": ["A", "B"],
    });
  });

  it("leaves every other value as the string it was", () => {
    expect(decodeAddressedFilters({ "name.contains": "kim", "at.greaterThanOrEqualTo": "2026-11-01T00:00:00Z" })).toEqual({
      "name.contains": "kim",
      "at.greaterThanOrEqualTo": "2026-11-01T00:00:00Z",
    });
  });

  it("reads a toggle as the boolean its control commits, and a number filter as a number", () => {
    const controls = [
      { field: "active", type: "toggle" },
      { field: "attempts", type: "number" },
    ] as const;
    expect(decodeAddressedFilters({ "active.equals": "true", "attempts.greaterThan": "3" }, { controls })).toEqual({
      "active.equals": true,
      "attempts.greaterThan": 3,
    });
    expect(decodeAddressedFilters({ "active.equals": "false" }, { controls })).toEqual({ "active.equals": false });
  });

  it("drops what its control could not have committed, rather than sending it", () => {
    const controls = [
      { field: "active", type: "toggle" },
      { field: "attempts", type: "number" },
    ] as const;
    expect(decodeAddressedFilters({ "active.equals": "yes", "attempts.greaterThan": "many", "attempts.lessThan": " " }, { controls })).toEqual({});
  });

  it("keeps a toggle's text without a control to say it is one", () => {
    expect(decodeAddressedFilters({ "active.equals": "true" })).toEqual({ "active.equals": "true" });
  });

  it("drops empty values and a key with no operator", () => {
    expect(decodeAddressedFilters({ "a.equals": "", "b.in": [], "c.in": [""], plain: "x", ".in": "y", "d.": "z" })).toEqual({});
  });

  it("reads nothing as nothing", () => {
    expect(decodeAddressedFilters(undefined)).toEqual({});
    expect(decodeAddressedFilters({})).toEqual({});
  });

  it("splits a key at its last dot, so a dotted field keeps its name", () => {
    expect(decodeAddressedFilters({ "owner.name.in": "kim" })).toEqual({ "owner.name.in": ["kim"] });
  });

  // A tab pins a field with `equals`; the request carries the tab's value over anything the reader
  // chose on that field and the control is hidden, so a filter on it would narrow invisibly.
  it("drops a filter over a field a forced parameter pins with equals, and over a key it sets itself", () => {
    const forced = { "status.equals": "SUSPENDED", "roleIds.in": "r1" };
    expect(
      decodeAddressedFilters(
        { "status.in": ["ACTIVE"], "status.equals": "ACTIVE", "roleIds.in": ["r2"], "roleIds.equals": "r2", "kind.in": ["A"] },
        { forced },
      ),
    ).toEqual({ "roleIds.equals": "r2", "kind.in": ["A"] });
  });

  it("keeps a filter that narrows an axis a forced range leaves open", () => {
    expect(decodeAddressedFilters({ "at.lessThan": "z" }, { forced: { "at.greaterThan": "a" } })).toEqual({ "at.lessThan": "z" });
  });
});

describe("encodeAddressedFilters", () => {
  it("writes strings as they are, numbers and booleans as text, dates as their instant", () => {
    expect(
      encodeAddressedFilters({
        "name.contains": "kim",
        "attempts.greaterThan": 3,
        "active.equals": false,
        "at.lessThan": new Date("2026-11-01T00:00:00.000Z"),
        "status.in": ["A", "B"],
      }),
    ).toEqual({
      "name.contains": "kim",
      "attempts.greaterThan": "3",
      "active.equals": "false",
      "at.lessThan": "2026-11-01T00:00:00.000Z",
      "status.in": ["A", "B"],
    });
  });

  it("leaves out what a request would not send", () => {
    expect(
      encodeAddressedFilters({ "a.equals": undefined, "b.equals": null, "c.equals": "", "d.in": [], "e.equals": { x: 1 }, "f.equals": Number.NaN, "g.equals": new Date("x") }),
    ).toBeUndefined();
  });

  it("keeps a set a set, and writes a lone member under another operator as the value itself", () => {
    expect(encodeAddressedFilters({ "status.in": ["A"], "name.contains": ["a"] })).toEqual({ "status.in": ["A"], "name.contains": "a" });
  });

  it("writes back what it read, for every kind of control", () => {
    const controls = [
      { field: "active", type: "toggle" },
      { field: "attempts", type: "number" },
    ] as const;
    const address = { "status.in": ["A", "B"], "active.equals": "true", "attempts.greaterThan": "3", "name.contains": "kim" };
    expect(encodeAddressedFilters(decodeAddressedFilters(address, { controls }))).toEqual(address);
  });
});

describe("addressedFiltersKey", () => {
  it("is equal for the same filters whatever order the keys were written in", () => {
    expect(addressedFiltersKey({ "a.in": ["1"], "b.equals": "x" })).toBe(addressedFiltersKey({ "b.equals": "x", "a.in": ["1"] }));
  });

  it("tells a different filter, value or member order apart, and none from the empty string", () => {
    expect(addressedFiltersKey({ "a.in": ["1"] })).not.toBe(addressedFiltersKey({ "a.in": ["2"] }));
    expect(addressedFiltersKey({ "a.in": ["1", "2"] })).not.toBe(addressedFiltersKey({ "a.in": ["2", "1"] }));
    expect(addressedFiltersKey({ "a.in": "1" })).not.toBe(addressedFiltersKey({ "a.in": ["1"] }));
    expect(addressedFiltersKey(undefined)).toBe("");
  });
});
