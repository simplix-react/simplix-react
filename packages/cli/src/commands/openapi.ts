import { Command } from "commander";
import prompts from "prompts";
import ora from "ora";
import { join, relative, resolve, dirname } from "node:path";
import { rm, readFile, readdir } from "node:fs/promises";
import { writeFileWithDir, pathExists, readJsonFile, findProjectRoot } from "../utils/fs.js";
import { log } from "../utils/logger.js";
import { toPascalCase } from "../utils/case.js";
import { renderTemplate } from "../utils/template.js";
import { loadConfig } from "../config/config-loader.js";
import { findSpecBySource } from "../config/types.js";
import type { OpenAPIMetaConfig, OpenAPISpecConfig, SimplixConfig } from "../config/types.js";
import { loadOpenAPISpec, isSpecUrl } from "../openapi/pipeline/parser.js";
import { resolveRefs } from "../openapi/pipeline/schema-resolver.js";
import { extractEntities, enrichWithResponseInfo } from "../openapi/pipeline/entity-extractor.js";
import { computeDiff, formatDiff } from "../openapi/adaptation/diff-engine.js";
import { groupEntitiesByDomain } from "../openapi/pipeline/domain-splitter.js";
import { getSpecProfile } from "../openapi/plugin-registry.js";
import { generateMockFiles } from "../openapi/generation/mock-generator.js";
import { generateHookFiles } from "../openapi/generation/hook-generator.js";
import { generateHttpFile, generateHttpEnvJson } from "../openapi/generation/http-file-gen.js";
import {
  runOrval,
  narrowResponseTypes,
  deduplicateGeneratedFiles,
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
import type { ResponseAdapterConfig } from "../openapi/adaptation/response-adapter.js";
import type {
  LabeledEnumMapping,
  MetaExtensionOutput,
} from "../openapi/orchestration/spec-profile.js";
import { getResponseAdapterPreset } from "../openapi/plugin-registry.js";
import type { OperationContext } from "../openapi/naming/naming-strategy.js";
import type { OpenApiNamingStrategy } from "../openapi/naming/naming-strategy.js";
import type { DiffResult, ExtractedEntity, ExtractedOperation, DomainGroup, OpenAPISnapshot, OpenAPISpec } from "../openapi/types.js";
import { fetchMeta } from "../meta/fetch.js";
import { ENUM_MODULE } from "../meta/generation/emit.js";
import type { DtoMeta } from "../meta/types.js";
import { resolveMeta } from "../meta/resolve.js";
import type { ResolvedDomain, ResolvedMeta } from "../meta/resolve.js";
import type { EnvelopeMapping } from "../meta/generation/mock-gen.js";
import type { EntityHooks } from "../meta/generation/hook-gen.js";
import {
  META_DIR,
  metaFingerprint,
  metaIndexContent,
  writeMetaOutput,
  writeMetaSchemasProxy,
  repointMockSeeds,
} from "../meta/write.js";
import { domainIndexTs } from "../templates/domain/index.js";

const SNAPSHOT_FILE = ".openapi-snapshot.json";

/**
 * True when `dep` is already importable from `fromDir` through an installed
 * (or hoisted / workspace-symlinked) node_modules entry. Lets profile-dependency
 * injection skip a granular package that a meta-package already provides, so it
 * never re-adds a dependency the project intentionally consumes transitively.
 */
export async function isDependencyInstalled(dep: string, fromDir: string): Promise<boolean> {
  let dir = resolve(fromDir);
  for (;;) {
    if (await pathExists(join(dir, "node_modules", dep, "package.json"))) return true;
    const parent = dirname(dir);
    if (parent === dir) return false;
    dir = parent;
  }
}

interface OpenAPIFlags {
  domain?: string;
  entities?: string;
  output?: string;
  force?: boolean;
  http?: boolean;
  yes?: boolean;
  offline?: boolean;
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
  .option("--offline", "Read SimpliX Meta from meta.snapshot instead of the server")
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

    // Verify required spec profiles are available (plugins loaded)
    if (config.openapi) {
      for (const specEntry of config.openapi) {
        if (specEntry.profile) {
          const profile = getSpecProfile(specEntry.profile);
          if (!profile) {
            log.error(
              `Spec profile "${specEntry.profile}" is declared in simplix.config but its plugin is not loaded.\n` +
              `  Ensure the plugin package is installed and accessible.\n` +
              `  Without this plugin, code generation will produce incorrect results.`,
            );
            process.exit(1);
          }
        }
      }
    }

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

    /** What the meta half would seed, for merging into a preserved seed module below. */



    // 7. Prepare the DTO meta pipeline, which runs beside Orval for every domain below
    let meta: MetaContext | undefined;
    try {
      meta = await prepareMetaContext({
        specConfig,
        specSource,
        rootDir,
        offline: flags.offline === true,
        naming: resolvedSpecConfig?.naming,
        responseAdapter: resolvedSpecConfig?.responseAdapter,
      });
    } catch (err) {
      log.error(err instanceof Error ? err.message : String(err));
      process.exit(1);
    }

    /** What the meta half would seed, for merging into the preserved seed module below. */



    if (meta) {
      reportMetaResolution(meta.resolved);
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
        meta,
      });
    }

    // The SimpliX Meta snapshot is written once every domain has been generated. Writing it per domain
    // makes the first domain's write the second domain's comparison, so a run that regenerates
    // one package reports every later one as up-to-date.
    if (meta?.snapshotPath && !flags.offline) {
      await writeFileWithDir(meta.snapshotPath, JSON.stringify(meta.document, null, 2) + "\n");
      log.step(`DTO meta snapshot: ${relative(process.cwd(), meta.snapshotPath)}`);
    }
  });

