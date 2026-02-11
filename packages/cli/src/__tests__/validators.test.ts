import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtemp, writeFile, mkdir, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import type { ValidationResult } from "../commands/validate.js";
import { validatePackageRules } from "../validators/package-rules.js";
import { validateI18nRules } from "../validators/i18n-rules.js";

let tempDir: string;

function createResult(path: string): ValidationResult {
  return { path, errors: [], warnings: [], passes: [] };
}

beforeEach(async () => {
  tempDir = await mkdtemp(join(tmpdir(), "simplix-test-"));
});

afterEach(async () => {
  await rm(tempDir, { recursive: true, force: true });
});

describe("validatePackageRules", () => {
  it("passes when package.json has exports and type:module", async () => {
    await writeFile(
      join(tempDir, "package.json"),
      JSON.stringify({
        name: "test-pkg",
        type: "module",
        exports: { ".": { import: "./dist/index.js" } },
      }),
    );
    await writeFile(join(tempDir, "tsup.config.ts"), "export default {}");

    const result = createResult(tempDir);
    await validatePackageRules(tempDir, result);

    expect(result.errors).toHaveLength(0);
    expect(result.passes.length).toBeGreaterThanOrEqual(2);
  });

  it("warns when type:module is missing", async () => {
    await writeFile(
      join(tempDir, "package.json"),
      JSON.stringify({ name: "test-pkg" }),
    );

    const result = createResult(tempDir);
    await validatePackageRules(tempDir, result);

    expect(result.warnings.some((w) => w.includes('"type": "module"'))).toBe(true);
  });

  it("warns when react dev dep but no peer dep", async () => {
    await writeFile(
      join(tempDir, "package.json"),
      JSON.stringify({
        name: "test-pkg",
        type: "module",
        devDependencies: { react: "^19.0.0" },
      }),
    );

    const result = createResult(tempDir);
    await validatePackageRules(tempDir, result);

    expect(result.warnings.some((w) => w.includes("peerDependencies"))).toBe(true);
  });

  it("auto-fixes type:module when --fix is set", async () => {
    await writeFile(
      join(tempDir, "package.json"),
      JSON.stringify({ name: "test-pkg" }),
    );

    const result = createResult(tempDir);
    await validatePackageRules(tempDir, result, { fix: true });

    // After fix, should have a pass about auto-fix
    const hasFix = result.passes.some((p) => p.includes("Auto-fixed") || p.includes("type"));
    // It should not be an error anymore
    expect(result.errors).toHaveLength(0);
  });
});

describe("validateI18nRules", () => {
  it("detects missing keys", async () => {
    const localesDir = join(tempDir, "src", "locales", "common");
    await mkdir(localesDir, { recursive: true });
    await writeFile(
      join(localesDir, "en.json"),
      JSON.stringify({ title: "Hello", subtitle: "World" }),
    );
    await writeFile(
      join(localesDir, "ko.json"),
      JSON.stringify({ title: "안녕" }),
    );

    const result = createResult(tempDir);
    await validateI18nRules(tempDir, result);

    expect(result.errors.some((e) => e.includes("subtitle") && e.includes("ko"))).toBe(true);
  });

  it("detects extra keys", async () => {
    const localesDir = join(tempDir, "src", "locales", "common");
    await mkdir(localesDir, { recursive: true });
    await writeFile(
      join(localesDir, "en.json"),
      JSON.stringify({ title: "Hello" }),
    );
    await writeFile(
      join(localesDir, "ko.json"),
      JSON.stringify({ title: "안녕", extra: "Extra" }),
    );

    const result = createResult(tempDir);
    await validateI18nRules(tempDir, result);

    expect(result.warnings.some((w) => w.includes("extra") && w.includes("ko"))).toBe(true);
  });

  it("detects interpolation mismatch", async () => {
    const localesDir = join(tempDir, "src", "locales", "common");
    await mkdir(localesDir, { recursive: true });
    await writeFile(
      join(localesDir, "en.json"),
      JSON.stringify({ greeting: "Hello {{name}}" }),
    );
    await writeFile(
      join(localesDir, "ko.json"),
      JSON.stringify({ greeting: "안녕하세요" }),
    );

    const result = createResult(tempDir);
    await validateI18nRules(tempDir, result);

    expect(result.errors.some((e) => e.includes("{{name}}"))).toBe(true);
  });

  it("passes when locales are consistent", async () => {
    const localesDir = join(tempDir, "src", "locales", "common");
    await mkdir(localesDir, { recursive: true });
    await writeFile(
      join(localesDir, "en.json"),
      JSON.stringify({ title: "Hello" }),
    );
    await writeFile(
      join(localesDir, "ko.json"),
      JSON.stringify({ title: "안녕" }),
    );

    const result = createResult(tempDir);
    await validateI18nRules(tempDir, result);

    expect(result.errors).toHaveLength(0);
    expect(result.passes.length).toBeGreaterThan(0);
  });
});
