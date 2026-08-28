import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { domainIndexTs } from "../templates/domain/index.js";
import { pathExists, writeFileWithDir } from "../utils/fs.js";
import { renderTemplate } from "../utils/template.js";
import type { OpenApiNamingStrategy } from "../openapi/naming/naming-strategy.js";
import type { MetaExtensionOutput } from "../openapi/orchestration/spec-profile.js";
import { HEADER } from "./generation/emit.js";
import { generateAccessFiles } from "./generation/access-gen.js";
import { generateEndpointFiles } from "./generation/endpoint-gen.js";
import { generateHookFiles, type EntityHooks } from "./generation/hook-gen.js";
import { generateMockFiles, type EnvelopeMapping } from "./generation/mock-gen.js";
import { generateModelFiles, type LabeledEnumMapping } from "./generation/model-gen.js";
import { generateSchemaFiles } from "./generation/schema-gen.js";
import { generateSearchFiles } from "./generation/search-gen.js";
import type { ResolvedDomain } from "./resolve.js";

/** The directory the meta pipeline owns, relative to a domain package root. */
export const META_DIR = "src/generated-meta";

/** The meta output root, seen from a module of `src/`. */
const META_MODULE = "./generated-meta";

/**
 * The directories the root barrel re-exports, in the order it writes them.
 *
 * `schema` is absent because `src/schemas.ts` re-exports the zod constants separately, and an
 * `export *` from both would collide on every name. `mock` is absent because `src/mock/index.ts`
 * imports the handler factories by path rather than through a barrel.
 */
const EXPORTED_DIRS = ["model", "model/_enums", "endpoints", "hooks", "search", "access"];

/**
 * The marker `src/schemas.ts` keeps its hand-written section under.
 *
 * It is the same text the OpenAPI pipeline's proxy writes, so a package that swaps from one to
 * the other keeps whatever overrides it holds.
 */
const SCHEMA_CUSTOM_MARKER = "// Custom schema overrides and additions:";

export interface WriteMetaOptions {
  /** The domain package's root directory. */
  targetDir: string;
  domain: ResolvedDomain;
  /** Contributed by the spec profile, and shared by every generator that names something. */
  naming: OpenApiNamingStrategy;
  /** How a labeled enum's `{ value, label }` response shape is spelled. */
  labeledEnum?: LabeledEnumMapping;
  /** What wraps a mock response body. */
  envelope?: EnvelopeMapping;
  /** Files the spec profile contributes from the IR's `extensions` payload. */
  extensions?: MetaExtensionOutput;
}

export interface WriteMetaResult {
  /** Every path written, relative to the package root, in the order they were written. */
  written: string[];
  /** Role → hook name per entity, which is the shape `crud.config.ts` is keyed by. */
  entities: EntityHooks[];
  /** What a generator could not answer, for the caller to report. */
  warnings: string[];
}

/**
 * Generate a domain's meta output and write it under {@link META_DIR}.
 *
 * The directory is wholly generated and holds no hand-edited region, so it is emptied before a
 * run rather than merged into: a DTO that leaves the backend has to leave the package with it,
 * and a stale `model/oldThing.ts` still exports a type the barrel still re-exports, which
 * compiles and reports nothing.
 */
export async function writeMetaOutput(options: WriteMetaOptions): Promise<WriteMetaResult> {
  const { domain, naming } = options;
  const root = join(options.targetDir, META_DIR);

  const model = generateModelFiles(domain, { labeledEnum: options.labeledEnum });
  const schema = generateSchemaFiles(domain, { labeledEnum: options.labeledEnum });
  const endpoints = generateEndpointFiles(domain, { naming });
  const hooks = generateHookFiles(domain, { naming });
  const search = generateSearchFiles(domain, { naming });
  const access = generateAccessFiles(domain, { naming });
  const mock = generateMockFiles(domain, { naming, envelope: options.envelope });

  const files = new Map<string, string>();
  for (const emitted of [
    model.files,
    schema.files,
    endpoints.files,
    hooks.files,
    search.files,
    access.files,
    mock.files,
  ]) {
    for (const [path, content] of emitted) files.set(path, content);
  }
  for (const [path, content] of Object.entries(options.extensions?.files ?? {})) {
    files.set(path, content);
  }

  // The params types the search generator writes into the model directory are absent from the
  // model barrel, which is built from the domain's declared types alone.
  const modelBarrel = files.get("model/index.ts");
  if (modelBarrel !== undefined && search.paramsModules.length > 0) {
    files.set("model/index.ts", withParamsModules(modelBarrel, search.paramsModules));
  }
  files.set("index.ts", rootBarrel(files));

  const written: string[] = [];
  for (const path of [...files.keys()].sort()) {
    await writeFileWithDir(join(root, path), files.get(path) ?? "");
    written.push(join(META_DIR, path));
  }

  // `src/mock/` belongs to whichever pipeline generated the entry that wires the stores. While
  // the OpenAPI half still writes one, the meta handlers are emitted and left unwired: an entry
  // and its seed arrays are a matched pair, and rewriting one of the two produces a mock layer
  // that imports names the other never exported.
  const entryPath = join(options.targetDir, "src/mock/index.ts");
  if (!(await pathExists(entryPath))) {
    await writeFileWithDir(entryPath, mock.entry);
    written.push("src/mock/index.ts");
    const seedsPath = join(options.targetDir, "src/mock/seeds.ts");
    if (!(await pathExists(seedsPath))) {
      await writeFileWithDir(seedsPath, mock.seeds);
      written.push("src/mock/seeds.ts");
    }
  }

  return {
    written,
    entities: hooks.entities,
    warnings: collectWarnings({ model, schema, endpoints, search, access, mock }),
  };
}

