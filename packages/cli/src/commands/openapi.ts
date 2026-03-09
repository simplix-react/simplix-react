import { Command } from "commander";
import prompts from "prompts";
import ora from "ora";
import { join, relative, resolve } from "node:path";
import { rm, readFile } from "node:fs/promises";
import { writeFileWithDir, pathExists, readJsonFile, findProjectRoot } from "../utils/fs.js";
import { log } from "../utils/logger.js";
import { toPascalCase } from "../utils/case.js";
import { renderTemplate } from "../utils/template.js";
import { loadConfig } from "../config/config-loader.js";
import { findSpecBySource } from "../config/types.js";
import type { SimplixConfig } from "../config/types.js";
import { loadOpenAPISpec, isSpecUrl } from "../openapi/pipeline/parser.js";
import { resolveRefs } from "../openapi/pipeline/schema-resolver.js";
import { extractEntities, enrichWithResponseInfo } from "../openapi/pipeline/entity-extractor.js";
import { computeDiff, formatDiff } from "../openapi/adaptation/diff-engine.js";
import { groupEntitiesByDomain, entityMatchesDomain } from "../openapi/pipeline/domain-splitter.js";
import { generateMockFiles } from "../openapi/generation/mock-generator.js";
import { generateHookFiles } from "../openapi/generation/hook-generator.js";
import { generateHttpFile, generateHttpEnvJson } from "../openapi/generation/http-file-gen.js";
import {
  runOrval,
  narrowResponseTypes,
  addTsNocheckToEndpoints,
  generateEndpointsBarrel,
  extractSharedEndpointTypes,
  generateSchemasProxy,
  generateDomainMutatorContent,
  extractMutatorStrategy,
  buildHookImportMap,
  pruneUnusedModels,
} from "../openapi/orchestration/orval-runner.js";
import { resolveSpecConfig } from "../openapi/orchestration/resolve-spec-config.js";
import type { OperationContext } from "../openapi/naming/naming-strategy.js";
import type { OpenApiNamingStrategy } from "../openapi/naming/naming-strategy.js";
import type { ExtractedEntity, ExtractedOperation, DomainGroup, OpenAPISnapshot, OpenAPISpec } from "../openapi/types.js";
import { domainIndexTs } from "../templates/domain/index.js";

const SNAPSHOT_FILE = ".openapi-snapshot.json";

interface OpenAPIFlags {
  domain?: string;
  entities?: string;
  output?: string;
  force?: boolean;
  http?: boolean;
  yes?: boolean;
}

