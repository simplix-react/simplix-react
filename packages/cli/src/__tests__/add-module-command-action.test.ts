import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mkdtemp, rm, readFile, mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { pathExists } from "../utils/fs.js";

// Mock prompts
vi.mock("prompts", () => ({
  default: vi.fn().mockResolvedValue({
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
    i18n: { locales: ["en", "ko", "ja"] },
    packages: { prefix: "myapp" },
  }),
}));

let tempDir: string;
let originalCwd: string;
let originalExit: typeof process.exit;

beforeEach(async () => {
  tempDir = await mkdtemp(join(tmpdir(), "add-module-action-test-"));
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
  await writeFile(join(tempDir, "pnpm-workspace.yaml"), "packages:\n  - modules/*\n");
  await mkdir(join(tempDir, "modules"), { recursive: true });

  process.chdir(tempDir);
});

afterEach(async () => {
  process.chdir(originalCwd);
  process.exit = originalExit;
  await rm(tempDir, { recursive: true, force: true });
  vi.restoreAllMocks();
});

describe("addModuleCommand action (non-interactive)", () => {
  it("creates module directory with required files", async () => {
    const { addModuleCommand } = await import("../commands/add-module.js");

    await addModuleCommand.parseAsync(["node", "simplix", "editor", "-y"]);

    const targetDir = join(tempDir, "modules/myapp-editor");
    expect(await pathExists(targetDir)).toBe(true);
    expect(await pathExists(join(targetDir, "package.json"))).toBe(true);
    expect(await pathExists(join(targetDir, "tsup.config.ts"))).toBe(true);
    expect(await pathExists(join(targetDir, "tsconfig.json"))).toBe(true);
    expect(await pathExists(join(targetDir, "src/index.ts"))).toBe(true);
    expect(await pathExists(join(targetDir, "src/manifest.ts"))).toBe(true);
  });

  it("creates FSD layers", async () => {
    const { addModuleCommand } = await import("../commands/add-module.js");

    await addModuleCommand.parseAsync(["node", "simplix", "editor", "-y"]);

    const targetDir = join(tempDir, "modules/myapp-editor");
    expect(await pathExists(join(targetDir, "src/features/index.ts"))).toBe(true);
    expect(await pathExists(join(targetDir, "src/widgets/index.ts"))).toBe(true);
    expect(await pathExists(join(targetDir, "src/shared/lib/.gitkeep"))).toBe(true);
    expect(await pathExists(join(targetDir, "src/shared/ui/.gitkeep"))).toBe(true);
    expect(await pathExists(join(targetDir, "src/shared/config/.gitkeep"))).toBe(true);
  });

  it("creates i18n locale files when enableI18n is true", async () => {
    const { addModuleCommand } = await import("../commands/add-module.js");

    await addModuleCommand.parseAsync(["node", "simplix", "editor", "-y"]);

    const targetDir = join(tempDir, "modules/myapp-editor");
    expect(await pathExists(join(targetDir, "src/locales/index.ts"))).toBe(true);
    expect(await pathExists(join(targetDir, "src/locales/features/en.json"))).toBe(true);
    expect(await pathExists(join(targetDir, "src/locales/features/ko.json"))).toBe(true);
    expect(await pathExists(join(targetDir, "src/locales/features/ja.json"))).toBe(true);
    expect(await pathExists(join(targetDir, "src/locales/widgets/en.json"))).toBe(true);
    expect(await pathExists(join(targetDir, "src/locales/widgets/ko.json"))).toBe(true);
    expect(await pathExists(join(targetDir, "src/locales/widgets/ja.json"))).toBe(true);
  });

  it("skips i18n files when --no-i18n is passed", async () => {
    const { addModuleCommand } = await import("../commands/add-module.js");

    await addModuleCommand.parseAsync(["node", "simplix", "editor", "-y", "--no-i18n"]);

    const targetDir = join(tempDir, "modules/myapp-editor");
    expect(await pathExists(join(targetDir, "src/locales/index.ts"))).toBe(false);
  });

  it("exits with error if module already exists", async () => {
    const { addModuleCommand } = await import("../commands/add-module.js");

    await mkdir(join(tempDir, "modules/myapp-existing"), { recursive: true });

    await expect(
      addModuleCommand.parseAsync(["node", "simplix", "existing", "-y"]),
    ).rejects.toThrow("process.exit(1)");
  });

  it("exits with error if no package.json found", async () => {
    const { addModuleCommand } = await import("../commands/add-module.js");

    const emptyDir = await mkdtemp(join(tmpdir(), "no-pkg-"));
    process.chdir(emptyDir);

    await expect(
      addModuleCommand.parseAsync(["node", "simplix", "editor", "-y"]),
    ).rejects.toThrow("process.exit(1)");

    process.chdir(originalCwd);
    await rm(emptyDir, { recursive: true, force: true });
  });

  it("renders package.json with correct module package name", async () => {
    const { addModuleCommand } = await import("../commands/add-module.js");

    await addModuleCommand.parseAsync(["node", "simplix", "editor", "-y"]);

    const targetDir = join(tempDir, "modules/myapp-editor");
    const pkgJson = JSON.parse(await readFile(join(targetDir, "package.json"), "utf-8"));
    expect(pkgJson.name).toBe("@test/myapp-editor");
  });

  it("renders manifest.ts with PascalCase module name", async () => {
    const { addModuleCommand } = await import("../commands/add-module.js");

    await addModuleCommand.parseAsync(["node", "simplix", "editor", "-y"]);

    const targetDir = join(tempDir, "modules/myapp-editor");
    const manifest = await readFile(join(targetDir, "src/manifest.ts"), "utf-8");
    expect(manifest).toContain("Editor");
  });
});

describe("addModuleCommand action (interactive)", () => {
  it("uses prompts responses when --yes is not passed", async () => {
    const { addModuleCommand } = await import("../commands/add-module.js");

    await addModuleCommand.parseAsync(["node", "simplix", "monitoring"]);

    const targetDir = join(tempDir, "modules/myapp-monitoring");
    expect(await pathExists(targetDir)).toBe(true);
  });
});
