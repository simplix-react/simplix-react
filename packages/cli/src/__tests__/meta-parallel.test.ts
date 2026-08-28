import { readFileSync } from "node:fs";
import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { OpenApiNamingStrategy } from "../openapi/naming/naming-strategy.js";
import type { ContainerMapping } from "../openapi/orchestration/spec-profile.js";
import type { ExtractedEntity, OpenAPISnapshot } from "../openapi/types.js";
import type { DtoMeta } from "../meta/ir-types.js";
import { resolveMeta } from "../meta/resolve.js";
import { writeFileWithDir } from "../utils/fs.js";
import type { ResolvedDomain } from "../meta/resolve.js";
import { smartSafetyDomains } from "../meta/__fixtures__/smart-safety-domains.js";
import {
  META_DIR,
  metaFingerprint,
  metaIndexContent,
  writeMetaOutput,
  writeMetaSchemasProxy,
  repointMockSeeds,
} from "../meta/write.js";
import {
  cleanGeneratedDirs,
  computeChangeGate,
  crudRolesFromHooks,
  generateCrudConfigContent,
  openapiCommand,
  prepareMetaContext,
  resolveKnownModelTypes,
  resolveMetaSource,
} from "../commands/openapi.js";

const fixturePath = fileURLToPath(
  new URL("../meta/__fixtures__/smart-safety-meta.json", import.meta.url),
);
const meta: DtoMeta = JSON.parse(readFileSync(fixturePath, "utf-8"));

/** What the simplix-boot profile contributes: the containers each become in TypeScript. */
const containerTypes: Record<string, ContainerMapping> = {
  SimpliXApiResponse: { unwrap: true },
  Page: { ts: "SpringPage", zod: "pageOf", import: "@simplix-react-ext/simplix-boot-auth" },
  List: { ts: "Array", zod: "z.array" },
  Map: { ts: "Record", zod: "z.record", keyType: "string" },
};

/**
 * The profile's naming strategy, loaded from the extension it lives in. The names it resolves are
 * what `crud.config.ts` and every module importing a hook are written against, so a strategy
 * written for the test would prove only that the generators can spell whatever they are handed.
 */
const namingModule = fileURLToPath(
  new URL("../../../../extensions/simplix-boot/packages/cli-plugin/src/naming.ts", import.meta.url),
);
const { simplixBootNaming } = (await import(namingModule)) as {
  simplixBootNaming: OpenApiNamingStrategy;
};

const resolved = resolveMeta(meta, { domains: smartSafetyDomains, containerTypes });

function domainOf(name: string): ResolvedDomain {
  const domain = resolved.domains.get(name);
  if (!domain) throw new Error(`the fixture has no domain named ${name}`);
  return domain;
}

const org = domainOf("org");
/** A domain whose closure carries enums, which is what the locale overlay's filter is about. */
const site = domainOf("site");

/** The four artifacts the swap must leave alone, seeded with content nothing generates. */
const SIDE_ARTIFACTS = [
  "crud.config.ts",
  "src/locales/ko.json",
  "src/locales/en.json",
  "src/locales/ja.json",
  "src/translations.ts",
  "http/organization.http",
];

/** A domain package as `add-domain` and an Orval run leave it, ready for the meta half. */
async function makeDomainPackage(): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), "simplix-meta-"));

  await write(dir, "crud.config.ts", 'import { defineCrudMap } from "@simplix-react/cli";\n');
  await write(dir, "src/translations.ts", 'import ko from "./locales/ko.json";\n');
  for (const locale of ["ko", "en", "ja"]) {
    await write(dir, `src/locales/${locale}.json`, '{\n  "Organization": {}\n}\n');
  }
  await write(dir, "http/organization.http", "GET {{host}}/api/v1/organizations\n");
  await write(
    dir,
    "src/index.ts",
    'import "./translations";\nexport * from "./hooks";\nexport * from "./generated/model";\nexport * from "./constants";\n',
  );
  await write(
    dir,
    "src/schemas.ts",
    '// Re-export all Orval-generated Zod schemas.\nexport * from "./generated/endpoints/organization.zod";\n\n' +
      "// Custom schema overrides and additions:\nexport const mine = 1;\n",
  );
  await write(dir, "src/mock/index.ts", "// an entry the Orval half wrote\n");
  await write(dir, "src/generated/model/organizationDTO.ts", "export interface OrganizationDTO {}\n");
  return dir;
}