export const openapiCommand = new Command("openapi")
  .description(
    "Generate domain code from OpenAPI spec using Orval (URL or file path)",
  )
  .argument("<spec>", "OpenAPI spec file path or URL")
  .option(
    "-d, --domain <name>",
    "Domain name to generate (defaults to all domains)",
  )
  .option(
    "-e, --entities <names>",
    "Entity names to generate (comma-separated, defaults to all)",
  )
  .option("-o, --output <dir>", "Output directory (defaults to packages/)")
  .option("-f, --force", "Force regeneration even if no changes detected")
  .option("--no-http", "Skip .http file generation")
  .option("-y, --yes", "Auto-confirm without prompts")
  .action(async (specSource: string, flags: OpenAPIFlags) => {
    const rootDir = await findProjectRoot(process.cwd());

    // 1. Validate project root
    const rootPkg = await readJsonFile<{ name: string }>(
      join(rootDir, "package.json"),
    ).catch(() => null);

    if (!rootPkg) {
      log.error(
        "No package.json found. Run this command from a simplix project root.",
      );
      process.exit(1);
    }

    const pkgName = rootPkg.name;
    const scopeMatch = pkgName.match(/^(@[^/]+)\//);
    const scope = scopeMatch ? scopeMatch[1] : "";
    const baseName = pkgName
      .replace(/^@[^/]+\//, "")
      .replace(/-monorepo$/, "");

    // 2. Load project config
    const config = await loadConfig(rootDir);

    // 3. Parse OpenAPI spec
    const spinner = ora("Loading OpenAPI spec...").start();
    let spec;
    try {
      spec = await loadOpenAPISpec(specSource);
      spinner.succeed(
        `Loaded: ${spec.info.title} v${spec.info.version}`,
      );
    } catch (err) {
      spinner.fail("Failed to load OpenAPI spec");
      log.error(String(err));
      process.exit(1);
    }

    // 4. Resolve $ref references
    const resolvedSpec = resolveRefs(spec);

    // 5. Extract entities
    const specConfig = findSpecBySource(config.openapi, specSource, rootDir);
    const resolvedSpecConfig = specConfig ? resolveSpecConfig(specConfig) : undefined;
    let entities = extractEntities(resolvedSpec, specConfig?.crud, resolvedSpecConfig?.naming);

    // Enrich with response type info from raw spec
    enrichWithResponseInfo(spec, entities);

    if (entities.length === 0) {
      log.error("No CRUD entities found in the OpenAPI spec.");
      process.exit(1);
    }

    // Filter entities if specified
    if (flags.entities) {
      const selectedNames = new Set(
        flags.entities.split(",").map((e) => e.trim()),
      );
      entities = entities.filter((e) => selectedNames.has(e.name));

      if (entities.length === 0) {
        log.error("No matching entities found for: " + flags.entities);
        process.exit(1);
      }
    }

    // 6. Determine domain groups
    const outputBase = flags.output
      ? resolve(flags.output)
      : join(rootDir, "packages");
    const prefix = config.packages?.prefix ?? baseName;

    let domainGroups: DomainGroup[];

    if (specConfig?.domains && Object.keys(specConfig.domains).length > 0) {
      const fallback = normalizeDomainName(spec.info.title);
      domainGroups = groupEntitiesByDomain(entities, specConfig.domains, fallback);
      domainGroups = domainGroups.filter((g) => g.entities.length > 0);

      log.info(
        `Multi-domain mode: ${domainGroups.map((g) => `${g.domainName}(${g.entities.length})`).join(", ")}`,
      );
    } else {
      const domainName = normalizeDomainName(spec.info.title);
      domainGroups = [{ domainName, entities }];

      log.info(
        `Domain: ${domainName} | Entities: ${entities.map((e) => e.name).join(", ")}`,
      );
    }

    // Filter by domain name if specified
    if (flags.domain) {
      domainGroups = domainGroups.filter((g) => g.domainName === flags.domain);

      if (domainGroups.length === 0) {
        log.error(`Domain "${flags.domain}" not found in spec config.`);
        process.exit(1);
      }
    }

    // Generate each domain package
    for (const group of domainGroups) {
      await generateDomainPackage({
        domainName: group.domainName,
        entities: group.entities,
        specSource,
        spec,
        flags,
        config,
        rootDir,
        outputBase,
        prefix,
        scope,
        specConfig: specConfig
          ? specConfig
          : { spec: specSource, domains: { [group.domainName]: group.entities[0]?.tags ?? [] } },
        resolvedSpecConfig,
      });
    }
  });

// ── Core generation ──────────────────────────────────────────

interface DomainPackageOpts {
  domainName: string;
  entities: ExtractedEntity[];
  specSource: string;
  spec: OpenAPISpec;
  flags: OpenAPIFlags;
  config: SimplixConfig;
  rootDir: string;
  outputBase: string;
  prefix: string;
  scope: string;
  specConfig: { spec: string; domains: Record<string, string[]> };
  resolvedSpecConfig?: ReturnType<typeof resolveSpecConfig>;
}

async function generateDomainPackage(opts: DomainPackageOpts): Promise<void> {
  const {
    domainName, entities, specSource, spec, flags, config,
    rootDir, outputBase, prefix, specConfig, resolvedSpecConfig,
  } = opts;
  const { naming, responseAdapter } = resolvedSpecConfig ?? {};

  const dirName = prefix ? `${prefix}-domain-${domainName}` : `domain-${domainName}`;
  const targetDir = join(outputBase, dirName);
  const domainPkgName = opts.scope ? `${opts.scope}/${dirName}` : dirName;

  // 1. Domain package must exist (created by `simplix add-domain`)
  if (!(await pathExists(targetDir))) {
    log.error(`Domain package "${dirName}" not found.`);
    log.step(`Run first: simplix add-domain ${domainName}`);
    process.exit(1);
  }

  // 2. Diff check (snapshot comparison)
  const snapshotPath = join(targetDir, SNAPSHOT_FILE);
  const hasSnapshot = await pathExists(snapshotPath);

  if (hasSnapshot && !flags.force) {
    const previous = await readJsonFile<OpenAPISnapshot>(snapshotPath).catch(() => null);

    if (previous) {
      const diff = computeDiff(previous, entities);

      if (!diff.hasChanges) {
        log.success(`${domainPkgName}: No changes detected. Package is up-to-date.`);
        return;
      }

      console.log("");
      console.log(formatDiff(diff));
      console.log("");

      if (!flags.yes) {
        const { proceed } = await prompts({
          type: "confirm",
          name: "proceed",
          message: `${domainPkgName}: Regenerate with updated code?`,
          initial: true,
        });
        if (!proceed) {
          log.info("Update cancelled.");
          return;
        }
      }
    }
  }

  const spinner = ora(`Generating code for: ${domainPkgName}`).start();

  try {
    // 3. Clean generated dirs
    await cleanGeneratedDirs(targetDir);

    // 4. Ensure mutator.ts exists (and strategy matches config)
    const mutatorPath = join(targetDir, "src/mutator.ts");
    const expectedStrategy = resolvedSpecConfig?.mutatorStrategy;
    if (!(await pathExists(mutatorPath))) {
      await writeFileWithDir(mutatorPath, generateDomainMutatorContent(domainName, expectedStrategy));
    } else {
      const currentContent = await readFile(mutatorPath, "utf-8");
      const currentStrategy = extractMutatorStrategy(currentContent);
      if (expectedStrategy && currentStrategy !== expectedStrategy) {
        log.warn(
          `Mutator strategy mismatch in ${relative(process.cwd(), mutatorPath)}: ` +
          `found "${currentStrategy ?? "default"}", expected "${expectedStrategy}". Regenerating.`
        );
        await writeFileWithDir(mutatorPath, generateDomainMutatorContent(domainName, expectedStrategy));
      }
    }

    // 5. Resolve hook names via NamingStrategy (stored on entities for hook-generator)
    if (naming) {
      resolveEntityHookNames(entities, naming);
    }

    // 6. Ensure crud.config.ts exists (after hook name resolution for correct names)
    const crudConfigPath = join(targetDir, "crud.config.ts");
    if (flags.force || !(await pathExists(crudConfigPath))) {
      await writeFileWithDir(crudConfigPath, generateCrudConfigContent(entities));
    }

    // 7. Run Orval (with optional NamingStrategy override)
    const domainTags = specConfig.domains[domainName] ?? [];
    // Build tag → entityName map for multi-entity domains
    const entityMap = new Map<string, string>();
    for (const entity of entities) {
      for (const tag of entity.tags) {
        entityMap.set(tag, entity.name);
      }
    }

    // Compute spec relative path for programmatic Orval config
    const specRelativePath = isSpecUrl(specConfig.spec)
      ? specConfig.spec
      : relative(targetDir, resolve(rootDir, specConfig.spec));

    await runOrval(spinner, targetDir, dirName, {
      naming,
      entityMap,
      entityName: entities[0]?.name,
      specRelativePath,
      tags: domainTags,
    });

    // 8. Post-process endpoints & prune unused models
    await narrowResponseTypes(targetDir);
    await addTsNocheckToEndpoints(targetDir);
    await extractSharedEndpointTypes(targetDir);
    await generateEndpointsBarrel(targetDir);
    const pruned = await pruneUnusedModels(targetDir);
    if (pruned > 0) {
      log.info(`Pruned ${pruned} unused model files.`);
    }

    // 9. Build hook import map and generate hooks (with optional responseAdapter)
    const importMap = await buildHookImportMap(targetDir);
    await generateHookFiles(targetDir, entities, importMap, responseAdapter);

    // 10. Generate mock files (with optional responseAdapter for envelope wrapping)
    await generateMockFiles(targetDir, domainName, entities, responseAdapter);

    // 11. Generate or update schemas proxy (preserve custom overrides)
    await generateSchemasProxy(targetDir);

    // 12. Regenerate index.ts (preserve custom exports)
    const hasTranslations = await pathExists(join(targetDir, "src/translations.ts"));
    const newIndexContent = renderTemplate(domainIndexTs, {
      enableI18n: hasTranslations,
      enableOrval: true,
      PascalName: toPascalCase(domainName),
    });
    const indexPath = join(targetDir, "src/index.ts");
    const existingIndex = (await pathExists(indexPath)) ? await readFile(indexPath, "utf-8") : "";
    const mergedIndex = mergeIndexWithCustomExports(newIndexContent, existingIndex);
    await writeFileWithDir(indexPath, mergedIndex);

    // 12b. Ensure profile dependencies are in package.json
    if (resolvedSpecConfig?.dependencies) {
      const pkgJsonPath = join(targetDir, "package.json");
      const pkgJson = await readJsonFile<Record<string, Record<string, string>>>(pkgJsonPath);
      if (pkgJson) {
        let changed = false;
        for (const [dep, ver] of Object.entries(resolvedSpecConfig.dependencies)) {
          if (!pkgJson.dependencies?.[dep]) {
            pkgJson.dependencies ??= {};
            pkgJson.dependencies[dep] = ver;
            changed = true;
          }
        }
        if (changed) {
          await writeFileWithDir(pkgJsonPath, JSON.stringify(pkgJson, null, 2) + "\n");
          log.info(`Added missing profile dependencies to ${domainPkgName}/package.json`);
        }
      }
    }

    // 13. Update locale files
    const locales = config.i18n?.locales ?? ["en", "ko", "ja"];
    if (hasTranslations) {
      await generateLocaleFiles(targetDir, entities, locales);
    }

    // 13b. Overlay server i18n translations (via profile i18nDownloader)
    if (hasTranslations && resolvedSpecConfig?.i18nDownloader) {
      const serverOrigin = resolveServerOrigin(specSource, spec);
      if (serverOrigin) {
        await overlayServerTranslations(
          targetDir, entities, locales, serverOrigin, resolvedSpecConfig.i18nDownloader,
        );
      }
    }

    // 14. Generate .http files
    if (flags.http !== false) {
      const apiBasePath = config.api?.baseUrl ?? "";
      await writeFileWithDir(
        join(targetDir, "http/http-client.env.json"),
        generateHttpEnvJson(config),
      );
      for (const entity of entities) {
        await writeFileWithDir(
          join(targetDir, `http/${entity.name}.http`),
          generateHttpFile(entity, apiBasePath),
        );
      }
    }

    // 15. Save snapshot
    await saveSnapshot(targetDir, specSource, entities);

    spinner.succeed(`Generated code for: ${domainPkgName}`);
    printSummary(dirName, domainPkgName, entities);
  } catch (err) {
    spinner.fail("Failed to generate domain code");
    log.error(String(err));
    process.exit(1);
  }
}

// ── Helpers ──────────────────────────────────────────────────

async function cleanGeneratedDirs(targetDir: string): Promise<void> {
  await rm(join(targetDir, "src/generated"), { recursive: true, force: true });
  await rm(join(targetDir, "src/hooks"), { recursive: true, force: true });
}

async function saveSnapshot(
  targetDir: string,
  specSource: string,
  entities: ExtractedEntity[],
): Promise<void> {
  const snapshot: OpenAPISnapshot = {
    version: 2,
    generatedAt: new Date().toISOString(),
    specSource,
    entities,
  };
  await writeFileWithDir(
    join(targetDir, SNAPSHOT_FILE),
    JSON.stringify(snapshot, null, 2) + "\n",
  );
}

function printSummary(
  dirName: string,
  domainPkgName: string,
  entities: ExtractedEntity[],
): void {
  log.info("");
  log.step(`Location: packages/${dirName}/`);
  log.step(`Entities: ${entities.map((e) => e.name).join(", ")}`);
  log.step("Generated: src/generated/, src/hooks/, src/mock/");
  log.info("");
}

function normalizeDomainName(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

// ── Locale helpers (from add-domain.ts) ──────────────────────

function camelToLabel(name: string): string {
  if (name.toLowerCase() === "id") return "ID";

  // SCREAMING_SNAKE_CASE (e.g. NULL_FORMAT → Null Format)
  if (name.includes("_")) {
    return name
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");
  }

  // ALL_CAPS without underscores (e.g. WIEGAND → Wiegand, RED → Red)
  if (name === name.toUpperCase() && name.length > 1) {
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  }

  // camelCase (e.g. formatType → Format Type)
  return name
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (c) => c.toUpperCase())
    .trim();
}

function enumName(entityName: string, fieldName: string): string {
  return entityName + fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
}

function buildLocaleJson(
  entities: ExtractedEntity[],
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  const enums: Record<string, Record<string, string>> = {};

  for (const entity of entities) {
    const fields: Record<string, string> = {};
    for (const field of entity.fields) {
      fields[field.name] = camelToLabel(field.name);
      if (field.enum?.length) {
        const eName = field.enumTypeName ?? enumName(entity.name, field.name);
        enums[eName] = {};
        for (const v of field.enum) {
          enums[eName][v] = camelToLabel(v);
        }
      }
    }
    result[entity.name] = { fields };
  }

  if (Object.keys(enums).length > 0) {
    result["enums"] = enums;
  }

  return result;
}

function mergeLocaleJson(
  existing: Record<string, unknown>,
  generated: Record<string, unknown>,
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [key, genValue] of Object.entries(generated)) {
    const exValue = existing[key];
    if (
      exValue && typeof exValue === "object" && !Array.isArray(exValue) &&
      genValue && typeof genValue === "object" && !Array.isArray(genValue)
    ) {
      result[key] = mergeLocaleJson(
        exValue as Record<string, unknown>,
        genValue as Record<string, unknown>,
      );
    } else if (exValue !== undefined) {
      result[key] = exValue;
    } else {
      result[key] = genValue;
    }
  }

  return result;
}

async function generateLocaleFiles(
  targetDir: string,
  entities: ExtractedEntity[],
  locales: string[],
): Promise<void> {
  const generated = buildLocaleJson(entities);
  const localesDir = join(targetDir, "src/locales");

  for (const locale of locales) {
    const filePath = join(localesDir, `${locale}.json`);
    let content: Record<string, unknown>;

    if (await pathExists(filePath)) {
      const existing = await readJsonFile<Record<string, unknown>>(filePath)
        .catch(() => ({}));
      content = mergeLocaleJson(existing, generated);
    } else {
      content = generated;
    }

    await writeFileWithDir(filePath, JSON.stringify(content, null, 2) + "\n");
  }
}

// ── NamingStrategy hook name resolution ──────────────────────

/**
 * Populate `resolvedHookName` on each entity's operations by calling
 * `naming.resolveOperation()`. This stores the naming-strategy-resolved
 * hook name (with "use" prefix) so the hook-generator can match
 * the actual Orval-generated function names.
 */
function resolveEntityHookNames(
  entities: ExtractedEntity[],
  naming: OpenApiNamingStrategy,
): void {
  for (const entity of entities) {
    for (const op of entity.operations) {
      if (!op.operationId) continue;

      // Convert :param back to {param} for OperationContext
      const pathWithBraces = op.path.replace(/:(\w+)/g, "{$1}");
      const pathParams = [...op.path.matchAll(/:(\w+)/g)].map((m) => m[1]);

      const context: OperationContext = {
        operationId: op.operationId,
        method: op.method,
        path: pathWithBraces,
        tag: entity.tags[0],
        entityName: entity.name,
        pathParams,
        queryParams: op.queryParams.map((qp) => qp.name),
        extensions: {},
      };

      const resolved = naming.resolveOperation(context);
      // hookName is without "use" prefix (Orval adds it); store the full name
      const hn = resolved.hookName;
      op.resolvedHookName = `use${hn.charAt(0).toUpperCase()}${hn.slice(1)}`;
      op.role = resolved.role;
    }
  }
}

// ── CRUD config generation ───────────────────────────────────

type InferredRole = "list" | "get" | "getForEdit" | "create" | "update" | "delete" | "multiUpdate" | "batchUpdate" | "batchDelete" | "search";

function inferCrudRole(
  method: string,
  opPath: string,
  basePath: string,
): InferredRole | null {
  const relative = opPath === basePath ? "/" : opPath.slice(basePath.length);
  const isItemPath = /^\/[:{][^/}]+\}?$/.test(relative);

  if (method === "GET" && (relative === "/" || relative === "/search")) return "list";
  if (method === "GET" && isItemPath) return "get";
  if (method === "GET" && /^\/[:{][^/}]+\}?\/edit$/.test(relative)) return "getForEdit";
  if (method === "POST" && (relative === "/" || relative === "/create")) return "create";
  if (method === "POST" && relative === "/search") return "search";
  if ((method === "PUT" || method === "PATCH") && isItemPath) return "update";
  if (method === "PATCH" && relative === "/") return "multiUpdate";
  if (method === "PATCH" && relative === "/batch") return "batchUpdate";
  if (method === "DELETE" && isItemPath) return "delete";
  if (method === "DELETE" && (relative === "/" || relative === "/batch")) return "batchDelete";
  return null;
}

