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
  openapiUserContractTs,
  openapiUserHooksTs,
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

  it("renders the deriveHooks call", () => {
    const result = renderTemplate(domainHooksTs, domainCtx);

    expect(result).toContain("export const inventoryHooks = deriveHooks(inventoryApi)");
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

describe("openapiUserIndexTs", () => {
  it("exports from contract and hooks", () => {
    expect(openapiUserIndexTs).toContain('export * from "./contract"');
    expect(openapiUserIndexTs).toContain('export * from "./hooks"');
  });

  it("does not export from generated/index", () => {
    expect(openapiUserIndexTs).not.toContain("./generated/index");
  });
});

describe("openapiUserContractTs", () => {
  it("re-exports generated schemas and contract", () => {
    const result = renderTemplate(openapiUserContractTs, { domainName: "inventory" });

    expect(result).toContain('export * from "./generated/schemas"');
    expect(result).toContain('export * from "./generated/contract"');
  });

  it("contains customizeApi example with domainName", () => {
    const result = renderTemplate(openapiUserContractTs, { domainName: "inventory" });

    expect(result).toContain("customizeApi");
    expect(result).toContain("inventoryApi as _inventoryApi");
    expect(result).toContain("export const inventoryApi = customizeApi(_inventoryApi");
  });

  it("contains extension guide comments", () => {
    const result = renderTemplate(openapiUserContractTs, { domainName: "inventory" });

    expect(result).toContain("Add custom schemas or extend the generated contract below");
    expect(result).toContain("preserved across");
  });
});

describe("openapiUserHooksTs", () => {
  it("derives hooks from user-owned contract", () => {
    const result = renderTemplate(openapiUserHooksTs, { domainName: "inventory", generateForms: false });

    expect(result).toContain('import { deriveHooks } from "@simplix-react/react"');
    expect(result).toContain('import { inventoryApi } from "./contract"');
    expect(result).toContain("export const inventoryHooks = deriveHooks(inventoryApi)");
  });

  it("includes deriveFormHooks when generateForms is true", () => {
    const result = renderTemplate(openapiUserHooksTs, { domainName: "inventory", generateForms: true });

    expect(result).toContain('import { deriveFormHooks } from "@simplix-react/form"');
    expect(result).toContain("export const inventoryFormHooks = deriveFormHooks(inventoryApi, inventoryHooks)");
  });

  it("excludes deriveFormHooks when generateForms is false", () => {
    const result = renderTemplate(openapiUserHooksTs, { domainName: "inventory", generateForms: false });

    expect(result).not.toContain("deriveFormHooks");
  });

  it("contains extension guide comments", () => {
    const result = renderTemplate(openapiUserHooksTs, { domainName: "inventory", generateForms: false });

    expect(result).toContain("Add custom hooks below");
    expect(result).toContain("preserved across");
  });
});

// --- Structural consistency ---

describe("structural consistency between domain and openapi templates", () => {
  it("both index templates export from contract and hooks", () => {
    expect(domainIndexTs).toContain('export * from "./contract"');
    expect(domainIndexTs).toContain('export * from "./hooks"');

    expect(openapiUserIndexTs).toContain('export * from "./contract"');
    expect(openapiUserIndexTs).toContain('export * from "./hooks"');
  });
});
