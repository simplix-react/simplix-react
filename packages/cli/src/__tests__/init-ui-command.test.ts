import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { pathExists } from "../utils/fs.js";

// Mock child_process
vi.mock("node:child_process", () => ({
  execFileSync: vi.fn(),
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

let tempDir: string;
let originalCwd: string;
let originalExit: typeof process.exit;

beforeEach(async () => {
  tempDir = await mkdtemp(join(tmpdir(), "init-ui-test-"));
  originalCwd = process.cwd();
  originalExit = process.exit;
  process.exit = vi.fn((code?: number) => {
    throw new Error(`process.exit(${code})`);
  }) as never;

  // Create project root marker
  await writeFile(join(tempDir, "pnpm-workspace.yaml"), "packages:\n  - packages/*\n");

  process.chdir(tempDir);
});

afterEach(async () => {
  process.chdir(originalCwd);
  process.exit = originalExit;
  await rm(tempDir, { recursive: true, force: true });
  vi.restoreAllMocks();
});

describe("initUiCommand action", () => {
  it("exits with error if components.json does not exist", async () => {
    const { initUiCommand } = await import("../commands/init-ui.js");
    const { log } = await import("../utils/logger.js");

    await expect(
      initUiCommand.parseAsync(["node", "simplix"]),
    ).rejects.toThrow("process.exit(1)");
    expect(log.error).toHaveBeenCalledWith(
      expect.stringContaining("components.json not found"),
    );
  });

  it("runs shadcn add and generates UI provider file", async () => {
    const { initUiCommand } = await import("../commands/init-ui.js");
    const { execFileSync } = await import("node:child_process");

    // Create components.json to satisfy the check
    await writeFile(join(tempDir, "components.json"), "{}");

    await initUiCommand.parseAsync(["node", "simplix"]);

    expect(execFileSync).toHaveBeenCalledWith(
      "npx",
      expect.arrayContaining(["shadcn@latest", "add"]),
      expect.objectContaining({ stdio: "pipe" }),
    );

    const outputPath = join(tempDir, "src/lib/simplix-ui.ts");
    expect(await pathExists(outputPath)).toBe(true);
  });

  it("handles execFileSync error gracefully", async () => {
    const { initUiCommand } = await import("../commands/init-ui.js");
    const childProcess = await import("node:child_process");

    await writeFile(join(tempDir, "components.json"), "{}");

    vi.mocked(childProcess.execFileSync).mockImplementation(() => {
      throw new Error("npx failed");
    });

    await expect(
      initUiCommand.parseAsync(["node", "simplix"]),
    ).rejects.toThrow("process.exit(1)");
  });
});