async function write(dir: string, path: string, content: string): Promise<void> {
  const full = join(dir, path);
  await mkdir(join(full, ".."), { recursive: true });
  await writeFile(full, content, "utf-8");
}

async function read(dir: string, path: string): Promise<string> {
  return readFile(join(dir, path), "utf-8");
}

async function exists(dir: string, path: string): Promise<boolean> {
  return readFile(join(dir, path), "utf-8").then(
    () => true,
    () => false,
  );
}

const created: string[] = [];

async function packageWithMeta(): Promise<string> {
  const dir = await makeDomainPackage();
  created.push(dir);
  await writeMetaOutput({ targetDir: dir, domain: org, naming: simplixBootNaming });
  return dir;
}

afterAll(async () => {
  for (const dir of created) await rm(dir, { recursive: true, force: true });
});

// ── 1. The layout ────────────────────────────────────────────

describe("the meta output lands in src/generated-meta/", () => {
  let dir = "";

  beforeAll(async () => {
    dir = await packageWithMeta();
  });

  it("writes every generator's directory under the meta root", async () => {
    for (const sub of ["model", "schema", "endpoints", "hooks", "search", "access", "mock"]) {
      const entries = await readdir(join(dir, META_DIR, sub));
      expect(entries.length, `${sub} is empty`).toBeGreaterThan(0);
    }
    expect(await exists(dir, `${META_DIR}/index.ts`)).toBe(true);
  });

  it("leaves the Orval output alone", async () => {
    expect(await read(dir, "src/generated/model/organizationDTO.ts")).toBe(
      "export interface OrganizationDTO {}\n",
    );
  });

  it("re-exports model, its enums, endpoints, hooks, search and access — and neither schema nor mock", async () => {
    const barrel = await read(dir, `${META_DIR}/index.ts`);
    const exported = [...barrel.matchAll(/export \* from "\.\/([^"]+)";/g)].map((one) => one[1]);
    expect(exported).toEqual([
      "model",
      "model/_enums",
      "endpoints",
      "hooks",
      "search",
      "access",
    ]);
  });

  it("omits a directory the domain produced no module for", async () => {
    // `dashboard` has one operation and no searchable route, so nothing writes `search/index.ts`
    // and a barrel naming it would leave the package unable to resolve its own root module.
    const bare = await mkdtemp(join(tmpdir(), "simplix-meta-"));
    created.push(bare);
    await writeMetaOutput({
      targetDir: bare,
      domain: domainOf("dashboard"),
      naming: simplixBootNaming,
    });

    const barrel = await read(bare, `${META_DIR}/index.ts`);
    expect(barrel).not.toContain('export * from "./search";');
    expect(barrel).toContain('export * from "./access";');
    expect(await exists(bare, `${META_DIR}/search/index.ts`)).toBe(false);
  });

  it("moves the preserved seed module onto the meta output when a domain is swapped", async () => {
    // Both are written by the Orval half and preserved thereafter, so a swapped domain keeps them
    // naming `../generated/` — the seeds then resolve through one declaration of a DTO and the
    // entry through another, and nothing is assignable between them.
    const dir = await mkdtemp(join(tmpdir(), "meta-mock-"));
    await writeFileWithDir(
      join(dir, "src/mock/index.ts"),
      [
        'import type { PetDTO } from "../generated/model";',
        'import { createPetHandlers } from "../generated/mock/handlers";',
        "export const handlers = [...createPetHandlers(store)];",
      ].join("\n"),
    );
    await writeFileWithDir(
      join(dir, "src/mock/seeds.ts"),
      'import type { PetDTO } from "../generated/model";\nexport const petSeeds: PetDTO[] = [];\n',
    );

    expect((await repointMockSeeds(dir, "")).moved).toBe(true);

    expect(await readFile(join(dir, "src/mock/seeds.ts"), "utf-8")).toContain(
      'from "../generated-meta/model"',
    );

    // Idempotent: a second run finds nothing left to move.
    expect((await repointMockSeeds(dir, "")).moved).toBe(false);
    await rm(dir, { recursive: true, force: true });
  });

  it("takes a preserved enum row into the shape a response carries, keeping its value", async () => {
    // The OpenAPI half seeded the bare value and the meta model declares LabeledEnumValue, so the
    // preserved rows stop compiling. Only the shape moves: what somebody wrote there becomes both
    // members rather than being replaced.
    const dir = await mkdtemp(join(tmpdir(), "meta-seed-enum-"));
    await writeFileWithDir(
      join(dir, "src/mock/seeds.ts"),
      [
        'import type { PetDTO } from "../generated/model";',
        "",
        "export const petSeeds: PetDTO[] = [",
        "  {",
        '    petId: "1",',
        '    status: "RETIRED",',
        "  },",
        "];",
        "",
      ].join("\n"),
    );

    const generated = [
      'import type { PetDTO } from "../generated-meta/model";',
      "",
      "export const petSeeds: PetDTO[] = [",
      "  {",
      '    petId: "1",',
      '    status: { value: "ACTIVE", label: "ACTIVE" },',
      "  },",
      "];",
      "",
    ].join("\n");

    const result = await repointMockSeeds(dir, generated);
    const seeds = await readFile(join(dir, "src/mock/seeds.ts"), "utf-8");

    expect(seeds).toContain('status: { value: "RETIRED", label: "RETIRED" },');
    expect(result.wrapped).toContain("petSeeds.status");
    // A field the generated array leaves alone is left alone.
    expect(seeds).toContain('petId: "1",');
    await rm(dir, { recursive: true, force: true });
  });

  it("exports the params types the search generator writes beside the DTOs", async () => {
    const barrel = await read(dir, `${META_DIR}/model/index.ts`);
    const params = (await readdir(join(dir, META_DIR, "model")))
      .filter((name) => name.endsWith("Params.ts"))
      .map((name) => name.slice(0, -3));
    expect(params.length).toBeGreaterThan(0);
    for (const name of params) {
      expect(barrel, `${name} is not in the model barrel`).toContain(`export * from './${name}';`);
    }
  });
});

