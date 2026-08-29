import type { EntityField, ExtractedEntity } from "../openapi/types.js";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { domainIndexTs } from "../templates/domain/index.js";
import { pathExists, writeFileWithDir } from "../utils/fs.js";
import { renderTemplate } from "../utils/template.js";
import type { OpenApiNamingStrategy } from "../openapi/naming/naming-strategy.js";
import type { MetaExtensionOutput } from "../openapi/orchestration/spec-profile.js";
import { HEADER } from "./generation/emit.js";
import { generateAccessFiles } from "./generation/access-gen.js";
import { generateEndpointFiles, entityNameOf } from "./generation/endpoint-gen.js";
import { generateHookFiles, type EntityHooks } from "./generation/hook-gen.js";
import {
  canRegenerateMockEntry,
  generateMockFiles,
  type EnvelopeMapping,
} from "./generation/mock-gen.js";
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
  /** Files the spec profile contributes from SimpliX Meta's `extensions` payload. */
  extensions?: MetaExtensionOutput;
}

export interface WriteMetaResult {
  /** Every path written, relative to the package root, in the order they were written. */
  written: string[];
  /** Role → hook name per entity, which is the shape `crud.config.ts` is keyed by. */
  entities: EntityHooks[];
  /** What a seed module would hold if it were written fresh, for merging into a preserved one. */
  seeds: string;
  /** DTO name → the fields the model declares as a labeled enum. */
  labeledSeedFields: Map<string, string[]>;
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
  const mock = generateMockFiles(domain, {
    naming,
    envelope: options.envelope,
    labeledEnum: options.labeledEnum,
  });

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

  // `src/mock/` belongs to whichever pipeline the domain is exported from. An entry and its seed
  // arrays are a matched pair — the entry names each store's DTO and the seeds declare arrays of
  // it — so a domain that switches takes both or neither. Repointing the OpenAPI entry's imports
  // alone leaves the pair naming one DTO through two declarations, which is not assignable.
  //
  // The entry is rewritten unless the developer put a handler override in it; the seeds are
  // written only when absent, because they hold data somebody typed.
  const entryPath = join(options.targetDir, "src/mock/index.ts");
  const existingEntry = (await pathExists(entryPath)) ? await readFile(entryPath, "utf-8") : "";
  if (existingEntry === "" || canRegenerateMockEntry(existingEntry)) {
    await writeFileWithDir(entryPath, mock.entry);
    written.push("src/mock/index.ts");
  }
  const seedsPath = join(options.targetDir, "src/mock/seeds.ts");
  if (!(await pathExists(seedsPath))) {
    await writeFileWithDir(seedsPath, mock.seeds);
    written.push("src/mock/seeds.ts");
  }

  return {
    written,
    entities: hooks.entities,
    /** What a seed module would hold if it were written fresh, for merging into a preserved one. */
    seeds: mock.seeds,
    labeledSeedFields: mock.labeledSeedFields,
    warnings: collectWarnings({ model, schema, endpoints, search, access, mock }),
  };
}

/**
 * The `src/index.ts` of a domain whose public surface is the meta output.
 *
 * Everything the package exports comes through one barrel, so the swap is one line rather than a
 * list that has to be kept in step with the directories the generators emit. It is the domain
 * template's own barrel with the re-export pointed at that one directory: a package generated
 * from SimpliX Meta and one generated by orval differ in where their declarations live and in nothing
 * else, so one template writes both.
 */
export function metaIndexContent(importTranslations: boolean): string {
  return renderTemplate(domainIndexTs, {
    enableI18n: importTranslations,
    enableCodegen: true,
    generatedModule: META_MODULE,
  });
}

/**
 * The `src/schemas.ts` of a domain whose public surface is the meta output, with whatever
 * hand-written overrides the file already carries kept below the marker.
 */
/** The meta output as `src/mock/` addresses it, one level below the package's own barrel. */
const MOCK_META_MODULE = `../${META_DIR.slice(META_DIR.lastIndexOf("/") + 1)}`;

