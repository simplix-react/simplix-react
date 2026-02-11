import { Command } from "commander";
import prompts from "prompts";
import ora from "ora";
import { join, resolve } from "node:path";
import { rm, writeFile } from "node:fs/promises";
import { writeFileWithDir, pathExists, readJsonFile } from "../utils/fs.js";
import { log } from "../utils/logger.js";
import { renderTemplate } from "../utils/template.js";
import { loadConfig } from "../config/config-loader.js";
import type { SimplixConfig } from "../config/types.js";
import { withVersions } from "../versions.js";
import { loadOpenAPISpec } from "../openapi/parser.js";
import { resolveRefs } from "../openapi/schema-resolver.js";
import { extractEntities } from "../openapi/entity-extractor.js";
import { generateZodSchemas } from "../openapi/zod-codegen.js";
import { generateHttpFile, generateHttpEnvJson } from "../openapi/http-file-gen.js";
import { computeDiff, formatDiff } from "../openapi/diff-engine.js";
import type { ExtractedEntity, DomainGroup, OpenAPISnapshot } from "../openapi/types.js";
import { groupEntitiesByDomain } from "../openapi/domain-splitter.js";
import {
  openapiPackageJsonWithEslintConfig,
  openapiPackageJsonStandalone,
  openapiTsupConfig,
  openapiEslintConfigShared,
  openapiEslintConfigStandalone,
  openapiTsconfigJson,
  openapiUserIndexTs,
  openapiUserMockIndexTs,
  openapiGeneratedIndexTs,
  openapiGeneratedContractTs,
  openapiGeneratedHooksTs,
  openapiGeneratedMockHandlersTs,
  openapiGeneratedMockMigrationsTs,
  openapiMockSeedTs,
} from "../templates/openapi/openapi-templates.js";

interface OpenAPIFlags {
  domain?: string;
  entities?: string;
  output?: string;
  dryRun?: boolean;
  force?: boolean;
  http?: boolean;
  mock?: boolean;
  header?: boolean;
  yes?: boolean;
}

export const openapiCommand = new Command("openapi")
  .description(
    "Generate domain package from OpenAPI spec (URL or file path)",
  )
  .argument("<spec>", "OpenAPI spec file path or URL")
  .option("-d, --domain <name>", "Domain name (defaults to OpenAPI info.title)")
  .option(
    "-e, --entities <names>",
    "Entity names to generate (comma-separated, defaults to all)",
  )
  .option("-o, --output <dir>", "Output directory (defaults to packages/)")
  .option("--dry-run", "Preview files without writing", false)
  .option("-f, --force", "Force regeneration even if no changes detected")
  .option("--no-http", "Skip .http file generation")
  .option("--no-mock", "Skip mock layer generation")
  .option("--header", "Add auto-generated header comment to files (default)")
  .option("--no-header", "Skip auto-generated header comment in files")
  .option("-y, --yes", "Auto-confirm without prompts")
  .action(async (specSource: string, flags: OpenAPIFlags) => {
    const rootDir = resolve(process.cwd());

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

    // Extract scope and base name
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
    let entities = extractEntities(resolvedSpec);

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

    // 6. Determine domain groups (tag-based splitting or single domain)
    const outputBase = flags.output
      ? resolve(flags.output)
      : join(rootDir, "packages");
    const prefix = config.packages?.prefix ?? baseName;

    let domainGroups: DomainGroup[];

    if (config.openapi?.domains && Object.keys(config.openapi.domains).length > 0) {
      // Multi-domain: tag-based grouping
      const fallback = flags.domain ?? normalizeDomainName(spec.info.title);
      domainGroups = groupEntitiesByDomain(entities, config.openapi.domains, fallback);

      // Skip domains with 0 entities
      domainGroups = domainGroups.filter((g) => g.entities.length > 0);

      log.info(
        `Multi-domain mode: ${domainGroups.map((g) => `${g.domainName}(${g.entities.length})`).join(", ")}`,
      );
    } else {
      // Single-domain: legacy behavior
      const domainName = flags.domain ?? normalizeDomainName(spec.info.title);
      domainGroups = [{ domainName, entities }];

      log.info(
        `Domain: ${domainName} | Entities: ${entities.map((e) => e.name).join(", ")}`,
      );
    }

    // Dry-run: show file list per domain, then exit
    if (flags.dryRun) {
      for (const group of domainGroups) {
        const dirName = `${prefix}-domain-${group.domainName}`;
        const targetDir = join(outputBase, dirName);
        const isFirstRun = !(await pathExists(targetDir));

        log.info(`Dry run — ${dirName}/`);
        const fileList = buildFileList(group.entities, flags, isFirstRun);
        for (const path of Object.keys(fileList)) {
          log.step(path);
        }
        console.log("");
      }
      return;
    }

    // Generate each domain package
    for (const group of domainGroups) {
      await generateDomainPackage({
        domainName: group.domainName,
        entities: group.entities,
        specSource,
        flags,
        config,
        rootDir,
        outputBase,
        prefix,
        scope,
        baseName,
      });
    }
  });

