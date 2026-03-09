import { describe, it, expect } from "vitest";
import { z } from "zod";
import { wired, isWiredSchema, CRUD_OPERATIONS } from "../types.js";

describe("wired", () => {
  const dataSchema = z.object({ id: z.string(), name: z.string() });
  const wireSchema = z.object({
    type: z.string(),
    body: dataSchema,
    timestamp: z.string(),
  });

  const wrap = (data: z.infer<typeof dataSchema>) => ({
    type: "SUCCESS",
    body: data,
    timestamp: new Date().toISOString(),
  });

  const unwrap = (wire: z.infer<typeof wireSchema>) => wire.body;

  it("creates a WiredSchema with correct tag", () => {
    const schema = wired(wireSchema, dataSchema, wrap, unwrap);
    expect(schema._tag).toBe("WiredSchema");
  });

  it("stores wire and data schemas", () => {
    const schema = wired(wireSchema, dataSchema, wrap, unwrap);
    expect(schema.wire).toBe(wireSchema);
    expect(schema.data).toBe(dataSchema);
  });

  it("wrap transforms data to wire format", () => {
    const schema = wired(wireSchema, dataSchema, wrap, unwrap);
    const result = schema.wrap({ id: "1", name: "Test" });
    expect(result.type).toBe("SUCCESS");
    expect(result.body).toEqual({ id: "1", name: "Test" });
    expect(result.timestamp).toBeDefined();
  });

  it("unwrap extracts data from wire format", () => {
    const schema = wired(wireSchema, dataSchema, wrap, unwrap);
    const result = schema.unwrap({
      type: "SUCCESS",
      body: { id: "1", name: "Test" },
      timestamp: "2026-01-01",
    });
    expect(result).toEqual({ id: "1", name: "Test" });
  });

  it("round-trips wrap then unwrap", () => {
    const schema = wired(wireSchema, dataSchema, wrap, unwrap);
    const original = { id: "1", name: "Test" };
    const roundTripped = schema.unwrap(schema.wrap(original));
    expect(roundTripped).toEqual(original);
  });
});

describe("isWiredSchema", () => {
  const dataSchema = z.object({ id: z.string() });
  const wireSchema = z.object({ body: dataSchema });

  it("returns true for wired schema", () => {
    const schema = wired(
      wireSchema,
      dataSchema,
      (d) => ({ body: d }),
      (w) => w.body,
    );
    expect(isWiredSchema(schema)).toBe(true);
  });

  it("returns false for plain Zod schema", () => {
    expect(isWiredSchema(dataSchema)).toBe(false);
  });

  it("returns false for null", () => {
    expect(isWiredSchema(null)).toBe(false);
  });

  it("returns false for undefined", () => {
    expect(isWiredSchema(undefined)).toBe(false);
  });

  it("returns false for plain object without _tag", () => {
    expect(isWiredSchema({ wire: wireSchema, data: dataSchema })).toBe(false);
  });

  it("returns false for object with wrong _tag value", () => {
    expect(isWiredSchema({ _tag: "Other" })).toBe(false);
  });

  it("returns false for primitive values", () => {
    expect(isWiredSchema("WiredSchema")).toBe(false);
    expect(isWiredSchema(42)).toBe(false);
    expect(isWiredSchema(true)).toBe(false);
  });
});

describe("CRUD_OPERATIONS", () => {
  it("defines list as GET", () => {
    expect(CRUD_OPERATIONS.list).toEqual({ method: "GET" });
  });

  it("defines get as GET", () => {
    expect(CRUD_OPERATIONS.get).toEqual({ method: "GET" });
  });

  it("defines create as POST", () => {
    expect(CRUD_OPERATIONS.create).toEqual({ method: "POST" });
  });

  it("defines update as PATCH", () => {
    expect(CRUD_OPERATIONS.update).toEqual({ method: "PATCH" });
  });

  it("defines delete as DELETE", () => {
    expect(CRUD_OPERATIONS.delete).toEqual({ method: "DELETE" });
  });

  it("contains exactly 5 operations", () => {
    expect(Object.keys(CRUD_OPERATIONS)).toHaveLength(5);
  });
});
