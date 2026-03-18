import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mkdtemp, rm, readFile, mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { pathExists } from "../utils/fs.js";

// Mock ora
vi.mock("ora", () => ({
  default: () => ({
    start: vi.fn().mockReturnThis(),
    succeed: vi.fn().mockReturnThis(),
    fail: vi.fn().mockReturnThis(),
    text: "",
  }),
}));

// Mock logger
vi.mock("../utils/logger.js", () => ({
  log: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    success: vi.fn(),
    step: vi.fn(),
  },
}));

// Mock config-loader
vi.mock("../config/config-loader.js", () => ({
  loadConfig: vi.fn().mockResolvedValue({
    api: { baseUrl: "/api" },
    i18n: { locales: ["en", "ko"] },
  }),
}));

// Mock crud-config-loader
vi.mock("../config/crud-config-loader.js", () => ({
  findCrudConfigForEntity: vi.fn().mockResolvedValue(null),
}));

// Mock depVersion (called by ensureModuleDeps)
vi.mock("../versions.js", () => ({
  depVersion: vi.fn().mockReturnValue("^19.0.0"),
  withVersions: vi.fn((ctx: Record<string, unknown>) => ctx),
}));

let tempDir: string;
let originalCwd: string;
let originalExit: typeof process.exit;

beforeEach(async () => {
  tempDir = await mkdtemp(join(tmpdir(), "scaffold-crud-action-test-"));
  originalCwd = process.cwd();
  originalExit = process.exit;
  process.exit = vi.fn((code?: number) => {
    throw new Error(`process.exit(${code})`);
  }) as never;

  // Create project root
  await writeFile(join(tempDir, "simplix.config.ts"), "export default {};");
  await writeFile(
    join(tempDir, "package.json"),
    JSON.stringify({ name: "@test/test-monorepo" }),
  );

  process.chdir(tempDir);
});

afterEach(async () => {
  process.chdir(originalCwd);
  process.exit = originalExit;
  await rm(tempDir, { recursive: true, force: true });
  vi.restoreAllMocks();
});

