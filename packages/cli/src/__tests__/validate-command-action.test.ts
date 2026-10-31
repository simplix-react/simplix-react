import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mkdtemp, rm, mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

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

// Inject the globals tsup provides at build time; the root checks compare against them.
(globalThis as Record<string, unknown>).__DEP_VERSIONS__ = { typescript: "^7.0.2", "typescript-expo": "~5.9.3" };

let tempDir: string;
let originalCwd: string;
let originalExit: typeof process.exit;

beforeEach(async () => {
  tempDir = await mkdtemp(join(tmpdir(), "validate-action-test-"));
  originalCwd = process.cwd();
  originalExit = process.exit;
  process.exit = vi.fn((code?: number) => {
    throw new Error(`process.exit(${code})`);
  }) as never;

  // Create project root marker
  await writeFile(join(tempDir, "package.json"), JSON.stringify({ name: "test-monorepo" }));
  await writeFile(join(tempDir, "simplix.config.ts"), "export default {};");

  process.chdir(tempDir);
});

afterEach(async () => {
  process.chdir(originalCwd);
  process.exit = originalExit;
  await rm(tempDir, { recursive: true, force: true });
  vi.restoreAllMocks();
});

describe("validateCommand action", () => {
  it("exits with error if no package.json found", async () => {
    const { validateCommand } = await import("../commands/validate.js");
    const { log } = await import("../utils/logger.js");

    const emptyDir = await mkdtemp(join(tmpdir(), "no-pkg-"));
    process.chdir(emptyDir);

    await expect(
      validateCommand.parseAsync(["node", "simplix"]),
    ).rejects.toThrow("process.exit(1)");
    expect(log.error).toHaveBeenCalledWith(
      expect.stringContaining("No package.json found"),
    );

    process.chdir(originalCwd);
    await rm(emptyDir, { recursive: true, force: true });
  });

  it("discovers and validates packages", async () => {
    const { validateCommand } = await import("../commands/validate.js");

    // Create a package directory with package.json
    const pkgDir = join(tempDir, "packages/my-pkg");
    await mkdir(pkgDir, { recursive: true });
    await writeFile(
      join(pkgDir, "package.json"),
      JSON.stringify({ name: "@test/my-pkg", type: "module", exports: { ".": "./src/index.ts" } }),
    );
    await writeFile(join(pkgDir, "tsup.config.ts"), "export default {};");

    await validateCommand.parseAsync(["node", "simplix"]);

    // Should not throw since package is valid
  });

  it("discovers and validates modules with FSD rules", async () => {
    const { validateCommand } = await import("../commands/validate.js");

    // Create a module directory with package.json and manifest
    const modDir = join(tempDir, "modules/my-module");
    await mkdir(join(modDir, "src"), { recursive: true });
    await writeFile(
      join(modDir, "package.json"),
      JSON.stringify({ name: "@test/my-module", type: "module", exports: { ".": "./src/index.ts" } }),
    );
    await writeFile(join(modDir, "tsup.config.ts"), "export default {};");
    await writeFile(join(modDir, "src/manifest.ts"), "export default {};");

    await validateCommand.parseAsync(["node", "simplix"]);

    // The module is valid — no error expected
  });

  it("discovers and validates apps", async () => {
    const { validateCommand } = await import("../commands/validate.js");

    // Create an app directory
    const appDir = join(tempDir, "apps/my-app");
    await mkdir(join(appDir, "src"), { recursive: true });
    await writeFile(
      join(appDir, "package.json"),
      JSON.stringify({ name: "@test/my-app", type: "module" }),
    );

    await validateCommand.parseAsync(["node", "simplix"]);

    // App validation should run — no error expected
  });

  it("reports errors for invalid modules", async () => {
    const { validateCommand } = await import("../commands/validate.js");

    const modDir = join(tempDir, "modules/bad-module");
    await mkdir(join(modDir, "src"), { recursive: true });
    await writeFile(
      join(modDir, "package.json"),
      JSON.stringify({ name: "@test/bad-module" }),
    );

    await expect(
      validateCommand.parseAsync(["node", "simplix"]),
    ).rejects.toThrow("process.exit(1)");
  });

  it("repairs package exports with a bare --fix and leaves versions, tsconfig, scripts and manifests alone", async () => {
    const { validateCommand } = await import("../commands/validate.js");

    const workspace = "packages:\n  - packages/*\ncatalog:\n  typescript: ^5.9.3\n";
    const tsconfig = JSON.stringify({ compilerOptions: { baseUrl: ".", strict: true } }, null, 2);
    const rootPkg = JSON.stringify({ name: "test-monorepo", scripts: { dev: "turbo run dev", build: "turbo run build" } }, null, 2);
    await writeFile(join(tempDir, "pnpm-workspace.yaml"), workspace);
    await writeFile(join(tempDir, "tsconfig.json"), tsconfig);
    await writeFile(join(tempDir, "package.json"), rootPkg);
    const pkgDir = join(tempDir, "packages/fixable-pkg");
    await mkdir(join(pkgDir, "src"), { recursive: true });
    await writeFile(join(pkgDir, "src/index.ts"), "export {};\n");
    await writeFile(join(pkgDir, "tsup.config.ts"), "export default { entry: [\"src/index.ts\"], dts: true };\n");
    await writeFile(
      join(pkgDir, "package.json"),
      JSON.stringify({ name: "@test/fixable-pkg", exports: { ".": { types: "./dist/index.d.ts", import: "./dist/index.js" } } }, null, 2),
    );

    await validateCommand.parseAsync(["node", "simplix", "--fix"]).catch(() => undefined);

    const pkg = JSON.parse(await readFile(join(pkgDir, "package.json"), "utf-8")) as {
      type?: string;
      exports: Record<string, { source?: string; types?: string }>;
    };
    expect(pkg.exports["."]).toMatchObject({ source: "./src/index.ts", types: "./src/index.ts" });
    expect(pkg.type).toBeUndefined();
    expect(await readFile(join(tempDir, "pnpm-workspace.yaml"), "utf-8")).toBe(workspace);
    expect(await readFile(join(tempDir, "tsconfig.json"), "utf-8")).toBe(tsconfig);
    expect(await readFile(join(tempDir, "package.json"), "utf-8")).toBe(rootPkg);
    expect(await readFile(join(pkgDir, "tsup.config.ts"), "utf-8")).toContain("dts: true");
  });

  it("repairs only the checks --fix names", async () => {
    const { validateCommand } = await import("../commands/validate.js");

    const pkgDir = join(tempDir, "packages/fixable-pkg");
    await mkdir(pkgDir, { recursive: true });
    await writeFile(join(pkgDir, "package.json"), JSON.stringify({ name: "@test/fixable-pkg" }));

    await validateCommand.parseAsync(["node", "simplix", "--fix", "dependencies"]).catch(() => undefined);

    expect(JSON.parse(await readFile(join(pkgDir, "package.json"), "utf-8"))).toMatchObject({ type: "module" });
  });

  it("names the known checks when --fix is given an unknown one", async () => {
    const { parseFixChecks } = await import("../commands/validate.js");
    expect(() => parseFixChecks("exports,versions")).toThrow(/Unknown --fix check versions/);
    expect(parseFixChecks(true)).toEqual(new Set(["exports"]));
    expect(parseFixChecks("all").has("root")).toBe(true);
  });

  it("handles empty project (no packages, modules, or apps)", async () => {
    const { validateCommand } = await import("../commands/validate.js");

    await validateCommand.parseAsync(["node", "simplix"]);

    // Should pass — nothing to validate
  });

  it("skips hidden directories", async () => {
    const { validateCommand } = await import("../commands/validate.js");

    // Create a hidden directory that should be skipped
    const hiddenDir = join(tempDir, "packages/.hidden");
    await mkdir(hiddenDir, { recursive: true });
    await writeFile(
      join(hiddenDir, "package.json"),
      JSON.stringify({ name: "@test/hidden" }),
    );

    await validateCommand.parseAsync(["node", "simplix"]);

    // Should pass — hidden dirs are ignored
  });

  it("skips directories without package.json", async () => {
    const { validateCommand } = await import("../commands/validate.js");

    const noPackageDir = join(tempDir, "packages/no-package");
    await mkdir(noPackageDir, { recursive: true });
    // Don't create package.json

    await validateCommand.parseAsync(["node", "simplix"]);

    // Should pass — dir without package.json is skipped
  });
});
