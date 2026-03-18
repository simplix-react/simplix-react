import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mkdtemp, rm, readFile, mkdir, writeFile } from "node:fs/promises";
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

let tempDir: string;
let originalCwd: string;
let originalExit: typeof process.exit;

beforeEach(async () => {
  tempDir = await mkdtemp(join(tmpdir(), "i18n-ext-test-"));
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

describe("i18nCodegenCommand extended", () => {
  it("generates keys.d.ts with correct type name from hyphenated directory", async () => {
    const { i18nCodegenCommand } = await import("../commands/i18n-codegen.js");

    const localesDir = join(tempDir, "modules/mymod/src/locales/my-feature");
    await mkdir(localesDir, { recursive: true });
    await writeFile(join(localesDir, "en.json"), JSON.stringify({ title: "Hello" }));

    await i18nCodegenCommand.parseAsync(["node", "simplix"]);

    const content = await readFile(join(localesDir, "keys.d.ts"), "utf-8");
    // "my-feature" should become "MyFeatureKeys"
    expect(content).toContain("MyFeatureKeys");
    expect(content).toContain('"title"');
  });

  it("generates single-key type correctly without trailing semicolon issue", async () => {
    const { i18nCodegenCommand } = await import("../commands/i18n-codegen.js");

    const localesDir = join(tempDir, "modules/mymod/src/locales/single");
    await mkdir(localesDir, { recursive: true });
    await writeFile(join(localesDir, "en.json"), JSON.stringify({ onlyKey: "value" }));

    await i18nCodegenCommand.parseAsync(["node", "simplix"]);

    const content = await readFile(join(localesDir, "keys.d.ts"), "utf-8");
    expect(content).toContain("SingleKeys");
    expect(content).toContain('"onlyKey";');
  });

  it("generates success message for singular key file", async () => {
    const { i18nCodegenCommand } = await import("../commands/i18n-codegen.js");
    const { log } = await import("../utils/logger.js");

    const localesDir = join(tempDir, "modules/mymod/src/locales/features");
    await mkdir(localesDir, { recursive: true });
    await writeFile(join(localesDir, "en.json"), JSON.stringify({ a: "A" }));

    await i18nCodegenCommand.parseAsync(["node", "simplix"]);

    // Singular form: "1 keys.d.ts file."
    expect(log.success).toHaveBeenCalledWith(expect.stringContaining("1 keys.d.ts file."));
  });

  it("discovers deeply nested locale directories", async () => {
    const { i18nCodegenCommand } = await import("../commands/i18n-codegen.js");
    await import("../utils/logger.js");

    // Create a deeply nested locale directory
    const deep = join(tempDir, "modules/mymod/src/locales/features/sub/nested");
    await mkdir(deep, { recursive: true });
    await writeFile(join(deep, "en.json"), JSON.stringify({ deep: "value" }));

    await i18nCodegenCommand.parseAsync(["node", "simplix"]);

    const content = await readFile(join(deep, "keys.d.ts"), "utf-8");
    expect(content).toContain("NestedKeys");
    expect(content).toContain('"deep"');
  });
});