// --- Core generation ---

async function generateDomainPackage(opts: {
  domainName: string;
  entities: ExtractedEntity[];
  specSource: string;
  flags: OpenAPIFlags;
  config: SimplixConfig;
  rootDir: string;
  outputBase: string;
  prefix: string;
  scope: string;
  baseName: string;
}): Promise<void> {
  const { domainName, entities, specSource, flags, config, outputBase, prefix, scope, baseName } = opts;

  const dirName = `${prefix}-domain-${domainName}`;
  const targetDir = join(outputBase, dirName);
  const domainPkgName = `${scope}/${dirName}`;

  // Check for existing package and handle diff
  const snapshotPath = join(targetDir, ".openapi-snapshot.json");
  const isUpdate = await pathExists(snapshotPath);
  const isFirstRun = !(await pathExists(targetDir));

  if (isUpdate) {
    const previousSnapshot = await readJsonFile<OpenAPISnapshot>(
      snapshotPath,
    );
    const diff = computeDiff(previousSnapshot, entities);

    if (!diff.hasChanges && !flags.force) {
      log.success(`${domainPkgName}: No changes detected. Package is up-to-date.`);
      return;
    }

    if (diff.hasChanges) {
      console.log("");
      console.log(formatDiff(diff));
      console.log("");
    } else {
      log.info(`${domainPkgName}: No changes detected. Forcing regeneration...`);
    }

    if (!flags.yes && !flags.force) {
      const { proceed } = await prompts({
        type: "confirm",
        name: "proceed",
        message: `${domainPkgName}: Regenerate src/generated/ with updated code?`,
        initial: false,
      });

      if (!proceed) {
        log.info("Update cancelled.");
        return;
      }
    }
  } else if (!isFirstRun) {
    // Existing package without snapshot
    if (!flags.yes) {
      const { proceed } = await prompts({
        type: "confirm",
        name: "proceed",
        message: `Package "${dirName}" already exists. Regenerate generated files?`,
        initial: false,
      });

      if (!proceed) {
        log.info("Generation cancelled.");
        return;
      }
    }
  }

  const writeSpinner = ora(
    isUpdate
      ? `Updating domain package: ${domainPkgName}`
      : `Creating domain package: ${domainPkgName}`,
  ).start();

  try {
    // Detect config-eslint package in workspace
    const configEslintPkgName = await detectConfigEslintPackage(outputBase, scope);

    // Build template context
    const apiBaseUrl = config.api?.baseUrl ?? "/api";
    const apiBasePath = `${apiBaseUrl}/${domainName}`;
    const ctx = buildTemplateContext({
      domainName,
      domainPkgName,
      configEslintPkgName,
      projectName: baseName,
      scope,
      apiBasePath,
      entities,
    });

    // Clean generated directories before regeneration
    if (!isFirstRun) {
      await rm(join(targetDir, "src/generated"), { recursive: true, force: true });
      if (flags.mock !== false) {
        await rm(join(targetDir, "src/mock/generated"), { recursive: true, force: true });
      }
    }

    // --- Generated files (always regenerated) ---
    const generatedFiles: Record<string, string> = {};

    generatedFiles["src/generated/index.ts"] = openapiGeneratedIndexTs;
    generatedFiles["src/generated/schemas.ts"] = generateZodSchemas(entities);
    generatedFiles["src/generated/contract.ts"] = renderTemplate(openapiGeneratedContractTs, ctx);
    generatedFiles["src/generated/hooks.ts"] = renderTemplate(openapiGeneratedHooksTs, ctx);

    // Mock generated layer
    if (flags.mock !== false) {
      generatedFiles["src/mock/generated/handlers.ts"] = renderTemplate(
        openapiGeneratedMockHandlersTs,
        ctx,
      );
      generatedFiles["src/mock/generated/migrations.ts"] = renderTemplate(
        openapiGeneratedMockMigrationsTs,
        ctx,
      );
    }

    // .http files (outside src/ — not compiled)
    if (flags.http !== false) {
      const httpEnv = generateHttpEnvJson(config);
      generatedFiles["http/http-client.env.json"] = httpEnv;

      for (const entity of entities) {
        generatedFiles[`http/${entity.name}.http`] = generateHttpFile(
          entity,
          apiBasePath,
        );
      }
    }

    // --- Scaffold files (first-run only) ---
    const scaffoldFiles: Record<string, string> = {};

    if (isFirstRun) {
      const pkgJsonTemplate = configEslintPkgName
        ? openapiPackageJsonWithEslintConfig
        : openapiPackageJsonStandalone;
      const eslintTemplate = configEslintPkgName
        ? openapiEslintConfigShared
        : openapiEslintConfigStandalone;

      scaffoldFiles["package.json"] = renderTemplate(pkgJsonTemplate, ctx);
      scaffoldFiles["tsup.config.ts"] = openapiTsupConfig;
      scaffoldFiles["tsconfig.json"] = openapiTsconfigJson;
      scaffoldFiles["eslint.config.js"] = renderTemplate(eslintTemplate, ctx);
      scaffoldFiles["src/index.ts"] = openapiUserIndexTs;

      if (flags.mock !== false) {
        scaffoldFiles["src/mock/index.ts"] = openapiUserMockIndexTs;
        scaffoldFiles["src/mock/seed.ts"] = renderTemplate(openapiMockSeedTs, ctx);
      }
    }

    // Determine whether to prepend auto-generated header
    const addHeader =
      flags.header !== undefined ? flags.header : (config.codegen?.header ?? true);

    // Write generated files (with header)
    for (const [relativePath, content] of Object.entries(generatedFiles)) {
      const output = addHeader
        ? prependGeneratedHeader(relativePath, content)
        : content;
      await writeFileWithDir(join(targetDir, relativePath), output);
    }

    // Write scaffold files (no header — user-owned)
    for (const [relativePath, content] of Object.entries(scaffoldFiles)) {
      await writeFileWithDir(join(targetDir, relativePath), content);
    }

    // Save snapshot for future diffs
    const snapshot: OpenAPISnapshot = {
      generatedAt: new Date().toISOString(),
      specSource,
      entities,
    };
    await writeFile(
      snapshotPath,
      JSON.stringify(snapshot, null, 2),
      "utf-8",
    );

    const totalFiles = Object.keys(generatedFiles).length + Object.keys(scaffoldFiles).length;

    writeSpinner.succeed(
      isUpdate
        ? `Updated domain package: ${domainPkgName}`
        : `Created domain package: ${domainPkgName}`,
    );

    // Summary
    log.info("");
    log.step(`Location: packages/${dirName}/`);
    log.step(`Entities: ${entities.map((e) => e.name).join(", ")}`);
    log.step(`Files: ${totalFiles} generated`);
    if (!isFirstRun) {
      log.step("User files preserved (src/index.ts, src/mock/index.ts, package.json, etc.)");
    }
    log.info("");
    log.info("Next steps:");
    log.step("pnpm install");
    log.step("pnpm build");
    if (isFirstRun) {
      log.step(
        `Add "${domainPkgName}": "workspace:*" to your app's dependencies`,
      );
    }
  } catch (err) {
    writeSpinner.fail("Failed to generate domain package");
    log.error(String(err));
    process.exit(1);
  }
}

