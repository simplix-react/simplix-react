import { describe, expect, it } from "vitest";

import { listOriginFlags, scaffoldOptionsFromOrigin, textContractFiltersOf, textFilterNames, type FilterFieldInfo } from "../commands/scaffold-crud.js";

function text(field: string, textOperators?: string[]): FilterFieldInfo {
  return { filterKey: `${field}.contains`, component: "TextFilter", label: field, field, textOperators } as FilterFieldInfo;
}
const faceted = { filterKey: "status.in", component: "FacetedFilter", label: "status", field: "status" } as FilterFieldInfo;

describe("the text filters a design names", () => {
  const filters = [text("provider", ["contains", "equals"]), text("planCode", ["equals"]), text("label"), faceted];

  it("become text contract filters in the order the design names them, each with the operators its field accepts", () => {
    expect(textContractFiltersOf(filters, ["planCode", "provider"], "usage-daily-aggregate")).toEqual([
      { kind: "text", field: "planCode", operators: ["equals"] },
      { kind: "text", field: "provider", operators: ["contains", "equals"] },
    ]);
  });

  it("carry no operators for a field whose search states none, and name a field once", () => {
    expect(textContractFiltersOf(filters, ["label", "label"], "x")).toEqual([{ kind: "text", field: "label" }]);
  });

  it("offer nothing when the design names none", () => {
    expect(textContractFiltersOf(filters, [], "x")).toEqual([]);
  });

  it("refuse a name that is not a searchable text field, saying which text fields there are", () => {
    expect(() => textContractFiltersOf(filters, ["status"], "x")).toThrow(/--text-filter names "status", which is not a searchable text field of x \(text fields: provider, planCode, label\)/);
    expect(() => textContractFiltersOf(filters, ["missing"], "x")).toThrow(/"missing"/);
    expect(() => textContractFiltersOf([faceted], ["status"], "x")).toThrow(/text fields: none/);
  });
});

describe("the --text-filter value", () => {
  it("is read as comma separated names, blanks dropped", () => {
    expect(textFilterNames("provider, planCode,,")).toEqual(["provider", "planCode"]);
    expect(textFilterNames(undefined)).toEqual([]);
    expect(textFilterNames("")).toEqual([]);
  });

  it("is recorded in the origin and read back from it, so a regeneration offers the same filters", () => {
    const flags = listOriginFlags({ textFilter: "provider, planCode" });
    expect(flags).toBe(" --text-filter provider,planCode");
    const replayed = scaffoldOptionsFromOrigin(["usage", "--module", "m", ...flags.trim().split(" ")]);
    expect(textFilterNames(replayed.textFilter)).toEqual(["provider", "planCode"]);
    expect(listOriginFlags({})).toBe("");
  });
});
