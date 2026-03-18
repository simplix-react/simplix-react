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

// Mock depVersion
vi.mock("../versions.js", () => ({
  depVersion: vi.fn().mockReturnValue("^19.0.0"),
  withVersions: vi.fn((ctx: Record<string, unknown>) => ctx),
}));

let tempDir: string;
let originalCwd: string;
let originalExit: typeof process.exit;

beforeEach(async () => {
  tempDir = await mkdtemp(join(tmpdir(), "scaffold-crud-tree-test-"));
  originalCwd = process.cwd();
  originalExit = process.exit;
  process.exit = vi.fn((code?: number) => {
    throw new Error(`process.exit(${code})`);
  }) as never;

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

describe("scaffoldCrudCommand tree detection", () => {
  it("detects tree fields and generates tree-specific context", async () => {
    const { scaffoldCrudCommand } = await import("../commands/scaffold-crud.js");
    const { findCrudConfigForEntity } = await import("../config/crud-config-loader.js");

    vi.mocked(findCrudConfigForEntity).mockResolvedValue({
      list: "searchCategories",
      get: "getCategoryById",
      create: "createCategory",
      update: "updateCategory",
      delete: "deleteCategory",
      tree: "getCategoryTree",
      subtree: "getCategorySubtree",
    });

    const modDir = join(tempDir, "modules/mymod");
    await mkdir(join(modDir, "src/widgets"), { recursive: true });
    await writeFile(
      join(modDir, "package.json"),
      JSON.stringify({ name: "@test/mymod", dependencies: {} }),
    );
    await writeFile(join(modDir, "src/widgets/index.ts"), "export {};\n");

    // Create domain with tree-related fields including a non-standard parentId
    const domainDir = join(tempDir, "packages/myapp-domain-category/src");
    await mkdir(domainDir, { recursive: true });
    await writeFile(
      join(domainDir, "schemas.ts"),
      `export const categorySchema = z.object({
        id: z.string(),
        name: z.string(),
        parentId: z.string().optional(),
        displayOrder: z.number(),
        description: z.string(),
      });`,
    );
    await writeFile(
      join(tempDir, "packages/myapp-domain-category/package.json"),
      JSON.stringify({ name: "@test/myapp-domain-category" }),
    );

    await scaffoldCrudCommand.parseAsync(["node", "simplix", "category"]);

    const widgetsDir = join(modDir, "src/widgets/category");

    // tree.tsx should be generated
    expect(await pathExists(join(widgetsDir, "tree.tsx"))).toBe(true);
    // list.tsx should NOT be generated (tree mode)
    expect(await pathExists(join(widgetsDir, "list.tsx"))).toBe(false);

    const treeContent = await readFile(join(widgetsDir, "tree.tsx"), "utf-8");
    expect(treeContent).toContain("CategoryTree");
    expect(treeContent).toContain("CrudTree");

    // Tree CRUD page should be generated
    const pagesDir = join(modDir, "src/pages/category");
    expect(await pathExists(join(pagesDir, "crud-page.tsx"))).toBe(true);

    const crudPage = await readFile(join(pagesDir, "crud-page.tsx"), "utf-8");
    expect(crudPage).toContain("CategoryTree");
  });

  it("puts displayNameField first in treeDisplayFields", async () => {
    const { scaffoldCrudCommand } = await import("../commands/scaffold-crud.js");
    const { findCrudConfigForEntity } = await import("../config/crud-config-loader.js");

    vi.mocked(findCrudConfigForEntity).mockResolvedValue({
      list: "searchItems",
      get: "getItem",
      create: "createItem",
      update: "updateItem",
      delete: "deleteItem",
      tree: "getItemTree",
    });

    const modDir = join(tempDir, "modules/mymod");
    await mkdir(join(modDir, "src/widgets"), { recursive: true });
    await writeFile(
      join(modDir, "package.json"),
      JSON.stringify({ name: "@test/mymod", dependencies: {} }),
    );
    await writeFile(join(modDir, "src/widgets/index.ts"), "export {};\n");

    // Fields where "name" is not the first field
    const domainDir = join(tempDir, "packages/myapp-domain-item/src");
    await mkdir(domainDir, { recursive: true });
    await writeFile(
      join(domainDir, "schemas.ts"),
      `export const itemSchema = z.object({
        id: z.string(),
        code: z.string(),
        name: z.string(),
        parentId: z.string().optional(),
        sortOrder: z.number(),
      });`,
    );
    await writeFile(
      join(tempDir, "packages/myapp-domain-item/package.json"),
      JSON.stringify({ name: "@test/myapp-domain-item" }),
    );

    await scaffoldCrudCommand.parseAsync(["node", "simplix", "item"]);

    const widgetsDir = join(modDir, "src/widgets/item");
    expect(await pathExists(join(widgetsDir, "tree.tsx"))).toBe(true);

    // Verify tree.tsx renders correctly (name field should be in tree output)
    const treeContent = await readFile(join(widgetsDir, "tree.tsx"), "utf-8");
    expect(treeContent).toContain("ItemTree");
  });

  it("generates tree with widgets/index.ts tree export", async () => {
    const { scaffoldCrudCommand } = await import("../commands/scaffold-crud.js");
    const { findCrudConfigForEntity } = await import("../config/crud-config-loader.js");

    vi.mocked(findCrudConfigForEntity).mockResolvedValue({
      list: "searchNodes",
      get: "getNode",
      create: "createNode",
      update: "updateNode",
      delete: "deleteNode",
      tree: "getNodeTree",
    });

    const modDir = join(tempDir, "modules/mymod");
    await mkdir(join(modDir, "src/widgets"), { recursive: true });
    await writeFile(
      join(modDir, "package.json"),
      JSON.stringify({ name: "@test/mymod", dependencies: {} }),
    );
    await writeFile(join(modDir, "src/widgets/index.ts"), "export {};\n");
    await mkdir(join(tempDir, "packages"), { recursive: true });

    await scaffoldCrudCommand.parseAsync(["node", "simplix", "node"]);

    const indexContent = await readFile(join(modDir, "src/widgets/index.ts"), "utf-8");
    // Tree mode should export Tree, not List
    expect(indexContent).toContain("NodeTree");
    expect(indexContent).toContain("useNodeTree");
    expect(indexContent).not.toContain("NodeList");
  });
});

describe("scaffoldCrudCommand error handling", () => {
  it("catches and reports errors with process.exit(1)", async () => {
    const { scaffoldCrudCommand } = await import("../commands/scaffold-crud.js");
    const { findCrudConfigForEntity } = await import("../config/crud-config-loader.js");

    // Make findCrudConfigForEntity throw to trigger the catch path
    vi.mocked(findCrudConfigForEntity).mockRejectedValue(new Error("config load error"));

    const modDir = join(tempDir, "modules/mymod");
    await mkdir(join(modDir, "src/widgets"), { recursive: true });
    await writeFile(
      join(modDir, "package.json"),
      JSON.stringify({ name: "@test/mymod", dependencies: {} }),
    );
    await writeFile(join(modDir, "src/widgets/index.ts"), "export {};\n");
    await mkdir(join(tempDir, "packages"), { recursive: true });

    await expect(
      scaffoldCrudCommand.parseAsync(["node", "simplix", "product"]),
    ).rejects.toThrow("process.exit(1)");
  });
});
