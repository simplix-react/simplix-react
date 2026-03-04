import { readFile, readdir, writeFile } from "node:fs/promises";
import { basename, join, resolve } from "node:path";

import { Command } from "commander";
import ora from "ora";

import { findCrudConfigForEntity } from "../config/crud-config-loader.js";
import { loadConfig } from "../config/config-loader.js";
import {
  crudPageTemplate,
  detailTemplate,
  featureIndexTemplate,
  formTemplate,
  hubPageTemplate,
  listTemplate,
  pageIndexTemplate,
  treeCrudPageTemplate,
  treeTemplate,
} from "../templates/ui/index.js";
import type { EntityField, ExtractedEntity, OpenAPISnapshot, QueryParam } from "../openapi/types.js";
import { toKebabCase, toPascalCase } from "../utils/case.js";
import { pathExists, readJsonFile, writeFileWithDir } from "../utils/fs.js";
import { log } from "../utils/logger.js";
import { renderTemplate } from "../utils/template.js";
import { depVersion } from "../versions.js";

// ── Zod type to component mapping ──

export interface FieldInfo {
  name: string;
  capitalizedName: string;
  label: string;
  tsType: string;
  formComponent: string;
  inputType: string;
  component: string;
  options: string[];
  defaultValue: string;
}

export function parseZodType(zodExpr: string): Omit<FieldInfo, "name" | "label" | "capitalizedName" | "defaultValue"> {
  const trimmed = zodExpr.trim();

  // z.enum([...]) / zod.enum([...])
  const enumMatch = trimmed.match(/(?:z|zod)\.enum\(\[([^\]]+)\]\)/);
  if (enumMatch) {
    const options = enumMatch[1]
      .split(",")
      .map((s) => s.trim().replace(/["']/g, ""));
    return {
      tsType: options.map((o) => `"${o}"`).join(" | "),
      formComponent: "SelectField",
      inputType: "text",
      component: "Select",
      options,
    };
  }

  // z.boolean() / zod.boolean()
  if (/(?:z|zod)\.boolean\(\)/.test(trimmed)) {
    return {
      tsType: "boolean",
      formComponent: "SwitchField",
      inputType: "checkbox",
      component: "Boolean",
      options: [],
    };
  }

  // z.date() / zod.date() or z.coerce.date() / zod.coerce.date() or zod.iso.datetime({})
  if (/(?:z|zod)\.(?:coerce\.)?date\(\)/.test(trimmed) || /(?:z|zod)\.iso\.datetime\(/.test(trimmed)) {
    return {
      tsType: "Date",
      formComponent: "DateField",
      inputType: "date",
      component: "Date",
      options: [],
    };
  }

  // z.number() / zod.number() or z.coerce.number() / zod.coerce.number()
  if (/(?:z|zod)\.(?:coerce\.)?number\(\)/.test(trimmed)) {
    return {
      tsType: "number",
      formComponent: "NumberField",
      inputType: "number",
      component: "Number",
      options: [],
    };
  }

  // z.string() / zod.string() variants
  if (/(?:z|zod)\.string\(\)/.test(trimmed)) {
    if (trimmed.includes(".email()")) {
      return {
        tsType: "string",
        formComponent: "TextField",
        inputType: "email",
        component: "Text",
        options: [],
      };
    }
    if (trimmed.includes(".url()")) {
      return {
        tsType: "string",
        formComponent: "TextField",
        inputType: "url",
        component: "Text",
        options: [],
      };
    }
    const minMatch = trimmed.match(/\.min\((\d+)\)/);
    if (minMatch && Number(minMatch[1]) >= 100) {
      return {
        tsType: "string",
        formComponent: "TextareaField",
        inputType: "text",
        component: "Text",
        options: [],
      };
    }
    return {
      tsType: "string",
      formComponent: "TextField",
      inputType: "text",
      component: "Text",
      options: [],
    };
  }

  // z.array(z.string()) / zod.array(zod.string()) — string array treated as text
  if (/(?:z|zod)\.array\(\s*(?:z|zod)\.string\(\)\s*\)/.test(trimmed)) {
    return {
      tsType: "string",
      formComponent: "TextField",
      inputType: "text",
      component: "Text",
      options: [],
    };
  }

  // Default fallback
  return {
    tsType: "string",
    formComponent: "TextField",
    inputType: "text",
    component: "Text",
    options: [],
  };
}

export function getDefaultValue(tsType: string): string {
  if (tsType === "number") return "0";
  if (tsType === "boolean") return "false";
  if (tsType === "Date") return "new Date()";
  return '""';
}

export function parseSchemaFields(content: string, entityName: string): FieldInfo[] {
  const EntityPascal = entityName.charAt(0).toUpperCase() + entityName.slice(1);

  // Build multiple patterns: simplix-react style + Orval style.
  // Patterns use \w* infixes to support both standard Orval (UpdatePetBody)
  // and Boot-style naming (AdminUserAccountRestUpdateBody).
  const schemaPatterns = [
    // simplix-react: petSchema = z.object(
    new RegExp(
      `(?:export\\s+)?(?:const|let)\\s+\\w*${entityName}\\w*[Ss]chema\\s*=\\s*(?:z|zod)\\.object\\(`,
      "igs",
    ),
    // Orval Body: UpdatePetBody / AdminUserAccountRestUpdateBody = zod.object(
    // Only match Body (request) types — Response types contain envelope fields
    // (type, message, body, timestamp, errorCode, errorDetail) not entity fields.
    new RegExp(
      `(?:export\\s+)?(?:const|let)\\s+\\w*${EntityPascal}\\w*Body\\s*=\\s*(?:z|zod)\\.object\\(`,
      "igs",
    ),
  ];

  // Try each pattern; find ALL matches and pick the result with the most fields.
  // This ensures we pick the best schema (e.g. UpdateBody with 20 fields over
  // ChangePasswordBody with 2 fields).
  let bestFields: FieldInfo[] = [];

  for (const schemaPattern of schemaPatterns) {
    let match: RegExpExecArray | null;
    while ((match = schemaPattern.exec(content)) !== null) {
      const parsed = parseZodObjectBody(content, match);
      if (parsed.length > bestFields.length) {
        bestFields = parsed;
      }
    }
  }

  return bestFields;
}

function parseZodObjectBody(content: string, match: RegExpExecArray): FieldInfo[] {
  const fields: FieldInfo[] = [];

  const openBrace = content.indexOf("{", match.index + match[0].length - 1);
  if (openBrace === -1) return fields;

  const body = extractBraceBlock(content, openBrace);

  // Parse only top-level fields by tracking nesting depth
  const seen = new Set<string>();
  let i = 0;
  while (i < body.length) {
    // Skip whitespace and commas
    while (i < body.length && /[\s,]/.test(body[i])) i++;
    if (i >= body.length) break;

    // Match field name: identifier (or quoted string) followed by ':'
    const fieldNameMatch = body.slice(i).match(/^(?:"(\w+)"|(\w+))\s*:\s*/);
    if (!fieldNameMatch) {
      const nextLine = body.indexOf("\n", i);
      i = nextLine === -1 ? body.length : nextLine + 1;
      continue;
    }

    const name = fieldNameMatch[1] ?? fieldNameMatch[2];
    i += fieldNameMatch[0].length;

    // Extract the Zod expression, tracking brace/paren/bracket depth.
    // String literals are skipped to avoid counting parentheses inside
    // .describe('...unbalanced ( inside...') as nesting changes.
    const exprStart = i;
    let depth = 0;
    while (i < body.length) {
      const ch = body[i];
      if (ch === "'" || ch === '"' || ch === "`") {
        // Skip string literal contents
        const quote = ch;
        i++;
        while (i < body.length && body[i] !== quote) {
          if (body[i] === "\\" && i + 1 < body.length) i++; // skip escaped char
          i++;
        }
        // i now points at the closing quote (or end of body)
      } else if (ch === "(" || ch === "{" || ch === "[") depth++;
      else if (ch === ")" || ch === "}" || ch === "]") {
        if (depth === 0) break;
        depth--;
      } else if (ch === "," && depth === 0) break;
      i++;
    }
    const zodExpr = body.slice(exprStart, i).trim();
    if (i < body.length && body[i] === ",") i++;

    // Deduplicate fields
    if (seen.has(name)) continue;
    seen.add(name);

    // Skip nested object types — not rendered as scalar fields
    if (/^(?:z|zod)\.object\(/.test(zodExpr) || /(?:z|zod)\.array\(\s*(?:z|zod)\.object\(/.test(zodExpr)) continue;

    const parsed = parseZodType(zodExpr);
    fields.push({
      name,
      capitalizedName: name.charAt(0).toUpperCase() + name.slice(1),
      label: name.charAt(0).toUpperCase() + name.slice(1).replace(/_/g, " "),
      defaultValue: parsed.options.length > 0 ? `"${parsed.options[0]}"` : getDefaultValue(parsed.tsType),
      ...parsed,
    });
  }

  return fields;
}

async function searchDir(dir: string): Promise<string[]> {
  const results: string[] = [];
  if (!(await pathExists(dir))) return results;

  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (
      entry.isDirectory() &&
      !entry.name.startsWith(".") &&
      entry.name !== "node_modules" &&
      entry.name !== "dist"
    ) {
      results.push(...(await searchDir(fullPath)));
    } else if (
      entry.isFile() &&
      (entry.name === "schemas.ts" ||
        entry.name === "contract.ts" ||
        entry.name.endsWith(".schema.ts") ||
        entry.name.endsWith(".zod.ts"))
    ) {
      results.push(fullPath);
    }
  }
  return results;
}

interface SchemaResult {
  path: string;
  content: string;
  packageName: string | null;
}

async function findSchemaFile(
  rootDir: string,
  entityName: string,
): Promise<SchemaResult | null> {
  const packagesDir = join(rootDir, "packages");
  const schemaFiles = await searchDir(packagesDir);

  // Build patterns: simplix-react style (petSchema) + Orval style (UpdatePetBody)
  // \w* infixes support Boot-style naming (AdminUserAccountRestUpdateBody)
  const EntityPascal = entityName.charAt(0).toUpperCase() + entityName.slice(1);
  const patterns = [
    // simplix-react: petSchema = z.object(
    new RegExp(`\\w*${entityName}\\w*[Ss]chema\\s*=\\s*(?:z|zod)\\.object`, "i"),
    // Orval Body: UpdatePetBody / AdminUserAccountRestUpdateBody = zod.object(
    new RegExp(`\\w*${EntityPascal}\\w*Body\\s*=\\s*(?:z|zod)\\.object`, "i"),
    // Orval Body|Response: GetPetByIdResponse / AdminUserAccountRestGetResponse = zod.object(
    new RegExp(`\\w*${EntityPascal}\\w*(?:Body|Response)\\s*=\\s*(?:z|zod)\\.object`, "i"),
  ];

  for (const filePath of schemaFiles) {
    const content = await readFile(filePath, "utf-8");
    for (const pattern of patterns) {
      if (pattern.test(content)) {
        const packageName = await resolvePackageName(filePath);
        return { path: filePath, content, packageName };
      }
    }
  }

  return null;
}

async function resolvePackageName(
  schemaPath: string,
): Promise<string | null> {
  let dir = resolve(schemaPath, "..");
  const root = resolve("/");
  while (dir !== root) {
    const pkgJsonPath = join(dir, "package.json");
    if (await pathExists(pkgJsonPath)) {
      try {
        const raw = await readFile(pkgJsonPath, "utf-8");
        const pkg = JSON.parse(raw) as { name?: string };
        return pkg.name ?? null;
      } catch {
        return null;
      }
    }
    dir = resolve(dir, "..");
  }
  return null;
}

async function findModuleDirs(rootDir: string): Promise<string[]> {
  const modulesDir = join(rootDir, "modules");
  if (!(await pathExists(modulesDir))) return [];

  const entries = await readdir(modulesDir, { withFileTypes: true });
  return entries
    .filter((e) => e.isDirectory() && !e.name.startsWith("."))
    .map((e) => e.name);
}

export interface EntityOperations {
  hasList: boolean;
  hasGet: boolean;
  hasCreate: boolean;
  hasUpdate: boolean;
  hasDelete: boolean;
  hasTree: boolean;
}

const CRUD_NAMES = new Set(["list", "get", "create", "update", "delete", "multiUpdate", "batchUpdate", "batchDelete", "search", "tree", "subtree"]);

/** Extract content inside matched braces starting from the `{` at startIndex. */
function extractBraceBlock(content: string, openBraceIndex: number): string {
  let depth = 1;
  let i = openBraceIndex + 1;
  while (i < content.length && depth > 0) {
    if (content[i] === "{") depth++;
    else if (content[i] === "}") depth--;
    i++;
  }
  return content.slice(openBraceIndex + 1, i - 1);
}

/** Find the `{` after a key pattern and extract the brace-balanced block. */
function findBlock(content: string, keyPattern: RegExp): string | null {
  const match = keyPattern.exec(content);
  if (!match) return null;
  const braceIndex = content.indexOf("{", match.index + match[0].length - 1);
  if (braceIndex === -1) return null;
  return extractBraceBlock(content, braceIndex);
}

/** Extract operation names and their roles from an operations block. */
function extractOperationRoles(
  opsBlock: string,
  detectedRoles: Set<string>,
): void {
  const opNamePattern = /^\s*(\w+)\s*:/gm;
  let opMatch: RegExpExecArray | null;
  while ((opMatch = opNamePattern.exec(opsBlock)) !== null) {
    const opName = opMatch[1];
    if (CRUD_NAMES.has(opName)) {
      detectedRoles.add(opName);
    } else {
      const roleMatch = opsBlock
        .slice(opMatch.index)
        .match(
          new RegExp(
            `${opName}\\s*:\\s*\\{[^}]*role\\s*:\\s*["'](\\w+)["']`,
          ),
        );
      if (roleMatch && CRUD_NAMES.has(roleMatch[1])) {
        detectedRoles.add(roleMatch[1]);
      }
    }
  }
}

async function parseEntityOperations(
  rootDir: string,
  entityName: string,
): Promise<EntityOperations> {
  const allTrue: EntityOperations = {
    hasList: true,
    hasGet: true,
    hasCreate: true,
    hasUpdate: true,
    hasDelete: true,
    hasTree: false,
  };

  // 1. crud.config.ts takes priority
  const crudConfig = await findCrudConfigForEntity(rootDir, entityName);
  if (crudConfig) {
    return {
      hasList: !!crudConfig.list,
      hasGet: !!crudConfig.get,
      hasCreate: !!crudConfig.create,
      hasUpdate: !!crudConfig.update,
      hasDelete: !!crudConfig.delete,
      hasTree: !!crudConfig.tree,
    };
  }

  // 2. Fallback: contract.ts-based detection
  const packagesDir = join(rootDir, "packages");
  const contractFiles = (await searchDir(packagesDir)).filter((f) =>
    f.endsWith("contract.ts"),
  );

  if (contractFiles.length === 0) return allTrue;

  let foundEntity = false;
  const detectedRoles = new Set<string>();

  // Phase 1: Parse generated contract
  for (const contractPath of contractFiles) {
    if (!contractPath.includes("/generated/")) continue;

    const content = await readFile(contractPath, "utf-8");

    const entityKeyPattern = new RegExp(`${entityName}\\s*:\\s*\\{`);
    const entityBlock = findBlock(content, entityKeyPattern);
    if (!entityBlock) continue;
    foundEntity = true;

    const opsBlock = findBlock(entityBlock, /operations\s*:\s*\{/);
    if (!opsBlock) continue;

    extractOperationRoles(opsBlock, detectedRoles);
  }

  // Phase 2: Parse user-owned contract (customizeApi patches)
  for (const contractPath of contractFiles) {
    if (contractPath.includes("/generated/")) continue;

    const content = await readFile(contractPath, "utf-8");
    if (!content.includes("customizeApi")) continue;

    const entityKeyPattern = new RegExp(`${entityName}\\s*:\\s*\\{`);
    const entityBlock = findBlock(content, entityKeyPattern);
    if (!entityBlock) continue;

    const opsBlock = findBlock(entityBlock, /operations\s*:\s*\{/);
    if (!opsBlock) continue;

    foundEntity = true;

    // Parse patch operations: added or removed (null)
    const patchOpPattern = /^\s*(\w+)\s*:\s*(null|\{[^}]*\})/gm;
    let patchOpMatch: RegExpExecArray | null;
    while ((patchOpMatch = patchOpPattern.exec(opsBlock)) !== null) {
      const opName = patchOpMatch[1];
      const opValue = patchOpMatch[2].trim();

      if (opValue === "null") {
        // Remove: delete the role if the op name IS a CRUD name
        if (CRUD_NAMES.has(opName)) {
          detectedRoles.delete(opName);
        }
      } else if (CRUD_NAMES.has(opName)) {
        detectedRoles.add(opName);
      } else {
        const roleMatch = opValue.match(/role\s*:\s*["'](\w+)["']/);
        if (roleMatch && CRUD_NAMES.has(roleMatch[1])) {
          detectedRoles.add(roleMatch[1]);
        }
      }
    }
  }

  if (!foundEntity) return allTrue;

  return {
    hasList: detectedRoles.has("list"),
    hasGet: detectedRoles.has("get"),
    hasCreate: detectedRoles.has("create"),
    hasUpdate: detectedRoles.has("update"),
    hasDelete: detectedRoles.has("delete"),
    hasTree: detectedRoles.has("tree"),
  };
}

// ── Module dependency injection ──

interface PkgJson {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  [key: string]: unknown;
}

/**
 * Ensure the module's package.json has the required dependencies
 * for scaffold-generated files to compile.
 */
async function ensureModuleDeps(
  moduleDir: string,
  domainPackageName: string | null,
): Promise<string[]> {
  const pkgPath = join(moduleDir, "package.json");
  if (!(await pathExists(pkgPath))) return [];

  const pkg = await readJsonFile<PkgJson>(pkgPath);
  const deps = pkg.dependencies ?? {};
  const devDeps = pkg.devDependencies ?? {};
  const added: string[] = [];

  // @simplix-react/ui
  if (!deps["@simplix-react/ui"]) {
    deps["@simplix-react/ui"] = "workspace:*";
    added.push(`@simplix-react/ui@workspace:*`);
  }

  // @simplix-react/i18n
  if (!deps["@simplix-react/i18n"]) {
    deps["@simplix-react/i18n"] = "workspace:*";
    added.push(`@simplix-react/i18n@workspace:*`);
  }

  // Domain package (workspace:*)
  if (domainPackageName && !deps[domainPackageName]) {
    deps[domainPackageName] = "workspace:*";
    added.push(`${domainPackageName}@workspace:*`);
  }

  // @types/react
  if (!devDeps["@types/react"]) {
    devDeps["@types/react"] = depVersion("@types/react");
    added.push(`@types/react@${devDeps["@types/react"]} (dev)`);
  }

  if (added.length > 0) {
    pkg.dependencies = deps;
    pkg.devDependencies = devDeps;
    await writeFile(pkgPath, JSON.stringify(pkg, null, 2) + "\n", "utf-8");
  }

  return added;
}

/**
 * Update the parent widgets/index.ts to include re-exports from a newly
 * scaffolded entity widget folder.
 */
async function updateWidgetsIndex(
  moduleDir: string,
  entityKebab: string,
  ctx: { EntityPascal: string; hasList: boolean; hasForm: boolean; hasDetail: boolean; hasTree?: boolean },
): Promise<void> {
  const widgetsIndexPath = join(moduleDir, "src", "widgets", "index.ts");
  if (!(await pathExists(widgetsIndexPath))) {
    await writeFileWithDir(widgetsIndexPath, "");
  }

  let content = await readFile(widgetsIndexPath, "utf-8");

  // Already has exports for this entity → skip
  if (content.includes(`./${entityKebab}"`)) return;

  // Build export lines
  const lines: string[] = [];
  if (ctx.hasTree) {
    lines.push(`export { ${ctx.EntityPascal}Tree, use${ctx.EntityPascal}Tree } from "./${entityKebab}";`);
  } else if (ctx.hasList) {
    lines.push(`export { ${ctx.EntityPascal}List, ${ctx.EntityPascal}ListToolbar, use${ctx.EntityPascal}List } from "./${entityKebab}";`);
  }
  if (ctx.hasForm) {
    lines.push(`export { ${ctx.EntityPascal}Form } from "./${entityKebab}";`);
    lines.push(`export type { ${ctx.EntityPascal}FormValues } from "./${entityKebab}";`);
  }
  if (ctx.hasDetail) {
    lines.push(`export { ${ctx.EntityPascal}Detail } from "./${entityKebab}";`);
  }
  if (lines.length === 0) return;

  // Remove placeholder "export {};" if present
  content = content.replace(/^export \{\};\s*$/m, "");

  // Append new exports
  const trimmed = content.trimEnd();
  const newContent = trimmed + (trimmed.length > 0 ? "\n" : "") + lines.join("\n") + "\n";
  await writeFile(widgetsIndexPath, newContent, "utf-8");
  log.info(`Updated widgets/index.ts with ${ctx.EntityPascal} exports`);
}

// ── Pages generation ──

async function generatePages(
  moduleDir: string,
  entityKebab: string,
  ctx: Record<string, unknown>,
): Promise<string[]> {
  const pagesDir = join(moduleDir, "src", "pages", entityKebab);
  const generated: string[] = [];

  const pageFiles: Record<string, string> = {};

  // CrudPage (list/tree + detail + new + edit in one component)
  if (ctx.hasTree && ctx.hasDetail) {
    pageFiles["crud-page.tsx"] = renderTemplate(treeCrudPageTemplate, ctx);
  } else if (ctx.hasList && ctx.hasDetail) {
    pageFiles["crud-page.tsx"] = renderTemplate(crudPageTemplate, ctx);
  } else if (!ctx.hasList && !ctx.hasTree && ctx.hasCreate) {
    // Hub page for creation-only entities (no list operation)
    pageFiles["list-page.tsx"] = renderTemplate(hubPageTemplate, ctx);
  }

  // Index barrel
  pageFiles["index.ts"] = renderTemplate(pageIndexTemplate, ctx);

  for (const [fileName, content] of Object.entries(pageFiles)) {
    const filePath = join(pagesDir, fileName);
    if (await pathExists(filePath)) {
      log.warn(`Skipping pages/${entityKebab}/${fileName} — file already exists`);
      continue;
    }
    await writeFileWithDir(filePath, content);
    generated.push(fileName);
  }

  return generated;
}

async function updatePagesIndex(
  moduleDir: string,
  entityKebab: string,
  ctx: Record<string, unknown>,
): Promise<void> {
  const pagesIndexPath = join(moduleDir, "src", "pages", "index.ts");

  // pages/index.ts가 없으면 생성 (locale side-effect 포함)
  if (!(await pathExists(pagesIndexPath))) {
    await writeFileWithDir(
      pagesIndexPath,
      '// Side-effect: register module translations\nimport "../locales";\n',
    );
  }

  let content = await readFile(pagesIndexPath, "utf-8");
  if (content.includes(`./${entityKebab}"`)) return;

  // Build export lines
  const exports: string[] = [];
  if ((ctx.hasList || ctx.hasTree) && ctx.hasDetail) {
    exports.push(`${ctx.EntityPascal}CrudPage`);
  } else if (!ctx.hasList && !ctx.hasTree && ctx.hasCreate) {
    exports.push(`${ctx.EntityPascal}ListPage`);
  }
  if (exports.length === 0) return;

  const line = `export { ${exports.join(", ")} } from "./${entityKebab}";`;
  content = content.replace(/^export \{\};\s*$/m, "");
  const trimmed = content.trimEnd();
  await writeFile(pagesIndexPath, trimmed + (trimmed.length > 0 ? "\n" : "") + line + "\n", "utf-8");
  log.info("Updated pages/index.ts");
}

async function updateModuleIndex(moduleDir: string): Promise<void> {
  const indexPath = join(moduleDir, "src", "index.ts");
  if (!(await pathExists(indexPath))) return;

  const content = await readFile(indexPath, "utf-8");
  if (content.includes('"./pages"')) return;

  await writeFile(indexPath, content.trimEnd() + '\nexport * from "./pages";\n', "utf-8");
  log.info("Updated src/index.ts with pages export");
}

async function updateLocalesIndex(
  moduleDir: string,
  locales: string[],
): Promise<void> {
  const localesIndexPath = join(moduleDir, "src", "locales", "index.ts");
  if (!(await pathExists(localesIndexPath))) return;

  let content = await readFile(localesIndexPath, "utf-8");

  // widgets mapping already exists → skip (check both quoted and unquoted key forms)
  if (/\bwidgets\s*[:{]/.test(content)) return;

  // Build lazy import lines for each locale
  const importLines = locales.map(
    (l) => `      ${l}: () => import("./widgets/${l}.json"),`,
  ).join("\n");
  const widgetsEntry = `    widgets: {\n${importLines}\n    },`;

  // Find `components: {` and insert widgets entry using brace-counting
  const componentsMatch = content.match(/components:\s*\{/);
  if (!componentsMatch || componentsMatch.index == null) return;

  const openBrace = content.indexOf("{", componentsMatch.index + "components".length);
  if (openBrace === -1) return;

  // Find matching closing brace using depth counting
  let depth = 1;
  let i = openBrace + 1;
  while (i < content.length && depth > 0) {
    if (content[i] === "{") depth++;
    else if (content[i] === "}") depth--;
    i++;
  }
  const closeBrace = i - 1;

  // Insert widgets entry before the closing brace of `components`
  const innerContent = content.slice(openBrace + 1, closeBrace);
  const newInner = innerContent.trimEnd() + "\n" + widgetsEntry + "\n  ";
  content = content.slice(0, openBrace + 1) + newInner + content.slice(closeBrace);

  await writeFile(localesIndexPath, content, "utf-8");
  log.info("Updated locales/index.ts with widgets component");
}

async function updateLocaleJsons(
  moduleDir: string,
  entityName: string,
  EntityPascal: string,
  locales: string[],
  ops: EntityOperations,
  hasTree = false,
): Promise<void> {
  for (const locale of locales) {
    const jsonPath = join(moduleDir, "src", "locales", "widgets", `${locale}.json`);
    if (!(await pathExists(jsonPath))) continue;

    const raw = await readFile(jsonPath, "utf-8");
    const json = JSON.parse(raw || "{}") as Record<string, Record<string, string>>;

    // Entity key already exists → skip
    if (json[entityName]) continue;

    // Add common keys if missing
    if (!json.common) {
      json.common = {
        close: "Close", edit: "Edit", delete: "Delete",
        deleting: "Deleting...", cancel: "Cancel", back: "\u2190 Back",
        noResults: "No results", rows: "Rows:",
        range: "{{start}}-{{end}} of {{total}}",
        noData: "No data available.",
        noFilter: "No items match the selected filters.",
        noSearch: "No items match the search query.",
      };
    }

    // Entity-specific default keys
    const entityPlural = `${entityName}s`;
    const EntityPluralPascal = `${EntityPascal}s`;
    const entityKeys: Record<string, string> = {};
    if (!ops.hasList && !hasTree) {
      entityKeys.title = EntityPluralPascal;
      entityKeys.description = `Create or manage ${entityPlural}.`;
    } else {
      entityKeys[entityPlural] = EntityPluralPascal;
      entityKeys[`${entityPlural}Description`] = `Create or manage ${entityPlural}.`;
      entityKeys.searchPlaceholder = `Search ${entityName}...`;
      entityKeys.view = "View";
      entityKeys.edit = "Edit";
      entityKeys.delete = "Delete";
      entityKeys.back = "\u2190 Back";
    }
    if (hasTree) {
      entityKeys.sectionTitle = `${EntityPascal} Information`;
    }
    if (ops.hasCreate) entityKeys[`new${EntityPascal}`] = `New ${EntityPascal}`;
    if (ops.hasCreate || ops.hasUpdate) entityKeys[`save${EntityPascal}`] = `Save ${EntityPascal}`;
    if (ops.hasUpdate) entityKeys[`edit${EntityPascal}`] = `Edit ${EntityPascal}`;
    if (ops.hasDelete) {
      entityKeys[`delete${EntityPascal}Title`] = `Delete ${EntityPascal}`;
      entityKeys[`delete${EntityPascal}Desc`] = `Are you sure you want to delete "{{name}}"? This action cannot be undone.`;
      entityKeys[`delete${EntityPascal}DescSimple`] = `Are you sure you want to delete this ${entityName}? This action cannot be undone.`;
    }
    if (ops.hasGet) {
      entityKeys[`${entityName}Detail`] = `${EntityPascal} Detail`;
      entityKeys.notFound = `${EntityPascal} not found.`;
      entityKeys.detailHeader = `detail: {{id}}`;
    }
    if (ops.hasCreate) entityKeys.newHeader = "new";
    if (ops.hasUpdate) entityKeys.editHeader = `edit: {{id}}`;
    entityKeys.cancel = "Cancel";

    json[entityName] = entityKeys;
    await writeFile(jsonPath, JSON.stringify(json, null, 2) + "\n", "utf-8");
  }
  log.info("Updated locale JSON files with entity translations");
}

async function ensureTsupPagesEntry(moduleDir: string): Promise<void> {
  const tsupPath = join(moduleDir, "tsup.config.ts");
  if (!(await pathExists(tsupPath))) return;

  let content = await readFile(tsupPath, "utf-8");
  if (content.includes('"pages/index"')) return;

  content = content.replace(
    '"widgets/index": "src/widgets/index.ts"',
    '"widgets/index": "src/widgets/index.ts",\n    "pages/index": "src/pages/index.ts"',
  );
  await writeFile(tsupPath, content, "utf-8");
  log.info("Updated tsup.config.ts with pages entry");
}

async function ensurePackageJsonPagesExport(moduleDir: string): Promise<void> {
  const pkgPath = join(moduleDir, "package.json");
  if (!(await pathExists(pkgPath))) return;

  const pkg = await readJsonFile<Record<string, unknown>>(pkgPath);
  const exports = (pkg.exports ?? {}) as Record<string, unknown>;
  if (exports["./pages"]) return;

  exports["./pages"] = {
    types: "./dist/pages/index.d.ts",
    import: "./dist/pages/index.js",
  };
  pkg.exports = exports;
  await writeFile(pkgPath, JSON.stringify(pkg, null, 2) + "\n", "utf-8");
  log.info("Updated package.json with pages export");
}

async function resolveModuleNamespace(moduleDir: string): Promise<string> {
  const pkgPath = join(moduleDir, "package.json");
  if (!(await pathExists(pkgPath))) return "unknown";
  const pkg = await readJsonFile<{ name: string }>(pkgPath);
  // "@sample-petstore/sample-petstore-petstore" → "sample-petstore-petstore"
  return pkg.name.replace(/^@[^/]+\//, "");
}

/**
 * Parse the Orval-generated mutation function to find path parameter names.
 * Searches for `const { ...fields } = props` in the mutation options function
 * and returns the first field that isn't "data" or "params".
 *
 * @example
 * - `const { data } = props` → returns null (body-only mutation)
 * - `const { petId } = props` → returns "petId" (path-param-only mutation)
 * - `const { username, data } = props` → returns "username" (path-param + body)
 */
async function findMutationPathParam(
  rootDir: string,
  operationId: string,
): Promise<string | null> {
  const capitalizedOp = operationId.charAt(0).toUpperCase() + operationId.slice(1);
  const mutOptsFn = `get${capitalizedOp}MutationOptions`;

  // Search all packages for the generated mutation
  const packagesDir = join(rootDir, "packages");
  if (!(await pathExists(packagesDir))) return null;

  const packages = await readdir(packagesDir, { withFileTypes: true });
  for (const pkg of packages) {
    if (!pkg.isDirectory()) continue;
    const endpointsDir = join(packagesDir, pkg.name, "src", "generated", "endpoints");
    if (!(await pathExists(endpointsDir))) continue;

    const entries = await readdir(endpointsDir, { withFileTypes: true, recursive: true });
    for (const entry of entries) {
      if (!entry.isFile() || !entry.name.endsWith(".ts")) continue;
      if (entry.name.endsWith(".msw.ts") || entry.name.endsWith(".zod.ts")) continue;

      const filePath = join(entry.parentPath ?? endpointsDir, entry.name);
      const content = await readFile(filePath, "utf-8");
      if (!content.includes(mutOptsFn)) continue;

      const idx = content.indexOf(mutOptsFn);
      const slice = content.slice(idx, idx + 2000);
      const match = slice.match(/const\s*\{\s*([^}]+)\}\s*=\s*props/);
      if (!match) continue;

      const fields = match[1]
        .split(",")
        .map((f) => f.trim().split(":")[0].trim())
        .filter((f) => f !== "data" && f !== "params");

      return fields.length > 0 ? fields[0] : null;
    }
  }

  return null;
}

// ── Snapshot-based entity lookup ──

async function findEntityFromSnapshot(
  rootDir: string,
  entityName: string,
): Promise<ExtractedEntity | null> {
  const packagesDir = join(rootDir, "packages");
  if (!(await pathExists(packagesDir))) return null;

  const entries = await readdir(packagesDir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const snapshotPath = join(packagesDir, entry.name, ".openapi-snapshot.json");
    if (!(await pathExists(snapshotPath))) continue;

    const snapshot = await readJsonFile<OpenAPISnapshot>(snapshotPath);
    const entity = snapshot.entities?.find((e) => e.name === entityName);
    if (entity) return entity;
  }
  return null;
}

// ── Filter parameter analysis ──

export interface FilterFieldInfo {
  /** Filter key used in CrudList.filters.values, e.g. "name.contains" */
  filterKey: string;
  /** Component to use: TextFilter, NumberFilter, etc. */
  component: string;
  /** Display label for the filter */
  label: string;
  /** Base field name (e.g. "name", "status") */
  field: string;
  /** Operator suffix (e.g. "contains", "equals") */
  operator: string;
  /** For FacetedFilter: enum options */
  options?: string[];
  /** For DateRangeFilter: the paired gte/lte keys */
  pairedKey?: string;
  /** Value type for type-safe casting */
  valueType: "string" | "number" | "boolean" | "date" | "dateRange" | "array";
  /** All available text operators for this field (used by UnifiedTextFilter grouping) */
  textOperators?: string[];
}

/** Text filter field info for UnifiedTextFilter grouping */
export interface TextFilterFieldInfo {
  field: string;
  operators: string[];
  defaultOperator: string;
}

// Operator suffixes that are valid for text search
const TEXT_OPERATOR_SUFFIXES = ["contains", "notContains", "equals", "notEquals", "startsWith", "endsWith"];

// Map operator suffix to SearchOperator enum key
const SUFFIX_TO_ENUM_KEY: Record<string, string> = {
  contains: "CONTAINS",
  notContains: "NOT_CONTAINS",
  equals: "EQUALS",
  notEquals: "NOT_EQUALS",
  startsWith: "STARTS_WITH",
  endsWith: "ENDS_WITH",
  greaterThan: "GREATER_THAN",
  lessThan: "LESS_THAN",
  greaterThanOrEqualTo: "GREATER_THAN_OR_EQUAL",
  lessThanOrEqualTo: "LESS_THAN_OR_EQUAL",
  in: "IN",
};

// System params to exclude from filter generation
const SYSTEM_PARAMS = new Set(["ids", "page", "size", "sort"]);
// Audit field prefixes to exclude by default
const AUDIT_PREFIXES = ["createdBy.", "updatedBy.", "deletedTimestamp."];

export function parseFilterParams(
  queryParams: QueryParam[],
  entityFields: EntityField[],
): FilterFieldInfo[] {
  const result: FilterFieldInfo[] = [];
  const fieldMap = new Map(entityFields.map((f) => [f.name, f]));
  const processed = new Set<string>();

  // Pre-process: group params by base field
  const paramsByField = new Map<string, QueryParam[]>();
  for (const qp of queryParams) {
    // Skip system params
    if (SYSTEM_PARAMS.has(qp.name)) continue;
    // Skip id sub-params
    if (qp.name.startsWith("id.")) continue;
    // Skip audit fields
    if (AUDIT_PREFIXES.some((prefix) => qp.name.startsWith(prefix))) continue;

    const dotIdx = qp.name.indexOf(".");
    const baseField = dotIdx > 0 ? qp.name.slice(0, dotIdx) : qp.name;
    const existing = paramsByField.get(baseField) ?? [];
    existing.push(qp);
    paramsByField.set(baseField, existing);
  }

  for (const [baseField, params] of paramsByField) {
    if (processed.has(baseField)) continue;
    processed.add(baseField);

    const entityField = fieldMap.get(baseField);
    const operatorNames = params.map((p) => {
      const dot = p.name.indexOf(".");
      return dot > 0 ? p.name.slice(dot + 1) : "";
    });

    // Capitalize first letter for label
    const label = baseField.charAt(0).toUpperCase() + baseField.slice(1);

    // Rule 1: Boolean field
    if (entityField?.type === "boolean") {
      const equalsParam = params.find((p) => p.name.endsWith(".equals"));
      if (equalsParam) {
        result.push({
          filterKey: equalsParam.name,
          component: "ToggleFilter",
          label,
          field: baseField,
          operator: "equals",
          valueType: "boolean",
        });
      }
      continue;
    }

    // Rule 2a: Country field with .in → CountryFilter
    const isCountryField = /(?:country|countryCode)$/i.test(baseField);
    const inParam = params.find((p) => p.name.endsWith(".in"));
    if (isCountryField && inParam) {
      result.push({
        filterKey: inParam.name,
        component: "CountryFilter",
        label,
        field: baseField,
        operator: "in",
        valueType: "array",
      });
      continue;
    }

    // Rule 2b: Timezone field with .in or .contains → TimezoneFilter
    const isTimezoneField = /(?:timezone|timeZone)$/i.test(baseField);
    if (isTimezoneField && (inParam || params.find((p) => p.name.endsWith(".contains")))) {
      const tzParam = inParam ?? params.find((p) => p.name.endsWith(".contains"))!;
      result.push({
        filterKey: tzParam.name,
        component: "TimezoneFilter",
        label,
        field: baseField,
        operator: inParam ? "in" : "contains",
        valueType: inParam ? "array" : "string",
      });
      continue;
    }

    // Rule 2c: Has .in operator → FacetedFilter
    if (inParam) {
      result.push({
        filterKey: inParam.name,
        component: "FacetedFilter",
        label,
        field: baseField,
        operator: "in",
        options: entityField?.enum,
        valueType: "array",
      });
      continue;
    }

    // Rule 3: Date field with gte+lte pair → DateRangeFilter
    const isDateField =
      entityField?.format === "date-time" ||
      baseField.endsWith("At") ||
      baseField.endsWith("Date") ||
      baseField.endsWith("Time");
    const hasGte = operatorNames.includes("greaterThanOrEqualTo");
    const hasLte = operatorNames.includes("lessThanOrEqualTo");
    if (isDateField && hasGte && hasLte) {
      const gteParam = params.find((p) => p.name.endsWith(".greaterThanOrEqualTo"));
      const lteParam = params.find((p) => p.name.endsWith(".lessThanOrEqualTo"));
      if (gteParam && lteParam) {
        result.push({
          filterKey: gteParam.name,
          component: "DateRangeFilter",
          label,
          field: baseField,
          operator: "greaterThanOrEqualTo",
          pairedKey: lteParam.name,
          valueType: "dateRange",
        });
      }
      continue;
    }

    // Rule 4: Number field with comparison operators → NumberFilter
    const isNumericField =
      entityField?.type === "number" ||
      entityField?.type === "integer" ||
      entityField?.format === "int32" ||
      entityField?.format === "int64" ||
      entityField?.format === "double" ||
      entityField?.format === "float";
    const hasComparison = operatorNames.some((op) =>
      ["greaterThan", "lessThan", "greaterThanOrEqualTo", "lessThanOrEqualTo"].includes(op),
    );
    if (isNumericField && hasComparison) {
      const firstParam = params.find((p) =>
        p.name.endsWith(".greaterThanOrEqualTo") || p.name.endsWith(".equals"),
      ) ?? params[0];
      result.push({
        filterKey: firstParam.name,
        component: "NumberFilter",
        label,
        field: baseField,
        operator: firstParam.name.slice(firstParam.name.indexOf(".") + 1),
        valueType: "number",
      });
      continue;
    }

    // Rule 5: Has .contains → TextFilter with .contains
    const containsParam = params.find((p) => p.name.endsWith(".contains"));
    if (containsParam) {
      // Collect all text-applicable operators for this field
      const textOps = operatorNames
        .filter((op) => TEXT_OPERATOR_SUFFIXES.includes(op))
        .sort((a, b) => TEXT_OPERATOR_SUFFIXES.indexOf(a) - TEXT_OPERATOR_SUFFIXES.indexOf(b));
      result.push({
        filterKey: containsParam.name,
        component: "TextFilter",
        label,
        field: baseField,
        operator: "contains",
        valueType: "string",
        textOperators: textOps.length > 0 ? textOps : ["contains"],
      });
      continue;
    }

    // Rule 6: .equals + entity has enum → FacetedFilter
    const equalsParam = params.find((p) => p.name.endsWith(".equals"));
    if (equalsParam && entityField?.enum) {
      result.push({
        filterKey: equalsParam.name,
        component: "FacetedFilter",
        label,
        field: baseField,
        operator: "equals",
        options: entityField.enum,
        valueType: "string",
      });
      continue;
    }

    // Rule 7: .equals only → TextFilter
    if (equalsParam) {
      // Collect all text-applicable operators for this field
      const textOps = operatorNames
        .filter((op) => TEXT_OPERATOR_SUFFIXES.includes(op))
        .sort((a, b) => TEXT_OPERATOR_SUFFIXES.indexOf(a) - TEXT_OPERATOR_SUFFIXES.indexOf(b));
      result.push({
        filterKey: equalsParam.name,
        component: "TextFilter",
        label,
        field: baseField,
        operator: "equals",
        valueType: "string",
        textOperators: textOps.length > 0 ? textOps : ["equals"],
      });
      continue;
    }
  }

  return result;
}

const PLACEHOLDER_FIELDS: FieldInfo[] = [
  {
    name: "id",
    capitalizedName: "Id",
    label: "ID",
    tsType: "string",
    formComponent: "TextField",
    inputType: "text",
    component: "Text",
    options: [],
    defaultValue: '""',
  },
  {
    name: "name",
    capitalizedName: "Name",
    label: "Name",
    tsType: "string",
    formComponent: "TextField",
    inputType: "text",
    component: "Text",
    options: [],
    defaultValue: '""',
  },
];

export const scaffoldCrudCommand = new Command("scaffold")
  .description("Generate CRUD widgets into an FSD module's widgets/ layer")
  .argument("<entity>", "Entity name (e.g., product, user)")
  .option(
    "--module <dir>",
    "Target FSD module directory (relative to modules/)",
  )
  .option(
    "--output <dir>",
    "Custom output directory (overrides --module, relative to cwd)",
  )
  .action(async (entity: string, options: { module?: string; output?: string }) => {
    const rootDir = resolve(process.cwd());
    const entityKebab = toKebabCase(entity);
    const EntityPascal = toPascalCase(entity);

    // Resolve output directory
    let outputDir: string;
    let relativeOutput: string;
    let moduleDir: string | null = null;

    if (options.output) {
      // Explicit output overrides everything
      outputDir = resolve(rootDir, options.output);
      relativeOutput = options.output;
    } else if (options.module) {
      // FSD module specified → features/<entity>/
      moduleDir = resolve(rootDir, "modules", options.module);
      outputDir = resolve(moduleDir, "src", "widgets", entityKebab);
      relativeOutput = join("modules", options.module, "src", "widgets", entityKebab);
    } else {
      // Auto-detect: find available modules
      const moduleDirs = await findModuleDirs(rootDir);
      if (moduleDirs.length === 1) {
        // Single module → use it
        moduleDir = resolve(rootDir, "modules", moduleDirs[0]);
        outputDir = resolve(moduleDir, "src", "widgets", entityKebab);
        relativeOutput = join("modules", moduleDirs[0], "src", "widgets", entityKebab);
        log.info(`Auto-detected module: ${moduleDirs[0]}`);
      } else if (moduleDirs.length > 1) {
        log.error("Multiple modules found. Specify --module <dir>:");
        for (const dir of moduleDirs) {
          log.step(dir);
        }
        process.exit(1);
        return;
      } else {
        log.error(
          "No modules/ directory found. Create a module first:\n" +
          "  simplix add-module <name>",
        );
        process.exit(1);
        return;
      }
    }

    const spinner = ora(`Searching for ${entity} schema...`).start();

    try {
      const schemaResult = await findSchemaFile(rootDir, entity);

      let fields: FieldInfo[];
      let packageName: string | null = null;
      if (schemaResult) {
        spinner.text = `Found schema at ${schemaResult.path}`;
        fields = parseSchemaFields(schemaResult.content, entity);
        packageName = schemaResult.packageName;

        if (fields.length === 0) {
          log.warn(
            "Could not parse fields from schema. Generating with placeholder fields.",
          );
          fields = PLACEHOLDER_FIELDS;
        }
      } else {
        spinner.text = "No schema found, generating with placeholder fields...";
        fields = PLACEHOLDER_FIELDS;
      }

      const ops = await parseEntityOperations(rootDir, entity);

      // Resolve actual hook names from crud.config.ts
      const crudConfig = await findCrudConfigForEntity(rootDir, entity);
      const toHookName = (opId: string) =>
        `use${opId.charAt(0).toUpperCase()}${opId.slice(1)}`;
      const hookList = crudConfig?.list ? toHookName(crudConfig.list) : null;
      const hookGet = crudConfig?.get ? toHookName(crudConfig.get) : null;
      const hookGetForEdit = crudConfig?.getForEdit ? toHookName(crudConfig.getForEdit) : null;
      const hookCreate = crudConfig?.create
        ? toHookName(crudConfig.create)
        : null;
      const hookUpdate = crudConfig?.update
        ? toHookName(crudConfig.update)
        : null;
      const hookDelete = crudConfig?.delete
        ? toHookName(crudConfig.delete)
        : null;
      const hookOrder = crudConfig?.order
        ? toHookName(crudConfig.order as string)
        : null;
      const hookTree = crudConfig?.tree
        ? toHookName(crudConfig.tree)
        : null;

      const fieldNameList = fields.map((f) => f.name).join(", ");
      const hasEnumFields = fields.some((f) => f.component === "Select");
      const hasDateFields = fields.some((f) => f.component === "Date");

      // Detect path param names for update/delete mutations (Orval-specific)
      const updatePathParam = crudConfig?.update
        ? await findMutationPathParam(rootDir, crudConfig.update)
        : null;
      const deletePathParam = crudConfig?.delete
        ? await findMutationPathParam(rootDir, crudConfig.delete)
        : `${entity}Id`;

      // Parse filter params from OpenAPI snapshot
      const extractedEntity = await findEntityFromSnapshot(rootDir, entity);

      // Resolve row ID field from the entity's get operation path param.
      // e.g. "/sites/:id" → "id", "/users/:username" → "username"
      const getOp = extractedEntity?.operations.find((o) => o.role === "get");
      const pathParamMatch = getOp?.path.match(/:(\w+)(?:\/|$)/);
      const rowIdField = pathParamMatch?.[1] ?? "id";
      const filterFields = extractedEntity
        ? parseFilterParams(extractedEntity.queryParams, extractedEntity.fields)
        : [];

      // Detect orderField from the order operation's bodySchema in the snapshot
      let orderField: string | null = null;
      if (hookOrder && extractedEntity) {
        const orderOp = extractedEntity.operations.find(
          (o) => o.role === "order",
        );
        // bodySchema is { type: "array", items: { properties: { id, displayOrder } } }
        const itemProps = orderOp?.bodySchema?.items?.properties;
        if (itemProps) {
          const nonIdField = Object.keys(itemProps).find(
            (k) => k !== "id" && k !== rowIdField,
          );
          orderField = nonIdField ?? null;
        }
      }

      // Separate text filters for UnifiedTextFilter grouping (legacy Toolbar)
      const textFilters = filterFields.filter((f) => f.component === "TextFilter");
      const nonTextFilters = filterFields.filter((f) => f.component !== "TextFilter");

      // Build UnifiedTextFilter field definitions (legacy Toolbar)
      const textFilterFields: TextFilterFieldInfo[] = textFilters.map((f) => {
        const ops = (f.textOperators ?? [f.operator]).map((op) => SUFFIX_TO_ENUM_KEY[op] ?? op);
        const defaultOp = SUFFIX_TO_ENUM_KEY[f.operator] ?? f.operator;
        return { field: f.field, operators: ops, defaultOperator: defaultOp };
      });

      // Build unified FilterBar definitions
      interface FilterBarDefItem {
        type: string;
        field: string;
        operators?: string[];
        defaultOperator?: string;
        options?: string[];
        isText?: boolean;
        isNumber?: boolean;
        isFaceted?: boolean;
        isToggle?: boolean;
        isDateRange?: boolean;
        isCountry?: boolean;
        isTimezone?: boolean;
      }

      const filterBarDefs: FilterBarDefItem[] = [];
      for (const f of filterFields) {
        switch (f.component) {
          case "TextFilter": {
            const ops = (f.textOperators ?? [f.operator]).map((op) => SUFFIX_TO_ENUM_KEY[op] ?? op);
            const defaultOp = SUFFIX_TO_ENUM_KEY[f.operator] ?? f.operator;
            filterBarDefs.push({ type: "text", field: f.field, operators: ops, defaultOperator: defaultOp, isText: true });
            break;
          }
          case "NumberFilter": {
            const op = SUFFIX_TO_ENUM_KEY[f.operator] ?? "GREATER_THAN_OR_EQUAL";
            filterBarDefs.push({ type: "number", field: f.field, operators: [op], defaultOperator: op, isNumber: true });
            break;
          }
          case "FacetedFilter":
            filterBarDefs.push({ type: "faceted", field: f.field, options: f.options, isFaceted: true });
            break;
          case "ToggleFilter":
            filterBarDefs.push({ type: "toggle", field: f.field, isToggle: true });
            break;
          case "DateRangeFilter":
            filterBarDefs.push({ type: "dateRange", field: f.field, isDateRange: true });
            break;
          case "CountryFilter":
            filterBarDefs.push({ type: "country", field: f.field, isCountry: true });
            break;
          case "TimezoneFilter":
            filterBarDefs.push({ type: "timezone", field: f.field, isTimezone: true });
            break;
        }
      }

      // ── Tree entity detection ──
      const hasTree = ops.hasTree || !!hookTree;

      let treeParentIdField: string | null = null;
      let treeSortOrderField: string | null = null;
      let treeDisplayNameField: string | null = null;
      let treeSearchFields: string[] = [];
      let treeDisplayFields: FieldInfo[] = [];

      if (hasTree) {
        // Detect parentId field
        treeParentIdField = fields.find((f) => f.name === "parentId")?.name
          ?? fields.find((f) => f.name.toLowerCase().includes("parent") && f.name.toLowerCase().endsWith("id"))?.name
          ?? "parentId";

        // Detect sort order field
        treeSortOrderField = orderField
          ?? fields.find((f) => ["sortOrder", "displayOrder", "orderIndex"].includes(f.name))?.name
          ?? "sortOrder";

        // Display name field: prefer common name fields, then fall back to first string field
        const commonNameFields = ["name", "title", "label", "displayName"];
        treeDisplayNameField = fields.find((f) =>
          commonNameFields.includes(f.name) && f.tsType === "string",
        )?.name
          ?? fields.find((f) =>
            f.tsType === "string" && f.name !== rowIdField && f.name !== treeParentIdField,
          )?.name
          ?? "name";

        // Search fields: string fields excluding id and parentId
        treeSearchFields = fields
          .filter((f) => f.tsType === "string" && f.name !== rowIdField && f.name !== treeParentIdField)
          .map((f) => f.name);

        // Display fields: fields for tree columns (exclude id, parentId, sortOrder)
        // Put the display name field first for tree column ordering
        const filteredFields = fields.filter((f) =>
          f.name !== rowIdField &&
          f.name !== treeParentIdField &&
          f.name !== treeSortOrderField,
        );
        const displayNameIdx = filteredFields.findIndex((f) => f.name === treeDisplayNameField);
        if (displayNameIdx > 0) {
          const [nameField] = filteredFields.splice(displayNameIdx, 1);
          filteredFields.unshift(nameField);
        }
        treeDisplayFields = filteredFields;
      }

      const hasTreeReorder = hasTree && !!hookUpdate && !!treeSortOrderField;
      const hasTreeMove = hasTree && !!hookUpdate && !!treeParentIdField;
      const updateMutationKey = updatePathParam ?? rowIdField;

      const entityPlural = `${entity}s`;
      const ctx = {
        EntityPascal,
        entityKebab,
        entity,
        entityPlural,
        fields,
        packageName,
        hookList,
        hookGet,
        hookGetForEdit,
        hookCreate,
        hookUpdate,
        hookDelete,
        hookOrder,
        hookTree,
        orderField,
        updatePathParam,
        updateMutationKey,
        deletePathParam,
        entityPath: extractedEntity?.path ?? `/api/v1/${entity}`,
        fieldNameList,
        rowIdField,
        hasList: ops.hasList,
        hasForm: ops.hasCreate || ops.hasUpdate,
        hasDetail: ops.hasGet,
        hasCreate: ops.hasCreate,
        hasUpdate: ops.hasUpdate,
        hasDelete: ops.hasDelete,
        hasTree,
        hasTreeReorder,
        hasTreeMove,
        treeParentIdField,
        treeSortOrderField,
        treeDisplayNameField,
        treeSearchFields,
        treeDisplayFields,
        hasEnumFields,
        hasDateFields,
        filters: nonTextFilters,
        hasFilters: filterFields.length > 0,
        filterBarDefs,
        textFilterFields,
        hasTextFilters: textFilterFields.length > 0,
        firstTextField: textFilterFields[0]?.field ?? "",
        firstTextDefaultOp: textFilterFields[0]?.defaultOperator ?? "CONTAINS",
      };

      // Resolve module namespace early (needed by tree/form templates)
      const moduleNamespace = moduleDir ? await resolveModuleNamespace(moduleDir) : entity;
      const hasListDetail = (hasTree || ctx.hasList) && ctx.hasDetail;
      const moduleName = moduleDir ? path.basename(moduleDir) : entity;
      const fullCtx = { ...ctx, moduleNamespace, moduleName, entityIcon: "FileTextIcon", hasListDetail };

      const files: Record<string, string> = {};
      if (hasTree) {
        files["tree.tsx"] = renderTemplate(treeTemplate, fullCtx);
      } else if (ops.hasList) {
        files["list.tsx"] = renderTemplate(listTemplate, fullCtx);
      }
      if (ops.hasCreate || ops.hasUpdate) {
        files["form.tsx"] = renderTemplate(formTemplate, fullCtx);
      }
      if (ops.hasGet) {
        files["detail.tsx"] = renderTemplate(detailTemplate, fullCtx);
      }
      files["index.ts"] = renderTemplate(featureIndexTemplate, fullCtx);

      spinner.text = "Generating CRUD widgets...";

      for (const [fileName, content] of Object.entries(files)) {
        const filePath = join(outputDir, fileName);
        if (await pathExists(filePath)) {
          log.warn(`Skipping ${fileName} — file already exists`);
          continue;
        }
        await writeFileWithDir(filePath, content);
      }

      // Auto-add required dependencies to module package.json
      if (moduleDir) {
        const addedDeps = await ensureModuleDeps(moduleDir, packageName);
        if (addedDeps.length > 0) {
          log.info("Added dependencies:");
          for (const dep of addedDeps) {
            log.step(dep);
          }
        }

        // Auto-update widgets/index.ts with entity exports
        await updateWidgetsIndex(moduleDir, entityKebab, fullCtx);

        // Pages generation
        const config = await loadConfig(rootDir);
        const locales = config.i18n?.locales ?? ["en", "ko", "ja"];

        const pageFiles = await generatePages(moduleDir, entityKebab, fullCtx);
        if (pageFiles.length > 0) {
          log.info(`Generated ${pageFiles.length} page files`);
        }

        // Module-level updates
        await updatePagesIndex(moduleDir, entityKebab, fullCtx);
        await updateModuleIndex(moduleDir);
        await updateLocalesIndex(moduleDir, locales);
        await updateLocaleJsons(moduleDir, entity, EntityPascal, locales, ops, hasTree);
        await ensureTsupPagesEntry(moduleDir);
        await ensurePackageJsonPagesExport(moduleDir);
      }

      spinner.succeed(`CRUD widgets + pages generated for ${EntityPascal}`);

      const activeOps = Object.entries(ops)
        .filter(([, v]) => v)
        .map(([k]) => k.replace("has", "").toLowerCase());
      log.info(`Operations: ${activeOps.join(", ")}`);

      const skipped: string[] = [];
      if (!ops.hasList) skipped.push("list (no list operation)");
      if (!ops.hasCreate && !ops.hasUpdate) skipped.push("form (no create/update)");
      if (!ops.hasGet) skipped.push("detail (no get operation)");
      if (skipped.length > 0) {
        log.info(`Skipped: ${skipped.join(", ")}`);
      }

      log.info("");
      log.info("Generated files (FSD widgets/ layer):");
      for (const fileName of Object.keys(files)) {
        log.step(`${relativeOutput}/${fileName}`);
      }
      if (packageName) {
        log.info("");
        log.info(`Domain package: ${packageName}`);
      }
      log.info(`Fields detected: ${fields.map((f) => f.name).join(", ")}`);
      log.info("");
      log.info("FSD Architecture:");
      log.step("packages/            → domain logic (schemas, hooks) — no UI");
      log.step("modules/src/widgets/ → CRUD widgets");
      log.step("modules/src/pages/   → page components (auto-generated)");
      log.step("modules/src/shared/  → shared UI, lib, config");
      log.info("");
      log.info("Next: wire up routes in your app to use the generated pages");
    } catch (err) {
      spinner.fail(`Failed to scaffold CRUD for ${entity}`);
      log.error(String(err));
      process.exit(1);
    }
  });