// ── 2. A stale file does not survive a regeneration ──────────

describe("a declaration the IR no longer carries leaves the package", () => {
  it("is gone after cleanGeneratedDirs and a rewrite", async () => {
    const dir = await packageWithMeta();
    const stale = `${META_DIR}/model/oldThing.ts`;
    await write(dir, stale, "export interface OldThing { gone: boolean }\n");
    expect(await exists(dir, stale)).toBe(true);

    await cleanGeneratedDirs(dir);
    await writeMetaOutput({ targetDir: dir, domain: org, naming: simplixBootNaming });

    expect(await exists(dir, stale)).toBe(false);
    expect(await exists(dir, `${META_DIR}/index.ts`)).toBe(true);
  });

  it("goes for a type the IR dropped between two runs", async () => {
    const dir = await mkdtemp(join(tmpdir(), "simplix-meta-"));
    created.push(dir);

    const before = tinyMeta();
    const after = tinyMeta();
    delete after.types["ShopExtraDTO"];
    after.types["ShopItemDTO"].fields = after.types["ShopItemDTO"].fields.filter(
      (field) => field.name !== "extra",
    );

    const domainBefore = tinyDomain(before);
    await writeMetaOutput({ targetDir: dir, domain: domainBefore, naming: simplixBootNaming });
    expect(await exists(dir, `${META_DIR}/model/shopExtraDTO.ts`)).toBe(true);

    await cleanGeneratedDirs(dir);
    await writeMetaOutput({ targetDir: dir, domain: tinyDomain(after), naming: simplixBootNaming });
    expect(await exists(dir, `${META_DIR}/model/shopExtraDTO.ts`)).toBe(false);
    expect(await exists(dir, `${META_DIR}/model/shopItemDTO.ts`)).toBe(true);
  });
});

