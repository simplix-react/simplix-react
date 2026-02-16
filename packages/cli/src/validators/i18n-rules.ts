import { join, relative } from "node:path";
import { readdir, writeFile } from "node:fs/promises";
import { pathExists, readJsonFile } from "../utils/fs.js";
import type { ValidationResult } from "../commands/validate.js";

export async function validateI18nRules(
  moduleDir: string,
  result: ValidationResult,
  options?: { fix?: boolean },
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
      const refKeySet = new Set(refKeys.map((k) => k.key));
      const localeKeySet = new Set(localeKeys.map((k) => k.key));

      const localeModified = applyKeyChecks(
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

  modified = checkMissingKeys(
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
      const refValue = getNestedValue(refData, key);
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
  options?: { fix?: boolean },
): boolean {
  let modified = false;

  for (const key of localeKeySet) {
    if (refKeySet.has(key)) continue;

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

function extractInterpolationVars(str: string): string[] {
  const matches = str.match(/\{\{(\w+)\}\}/g);
  if (!matches) return [];
  return matches.map((m) => m.replace(/\{\{|\}\}/g, ""));
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
