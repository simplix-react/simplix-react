import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { describe, it, expect } from "vitest";
import type { DtoMeta } from "../meta/types.js";
import type { ContainerMapping } from "../openapi/orchestration/spec-profile.js";
import { resolveMeta } from "../meta/resolve.js";
import type { ResolvedDomain } from "../meta/resolve.js";
import { generateModelFiles, modelFileBase } from "../meta/generation/model-gen.js";

const fixturePath = fileURLToPath(
  new URL("../meta/__fixtures__/smart-safety-meta.json", import.meta.url),
);
const meta: DtoMeta = JSON.parse(readFileSync(fixturePath, "utf-8"));

/** What the simplix-boot profile contributes: the containers, and the labeled enum's wrapper. */
const containerTypes: Record<string, ContainerMapping> = {
  SimpliXApiResponse: { unwrap: true },
  Page: { ts: "SpringPage", zod: "pageOf", import: "@simplix-react-ext/simplix-boot-auth" },
  List: { ts: "Array", zod: "z.array" },
  Map: { ts: "Record", zod: "z.record", keyType: "string" },
};

const labeledEnum = {
  ts: "LabeledEnumValue",
  import: "@simplix-react-ext/simplix-boot-utils",
};

const tags = [...new Set(meta.operations.map((operation) => operation.tag))];

function domainOf(patterns: string[]): ResolvedDomain {
  const resolved = resolveMeta(meta, { domains: { one: patterns }, containerTypes });
  const domain = resolved.domains.get("one");
  if (!domain) throw new Error("the domain the fixture was resolved into is missing");
  return domain;
}

/** Every tag in one closure, so a rule can be checked against all 646 types at once. */
const everything = generateModelFiles(domainOf(tags), { labeledEnum });

function file(typeName: string): string {
  const content = everything.files.get(`model/${modelFileBase(typeName)}.ts`);
  if (content === undefined) throw new Error(`no file was emitted for ${typeName}`);
  return content;
}

/** The declaration body, so an assertion about a field cannot be answered by an import line. */
function fieldsOf(typeName: string): string[] {
  const body = file(typeName).match(/\{\n([\s\S]*)\n\}/);
  return (body?.[1] ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line !== "" && !line.startsWith("/**"));
}

describe("generateModelFiles emits one file per type", () => {
  it("writes 646 type files, the enum module and the barrel", () => {
    expect(everything.files.size).toBe(648);
    expect(everything.files.has("model/_enums.ts")).toBe(true);
    expect(everything.files.has("model/index.ts")).toBe(true);
    // The scaffolder builds this path from the list DTO's name to read the list projection.
    expect(everything.files.has("model/organizationListDTO.ts")).toBe(true);
    expect(modelFileBase("OrganizationListDTO")).toBe("organizationListDTO");
  });

  it("exports the enum module and every type file from the barrel", () => {
    const barrel = everything.files.get("model/index.ts") ?? "";
    const exported = [...barrel.matchAll(/export \* from '\.\/(.+)';/g)].map((match) => match[1]);
    expect(exported).toHaveLength(647);
    expect(exported).toContain("_enums");
    expect(exported).toContain("areaDetailDTO");
    expect([...exported].sort()).toEqual(exported);
  });

  it("declares a type's own fields and leaves the inherited ones to its ancestor", () => {
    expect(file("AreaZoneUpdateFormDTO")).toContain(
      "export interface AreaZoneUpdateFormDTO extends AreaUpdateFormDTO {",
    );
    expect(fieldsOf("AreaZoneUpdateFormDTO")).toEqual(["safetyZoneType?: SafetyZoneTypeLabeled;"]);
    // 17 fields reach the type through inheritance; none of them is redeclared here.
    expect(file("AreaZoneUpdateFormDTO")).not.toContain("areaCode");
  });

  it("marks a field optional exactly when SimpliX Meta says it is not required", () => {
    const create = fieldsOf("AreaCreateDTO");
    expect(create).toContain("siteId: string;");
    expect(create).toContain("areaName: string;");
    expect(create).toContain("parentAreaId?: string;");
    // `nullable` is never emitted: the capture has no field where it differs from `!required`.
    expect(file("AreaCreateDTO")).not.toContain("| null");
  });

  it("types each field kind the way the wire carries it", () => {
    const organization = fieldsOf("Organization");
    expect(organization).toContain("orgName?: string;");
    expect(organization).toContain("sortOrder?: number;");
    expect(organization).toContain("isActive?: boolean;");
    expect(organization).toContain("lastSyncedAt?: string;");
    expect(organization).toContain("orgNameI18n?: Record<string, string>;");
    expect(organization).toContain("parent?: Organization;");
    expect(fieldsOf("BaseEntity")).toContain("eventPayloadData?: Record<string, unknown>;");
    expect(fieldsOf("UserAccount")).toContain("roleIds?: string[];");
    // A self-reference names the interface being declared, so it imports nothing.
    expect(file("Organization")).not.toContain("from './organization'");
  });
});

