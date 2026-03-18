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
  tempDir = await mkdtemp(join(tmpdir(), "i18n-codegen-action-test-"));
  originalCwd = process.cwd();
  originalExit = process.exit;
  process.exit = vi.fn((code?: number) => {
    throw new Error(`process.exit(${code})`);
  }) as never;

  // Create project root with simplix.config.ts marker
  await writeFile(join(tempDir, "simplix.config.ts"), "export default {};");

  process.chdir(tempDir);
});

afterEach(async () => {
  process.chdir(originalCwd);
  process.exit = originalExit;
  await rm(tempDir, { recursive: true, force: true });
  vi.restoreAllMocks();
});

describe("i18nCodegenCommand action", () => {
  it("generates keys.d.ts from locale JSON files", async () => {
    const { i18nCodegenCommand } = await import("../commands/i18n-codegen.js");

    // Setup module with locale files
    const localesDir = join(tempDir, "modules/mymod/src/locales/features");
    await mkdir(localesDir, { recursive: true });
    await writeFile(
      join(localesDir, "en.json"),
      JSON.stringify({ greeting: "Hello", user: { name: "Name" } }),
    );

    await i18nCodegenCommand.parseAsync(["node", "simplix"]);

    const keysFile = join(localesDir, "keys.d.ts");
    expect(await pathExists(keysFile)).toBe(true);

    const content = await readFile(keysFile, "utf-8");
    expect(content).toContain("FeaturesKeys");
    expect(content).toContain('"greeting"');
    expect(content).toContain('"user.name"');
  });

  it("generates keys for nested locale directories", async () => {
    const { i18nCodegenCommand } = await import("../commands/i18n-codegen.js");

    const featuresDir = join(tempDir, "modules/mymod/src/locales/features");
    const widgetsDir = join(tempDir, "modules/mymod/src/locales/widgets");
    await mkdir(featuresDir, { recursive: true });
    await mkdir(widgetsDir, { recursive: true });
    await writeFile(join(featuresDir, "en.json"), JSON.stringify({ title: "Title" }));
    await writeFile(join(widgetsDir, "en.json"), JSON.stringify({ header: "Header" }));

    await i18nCodegenCommand.parseAsync(["node", "simplix"]);

    expect(await pathExists(join(featuresDir, "keys.d.ts"))).toBe(true);
    expect(await pathExists(join(widgetsDir, "keys.d.ts"))).toBe(true);

    const widgetsKeys = await readFile(join(widgetsDir, "keys.d.ts"), "utf-8");
    expect(widgetsKeys).toContain("WidgetsKeys");
    expect(widgetsKeys).toContain('"header"');
  });

  it("warns when no locale directories are found", async () => {
    const { i18nCodegenCommand } = await import("../commands/i18n-codegen.js");
    const { log } = await import("../utils/logger.js");

    await mkdir(join(tempDir, "modules"), { recursive: true });

    await i18nCodegenCommand.parseAsync(["node", "simplix"]);

    expect(log.warn).toHaveBeenCalledWith(expect.stringContaining("No i18n locale directories"));
  });

  it("exits with error when no modules directory exists", async () => {
    const { i18nCodegenCommand } = await import("../commands/i18n-codegen.js");

    // No modules/ dir
    await expect(
      i18nCodegenCommand.parseAsync(["node", "simplix"]),
    ).rejects.toThrow("process.exit(1)");
  });

  it("skips empty JSON files", async () => {
    const { i18nCodegenCommand } = await import("../commands/i18n-codegen.js");

    const localesDir = join(tempDir, "modules/mymod/src/locales/features");
    await mkdir(localesDir, { recursive: true });
    await writeFile(join(localesDir, "en.json"), "{}");

    await i18nCodegenCommand.parseAsync(["node", "simplix"]);

    // keys.d.ts should not be generated for empty JSON
    expect(await pathExists(join(localesDir, "keys.d.ts"))).toBe(false);
  });

  it("prefers en.json as source of truth", async () => {
    const { i18nCodegenCommand } = await import("../commands/i18n-codegen.js");

    const localesDir = join(tempDir, "modules/mymod/src/locales/features");
    await mkdir(localesDir, { recursive: true });
    await writeFile(join(localesDir, "en.json"), JSON.stringify({ greeting: "Hello" }));
    await writeFile(join(localesDir, "ko.json"), JSON.stringify({ greeting: "dummy", extra: "extra" }));

    await i18nCodegenCommand.parseAsync(["node", "simplix"]);

    const content = await readFile(join(localesDir, "keys.d.ts"), "utf-8");
    // Should only contain keys from en.json
    expect(content).toContain('"greeting"');
    expect(content).not.toContain('"extra"');
  });

  it("handles invalid JSON gracefully", async () => {
    const { i18nCodegenCommand } = await import("../commands/i18n-codegen.js");
    const { log } = await import("../utils/logger.js");

    const localesDir = join(tempDir, "modules/mymod/src/locales/features");
    await mkdir(localesDir, { recursive: true });
    await writeFile(join(localesDir, "en.json"), "not valid json {{{");

    await i18nCodegenCommand.parseAsync(["node", "simplix"]);

    expect(log.warn).toHaveBeenCalledWith(expect.stringContaining("Failed to parse"));
  });

  it("skips hidden directories and non-directory entries", async () => {
    const { i18nCodegenCommand } = await import("../commands/i18n-codegen.js");

    // Create a hidden module directory that should be skipped
    const hiddenDir = join(tempDir, "modules/.hidden/src/locales/features");
    await mkdir(hiddenDir, { recursive: true });
    await writeFile(join(hiddenDir, "en.json"), JSON.stringify({ hidden: "yes" }));

    // Create a real module
    const realDir = join(tempDir, "modules/real-mod/src/locales/features");
    await mkdir(realDir, { recursive: true });
    await writeFile(join(realDir, "en.json"), JSON.stringify({ visible: "yes" }));

    await i18nCodegenCommand.parseAsync(["node", "simplix"]);

    // Hidden dir should NOT have keys.d.ts
    expect(await pathExists(join(hiddenDir, "keys.d.ts"))).toBe(false);
    // Real dir should have keys.d.ts
    expect(await pathExists(join(realDir, "keys.d.ts"))).toBe(true);
  });

  it("falls back to first JSON file when en.json is missing", async () => {
    const { i18nCodegenCommand } = await import("../commands/i18n-codegen.js");

    const localesDir = join(tempDir, "modules/mymod/src/locales/features");
    await mkdir(localesDir, { recursive: true });
    // Only ko.json, no en.json
    await writeFile(join(localesDir, "ko.json"), JSON.stringify({ greeting: "Hello" }));

    await i18nCodegenCommand.parseAsync(["node", "simplix"]);

    const content = await readFile(join(localesDir, "keys.d.ts"), "utf-8");
    expect(content).toContain('"greeting"');
  });

  it("generates multiple module key files", async () => {
    const { i18nCodegenCommand } = await import("../commands/i18n-codegen.js");
    const { log } = await import("../utils/logger.js");

    const mod1 = join(tempDir, "modules/mod1/src/locales/features");
    const mod2 = join(tempDir, "modules/mod2/src/locales/widgets");
    await mkdir(mod1, { recursive: true });
    await mkdir(mod2, { recursive: true });
    await writeFile(join(mod1, "en.json"), JSON.stringify({ a: "A" }));
    await writeFile(join(mod2, "en.json"), JSON.stringify({ b: "B" }));

    await i18nCodegenCommand.parseAsync(["node", "simplix"]);

    expect(log.success).toHaveBeenCalledWith(expect.stringContaining("2 keys.d.ts"));
  });
});