// ── DTO meta pipeline ────────────────────────────────────────

/** Everything the meta half of a run needs, resolved once for the whole command. */
export interface MetaContext {
  /** SimpliX Meta as the server describes it now. */
  document: DtoMeta;
  /** That SimpliX Meta sliced into one closure per configured domain. */
  resolved: ResolvedMeta;
  /** The committed SimpliX Meta sliced the same way, or absent when there is nothing to compare against. */
  previous?: ResolvedMeta;
  /** Where the fetched SimpliX Meta is written once every domain has been generated. */
  snapshotPath?: string;
  /** Domains whose barrel exports the meta output instead of the Orval output. */
  exportDomains: Set<string>;
  /** The generic a labeled enum's wire shape is spelled with, when the profile states one. */
  labeledEnum?: LabeledEnumMapping;
  naming: OpenApiNamingStrategy;
  envelope?: EnvelopeMapping;
  extensions?: MetaExtensionOutput;
}

interface PrepareMetaOptions {
  specConfig?: OpenAPISpecConfig;
  specSource: string;
  rootDir: string;
  offline: boolean;
  naming?: OpenApiNamingStrategy;
  responseAdapter?: ResponseAdapterConfig;
}

/**
 * Fetch SimpliX Meta and slice it per domain, or answer `undefined` when the spec declares no
 * `meta` block and the meta half therefore does not run.
 *
 * Throws rather than returning `undefined` on a configuration that asks for the pipeline and
 * cannot have it: a silently skipped meta pipeline looks exactly like one that ran and found
 * nothing.
 */