// ── 3. The change gate ───────────────────────────────────────

describe("the change gate sees what the OpenAPI diff cannot", () => {
  const entities: ExtractedEntity[] = [
    {
      name: "Item",
      pascalName: "Item",
      path: "/api/v1/items",
      tags: ["shop.Item"],
      fields: [{ name: "code", type: "string", required: true }],
      operations: [],
    } as unknown as ExtractedEntity,
  ];
  const previous: OpenAPISnapshot = { version: 2, specSource: "spec.json", entities };

  it("regenerates when the IR gained one constraint and the entities did not move", () => {
    const before = tinyDomain(tinyMeta());
    const constrained = tinyMeta();
    constrained.types["ShopItemDTO"].fields[0].constraints = [{ kind: "max", value: 40 }];
    const after = tinyDomain(constrained);

    const gate = computeChangeGate({
      previous,
      entities,
      metaEnabled: true,
      meta: after,
      previousMeta: before,
    });

    // The OpenAPI half sees nothing: the entities handed to both sides are the same array.
    expect(gate.diff?.hasChanges).toBe(false);
    expect(gate.metaChanged).toBe(true);
    expect(gate.changed).toBe(true);
  });

  it("regenerates when a search operator changed, and when an enum gained its labels", () => {
    const base = tinyDomain(tinyMeta());

    const reoperated = tinyMeta();
    reoperated.types["ShopItemDTO"].fields[0].searchable = {
      operators: ["EQUALS"],
      sortable: true,
    };
    expect(metaFingerprint(tinyDomain(reoperated))).not.toBe(metaFingerprint(base));

    const labeled = tinyMeta();
    labeled.enums["ShopStatus"].labeled = true;
    expect(metaFingerprint(tinyDomain(labeled))).not.toBe(metaFingerprint(base));
  });

  it("regenerates when access was rewritten", () => {
    const base = tinyDomain(tinyMeta());
    const guarded = tinyMeta();
    guarded.operations[0].access = { kind: "permission", group: "SHOP", action: "READ" };
    expect(metaFingerprint(tinyDomain(guarded))).not.toBe(metaFingerprint(base));
  });

  it("stays quiet when neither half moved", () => {
    const same = tinyDomain(tinyMeta());
    const gate = computeChangeGate({
      previous,
      entities,
      metaEnabled: true,
      meta: same,
      previousMeta: tinyDomain(tinyMeta()),
    });
    expect(gate.changed).toBe(false);
  });

  it("runs the meta half unconditionally when there is no committed IR to compare", () => {
    const gate = computeChangeGate({
      previous,
      entities,
      metaEnabled: true,
      meta: tinyDomain(tinyMeta()),
      previousMeta: undefined,
    });
    expect(gate.metaChanged).toBe(true);
    expect(gate.changed).toBe(true);
  });

  it("leaves the OpenAPI-only verdict alone when the meta half does not run", () => {
    const gate = computeChangeGate({ previous, entities, metaEnabled: false });
    expect(gate.metaChanged).toBe(false);
    expect(gate.changed).toBe(false);
  });
});

// ── 4. --offline ─────────────────────────────────────────────