describe("generateModelFiles and the labeled enum", () => {
  it("uses the alias on the response side and the value union on the request side", () => {
    expect(fieldsOf("AreaDetailDTO")).toContain("areaKind?: AreaKindLabeled;");
    expect(fieldsOf("AreaSearchDTO")).toContain("areaKind?: AreaKind;");
    expect(file("AreaDetailDTO")).toContain("import type { AreaKindLabeled, AreaStatusLabeled }");
    expect(file("AreaSearchDTO")).toContain("import type { AreaKind, AreaStatus }");
  });

  it("makes the enum module a module even when the domain reaches no enum", () => {
    // The barrel re-exports `_enums` unconditionally, and a file holding only a comment is not a
    // module: TypeScript answers the re-export with TS2306 and the domain package stops compiling.
    const bare = resolveMeta(meta, { domains: { org: ["org.OrgType"] }, containerTypes });
    const files = generateModelFiles(bare.domains.get("org")!).files;
    const enums = files.get("model/_enums.ts") ?? "";
    expect(enums).toContain("export {};");
    expect(ts.transpileModule(enums, { reportDiagnostics: true }).diagnostics ?? []).toEqual([]);
  });

  it("keeps the type and the const under one name, so the name works in both positions", () => {
    const enums = everything.files.get("model/_enums.ts") ?? "";
    expect(enums).toContain(
      [
        "export type AreaKind = typeof AreaKind[keyof typeof AreaKind];",
        "",
        "",
        "export const AreaKind = {",
        "  AREA: 'AREA',",
        "  ZONE: 'ZONE',",
        "} as const;",
      ].join("\n"),
    );
    expect(enums).toContain("export type AreaKindLabeled = LabeledEnumValue<AreaKind>;");
    expect(enums).toContain(
      "import type { LabeledEnumValue } from '@simplix-react-ext/simplix-boot-utils';",
    );
  });

  it("gives an unlabeled enum the union in both directions and no alias at all", () => {
    // Eleven of the 133 enums are unlabeled, and a response carries them as a bare string.
    const unlabeled = Object.entries(meta.enums)
      .filter(([, declared]) => !declared.labeled)
      .map(([name]) => name);
    expect(unlabeled.sort()).toEqual([
      "AdminCommandStatus",
      "AdminCommandType",
      "DayOfWeek",
      "InboxTab",
      "LawScreenMapNarrowing",
      "MessageButtonGrade",
      "MfaUnavailableReason",
      "SchedulerState",
      "SessionState",
      "TransportType",
      "UserAccountStanding",
    ]);

    expect(fieldsOf("UserAccountDetailDTO")).toContain("standing?: UserAccountStanding;");
    expect(fieldsOf("UserAccountListDTO")).toContain("standing?: UserAccountStanding;");
    expect(fieldsOf("SiteDetailDTO")).toContain("weekStartDay?: DayOfWeek;");

    for (const name of unlabeled) {
      for (const content of everything.files.values()) {
        expect(content).not.toContain(`${name}Labeled`);
      }
    }
  });

  it("names the types a response and a request both reach", () => {
    // Their labeled enums are emitted in the response shape, which is the only shape a response
    // carries; the backend's deserializer takes that same object back on a request, so the choice
    // is strict rather than wrong. The union would be a falsehood on every read of a response.
    const dual = everything.dualDirectionTypes;
    expect(dual).toHaveLength(35);
    expect(dual.map((entry) => entry.name)).toContain("AreaCreateDTO");
    expect(dual.find((entry) => entry.name === "AreaCreateDTO")?.enums).toEqual([
      "AreaKind",
      "AreaStatus",
    ]);
    expect(fieldsOf("AreaCreateDTO")).toContain("areaKind: AreaKindLabeled;");
  });

  it("falls back to the value union everywhere when no profile supplies the wrapper", () => {
    const plain = generateModelFiles(domainOf(["space.Area"]));
    const detail = plain.files.get("model/areaDetailDTO.ts") ?? "";
    expect(detail).toContain("areaKind?: AreaKind;");
    expect(detail).not.toContain("Labeled");
    expect(plain.files.get("model/_enums.ts")).not.toContain("LabeledEnumValue");
  });
});

