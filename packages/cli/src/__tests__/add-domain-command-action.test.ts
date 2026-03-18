import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mkdtemp, rm, readFile, mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { pathExists } from "../utils/fs.js";

// Mock prompts
vi.mock("prompts", () => ({
  default: vi.fn().mockResolvedValue({
    entities: "product,category",
    enableI18n: true,
  }),
}));

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

// Mock versions
vi.mock("../versions.js", () => ({
  withVersions: vi.fn((ctx: Record<string, unknown>) => ({
    ...ctx,
    fw: { cli: "^0.1.0", contract: "^0.2.0", react: "^0.3.0", form: "^0.4.0", mock: "^0.5.0", i18n: "^0.6.0", testing: "^0.7.0", ui: "^0.8.0", api: "^0.9.0" },
    fwExact: { cli: "0.1.0", contract: "0.2.0", react: "0.3.0" },
    deps: { zod: "^4.0.0", typescript: "^5.9.0", tanstackReactQuery: "^5.64.0", react: "^19.0.0", typesReact: "^19.0.0" },
  })),
  depVersion: vi.fn().mockReturnValue("^19.0.0"),
}));

// Mock config-loader
vi.mock("../config/config-loader.js", () => ({
  loadConfig: vi.fn().mockResolvedValue({
    api: { baseUrl: "/api" },
    i18n: { locales: ["en", "ko"] },
    packages: { prefix: "myapp" },
  }),
}));

// Mock config/types
vi.mock("../config/types.js", () => ({
  findSpecForDomain: vi.fn().mockReturnValue(null),
  findSpecBySource: vi.fn().mockReturnValue(null),
}));

// Mock plugin-registry
vi.mock("../openapi/plugin-registry.js", () => ({
  getSpecProfile: vi.fn().mockReturnValue(null),
}));

let tempDir: string;
let originalCwd: string;
let originalExit: typeof process.exit;

beforeEach(async () => {
  tempDir = await mkdtemp(join(tmpdir(), "add-domain-action-test-"));
  originalCwd = process.cwd();
  originalExit = process.exit;
  process.exit = vi.fn((code?: number) => {
    throw new Error(`process.exit(${code})`);
  }) as never;

  // Create a valid project root
  await writeFile(
    join(tempDir, "package.json"),
    JSON.stringify({ name: "@test/test-monorepo", private: true }),
  );
  await writeFile(join(tempDir, "pnpm-workspace.yaml"), "packages:\n  - packages/*\n");
  await mkdir(join(tempDir, "packages"), { recursive: true });

  process.chdir(tempDir);
});

afterEach(async () => {
  process.chdir(originalCwd);
  process.exit = originalExit;
  await rm(tempDir, { recursive: true, force: true });
  vi.restoreAllMocks();
});

describe("addDomainCommand action (non-interactive)", () => {
  it("creates domain package directory with required files", async () => {
    const { addDomainCommand } = await import("../commands/add-domain.js");

    await addDomainCommand.parseAsync(["node", "simplix", "product", "-y"]);

    const targetDir = join(tempDir, "packages/myapp-domain-product");
    expect(await pathExists(targetDir)).toBe(true);
    expect(await pathExists(join(targetDir, "package.json"))).toBe(true);
    expect(await pathExists(join(targetDir, "tsup.config.ts"))).toBe(true);
    expect(await pathExists(join(targetDir, "tsconfig.json"))).toBe(true);
    expect(await pathExists(join(targetDir, "src/index.ts"))).toBe(true);
  });

  it("creates non-OpenAPI template files (schemas, contract, hooks, mock)", async () => {
    const { addDomainCommand } = await import("../commands/add-domain.js");

    await addDomainCommand.parseAsync(["node", "simplix", "product", "-y"]);

    const targetDir = join(tempDir, "packages/myapp-domain-product");
    expect(await pathExists(join(targetDir, "src/schemas.ts"))).toBe(true);
    expect(await pathExists(join(targetDir, "src/contract.ts"))).toBe(true);
    expect(await pathExists(join(targetDir, "src/hooks.ts"))).toBe(true);
    expect(await pathExists(join(targetDir, "src/mock/index.ts"))).toBe(true);
    expect(await pathExists(join(targetDir, "src/mock/handlers.ts"))).toBe(true);
    expect(await pathExists(join(targetDir, "src/mock/seed.ts"))).toBe(true);
  });

  it("creates i18n files when enableI18n is true", async () => {
    const { addDomainCommand } = await import("../commands/add-domain.js");

    await addDomainCommand.parseAsync(["node", "simplix", "product", "-y"]);

    const targetDir = join(tempDir, "packages/myapp-domain-product");
    expect(await pathExists(join(targetDir, "src/translations.ts"))).toBe(true);
    expect(await pathExists(join(targetDir, "src/locales/en.json"))).toBe(true);
    expect(await pathExists(join(targetDir, "src/locales/ko.json"))).toBe(true);
  });

  it("skips i18n files when --no-i18n is passed", async () => {
    const { addDomainCommand } = await import("../commands/add-domain.js");

    await addDomainCommand.parseAsync(["node", "simplix", "product", "-y", "--no-i18n"]);

    const targetDir = join(tempDir, "packages/myapp-domain-product");
    expect(await pathExists(join(targetDir, "src/translations.ts"))).toBe(false);
    expect(await pathExists(join(targetDir, "src/locales/en.json"))).toBe(false);
  });

  it("exits with error if domain package already exists", async () => {
    const { addDomainCommand } = await import("../commands/add-domain.js");

    await mkdir(join(tempDir, "packages/myapp-domain-existing"), { recursive: true });

    await expect(
      addDomainCommand.parseAsync(["node", "simplix", "existing", "-y"]),
    ).rejects.toThrow("process.exit(1)");
  });

  it("exits with error if no package.json found", async () => {
    const { addDomainCommand } = await import("../commands/add-domain.js");

    const emptyDir = await mkdtemp(join(tmpdir(), "no-pkg-"));
    process.chdir(emptyDir);

    await expect(
      addDomainCommand.parseAsync(["node", "simplix", "product", "-y"]),
    ).rejects.toThrow("process.exit(1)");

    process.chdir(originalCwd);
    await rm(emptyDir, { recursive: true, force: true });
  });

  it("renders package.json with correct domain package name", async () => {
    const { addDomainCommand } = await import("../commands/add-domain.js");

    await addDomainCommand.parseAsync(["node", "simplix", "product", "-y"]);

    const targetDir = join(tempDir, "packages/myapp-domain-product");
    const pkgJson = JSON.parse(await readFile(join(targetDir, "package.json"), "utf-8"));
    expect(pkgJson.name).toBe("@test/myapp-domain-product");
  });

  it("adds @simplix-react/i18n dependency when i18n is enabled", async () => {
    const { addDomainCommand } = await import("../commands/add-domain.js");

    await addDomainCommand.parseAsync(["node", "simplix", "product", "-y"]);

    const targetDir = join(tempDir, "packages/myapp-domain-product");
    const pkgJson = JSON.parse(await readFile(join(targetDir, "package.json"), "utf-8"));
    expect(pkgJson.dependencies["@simplix-react/i18n"]).toBe("catalog:");
  });

  it("adds contract and react dependencies in non-OpenAPI mode", async () => {
    const { addDomainCommand } = await import("../commands/add-domain.js");

    await addDomainCommand.parseAsync(["node", "simplix", "product", "-y"]);

    const targetDir = join(tempDir, "packages/myapp-domain-product");
    const pkgJson = JSON.parse(await readFile(join(targetDir, "package.json"), "utf-8"));
    expect(pkgJson.dependencies["@simplix-react/contract"]).toBe("catalog:");
    expect(pkgJson.dependencies["@simplix-react/react"]).toBe("catalog:");
  });
});

