import { describe, it, expect } from "vitest";
import { createMockClient } from "../mock-client.js";
import type { ApiContractConfig, EntityDefinition, EntityOperationDef } from "@simplix-react/contract";

// ── Test Fixtures ──

// createMockClient only reads config.entities[name].operations — schema is not used at runtime.
const dummySchema = {} as EntityDefinition["schema"];

function buildConfig(): Pick<ApiContractConfig, "entities"> {
  const operations: Record<string, EntityOperationDef> = {
    list: { method: "GET" as const, path: "/products" },
    get: { method: "GET" as const, path: "/products/:id" },
    create: { method: "POST" as const, path: "/products" },
    update: { method: "PUT" as const, path: "/products/:id" },
    delete: { method: "DELETE" as const, path: "/products/:id" },
  };

  const entities: Record<string, EntityDefinition> = {
    product: {
      schema: dummySchema,
      operations,
    } as EntityDefinition,
  };

  return { entities };
}

// ── Tests ──

describe("createMockClient", () => {
  it("creates a client from contract config", () => {
    const config = buildConfig();
    const client = createMockClient(config, {
      product: [{ id: "1", name: "Widget", price: 10 }],
    });
    expect(client).toHaveProperty("product");
  });

  it("exposes CRUD operations for each entity", () => {
    const config = buildConfig();
    const client = createMockClient(config, { product: [] }) as Record<string, Record<string, unknown>>;
    const product = client.product;
    expect(typeof product.list).toBe("function");
    expect(typeof product.get).toBe("function");
    expect(typeof product.create).toBe("function");
    expect(typeof product.update).toBe("function");
    expect(typeof product.delete).toBe("function");
  });

  describe("list", () => {
    it("returns seeded data", async () => {
      const config = buildConfig();
      const seedData = [
        { id: "1", name: "Widget", price: 10 },
        { id: "2", name: "Gadget", price: 20 },
      ];
      const client = createMockClient(config, { product: seedData }) as Record<string, Record<string, (...args: unknown[]) => Promise<unknown>>>;
      const result = await client.product.list();
      expect(result).toEqual(seedData);
    });

    it("returns empty array when no seed data", async () => {
      const config = buildConfig();
      const client = createMockClient(config, {}) as Record<string, Record<string, (...args: unknown[]) => Promise<unknown>>>;
      const result = await client.product.list();
      expect(result).toEqual([]);
    });
  });

  describe("get", () => {
    it("returns item by id", async () => {
      const config = buildConfig();
      const client = createMockClient(config, {
        product: [{ id: "1", name: "Widget", price: 10 }],
      }) as Record<string, Record<string, (...args: unknown[]) => Promise<unknown>>>;
      const result = await client.product.get("1");
      expect(result).toEqual({ id: "1", name: "Widget", price: 10 });
    });

    it("rejects when item not found", async () => {
      const config = buildConfig();
      const client = createMockClient(config, { product: [] }) as Record<string, Record<string, (...args: unknown[]) => Promise<unknown>>>;
      await expect(client.product.get("999")).rejects.toThrow("Not found: 999");
    });
  });

  describe("create", () => {
    it("adds a new item with auto-generated id", async () => {
      const config = buildConfig();
      const data: unknown[] = [];
      const client = createMockClient(config, { product: data }) as Record<string, Record<string, (...args: unknown[]) => Promise<unknown>>>;
      const result = (await client.product.create({ name: "New", price: 30 })) as Record<string, unknown>;

      expect(result.name).toBe("New");
      expect(result.price).toBe(30);
      expect(result.id).toBeDefined();
      expect(typeof result.id).toBe("string");
      expect(data).toHaveLength(1);
    });

    it("generates unique ids for each created item", async () => {
      const config = buildConfig();
      const data: unknown[] = [];
      const client = createMockClient(config, { product: data }) as Record<string, Record<string, (...args: unknown[]) => Promise<unknown>>>;
      const a = (await client.product.create({ name: "A", price: 1 })) as Record<string, unknown>;
      const b = (await client.product.create({ name: "B", price: 2 })) as Record<string, unknown>;
      expect(a.id).not.toBe(b.id);
      expect(data).toHaveLength(2);
    });
  });

  describe("update", () => {
    it("updates an existing item", async () => {
      const config = buildConfig();
      const data = [{ id: "1", name: "Widget", price: 10 }];
      const client = createMockClient(config, { product: data }) as Record<string, Record<string, (...args: unknown[]) => Promise<unknown>>>;
      const result = (await client.product.update("1", { name: "Updated Widget" })) as Record<string, unknown>;

      expect(result.name).toBe("Updated Widget");
      expect(result.price).toBe(10);
      expect(result.id).toBe("1");
    });

    it("rejects when item to update is not found", async () => {
      const config = buildConfig();
      const client = createMockClient(config, { product: [] }) as Record<string, Record<string, (...args: unknown[]) => Promise<unknown>>>;
      await expect(
        client.product.update("999", { name: "X" }),
      ).rejects.toThrow("Not found: 999");
    });
  });

  describe("delete", () => {
    it("removes the item from the data array", async () => {
      const config = buildConfig();
      const data = [
        { id: "1", name: "Widget", price: 10 },
        { id: "2", name: "Gadget", price: 20 },
      ];
      const client = createMockClient(config, { product: data }) as Record<string, Record<string, (...args: unknown[]) => Promise<unknown>>>;
      await client.product.delete("1");
      expect(data).toHaveLength(1);
      expect(data[0]).toEqual({ id: "2", name: "Gadget", price: 20 });
    });

    it("rejects when item to delete is not found", async () => {
      const config = buildConfig();
      const client = createMockClient(config, { product: [] }) as Record<string, Record<string, (...args: unknown[]) => Promise<unknown>>>;
      await expect(client.product.delete("999")).rejects.toThrow("Not found: 999");
    });
  });

  describe("tree operation", () => {
    it("returns empty array for tree role", async () => {
      const operations: Record<string, EntityOperationDef> = {
        tree: { method: "GET" as const, path: "/categories/tree" },
      };
      const entities: Record<string, EntityDefinition> = {
        category: { schema: dummySchema, operations } as EntityDefinition,
      };
      const client = createMockClient({ entities }, {}) as Record<string, Record<string, (...args: unknown[]) => Promise<unknown>>>;
      const result = await client.category.tree();
      expect(result).toEqual([]);
    });
  });

  describe("non-CRUD operation", () => {
    it("returns null for unknown operations", async () => {
      const operations: Record<string, EntityOperationDef> = {
        archive: { method: "POST" as const, path: "/products/:id/archive" },
      };
      const entities: Record<string, EntityDefinition> = {
        product: { schema: dummySchema, operations } as EntityDefinition,
      };
      const client = createMockClient({ entities }, {}) as Record<string, Record<string, (...args: unknown[]) => Promise<unknown>>>;
      const result = await client.product.archive();
      expect(result).toBeNull();
    });
  });
});
