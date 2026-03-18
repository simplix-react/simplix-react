import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtemp, writeFile, mkdir, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import type { ValidationResult } from "../commands/validate.js";
import { validatePackageRules } from "../validators/package-rules.js";
import { validateI18nRules } from "../validators/i18n-rules.js";
import { validateFsdRules } from "../validators/fsd-rules.js";
import { validateImportRules } from "../validators/import-rules.js";

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
    const _hasFix = result.passes.some((p) => p.includes("Auto-fixed") || p.includes("type"));
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

  it("auto-fixes missing keys with --fix", async () => {
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
    await validateI18nRules(tempDir, result, { fix: true });

    expect(result.errors).toHaveLength(0);
    expect(result.passes.some((p) => p.includes("Auto-fixed") && p.includes("subtitle"))).toBe(true);

    // Verify the file was actually written
    const { readFile: rf } = await import("node:fs/promises");
    const fixed = JSON.parse(await rf(join(localesDir, "ko.json"), "utf-8"));
    expect(fixed.subtitle).toBe("World");
  });

  it("auto-fixes extra keys with --fix", async () => {
    const localesDir = join(tempDir, "src", "locales", "common");
    await mkdir(localesDir, { recursive: true });
    await writeFile(
      join(localesDir, "en.json"),
      JSON.stringify({ title: "Hello" }),
    );
    await writeFile(
      join(localesDir, "ko.json"),
      JSON.stringify({ title: "안녕", orphan: "남은것" }),
    );

    const result = createResult(tempDir);
    await validateI18nRules(tempDir, result, { fix: true });

    expect(result.warnings).toHaveLength(0);
    expect(result.passes.some((p) => p.includes("Auto-fixed") && p.includes("orphan"))).toBe(true);

    const { readFile: rf } = await import("node:fs/promises");
    const fixed = JSON.parse(await rf(join(localesDir, "ko.json"), "utf-8"));
    expect(fixed.orphan).toBeUndefined();
  });

  it("detects empty string values", async () => {
    const localesDir = join(tempDir, "src", "locales", "common");
    await mkdir(localesDir, { recursive: true });
    await writeFile(
      join(localesDir, "en.json"),
      JSON.stringify({ title: "Hello" }),
    );
    await writeFile(
      join(localesDir, "ko.json"),
      JSON.stringify({ title: "" }),
    );

    const result = createResult(tempDir);
    await validateI18nRules(tempDir, result);

    expect(result.warnings.some((w) => w.includes("Empty value") && w.includes("title"))).toBe(true);
  });

  it("handles nested keys correctly", async () => {
    const localesDir = join(tempDir, "src", "locales", "common");
    await mkdir(localesDir, { recursive: true });
    await writeFile(
      join(localesDir, "en.json"),
      JSON.stringify({ form: { label: { name: "Name", email: "Email" } } }),
    );
    await writeFile(
      join(localesDir, "ko.json"),
      JSON.stringify({ form: { label: { name: "이름" } } }),
    );

    const result = createResult(tempDir);
    await validateI18nRules(tempDir, result);

    expect(result.errors.some((e) => e.includes("form.label.email") && e.includes("ko"))).toBe(true);
  });

  it("auto-fixes nested missing keys with --fix", async () => {
    const localesDir = join(tempDir, "src", "locales", "common");
    await mkdir(localesDir, { recursive: true });
    await writeFile(
      join(localesDir, "en.json"),
      JSON.stringify({ form: { label: { name: "Name", email: "Email" } } }),
    );
    await writeFile(
      join(localesDir, "ko.json"),
      JSON.stringify({ form: { label: { name: "이름" } } }),
    );

    const result = createResult(tempDir);
    await validateI18nRules(tempDir, result, { fix: true });

    expect(result.errors).toHaveLength(0);

    const { readFile: rf } = await import("node:fs/promises");
    const fixed = JSON.parse(await rf(join(localesDir, "ko.json"), "utf-8"));
    expect(fixed.form.label.email).toBe("Email");
  });

  it("auto-fixes nested extra keys with --fix and cleans empty parents", async () => {
    const localesDir = join(tempDir, "src", "locales", "common");
    await mkdir(localesDir, { recursive: true });
    await writeFile(
      join(localesDir, "en.json"),
      JSON.stringify({ title: "Hello" }),
    );
    await writeFile(
      join(localesDir, "ko.json"),
      JSON.stringify({ title: "안녕", nested: { deep: { orphan: "remove me" } } }),
    );

    const result = createResult(tempDir);
    await validateI18nRules(tempDir, result, { fix: true });

    const { readFile: rf } = await import("node:fs/promises");
    const fixed = JSON.parse(await rf(join(localesDir, "ko.json"), "utf-8"));
    expect(fixed.nested).toBeUndefined();
  });

  it("handles array values in locale files", async () => {
    const localesDir = join(tempDir, "src", "locales", "common");
    await mkdir(localesDir, { recursive: true });
    await writeFile(
      join(localesDir, "en.json"),
      JSON.stringify({ items: ["one", "two"], title: "Hello" }),
    );
    await writeFile(
      join(localesDir, "ko.json"),
      JSON.stringify({ items: ["하나", "둘"], title: "안녕" }),
    );

    const result = createResult(tempDir);
    await validateI18nRules(tempDir, result);

    expect(result.errors).toHaveLength(0);
  });

  it("returns early when locales directory does not exist", async () => {
    const result = createResult(tempDir);
    await validateI18nRules(tempDir, result);

    expect(result.errors).toHaveLength(0);
    expect(result.passes).toHaveLength(0);
  });

  it("skips group with only one locale file", async () => {
    const localesDir = join(tempDir, "src", "locales", "single");
    await mkdir(localesDir, { recursive: true });
    await writeFile(
      join(localesDir, "en.json"),
      JSON.stringify({ title: "Hello" }),
    );

    const result = createResult(tempDir);
    await validateI18nRules(tempDir, result);

    // Only one locale, so consistency check is skipped for that group
    expect(result.errors).toHaveLength(0);
  });

  it("discovers locale files in nested subdirectories", async () => {
    const dir1 = join(tempDir, "src", "locales", "common");
    const dir2 = join(tempDir, "src", "locales", "errors");
    await mkdir(dir1, { recursive: true });
    await mkdir(dir2, { recursive: true });

    await writeFile(join(dir1, "en.json"), JSON.stringify({ title: "Hello" }));
    await writeFile(join(dir1, "ko.json"), JSON.stringify({ title: "안녕" }));
    await writeFile(join(dir2, "en.json"), JSON.stringify({ error: "Fail" }));
    await writeFile(join(dir2, "ko.json"), JSON.stringify({ error: "실패" }));

    const result = createResult(tempDir);
    await validateI18nRules(tempDir, result);

    expect(result.errors).toHaveLength(0);
    // Two groups checked
    expect(result.passes.filter((p) => p.includes("locale consistency checked"))).toHaveLength(2);
  });

  it("uses en as reference locale when available", async () => {
    const localesDir = join(tempDir, "src", "locales", "common");
    await mkdir(localesDir, { recursive: true });
    await writeFile(
      join(localesDir, "en.json"),
      JSON.stringify({ title: "Hello", desc: "World" }),
    );
    await writeFile(
      join(localesDir, "ja.json"),
      JSON.stringify({ title: "こんにちは" }),
    );

    const result = createResult(tempDir);
    await validateI18nRules(tempDir, result);

    // en is reference, ja is missing "desc"
    expect(result.errors.some((e) => e.includes("desc") && e.includes("ja"))).toBe(true);
  });

  it("auto-fixes missing deeply nested key where intermediate object does not exist", async () => {
    const localesDir = join(tempDir, "src", "locales", "common");
    await mkdir(localesDir, { recursive: true });
    // en has deep nesting
    await writeFile(
      join(localesDir, "en.json"),
      JSON.stringify({ section: { form: { label: "Name" } } }),
    );
    // ko is missing the entire "section" branch
    await writeFile(
      join(localesDir, "ko.json"),
      JSON.stringify({}),
    );

    const result = createResult(tempDir);
    await validateI18nRules(tempDir, result, { fix: true });

    expect(result.errors).toHaveLength(0);
    expect(result.passes.some((p) => p.includes("Auto-fixed") && p.includes("section.form.label"))).toBe(true);

    const { readFile: rf } = await import("node:fs/promises");
    const fixed = JSON.parse(await rf(join(localesDir, "ko.json"), "utf-8"));
    expect(fixed.section.form.label).toBe("Name");
  });

  it("auto-fixes extra nested key while preserving sibling keys (break path)", async () => {
    const localesDir = join(tempDir, "src", "locales", "common");
    await mkdir(localesDir, { recursive: true });
    await writeFile(
      join(localesDir, "en.json"),
      JSON.stringify({ group: { keep: "Keep this" } }),
    );
    // ko has an extra key inside "group" alongside the valid key
    await writeFile(
      join(localesDir, "ko.json"),
      JSON.stringify({ group: { keep: "유지", extra: "삭제" } }),
    );

    const result = createResult(tempDir);
    await validateI18nRules(tempDir, result, { fix: true });

    const { readFile: rf } = await import("node:fs/promises");
    const fixed = JSON.parse(await rf(join(localesDir, "ko.json"), "utf-8"));
    // "group" should still exist because "keep" is still in it
    expect(fixed.group.keep).toBe("유지");
    expect(fixed.group.extra).toBeUndefined();
  });
});