describe("addDomainCommand action (OpenAPI mode)", () => {
  it("creates OpenAPI skeleton when spec config exists", async () => {
    const { addDomainCommand } = await import("../commands/add-domain.js");
    const { findSpecForDomain } = await import("../config/types.js");

    // Mock spec config to return an OpenAPI configuration
    vi.mocked(findSpecForDomain).mockReturnValue({
      spec: "openapi.json",
      domains: { api: ["api-tag"] },
    });

    // Create the OpenAPI spec file so isSpecUrl check passes
    await writeFile(join(tempDir, "openapi.json"), JSON.stringify({ openapi: "3.0.0" }));

    await addDomainCommand.parseAsync(["node", "simplix", "api", "-y"]);

    const targetDir = join(tempDir, "packages/myapp-domain-api");
    expect(await pathExists(join(targetDir, "src/mutator.ts"))).toBe(true);

    // OpenAPI mode should NOT create schemas.ts, contract.ts, hooks.ts
    expect(await pathExists(join(targetDir, "src/schemas.ts"))).toBe(false);
    expect(await pathExists(join(targetDir, "src/contract.ts"))).toBe(false);
    expect(await pathExists(join(targetDir, "src/hooks.ts"))).toBe(false);

    // package.json should have orval dependency
    const pkgJson = JSON.parse(await readFile(join(targetDir, "package.json"), "utf-8"));
    expect(pkgJson.devDependencies?.orval).toBeDefined();
    expect(pkgJson.dependencies?.["@simplix-react/api"]).toBe("catalog:");
  });

  it("falls back to non-OpenAPI mode when spec file does not exist", async () => {
    const { addDomainCommand } = await import("../commands/add-domain.js");
    const { findSpecForDomain } = await import("../config/types.js");
    const { log } = await import("../utils/logger.js");

    vi.mocked(findSpecForDomain).mockReturnValue({
      spec: "missing-spec.json",
      domains: { missing: ["tag"] },
    });

    await addDomainCommand.parseAsync(["node", "simplix", "missing", "-y"]);

    const targetDir = join(tempDir, "packages/myapp-domain-missing");
    // Should fall back to non-OpenAPI mode: schemas.ts should exist
    expect(await pathExists(join(targetDir, "src/schemas.ts"))).toBe(true);
    expect(log.warn).toHaveBeenCalledWith(expect.stringContaining("skipping OpenAPI"));
  });
});

describe("addDomainCommand action (interactive)", () => {
  it("uses prompts responses when --yes is not passed", async () => {
    const { addDomainCommand } = await import("../commands/add-domain.js");

    await addDomainCommand.parseAsync(["node", "simplix", "inventory"]);

    const targetDir = join(tempDir, "packages/myapp-domain-inventory");
    expect(await pathExists(targetDir)).toBe(true);
  });
});
