import { describe, it, expect } from "vitest";
import { renderTemplate } from "../utils/template.js";
import {
  domainContractTs,
  domainHooksTs,
  domainIndexTs,
  domainMockHandlersTs,
  domainMockSeedTs,
} from "../templates/domain/index.js";
import {
  openapiUserIndexTs,
} from "../templates/openapi/index.js";

// --- Shared context ---

const domainCtx = {
  domainName: "inventory",
  domainPkgName: "@myapp/myapp-domain-inventory",
  projectName: "myapp",
  scope: "@myapp",
  apiBasePath: "/api/inventory",
  PascalName: "Inventory",
  entities: [
    { entityName: "product", EntityPascal: "Product" },
    { entityName: "category", EntityPascal: "Category" },
  ],
};

// --- Domain template tests ---

describe("domainContractTs", () => {
  it("renders TODO guide comments with example fields", () => {
    const result = renderTemplate(domainContractTs, domainCtx);

    expect(result).toContain("TODO: Add your domain fields here");
  });

  it("renders example field comments", () => {
    const result = renderTemplate(domainContractTs, domainCtx);

    expect(result).toContain("description: z.string().max(500).optional()");
    expect(result).toContain("price: z.number().min(0)");
    expect(result).toContain('status: z.enum(["active", "inactive"])');
    expect(result).toContain("categoryId: z.string().uuid()");
    expect(result).toContain("tags: z.array(z.string())");
  });

  it("preserves standard schema structure", () => {
    const result = renderTemplate(domainContractTs, domainCtx);

    expect(result).toContain("id: z.string().uuid()");
    expect(result).toContain("name: z.string().min(1)");
    expect(result).toContain("createdAt: z.string().datetime()");
    expect(result).toContain("updatedAt: z.string().datetime()");
  });

  it("renders entity names correctly for multiple entities", () => {
    const result = renderTemplate(domainContractTs, domainCtx);

    expect(result).toContain("export const productSchema = z.object(");
    expect(result).toContain("export const categorySchema = z.object(");
    expect(result).toContain("export const createProductSchema");
    expect(result).toContain("export const createCategorySchema");
    expect(result).toContain("export type Product =");
    expect(result).toContain("export type Category =");
  });

  it("renders the defineApi call with domain, entities, and operations", () => {
    const result = renderTemplate(domainContractTs, domainCtx);

    expect(result).toContain('domain: "inventory"');
    expect(result).toContain('basePath: "/api/inventory"');
    expect(result).toContain("operations:");
    expect(result).toContain('path: "/products"');
    expect(result).toContain('path: "/categorys"');
  });

  it("renders operations structure instead of path/createSchema/updateSchema", () => {
    const result = renderTemplate(domainContractTs, domainCtx);

    // Should have operations-based structure
    expect(result).toContain("operations: {");
    expect(result).toContain('method: "GET"');
    expect(result).toContain('method: "POST"');
    expect(result).toContain('method: "PATCH"');
    expect(result).toContain('method: "DELETE"');

    // Should NOT have old structure
    expect(result).not.toContain("createSchema:");
    expect(result).not.toContain("updateSchema:");
  });
});

describe("domainHooksTs", () => {
  it("renders JSDoc block", () => {
    const result = renderTemplate(domainHooksTs, domainCtx);

    expect(result).toContain("/**");
    expect(result).toContain("*/");
  });

  it("renders usage examples for each entity", () => {
    const result = renderTemplate(domainHooksTs, domainCtx);

    // Product hooks
    expect(result).toContain("inventoryHooks.product.useList()");
    expect(result).toContain("inventoryHooks.product.useGet(id)");
    expect(result).toContain("inventoryHooks.product.useCreate()");
    expect(result).toContain("inventoryHooks.product.useUpdate()");
    expect(result).toContain("inventoryHooks.product.useDelete()");

    // Category hooks
    expect(result).toContain("inventoryHooks.category.useList()");
    expect(result).toContain("inventoryHooks.category.useGet(id)");
    expect(result).toContain("inventoryHooks.category.useCreate()");
    expect(result).toContain("inventoryHooks.category.useUpdate()");
    expect(result).toContain("inventoryHooks.category.useDelete()");
  });

  it("renders the deriveEntityHooks call", () => {
    const result = renderTemplate(domainHooksTs, domainCtx);

    expect(result).toContain("export const inventoryHooks = deriveEntityHooks(inventoryApi)");
  });
});

describe("domainMockHandlersTs", () => {
  it("renders auto-derived handlers comment", () => {
    const result = renderTemplate(domainMockHandlersTs, domainCtx);

    expect(result).toContain("Auto-derived CRUD handlers");
  });

  it("renders customization hint with http.get example", () => {
    const result = renderTemplate(domainMockHandlersTs, domainCtx);

    expect(result).toContain("To add custom handlers, spread and extend");
    expect(result).toContain("http.get");
    expect(result).toContain("HttpResponse.json");
  });

  it("renders deriveMockHandlers call with correct api config", () => {
    const result = renderTemplate(domainMockHandlersTs, domainCtx);

    expect(result).toContain("deriveMockHandlers(inventoryApi.config)");
  });
});

describe("domainMockSeedTs", () => {
  it("exports seed as Record type", () => {
    const result = renderTemplate(domainMockSeedTs, domainCtx);

    expect(result).toContain("export const seed: Record<string, Record<string, unknown>[]>");
  });

  it("renders commented examples for each entity", () => {
    const result = renderTemplate(domainMockSeedTs, domainCtx);

    expect(result).toContain("product:");
    expect(result).toContain("category:");
  });
});

// --- OpenAPI template tests ---

describe("openapiUserIndexTs (Orval-aware)", () => {
  it("exports from mutator, hooks, and generated/model", () => {
    const result = renderTemplate(openapiUserIndexTs, { enableI18n: false, PascalName: "Inventory" });

    expect(result).toContain('export { configureInventoryMutator } from "./mutator"');
    expect(result).toContain('export * from "./hooks"');
    expect(result).toContain('export * from "./generated/model"');
  });

  it("includes translations import when i18n enabled", () => {
    const result = renderTemplate(openapiUserIndexTs, { enableI18n: true, PascalName: "Inventory" });

    expect(result).toContain('import "./translations"');
  });

  it("excludes translations import when i18n disabled", () => {
    const result = renderTemplate(openapiUserIndexTs, { enableI18n: false, PascalName: "Inventory" });

    expect(result).not.toContain('import "./translations"');
  });
});

// --- Structural consistency ---

describe("structural consistency between domain and openapi templates", () => {
  it("domain index exports from contract and hooks (non-orval mode)", () => {
    expect(domainIndexTs).toContain('export * from "./contract"');
    expect(domainIndexTs).toContain('export * from "./hooks"');
  });

  it("domain index exports from hooks and model in orval mode", () => {
    expect(domainIndexTs).toContain('export * from "./hooks"');
    expect(domainIndexTs).toContain('export * from "./generated/model"');
  });
});