describe("generateModelFiles and the generics SimpliX Meta leaves open", () => {
  it("declares the base entity generic and keeps its id on the type parameter", () => {
    expect(file("SimpliXBaseEntity")).toContain("export interface SimpliXBaseEntity<K> {");
    expect(fieldsOf("SimpliXBaseEntity")).toEqual(["id?: K;"]);
    expect(file("BaseEntity")).toContain(
      "export interface BaseEntity<K> extends SimpliXBaseEntity<K> {",
    );
    expect(file("Comparable")).toContain("export interface Comparable<T> {}");
  });

  it("reports the five raw Java Lists and emits them as unknown[]", () => {
    expect(everything.unboundTypeParams).toEqual([
      { type: "ObligationApplicabilitySearchDTO", field: "appliedRules", param: "E" },
      { type: "ObligationApplicabilitySearchDTO", field: "excludedRules", param: "E" },
      { type: "PolicyParameterSearchDTO", field: "usedByScreenKeys", param: "E" },
      { type: "PreAssignmentGateSearchDTO", field: "notifyRoleCodes", param: "E" },
      { type: "RegulationDutySearchDTO", field: "additionalArticleRefs", param: "E" },
    ]);

    for (const { type, field } of everything.unboundTypeParams) {
      expect(fieldsOf(type)).toContain(`${field}?: unknown[];`);
    }
  });

  it("fills a type argument SimpliX Meta does not carry, and says where it did", () => {
    // A `TypeMeta` has nowhere to put the argument an `extends` clause supplies, so ten sites
    // name a generic type with nothing to bind its parameter to.
    expect(everything.filledTypeArguments.map((entry) => entry.site)).toEqual([
      "AuthPermission extends",
      "JobPosition extends",
      "MailTestLog extends",
      "MessageTemplateBody extends",
      "Notification extends",
      "Organization.sortKey",
      "Organization extends",
      "UserAccount extends",
      "UserRole extends",
      "UserSecurityProfile extends",
    ]);
    expect(file("UserAccount")).toContain("export interface UserAccount extends BaseEntity<unknown>");
    expect(fieldsOf("Organization")).toContain("sortKey?: Comparable<unknown>;");
  });
});