// --- Helper functions ---

async function detectConfigEslintPackage(
  outputBase: string,
  scope: string,
): Promise<string | null> {
  // Check common config-eslint package locations relative to output directory
  const candidates = [
    { dir: join(outputBase, "config-eslint"), name: `${scope}/config-eslint` },
    { dir: join(outputBase, "..", "config", "eslint"), name: `${scope}/config-eslint` },
  ];

  for (const candidate of candidates) {
    const pkgJsonPath = join(candidate.dir, "package.json");
    if (await pathExists(pkgJsonPath)) {
      const pkg = await readJsonFile<{ name: string }>(pkgJsonPath);
      return pkg.name;
    }
  }

  return null;
}

function normalizeDomainName(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function buildTemplateContext(opts: {
  domainName: string;
  domainPkgName: string;
  configEslintPkgName: string | null;
  projectName: string;
  scope: string;
  apiBasePath: string;
  entities: ExtractedEntity[];
}): Record<string, unknown> {
  return withVersions({
    domainName: opts.domainName,
    domainPkgName: opts.domainPkgName,
    configEslintPkgName: opts.configEslintPkgName,
    hasConfigEslint: opts.configEslintPkgName !== null,
    projectName: opts.projectName,
    scope: opts.scope,
    apiBasePath: opts.apiBasePath,
    PascalName:
      opts.domainName.charAt(0).toUpperCase() + opts.domainName.slice(1),
    entities: opts.entities.map((e) => ({
      ...e,
    })),
  });
}

const GENERATED_HEADER_TS =
  "// Auto-generated by simplix openapi — DO NOT EDIT\n// Regenerate with: simplix openapi <spec>\n\n";
const GENERATED_HEADER_HTTP =
  "# Auto-generated by simplix openapi — DO NOT EDIT\n# Regenerate with: simplix openapi <spec>\n\n";

function prependGeneratedHeader(
  filePath: string,
  content: string,
): string {
  if (filePath.endsWith(".ts") || filePath.endsWith(".js")) {
    return GENERATED_HEADER_TS + content;
  }
  if (filePath.endsWith(".http")) {
    return GENERATED_HEADER_HTTP + content;
  }
  // JSON and other files: no header (no comment syntax)
  return content;
}

function buildFileList(
  entities: ExtractedEntity[],
  flags: OpenAPIFlags,
  isFirstRun: boolean,
): Record<string, true> {
  const files: Record<string, true> = {};

  // Generated files (always)
  files["src/generated/index.ts"] = true;
  files["src/generated/schemas.ts"] = true;
  files["src/generated/contract.ts"] = true;
  files["src/generated/hooks.ts"] = true;

  if (flags.mock !== false) {
    files["src/mock/generated/handlers.ts"] = true;
    files["src/mock/generated/migrations.ts"] = true;
  }

  if (flags.http !== false) {
    files["http/http-client.env.json"] = true;
    for (const e of entities) {
      files[`http/${e.name}.http`] = true;
    }
  }

  // Scaffold files (first-run only)
  if (isFirstRun) {
    files["package.json"] = true;
    files["tsup.config.ts"] = true;
    files["tsconfig.json"] = true;
    files["eslint.config.js"] = true;
    files["src/index.ts"] = true;

    if (flags.mock !== false) {
      files["src/mock/index.ts"] = true;
      files["src/mock/seed.ts"] = true;
    }
  }

  return files;
}
