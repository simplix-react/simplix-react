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

// Mock depVersion (called by ensureModuleDeps)
vi.mock("../versions.js", () => ({
  depVersion: vi.fn().mockReturnValue("^19.0.0"),
  withVersions: vi.fn((ctx: Record<string, unknown>) => ctx),
}));

// `findCrudConfigForEntity` is deliberately NOT mocked here: the key a crud.config.ts is looked up
// under is half of what these tests are about.

let tempDir: string;
let originalCwd: string;
let originalExit: typeof process.exit;

beforeEach(async () => {
  tempDir = await mkdtemp(join(tmpdir(), "scaffold-crud-entity-case-"));
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

/** The module a scaffold run writes its widgets and pages into. */
async function writeModule(): Promise<string> {
  const modDir = join(tempDir, "modules/integration");
  await mkdir(join(modDir, "src/widgets"), { recursive: true });
  await writeFile(
    join(modDir, "package.json"),
    JSON.stringify({ name: "@test/integration", dependencies: {} }),
  );
  await writeFile(join(modDir, "src/widgets/index.ts"), "export {};\n");
  await writeFile(join(modDir, "src/index.ts"), 'export * from "./widgets";\n');
  return modDir;
}

/**
 * A domain package as `simplix meta` leaves one: a crud.config.ts keyed by the entity, a schema
 * the fields are read from, and a generated contract stating the operations.
 *
 * @param crudKey the key the crud.config.ts records the entity under
 * @param roles role → hook id, as the crud.config.ts records them
 * @param contractOps operation names the generated contract declares, or undefined to write none
 */
async function writeDomainPackage(
  crudKey: string,
  roles: Record<string, string>,
  contractOps?: string[],
): Promise<void> {
  const pkgDir = join(tempDir, "packages/acme-domain-integration");
  await mkdir(join(pkgDir, "src/generated"), { recursive: true });
  await writeFile(
    join(pkgDir, "package.json"),
    JSON.stringify({ name: "@acme/domain-integration" }),
  );
  const entries = Object.entries(roles)
    .map(([role, hookId]) => `    ${role}: "${hookId}",`)
    .join("\n");
  await writeFile(
    join(pkgDir, "crud.config.ts"),
    `export default {\n  ${crudKey}: {\n${entries}\n  },\n};\n`,
  );
  await writeFile(
    join(pkgDir, "src/schemas.ts"),
    `export const apiClientSchema = z.object({
      id: z.string().uuid(),
      name: z.string().min(1),
      secret: z.string(),
      enabled: z.boolean(),
    });`,
  );
  if (contractOps) {
    const ops = contractOps.map((name) => `        ${name}: {},`).join("\n");
    await writeFile(
      join(pkgDir, "src/generated/contract.ts"),
      `export const contract = {\n  apiClient: {\n    operations: {\n${ops}\n    },\n  },\n};\n`,
    );
  }
}

describe("the entity argument's case does not change what is generated", () => {
  const fullRoles = {
    list: "searchApiClients",
    get: "getApiClient",
    getForEdit: "getApiClientForEdit",
    create: "createApiClient",
    update: "updateApiClient",
    delete: "deleteApiClient",
  };

  /**
   * Scaffolds one entity spelling into a fresh module.
   *
   * @param spelling the entity argument, as a person types it
   * @returns the module the run wrote into
   */
  async function scaffoldInto(spelling: string): Promise<{ modDir: string }> {
    const { scaffoldCrudCommand } = await import("../commands/scaffold-crud.js");
    const modDir = await writeModule();
    await writeDomainPackage("ApiClient", fullRoles, [
      "list",
      "get",
      "create",
      "update",
      "delete",
    ]);

    await scaffoldCrudCommand.parseAsync([
      "node", "simplix", spelling, "--module", "integration",
    ]);

    return { modDir };
  }

  /**
   * Scaffolds one entity spelling and reads back what it wrote.
   *
   * @param spelling the entity argument, as a person types it
   * @returns the page barrel, the form widget, and whether the CRUD page was written
   */
  async function scaffold(spelling: string): Promise<{
    pageIndex: string;
    form: string;
    hasCrudPage: boolean;
  }> {
    const { modDir } = await scaffoldInto(spelling);
    const pagesDir = join(modDir, "src/pages/api-client");
    return {
      pageIndex: await readFile(join(pagesDir, "index.ts"), "utf-8"),
      form: await readFile(join(modDir, "src/widgets/api-client/form.tsx"), "utf-8"),
      hasCrudPage: await pathExists(join(pagesDir, "crud-page.tsx")),
    };
  }

  it("writes the pages and wires the form's hooks for a PascalCase argument", async () => {
    const { pageIndex, form, hasCrudPage } = await scaffold("ApiClient");

    expect(hasCrudPage).toBe(true);
    expect(pageIndex.trim()).not.toBe("");
    expect(pageIndex).toContain("ApiClientCrudPage");
    expect(form).toContain("useGetApiClientForEdit");
    expect(form).toContain("useCreateApiClient");
    expect(form).toContain("useUpdateApiClient");
    expect(form).not.toContain("TODO: Wire up");
  });

  it("writes the pages and wires the form's hooks for a camelCase argument", async () => {
    const { pageIndex, form, hasCrudPage } = await scaffold("apiClient");

    expect(hasCrudPage).toBe(true);
    expect(pageIndex.trim()).not.toBe("");
    expect(pageIndex).toContain("ApiClientCrudPage");
    expect(form).toContain("useGetApiClientForEdit");
    expect(form).toContain("useCreateApiClient");
    expect(form).toContain("useUpdateApiClient");
    expect(form).not.toContain("TODO: Wire up");
  });

  it("writes the pages and wires the form's hooks for a kebab-case argument", async () => {
    const { pageIndex, form, hasCrudPage } = await scaffold("api-client");

    expect(hasCrudPage).toBe(true);
    expect(pageIndex.trim()).not.toBe("");
    expect(form).toContain("useGetApiClientForEdit");
    expect(form).not.toContain("TODO: Wire up");
  });

  it("resolves the project's own page template the same way from either spelling", async () => {
    // The template a project has taken over is chosen by the page's key, which the entity's name
    // never reaches. Held here so the two variables stay separated: a page that comes out wrong
    // for one spelling is the argument's case, never which template answered.
    async function withProjectTemplate(spelling: string): Promise<string> {
      const templateDir = join(tempDir, ".simplix/templates");
      await mkdir(templateDir, { recursive: true });
      await writeFile(
        join(templateDir, "crud-page.hbs"),
        "// @simplix-generated page/console\nexport function {{EntityPascal}}CrudPage() {}\n",
      );
      const { modDir } = await scaffoldInto(spelling);
      return readFile(join(modDir, "src/pages/api-client/crud-page.tsx"), "utf-8");
    }

    const pascal = await withProjectTemplate("ApiClient");
    await rm(join(tempDir, "modules"), { recursive: true, force: true });
    await rm(join(tempDir, "packages"), { recursive: true, force: true });
    const camel = await withProjectTemplate("apiClient");

    expect(pascal).toContain("export function ApiClientCrudPage()");
    expect(camel).toBe(pascal);
  });

  it("renders the same form from either spelling", async () => {
    const pascal = await scaffold("ApiClient");
    await rm(join(tempDir, "modules"), { recursive: true, force: true });
    await rm(join(tempDir, "packages"), { recursive: true, force: true });
    const camel = await scaffold("apiClient");

    expect(camel.form).toBe(pascal.form);
    expect(camel.pageIndex).toBe(pascal.pageIndex);
  });
});

describe("a page the templates render as nothing is reported, not written", () => {
  // An entity whose read is `getForEdit` alone: the page templates draw a list-and-detail page or
  // a create hub, and operations offering neither leave the barrel empty.
  const rolesWithoutGet = {
    list: "searchApiClients",
    getForEdit: "getApiClientForEdit",
    create: "createApiClient",
    update: "updateApiClient",
    delete: "deleteApiClient",
  };


  it("fails the run instead of reporting a generated page", async () => {
    const { scaffoldCrudCommand } = await import("../commands/scaffold-crud.js");
    const { log } = await import("../utils/logger.js");
    const modDir = await writeModule();
    await writeDomainPackage("ApiClient", rolesWithoutGet);

    await expect(
      scaffoldCrudCommand.parseAsync([
        "node", "simplix", "ApiClient", "--module", "integration",
      ]),
    ).rejects.toThrow("process.exit(1)");

    expect(log.error).toHaveBeenCalledWith(
      expect.stringContaining("pages/api-client/index.ts"),
    );
    expect(log.info).not.toHaveBeenCalledWith(
      expect.stringContaining("Generated 1 page files"),
    );
    // Nothing is left behind for a dev server to import.
    expect(await pathExists(join(modDir, "src/pages/api-client/index.ts"))).toBe(false);
  });

  it("fails the same way for the other spelling", async () => {
    const { scaffoldCrudCommand } = await import("../commands/scaffold-crud.js");
    const modDir = await writeModule();
    await writeDomainPackage("ApiClient", rolesWithoutGet);

    await expect(
      scaffoldCrudCommand.parseAsync([
        "node", "simplix", "apiClient", "--module", "integration",
      ]),
    ).rejects.toThrow("process.exit(1)");

    expect(await pathExists(join(modDir, "src/pages/api-client/index.ts"))).toBe(false);
  });
});