function generateCrudConfigContent(
  entities: ExtractedEntity[],
): string {
  const STANDARD_ROLES = ["list", "get", "create", "update", "delete", "getForEdit", "tree", "subtree", "multiUpdate", "batchUpdate", "batchDelete", "search"] as const;

  const lines: string[] = [
    `import { defineCrudMap } from "@simplix-react/cli";`,
    ``,
    `/**`,
    ` * CRUD operation mapping: entity → hook name (without "use" prefix)`,
    ` *`,
    ` * Maps each entity's CRUD roles to hook names.`,
    ` * The scaffold-crud command uses this to resolve hook names.`,
    ` *`,
    ` * Standard roles:`,
    ` *   list        - List/search items`,
    ` *   get         - Get single item by ID`,
    ` *   create      - Create new item`,
    ` *   update      - Update existing item`,
    ` *   delete      - Delete item`,
    ` *   getForEdit  - Get item for edit form`,
    ` *   multiUpdate - Bulk update (PATCH without ID)`,
    ` *   batchUpdate - Batch update (PATCH /batch)`,
    ` *   batchDelete - Batch delete (DELETE /batch)`,
    ` *   search      - Search with POST body`,
    ` *   tree        - Get full tree (GET /entity/tree)`,
    ` *   subtree     - Get subtree by ID (GET /entity/tree/:id)`,
    ` *`,
    ` * Extended roles (e.g., order, activate) are auto-detected from`,
    ` * PATCH endpoints with custom suffixes.`,
    ` */`,
    `export default defineCrudMap({`,
  ];

  for (const entity of entities) {
    const inferredRoles = new Map<string, string>();

    for (const op of entity.operations) {
      const hookId = resolveHookId(op);
      const role = op.role ?? inferCrudRole(op.method, op.path, entity.path);

      if (role && !inferredRoles.has(role)) {
        inferredRoles.set(role, hookId);
      }
    }

    lines.push(`  ${entity.name}: {`);

    // Emit standard roles: active if inferred, commented if not
    for (const role of STANDARD_ROLES) {
      const hookId = inferredRoles.get(role);
      if (hookId) {
        lines.push(`    ${role}: "${hookId}",`);
      } else {
        lines.push(`    // ${role}: "",`);
      }
    }

    // Emit extra roles (not in STANDARD_ROLES)
    const standardSet = new Set<string>(STANDARD_ROLES);
    for (const [role, hookId] of inferredRoles) {
      if (!standardSet.has(role)) {
        lines.push(`    ${role}: "${hookId}",`);
      }
    }

    lines.push(`  },`);
  }

  lines.push(`});`);
  lines.push(``);

  return lines.join("\n");
}

