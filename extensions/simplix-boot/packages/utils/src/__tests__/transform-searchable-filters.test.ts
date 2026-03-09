import { describe, expect, it } from "vitest";

import { transformSearchableFilters } from "../transform-searchable-filters.js";

describe("transformSearchableFilters", () => {
  it("passes through simple string values unchanged", () => {
    const result = transformSearchableFilters({ name: "John" });
    expect(result).toEqual({ name: "John" });
  });

  it("passes through number values unchanged", () => {
    const result = transformSearchableFilters({ age: 25 });
    expect(result).toEqual({ age: 25 });
  });

  it("passes through boolean values unchanged", () => {
    const result = transformSearchableFilters({ active: true });
    expect(result).toEqual({ active: true });
  });

  it("joins array values with commas", () => {
    const result = transformSearchableFilters({ status: ["ACTIVE", "PENDING"] });
    expect(result).toEqual({ status: "ACTIVE,PENDING" });
  });

  it("joins single-element array", () => {
    const result = transformSearchableFilters({ status: ["ACTIVE"] });
    expect(result).toEqual({ status: "ACTIVE" });
  });

  it("converts ISO date strings to LocalDateTime format", () => {
    const result = transformSearchableFilters({
      createdAt: "2024-01-15T10:30:00.000Z",
    });
    expect(result).toEqual({ createdAt: "2024-01-15T10:30:00" });
  });

  it("strips Z suffix without milliseconds", () => {
    const result = transformSearchableFilters({
      updatedAt: "2024-06-01T00:00:00Z",
    });
    expect(result).toEqual({ updatedAt: "2024-06-01T00:00:00" });
  });

  it("skips null values", () => {
    const result = transformSearchableFilters({ name: null, age: 25 });
    expect(result).toEqual({ age: 25 });
  });

  it("skips undefined values", () => {
    const result = transformSearchableFilters({ name: undefined, age: 25 });
    expect(result).toEqual({ age: 25 });
  });

  it("skips empty string values", () => {
    const result = transformSearchableFilters({ name: "", age: 25 });
    expect(result).toEqual({ age: 25 });
  });

  it("merges gte/lte date pairs into BETWEEN", () => {
    const result = transformSearchableFilters({
      "createdAt.greaterThanOrEqualTo": "2024-01-01T00:00:00.000Z",
      "createdAt.lessThanOrEqualTo": "2024-12-31T23:59:59.000Z",
    });
    expect(result).toEqual({
      "createdAt.between": "2024-01-01T00:00:00,2024-12-31T23:59:59",
    });
  });

  it("keeps standalone gte date as-is when no matching lte", () => {
    const result = transformSearchableFilters({
      "createdAt.greaterThanOrEqualTo": "2024-01-01T00:00:00.000Z",
    });
    expect(result).toEqual({
      "createdAt.greaterThanOrEqualTo": "2024-01-01T00:00:00",
    });
  });

  it("keeps standalone lte date as-is when no matching gte", () => {
    const result = transformSearchableFilters({
      "createdAt.lessThanOrEqualTo": "2024-12-31T23:59:59.000Z",
    });
    expect(result).toEqual({
      "createdAt.lessThanOrEqualTo": "2024-12-31T23:59:59",
    });
  });

  it("does not merge non-date gte/lte pairs", () => {
    const result = transformSearchableFilters({
      "price.greaterThanOrEqualTo": "100",
      "price.lessThanOrEqualTo": "500",
    });
    expect(result).toEqual({
      "price.greaterThanOrEqualTo": "100",
      "price.lessThanOrEqualTo": "500",
    });
  });

  it("handles mixed filter types", () => {
    const result = transformSearchableFilters({
      name: "John",
      status: ["ACTIVE", "PENDING"],
      createdAt: "2024-01-15T10:30:00.000Z",
      age: 25,
      role: null,
    });
    expect(result).toEqual({
      name: "John",
      status: "ACTIVE,PENDING",
      createdAt: "2024-01-15T10:30:00",
      age: 25,
    });
  });

  it("returns empty object for empty input", () => {
    const result = transformSearchableFilters({});
    expect(result).toEqual({});
  });

  it("returns empty object when all values are skippable", () => {
    const result = transformSearchableFilters({
      a: null,
      b: undefined,
      c: "",
    });
    expect(result).toEqual({});
  });
});