describe("--offline", () => {
  it("is declared on the command", () => {
    expect(openapiCommand.options.some((option) => option.long === "--offline")).toBe(true);
  });

  it("fails by name when meta.snapshot is unset", async () => {
    await expect(
      prepareMetaContext({
        specConfig: {
          spec: "http://localhost:8080/v3/api-docs",
          domains: { shop: ["shop.Item"] },
          meta: { source: "http://localhost:8080/api/v1/dev/meta/dto" },
        },
        specSource: "http://localhost:8080/v3/api-docs",
        rootDir: "/tmp",
        offline: true,
        naming: simplixBootNaming,
      }),
    ).rejects.toThrow(/meta\.snapshot/);
  });

  it("fails by name when the spec declares no meta block at all", async () => {
    await expect(
      prepareMetaContext({
        specConfig: { spec: "openapi.json", domains: { shop: ["shop.Item"] } },
        specSource: "openapi.json",
        rootDir: "/tmp",
        offline: true,
        naming: simplixBootNaming,
      }),
    ).rejects.toThrow(/snapshot/);
  });

  it("reads the IR from the snapshot rather than the server", async () => {
    const dir = await mkdtemp(join(tmpdir(), "simplix-meta-"));
    created.push(dir);
    await writeFile(join(dir, "ir.json"), JSON.stringify(tinyMeta()), "utf-8");

    const context = await prepareMetaContext({
      specConfig: {
        // A source no server answers: reaching for it would fail the test rather than pass it.
        spec: "http://127.0.0.1:1/v3/api-docs",
        domains: { shop: ["shop.Item"] },
        meta: { source: "http://127.0.0.1:1/api/v1/dev/meta/dto", snapshot: "ir.json" },
      },
      specSource: "http://127.0.0.1:1/v3/api-docs",
      rootDir: dir,
      offline: true,
      naming: simplixBootNaming,
    });

    expect(context?.document.version).toBe(1);
    expect(context?.resolved.domains.get("shop")?.operations).toHaveLength(1);
  });
});

// ── 5. Where the IR is read from ─────────────────────────────

describe("the meta source", () => {
  it("is the profile's endpoint on the spec's origin when the config states none", () => {
    expect(
      resolveMetaSource({}, "http://localhost:8080/v3/api-docs", "/api/v1/dev/meta/dto"),
    ).toBe("http://localhost:8080/api/v1/dev/meta/dto");
  });

  it("is what the config states, whatever the profile carries", () => {
    expect(
      resolveMetaSource({ source: "./ir.json" }, "http://localhost:8080/v3/api-docs", "/meta"),
    ).toBe("./ir.json");
  });

  it("names both ways of stating it when neither is available", () => {
    expect(() => resolveMetaSource({}, "openapi.json", "/api/v1/dev/meta/dto")).toThrow(
      /meta\.source/,
    );
    expect(() => resolveMetaSource({}, "openapi.json", undefined)).toThrow(/metaEndpoint/);
  });

  it("reads a source on disk relative to the project root, and defers the snapshot write", async () => {
    const dir = await mkdtemp(join(tmpdir(), "simplix-meta-"));
    created.push(dir);
    await writeFile(join(dir, "ir.json"), JSON.stringify(tinyMeta()), "utf-8");

    const context = await prepareMetaContext({
      specConfig: {
        spec: "openapi.json",
        domains: { shop: ["shop.Item"] },
        meta: { source: "ir.json", snapshot: "committed-ir.json", export: ["shop"] },
      },
      specSource: "openapi.json",
      rootDir: dir,
      offline: false,
      naming: simplixBootNaming,
    });

    expect(context?.document.version).toBe(1);
    expect(context?.exportDomains.has("shop")).toBe(true);
    expect(context?.snapshotPath).toBe(join(dir, "committed-ir.json"));
    // The snapshot is written once every domain has been generated, so that a run which fails
    // half-way cannot leave a fresh snapshot beside stale output and report "up-to-date" next time.
    expect(await exists(dir, "committed-ir.json")).toBe(false);
    expect(context?.previous).toBeUndefined();
  });

  it("does not run the meta half for a spec that declares no meta block", async () => {
    await expect(
      prepareMetaContext({
        specConfig: { spec: "openapi.json", domains: { shop: ["shop.Item"] } },
        specSource: "openapi.json",
        rootDir: "/tmp",
        offline: false,
        naming: simplixBootNaming,
      }),
    ).resolves.toBeUndefined();
  });
});

