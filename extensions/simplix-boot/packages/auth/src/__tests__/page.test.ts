import { describe, expect, it } from "vitest";
import { z } from "zod";

import { pageOf, springPageSchema } from "../page.js";

describe("springPageSchema", () => {
  it("validates a minimal Spring page response", () => {
    const data = {
      totalPages: 5,
      totalElements: 50,
      first: true,
      last: false,
      size: 10,
      number: 0,
      numberOfElements: 10,
      empty: false,
    };

    const result = springPageSchema.parse(data);
    expect(result.totalPages).toBe(5);
    expect(result.totalElements).toBe(50);
    expect(result.first).toBe(true);
    expect(result.last).toBe(false);
    expect(result.size).toBe(10);
    expect(result.number).toBe(0);
    expect(result.numberOfElements).toBe(10);
    expect(result.empty).toBe(false);
  });

  it("validates with sort object", () => {
    const data = {
      totalPages: 1,
      totalElements: 3,
      first: true,
      last: true,
      size: 10,
      number: 0,
      numberOfElements: 3,
      empty: false,
      sort: { empty: false, sorted: true, unsorted: false },
    };

    const result = springPageSchema.parse(data);
    expect(result.sort).toEqual({ empty: false, sorted: true, unsorted: false });
  });

  it("validates with pageable object", () => {
    const data = {
      totalPages: 1,
      totalElements: 3,
      first: true,
      last: true,
      size: 10,
      number: 0,
      numberOfElements: 3,
      empty: false,
      pageable: {
        offset: 0,
        sort: { empty: true, sorted: false, unsorted: true },
        paged: true,
        unpaged: false,
        pageNumber: 0,
        pageSize: 10,
      },
    };

    const result = springPageSchema.parse(data);
    expect(result.pageable?.paged).toBe(true);
    expect(result.pageable?.pageSize).toBe(10);
  });

  it("rejects missing required fields", () => {
    const data = { totalPages: 5 };
    expect(() => springPageSchema.parse(data)).toThrow();
  });
});

describe("pageOf", () => {
  it("creates a schema that validates content array with items", () => {
    const petSchema = z.object({ id: z.number(), name: z.string() });
    const petPageSchema = pageOf(petSchema);

    const data = {
      totalPages: 1,
      totalElements: 2,
      first: true,
      last: true,
      size: 10,
      number: 0,
      numberOfElements: 2,
      empty: false,
      content: [
        { id: 1, name: "Buddy" },
        { id: 2, name: "Max" },
      ],
    };

    const result = petPageSchema.parse(data);
    expect(result.content).toHaveLength(2);
    expect(result.content[0].name).toBe("Buddy");
  });

  it("validates empty content", () => {
    const schema = pageOf(z.object({ id: z.number() }));
    const data = {
      totalPages: 0,
      totalElements: 0,
      first: true,
      last: true,
      size: 10,
      number: 0,
      numberOfElements: 0,
      empty: true,
      content: [],
    };

    const result = schema.parse(data);
    expect(result.content).toEqual([]);
    expect(result.empty).toBe(true);
  });

  it("rejects invalid content items", () => {
    const schema = pageOf(z.object({ id: z.number() }));
    const data = {
      totalPages: 1,
      totalElements: 1,
      first: true,
      last: true,
      size: 10,
      number: 0,
      numberOfElements: 1,
      empty: false,
      content: [{ id: "not-a-number" }],
    };

    expect(() => schema.parse(data)).toThrow();
  });

  it("rejects missing content", () => {
    const schema = pageOf(z.object({ id: z.number() }));
    const data = {
      totalPages: 1,
      totalElements: 1,
      first: true,
      last: true,
      size: 10,
      number: 0,
      numberOfElements: 1,
      empty: false,
    };

    expect(() => schema.parse(data)).toThrow();
  });
});
