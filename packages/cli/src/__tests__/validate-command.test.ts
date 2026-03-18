import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtemp, rm, mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import {
  validateFsdRules,
  validateImportRules,
  validatePackageRules,
  validateI18nRules,
} from "../validators/index.js";
import type { ValidationResult } from "../commands/validate.js";

let tempDir: string;

function makeResult(): ValidationResult {
  return { path: "test", errors: [], warnings: [], passes: [] };
}

beforeEach(async () => {
  tempDir = await mkdtemp(join(tmpdir(), "validate-test-"));
});

afterEach(async () => {
  await rm(tempDir, { recursive: true, force: true });
});

// ── FSD Rules ───────────────────────────────────────────────

describe("validateFsdRules", () => {
  it("passes when manifest exists (module mode)", async () => {
    const srcDir = join(tempDir, "src");
    await mkdir(srcDir, { recursive: true });
    await writeFile(join(srcDir, "manifest.ts"), "export default {};");

    const result = makeResult();
    await validateFsdRules(tempDir, result);
    expect(result.passes).toContain("Manifest exists");
    expect(result.errors.filter((e) => e.includes("manifest"))).toHaveLength(0);
  });

  it("reports error when manifest is missing (module mode)", async () => {
    const srcDir = join(tempDir, "src");
    await mkdir(srcDir, { recursive: true });

    const result = makeResult();
    await validateFsdRules(tempDir, result);
    expect(result.errors).toContain("Missing manifest.ts");
  });

  it("skips manifest check for app mode", async () => {
    const srcDir = join(tempDir, "src");
    await mkdir(srcDir, { recursive: true });

    const result = makeResult();
    await validateFsdRules(tempDir, result, { type: "app" });
    expect(result.errors.filter((e) => e.includes("manifest"))).toHaveLength(0);
  });

  it("reports FSD violation: features imports from widgets", async () => {
    const featuresDir = join(tempDir, "src/features");
    await mkdir(featuresDir, { recursive: true });
    await writeFile(join(featuresDir, "foo.ts"), 'import { Bar } from "../widgets/bar";\n');
    await writeFile(join(tempDir, "src/manifest.ts"), "export default {};");

    const result = makeResult();
    await validateFsdRules(tempDir, result);
    expect(result.errors.some((e) => e.includes("features/ imports from widgets/"))).toBe(true);
  });

  it("passes FSD when features has no widget imports", async () => {
    const featuresDir = join(tempDir, "src/features");
    await mkdir(featuresDir, { recursive: true });
    await writeFile(join(featuresDir, "foo.ts"), 'import { Bar } from "../shared/bar";\n');
    await writeFile(join(tempDir, "src/manifest.ts"), "export default {};");

    const result = makeResult();
    await validateFsdRules(tempDir, result);
    expect(result.passes).toContain("FSD: features/ has no widgets/ imports");
  });

  it("reports FSD violation: shared imports from features", async () => {
    const sharedDir = join(tempDir, "src/shared");
    await mkdir(sharedDir, { recursive: true });
    await writeFile(join(sharedDir, "util.ts"), 'import { X } from "../features/x";\n');
    await writeFile(join(tempDir, "src/manifest.ts"), "export default {};");

    const result = makeResult();
    await validateFsdRules(tempDir, result);
    expect(result.errors.some((e) => e.includes("shared/ imports from"))).toBe(true);
  });

  it("does nothing when src dir does not exist", async () => {
    const result = makeResult();
    await validateFsdRules(tempDir, result);
    expect(result.errors).toHaveLength(0);
    expect(result.passes).toHaveLength(0);
  });
});

// ── Import Rules ────────────────────────────────────────────