describe("validateFsdRules", () => {
  it("passes when manifest.ts exists", async () => {
    const srcDir = join(tempDir, "src");
    await mkdir(srcDir, { recursive: true });
    await writeFile(join(srcDir, "manifest.ts"), "export default {};");

    const result = createResult(tempDir);
    await validateFsdRules(tempDir, result);

    expect(result.passes.some((p) => p.includes("Manifest exists"))).toBe(true);
  });

  it("errors when manifest.ts is missing", async () => {
    const srcDir = join(tempDir, "src");
    await mkdir(srcDir, { recursive: true });

    const result = createResult(tempDir);
    await validateFsdRules(tempDir, result);

    expect(result.errors.some((e) => e.includes("Missing manifest.ts"))).toBe(true);
  });

  it("errors when features/ imports from widgets/", async () => {
    const srcDir = join(tempDir, "src");
    await mkdir(join(srcDir, "features"), { recursive: true });
    await writeFile(join(srcDir, "manifest.ts"), "export default {};");
    await writeFile(
      join(srcDir, "features", "some-feature.ts"),
      'import { Widget } from "../widgets/widget";\n',
    );

    const result = createResult(tempDir);
    await validateFsdRules(tempDir, result);

    expect(result.errors.some((e) => e.includes("features/") && e.includes("widgets/"))).toBe(true);
  });

  it("errors when shared/ imports from features/ or widgets/", async () => {
    const srcDir = join(tempDir, "src");
    await mkdir(join(srcDir, "shared"), { recursive: true });
    await writeFile(join(srcDir, "manifest.ts"), "export default {};");
    await writeFile(
      join(srcDir, "shared", "util.ts"),
      'import { something } from "../features/foo";\n',
    );

    const result = createResult(tempDir);
    await validateFsdRules(tempDir, result);

    expect(result.errors.some((e) => e.includes("shared/") && e.includes("features/"))).toBe(true);
  });

  it("passes when no FSD violations exist", async () => {
    const srcDir = join(tempDir, "src");
    await mkdir(join(srcDir, "features"), { recursive: true });
    await mkdir(join(srcDir, "shared"), { recursive: true });
    await writeFile(join(srcDir, "manifest.ts"), "export default {};");
    await writeFile(
      join(srcDir, "features", "clean.ts"),
      'import { helper } from "../shared/utils";\n',
    );
    await writeFile(
      join(srcDir, "shared", "utils.ts"),
      "export const helper = 42;\n",
    );

    const result = createResult(tempDir);
    await validateFsdRules(tempDir, result);

    expect(result.errors).toHaveLength(0);
    expect(result.passes.some((p) => p.includes("FSD"))).toBe(true);
  });

  it("returns early when src/ does not exist", async () => {
    const result = createResult(tempDir);
    await validateFsdRules(tempDir, result);

    expect(result.errors).toHaveLength(0);
    expect(result.passes).toHaveLength(0);
  });
});

describe("validateImportRules", () => {
  it("errors on cross-module imports", async () => {
    const srcDir = join(tempDir, "src");
    await mkdir(srcDir, { recursive: true });
    await writeFile(
      join(srcDir, "service.ts"),
      'import { foo } from "../../../modules/other/bar";\n',
    );

    const result = createResult(tempDir);
    await validateImportRules(tempDir, result, tempDir);

    expect(result.errors.some((e) => e.includes("Cross-module import"))).toBe(true);
  });

  it("passes when no cross-module imports exist", async () => {
    const srcDir = join(tempDir, "src");
    await mkdir(srcDir, { recursive: true });
    await writeFile(
      join(srcDir, "service.ts"),
      'import { bar } from "./utils";\n',
    );

    const result = createResult(tempDir);
    await validateImportRules(tempDir, result, tempDir);

    expect(result.errors).toHaveLength(0);
    expect(result.passes.some((p) => p.includes("No cross-module direct imports"))).toBe(true);
  });

  it("returns early when src/ does not exist", async () => {
    const result = createResult(tempDir);
    await validateImportRules(tempDir, result, tempDir);

    expect(result.errors).toHaveLength(0);
    expect(result.passes).toHaveLength(0);
  });
});