export async function prepareMetaContext(
  options: PrepareMetaOptions,
): Promise<MetaContext | undefined> {
  const { specConfig, specSource, rootDir, offline } = options;
  const metaConfig = specConfig?.meta;

  if (!metaConfig) {
    if (offline) {
      throw new Error(
        `--offline reads SimpliX Meta from a snapshot, and no \`meta\` block is configured ` +
          `for "${specSource}" in simplix.config.ts. Add \`meta: { snapshot: "..." }\` to it.`,
      );
    }
    return undefined;
  }

  const snapshotPath = metaConfig.snapshot
    ? resolve(rootDir, metaConfig.snapshot)
    : undefined;

  if (offline && !snapshotPath) {
    throw new Error(
      `--offline reads SimpliX Meta from \`meta.snapshot\`, which is unset for ` +
        `"${specSource}". Set it in simplix.config.ts, or drop --offline to read the server.`,
    );
  }

  const profile = specConfig.profile ? getSpecProfile(specConfig.profile) : undefined;
  // A source that is not a URL is a document on disk, and the path in the configuration is
  // written relative to the project root exactly as `spec` and `snapshot` are.
  const stated = resolveMetaSource(metaConfig, specSource, profile?.metaEndpoint);
  const source = isSpecUrl(stated) ? stated : resolve(rootDir, stated);

  const naming = options.naming;
  if (!naming) {
    throw new Error(
      `The DTO meta pipeline names every request function, hook and CRUD role through a naming ` +
        `strategy, and "${specSource}" resolves none. Set \`profile\` or \`naming\` on the spec.`,
    );
  }

  // The committed SimpliX Meta is read before the fresh one so the change gate compares the two, and it is
  // read once for the whole run rather than per domain.
  const previousDocument = snapshotPath ? await readSnapshotDocument(snapshotPath) : undefined;

  const document = await fetchMeta(
    offline && snapshotPath ? { source, snapshot: snapshotPath, offline: true } : { source },
  );

  const containerTypes = profile?.containerTypes ?? {};
  const domains = specConfig.domains;

  return {
    document,
    resolved: resolveMeta(document, { domains, containerTypes }),
    previous: previousDocument
      ? resolveMeta(previousDocument, { domains, containerTypes })
      : undefined,
    snapshotPath,
    exportDomains: new Set(metaConfig.export ?? []),
    naming,
    envelope: resolveEnvelope(options.responseAdapter),
    labeledEnum: profile?.labeledEnum,
    extensions: profile?.metaExtensions?.(document),
  };
}

/**
 * Where SimpliX Meta is read from: what the configuration states, else the origin of an HTTP spec with
 * the profile's endpoint path on it.
 */
export function resolveMetaSource(
  metaConfig: OpenAPIMetaConfig,
  specSource: string,
  metaEndpoint: string | undefined,
): string {
  if (metaConfig.source) return metaConfig.source;
  if (isSpecUrl(specSource) && metaEndpoint) {
    return new URL(metaEndpoint, specSource).href;
  }
  throw new Error(
    `SimpliX Meta has no source: \`meta.source\` is unset for "${specSource}", and it cannot ` +
      `be derived — deriving it needs a spec served over HTTP and a profile carrying ` +
      `\`metaEndpoint\`` +
      (metaEndpoint ? "" : ", which this spec's profile does not") +
      `. Set \`meta.source\` in simplix.config.ts.`,
  );
}

/** A snapshot that cannot be read is no comparison rather than a failure — the run regenerates. */
async function readSnapshotDocument(snapshotPath: string): Promise<DtoMeta | undefined> {
  if (!(await pathExists(snapshotPath))) return undefined;
  const document = await readJsonFile<DtoMeta>(snapshotPath).catch(() => null);
  if (!document || typeof document.version !== "number") {
    log.warn(
      `Ignoring the DTO meta snapshot at ${relative(process.cwd(), snapshotPath)}: it carries no SimpliX Meta.`,
    );
    return undefined;
  }
  return document;
}

/**
 * What wraps a mock response body, taken from the response adapter preset the profile registers.
 * The preset carries a whole import statement, and the generator needs the module it names.
 */
