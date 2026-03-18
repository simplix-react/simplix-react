import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mkdtemp, rm, readFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { pathExists, writeFileWithDir } from "../utils/fs.js";

// Mock prompts
vi.mock("prompts", () => ({
  default: vi.fn().mockResolvedValue({
    scope: "@test",
    includeDemo: true,
    enableI18n: true,
    enableAuth: true,
    enableAccess: true,
    locales: ["en", "ko"],
  }),
}));

// Mock ora (spinner)
vi.mock("ora", () => ({
  default: () => ({
    start: vi.fn().mockReturnThis(),
    succeed: vi.fn().mockReturnThis(),
    fail: vi.fn().mockReturnThis(),
    text: "",
  }),
}));

// Mock logger to silence output
vi.mock("../utils/logger.js", () => ({
  log: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    success: vi.fn(),
    step: vi.fn(),
  },
}));

// Mock versions (global __FW_VERSIONS__ is not available in test env)
vi.mock("../versions.js", () => ({
  withVersions: vi.fn((ctx: Record<string, unknown>) => ({
    ...ctx,
    fw: { cli: "^0.1.0", contract: "^0.2.0", react: "^0.3.0", form: "^0.4.0", mock: "^0.5.0", i18n: "^0.6.0", testing: "^0.7.0", ui: "^0.8.0", api: "^0.9.0" },
    fwExact: { cli: "0.1.0", contract: "0.2.0", react: "0.3.0", form: "0.4.0", mock: "0.5.0", i18n: "0.6.0", testing: "0.7.0", ui: "0.8.0", api: "0.9.0" },
    deps: { zod: "^4.0.0", typescript: "^5.9.0", tanstackReactQuery: "^5.64.0", react: "^19.0.0", typesReact: "^19.0.0" },
  })),
  frameworkVersion: vi.fn().mockReturnValue("0.1.0"),
  frameworkRange: vi.fn().mockReturnValue("^0.1.0"),
  depVersion: vi.fn().mockReturnValue("^19.0.0"),
}));

let tempDir: string;
let originalCwd: string;
let originalExit: typeof process.exit;

beforeEach(async () => {
  tempDir = await mkdtemp(join(tmpdir(), "init-action-test-"));
  originalCwd = process.cwd();
  process.chdir(tempDir);
  originalExit = process.exit;
  // Mock process.exit to throw so execution halts
  process.exit = vi.fn((code?: number) => {
    throw new Error(`process.exit(${code})`);
  }) as never;
});

afterEach(async () => {
  process.chdir(originalCwd);
  process.exit = originalExit;
  await rm(tempDir, { recursive: true, force: true });
  vi.restoreAllMocks();
});

