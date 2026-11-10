import { join, relative } from "node:path";
import { readdir, writeFile } from "node:fs/promises";
import { pathExists, readJsonFile } from "../utils/fs.js";
import type { ValidationResult } from "../commands/validate.js";

/** What the i18n rules take besides the module they read. */
export interface I18nRuleOptions {
  readonly fix?: boolean;
  /**
   * Keys a locale may hold that the reference locale does not, by locale code: a word list one
   * language needs and another has no use for. A key listed here, or one beneath it, is never
   * reported as extra and never removed by the fix.
   */
  readonly localeOnlyKeys?: Readonly<Record<string, readonly string[]>>;
}

export async function validateI18nRules(
  moduleDir: string,
  result: ValidationResult,
  options?: I18nRuleOptions,
): Promise<void> {
  const localesDir = join(moduleDir, "src", "locales");
  if (!(await pathExists(localesDir))) return;

  const localeGroups = await discoverLocaleFiles(localesDir);
  if (localeGroups.size === 0) return;

  for (const [groupPath, localeFiles] of localeGroups) {
    const relGroup = relative(moduleDir, groupPath);
    const translations = await loadLocaleFiles(groupPath, localeFiles);
    if (translations.size < 2) continue;

    const refLocale = translations.has("en")
      ? "en"
      : translations.keys().next().value!;
    const refData = translations.get(refLocale)!;
    const refKeys = flattenKeys(refData);

    for (const [locale, content] of translations) {
      if (locale === refLocale) continue;

      const localeKeys = flattenKeys(content);
      const expected = expectedKeysFor(refKeys.map((k) => k.key), locale);
      const refKeySet = new Set(expected.keys());
      const localeKeySet = new Set(localeKeys.map((k) => k.key));

      const localeModified = applyKeyChecks(
        expected,
        refKeySet,
        localeKeySet,
        refData,
        content,
        locale,
        refLocale,
        relGroup,
        result,
        options,
      );

      if (localeModified) {
        const filePath = join(groupPath, `${locale}.json`);
        await writeFile(
          filePath,
          JSON.stringify(content, null, 2) + "\n",
          "utf-8",
        );
      }

      const updatedLocaleKeys = localeModified
        ? flattenKeys(content)
        : localeKeys;

      checkEmptyValues(updatedLocaleKeys, locale, relGroup, result);
      checkInterpolationMismatch(refKeys, updatedLocaleKeys, locale, relGroup, result);
    }

    result.passes.push(`i18n: ${relGroup} locale consistency checked`);
  }
}

const PLURAL_SUFFIX = /^(.*?)(_ordinal)?_(zero|one|two|few|many|other)$/;

/**
 * The keys a locale's catalogue must hold, each mapped to the reference key its value comes from.
 *
 * <p>A plural key (`<base>_<category>`, or `<base>_ordinal_<category>`, whose `_other` form the
 * reference holds) is expanded to the plural categories the locale's own CLDR rules use, not the
 * reference's: Korean has only `other`, so an English `_one` is never asked of it, and a Russian
 * catalogue is asked for `_few` and `_many`, filled from the reference's `_other`.
 *
 * @param refKeys the flattened keys of the reference catalogue
 * @param locale the locale whose catalogue is checked
 */
export function expectedKeysFor(refKeys: readonly string[], locale: string): Map<string, string> {
  const present = new Set(refKeys);
  const expected = new Map<string, string>();
  const categoriesOf = (ordinal: boolean): readonly string[] => {
    try {
      return new Intl.PluralRules(locale, { type: ordinal ? "ordinal" : "cardinal" }).resolvedOptions().pluralCategories;
    } catch (err) {
      if (err instanceof RangeError) return ["other"];
      throw err;
    }
  };
  for (const key of refKeys) {
    const plural = PLURAL_SUFFIX.exec(key);
    const stem = plural ? `${plural[1]}${plural[2] ?? ""}` : undefined;
    if (!plural || stem === undefined || !present.has(`${stem}_other`)) {
      expected.set(key, key);
      continue;
    }
    for (const category of categoriesOf(plural[2] !== undefined)) {
      const target = `${stem}_${category}`;
      if (!expected.has(target)) expected.set(target, present.has(target) ? target : `${stem}_other`);
    }
  }
  return expected;
}

async function loadLocaleFiles(
  groupPath: string,
  localeFiles: string[],
): Promise<Map<string, Record<string, unknown>>> {
  const translations = new Map<string, Record<string, unknown>>();
  for (const file of localeFiles) {
    const locale = file.replace(".json", "");
    const content = await readJsonFile<Record<string, unknown>>(
      join(groupPath, file),
    );
    translations.set(locale, content);
  }
  return translations;
}

function applyKeyChecks(
  expected: Map<string, string>,
  refKeySet: Set<string>,
  localeKeySet: Set<string>,
  refData: Record<string, unknown>,
  content: Record<string, unknown>,
  locale: string,
  refLocale: string,
  relGroup: string,
  result: ValidationResult,
  options?: I18nRuleOptions,
): boolean {
  let modified = false;

  modified = checkMissingKeys(
    expected,
    refKeySet,
    localeKeySet,
    refData,
    content,
    locale,
    refLocale,
    relGroup,
    result,
    options,
  ) || modified;

  modified = checkExtraKeys(
    refKeySet,
    localeKeySet,
    content,
    locale,
    relGroup,
    result,
    options,
  ) || modified;

  return modified;
}

