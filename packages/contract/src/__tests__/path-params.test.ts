import { describe, it, expect } from "vitest";
import { extractPathParams, interpolatePath } from "../helpers/path-params.js";

describe("extractPathParams", () => {
  it("extracts single param", () => {
    expect(extractPathParams("/products/:id")).toEqual(["id"]);
  });

  it("extracts multiple params", () => {
    expect(extractPathParams("/tenants/:tenantId/products/:productId")).toEqual([
      "tenantId",
      "productId",
    ]);
  });

  it("returns empty array when no params", () => {
    expect(extractPathParams("/products")).toEqual([]);
  });

  it("returns empty array for empty string", () => {
    expect(extractPathParams("")).toEqual([]);
  });

  it("extracts param at the end of path", () => {
    expect(extractPathParams("/tasks/:taskId/assign")).toEqual(["taskId"]);
  });

  it("extracts params with underscores in names", () => {
    expect(extractPathParams("/items/:item_id")).toEqual(["item_id"]);
  });
});

describe("interpolatePath", () => {
  it("substitutes single param", () => {
    expect(interpolatePath("/products/:id", { id: "abc" })).toBe(
      "/products/abc",
    );
  });

  it("substitutes multiple params", () => {
    expect(
      interpolatePath("/tenants/:tenantId/products/:productId", {
        tenantId: "t1",
        productId: "p1",
      }),
    ).toBe("/tenants/t1/products/p1");
  });

  it("encodes special characters", () => {
    expect(interpolatePath("/items/:id", { id: "hello world" })).toBe(
      "/items/hello%20world",
    );
  });

  it("throws when required param is missing", () => {
    expect(() => interpolatePath("/products/:id", {})).toThrow(
      "Missing path param: id",
    );
  });

  it("throws when one of multiple params is missing", () => {
    expect(() =>
      interpolatePath("/tenants/:tenantId/products/:productId", {
        tenantId: "t1",
      }),
    ).toThrow("Missing path param: productId");
  });

  it("returns path unchanged when no placeholders exist", () => {
    expect(interpolatePath("/products", {})).toBe("/products");
  });
});