describe("initCommand action (non-interactive)", () => {
  it("creates project directory with root files", async () => {
    const { initCommand } = await import("../commands/init.js");

    await initCommand.parseAsync(["node", "simplix", "my-project", "-y"]);

    const projectDir = join(tempDir, "my-project");
    expect(await pathExists(projectDir)).toBe(true);
    expect(await pathExists(join(projectDir, "package.json"))).toBe(true);
    expect(await pathExists(join(projectDir, "pnpm-workspace.yaml"))).toBe(true);
    expect(await pathExists(join(projectDir, "turbo.json"))).toBe(true);
    expect(await pathExists(join(projectDir, "tsconfig.json"))).toBe(true);
    expect(await pathExists(join(projectDir, ".npmrc"))).toBe(true);
    expect(await pathExists(join(projectDir, ".gitignore"))).toBe(true);
    expect(await pathExists(join(projectDir, ".oxlintrc.json"))).toBe(true);
    expect(await pathExists(join(projectDir, "simplix.config.ts"))).toBe(true);
  });

  it("creates config packages", async () => {
    const { initCommand } = await import("../commands/init.js");

    await initCommand.parseAsync(["node", "simplix", "cfg-proj", "-y"]);

    const projectDir = join(tempDir, "cfg-proj");
    expect(await pathExists(join(projectDir, "config/typescript/base.json"))).toBe(true);
    expect(await pathExists(join(projectDir, "config/typescript/react.json"))).toBe(true);
  });

  it("creates demo app when includeDemo is true", async () => {
    const { initCommand } = await import("../commands/init.js");

    await initCommand.parseAsync(["node", "simplix", "demo-proj", "-y"]);

    const appDir = join(tempDir, "demo-proj/apps/demo-proj-demo");
    expect(await pathExists(join(appDir, "package.json"))).toBe(true);
    expect(await pathExists(join(appDir, "vite.config.ts"))).toBe(true);
    expect(await pathExists(join(appDir, "index.html"))).toBe(true);
    expect(await pathExists(join(appDir, "src/main.tsx"))).toBe(true);
  });

  it("creates i18n files when enableI18n is true", async () => {
    const { initCommand } = await import("../commands/init.js");

    await initCommand.parseAsync(["node", "simplix", "i18n-proj", "-y"]);

    const appDir = join(tempDir, "i18n-proj/apps/i18n-proj-demo");
    expect(await pathExists(join(appDir, "src/app/i18n/index.ts"))).toBe(true);

    const configContent = await readFile(join(tempDir, "i18n-proj/simplix.config.ts"), "utf-8");
    expect(configContent).toContain("locales");
  });

  it("creates access files when enableAccess is true", async () => {
    const { initCommand } = await import("../commands/init.js");

    await initCommand.parseAsync(["node", "simplix", "access-proj", "-y"]);

    const appDir = join(tempDir, "access-proj/apps/access-proj-demo");
    expect(await pathExists(join(appDir, "src/app/access/index.ts"))).toBe(true);
  });

  it("creates modules/.gitkeep for FSD structure", async () => {
    const { initCommand } = await import("../commands/init.js");

    await initCommand.parseAsync(["node", "simplix", "fsd-proj", "-y"]);

    expect(await pathExists(join(tempDir, "fsd-proj/modules/.gitkeep"))).toBe(true);
  });

  it("uses scope from --scope flag", async () => {
    const { initCommand } = await import("../commands/init.js");

    await initCommand.parseAsync(["node", "simplix", "scoped-proj", "-y", "--scope", "@custom"]);

    const pkgJson = JSON.parse(await readFile(join(tempDir, "scoped-proj/package.json"), "utf-8"));
    expect(pkgJson.name).toContain("@custom");
  });

  it("prepends @ to scope if missing", async () => {
    const { initCommand } = await import("../commands/init.js");

    await initCommand.parseAsync(["node", "simplix", "at-proj", "-y", "--scope", "custom"]);

    const pkgJson = JSON.parse(await readFile(join(tempDir, "at-proj/package.json"), "utf-8"));
    expect(pkgJson.name).toContain("@custom");
  });

  it("skips demo when --no-demo is passed", async () => {
    const { initCommand } = await import("../commands/init.js");

    await initCommand.parseAsync(["node", "simplix", "no-demo-proj", "-y", "--no-demo"]);

    expect(await pathExists(join(tempDir, "no-demo-proj/apps/no-demo-proj-demo"))).toBe(false);
  });

  it("exits with error if directory already exists", async () => {
    const { initCommand } = await import("../commands/init.js");

    await writeFileWithDir(join(tempDir, "existing-proj/dummy.txt"), "x");

    await expect(
      initCommand.parseAsync(["node", "simplix", "existing-proj", "-y"]),
    ).rejects.toThrow("process.exit(1)");
  });

  it("renders root package.json with correct monorepo name", async () => {
    const { initCommand } = await import("../commands/init.js");

    await initCommand.parseAsync(["node", "simplix", "mono-proj", "-y"]);

    const pkgJson = JSON.parse(await readFile(join(tempDir, "mono-proj/package.json"), "utf-8"));
    expect(pkgJson.name).toContain("mono-proj-monorepo");
    expect(pkgJson.private).toBe(true);
  });
});

describe("initCommand action (interactive)", () => {
  it("uses prompts responses when --yes is not passed", async () => {
    const { initCommand } = await import("../commands/init.js");

    await initCommand.parseAsync(["node", "simplix", "interactive-proj"]);

    expect(await pathExists(join(tempDir, "interactive-proj/package.json"))).toBe(true);
  });

  it("skips i18n and access when disabled in prompts", async () => {
    const { initCommand } = await import("../commands/init.js");
    const prompts = await import("prompts");

    vi.mocked(prompts.default).mockResolvedValueOnce({
      scope: "@test",
      includeDemo: true,
      enableI18n: false,
      enableAuth: false,
      enableAccess: false,
    });

    await initCommand.parseAsync(["node", "simplix", "no-i18n-proj"]);

    const appDir = join(tempDir, "no-i18n-proj/apps/no-i18n-proj-demo");
    // Should NOT create i18n files
    expect(await pathExists(join(appDir, "src/app/i18n/index.ts"))).toBe(false);
    // Should NOT create access files
    expect(await pathExists(join(appDir, "src/app/access/index.ts"))).toBe(false);
  });
});
