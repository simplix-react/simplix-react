import { describe, it, expect } from "vitest";
import { deepEqual, extractDirtyFields } from "../utils/dirty-fields.js";

describe("deepEqual", () => {
  it("returns true for identical primitives", () => {
    expect(deepEqual(1, 1)).toBe(true);
    expect(deepEqual("hello", "hello")).toBe(true);
    expect(deepEqual(true, true)).toBe(true);
  });

  it("returns false for different primitives", () => {
    expect(deepEqual(1, 2)).toBe(false);
    expect(deepEqual("a", "b")).toBe(false);
    expect(deepEqual(true, false)).toBe(false);
  });

  it("returns true for same Date objects", () => {
    const date = new Date("2024-01-01");
    expect(deepEqual(date, new Date("2024-01-01"))).toBe(true);
  });

  it("returns false for different Dates", () => {
    expect(deepEqual(new Date("2024-01-01"), new Date("2024-06-15"))).toBe(
      false,
    );
  });

  it("returns false for null vs undefined", () => {
    expect(deepEqual(null, undefined)).toBe(false);
    expect(deepEqual(undefined, null)).toBe(false);
  });

  it("returns true for identical arrays", () => {
    expect(deepEqual([1, 2, 3], [1, 2, 3])).toBe(true);
  });

  it("returns false for different length arrays", () => {
    expect(deepEqual([1, 2], [1, 2, 3])).toBe(false);
  });

  it("returns false for arrays with different elements", () => {
    expect(deepEqual([1, 2, 3], [1, 99, 3])).toBe(false);
  });

  it("returns true for identical nested objects", () => {
    const a = { name: "test", meta: { count: 5 } };
    const b = { name: "test", meta: { count: 5 } };
    expect(deepEqual(a, b)).toBe(true);
  });

  it("returns false for objects with different values", () => {
    const a = { name: "test", count: 1 };
    const b = { name: "test", count: 2 };
    expect(deepEqual(a, b)).toBe(false);
  });

  it("returns false for objects with different keys", () => {
    const a = { name: "test" };
    const b = { title: "test" };
    expect(deepEqual(a, b)).toBe(false);
  });
});

describe("extractDirtyFields", () => {
  it("returns empty object for identical objects", () => {
    const obj = { name: "test", count: 1 };
    expect(extractDirtyFields(obj, { ...obj })).toEqual({});
  });

  it("returns only the changed primitive field", () => {
    const original = { name: "old", count: 1 };
    const current = { name: "new", count: 1 };
    expect(extractDirtyFields(current, original)).toEqual({ name: "new" });
  });

  it("includes added fields", () => {
    const original = { name: "test" } as Record<string, unknown>;
    const current = { name: "test", extra: "value" } as Record<
      string,
      unknown
    >;
    expect(extractDirtyFields(current, original)).toEqual({ extra: "value" });
  });

  it("includes nested object changes", () => {
    const original = { meta: { count: 1 } };
    const current = { meta: { count: 2 } };
    expect(extractDirtyFields(current, original)).toEqual({
      meta: { count: 2 },
    });
  });

  it("includes array changes", () => {
    const original = { tags: ["a", "b"] };
    const current = { tags: ["a", "c"] };
    expect(extractDirtyFields(current, original)).toEqual({
      tags: ["a", "c"],
    });
  });

  it("includes multiple changes", () => {
    const original = { name: "old", count: 1, active: true };
    const current = { name: "new", count: 5, active: true };
    expect(extractDirtyFields(current, original)).toEqual({
      name: "new",
      count: 5,
    });
  });
});
