import { describe, expect, it } from "vitest";

import { contractFiltersOf, type FieldInfo, type FilterFieldInfo } from "../commands/scaffold-crud.js";

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