function checkMissingKeys(
  expected: Map<string, string>,
  refKeySet: Set<string>,
  localeKeySet: Set<string>,
  refData: Record<string, unknown>,
  content: Record<string, unknown>,
  locale: string,
  refLocale: string,
  relGroup: string,
  result: ValidationResult,
  options?: { fix?: boolean },
): boolean {
  let modified = false;

  for (const key of refKeySet) {
    if (localeKeySet.has(key)) continue;

    if (options?.fix) {
      const refValue = getNestedValue(refData, expected.get(key) ?? key);
      setNestedValue(content, key, refValue);
      modified = true;
      result.passes.push(
        `i18n: Auto-fixed: copied "${key}" from ${refLocale}.json to ${locale}.json (${relGroup})`,
      );
    } else {
      result.errors.push(
        `i18n: Missing key "${key}" in ${locale}.json (${relGroup})`,
      );
    }
  }

  return modified;
}

function checkExtraKeys(
  refKeySet: Set<string>,
  localeKeySet: Set<string>,
  content: Record<string, unknown>,
  locale: string,
  relGroup: string,
  result: ValidationResult,
  options?: I18nRuleOptions,
): boolean {
  let modified = false;
  const own = options?.localeOnlyKeys?.[locale] ?? [];

  for (const key of localeKeySet) {
    if (refKeySet.has(key)) continue;
    if (own.some((one) => key === one || key.startsWith(`${one}.`))) continue;

    if (options?.fix) {
      deleteNestedValue(content, key);
      modified = true;
      result.passes.push(
        `i18n: Auto-fixed: removed extra key "${key}" from ${locale}.json (${relGroup})`,
      );
    } else {
      result.warnings.push(
        `i18n: Extra key "${key}" in ${locale}.json (${relGroup})`,
      );
    }
  }

  return modified;
}

function checkEmptyValues(
  localeKeys: FlatKey[],
  locale: string,
  relGroup: string,
  result: ValidationResult,
): void {
  for (const { key, value } of localeKeys) {
    if (typeof value === "string" && value.trim() === "") {
      result.warnings.push(
        `i18n: Empty value for "${key}" in ${locale}.json (${relGroup})`,
      );
    }
  }
}

function checkInterpolationMismatch(
  refKeys: FlatKey[],
  localeKeys: FlatKey[],
  locale: string,
  relGroup: string,
  result: ValidationResult,
): void {
  for (const { key, value } of refKeys) {
    if (typeof value !== "string") continue;
    const refVars = extractInterpolationVars(value);
    if (refVars.length === 0) continue;

    const localeEntry = localeKeys.find((k) => k.key === key);
    if (!localeEntry || typeof localeEntry.value !== "string") continue;

    const localeVars = extractInterpolationVars(localeEntry.value);
    const missingVars = refVars.filter((v) => !localeVars.includes(v));

    for (const v of missingVars) {
      result.errors.push(
        `i18n: Missing interpolation "{{${v}}}" for key "${key}" in ${locale}.json (${relGroup})`,
      );
    }
  }
}

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  const keys = path.split(".");
  let current: unknown = obj;
  for (const key of keys) {
    if (current && typeof current === "object" && !Array.isArray(current)) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return undefined;
    }
  }
  return current;
}

function setNestedValue(
  obj: Record<string, unknown>,
  path: string,
  value: unknown,
): void {
  const keys = path.split(".");
  let current: Record<string, unknown> = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!(key in current) || typeof current[key] !== "object") {
      current[key] = {};
    }
    current = current[key] as Record<string, unknown>;
  }
  current[keys[keys.length - 1]] = value;
}

function deleteNestedValue(
  obj: Record<string, unknown>,
  path: string,
): void {
  const keys = path.split(".");
  if (keys.length === 1) {
    delete obj[keys[0]];
    return;
  }

  let current: Record<string, unknown> = obj;
  const parents: Array<{ obj: Record<string, unknown>; key: string }> = [];

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!(key in current) || typeof current[key] !== "object") return;
    parents.push({ obj: current, key });
    current = current[key] as Record<string, unknown>;
  }

  delete current[keys[keys.length - 1]];

  for (let i = parents.length - 1; i >= 0; i--) {
    const parent = parents[i];
    const child = parent.obj[parent.key] as Record<string, unknown>;
    if (Object.keys(child).length === 0) {
      delete parent.obj[parent.key];
    } else {
      break;
    }
  }
}

interface FlatKey {
  key: string;
  value: unknown;
}

function flattenKeys(
  obj: Record<string, unknown>,
  prefix = "",
): FlatKey[] {
  const result: FlatKey[] = [];

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (value && typeof value === "object" && !Array.isArray(value)) {
      result.push(
        ...flattenKeys(value as Record<string, unknown>, fullKey),
      );
    } else {
      result.push({ key: fullKey, value });
    }
  }

  return result;
}

/**
 * The variable names an i18next string interpolates. A placeholder may carry a formatter after a comma
 * (`{{plan, josa(을/를)}}`, `{{n, number}}`) or the unescape flag (`{{- html}}`); only the name counts.
 */
function extractInterpolationVars(str: string): string[] {
  return [...str.matchAll(/\{\{\s*-?\s*([\w.]+)\s*(?:,[^}]*)?\}\}/g)].map((m) => m[1]!);
}

async function discoverLocaleFiles(
  dir: string,
): Promise<Map<string, string[]>> {
  const groups = new Map<string, string[]>();

  async function walk(d: string): Promise<void> {
    if (!(await pathExists(d))) return;
    const entries = await readdir(d, { withFileTypes: true });

    const jsonFiles = entries
      .filter((e) => e.isFile() && e.name.endsWith(".json"))
      .map((e) => e.name);

    if (jsonFiles.length > 0) {
      groups.set(d, jsonFiles);
    }

    for (const entry of entries) {
      if (entry.isDirectory() && entry.name !== "node_modules") {
        await walk(join(d, entry.name));
      }
    }
  }

  await walk(dir);
  return groups;
}