/**
 * The `src/index.ts` of a domain whose public surface is the meta output.
 *
 * Everything the package exports comes through one barrel, so the swap is one line rather than a
 * list that has to be kept in step with the directories the generators emit. It is the domain
 * template's own barrel with the re-export pointed at that one directory: a package generated
 * from the IR and one generated by orval differ in where their declarations live and in nothing
 * else, so one template writes both.
 */
export function metaIndexContent(importTranslations: boolean): string {
  return renderTemplate(domainIndexTs, {
    enableI18n: importTranslations,
    enableOrval: true,
    generatedModule: META_MODULE,
  });
}

/**
 * The `src/schemas.ts` of a domain whose public surface is the meta output, with whatever
 * hand-written overrides the file already carries kept below the marker.
 */
/** The meta output as `src/mock/` addresses it, one level below the package's own barrel. */
const MOCK_META_MODULE = `../${META_DIR.slice(META_DIR.lastIndexOf("/") + 1)}`;

/**
 * Point the mock entry at the meta output.
 *
 * `src/mock/index.ts` is written by the Orval half, which names `../generated/model` and
 * `../generated/mock/handlers`, and `src/mock/seeds.ts` is written once and never overwritten. On
 * a swapped domain the seeds resolve through the meta barrel while the entry still wires Orval's
 * handlers, so the two halves are the same DTO from two declarations and nothing assignable
 * between them — the package stops building rather than answering wrongly.
 *
 * Only the two import paths move; the stores, their id fields and any custom handler the developer
 * added are the entry's own content and are left alone.
 */
