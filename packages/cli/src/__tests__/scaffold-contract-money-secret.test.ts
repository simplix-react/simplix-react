import { describe, expect, it } from "vitest";

import { contractFiltersOf, contractKindOf, type FieldInfo, type FilterFieldInfo } from "../commands/scaffold-crud.js";

const amount = { name: "amountUsdMicros", tsType: "number", money: { currency: "USD", scale: 6 } } as FieldInfo;
const units = { name: "units", tsType: "number" } as FieldInfo;

function numberFilter(field: string): FilterFieldInfo {
  return { filterKey: `${field}.equals`, component: "NumberFilter", label: field, field } as FilterFieldInfo;
}

describe("money list filters", () => {
  it("carry the field's currency and scale, and a plain number carries neither", () => {
    const out = contractFiltersOf([numberFilter("amountUsdMicros"), numberFilter("units")], [amount, units]);
    expect(out).toEqual([
      { kind: "number", field: "amountUsdMicros", money: { currency: "USD", scale: 6 } },
      { kind: "number", field: "units" },
    ]);
  });
});

describe("secret fields", () => {
  it("are their own contract kind, so a form offers them empty and never shows the stored value", () => {
    expect(contractKindOf({ name: "apiKey", tsType: "string", secret: true, options: [] } as unknown as FieldInfo)).toBe("secret");
    expect(contractKindOf({ name: "apiKey", tsType: "string", options: [] } as unknown as FieldInfo)).toBe("text");
  });
});
