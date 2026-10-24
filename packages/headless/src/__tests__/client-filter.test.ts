import { describe, expect, it } from "vitest";

import { matchesFilter } from "../client-filter";

const row = { name: "김안전", role: "SAFETY", rank: 3, active: true, note: null };

describe("matchesFilter", () => {
  it("reads an operator key against the field it names", () => {
    expect(matchesFilter(row, "name.contains", "안전")).toBe(true);
    expect(matchesFilter(row, "name.contains", "보건")).toBe(false);
    expect(matchesFilter(row, "name.equals", "김안전")).toBe(true);
  });

  it("narrows by a chip row's array", () => {
    expect(matchesFilter(row, "role.in", ["HEALTH", "SAFETY"])).toBe(true);
    expect(matchesFilter(row, "role.in", ["HEALTH"])).toBe(false);
    expect(matchesFilter(row, "role.notIn", ["HEALTH"])).toBe(true);
  });

  it("compares ranges and presence", () => {
    expect(matchesFilter(row, "rank.greaterThanOrEqualTo", 3)).toBe(true);
    expect(matchesFilter(row, "rank.lessThan", 3)).toBe(false);
    expect(matchesFilter(row, "rank.between", [1, 5])).toBe(true);
    expect(matchesFilter(row, "note.isNull", true)).toBe(true);
    expect(matchesFilter(row, "active.isTrue", true)).toBe(true);
  });

  it("keeps every row for an empty value and compares a plain key for equality", () => {
    expect(matchesFilter(row, "role.in", [])).toBe(true);
    expect(matchesFilter(row, "name.contains", "")).toBe(true);
    expect(matchesFilter(row, "role", "SAFETY")).toBe(true);
    expect(matchesFilter(row, "role", "HEALTH")).toBe(false);
  });
});