export async function repointMockEntry(targetDir: string): Promise<boolean> {
  const entryPath = join(targetDir, "src/mock/index.ts");
  if (!(await pathExists(entryPath))) return false;

  const existing = await readFile(entryPath, "utf-8");
  // Seen from `src/mock/`, which is one level deeper than the barrel `META_MODULE` addresses.
  const repointed = existing
    .replace(/(["'])\.\.\/generated\/model\1/g, `$1${MOCK_META_MODULE}/model$1`)
    .replace(
      /(["'])\.\.\/generated\/mock\/handlers\1/g,
      `$1${MOCK_META_MODULE}/mock/handlers$1`,
    );
  if (repointed === existing) return false;

  await writeFileWithDir(entryPath, repointed);
  return true;
}

/**
 * Point the seed module at the meta output, for the same reason and with the same caveat: the file
 * is generated once and preserved, so a domain that switches keeps whatever import it was born
 * with unless this moves it.
 */
export async function repointMockSeeds(targetDir: string): Promise<boolean> {
  const seedsPath = join(targetDir, "src/mock/seeds.ts");
  if (!(await pathExists(seedsPath))) return false;

  const existing = await readFile(seedsPath, "utf-8");
  const repointed = existing.replace(
    /(["'])\.\.\/generated\/model\1/g,
    `$1${MOCK_META_MODULE}/model$1`,
  );
  if (repointed === existing) return false;

  await writeFileWithDir(seedsPath, repointed);
  return true;
}

export async function writeMetaSchemasProxy(targetDir: string): Promise<void> {
  const schemasPath = join(targetDir, "src/schemas.ts");
  const existing = (await pathExists(schemasPath)) ? await readFile(schemasPath, "utf-8") : "";
  const markerAt = existing.indexOf(SCHEMA_CUSTOM_MARKER);
  const custom =
    markerAt === -1
      ? [
          SCHEMA_CUSTOM_MARKER,
          '// import { z } from "zod";',
          "// export const updatePetBody = z.object({ ... });",
          "",
        ].join("\n")
      : existing.slice(markerAt);

  const content = [
    "// Re-export the zod schemas generated from the DTO meta IR.",
    "// To override a specific schema, define it below with the same export name.",
    "// Local exports take precedence over wildcard re-exports.",
    `export * from "${META_MODULE}/schema";`,
    "",
    custom,
  ].join("\n");

  await writeFileWithDir(schemasPath, content);
}

/**
 * A stable description of everything the generators read out of a domain's closure.
 *
 * The OpenAPI diff cannot answer whether the meta output is stale: a constraint added, a search
 * operator changed, a `@PreAuthorize` rewritten and an enum gaining its labels all leave the
 * OpenAPI document byte-identical, which is precisely why the IR exists. Two fingerprints that
 * differ mean the domain has to be regenerated.
 */
export function metaFingerprint(domain: ResolvedDomain | undefined): string {
  if (!domain) return "";
  return JSON.stringify({
    operations: domain.operations,
    types: [...domain.types.values()].map((type) => ({
      name: type.name,
      meta: type.meta,
      ancestors: type.ancestors,
    })),
    enums: [...domain.enums.values()].map((entry) => ({ name: entry.name, meta: entry.meta })),
  });
}

/** The barrel over the emitted directories, skipping any the domain produced no module for. */
function rootBarrel(files: Map<string, string>): string {
  const present = EXPORTED_DIRS.filter(
    (dir) => files.has(`${dir}/index.ts`) || files.has(`${dir}.ts`),
  );
  return [HEADER, "", ...present.map((dir) => `export * from "./${dir}";`), ""].join("\n");
}

/** The model barrel with the search generator's params modules exported beside the DTOs. */
function withParamsModules(barrel: string, paramsModules: string[]): string {
  const added = [...new Set(paramsModules)]
    .sort()
    .map((name) => `export * from './${name}';`)
    .filter((line) => !barrel.includes(line));
  return added.length === 0 ? barrel : `${barrel.trimEnd()}\n${added.join("\n")}\n`;
}

interface GeneratorResults {
  model: ReturnType<typeof generateModelFiles>;
  schema: ReturnType<typeof generateSchemaFiles>;
  endpoints: ReturnType<typeof generateEndpointFiles>;
  search: ReturnType<typeof generateSearchFiles>;
  access: ReturnType<typeof generateAccessFiles>;
  mock: ReturnType<typeof generateMockFiles>;
}

/** What the generators could not answer, in one list the caller reports as it sees fit. */
function collectWarnings(results: GeneratorResults): string[] {
  const warnings: string[] = [];

  for (const one of results.model.unboundTypeParams) {
    warnings.push(`${one.type}.${one.field} names the unbound type parameter '${one.param}'.`);
  }
  for (const one of results.model.filledTypeArguments) {
    warnings.push(
      `${one.site} names the generic ${one.target} without type arguments; ` +
        `${one.params.join(", ")} were filled with unknown.`,
    );
  }
  for (const one of results.schema.serverOnlyConstraints) {
    warnings.push(
      `${one.type}.${one.field} carries the custom constraint '${one.name}', which only the ` +
        "server checks.",
    );
  }
  for (const one of results.endpoints.duplicateExports) {
    warnings.push(
      `The name '${one.name}' is exported by two entity modules (${one.operations.join(", ")}).`,
    );
  }
  for (const one of results.search.unsupportedOperators) {
    warnings.push(
      `${one.type}.${one.field} is searchable by '${one.operator}', which the framework has no ` +
        "operator for; the filter drops it.",
    );
  }
  for (const one of results.search.unfacetedFields) {
    warnings.push(
      `${one.type}.${one.field} accepts IN with nothing to offer, so it is filtered as text.`,
    );
  }
  for (const one of results.access.expressions) {
    warnings.push(`${one.operation} is guarded by the SpEL expression \`${one.raw}\`.`);
  }
  for (const one of results.mock.unresolvedStoreTypes) {
    warnings.push(
      `${one.tag} answers ${one.roles.join(", ")} from a store the IR names no DTO for.`,
    );
  }
  for (const one of results.mock.unmatchableParameters) {
    warnings.push(
      `${one.tag}.${one.operation} is identified by '${one.parameter}', which ${one.storeType} ` +
        "does not declare.",
    );
  }

  return warnings;
}
