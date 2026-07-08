import { describe, expect, it } from "vitest";

import { splitFilterColumns, type FilterDef } from "../../crud/filters/filter-bar";
import { SearchOperator } from "../../crud/filters/filter-types";

const text = (field: string, columnBreak?: boolean): FilterDef => ({
  type: "text",
  field,
  label: field,
  operators: [SearchOperator.CONTAINS],
  defaultOperator: SearchOperator.CONTAINS,
  ...(columnBreak ? { columnBreak } : {}),
});

describe("splitFilterColumns", () => {
  it("splits evenly when no columnBreak flag is set", () => {
    const [left, right] = splitFilterColumns([text("a"), text("b"), text("c")]);
    expect(left.map((d) => d.field)).toEqual(["a", "b"]);
    expect(right.map((d) => d.field)).toEqual(["c"]);
  });

  it("starts the second column at the flagged filter", () => {
    const [left, right] = splitFilterColumns([text("a"), text("b", true), text("c"), text("d")]);
    expect(left.map((d) => d.field)).toEqual(["a"]);
    expect(right.map((d) => d.field)).toEqual(["b", "c", "d"]);
  });

  it("ignores a columnBreak flag on the first filter", () => {
    const [left, right] = splitFilterColumns([text("a", true), text("b")]);
    expect(left.map((d) => d.field)).toEqual(["a"]);
    expect(right.map((d) => d.field)).toEqual(["b"]);
  });
});

describe("splitFilterColumns with three columns", () => {
  it("splits evenly into three columns without flags", () => {
    const cols = splitFilterColumns([text("a"), text("b"), text("c"), text("d"), text("e"), text("f")], 3);
    expect(cols.map((c) => c.map((d) => d.field))).toEqual([["a", "b"], ["c", "d"], ["e", "f"]]);
  });

  it("honors up to two columnBreak flags", () => {
    const cols = splitFilterColumns(
      [text("a"), text("b", true), text("c"), text("d", true), text("e")],
      3,
    );
    expect(cols.map((c) => c.map((d) => d.field))).toEqual([["a"], ["b", "c"], ["d", "e"]]);
  });
});

