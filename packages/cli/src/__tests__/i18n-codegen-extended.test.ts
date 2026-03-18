import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mkdtemp, rm, readFile, mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { pathExists } from "../utils/fs.js";

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
  tempDir = await mkdtemp(join(tmpdir(), "i18n-ext2-test-"));
  originalCwd = process.cwd();
  originalExit = process.exit;
  process.exit = vi.fn((code?: number) => {
    throw new Error(`process.exit(${code})`);
  }) as never;

  await writeFile(join(tempDir, "simplix.config.ts"), "export default {};");

  process.chdir(tempDir);
});

afterEach(async () => {
  process.chdir(originalCwd);
  process.exit = originalExit;
  await rm(tempDir, { recursive: true, force: true });
  vi.restoreAllMocks();
});

describe("i18nCodegenCommand watch mode", () => {
  it("enters watch mode when --watch flag is passed", async () => {
    const { i18nCodegenCommand } = await import("../commands/i18n-codegen.js");

    const localesDir = join(tempDir, "modules/mymod/src/locales/features");
    await mkdir(localesDir, { recursive: true });
    await writeFile(join(localesDir, "en.json"), JSON.stringify({ key: "value" }));

    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    // Run with --watch; the command will try to start watchers but we let it
    // proceed. The AbortController watchers will fail silently.
    // We use a timeout-based approach to ensure the test doesn't hang.
    // Fire and forget — the watcher never resolves
    void i18nCodegenCommand.parseAsync(["node", "simplix", "--watch"]);

    // Give it a moment to enter watch mode
    await new Promise((r) => setTimeout(r, 100));

    // The watch mode logs "Watching for i18n file changes..."
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("Watching"),
    );

    consoleSpy.mockRestore();

    // The command doesn't resolve (it's a watcher), so we don't await it
    // Just verify the watch mode was entered
  });
});

describe("i18nCodegenCommand edge cases", () => {
  it("handles directories with only non-JSON files", async () => {
    const { i18nCodegenCommand } = await import("../commands/i18n-codegen.js");

    const localesDir = join(tempDir, "modules/mymod/src/locales/features");
    await mkdir(localesDir, { recursive: true });
    // No JSON files, just a text file
    await writeFile(join(localesDir, "readme.txt"), "not json");

    await i18nCodegenCommand.parseAsync(["node", "simplix"]);

    // No keys.d.ts should be generated
    expect(await pathExists(join(localesDir, "keys.d.ts"))).toBe(false);
  });

  it("handles multiple modules each with their own locale dirs", async () => {
    const { i18nCodegenCommand } = await import("../commands/i18n-codegen.js");
    const { log } = await import("../utils/logger.js");

    // Module A with features and widgets locales
    const modA = join(tempDir, "modules/mod-a/src/locales/features");
    const modAW = join(tempDir, "modules/mod-a/src/locales/widgets");
    await mkdir(modA, { recursive: true });
    await mkdir(modAW, { recursive: true });
    await writeFile(join(modA, "en.json"), JSON.stringify({ a: "A" }));
    await writeFile(join(modAW, "en.json"), JSON.stringify({ w: "W" }));

    // Module B with features locale
    const modB = join(tempDir, "modules/mod-b/src/locales/features");
    await mkdir(modB, { recursive: true });
    await writeFile(join(modB, "en.json"), JSON.stringify({ b: "B" }));

    await i18nCodegenCommand.parseAsync(["node", "simplix"]);

    // All three should have keys.d.ts
    expect(await pathExists(join(modA, "keys.d.ts"))).toBe(true);
    expect(await pathExists(join(modAW, "keys.d.ts"))).toBe(true);
    expect(await pathExists(join(modB, "keys.d.ts"))).toBe(true);

    expect(log.success).toHaveBeenCalledWith(expect.stringContaining("3 keys.d.ts files"));
  });

  it("handles modules without src/locales directory", async () => {
    const { i18nCodegenCommand } = await import("../commands/i18n-codegen.js");
    const { log } = await import("../utils/logger.js");

    // Module exists but has no locales
    const modDir = join(tempDir, "modules/no-locales-mod/src");
    await mkdir(modDir, { recursive: true });
    await writeFile(join(modDir, "index.ts"), "export {};");

    await i18nCodegenCommand.parseAsync(["node", "simplix"]);

    expect(log.warn).toHaveBeenCalledWith(expect.stringContaining("No i18n locale directories"));
  });

  it("generates correct auto-generated header comment", async () => {
    const { i18nCodegenCommand } = await import("../commands/i18n-codegen.js");

    const localesDir = join(tempDir, "modules/mymod/src/locales/features");
    await mkdir(localesDir, { recursive: true });
    await writeFile(join(localesDir, "en.json"), JSON.stringify({ key: "value" }));

    await i18nCodegenCommand.parseAsync(["node", "simplix"]);

    const content = await readFile(join(localesDir, "keys.d.ts"), "utf-8");
    expect(content).toContain("// Auto-generated by simplix i18n-codegen");
    expect(content).toContain("// Do not edit manually");
  });

  it("handles deeply nested JSON objects", async () => {
    const { i18nCodegenCommand } = await import("../commands/i18n-codegen.js");

    const localesDir = join(tempDir, "modules/mymod/src/locales/features");
    await mkdir(localesDir, { recursive: true });
    await writeFile(
      join(localesDir, "en.json"),
      JSON.stringify({
        level1: {
          level2: {
            level3: {
              deepKey: "value",
            },
          },
        },
        simple: "text",
      }),
    );

    await i18nCodegenCommand.parseAsync(["node", "simplix"]);

    const content = await readFile(join(localesDir, "keys.d.ts"), "utf-8");
    expect(content).toContain('"level1.level2.level3.deepKey"');
    expect(content).toContain('"simple"');
  });
});