function resolveEnvelope(adapter: ResponseAdapterConfig | undefined): EnvelopeMapping | undefined {
  if (typeof adapter !== "string") return undefined;
  const preset = getResponseAdapterPreset(adapter);
  const wrap = preset?.mockResponseWrapper;
  const statement = preset?.mockResponseWrapperImport;
  if (!wrap || !statement) return undefined;

  const from = statement.match(/from\s+["']([^"']+)["']/);
  if (!from) {
    log.warn(
      `The "${adapter}" response adapter names the mock wrapper ${wrap} but its import ` +
        `statement names no module; meta mock handlers answer with the bare body.`,
    );
    return undefined;
  }
  return { wrap, import: from[1] };
}

/** What SimpliX Meta and the domain configuration disagree about, said once for the whole run. */
function reportMetaResolution(resolved: ResolvedMeta): void {
  if (resolved.unmatched.length > 0) {
    const operations = resolved.unmatched.reduce((sum, one) => sum + one.operations.length, 0);
    log.warn(
      `DTO meta: ${operations} operation(s) under ${resolved.unmatched.length} tag(s) match no ` +
        `configured domain (${resolved.unmatched.map((one) => one.tag).join(", ")}).`,
    );
  }
  for (const dead of resolved.deadPatterns) {
    log.warn(`DTO meta: domain "${dead.domain}" pattern "${dead.pattern}" matches no tag.`);
  }
  for (const contested of resolved.contestedTags) {
    log.warn(
      `DTO meta: tag "${contested.tag}" is claimed by ${contested.domains.join(", ")}; ` +
        `"${contested.domains[0]}" takes it.`,
    );
  }
  if (resolved.missingTypes.length > 0) {
    log.warn(`DTO meta: undeclared types referenced — ${resolved.missingTypes.join(", ")}.`);
  }
  if (resolved.missingEnums.length > 0) {
    log.warn(`DTO meta: undeclared enums referenced — ${resolved.missingEnums.join(", ")}.`);
  }
  if (resolved.unmappedContainers.length > 0) {
    log.warn(
      `DTO meta: the profile maps no TypeScript type for ${resolved.unmappedContainers.join(", ")}.`,
    );
  }
  for (const used of resolved.frameworkTypes) {
    log.warn(`DTO meta: ${used.domain} reaches the platform type ${used.javaClass}.`);
  }
}

// ── Change gate ──────────────────────────────────────────────

export interface ChangeGateInput {
  /** The committed OpenAPI snapshot, or `null` when it could not be read. */
  previous: OpenAPISnapshot | null;
  entities: ExtractedEntity[];
  /** Whether the meta pipeline runs for this spec at all. */
  metaEnabled: boolean;
  /** The domain's closure as SimpliX Meta describes it now. */
  meta?: ResolvedDomain;
  /** The same closure as the committed SimpliX Meta snapshot described it. */
  previousMeta?: ResolvedDomain;
}

export interface ChangeGate {
  /** Whether anything has to be regenerated. */
  changed: boolean;
  diff: DiffResult | null;
  metaChanged: boolean;
}

/**
 * Whether a domain package is stale, judged from both halves.
 *
 * The OpenAPI diff cannot answer for the meta half: a `@Length` bound added, a `@SearchableField`
 * operator changed, a `@PreAuthorize` rewritten and an enum gaining its labels all leave the
 * OpenAPI document byte-identical, and SimpliX Meta exists precisely because the document loses them.
 * With no committed SimpliX Meta to compare against there is nothing to judge, so the domain regenerates —
 * a needless regeneration is cheap and a skipped one is silent.
 */
