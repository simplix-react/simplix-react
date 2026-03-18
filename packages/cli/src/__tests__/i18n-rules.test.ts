import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtemp, rm, mkdir, writeFile, readFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { validateI18nRules } from "../validators/i18n-rules.js";
import type { ValidationResult } from "../commands/validate.js";

let tempDir: string;

function makeResult(): ValidationResult {
  return { path: "test", errors: [], warnings: [], passes: [] };
}

beforeEach(async () => {
  tempDir = await mkdtemp(join(tmpdir(), "i18n-rules-test-"));
});

afterEach(async () => {
  await rm(tempDir, { recursive: true, force: true });
});

describe("validateI18nRules", () => {
  it("does nothing when src/locales does not exist", async () => {
    const result = makeResult();
    await validateI18nRules(tempDir, result);
    expect(result.errors).toHaveLength(0);
    expect(result.passes).toHaveLength(0);
  });

  it("does nothing when locales dir is empty", async () => {
    await mkdir(join(tempDir, "src/locales"), { recursive: true });
    const result = makeResult();
    await validateI18nRules(tempDir, result);
    expect(result.passes).toHaveLength(0);
  });

  it("does nothing when only one locale file exists", async () => {
    const localesDir = join(tempDir, "src/locales");
    await mkdir(localesDir, { recursive: true });
    await writeFile(join(localesDir, "en.json"), JSON.stringify({ hello: "Hello" }));

    const result = makeResult();
    await validateI18nRules(tempDir, result);
    // Only 1 translation, so no comparison done
  });

  it("reports missing keys in non-reference locale", async () => {
    const localesDir = join(tempDir, "src/locales");
    await mkdir(localesDir, { recursive: true });
    await writeFile(join(localesDir, "en.json"), JSON.stringify({
      greeting: "Hello",
      farewell: "Goodbye",
    }));
    await writeFile(join(localesDir, "ko.json"), JSON.stringify({
      greeting: "안녕",
    }));

    const result = makeResult();
    await validateI18nRules(tempDir, result);
    expect(result.errors.some((e) => e.includes('Missing key "farewell"'))).toBe(true);
  });

  it("reports extra keys in non-reference locale", async () => {
    const localesDir = join(tempDir, "src/locales");
    await mkdir(localesDir, { recursive: true });
    await writeFile(join(localesDir, "en.json"), JSON.stringify({
      greeting: "Hello",
    }));
    await writeFile(join(localesDir, "ko.json"), JSON.stringify({
      greeting: "안녕",
      extraKey: "추가",
    }));

    const result = makeResult();
    await validateI18nRules(tempDir, result);
    expect(result.warnings.some((w) => w.includes('Extra key "extraKey"'))).toBe(true);
  });

  it("reports empty string values", async () => {
    const localesDir = join(tempDir, "src/locales");
    await mkdir(localesDir, { recursive: true });
    await writeFile(join(localesDir, "en.json"), JSON.stringify({ title: "Title" }));
    await writeFile(join(localesDir, "ko.json"), JSON.stringify({ title: "" }));

    const result = makeResult();
    await validateI18nRules(tempDir, result);
    expect(result.warnings.some((w) => w.includes("Empty value"))).toBe(true);
  });

  it("reports missing interpolation variables", async () => {
    const localesDir = join(tempDir, "src/locales");
    await mkdir(localesDir, { recursive: true });
    await writeFile(join(localesDir, "en.json"), JSON.stringify({
      welcome: "Welcome {{name}}, you have {{count}} items",
    }));
    await writeFile(join(localesDir, "ko.json"), JSON.stringify({
      welcome: "환영합니다 {{name}}",
    }));

    const result = makeResult();
    await validateI18nRules(tempDir, result);
    expect(result.errors.some((e) => e.includes('Missing interpolation "{{count}}"'))).toBe(true);
  });

  it("does not report interpolation when locale value matches", async () => {
    const localesDir = join(tempDir, "src/locales");
    await mkdir(localesDir, { recursive: true });
    await writeFile(join(localesDir, "en.json"), JSON.stringify({
      welcome: "Welcome {{name}}",
    }));
    await writeFile(join(localesDir, "ko.json"), JSON.stringify({
      welcome: "환영합니다 {{name}}",
    }));

    const result = makeResult();
    await validateI18nRules(tempDir, result);
    expect(result.errors.filter((e) => e.includes("interpolation"))).toHaveLength(0);
  });

  it("auto-fixes missing keys by copying from reference", async () => {
    const localesDir = join(tempDir, "src/locales");
    await mkdir(localesDir, { recursive: true });
    await writeFile(join(localesDir, "en.json"), JSON.stringify({
      greeting: "Hello",
      farewell: "Goodbye",
    }));
    await writeFile(join(localesDir, "ko.json"), JSON.stringify({
      greeting: "안녕",
    }));

    const result = makeResult();
    await validateI18nRules(tempDir, result, { fix: true });

    expect(result.passes.some((p) => p.includes("Auto-fixed") && p.includes("farewell"))).toBe(true);

    // Verify the file was actually written
    const koContent = JSON.parse(await readFile(join(localesDir, "ko.json"), "utf-8"));
    expect(koContent.farewell).toBe("Goodbye");
  });

  it("auto-fixes extra keys by removing them", async () => {
    const localesDir = join(tempDir, "src/locales");
    await mkdir(localesDir, { recursive: true });
    await writeFile(join(localesDir, "en.json"), JSON.stringify({
      greeting: "Hello",
    }));
    await writeFile(join(localesDir, "ko.json"), JSON.stringify({
      greeting: "안녕",
      extra: "추가",
    }));

    const result = makeResult();
    await validateI18nRules(tempDir, result, { fix: true });

    expect(result.passes.some((p) => p.includes("Auto-fixed") && p.includes("extra"))).toBe(true);

    const koContent = JSON.parse(await readFile(join(localesDir, "ko.json"), "utf-8"));
    expect(koContent.extra).toBeUndefined();
  });

  it("handles nested keys correctly", async () => {
    const localesDir = join(tempDir, "src/locales");
    await mkdir(localesDir, { recursive: true });
    await writeFile(join(localesDir, "en.json"), JSON.stringify({
      user: {
        name: "Name",
        email: "Email",
      },
    }));
    await writeFile(join(localesDir, "ko.json"), JSON.stringify({
      user: {
        name: "이름",
      },
    }));

    const result = makeResult();
    await validateI18nRules(tempDir, result);
    expect(result.errors.some((e) => e.includes("user.email"))).toBe(true);
  });

  it("discovers nested locale directories", async () => {
    const widgetsDir = join(tempDir, "src/locales/widgets");
    const featuresDir = join(tempDir, "src/locales/features");
    await mkdir(widgetsDir, { recursive: true });
    await mkdir(featuresDir, { recursive: true });

    await writeFile(join(widgetsDir, "en.json"), JSON.stringify({ title: "Title" }));
    await writeFile(join(widgetsDir, "ko.json"), JSON.stringify({ title: "제목" }));
    await writeFile(join(featuresDir, "en.json"), JSON.stringify({ label: "Label" }));
    await writeFile(join(featuresDir, "ko.json"), JSON.stringify({ label: "라벨" }));

    const result = makeResult();
    await validateI18nRules(tempDir, result);
    expect(result.passes.filter((p) => p.includes("locale consistency")).length).toBe(2);
  });

  it("uses en as reference locale when available", async () => {
    const localesDir = join(tempDir, "src/locales");
    await mkdir(localesDir, { recursive: true });
    // Write ja first, then en — en should still be picked as reference
    await writeFile(join(localesDir, "ja.json"), JSON.stringify({ hello: "こんにちは" }));
    await writeFile(join(localesDir, "en.json"), JSON.stringify({ hello: "Hello", extra: "Extra" }));

    const result = makeResult();
    await validateI18nRules(tempDir, result);
    // ja is missing "extra" key from en reference
    expect(result.errors.some((e) => e.includes('Missing key "extra"') && e.includes("ja.json"))).toBe(true);
  });

  it("auto-fixes nested missing keys", async () => {
    const localesDir = join(tempDir, "src/locales");
    await mkdir(localesDir, { recursive: true });
    await writeFile(join(localesDir, "en.json"), JSON.stringify({
      user: { name: "Name", address: { city: "City" } },
    }));
    await writeFile(join(localesDir, "ko.json"), JSON.stringify({
      user: { name: "이름" },
    }));

    const result = makeResult();
    await validateI18nRules(tempDir, result, { fix: true });

    const koContent = JSON.parse(await readFile(join(localesDir, "ko.json"), "utf-8"));
    expect(koContent.user.address.city).toBe("City");
  });

  it("auto-fixes nested extra keys and cleans empty parents", async () => {
    const localesDir = join(tempDir, "src/locales");
    await mkdir(localesDir, { recursive: true });
    await writeFile(join(localesDir, "en.json"), JSON.stringify({
      title: "Title",
    }));
    await writeFile(join(localesDir, "ko.json"), JSON.stringify({
      title: "제목",
      nested: { deep: { value: "extra" } },
    }));

    const result = makeResult();
    await validateI18nRules(tempDir, result, { fix: true });

    const koContent = JSON.parse(await readFile(join(localesDir, "ko.json"), "utf-8"));
    // The entire "nested" tree should be removed since all children were extra
    expect(koContent.nested).toBeUndefined();
  });
});
