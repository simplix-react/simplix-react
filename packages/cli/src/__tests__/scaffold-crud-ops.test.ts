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
  tempDir = await mkdtemp(join(tmpdir(), "scaffold-crud-ops-test-"));
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

describe("scaffoldCrudCommand contract-based operation parsing", () => {
  it("detects operations from generated contract.ts", async () => {
    const { scaffoldCrudCommand } = await import("../commands/scaffold-crud.js");

    const modDir = join(tempDir, "modules/mymod");
    await mkdir(join(modDir, "src/widgets"), { recursive: true });
    await writeFile(
      join(modDir, "package.json"),
      JSON.stringify({ name: "@test/mymod", dependencies: {} }),
    );
    await writeFile(join(modDir, "src/widgets/index.ts"), "export {};\n");

    // Create generated contract with specific operations
    const genContractDir = join(tempDir, "packages/myapp-domain-event/src/generated");
    await mkdir(genContractDir, { recursive: true });
    await writeFile(
      join(genContractDir, "contract.ts"),
      `export const eventContract = {
        event: {
          operations: {
            list: { method: "GET", path: "/events" },
            get: { method: "GET", path: "/events/:id" },
            create: { method: "POST", path: "/events" },
          },
        },
      };`,
    );

    // Create schema
    const srcDir = join(tempDir, "packages/myapp-domain-event/src");
    await writeFile(
      join(srcDir, "schemas.ts"),
      `export const eventSchema = z.object({
        id: z.string(),
        title: z.string(),
      });`,
    );
    await writeFile(
      join(tempDir, "packages/myapp-domain-event/package.json"),
      JSON.stringify({ name: "@test/myapp-domain-event" }),
    );

    await scaffoldCrudCommand.parseAsync(["node", "simplix", "event"]);

    const widgetsDir = join(modDir, "src/widgets/event");
    // Should have list (detected from contract)
    expect(await pathExists(join(widgetsDir, "list.tsx"))).toBe(true);
    // Should have form (create detected)
    expect(await pathExists(join(widgetsDir, "form.tsx"))).toBe(true);
    // Should have detail (get detected)
    expect(await pathExists(join(widgetsDir, "detail.tsx"))).toBe(true);
  });

  it("handles customizeApi patch operations", async () => {
    const { scaffoldCrudCommand } = await import("../commands/scaffold-crud.js");

    const modDir = join(tempDir, "modules/mymod");
    await mkdir(join(modDir, "src/widgets"), { recursive: true });
    await writeFile(
      join(modDir, "package.json"),
      JSON.stringify({ name: "@test/mymod", dependencies: {} }),
    );
    await writeFile(join(modDir, "src/widgets/index.ts"), "export {};\n");

    // Create generated contract with all operations
    const genContractDir = join(tempDir, "packages/myapp-domain-item/src/generated");
    await mkdir(genContractDir, { recursive: true });
    await writeFile(
      join(genContractDir, "contract.ts"),
      `export const itemContract = {
        item: {
          operations: {
            list: { method: "GET", path: "/items" },
            get: { method: "GET", path: "/items/:id" },
            create: { method: "POST", path: "/items" },
            update: { method: "PUT", path: "/items/:id" },
            delete: { method: "DELETE", path: "/items/:id" },
          },
        },
      };`,
    );

    // Create user-owned contract that patches operations
    const srcDir = join(tempDir, "packages/myapp-domain-item/src");
    await writeFile(
      join(srcDir, "contract.ts"),
      `import { customizeApi } from "@simplix-react/contract";
      export default customizeApi({
        item: {
          operations: {
            delete: null,
            archive: { method: "POST", path: "/items/:id/archive", role: "update" },
          },
        },
      });`,
    );

    await writeFile(
      join(srcDir, "schemas.ts"),
      `export const itemSchema = z.object({
        id: z.string(),
        name: z.string(),
      });`,
    );
    await writeFile(
      join(tempDir, "packages/myapp-domain-item/package.json"),
      JSON.stringify({ name: "@test/myapp-domain-item" }),
    );

    await scaffoldCrudCommand.parseAsync(["node", "simplix", "item"]);

    const widgetsDir = join(modDir, "src/widgets/item");
    // list, get, create, update should exist
    expect(await pathExists(join(widgetsDir, "list.tsx"))).toBe(true);
    expect(await pathExists(join(widgetsDir, "form.tsx"))).toBe(true);
    expect(await pathExists(join(widgetsDir, "detail.tsx"))).toBe(true);
  });

  it("defaults to all operations when no contract found", async () => {
    const { scaffoldCrudCommand } = await import("../commands/scaffold-crud.js");

    const modDir = join(tempDir, "modules/mymod");
    await mkdir(join(modDir, "src/widgets"), { recursive: true });
    await writeFile(
      join(modDir, "package.json"),
      JSON.stringify({ name: "@test/mymod", dependencies: {} }),
    );
    await writeFile(join(modDir, "src/widgets/index.ts"), "export {};\n");
    await mkdir(join(tempDir, "packages"), { recursive: true });

    await scaffoldCrudCommand.parseAsync(["node", "simplix", "thing"]);

    const widgetsDir = join(modDir, "src/widgets/thing");
    // With no contract, all operations default to true
    expect(await pathExists(join(widgetsDir, "list.tsx"))).toBe(true);
    expect(await pathExists(join(widgetsDir, "form.tsx"))).toBe(true);
    expect(await pathExists(join(widgetsDir, "detail.tsx"))).toBe(true);
  });

  it("detects operations from .openapi-snapshot.json entity operations", async () => {
    const { scaffoldCrudCommand } = await import("../commands/scaffold-crud.js");
    const { findCrudConfigForEntity } = await import("../config/crud-config-loader.js");

    vi.mocked(findCrudConfigForEntity).mockResolvedValue({
      list: "searchNotifications",
      get: "getNotification",
    });

    const modDir = join(tempDir, "modules/mymod");
    await mkdir(join(modDir, "src/widgets"), { recursive: true });
    await writeFile(
      join(modDir, "package.json"),
      JSON.stringify({ name: "@test/mymod", dependencies: {} }),
    );
    await writeFile(join(modDir, "src/widgets/index.ts"), "export {};\n");
    await mkdir(join(tempDir, "packages"), { recursive: true });

    await scaffoldCrudCommand.parseAsync(["node", "simplix", "notification"]);

    const widgetsDir = join(modDir, "src/widgets/notification");
    // Only list and get from crud config
    expect(await pathExists(join(widgetsDir, "list.tsx"))).toBe(true);
    expect(await pathExists(join(widgetsDir, "detail.tsx"))).toBe(true);
    // No create/update means no form
    expect(await pathExists(join(widgetsDir, "form.tsx"))).toBe(false);
  });

  it("generates locale JSON files with tree-specific keys", async () => {
    const { scaffoldCrudCommand } = await import("../commands/scaffold-crud.js");
    const { findCrudConfigForEntity } = await import("../config/crud-config-loader.js");

    vi.mocked(findCrudConfigForEntity).mockResolvedValue({
      list: "searchGroups",
      get: "getGroup",
      create: "createGroup",
      update: "updateGroup",
      delete: "deleteGroup",
      tree: "getGroupTree",
    });

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

    await scaffoldCrudCommand.parseAsync(["node", "simplix", "group"]);

    const enJson = JSON.parse(await readFile(join(modDir, "src/locales/widgets/en.json"), "utf-8"));
    expect(enJson.group).toBeDefined();
    // Tree entities should have sectionTitle key
    expect(enJson.group.sectionTitle).toBeDefined();
  });

  it("generates hub page keys for entities without list", async () => {
    const { scaffoldCrudCommand } = await import("../commands/scaffold-crud.js");
    const { findCrudConfigForEntity } = await import("../config/crud-config-loader.js");

    vi.mocked(findCrudConfigForEntity).mockResolvedValue({
      create: "createSetting",
      get: "getSetting",
    });

    const modDir = join(tempDir, "modules/mymod");
    await mkdir(join(modDir, "src/widgets"), { recursive: true });
    await mkdir(join(modDir, "src/locales/widgets"), { recursive: true });
    await writeFile(
      join(modDir, "package.json"),
      JSON.stringify({ name: "@test/mymod", dependencies: {} }),
    );
    await writeFile(join(modDir, "src/widgets/index.ts"), "export {};\n");
    await writeFile(join(modDir, "src/locales/widgets/en.json"), "{}");
    await mkdir(join(tempDir, "packages"), { recursive: true });

    await scaffoldCrudCommand.parseAsync(["node", "simplix", "setting"]);

    const enJson = JSON.parse(await readFile(join(modDir, "src/locales/widgets/en.json"), "utf-8"));
    expect(enJson.setting).toBeDefined();
    // No-list entities should have "title" instead of "settings"
    expect(enJson.setting.title).toBeDefined();
  });
});