describe("generateModelFiles keeps the output single-owner and envelope-free", () => {
  it("puts no exported name in two files of a domain", () => {
    for (const patterns of [tags, prefixed("space."), prefixed("site."), prefixed("user.")]) {
      const generated = generateModelFiles(domainOf(patterns), { labeledEnum });
      const seen = new Map<string, string>();
      for (const [path, content] of generated.files) {
        if (path === "model/index.ts") continue;
        const names = new Set(
          [...content.matchAll(/^export (?:interface|type|const) (\w+)/gm)].map(
            (match) => match[1],
          ),
        );
        for (const name of names) {
          expect(seen.has(name), `${name} is exported by ${seen.get(name)} and by ${path}`).toBe(
            false,
          );
          seen.set(name, path);
        }
      }
    }
  });

  it("emits a shared declaration once in each domain that reaches it", () => {
    const space = generateModelFiles(domainOf(prefixed("space.")), { labeledEnum });
    const site = generateModelFiles(domainOf(prefixed("site.")), { labeledEnum });
    for (const generated of [space, site]) {
      expect(generated.files.has("model/areaCreateDTO.ts")).toBe(true);
      expect(generated.files.get("model/_enums.ts")).toContain("export const AreaKind = {");
    }
  });

  it("lets the envelope into no client type", () => {
    for (const [path, content] of everything.files) {
      expect(content, path).not.toContain("SimpliXApiResponse");
    }
  });
});

describe("generateModelFiles produces well-formed TypeScript", () => {
  it("transpiles all 648 emitted files without a syntax diagnostic", () => {
    for (const [path, content] of everything.files) {
      const transpiled = ts.transpileModule(content, { reportDiagnostics: true });
      expect(transpiled.diagnostics ?? [], path).toEqual([]);
    }
  });
});

describe("generateModelFiles on the field kinds the capture does not carry", () => {
  /** Small enough that every assertion below can be read off the literal. */
  const handBuilt: DtoMeta = {
    version: 1,
    enums: { Colour: { labeled: false, values: [{ name: "RED" }] } },
    types: {
      Item: {
        javaClass: "app.Item",
        typeParams: [],
        fields: [
          { name: "id", type: { kind: "string" }, required: true, nullable: false },
          { name: "colour", type: { kind: "enum", name: "Colour" }, required: true, nullable: false },
        ],
      },
      Summary: {
        javaClass: "app.Summary",
        typeParams: [],
        description: "A row of the list, and the */ it must not break out of.",
        fields: [
          {
            name: "item",
            type: { kind: "pick", of: "Item", fields: ["id", "colour"] },
            required: false,
            nullable: true,
          },
          { name: "photo", type: { kind: "binary" }, required: false, nullable: true },
          { name: "at", type: { kind: "time", pattern: "HH:mm" }, required: false, nullable: true },
        ],
      },
    },
    operations: [
      {
        id: "getSummary",
        method: "GET",
        path: "/summary",
        tag: "shop.Summary",
        access: { kind: "public" },
        response: { kind: "ref", name: "Summary" },
        request: { query: [], path: [] },
      },
    ],
  };

  it("subsets a type with Pick, and types a binary and a clock time", () => {
    const resolved = resolveMeta(handBuilt, {
      domains: { shop: ["shop.Summary"] },
      containerTypes,
    });
    const shop = resolved.domains.get("shop");
    if (!shop) throw new Error("the hand-built domain is missing");
    const generated = generateModelFiles(shop, { labeledEnum });
    const summary = generated.files.get("model/summary.ts") ?? "";

    expect(summary).toContain("item?: Pick<Item, 'id' | 'colour'>;");
    expect(summary).toContain("photo?: Blob;");
    expect(summary).toContain("at?: string;");
    expect(summary).toContain("import type { Item } from './item';");
    // A description never closes the comment it is written into.
    expect(summary).toContain("/** A row of the list, and the *\\/ it must not break out of. */");
    expect(ts.transpileModule(summary, { reportDiagnostics: true }).diagnostics ?? []).toEqual([]);
  });
});

function prefixed(prefix: string): string[] {
  return tags.filter((tag) => tag.startsWith(prefix));
}
