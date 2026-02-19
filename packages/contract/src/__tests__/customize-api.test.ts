import { describe, it, expect, vi } from "vitest";
import { z } from "zod";
import { defineApi } from "../define-api.js";
import { customizeApi } from "../customize-api.js";

const productSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number(),
});

const categorySchema = z.object({
  id: z.string(),
  name: z.string(),
});

const createProductDto = z.object({ name: z.string(), price: z.number() });
const updateProductDto = z.object({ name: z.string().optional() });

function createBaseApi() {
  return defineApi({
    domain: "shop",
    basePath: "/api",
    entities: {
      product: {
        schema: productSchema,
        operations: {
          list:   { method: "GET" as const,    path: "/products" },
          get:    { method: "GET" as const,    path: "/products/:id" },
          create: { method: "POST" as const,   path: "/products", input: createProductDto },
          update: { method: "PATCH" as const,  path: "/products/:id", input: updateProductDto },
          delete: { method: "DELETE" as const, path: "/products/:id" },
          findByStatus: { method: "GET" as const, path: "/products/findByStatus" },
        },
      },
      category: {
        schema: categorySchema,
        operations: {
          list: { method: "GET" as const, path: "/categories" },
          get:  { method: "GET" as const, path: "/categories/:id" },
        },
      },
    },
  });
}

describe("customizeApi", () => {
  it("removes operations set to null", () => {
    const base = createBaseApi();
    const patched = customizeApi(base, {
      entities: {
        product: {
          operations: {
            findByStatus: null,
          },
        },
      },
    });

    expect(patched.config.entities.product.operations).not.toHaveProperty("findByStatus");
    expect(patched.config.entities.product.operations).toHaveProperty("list");
    expect(patched.config.entities.product.operations).toHaveProperty("get");
  });

  it("adds new operations", () => {
    const base = createBaseApi();
    const patched = customizeApi(base, {
      entities: {
        product: {
          operations: {
            archive: { method: "POST", path: "/products/:id/archive" },
          },
        },
      },
    });

    const ops = patched.config.entities.product.operations as Record<string, unknown>;
    expect(ops).toHaveProperty("archive");
    expect(ops.archive).toEqual({
      method: "POST",
      path: "/products/:id/archive",
    });
  });

  it("replaces existing operations", () => {
    const base = createBaseApi();
    const patched = customizeApi(base, {
      entities: {
        product: {
          operations: {
            list: { method: "GET", path: "/products/findByStatus", role: "list" },
          },
        },
      },
    });

    expect(patched.config.entities.product.operations.list).toEqual({
      method: "GET",
      path: "/products/findByStatus",
      role: "list",
    });
  });

  it("re-derives client from patched config", async () => {
    const mockFetch = vi.fn().mockResolvedValue([]);
    const base = createBaseApi();

    const patched = customizeApi(base, {
      entities: {
        product: {
          operations: {
            findByStatus: null,
          },
        },
      },
    }, { fetchFn: mockFetch });

    // Removed operation should not exist on client
    expect(patched.client.product).not.toHaveProperty("findByStatus");
    // Remaining operations should still work
    expect(patched.client.product).toHaveProperty("list");
  });

  it("re-derives queryKeys from patched config", () => {
    const base = createBaseApi();
    const patched = customizeApi(base, {
      entities: {
        product: {
          operations: {
            findByStatus: null,
          },
        },
      },
    });

    expect(patched.queryKeys.product.all).toEqual(["shop", "product"]);
    expect(patched.queryKeys.product.lists()).toEqual(["shop", "product", "list"]);
    expect(patched.queryKeys.category.all).toEqual(["shop", "category"]);
  });

  it("does not mutate the base contract", () => {
    const base = createBaseApi();
    const originalOps = Object.keys(base.config.entities.product.operations);

    customizeApi(base, {
      entities: {
        product: {
          operations: {
            findByStatus: null,
            archive: { method: "POST", path: "/products/:id/archive" },
          },
        },
      },
    });

    const afterOps = Object.keys(base.config.entities.product.operations);
    expect(afterOps).toEqual(originalOps);
  });

  it("preserves unpatched entities", () => {
    const base = createBaseApi();
    const patched = customizeApi(base, {
      entities: {
        product: {
          operations: {
            findByStatus: null,
          },
        },
      },
    });

    // category should be completely untouched
    expect(patched.config.entities.category).toEqual(base.config.entities.category);
    expect(patched.queryKeys.category.all).toEqual(["shop", "category"]);
    expect(patched.client.category).toHaveProperty("list");
    expect(patched.client.category).toHaveProperty("get");
  });

  it("handles empty patch", () => {
    const base = createBaseApi();
    const patched = customizeApi(base, {});

    expect(Object.keys(patched.config.entities.product.operations))
      .toEqual(Object.keys(base.config.entities.product.operations));
  });

  it("ignores non-existent entity in patch", () => {
    const base = createBaseApi();
    const patched = customizeApi(base, {
      entities: {
        nonExistent: {
          operations: {
            list: { method: "GET", path: "/nope" },
          },
        },
      },
    });

    // Should not add a new entity
    expect(patched.config.entities).not.toHaveProperty("nonExistent");
    // Existing entities unchanged
    expect(Object.keys(patched.config.entities.product.operations))
      .toEqual(Object.keys(base.config.entities.product.operations));
  });
});