// ── Server i18n overlay ──────────────────────────────────────

/**
 * Resolve the server origin for i18n download.
 * 1. If spec source is an HTTP URL → use its origin
 * 2. Otherwise → use spec.servers[0].url from parsed spec
 */
function resolveServerOrigin(
  specSource: string,
  spec: OpenAPISpec,
): string | undefined {
  if (isSpecUrl(specSource)) {
    return new URL(specSource).origin;
  }
  // OpenAPI spec may have servers[] not in our type definition
  const servers = (spec as unknown as { servers?: Array<{ url: string }> }).servers;
  const serverUrl = servers?.[0]?.url;
  if (serverUrl) {
    try {
      return new URL(serverUrl).origin;
    } catch {
      return undefined;
    }
  }
  return undefined;
}

async function overlayServerTranslations(
  targetDir: string,
  entities: ExtractedEntity[],
  locales: string[],
  serverOrigin: string,
  i18nDownloader: (
    origin: string,
    entities: Array<{ pascalName: string; name: string }>,
    locales: string[],
  ) => Promise<Map<string, Record<string, unknown>> | undefined>,
): Promise<void> {
  const localeDataMap = await i18nDownloader(serverOrigin, entities, locales);
  if (!localeDataMap) return;

  const localesDir = join(targetDir, "src/locales");
  for (const locale of locales) {
    const overlay = localeDataMap.get(locale);
    if (!overlay) continue;

    const filePath = join(localesDir, `${locale}.json`);
    const existing = await readJsonFile<Record<string, unknown>>(filePath).catch(() => ({}));
    const merged = deepMerge(existing, overlay);
    await writeFileWithDir(filePath, JSON.stringify(merged, null, 2) + "\n");
  }

  log.info("Applied server i18n translations.");
}