// ── 6. The enum filter over the meta layout ──────────────────

describe("the locale overlay's enum filter", () => {
  /** The production filter: an enum with no declaration in this domain is dropped. */
  function filtered(known: Set<string> | undefined): string[] {
    const all = Object.keys(meta.enums);
    if (!known) return all;
    return all.filter((name) => known.has(name));
  }

  it("filters a meta domain with generated/ removed to the enum set it had before", async () => {
    const dir = await makeDomainPackage();
    created.push(dir);
    await writeMetaOutput({ targetDir: dir, domain: site, naming: simplixBootNaming });
    const domainEnums = [...site.enums.keys()];
    expect(domainEnums.length).toBeGreaterThan(0);
    expect(domainEnums.length).toBeLessThan(Object.keys(meta.enums).length);

    // The Orval layout: one file per declaration, which is where the filter's names came from.
    for (const name of domainEnums) {
      await write(
        dir,
        `src/generated/model/${name.charAt(0).toLowerCase()}${name.slice(1)}.ts`,
        `export type ${name} = string;\n`,
      );
    }
    const before = filtered(await resolveKnownModelTypes(dir));
    expect(new Set(before)).toEqual(new Set(domainEnums));

    await rm(join(dir, "src/generated"), { recursive: true, force: true });
    const after = filtered(await resolveKnownModelTypes(dir));

    expect(new Set(after)).toEqual(new Set(before));
    expect(after.length).toBeLessThan(Object.keys(meta.enums).length);
  });

  it("returns undefined only when neither layout is present", async () => {
    const bare = await mkdtemp(join(tmpdir(), "simplix-meta-"));
    created.push(bare);
    expect(await resolveKnownModelTypes(bare)).toBeUndefined();
    expect(filtered(await resolveKnownModelTypes(bare))).toHaveLength(
      Object.keys(meta.enums).length,
    );
  });
});

// ── 7. The four side artifacts survive the swap ──────────────

describe("the artifacts keyed by entity name rather than by generated path", () => {
  it("are byte-identical after the meta output and the barrels are written", async () => {
    const dir = await makeDomainPackage();
    created.push(dir);

    const before = new Map<string, string>();
    for (const path of SIDE_ARTIFACTS) before.set(path, await read(dir, path));

    await writeMetaOutput({ targetDir: dir, domain: org, naming: simplixBootNaming });
    await writeMetaSchemasProxy(dir);
    await write(dir, "src/index.ts", metaIndexContent(true));

    for (const path of SIDE_ARTIFACTS) {
      expect(await read(dir, path), `${path} changed`).toBe(before.get(path));
    }
  });

  it("leaves the mock entry the Orval half wrote alone", async () => {
    const dir = await packageWithMeta();
    expect(await read(dir, "src/mock/index.ts")).toBe("// an entry the Orval half wrote\n");
  });

  it("writes the mock entry and its seeds for a package that has neither", async () => {
    const dir = await mkdtemp(join(tmpdir(), "simplix-meta-"));
    created.push(dir);
    await writeMetaOutput({ targetDir: dir, domain: org, naming: simplixBootNaming });

    expect(await exists(dir, "src/mock/index.ts")).toBe(true);
    expect(await exists(dir, "src/mock/seeds.ts")).toBe(true);
  });
});

// ── 8. crud.config.ts from the IR ────────────────────────────