describe("scaffoldCrudCommand action", () => {
  it("exits with error when no modules found", async () => {
    const { scaffoldCrudCommand } = await import("../commands/scaffold-crud.js");
    await import("../utils/logger.js");

    await expect(
      scaffoldCrudCommand.parseAsync(["node", "simplix", "product"]),
    ).rejects.toThrow("process.exit(1)");
  });

  it("exits with error when multiple modules found without --module", async () => {
    const { scaffoldCrudCommand } = await import("../commands/scaffold-crud.js");

    await mkdir(join(tempDir, "modules/mod1"), { recursive: true });
    await mkdir(join(tempDir, "modules/mod2"), { recursive: true });

    await expect(
      scaffoldCrudCommand.parseAsync(["node", "simplix", "product"]),
    ).rejects.toThrow("process.exit(1)");
  });

  it("auto-detects single module", async () => {
    const { scaffoldCrudCommand } = await import("../commands/scaffold-crud.js");

    // Create a single module with package.json
    const modDir = join(tempDir, "modules/myapp-editor");
    await mkdir(join(modDir, "src/widgets"), { recursive: true });
    await writeFile(
      join(modDir, "package.json"),
      JSON.stringify({ name: "@test/myapp-editor", dependencies: {} }),
    );
    await writeFile(join(modDir, "src/widgets/index.ts"), "export {};\n");

    // Create packages dir (empty — no schema file)
    await mkdir(join(tempDir, "packages"), { recursive: true });

    await scaffoldCrudCommand.parseAsync(["node", "simplix", "product"]);

    // Should generate widgets with placeholder fields
    const widgetsDir = join(modDir, "src/widgets/product");
    expect(await pathExists(join(widgetsDir, "index.ts"))).toBe(true);
    expect(await pathExists(join(widgetsDir, "list.tsx"))).toBe(true);
    expect(await pathExists(join(widgetsDir, "form.tsx"))).toBe(true);
    expect(await pathExists(join(widgetsDir, "detail.tsx"))).toBe(true);
  });

  it("generates widgets from schema file", async () => {
    const { scaffoldCrudCommand } = await import("../commands/scaffold-crud.js");

    // Create module
    const modDir = join(tempDir, "modules/myapp-editor");
    await mkdir(join(modDir, "src/widgets"), { recursive: true });
    await writeFile(
      join(modDir, "package.json"),
      JSON.stringify({ name: "@test/myapp-editor", dependencies: {} }),
    );
    await writeFile(join(modDir, "src/widgets/index.ts"), "export {};\n");

    // Create domain package with schema
    const domainDir = join(tempDir, "packages/myapp-domain-product/src");
    await mkdir(domainDir, { recursive: true });
    await writeFile(
      join(domainDir, "schemas.ts"),
      `export const productSchema = z.object({
        id: z.string().uuid(),
        name: z.string().min(1),
        price: z.number().min(0),
        active: z.boolean(),
      });`,
    );
    await writeFile(
      join(tempDir, "packages/myapp-domain-product/package.json"),
      JSON.stringify({ name: "@test/myapp-domain-product" }),
    );

    await scaffoldCrudCommand.parseAsync(["node", "simplix", "product"]);

    const widgetsDir = join(modDir, "src/widgets/product");
    expect(await pathExists(join(widgetsDir, "list.tsx"))).toBe(true);

    const listContent = await readFile(join(widgetsDir, "list.tsx"), "utf-8");
    expect(listContent).toContain("Product");
    expect(listContent).toContain("name");
    expect(listContent).toContain("price");
  });

  it("uses --output flag to set output directory", async () => {
    const { scaffoldCrudCommand } = await import("../commands/scaffold-crud.js");

    await mkdir(join(tempDir, "custom-output"), { recursive: true });
    await mkdir(join(tempDir, "packages"), { recursive: true });

    await scaffoldCrudCommand.parseAsync([
      "node", "simplix", "product", "--output", "custom-output",
    ]);

    expect(await pathExists(join(tempDir, "custom-output/index.ts"))).toBe(true);
  });

  it("uses --module flag to target specific module", async () => {
    const { scaffoldCrudCommand } = await import("../commands/scaffold-crud.js");

    // Create multiple modules
    for (const name of ["mod1", "mod2"]) {
      const modDir = join(tempDir, `modules/${name}`);
      await mkdir(join(modDir, "src/widgets"), { recursive: true });
      await writeFile(
        join(modDir, "package.json"),
        JSON.stringify({ name: `@test/${name}`, dependencies: {} }),
      );
      await writeFile(join(modDir, "src/widgets/index.ts"), "export {};\n");
    }
    await mkdir(join(tempDir, "packages"), { recursive: true });

    await scaffoldCrudCommand.parseAsync([
      "node", "simplix", "product", "--module", "mod2",
    ]);

    expect(await pathExists(join(tempDir, "modules/mod2/src/widgets/product/index.ts"))).toBe(true);
    expect(await pathExists(join(tempDir, "modules/mod1/src/widgets/product/index.ts"))).toBe(false);
  });

  it("skips existing widget files", async () => {
    const { scaffoldCrudCommand } = await import("../commands/scaffold-crud.js");
    const { log } = await import("../utils/logger.js");

    const modDir = join(tempDir, "modules/mymod");
    await mkdir(join(modDir, "src/widgets/product"), { recursive: true });
    await writeFile(
      join(modDir, "package.json"),
      JSON.stringify({ name: "@test/mymod", dependencies: {} }),
    );
    await writeFile(join(modDir, "src/widgets/index.ts"), "export {};\n");
    await writeFile(join(modDir, "src/widgets/product/list.tsx"), "existing");
    await mkdir(join(tempDir, "packages"), { recursive: true });

    await scaffoldCrudCommand.parseAsync(["node", "simplix", "product"]);

    // list.tsx should not be overwritten
    const content = await readFile(join(modDir, "src/widgets/product/list.tsx"), "utf-8");
    expect(content).toBe("existing");
    expect(log.warn).toHaveBeenCalledWith(expect.stringContaining("Skipping list.tsx"));
  });

  it("adds dependencies to module package.json", async () => {
    const { scaffoldCrudCommand } = await import("../commands/scaffold-crud.js");

    const modDir = join(tempDir, "modules/mymod");
    await mkdir(join(modDir, "src/widgets"), { recursive: true });
    await writeFile(
      join(modDir, "package.json"),
      JSON.stringify({ name: "@test/mymod", dependencies: {} }),
    );
    await writeFile(join(modDir, "src/widgets/index.ts"), "export {};\n");
    await mkdir(join(tempDir, "packages"), { recursive: true });

    await scaffoldCrudCommand.parseAsync(["node", "simplix", "product"]);

    const pkgJson = JSON.parse(await readFile(join(modDir, "package.json"), "utf-8"));
    expect(pkgJson.dependencies["@simplix-react/ui"]).toBe("catalog:");
    expect(pkgJson.dependencies["@simplix-react/i18n"]).toBe("catalog:");
  });

  it("updates widgets/index.ts with entity exports", async () => {
    const { scaffoldCrudCommand } = await import("../commands/scaffold-crud.js");

    const modDir = join(tempDir, "modules/mymod");
    await mkdir(join(modDir, "src/widgets"), { recursive: true });
    await writeFile(
      join(modDir, "package.json"),
      JSON.stringify({ name: "@test/mymod", dependencies: {} }),
    );
    await writeFile(join(modDir, "src/widgets/index.ts"), "export {};\n");
    await mkdir(join(tempDir, "packages"), { recursive: true });

    await scaffoldCrudCommand.parseAsync(["node", "simplix", "product"]);

    const content = await readFile(join(modDir, "src/widgets/index.ts"), "utf-8");
    expect(content).toContain("ProductList");
    expect(content).toContain("ProductForm");
    expect(content).toContain("ProductDetail");
  });

  it("uses snapshot entity fields when schema has no parseable fields", async () => {
    const { scaffoldCrudCommand } = await import("../commands/scaffold-crud.js");

    const modDir = join(tempDir, "modules/mymod");
    await mkdir(join(modDir, "src/widgets"), { recursive: true });
    await writeFile(
      join(modDir, "package.json"),
      JSON.stringify({ name: "@test/mymod", dependencies: {} }),
    );
    await writeFile(join(modDir, "src/widgets/index.ts"), "export {};\n");

    // Create a domain package with a schema that won't parse (no z.object match for "order")
    const domainDir = join(tempDir, "packages/myapp-domain-order/src");
    await mkdir(domainDir, { recursive: true });
    await writeFile(
      join(domainDir, "schemas.ts"),
      `export const unrelatedSchema = z.object({ foo: z.string() });`,
    );
    await writeFile(
      join(tempDir, "packages/myapp-domain-order/package.json"),
      JSON.stringify({ name: "@test/myapp-domain-order" }),
    );

    // Create a snapshot so entityFieldsToFieldInfo is exercised as fallback
    await writeFile(
      join(tempDir, "packages/myapp-domain-order/.openapi-snapshot.json"),
      JSON.stringify({
        version: 2,
        generatedAt: "2024-01-01",
        specSource: "api.json",
        entities: [{
          name: "order",
          pascalName: "Order",
          pluralName: "orders",
          path: "/orders",
          fields: [
            { name: "id", snakeName: "id", type: "string", required: true, nullable: false, zodType: "" },
            { name: "total", snakeName: "total", type: "number", required: true, nullable: false, zodType: "" },
            { name: "status", snakeName: "status", type: "string", enum: ["placed", "shipped"], required: true, nullable: false, zodType: "" },
          ],
          queryParams: [],
          operations: [
            { name: "list", method: "GET", path: "/orders", role: "list", hasInput: false, operationId: "listOrders", queryParams: [] },
            { name: "get", method: "GET", path: "/orders/:id", role: "get", hasInput: false, operationId: "getOrder", queryParams: [] },
          ],
          tags: [],
        }],
      }),
    );

    await scaffoldCrudCommand.parseAsync(["node", "simplix", "order"]);

    const widgetsDir = join(modDir, "src/widgets/order");
    expect(await pathExists(join(widgetsDir, "list.tsx"))).toBe(true);

    const listContent = await readFile(join(widgetsDir, "list.tsx"), "utf-8");
    expect(listContent).toContain("Order");
    expect(listContent).toContain("total");
  });

  it("uses crud.config.ts hook names when available", async () => {
    const { scaffoldCrudCommand } = await import("../commands/scaffold-crud.js");
    const { findCrudConfigForEntity } = await import("../config/crud-config-loader.js");

    vi.mocked(findCrudConfigForEntity).mockResolvedValue({
      list: "searchItems",
      get: "getItemById",
      create: "createItem",
      update: "updateItem",
      delete: "deleteItem",
    });

    const modDir = join(tempDir, "modules/mymod");
    await mkdir(join(modDir, "src/widgets"), { recursive: true });
    await writeFile(
      join(modDir, "package.json"),
      JSON.stringify({ name: "@test/mymod", dependencies: {} }),
    );
    await writeFile(join(modDir, "src/widgets/index.ts"), "export {};\n");
    await mkdir(join(tempDir, "packages"), { recursive: true });

    await scaffoldCrudCommand.parseAsync(["node", "simplix", "item"]);

    const widgetsDir = join(modDir, "src/widgets/item");
    const listContent = await readFile(join(widgetsDir, "list.tsx"), "utf-8");
    expect(listContent).toContain("useSearchItems");
  });

  it("generates locale JSON files for widgets", async () => {
    const { scaffoldCrudCommand } = await import("../commands/scaffold-crud.js");

    const modDir = join(tempDir, "modules/mymod");
    await mkdir(join(modDir, "src/widgets"), { recursive: true });
    await mkdir(join(modDir, "src/locales/widgets"), { recursive: true });
    await writeFile(
      join(modDir, "package.json"),
      JSON.stringify({ name: "@test/mymod", dependencies: {} }),
    );
    await writeFile(join(modDir, "src/widgets/index.ts"), "export {};\n");
    await writeFile(join(modDir, "src/locales/widgets/en.json"), "{}");
    await writeFile(join(modDir, "src/locales/widgets/ko.json"), "{}");
    await mkdir(join(tempDir, "packages"), { recursive: true });

    await scaffoldCrudCommand.parseAsync(["node", "simplix", "product"]);

    const enJson = JSON.parse(await readFile(join(modDir, "src/locales/widgets/en.json"), "utf-8"));
    expect(enJson.product).toBeDefined();
    expect(enJson.common).toBeDefined();
  });

  it("updates tsup.config.ts with pages entry", async () => {
    const { scaffoldCrudCommand } = await import("../commands/scaffold-crud.js");

    const modDir = join(tempDir, "modules/mymod");
    await mkdir(join(modDir, "src/widgets"), { recursive: true });
    await writeFile(
      join(modDir, "package.json"),
      JSON.stringify({ name: "@test/mymod", dependencies: {}, exports: {} }),
    );
    await writeFile(join(modDir, "src/widgets/index.ts"), "export {};\n");
    await writeFile(join(modDir, "src/index.ts"), 'export * from "./widgets";\n');
    await writeFile(
      join(modDir, "tsup.config.ts"),
      `export default { entry: { "index": "src/index.ts", "widgets/index": "src/widgets/index.ts" } };`,
    );
    await mkdir(join(tempDir, "packages"), { recursive: true });

    await scaffoldCrudCommand.parseAsync(["node", "simplix", "product"]);

    const tsupContent = await readFile(join(modDir, "tsup.config.ts"), "utf-8");
    expect(tsupContent).toContain("pages/index");
  });

  it("updates package.json with pages export", async () => {
    const { scaffoldCrudCommand } = await import("../commands/scaffold-crud.js");

    const modDir = join(tempDir, "modules/mymod");
    await mkdir(join(modDir, "src/widgets"), { recursive: true });
    await writeFile(
      join(modDir, "package.json"),
      JSON.stringify({
        name: "@test/mymod",
        dependencies: {},
        exports: { ".": "./dist/index.js" },
      }),
    );
    await writeFile(join(modDir, "src/widgets/index.ts"), "export {};\n");
    await writeFile(join(modDir, "src/index.ts"), 'export * from "./widgets";\n');
    await mkdir(join(tempDir, "packages"), { recursive: true });

    await scaffoldCrudCommand.parseAsync(["node", "simplix", "product"]);

    const pkgJson = JSON.parse(await readFile(join(modDir, "package.json"), "utf-8"));
    expect(pkgJson.exports["./pages"]).toBeDefined();
  });

  it("updates locales/index.ts with widgets component", async () => {
    const { scaffoldCrudCommand } = await import("../commands/scaffold-crud.js");

    const modDir = join(tempDir, "modules/mymod");
    await mkdir(join(modDir, "src/widgets"), { recursive: true });
    await mkdir(join(modDir, "src/locales/widgets"), { recursive: true });
    await writeFile(
      join(modDir, "package.json"),
      JSON.stringify({ name: "@test/mymod", dependencies: {} }),
    );
    await writeFile(join(modDir, "src/widgets/index.ts"), "export {};\n");
    await writeFile(join(modDir, "src/locales/widgets/en.json"), "{}");
    await writeFile(join(modDir, "src/locales/widgets/ko.json"), "{}");
    await writeFile(
      join(modDir, "src/locales/index.ts"),
      `export const localeConfig = { components: { features: { en: () => import("./features/en.json") } } };`,
    );
    await mkdir(join(tempDir, "packages"), { recursive: true });

    await scaffoldCrudCommand.parseAsync(["node", "simplix", "product"]);

    const localesIndex = await readFile(join(modDir, "src/locales/index.ts"), "utf-8");
    expect(localesIndex).toContain("widgets");
  });

  it("generates page files and updates pages/index.ts", async () => {
    const { scaffoldCrudCommand } = await import("../commands/scaffold-crud.js");

    const modDir = join(tempDir, "modules/mymod");
    await mkdir(join(modDir, "src/widgets"), { recursive: true });
    await writeFile(
      join(modDir, "package.json"),
      JSON.stringify({ name: "@test/mymod", dependencies: {} }),
    );
    await writeFile(join(modDir, "src/widgets/index.ts"), "export {};\n");
    await writeFile(join(modDir, "src/index.ts"), 'export * from "./widgets";\n');
    await mkdir(join(tempDir, "packages"), { recursive: true });

    await scaffoldCrudCommand.parseAsync(["node", "simplix", "product"]);

    // Pages should be generated
    const pagesDir = join(modDir, "src/pages/product");
    expect(await pathExists(join(pagesDir, "crud-page.tsx"))).toBe(true);
    expect(await pathExists(join(pagesDir, "index.ts"))).toBe(true);

    // pages/index.ts should be created
    const pagesIndex = await readFile(join(modDir, "src/pages/index.ts"), "utf-8");
    expect(pagesIndex).toContain("ProductCrudPage");

    // src/index.ts should be updated with pages export
    const srcIndex = await readFile(join(modDir, "src/index.ts"), "utf-8");
    expect(srcIndex).toContain('"./pages"');
  });

  it("generates tree CRUD when crud config has tree operation", async () => {
    const { scaffoldCrudCommand } = await import("../commands/scaffold-crud.js");
    const { findCrudConfigForEntity } = await import("../config/crud-config-loader.js");

    vi.mocked(findCrudConfigForEntity).mockResolvedValue({
      list: "searchCategories",
      get: "getCategoryById",
      create: "createCategory",
      update: "updateCategory",
      delete: "deleteCategory",
      tree: "getCategoryTree",
    });

    const modDir = join(tempDir, "modules/mymod");
    await mkdir(join(modDir, "src/widgets"), { recursive: true });
    await writeFile(
      join(modDir, "package.json"),
      JSON.stringify({ name: "@test/mymod", dependencies: {} }),
    );
    await writeFile(join(modDir, "src/widgets/index.ts"), "export {};\n");

    // Create domain with tree-related fields
    const domainDir = join(tempDir, "packages/myapp-domain-category/src");
    await mkdir(domainDir, { recursive: true });
    await writeFile(
      join(domainDir, "schemas.ts"),
      `export const categorySchema = z.object({
        id: z.string(),
        name: z.string(),
        parentId: z.string().optional(),
        sortOrder: z.number(),
      });`,
    );
    await writeFile(
      join(tempDir, "packages/myapp-domain-category/package.json"),
      JSON.stringify({ name: "@test/myapp-domain-category" }),
    );

    await scaffoldCrudCommand.parseAsync(["node", "simplix", "category"]);

    const widgetsDir = join(modDir, "src/widgets/category");
    // Should generate tree.tsx instead of list.tsx
    expect(await pathExists(join(widgetsDir, "tree.tsx"))).toBe(true);
    expect(await pathExists(join(widgetsDir, "list.tsx"))).toBe(false);

    const treeContent = await readFile(join(widgetsDir, "tree.tsx"), "utf-8");
    expect(treeContent).toContain("CategoryTree");
    expect(treeContent).toContain("CrudTree");
  });

  it("generates hub page when entity has no list operation", async () => {
    const { scaffoldCrudCommand } = await import("../commands/scaffold-crud.js");
    const { findCrudConfigForEntity } = await import("../config/crud-config-loader.js");

    vi.mocked(findCrudConfigForEntity).mockResolvedValue({
      create: "createToken",
    });

    const modDir = join(tempDir, "modules/mymod");
    await mkdir(join(modDir, "src/widgets"), { recursive: true });
    await writeFile(
      join(modDir, "package.json"),
      JSON.stringify({ name: "@test/mymod", dependencies: {} }),
    );
    await writeFile(join(modDir, "src/widgets/index.ts"), "export {};\n");
    await mkdir(join(tempDir, "packages"), { recursive: true });

    await scaffoldCrudCommand.parseAsync(["node", "simplix", "token"]);

    const widgetsDir = join(modDir, "src/widgets/token");
    // No list since no list operation
    expect(await pathExists(join(widgetsDir, "list.tsx"))).toBe(false);
    // Form should exist since create exists
    expect(await pathExists(join(widgetsDir, "form.tsx"))).toBe(true);
    // No detail since no get
    expect(await pathExists(join(widgetsDir, "detail.tsx"))).toBe(false);

    // Hub page should be generated instead of crud page
    const pagesDir = join(modDir, "src/pages/token");
    expect(await pathExists(join(pagesDir, "list-page.tsx"))).toBe(true);
    expect(await pathExists(join(pagesDir, "crud-page.tsx"))).toBe(false);
  });

  it("detects filter params from snapshot query params", async () => {
    const { scaffoldCrudCommand } = await import("../commands/scaffold-crud.js");
    const { findCrudConfigForEntity } = await import("../config/crud-config-loader.js");
    vi.mocked(findCrudConfigForEntity).mockResolvedValue(null);

    const modDir = join(tempDir, "modules/mymod");
    await mkdir(join(modDir, "src/widgets"), { recursive: true });
    await writeFile(
      join(modDir, "package.json"),
      JSON.stringify({ name: "@test/mymod", dependencies: {} }),
    );
    await writeFile(join(modDir, "src/widgets/index.ts"), "export {};\n");

    // Create snapshot with query params for filters
    const domainDir = join(tempDir, "packages/myapp-domain-event");
    await mkdir(join(domainDir, "src"), { recursive: true });
    await writeFile(
      join(domainDir, "src/schemas.ts"),
      `export const eventSchema = z.object({
        id: z.string(),
        name: z.string(),
        status: z.enum(["active", "inactive"]),
        enabled: z.boolean(),
      });`,
    );
    await writeFile(
      join(domainDir, "package.json"),
      JSON.stringify({ name: "@test/myapp-domain-event" }),
    );
    await writeFile(
      join(domainDir, ".openapi-snapshot.json"),
      JSON.stringify({
        version: 2,
        generatedAt: "2024-01-01",
        specSource: "api.json",
        entities: [{
          name: "event",
          pascalName: "Event",
          pluralName: "events",
          path: "/events",
          fields: [
            { name: "id", snakeName: "id", type: "string", required: true, nullable: false, zodType: "" },
            { name: "name", snakeName: "name", type: "string", required: true, nullable: false, zodType: "" },
            { name: "status", snakeName: "status", type: "string", enum: ["active", "inactive"], required: true, nullable: false, zodType: "" },
            { name: "enabled", snakeName: "enabled", type: "boolean", required: true, nullable: false, zodType: "" },
          ],
          queryParams: [
            { name: "name.contains", type: "string" },
            { name: "status.in", type: "string" },
            { name: "enabled.equals", type: "string" },
          ],
          operations: [
            { name: "list", method: "GET", path: "/events/search", role: "list", hasInput: true, operationId: "searchEvents", queryParams: [] },
            { name: "get", method: "GET", path: "/events/:id", role: "get", hasInput: false, operationId: "getEvent", queryParams: [] },
            { name: "create", method: "POST", path: "/events", role: "create", hasInput: true, operationId: "createEvent", queryParams: [] },
            { name: "update", method: "PUT", path: "/events/:id", role: "update", hasInput: true, operationId: "updateEvent", queryParams: [] },
            { name: "delete", method: "DELETE", path: "/events/:id", role: "delete", hasInput: false, operationId: "deleteEvent", queryParams: [] },
          ],
          tags: [],
        }],
      }),
    );

    await scaffoldCrudCommand.parseAsync(["node", "simplix", "event"]);

    const widgetsDir = join(modDir, "src/widgets/event");
    const listContent = await readFile(join(widgetsDir, "list.tsx"), "utf-8");
    // Should contain filter-related code
    expect(listContent).toContain("Event");
  });

  it("does not duplicate exports in widgets/index.ts on second run", async () => {
    const { scaffoldCrudCommand } = await import("../commands/scaffold-crud.js");

    const modDir = join(tempDir, "modules/mymod");
    await mkdir(join(modDir, "src/widgets/item"), { recursive: true });
    await writeFile(
      join(modDir, "package.json"),
      JSON.stringify({ name: "@test/mymod", dependencies: {} }),
    );
    // Already has item exports
    await writeFile(
      join(modDir, "src/widgets/index.ts"),
      'export { ItemList, ItemListToolbar, useItemList } from "./item";\n',
    );
    // Already has widget files
    await writeFile(join(modDir, "src/widgets/item/list.tsx"), "existing list");
    await writeFile(join(modDir, "src/widgets/item/form.tsx"), "existing form");
    await writeFile(join(modDir, "src/widgets/item/detail.tsx"), "existing detail");
    await writeFile(join(modDir, "src/widgets/item/index.ts"), "existing index");
    await mkdir(join(tempDir, "packages"), { recursive: true });

    await scaffoldCrudCommand.parseAsync(["node", "simplix", "item"]);

    const indexContent = await readFile(join(modDir, "src/widgets/index.ts"), "utf-8");
    // Should not duplicate the export line (it already has "./item")
    const lineMatches = indexContent.match(/from "\.\/item"/g);
    expect(lineMatches?.length).toBe(1);
  });
});