/** One `export const <name>: <Type>[] = […];` of a seed module. */
interface SeedArray {
  name: string;
  type: string;
  text: string;
}

// The body is lazy and the closing bracket needs no line of its own, so an array written on one
// line — `= [];`, which is how a deliberately empty fixture reads — is matched like any other.
const SEED_ARRAY = /export const (\w+): (\w+)\[\] = \[[\s\S]*?\];\n?/g;

/**
 * Every name the module declares, whatever shape its body takes.
 *
 * Kept apart from {@link seedArraysOf} on purpose: a name this misses is appended a second time on
 * the next run and the module stops compiling, so what decides "already here" is the simplest scan
 * that can be written rather than the one that also has to read a body.
 */
function seedNamesOf(source: string): Set<string> {
  return new Set([...source.matchAll(/export const (\w+):/g)].map((one) => one[1]));
}

function seedArraysOf(source: string): SeedArray[] {
  return [...source.matchAll(SEED_ARRAY)].map((one) => ({
    name: one[1],
    type: one[2],
    text: one[0],
  }));
}

/**
 * Bring a preserved seed module up to what the meta entry wires, without discarding what somebody
 * typed into it.
 *
 * The file is written once and never overwritten, so a domain that switches keeps the arrays the
 * OpenAPI half generated — and the meta entry names stores that half never had. It also keeps that
 * half's reading of which DTO a store carries, which is not always the same one.
 *
 * So: every existing array is kept, retyped where the two halves name different DTOs; every array
 * the entry needs and the file lacks is appended with generated data; and the import moves to the
 * meta model barrel. A retype is returned rather than applied silently — the rows underneath it
 * were written against the other shape.
 */