export function computeChangeGate(input: ChangeGateInput): ChangeGate {
  const diff = input.previous ? computeDiff(input.previous, input.entities) : null;
  const metaChanged =
    input.metaEnabled &&
    (input.previousMeta === undefined ||
      metaFingerprint(input.previousMeta) !== metaFingerprint(input.meta));

  return { changed: (diff?.hasChanges ?? true) || metaChanged, diff, metaChanged };
}

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
  /** `spec` is absent on a migrated project, which reaches `simplix meta` rather than here. */
  specConfig: { spec?: string; domains: Record<string, string[]> };
  resolvedSpecConfig?: ReturnType<typeof resolveSpecConfig>;
  /** The DTO meta pipeline, or absent when the spec declares no `meta` block. */
  meta?: MetaContext;
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
    // A no-`-d` run groups operations not mapped to any configured domain into a
    // spec-title fallback domain. That fallback has no package to generate, so
    // skip it with a notice instead of failing the whole run (exit code 1).
    if (!(domainName in specConfig.domains)) {
      log.info(
        `Skipping ${entities.length} operation(s) not mapped to a configured domain ("${domainName}").`,
      );
      return;
    }
    log.error(`Domain package "${dirName}" not found.`);
    log.step(`Run first: simplix add-domain ${domainName}`);
    process.exit(1);
  }

  // 2. Diff check (snapshot comparison, over both halves)
  const metaDomain = opts.meta?.resolved.domains.get(domainName);
  const previousMetaDomain = opts.meta?.previous?.domains.get(domainName);
  const snapshotPath = join(targetDir, SNAPSHOT_FILE);
  const hasSnapshot = await pathExists(snapshotPath);

  if (hasSnapshot && !flags.force) {
    const previous = await readJsonFile<OpenAPISnapshot>(snapshotPath).catch(() => null);

    if (previous) {
      const gate = computeChangeGate({
        previous,
        entities,
        metaEnabled: opts.meta !== undefined,
        meta: metaDomain,
        previousMeta: previousMetaDomain,
      });

      if (!gate.changed) {
        log.success(`${domainPkgName}: No changes detected. Package is up-to-date.`);
        return;
      }

      if (gate.diff) {
        console.log("");
        console.log(formatDiff(gate.diff));
        console.log("");
      }

      if (gate.metaChanged) {
        log.step("DTO metadata changed since the committed snapshot.");
      }

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
      await writeFileWithDir(
        crudConfigPath,
        generateCrudConfigContent(crudRolesFromEntities(entities)),
      );
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
    if (specConfig.spec === undefined) {
      throw new Error(
        "`simplix openapi` reads an OpenAPI document and this configuration states none. A " +
          "project generating from SimpliX Meta alone runs `simplix meta`; one that still needs " +
          "the Orval half states `spec` on its `openapi` entry.",
      );
    }
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
    const deduped = await deduplicateGeneratedFiles(targetDir);
    if (deduped > 0) {
      log.info(`Deduplicated ${deduped} duplicate export(s) from generated files.`);
    }
    await addTsNocheckToEndpoints(targetDir);
    await extractSharedEndpointTypes(targetDir);
    await generateEndpointsBarrel(targetDir);
    const pruned = await pruneUnusedModels(targetDir);
    if (pruned > 0) {
      log.info(`Pruned ${pruned} unused model files.`);
    }

    // Whether this domain's barrel exports the meta output. The two halves are generated side by
    // side, but only one of them is consumed: a swapped domain takes its hooks and its mock from
    // `generated-meta/`, so writing the Orval stub layer beside them would leave modules importing
    // `src/generated/` — which is what the last step of a migration deletes.
    const metaExported =
      opts.meta !== undefined && metaDomain !== undefined && opts.meta.exportDomains.has(domainName);

    // 9. Build hook import map and generate hooks (with optional responseAdapter)
    if (!metaExported) {
      const importMap = await buildHookImportMap(targetDir);
      await generateHookFiles(targetDir, entities, importMap, responseAdapter);

      // 10. Generate mock files (with optional responseAdapter for envelope wrapping)
      await generateMockFiles(targetDir, domainName, entities, responseAdapter);
    }

    /** What the meta half would seed, for merging into the preserved seed module below. */
    let metaSeeds = "";
    let metaLabeledSeedFields: ReadonlyMap<string, string[]> = new Map();

    // 10b. Generate the DTO meta output beside the Orval one
    if (opts.meta && metaDomain) {
      spinner.text = `Generating DTO meta code for: ${domainPkgName}`;
      const written = await writeMetaOutput({
        targetDir,
        domain: metaDomain,
        naming: opts.meta.naming,
        envelope: opts.meta.envelope,
        labeledEnum: opts.meta.labeledEnum,
        extensions: opts.meta.extensions,
      });

      // A domain that never had an Orval run has no crud.config.ts, and `scaffold-crud` resolves
      // no hook name at all without one: it substitutes every CRUD role as present, so a screen
      // is scaffolded with a delete action for an entity that has no delete endpoint.
      if (!(await pathExists(crudConfigPath))) {
        await writeFileWithDir(
          crudConfigPath,
          generateCrudConfigContent(crudRolesFromHooks(written.entities)),
        );
      }

      for (const warning of written.warnings) log.warn(`DTO meta: ${warning}`);
      log.info(`${domainPkgName}: wrote ${written.written.length} file(s) to ${META_DIR}/.`);
      metaSeeds = written.seeds;
      metaLabeledSeedFields = written.labeledSeedFields;
    }

    // 11. Generate or update schemas proxy (preserve custom overrides)
    if (metaExported) {
      await writeMetaSchemasProxy(targetDir);
      // The seed module is written once and never overwritten, so a swapped domain keeps the
      // arrays the OpenAPI half generated while the entry beside it wires the meta stores.
      const seeds = await repointMockSeeds(targetDir, metaSeeds, metaLabeledSeedFields);
      for (const name of seeds.added) {
        log.info(`DTO meta: seeded ${name} in src/mock/seeds.ts, which the entry now wires.`);
      }
      if (seeds.wrapped.length > 0) {
        log.info(
          `DTO meta: ${seeds.wrapped.length} seed field(s) now carry the { value, label } shape a ` +
            "labeled enum reaches a response as; the values written there are kept.",
        );
      }
      for (const one of seeds.retyped) {
        log.warn(
          `DTO meta: ${one.name} is typed ${one.to} rather than ${one.from} — the rows under it ` +
            "were written against the other shape.",
        );
      }
    } else {
      await generateSchemasProxy(targetDir);
    }

    // 12. Regenerate index.ts (preserve custom exports)
    const hasTranslations = await pathExists(join(targetDir, "src/translations.ts"));
    const newIndexContent = metaExported
      ? metaIndexContent(hasTranslations)
      : renderTemplate(domainIndexTs, {
          enableI18n: hasTranslations,
          enableCodegen: true,
          PascalName: toPascalCase(domainName),
        });
    const indexPath = join(targetDir, "src/index.ts");
    const existingIndex = (await pathExists(indexPath)) ? await readFile(indexPath, "utf-8") : "";
    const mergedIndex = mergeIndexWithCustomExports(
      newIndexContent,
      // The two lines the Orval barrel is made of are not custom exports to be preserved — kept,
      // they would leave the swapped package exporting both halves.
      metaExported ? withoutOrvalExports(existingIndex) : existingIndex,
    );
    await writeFileWithDir(indexPath, mergedIndex);

    // 12b. Ensure profile dependencies are in package.json
    if (resolvedSpecConfig?.dependencies) {
      const pkgJsonPath = join(targetDir, "package.json");
      const pkgJson = await readJsonFile<Record<string, Record<string, string>>>(pkgJsonPath);
      if (pkgJson) {
        let changed = false;
        for (const [dep, ver] of Object.entries(resolvedSpecConfig.dependencies)) {
          if (
            !pkgJson.dependencies?.[dep] &&
            !(await isDependencyInstalled(dep, targetDir))
          ) {
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
    printSummary(dirName, domainPkgName, entities, metaDomain !== undefined, metaExported);
  } catch (err) {
    spinner.fail("Failed to generate domain code");
    log.error(String(err));
    process.exit(1);
  }
}

// ── Helpers ──────────────────────────────────────────────────

/**
 * Empty every directory a generator owns.
 *
 * The meta output is emptied here for the reason the Orval output is: it is wholly generated and
 * holds no hand-edited region, so a DTO that leaves the backend has to leave the package with it.
 * A stale `generated-meta/model/oldThing.ts` still exports a type the barrel still re-exports,
 * which compiles and reports nothing.
 */
export async function cleanGeneratedDirs(targetDir: string): Promise<void> {
  await rm(join(targetDir, "src/generated"), { recursive: true, force: true });
  await rm(join(targetDir, "src/hooks"), { recursive: true, force: true });
  await rm(join(targetDir, META_DIR), { recursive: true, force: true });
}

async function saveSnapshot(
  targetDir: string,
  specSource: string,
  entities: ExtractedEntity[],
): Promise<void> {
  const snapshot: OpenAPISnapshot = {
    version: 2,
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
  hasMeta: boolean,
  exported: boolean,
): void {
  log.info("");
  log.step(`Location: packages/${dirName}/`);
  log.step(`Entities: ${entities.map((e) => e.name).join(", ")}`);
  // Only what this run actually wrote: a swapped domain takes its hooks and its mock from the
  // meta output, so naming the Orval layer would point the reader at directories that are not
  // there.
  log.step(
    exported
      ? `Generated: src/generated/, ${META_DIR}/`
      : "Generated: src/generated/, src/hooks/, src/mock/" + (hasMeta ? `, ${META_DIR}/` : ""),
  );
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

  // Keys only the existing file has (server-overlaid enum labels, hand-added
  // sections) must survive regeneration: the generated skeleton knows nothing
  // about them, and dropping them here destroys translations whenever a later
  // overlay download fails.
  for (const [key, exValue] of Object.entries(existing)) {
    if (!(key in result)) result[key] = exValue;
  }

  return result;
}

export async function generateLocaleFiles(
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

type InferredRole = "list" | "getAll" | "get" | "getForEdit" | "create" | "update" | "delete" | "multiUpdate" | "batchUpdate" | "batchDelete" | "search";

function inferCrudRole(
  method: string,
  opPath: string,
  basePath: string,
): InferredRole | null {
  const relative = opPath === basePath ? "/" : opPath.slice(basePath.length);
  const isItemPath = /^\/[:{][^/}]+\}?$/.test(relative);

  if (method === "GET" && relative === "/search") return "list";
  if (method === "GET" && relative === "/") return "getAll";
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

/** One entity's CRUD roles, whichever pipeline resolved them: role → hook name. */
export interface CrudEntityRoles {
  name: string;
  roles: Map<string, string>;
}

/** The roles the OpenAPI pipeline infers, from the naming strategy or from method and path. */
function crudRolesFromEntities(entities: ExtractedEntity[]): CrudEntityRoles[] {
  return entities.map((entity) => {
    const roles = new Map<string, string>();
    for (const op of entity.operations) {
      const hookId = resolveHookId(op);
      const role = op.role ?? inferCrudRole(op.method, op.path, entity.path);
      if (role && !roles.has(role)) roles.set(role, hookId);
    }
    return { name: entity.name, roles };
  });
}

/**
 * The roles the meta pipeline resolved, which are the ones its endpoint and hook generators
 * emitted: every SimpliX Meta operation carries an id, so the naming strategy answers all of them and
 * nothing falls through to path inference.
 */
export function crudRolesFromHooks(entities: EntityHooks[]): CrudEntityRoles[] {
  return entities.map((entity) => ({
    name: entity.entity.charAt(0).toUpperCase() + entity.entity.slice(1),
    roles: new Map(Object.entries(entity.roles)),
  }));
}

export function generateCrudConfigContent(
  entities: CrudEntityRoles[],
): string {
  const STANDARD_ROLES = ["list", "getAll", "get", "create", "update", "delete", "getForEdit", "tree", "subtree", "multiUpdate", "batchUpdate", "batchDelete", "search"] as const;

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
    ` *   getAll      - Get all items (GET /entity, no pagination)`,
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
    const inferredRoles = entity.roles;

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
export function resolveServerOrigin(
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

export async function overlayServerTranslations(
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

  // Filter enums: only keep enums that have a generated model file in this domain
  const knownTypes = await resolveKnownModelTypes(targetDir);
  if (knownTypes) {
    for (const [, localeData] of localeDataMap) {
      const enums = localeData["enums"];
      if (enums && typeof enums === "object" && !Array.isArray(enums)) {
        const enumRecord = enums as Record<string, unknown>;
        for (const key of Object.keys(enumRecord)) {
          if (!knownTypes.has(key)) delete enumRecord[key];
        }
        if (Object.keys(enumRecord).length === 0) delete localeData["enums"];
      }
    }
  }

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

/**
 * The type names a domain package declares, used to filter the server's enum translations down to
 * the ones this domain has a declaration for.
 *
 * Both layouts are read, because a domain carries both while it is being migrated. The Orval half
 * writes one file per declaration, so its names come from filenames; the meta half writes every
 * enum into `model/_enums.ts`, so a filename walk over it finds one name and drops the rest — and
 * an empty filter is not an error but the absence of one. Nothing is filtered then, all of the
 * server's enums land in the domain's locale file, and the locale files are merged and never
 * pruned, so the growth is permanent.
 *
 * `undefined` means neither layout is present, which is the only case where filtering has no
 * ground to stand on.
 */
export async function resolveKnownModelTypes(targetDir: string): Promise<Set<string> | undefined> {
  const orvalDir = join(targetDir, "src/generated/model");
  const metaDir = join(targetDir, META_DIR, "model");
  const hasOrval = await pathExists(orvalDir);
  const hasMeta = await pathExists(metaDir);
  if (!hasOrval && !hasMeta) return undefined;

  const types = new Set<string>();
  if (hasOrval) {
    for (const name of await typeNamesFromFilenames(orvalDir)) types.add(name);
  }
  if (hasMeta) {
    for (const name of await typeNamesFromFilenames(metaDir)) types.add(name);
    for (const name of await declaredNames(join(metaDir, `${ENUM_MODULE}.ts`))) types.add(name);
  }
  return types;
}

/** One declaration per file, named by the file: `siteStatus.ts` declares `SiteStatus`. */
async function typeNamesFromFilenames(modelDir: string): Promise<string[]> {
  const files = await readdir(modelDir);
  const names: string[] = [];
  for (const file of files) {
    if (!file.endsWith(".ts") || file === "index.ts") continue;
    const base = file.slice(0, -3);
    if (base.startsWith("_")) continue;
    names.push(base.charAt(0).toUpperCase() + base.slice(1));
  }
  return names;
}

/** Every name a module declares at its top level, read from its export statements. */
async function declaredNames(modulePath: string): Promise<string[]> {
  if (!(await pathExists(modulePath))) return [];
  const content = await readFile(modulePath, "utf-8");
  const names: string[] = [];
  for (const match of content.matchAll(
    /^export\s+(?:declare\s+)?(?:type|const|interface|enum|class|function)\s+([A-Za-z_$][\w$]*)/gm,
  )) {
    names.push(match[1]);
  }
  return names;
}

/**
 * An `src/index.ts` without the two lines the Orval barrel is made of, so a swap to the meta
 * output does not preserve them as custom exports.
 */
function withoutOrvalExports(content: string): string {
  const orval = new Set(['export * from "./hooks";', 'export * from "./generated/model";']);
  return content
    .split("\n")
    .filter((line) => !orval.has(line.trim()))
    .join("\n");
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