describe("validateImportRules", () => {
  it("passes when no cross-module imports", async () => {
    const srcDir = join(tempDir, "src");
    await mkdir(srcDir, { recursive: true });
    await writeFile(join(srcDir, "foo.ts"), 'import { x } from "./bar";\n');

    const result = makeResult();
    await validateImportRules(tempDir, result, "/root");
    expect(result.passes).toContain("No cross-module direct imports");
  });

  it("reports cross-module imports", async () => {
    const srcDir = join(tempDir, "src");
    await mkdir(srcDir, { recursive: true });
    await writeFile(join(srcDir, "foo.ts"), 'import { x } from "../../../modules/other/src/bar";\n');

    const result = makeResult();
    await validateImportRules(tempDir, result, "/root");
    expect(result.errors.some((e) => e.includes("Cross-module import"))).toBe(true);
  });

  it("does nothing when src dir does not exist", async () => {
    const result = makeResult();
    await validateImportRules(tempDir, result, "/root");
    expect(result.errors).toHaveLength(0);
    expect(result.passes).toHaveLength(0);
  });
});

// ── Package Rules ───────────────────────────────────────────

describe("validatePackageRules", () => {
  it("passes when package has exports and type module", async () => {
    await writeFile(
      join(tempDir, "package.json"),
      JSON.stringify({ name: "test", type: "module", exports: { ".": "./src/index.ts" } }),
    );
    await writeFile(join(tempDir, "tsup.config.ts"), "export default {};");

    const result = makeResult();
    await validatePackageRules(tempDir, result);
    expect(result.passes).toContain('Has "exports" field');
    expect(result.passes).toContain('"type": "module"');
    expect(result.passes).toContain("tsup.config exists");
  });

  it("warns when exports field is missing", async () => {
    await writeFile(
      join(tempDir, "package.json"),
      JSON.stringify({ name: "test", type: "module" }),
    );

    const result = makeResult();
    await validatePackageRules(tempDir, result);
    expect(result.warnings).toContain('Missing "exports" field in package.json');
  });

  it("warns when tsup.config is missing", async () => {
    await writeFile(
      join(tempDir, "package.json"),
      JSON.stringify({ name: "test", type: "module" }),
    );

    const result = makeResult();
    await validatePackageRules(tempDir, result);
    expect(result.warnings).toContain("Missing tsup.config.ts or tsup.config.js");
  });

  it("warns when type module is missing", async () => {
    await writeFile(
      join(tempDir, "package.json"),
      JSON.stringify({ name: "test" }),
    );

    const result = makeResult();
    await validatePackageRules(tempDir, result);
    expect(result.warnings).toContain('Missing "type": "module" in package.json');
  });

  it("warns when react dep exists but no peerDep", async () => {
    await writeFile(
      join(tempDir, "package.json"),
      JSON.stringify({ name: "test", type: "module", dependencies: { react: "^18.0.0" } }),
    );

    const result = makeResult();
    await validatePackageRules(tempDir, result);
    expect(result.warnings).toContain("Uses react but missing react in peerDependencies");
  });

  it("auto-fixes missing type module", async () => {
    await writeFile(
      join(tempDir, "package.json"),
      JSON.stringify({ name: "test" }),
    );

    const result = makeResult();
    await validatePackageRules(tempDir, result, { fix: true });
    expect(result.passes.some((p) => p.includes("Auto-fixed"))).toBe(true);
  });

  it("auto-fixes missing react peerDependency", async () => {
    await writeFile(
      join(tempDir, "package.json"),
      JSON.stringify({ name: "test", type: "module", dependencies: { react: "^18.0.0" } }),
    );

    const result = makeResult();
    await validatePackageRules(tempDir, result, { fix: true });
    expect(result.passes.some((p) => p.includes("react") && p.includes("peerDependencies"))).toBe(true);
  });

  it("does nothing when no package.json", async () => {
    const result = makeResult();
    await validatePackageRules(tempDir, result);
    expect(result.errors).toHaveLength(0);
    expect(result.passes).toHaveLength(0);
  });
});

// ── I18n Rules ──────────────────────────────────────────────

