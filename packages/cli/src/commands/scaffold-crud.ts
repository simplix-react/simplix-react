import { readFile, readdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";

import { Command } from "commander";
import ora from "ora";

import {
  detailTemplate,
  featureIndexTemplate,
  formTemplate,
  listTemplate,
} from "../templates/ui/index.js";
import { toCamelCase, toKebabCase, toPascalCase } from "../utils/case.js";
import { pathExists, readJsonFile, writeFileWithDir } from "../utils/fs.js";
import { log } from "../utils/logger.js";
import { renderTemplate } from "../utils/template.js";
import { depVersion, frameworkRange } from "../versions.js";

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

  // z.enum([...])
  const enumMatch = trimmed.match(/z\.enum\(\[([^\]]+)\]\)/);
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

  // z.boolean()
  if (trimmed.includes("z.boolean()")) {
    return {
      tsType: "boolean",
      formComponent: "SwitchField",
      inputType: "checkbox",
      component: "Boolean",
      options: [],
    };
  }

  // z.date() or z.coerce.date()
  if (trimmed.includes("z.date()") || trimmed.includes("z.coerce.date()")) {
    return {
      tsType: "Date",
      formComponent: "DateField",
      inputType: "date",
      component: "Date",
      options: [],
    };
  }

  // z.number() or z.coerce.number()
  if (
    trimmed.includes("z.number()") ||
    trimmed.includes("z.coerce.number()")
  ) {
    return {
      tsType: "number",
      formComponent: "NumberField",
      inputType: "number",
      component: "Number",
      options: [],
    };
  }

  // z.string() variants
  if (trimmed.includes("z.string()")) {
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
  const fields: FieldInfo[] = [];

  // Find the schema definition using brace-counting for nested z.object()
  const schemaPattern = new RegExp(
    `(?:export\\s+)?(?:const|let)\\s+\\w*${entityName}\\w*[Ss]chema\\s*=\\s*z\\.object\\(`,
    "is",
  );
  const match = schemaPattern.exec(content);
  if (!match) return fields;

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

    // Match field name: identifier followed by ':'
    const fieldNameMatch = body.slice(i).match(/^(\w+)\s*:\s*/);
    if (!fieldNameMatch) {
      const nextLine = body.indexOf("\n", i);
      i = nextLine === -1 ? body.length : nextLine + 1;
      continue;
    }

    const name = fieldNameMatch[1];
    i += fieldNameMatch[0].length;

    // Extract the Zod expression, tracking brace/paren/bracket depth
    const exprStart = i;
    let depth = 0;
    while (i < body.length) {
      const ch = body[i];
      if (ch === "(" || ch === "{" || ch === "[") depth++;
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
    if (/^z\.object\(/.test(zodExpr) || /z\.array\(\s*z\.object\(/.test(zodExpr)) continue;

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
        entry.name.endsWith(".schema.ts"))
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

  for (const filePath of schemaFiles) {
    const content = await readFile(filePath, "utf-8");
    const entityPattern = new RegExp(
      `\\w*${entityName}\\w*[Ss]chema\\s*=\\s*z\\.object`,
      "i",
    );
    if (entityPattern.test(content)) {
      const packageName = await resolvePackageName(filePath);
      return { path: filePath, content, packageName };
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
}

const CRUD_NAMES = new Set(["list", "get", "create", "update", "delete"]);

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
  };

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
    deps["@simplix-react/ui"] = frameworkRange("@simplix-react/ui");
    added.push(`@simplix-react/ui@${deps["@simplix-react/ui"]}`);
  }

  // @simplix-react/i18n
  if (!deps["@simplix-react/i18n"]) {
    deps["@simplix-react/i18n"] = frameworkRange("@simplix-react/i18n");
    added.push(`@simplix-react/i18n@${deps["@simplix-react/i18n"]}`);
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
  ctx: { EntityPascal: string; hasList: boolean; hasForm: boolean; hasDetail: boolean },
): Promise<void> {
  const widgetsIndexPath = join(moduleDir, "src", "widgets", "index.ts");
  if (!(await pathExists(widgetsIndexPath))) return;

  let content = await readFile(widgetsIndexPath, "utf-8");

  // Already has exports for this entity → skip
  if (content.includes(`./${entityKebab}"`)) return;

  // Build export lines
  const lines: string[] = [];
  if (ctx.hasList) {
    lines.push(`export { ${ctx.EntityPascal}List } from "./${entityKebab}";`);
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

      // Derive domain name from package name (e.g., "@scope/project-domain-pet" → "pet")
      const domainMatch = packageName?.match(/-domain-(\w+)$/);
      const domainCamel = domainMatch ? toCamelCase(domainMatch[1]) : entity;

      const fieldNameList = fields.map((f) => f.name).join(", ");
      const ctx = {
        EntityPascal,
        entityKebab,
        entity,
        fields,
        packageName,
        domainCamel,
        fieldNameList,
        hasList: ops.hasList,
        hasForm: ops.hasCreate || ops.hasUpdate,
        hasDetail: ops.hasGet,
        hasCreate: ops.hasCreate,
        hasUpdate: ops.hasUpdate,
        hasDelete: ops.hasDelete,
      };

      const files: Record<string, string> = {};
      if (ops.hasList) {
        files[`${entityKebab}-list.tsx`] = renderTemplate(listTemplate, ctx);
      }
      if (ops.hasCreate || ops.hasUpdate) {
        files[`${entityKebab}-form.tsx`] = renderTemplate(formTemplate, ctx);
      }
      if (ops.hasGet) {
        files[`${entityKebab}-detail.tsx`] = renderTemplate(detailTemplate, ctx);
      }
      files["index.ts"] = renderTemplate(featureIndexTemplate, ctx);

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
        await updateWidgetsIndex(moduleDir, entityKebab, ctx);
      }

      spinner.succeed(`CRUD widgets generated for ${EntityPascal}`);

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
      log.step("packages/          → domain logic (schemas, hooks) — no UI");
      log.step("modules/src/widgets/  → CRUD widgets (this output)");
      log.step("modules/src/shared/   → shared UI, lib, config");
      log.info("");
      log.info("Next: wire up routes in your app to use the generated widgets");
    } catch (err) {
      spinner.fail(`Failed to scaffold CRUD for ${entity}`);
      log.error(String(err));
      process.exit(1);
    }
  });
