import { describe, expect, it } from "vitest";

import { contractFiltersOf, contractKindOf, parseZodType, type FieldInfo, type FilterFieldInfo } from "../commands/scaffold-crud.js";

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

describe("audit stamp filters", () => {
  const stamp = { name: "createdAt", tsType: "string" } as FieldInfo;
  const period = { filterKey: "createdAt.between", component: "DateRangeFilter", label: "createdAt", field: "createdAt" } as FilterFieldInfo;
  it("are left out, except the stamp the list opens sorted by", () => {
    expect(contractFiltersOf([period], [stamp])).toEqual([]);
    expect(contractFiltersOf([period], [stamp], "createdAt")).toEqual([{ kind: "dateRange", field: "createdAt", dateOnly: false }]);
    expect(contractFiltersOf([period], [stamp], "occurredAt")).toEqual([]);
  });
});

describe("secret fields", () => {
  it("are their own contract kind, so a form offers them empty and never shows the stored value", () => {
    expect(contractKindOf({ name: "apiKey", tsType: "string", secret: true, options: [] } as unknown as FieldInfo)).toBe("secret");
    expect(contractKindOf({ name: "apiKey", tsType: "string", options: [] } as unknown as FieldInfo)).toBe("text");
  });
});

describe("structured fields", () => {
  it("are drawn as JSON, while an i18n map and plain text keep their own kinds", () => {
    expect(contractKindOf({ name: "payload", tsType: "Record<string, unknown>", options: [] } as unknown as FieldInfo)).toBe("json");
    expect(contractKindOf({ name: "nameI18n", tsType: "Record<string, string>", baseFieldName: "name", options: [] } as unknown as FieldInfo)).toBe("i18nText");
    expect(contractKindOf({ name: "note", tsType: "string", options: [] } as unknown as FieldInfo)).toBe("text");
  });
});

describe("a record schema", () => {
  it("of anything but strings is a structured value, and of strings stays the i18n map", () => {
    expect(parseZodType("z.record(z.string(), z.unknown()).optional()").tsType).toBe("Record<string, unknown>");
    expect(parseZodType("z.record(z.string(), z.string()).optional()").tsType).toBe("Record<string, string>");
    expect(contractKindOf({ name: "payload", ...parseZodType("z.record(z.string(), z.unknown())") } as unknown as FieldInfo)).toBe("json");
  });
});
