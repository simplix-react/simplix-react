import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

// Mock prompts
vi.mock("prompts", () => ({
  default: vi.fn().mockResolvedValue({
    scope: "@test",
    includeDemo: false,
    enableI18n: false,
    enableAuth: false,
    enableAccess: false,
    locales: ["en"],
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

// Mock versions
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

// Mock writeFileWithDir to throw on specific paths to trigger error catch
vi.mock("../utils/fs.js", async (importOriginal) => {
  const orig = await importOriginal<typeof import("../utils/fs.js")>();
  return {
    ...orig,
    writeFileWithDir: vi.fn(orig.writeFileWithDir),
  };
});

let tempDir: string;
let originalCwd: string;
let originalExit: typeof process.exit;

beforeEach(async () => {
  tempDir = await mkdtemp(join(tmpdir(), "init-error-test-"));
  originalCwd = process.cwd();
  originalExit = process.exit;
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

describe("initCommand error paths", () => {
  it("handles error during project creation", async () => {
    process.chdir(tempDir);
    const { initCommand } = await import("../commands/init.js");
    const { log } = await import("../utils/logger.js");

    // Make writeFileWithDir throw to trigger the catch block
    const { writeFileWithDir: mockWriteFile } = await import("../utils/fs.js");
    vi.mocked(mockWriteFile).mockRejectedValueOnce(new Error("disk full"));

    await expect(
      initCommand.parseAsync(["node", "simplix", "error-proj", "-y"]),
    ).rejects.toThrow("process.exit(1)");

    expect(log.error).toHaveBeenCalledWith(expect.stringContaining("disk full"));
  });

  it("creates project without demo when --no-demo is passed", async () => {
    process.chdir(tempDir);
    const { initCommand } = await import("../commands/init.js");

    await initCommand.parseAsync(["node", "simplix", "no-demo", "-y", "--no-demo", "--no-i18n", "--no-auth", "--no-access"]);

    // Verify project root was created but no demo app
    const { pathExists } = await import("../utils/fs.js");
    expect(await pathExists(join(tempDir, "no-demo/package.json"))).toBe(true);
    expect(await pathExists(join(tempDir, "no-demo/apps"))).toBe(false);
  });
});