describe("validateI18nRules", () => {
  it("does nothing when no locales dir", async () => {
    const result = makeResult();
    await validateI18nRules(tempDir, result);
    expect(result.errors).toHaveLength(0);
    expect(result.passes).toHaveLength(0);
  });

  it("reports missing keys in non-reference locale", async () => {
    const localesDir = join(tempDir, "src/locales");
    await mkdir(localesDir, { recursive: true });
    await writeFile(join(localesDir, "en.json"), JSON.stringify({ greeting: "Hello", farewell: "Bye" }));
    await writeFile(join(localesDir, "ko.json"), JSON.stringify({ greeting: "안녕" }));

    const result = makeResult();
    await validateI18nRules(tempDir, result);
    expect(result.errors.some((e) => e.includes('Missing key "farewell"'))).toBe(true);
  });

  it("reports extra keys in non-reference locale", async () => {
    const localesDir = join(tempDir, "src/locales");
    await mkdir(localesDir, { recursive: true });
    await writeFile(join(localesDir, "en.json"), JSON.stringify({ greeting: "Hello" }));
    await writeFile(join(localesDir, "ko.json"), JSON.stringify({ greeting: "안녕", extra: "추가" }));

    const result = makeResult();
    await validateI18nRules(tempDir, result);
    expect(result.warnings.some((w) => w.includes('Extra key "extra"'))).toBe(true);
  });

  it("reports empty string values", async () => {
    const localesDir = join(tempDir, "src/locales");
    await mkdir(localesDir, { recursive: true });
    await writeFile(join(localesDir, "en.json"), JSON.stringify({ greeting: "Hello" }));
    await writeFile(join(localesDir, "ko.json"), JSON.stringify({ greeting: "" }));

    const result = makeResult();
    await validateI18nRules(tempDir, result);
    expect(result.warnings.some((w) => w.includes("Empty value"))).toBe(true);
  });

  it("reports missing interpolation variables", async () => {
    const localesDir = join(tempDir, "src/locales");
    await mkdir(localesDir, { recursive: true });
    await writeFile(join(localesDir, "en.json"), JSON.stringify({ greeting: "Hello {{name}}" }));
    await writeFile(join(localesDir, "ko.json"), JSON.stringify({ greeting: "안녕" }));

    const result = makeResult();
    await validateI18nRules(tempDir, result);
    expect(result.errors.some((e) => e.includes("Missing interpolation"))).toBe(true);
  });

  it("auto-fixes missing keys", async () => {
    const localesDir = join(tempDir, "src/locales");
    await mkdir(localesDir, { recursive: true });
    await writeFile(join(localesDir, "en.json"), JSON.stringify({ greeting: "Hello", farewell: "Bye" }));
    await writeFile(join(localesDir, "ko.json"), JSON.stringify({ greeting: "안녕" }));

    const result = makeResult();
    await validateI18nRules(tempDir, result, { fix: true });
    expect(result.passes.some((p) => p.includes("Auto-fixed") && p.includes("farewell"))).toBe(true);
  });

  it("auto-fixes extra keys", async () => {
    const localesDir = join(tempDir, "src/locales");
    await mkdir(localesDir, { recursive: true });
    await writeFile(join(localesDir, "en.json"), JSON.stringify({ greeting: "Hello" }));
    await writeFile(join(localesDir, "ko.json"), JSON.stringify({ greeting: "안녕", extra: "추가" }));

    const result = makeResult();
    await validateI18nRules(tempDir, result, { fix: true });
    expect(result.passes.some((p) => p.includes("Auto-fixed") && p.includes("extra"))).toBe(true);
  });

  it("discovers nested locale directories", async () => {
    const widgetsDir = join(tempDir, "src/locales/widgets");
    await mkdir(widgetsDir, { recursive: true });
    await writeFile(join(widgetsDir, "en.json"), JSON.stringify({ title: "Title" }));
    await writeFile(join(widgetsDir, "ko.json"), JSON.stringify({ title: "제목" }));

    const result = makeResult();
    await validateI18nRules(tempDir, result);
    expect(result.passes.some((p) => p.includes("locale consistency"))).toBe(true);
  });

  it("handles nested keys for validation", async () => {
    const localesDir = join(tempDir, "src/locales");
    await mkdir(localesDir, { recursive: true });
    await writeFile(join(localesDir, "en.json"), JSON.stringify({
      user: { name: "Name", email: "Email" },
    }));
    await writeFile(join(localesDir, "ko.json"), JSON.stringify({
      user: { name: "이름" },
    }));

    const result = makeResult();
    await validateI18nRules(tempDir, result);
    expect(result.errors.some((e) => e.includes("user.email"))).toBe(true);
  });
});
