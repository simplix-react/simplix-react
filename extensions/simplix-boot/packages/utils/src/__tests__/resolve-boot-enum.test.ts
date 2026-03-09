import { describe, expect, it } from "vitest";

import { resolveBootEnum } from "../resolve-boot-enum.js";

describe("resolveBootEnum", () => {
  it("returns empty string for null", () => {
    expect(resolveBootEnum(null)).toBe("");
  });

  it("returns empty string for undefined", () => {
    expect(resolveBootEnum(undefined)).toBe("");
  });

  it("returns the string as-is for plain string values", () => {
    expect(resolveBootEnum("ACTIVE")).toBe("ACTIVE");
    expect(resolveBootEnum("INACTIVE")).toBe("INACTIVE");
  });

  it("returns empty string for empty string", () => {
    expect(resolveBootEnum("")).toBe("");
  });

  it("extracts value from Boot enum object", () => {
    expect(resolveBootEnum({ type: "Status", value: "ACTIVE", label: "Active" })).toBe("ACTIVE");
  });

  it("extracts value from object with only value property", () => {
    expect(resolveBootEnum({ value: "PENDING" })).toBe("PENDING");
  });

  it("converts non-string value property to string", () => {
    expect(resolveBootEnum({ value: 42 })).toBe("42");
    expect(resolveBootEnum({ value: true })).toBe("true");
  });

  it("converts number to string", () => {
    expect(resolveBootEnum(123)).toBe("123");
  });

  it("converts boolean to string", () => {
    expect(resolveBootEnum(true)).toBe("true");
    expect(resolveBootEnum(false)).toBe("false");
  });

  it("converts object without value property to string", () => {
    const result = resolveBootEnum({ name: "test" });
    expect(result).toBe("[object Object]");
  });
});
