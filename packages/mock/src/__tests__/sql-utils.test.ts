import { describe, it, expect } from "vitest";
import { toCamelCase, toSnakeCase, mapRow, mapRows } from "../sql/row-mapping.js";
import { buildSetClause } from "../sql/query-building.js";
import { mapPgError } from "../sql/error-mapping.js";

describe("toCamelCase", () => {
  it("converts snake_case to camelCase", () => {
    expect(toCamelCase("created_at")).toBe("createdAt");
    expect(toCamelCase("topology_id")).toBe("topologyId");
  });

  it("handles single word", () => {
    expect(toCamelCase("name")).toBe("name");
  });

  it("handles multiple underscores", () => {
    expect(toCamelCase("door_reader_id")).toBe("doorReaderId");
  });
});

describe("toSnakeCase", () => {
  it("converts camelCase to snake_case", () => {
    expect(toSnakeCase("createdAt")).toBe("created_at");
    expect(toSnakeCase("topologyId")).toBe("topology_id");
  });

  it("handles single word", () => {
    expect(toSnakeCase("name")).toBe("name");
  });
});

describe("mapRow", () => {
  it("converts snake_case keys to camelCase", () => {
    const row = { id: "1", door_name: "Main Door", status: "active" };
    const result = mapRow<{ id: string; doorName: string; status: string }>(row);
    expect(result.doorName).toBe("Main Door");
    expect(result.id).toBe("1");
  });

  it("converts _at columns to Date objects", () => {
    const row = { id: "1", created_at: "2025-01-01T00:00:00Z" };
    const result = mapRow<{ id: string; createdAt: Date }>(row);
    expect(result.createdAt).toBeInstanceOf(Date);
  });

  it("leaves null _at values as null", () => {
    const row = { id: "1", updated_at: null };
    const result = mapRow<{ id: string; updatedAt: null }>(row);
    expect(result.updatedAt).toBeNull();
  });
});

describe("mapRows", () => {
  it("maps array of rows", () => {
    const rows = [
      { id: "1", full_name: "A" },
      { id: "2", full_name: "B" },
    ];
    const result = mapRows<{ id: string; fullName: string }>(rows);
    expect(result).toHaveLength(2);
    expect(result[0].fullName).toBe("A");
    expect(result[1].fullName).toBe("B");
  });

  it("returns empty array for empty input", () => {
    expect(mapRows([])).toEqual([]);
  });
});

describe("buildSetClause", () => {
  it("builds SET clause from object", () => {
    const result = buildSetClause({ name: "Test", status: "active" });
    expect(result.clause).toContain("name = $1");
    expect(result.clause).toContain("status = $2");
    expect(result.clause).toContain("updated_at = NOW()");
    expect(result.values).toEqual(["Test", "active"]);
    expect(result.nextIndex).toBe(3);
  });

  it("skips undefined values", () => {
    const result = buildSetClause({ name: "Test", status: undefined });
    expect(result.values).toEqual(["Test"]);
    expect(result.nextIndex).toBe(2);
  });

  it("handles JSON objects", () => {
    const result = buildSetClause({ config: { port: 8080 } });
    expect(result.clause).toContain("::jsonb");
    expect(result.values[0]).toBe('{"port":8080}');
  });

  it("always includes updated_at", () => {
    const result = buildSetClause({});
    expect(result.clause).toBe("updated_at = NOW()");
    expect(result.values).toEqual([]);
  });

  it("respects custom startIndex", () => {
    const result = buildSetClause({ name: "A" }, 5);
    expect(result.clause).toContain("name = $5");
    expect(result.nextIndex).toBe(6);
  });
});

describe("mapPgError", () => {
  it("maps unique violation", () => {
    const err = new Error("duplicate key value violates unique constraint");
    const result = mapPgError(err);
    expect(result.code).toBe("unique_violation");
    expect(result.status).toBe(409);
  });

  it("maps foreign key violation", () => {
    const err = new Error("violates foreign key constraint");
    const result = mapPgError(err);
    expect(result.code).toBe("foreign_key_violation");
    expect(result.status).toBe(422);
  });

  it("maps not found", () => {
    const err = new Error("not found");
    const result = mapPgError(err);
    expect(result.code).toBe("not_found");
    expect(result.status).toBe(404);
  });

  it("maps unknown errors", () => {
    const result = mapPgError("random");
    expect(result.code).toBe("query_error");
    expect(result.status).toBe(500);
  });

  it("maps not null violation", () => {
    const err = new Error("null value in column");
    const result = mapPgError(err);
    expect(result.code).toBe("not_null_violation");
    expect(result.status).toBe(422);
  });
});