function deepMerge(
  base: Record<string, unknown>,
  overlay: Record<string, unknown>,
): Record<string, unknown> {
  const result: Record<string, unknown> = { ...base };
  for (const [key, overlayValue] of Object.entries(overlay)) {
    const baseValue = result[key];
    if (
      baseValue && typeof baseValue === "object" && !Array.isArray(baseValue) &&
      overlayValue && typeof overlayValue === "object" && !Array.isArray(overlayValue)
    ) {
      result[key] = deepMerge(
        baseValue as Record<string, unknown>,
        overlayValue as Record<string, unknown>,
      );
    } else {
      result[key] = overlayValue;
    }
  }
  return result;
}

// ── index.ts merge ───────────────────────────────────────────

/**
 * Merge generated index.ts content with custom exports from an existing file.
 *
 * Custom exports are lines that exist in the old file but NOT in the new template
 * (e.g., `export * from "./constants"`). These are appended to the generated content
 * to prevent them from being lost during regeneration.
 */
function mergeIndexWithCustomExports(newContent: string, existingContent: string): string {
  if (!existingContent.trim()) return newContent;

  const newLines = new Set(newContent.split("\n").map((l) => l.trim()).filter(Boolean));

  // Find export lines in the existing file that are not in the generated template
  const customExports = existingContent
    .split("\n")
    .filter((line) => {
      const trimmed = line.trim();
      if (!trimmed) return false;
      // Only preserve export statements (not imports or other code)
      if (!trimmed.startsWith("export ")) return false;
      // Skip if already in the generated content
      return !newLines.has(trimmed);
    });

  if (customExports.length === 0) return newContent;

  return newContent.trimEnd() + "\n" + customExports.join("\n") + "\n";
}

/**
 * Get the hook identifier for an operation (without "use" prefix).
 * Prefers resolvedHookName (from NamingStrategy), falls back to operationId.
 */
function resolveHookId(op: ExtractedOperation): string {
  if (op.resolvedHookName) {
    // resolvedHookName has "use" prefix (e.g., "useGetAdminUserAccount") — strip it
    return op.resolvedHookName.replace(/^use/, "").charAt(0).toLowerCase()
      + op.resolvedHookName.replace(/^use/, "").slice(1);
  }
  const raw = op.operationId ?? op.name;
  // Remove underscores and capitalize following char to match Orval's pascal conversion
  return raw.replace(/_(\w)/g, (_: string, c: string) => c.toUpperCase());
}