describe("crud.config.ts generated from the IR", () => {
  it("resolves every role it records to a hook the meta output exports", async () => {
    const dir = await mkdtemp(join(tmpdir(), "simplix-meta-"));
    created.push(dir);
    const written = await writeMetaOutput({
      targetDir: dir,
      domain: org,
      naming: simplixBootNaming,
    });

    const content = generateCrudConfigContent(crudRolesFromHooks(written.entities));
    const hooks = (
      await Promise.all(
        (await readdir(join(dir, META_DIR, "hooks")))
          .filter((name) => name !== "index.ts")
          .map((name) => read(dir, `${META_DIR}/hooks/${name}`)),
      )
    ).join("\n");

    const recorded = [...content.matchAll(/^ {4}(\w+): "(\w+)",$/gm)].map((one) => one[2]);
    expect(recorded.length).toBeGreaterThan(0);
    for (const hookId of recorded) {
      // A query is emitted as a function declaration and a mutation as a const, so the role only
      // resolves if one of the two carries the name.
      const name = `use${hookId.charAt(0).toUpperCase()}${hookId.slice(1)}`;
      expect(
        new RegExp(`export (?:function|const) ${name}\\b`).test(hooks),
        `${name} is not exported`,
      ).toBe(true);
    }
  });

  it("keys the map by the entity names the endpoint generator resolved", async () => {
    const dir = await mkdtemp(join(tmpdir(), "simplix-meta-"));
    created.push(dir);
    const written = await writeMetaOutput({
      targetDir: dir,
      domain: org,
      naming: simplixBootNaming,
    });

    const content = generateCrudConfigContent(crudRolesFromHooks(written.entities));
    expect(content).toContain("  Organization: {");
    expect(content).toContain("  OrgType: {");
  });
});

// ── 9. The two barrels a swapped domain points at ────────────

describe("the swap", () => {
  it("points src/index.ts at the meta barrel and keeps the translations import", () => {
    expect(metaIndexContent(true)).toBe(
      'import "./translations";\nexport * from "./generated-meta";\n',
    );
    expect(metaIndexContent(false)).toBe('export * from "./generated-meta";\n');
  });

  it("points src/schemas.ts at the meta schema barrel and keeps the custom section", async () => {
    const dir = await packageWithMeta();
    await writeMetaSchemasProxy(dir);

    const schemas = await read(dir, "src/schemas.ts");
    expect(schemas).toContain('export * from "./generated-meta/schema";');
    expect(schemas).not.toContain("./generated/endpoints/");
    expect(schemas).toContain("// Custom schema overrides and additions:");
    expect(schemas).toContain("export const mine = 1;");
  });
});

// ── A hand-built IR, small enough to read ────────────────────

/** One entity, one DTO it carries, one enum on it — everything a fingerprint reads. */
function tinyMeta(): DtoMeta {
  return {
    version: 1,
    enums: {
      ShopStatus: { labeled: false, values: [{ name: "OPEN" }, { name: "SHUT" }] },
    },
    types: {
      ShopItemDTO: {
        javaClass: "com.example.ShopItemDTO",
        typeParams: [],
        fields: [
          { name: "code", type: { kind: "string" }, required: true, nullable: false },
          { name: "status", type: { kind: "enum", name: "ShopStatus" }, required: false, nullable: true },
          { name: "extra", type: { kind: "ref", name: "ShopExtraDTO" }, required: false, nullable: true },
        ],
      },
      ShopExtraDTO: {
        javaClass: "com.example.ShopExtraDTO",
        typeParams: [],
        fields: [{ name: "note", type: { kind: "string" }, required: false, nullable: true }],
      },
    },
    operations: [
      {
        id: "getShopItem",
        method: "GET",
        path: "/api/v1/items/{id}",
        tag: "shop.Item",
        access: { kind: "authenticated" },
        response: { kind: "ref", name: "ShopItemDTO" },
        request: {
          query: [],
          path: [{ name: "id", type: { kind: "number", integral: true }, required: true }],
        },
      },
    ],
  };
}

function tinyDomain(document: DtoMeta): ResolvedDomain {
  const built = resolveMeta(document, { domains: { shop: ["shop.Item"] }, containerTypes });
  const domain = built.domains.get("shop");
  if (!domain) throw new Error("the hand-built IR resolved into no shop domain");
  return domain;
}
