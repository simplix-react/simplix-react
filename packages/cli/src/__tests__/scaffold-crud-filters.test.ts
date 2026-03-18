import { describe, it, expect } from "vitest";
import { parseFilterParams } from "../commands/scaffold-crud.js";
import type { EntityField, QueryParam } from "../openapi/types.js";

function makeField(overrides: Partial<EntityField> = {}): EntityField {
  return {
    name: "field",
    snakeName: "field",
    type: "string",
    required: false,
    nullable: false,
    zodType: "",
    ...overrides,
  };
}

function makeParam(name: string, type = "string"): QueryParam {
  return { name, type, required: false };
}

describe("parseFilterParams", () => {
  it("returns empty for no query params", () => {
    expect(parseFilterParams([], [])).toEqual([]);
  });

  it("skips system params (page, size, sort, ids)", () => {
    const params = [makeParam("page"), makeParam("size"), makeParam("sort"), makeParam("ids")];
    expect(parseFilterParams(params, [])).toEqual([]);
  });

  it("skips id sub-params", () => {
    const params = [makeParam("id.equals"), makeParam("id.in")];
    expect(parseFilterParams(params, [])).toEqual([]);
  });

  it("skips audit field prefixes", () => {
    const params = [
      makeParam("createdBy.equals"),
      makeParam("updatedBy.contains"),
      makeParam("deletedTimestamp.greaterThanOrEqualTo"),
    ];
    expect(parseFilterParams(params, [])).toEqual([]);
  });

  it("detects boolean field as ToggleFilter", () => {
    const fields = [makeField({ name: "active", type: "boolean" })];
    const params = [makeParam("active.equals")];
    const result = parseFilterParams(params, fields);
    expect(result).toHaveLength(1);
    expect(result[0].component).toBe("ToggleFilter");
    expect(result[0].valueType).toBe("boolean");
  });

  it("detects country field with .in as CountryFilter", () => {
    const fields = [makeField({ name: "countryCode", type: "string" })];
    const params = [makeParam("countryCode.in")];
    const result = parseFilterParams(params, fields);
    expect(result).toHaveLength(1);
    expect(result[0].component).toBe("CountryFilter");
    expect(result[0].valueType).toBe("array");
  });

  it("detects timezone field with .in as TimezoneFilter", () => {
    const fields = [makeField({ name: "timezone", type: "string" })];
    const params = [makeParam("timezone.in")];
    const result = parseFilterParams(params, fields);
    expect(result).toHaveLength(1);
    expect(result[0].component).toBe("TimezoneFilter");
    expect(result[0].valueType).toBe("array");
  });

  it("detects timezone field with .contains as TimezoneFilter", () => {
    const fields = [makeField({ name: "timeZone", type: "string" })];
    const params = [makeParam("timeZone.contains")];
    const result = parseFilterParams(params, fields);
    expect(result).toHaveLength(1);
    expect(result[0].component).toBe("TimezoneFilter");
    expect(result[0].valueType).toBe("string");
  });

  it("detects .in operator as FacetedFilter", () => {
    const fields = [makeField({ name: "status", type: "string", enum: ["active", "inactive"] })];
    const params = [makeParam("status.in")];
    const result = parseFilterParams(params, fields);
    expect(result).toHaveLength(1);
    expect(result[0].component).toBe("FacetedFilter");
    expect(result[0].options).toEqual(["active", "inactive"]);
    expect(result[0].valueType).toBe("array");
  });

  it("detects date field with gte+lte as DateRangeFilter", () => {
    const fields = [makeField({ name: "createdAt", type: "string", format: "date-time" })];
    const params = [
      makeParam("createdAt.greaterThanOrEqualTo"),
      makeParam("createdAt.lessThanOrEqualTo"),
    ];
    const result = parseFilterParams(params, fields);
    expect(result).toHaveLength(1);
    expect(result[0].component).toBe("DateRangeFilter");
    expect(result[0].valueType).toBe("dateRange");
    expect(result[0].pairedKey).toBe("createdAt.lessThanOrEqualTo");
  });

  it("detects date-like field by name suffix", () => {
    const fields = [makeField({ name: "startDate" })];
    const params = [
      makeParam("startDate.greaterThanOrEqualTo"),
      makeParam("startDate.lessThanOrEqualTo"),
    ];
    const result = parseFilterParams(params, fields);
    expect(result).toHaveLength(1);
    expect(result[0].component).toBe("DateRangeFilter");
  });

  it("detects number field with comparison as NumberFilter", () => {
    const fields = [makeField({ name: "age", type: "integer" })];
    const params = [makeParam("age.greaterThanOrEqualTo"), makeParam("age.lessThanOrEqualTo")];
    const result = parseFilterParams(params, fields);
    expect(result).toHaveLength(1);
    expect(result[0].component).toBe("NumberFilter");
    expect(result[0].valueType).toBe("number");
  });

  it("detects .contains as TextFilter", () => {
    const fields = [makeField({ name: "name" })];
    const params = [makeParam("name.contains"), makeParam("name.equals")];
    const result = parseFilterParams(params, fields);
    expect(result).toHaveLength(1);
    expect(result[0].component).toBe("TextFilter");
    expect(result[0].operator).toBe("contains");
    expect(result[0].textOperators).toContain("contains");
    expect(result[0].textOperators).toContain("equals");
  });

  it("detects .equals with enum as FacetedFilter", () => {
    const fields = [makeField({ name: "role", type: "string", enum: ["admin", "user"] })];
    const params = [makeParam("role.equals")];
    const result = parseFilterParams(params, fields);
    expect(result).toHaveLength(1);
    expect(result[0].component).toBe("FacetedFilter");
    expect(result[0].options).toEqual(["admin", "user"]);
  });

  it("detects .equals without enum as TextFilter", () => {
    const fields = [makeField({ name: "email" })];
    const params = [makeParam("email.equals")];
    const result = parseFilterParams(params, fields);
    expect(result).toHaveLength(1);
    expect(result[0].component).toBe("TextFilter");
    expect(result[0].operator).toBe("equals");
  });

  it("handles multiple fields with mixed filter types", () => {
    const fields = [
      makeField({ name: "name" }),
      makeField({ name: "active", type: "boolean" }),
      makeField({ name: "status", type: "string", enum: ["active", "inactive"] }),
    ];
    const params = [
      makeParam("name.contains"),
      makeParam("active.equals"),
      makeParam("status.in"),
    ];
    const result = parseFilterParams(params, fields);
    expect(result).toHaveLength(3);
    expect(result.map((f) => f.component).sort()).toEqual(["FacetedFilter", "TextFilter", "ToggleFilter"]);
  });

  it("handles params with no matching entity field", () => {
    const params = [makeParam("unknown.contains")];
    const result = parseFilterParams(params, []);
    expect(result).toHaveLength(1);
    expect(result[0].component).toBe("TextFilter");
    expect(result[0].field).toBe("unknown");
  });

  it("detects double format as number", () => {
    const fields = [makeField({ name: "price", type: "number", format: "double" })];
    const params = [makeParam("price.greaterThan")];
    const result = parseFilterParams(params, fields);
    expect(result).toHaveLength(1);
    expect(result[0].component).toBe("NumberFilter");
  });
});