export async function repointMockSeeds(
  targetDir: string,
  generated: string,
  /** DTO name → the fields the model declares as a labeled enum. */
  labeledFields: ReadonlyMap<string, string[]> = new Map(),
): Promise<{
  moved: boolean;
  added: string[];
  retyped: Array<{ name: string; from: string; to: string }>;
  /** Rows whose enum members took the `{ value, label }` shape a labeled enum reaches a response as. */
  wrapped: string[];
}> {
  const seedsPath = join(targetDir, "src/mock/seeds.ts");
  const unchanged = { moved: false, added: [], retyped: [], wrapped: [] };
  if (!(await pathExists(seedsPath))) return unchanged;

  const existing = await readFile(seedsPath, "utf-8");
  const wanted = new Map(seedArraysOf(generated).map((one) => [one.name, one]));
  const held = seedArraysOf(existing);
  const heldNames = seedNamesOf(existing);

  const retyped: Array<{ name: string; from: string; to: string }> = [];
  let body = existing;
  for (const one of held) {
    const target = wanted.get(one.name);
    if (target === undefined || target.type === one.type) continue;
    retyped.push({ name: one.name, from: one.type, to: target.type });
    body = body.replace(
      `export const ${one.name}: ${one.type}[] = [`,
      `export const ${one.name}: ${target.type}[] = [`,
    );
  }

  // A labeled enum reaches a response as `{ value, label }`, and the OpenAPI half seeded the bare
  // value. Only the shape moves: the value written there is kept and becomes both members, so the
  // rows keep saying what somebody meant them to say.
  const wrapped: string[] = [];
  for (const one of held) {
    const fields = labeledFields.get(one.type) ?? [];
    if (fields.length === 0) continue;

    // Within this array's own text. A field name is not unique across the module — the same one
    // names a member of another store's rows, and of a nested object inside these — so replacing
    // over the whole file wraps values the model declares as plain strings.
    let text = body.slice(body.indexOf(one.text), body.indexOf(one.text) + one.text.length);
    if (text === "") continue;
    const original = text;
    for (const field of fields) {
      const bare = new RegExp(`(\\b${field}: )"([^"]*)",`, "g");
      const before = text;
      text = text.replace(bare, '$1{ value: "$2", label: "$2" },');
      if (text !== before) wrapped.push(`${one.name}.${field}`);
    }
    if (text !== original) body = body.replace(original, text);
  }

  const missing = [...wanted.values()].filter((one) => !heldNames.has(one.name));
  if (missing.length > 0) {
    body = `${body.trimEnd()}\n\n${missing.map((one) => one.text).join("\n")}`;
  }

  // Whatever the arrays now name, taken from the meta barrel.
  const types = [...new Set(seedArraysOf(body).map((one) => one.type))].sort();
  // One import for all of them, taken from the meta barrel. Every import of the Orval output goes,
  // deep ones included: a domain regenerated before carries a module per type as well, and leaving
  // those in declares the same name twice.
  body = body.replace(
    /^import type \{[^}]*\} from ["'][^"']*\/generated\/[^"']*["'];\n/gm,
    "",
  );

  const wantedImport = `import type { ${types.join(", ")} } from "${MOCK_META_MODULE}/model";`;
  if (types.length > 0) {
    const metaImport = new RegExp(
      `^import type \\{[^}]*\\} from ["']${MOCK_META_MODULE}/model["'];$`,
      "m",
    );
    if (metaImport.test(body)) {
      // Already pointing here — rewrite it in place, so a second run over the same file changes
      // nothing and `moved` stays false.
      body = body.replace(metaImport, wantedImport);
    } else {
      const lines = body.split("\n");
      const firstDeclaration = lines.findIndex((line) => line.startsWith("export const "));
      if (firstDeclaration !== -1) {
        lines.splice(firstDeclaration, 0, wantedImport, "");
        body = lines.join("\n");
      }
    }
  }

  if (body === existing) return unchanged;
  await writeFileWithDir(seedsPath, body);
  return { moved: true, added: missing.map((one) => one.name), retyped, wrapped };
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
    "// Re-export the zod schemas generated from SimpliX Meta.",
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
 * OpenAPI document byte-identical, which is precisely why SimpliX Meta exists. Two fingerprints that
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
      `${one.tag} answers ${one.roles.join(", ")} from a store SimpliX Meta names no DTO for.`,
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

/**
 * The entity shape the OpenAPI half's side artifacts are written from, built from SimpliX Meta.
 *
 * The locale overlay reads a name and a field list, the i18n download reads a name and its Pascal
 * form, and the snapshot stores whatever it is handed. None of the three needs an operation or a
 * path, so a domain that has no OpenAPI document behind it still gets all three — which is what
 * lets a project drop Orval once every domain is exported.
 *
 * Fields come from the entity's own DTOs rather than from every type the closure reaches: a
 * locale file names what a screen shows, and the closure holds the shapes those DTOs are built
 * from as well.
 */
export function metaEntities(domain: ResolvedDomain): ExtractedEntity[] {
  return domain.entities.map((entity) => {
    const name = entityNameOf(entity.tag);
    const owned = [...domain.types.values()].filter((type) => type.owner === entity.tag);
    const seen = new Set<string>();
    const fields: EntityField[] = [];

    for (const type of owned) {
      for (const field of type.allFields) {
        if (seen.has(field.name)) continue;
        seen.add(field.name);
        const enumName = field.type.kind === "enum" ? field.type.name : undefined;
        const enumValues =
          enumName === undefined
            ? undefined
            : domain.enums.get(enumName)?.meta.values.map((one) => one.name);
        fields.push({
          name: field.name,
          snakeName: field.name.replace(/[A-Z]/g, (one) => `_${one.toLowerCase()}`),
          type: field.type.kind,
          zodType: field.type.kind,
          required: field.required,
          nullable: field.nullable,
          ...(enumValues && enumName ? { enum: enumValues, enumTypeName: enumName } : {}),
        });
      }
    }

    return {
      name,
      pascalName: name.charAt(0).toUpperCase() + name.slice(1),
      pluralName: `${name}s`,
      path: entity.operations[0]?.path ?? "",
      fields,
      queryParams: [],
      operations: [],
      tags: [entity.tag],
    };
  });
}
