import { readFileSync } from "node:fs";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { describe, it, expect } from "vitest";
import { z } from "zod";
import type { DtoMeta } from "../meta/types.js";
import type { ContainerMapping } from "../openapi/orchestration/spec-profile.js";
import { resolveMeta } from "../meta/resolve.js";
import type { ResolvedDomain } from "../meta/resolve.js";
import { generateSchemaFiles, schemaFileBase } from "../meta/generation/schema-gen.js";
import type { SchemaGenResult } from "../meta/generation/schema-gen.js";
import { findSchemaFile, parseSchemaFields } from "../commands/scaffold-crud.js";

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
const everything = generateSchemaFiles(domainOf(tags), { labeledEnum });

/** The module a constant was written into, which is the entity that reached the type first. */
function moduleOf(typeName: string, generated: SchemaGenResult = everything): string {
  for (const [path, content] of generated.files) {
    if (new RegExp(`^export const ${typeName}Schema\\b`, "m").test(content)) {
      return path.replace(/^schema\/(.+)\.schema\.ts$/, "$1");
    }
  }
  throw new Error(`no module declares ${typeName}Schema`);
}

function file(typeName: string, generated: SchemaGenResult = everything): string {
  return generated.files.get(`schema/${moduleOf(typeName, generated)}.schema.ts`) ?? "";
}

/** One constant's declaration, so an assertion cannot be answered by a neighbouring one. */
function constant(typeName: string, generated: SchemaGenResult = everything): string {
  const content = file(typeName, generated);
  const at = content.indexOf(`export const ${typeName}Schema`);
  if (at < 0) throw new Error(`no declaration of ${typeName}Schema`);
  const line = content.slice(at, content.indexOf("\n", at));
  if (line.endsWith("});")) return line;
  const end = content.indexOf("\n});", at);
  return content.slice(at, end + 4);
}

/** The member lines of one constant, each `name: expression,`. */
function members(typeName: string, generated: SchemaGenResult = everything): string[] {
  return constant(typeName, generated)
    .split("\n")
    .slice(1, -1)
    .map((line) => line.trim())
    .filter((line) => line !== "" && !line.startsWith("//"));
}

describe("generateSchemaFiles emits one module per entity", () => {
  it("writes a module per tag that reaches a DTO, plus the barrel", () => {
    // Ten of the 139 tags reach no DTO at all — their operations carry primitives and nothing
    // else — and an empty module would be a name the barrel exports nothing through.
    expect(tags).toHaveLength(139);
    expect(everything.order).toHaveLength(129);
    expect(everything.files.size).toBe(130);
    expect(everything.files.has("schema/index.ts")).toBe(true);
    expect(everything.files.has("schema/area.schema.ts")).toBe(true);
    expect(everything.files.has("schema/organization.schema.ts")).toBe(true);
  });

  it("names a module after the tag, whatever the tag is spelled like", () => {
    // A tag is free text: the capture holds `Auth Token` and `OAuth2 Social Login` beside the
    // dotted ones, and a space in the name would write a module no import can reach.
    expect(schemaFileBase("user.admin.UserAccount")).toBe("userAccount");
    expect(schemaFileBase("OAuth2 Social Login")).toBe("oAuth2SocialLogin");
    expect(schemaFileBase("StreamAdminController")).toBe("streamAdminController");
    for (const path of everything.files.keys()) {
      if (path === "schema/index.ts") continue;
      expect(path).toMatch(/^schema\/[A-Za-z_$][\w$]*\.schema\.ts$/);
    }
  });

  it("names one constant per type rather than one per operation and role", () => {
    // Orval names a constant per operation and role, so one entity's twelve operations produce
    // thirty-two of them. Nothing outside the generated directory imports those names.
    const declared = new Set<string>();
    for (const [path, content] of everything.files) {
      if (path === "schema/index.ts") continue;
      for (const match of content.matchAll(/^export const (\w+)/gm)) declared.add(match[1]);
    }
    expect(declared.size).toBe(meta.types ? Object.keys(meta.types).length : 0);
    expect(declared.has("OrganizationCreateDTOSchema")).toBe(true);
    expect(declared.has("OrganizationRestCreateBody")).toBe(false);
  });

  it("puts no constant in two modules of a domain", () => {
    const seen = new Map<string, string>();
    for (const [path, content] of everything.files) {
      if (path === "schema/index.ts") continue;
      for (const match of content.matchAll(/^export const (\w+)/gm)) {
        expect(seen.has(match[1]), `${match[1]} is declared by ${seen.get(match[1])} and ${path}`)
          .toBe(false);
        seen.set(match[1], path);
      }
    }
  });
});

describe("generateSchemaFiles carries the constraints the client never saw", () => {
  it("emits both halves of a notBlank field that also has a length bound", () => {
    // 720 constraints on 561 fields reach the client this way; 140 of the 232 notBlank ones
    // pair with a length bound, and a client that dropped either accepted what the server refuses.
    expect(members("AreaCreateDTO")).toContain("siteId: z.string().trim().min(1).max(36),");
    expect(members("AreaCreateDTO")).toContain("areaName: z.string().trim().min(1).max(200),");
    expect(members("AreaCreateDTO")).toContain("areaCode: z.string().max(32).optional(),");
  });

  it("makes an email its own type rather than a deprecated method on a string", () => {
    expect(members("CurrentUserUpdateDTO")).toContain("email: z.email().max(255).optional(),");
    expect(members("UserAccountCreateDTO")).toContain("email: z.email().trim().min(1),");
    // `z.string().email()` is deprecated in zod 4, so the method form appears nowhere.
    for (const content of everything.files.values()) {
      expect(content).not.toContain("().email(");
    }
  });

  it("puts a length bound on the string and an item bound on the array", () => {
    expect(members("ValidationTestRequest")).toContain(
      "name: z.string().trim().min(1).min(2).max(50),",
    );
    expect(members("ApprovalLineTemplateCreateDTO")).toContain(
      "steps: z.array(ApprovalLineStepWriteDTOSchema).min(1),",
    );
    expect(members("SubscriptionRequest")).toContain(
      "subscriptions: z.array(SubscriptionItemSchema).max(100),",
    );
  });

  it("writes a pattern as a regular expression, escapes and all", () => {
    expect(members("UserAccountCreateDTO")).toContain(
      "mobile: z.string().regex(new RegExp(\"^[0-9+\\\\-\\\\s()]+$\")).optional(),",
    );
    expect(members("UserAccountCreateDTO")).toContain(
      "username: z.string().regex(new RegExp(\"^[a-zA-Z0-9._-]{4,20}$\")).min(4).max(20).optional(),",
    );
  });

  it("reads a numeric bound whichever annotation sent it", () => {
    // `@Min` sends a JSON number and `@DecimalMin` a JSON string of the same kind, so the bound
    // is coerced rather than interpolated.
    expect(members("FloorPlanPlacementUpdateDTO")).toContain(
      "horizontalRatio: z.number().min(0).max(100),",
    );
    expect(members("SafetyZonePolicyRuleUpdateDTO")).toContain("graceDays: z.int().nonnegative(),");
    expect(members("NumberingPreviewRequestDTO")).toContain(
      "sequence: z.int().positive().optional(),",
    );
  });

  it("reaches every constraint kind the capture carries", () => {
    const emitted = [...everything.files.values()].join("\n");
    for (const call of [
      ".trim().min(1)",
      ".max(",
      ".min(",
      ".regex(new RegExp(",
      "z.email()",
      ".nonnegative()",
      ".positive()",
    ]) {
      expect(emitted, call).toContain(call);
    }
  });
});

describe("generateSchemaFiles types a field the way the wire carries it", () => {
  it("keeps the format of a temporal field instead of widening it to a string", () => {
    expect(members("OrganizationListDTO")).toContain("lastSyncedAt: z.iso.datetime().optional(),");
    expect(members("HolidayDetailDTO")).toContain("holidayDate: z.iso.date().optional(),");
    expect(members("ShiftDTO")).toContain(
      'startTime: z.string().regex(new RegExp("^([01]\\\\d|2[0-3]):[0-5]\\\\d$")).optional(),',
    );
  });

  it("separates an integral number from a floating-point one", () => {
    // 925 of the 947 number fields are integral.
    expect(members("AreaCreateDTO")).toContain("sortOrder: z.int(),");
    expect(members("FloorPlanPlacementUpdateDTO")).toContain("verticalRatio: z.number().min(0).max(100),");
  });

  it("gives z.record the key schema SimpliX Meta does not carry", () => {
    // The one-argument call throws while the schema is built, so a module holding one of the 48
    // Map fields would not load at all.
    expect(members("AreaCreateDTO")).toContain(
      "areaNameI18n: z.record(z.string(), z.string()).optional(),",
    );
    for (const content of everything.files.values()) {
      expect(content).not.toMatch(/z\.record\(\s*z\.\w+\(\)\s*\)/);
    }
  });

  it("marks a field optional exactly when SimpliX Meta says it is not required", () => {
    expect(members("AreaCreateDTO")).toContain("areaKind: z.object({ value: z.enum(['AREA', 'ZONE']), label: z.string() }),");
    expect(members("AreaCreateDTO")).toContain("concurrentWorkerLimit: z.int().optional(),");
    // `nullable` carries nothing: the capture has no field where it differs from `!required`.
    for (const content of everything.files.values()) {
      expect(content).not.toContain(".nullable()");
    }
  });

  it("writes an enum's values out, so the scaffolder can read them", () => {
    // A response carries the labeled object and a request the bare value, matching the model.
    expect(members("AreaSearchDTO")).toContain("areaKind: z.enum(['AREA', 'ZONE']).optional(),");
    expect(members("AreaDetailDTO")).toContain(
      "areaKind: z.object({ value: z.enum(['AREA', 'ZONE']), label: z.string() }).optional(),",
    );
    // An unlabeled enum is the bare value on both sides.
    expect(members("SiteDetailDTO")).toContain(
      "weekStartDay: z.enum(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']).optional(),",
    );
  });

  it("falls back to the value on both sides when no profile supplies the wrapper", () => {
    const plain = generateSchemaFiles(domainOf(["space.Area"]));
    expect(members("AreaDetailDTO", plain)).toContain("areaKind: z.enum(['AREA', 'ZONE']).optional(),");
    for (const content of plain.files.values()) {
      expect(content).not.toContain("label: z.string()");
    }
  });

  it("erases a type parameter, because a constant has nowhere to declare one", () => {
    expect(members("SimpliXBaseEntity")).toEqual(["id: z.unknown().optional(),"]);
    expect(constant("Comparable")).toBe("export const ComparableSchema = z.object({});");
    // The five raw Java `List`s the model generator reports, and the one bound parameter.
    expect(everything.erasedTypeParams).toEqual([
      { type: "SimpliXBaseEntity", field: "id", param: "K" },
      { type: "ObligationApplicabilitySearchDTO", field: "appliedRules", param: "E" },
      { type: "ObligationApplicabilitySearchDTO", field: "excludedRules", param: "E" },
      { type: "PolicyParameterSearchDTO", field: "usedByScreenKeys", param: "E" },
      { type: "PreAssignmentGateSearchDTO", field: "notifyRoleCodes", param: "E" },
      { type: "RegulationDutySearchDTO", field: "additionalArticleRefs", param: "E" },
    ]);
    // A child filling its parent's parameter narrows the erased `z.unknown()`, which is the
    // generic being instantiated rather than a redeclaration that moved.
    expect(members("Organization")).toContain("id: z.string().optional(),");
  });
});

describe("generateSchemaFiles builds an inherited type on its parent", () => {
  it("extends the parent constant rather than repeating its fields", () => {
    expect(constant("AreaUpdateDTO")).toContain(
      "export const AreaUpdateDTOSchema = AreaCreateDTOSchema.extend({",
    );
    expect(members("AreaZoneUpdateFormDTO")).toEqual([
      "safetyZoneType: z.object({ value: z.enum(['CONFINED_SPACE', 'HOT_WORK', 'WORK_AT_HEIGHT', " +
        "'HIGH_VOLTAGE', 'HEAVY_LIFT', 'CHEMICAL', 'EXCAVATION', 'OTHER']), label: z.string() })" +
        ".optional(),",
    ]);
    expect(constant("AreaZoneUpdateFormDTO")).toContain(
      "AreaUpdateFormDTOSchema.extend({",
    );
  });

  it("declares a parent before the child that reads it", () => {
    // `.extend()` runs while the constant is built, so an interface's freedom of order is gone.
    const position = new Map(everything.order.map((base, at) => [base, at]));
    for (const type of domainOf(tags).types.values()) {
      const parent = type.meta.extends;
      if (!parent) continue;
      const childModule = moduleOf(type.name);
      const parentModule = moduleOf(parent);
      if (childModule === parentModule) {
        const content = file(type.name);
        expect(
          content.indexOf(`export const ${parent}Schema`),
          `${parent} after ${type.name} in ${childModule}`,
        ).toBeLessThan(content.indexOf(`export const ${type.name}Schema`));
        continue;
      }
      expect(
        position.get(parentModule) ?? -1,
        `${parentModule} after ${childModule}`,
      ).toBeLessThan(position.get(childModule) ?? -1);
    }
  });

  it("orders the deepest chain the capture holds, across the modules it is split over", () => {
    const chain = ["AreaCreateDTO", "AreaUpdateDTO", "AreaUpdateFormDTO", "AreaZoneUpdateFormDTO"];
    const position = new Map(everything.order.map((base, at) => [base, at]));
    const at = chain.map((name) => {
      const content = file(name);
      return [position.get(moduleOf(name)) ?? -1, content.indexOf(`export const ${name}Schema`)];
    });
    for (let step = 1; step < at.length; step++) {
      const [priorModule, priorOffset] = at[step - 1];
      const [module, offset] = at[step];
      expect(priorModule <= module, `${chain[step - 1]} after ${chain[step]}`).toBe(true);
      if (priorModule === module) expect(priorOffset).toBeLessThan(offset);
    }
  });

  it("re-exports the modules from the barrel in that same order", () => {
    const barrel = everything.files.get("schema/index.ts") ?? "";
    const exported = [...barrel.matchAll(/export \* from '\.\/(.+)\.schema';/g)].map((m) => m[1]);
    expect(exported).toEqual(everything.order);
    expect(exported).toHaveLength(129);
    expect(everything.moduleCycles).toEqual([]);
  });

  it("says nothing about a redeclared field the parent already agrees with", () => {
    // `Organization.eventPayloadData` restates `BaseEntity.eventPayloadData` identically, and
    // `.extend()` keeps the child's, so nothing is dropped and nothing is reported.
    expect(everything.divergentOverrides).toEqual([]);
    expect(members("Organization").filter((line) => line.startsWith("eventPayloadData:"))).toEqual([
      "eventPayloadData: z.record(z.string(), z.unknown()).optional(),",
    ]);
  });
});

describe("generateSchemaFiles defers a reference that would read itself", () => {
  it("wraps only the self-referencing member and annotates the constant", () => {
    expect(constant("OrganizationListDTO")).toContain(
      "export const OrganizationListDTOSchema: z.ZodType<OrganizationListDTO> = z.object({",
    );
    expect(members("OrganizationListDTO")).toContain(
      "children: z.array(z.lazy(() => OrganizationListDTOSchema)).optional(),",
    );
    // Every other member is written straight, so the deferral is the exception it should be.
    expect(members("OrganizationListDTO").filter((line) => line.includes("z.lazy"))).toHaveLength(1);
    expect(file("OrganizationListDTO")).toContain(
      "import type { OrganizationListDTO } from '../model/organizationListDTO';",
    );
  });

  it("finds the five self-referential types the capture holds and no mutual cycle", () => {
    const found = [...everything.recursiveSchemas].sort((left, right) =>
      left.type < right.type ? -1 : 1,
    );
    expect(found).toEqual([
      // Spring's own context, which a controller returning it drags into the closure.
      { type: "ApplicationContext", fields: ["parent"] },
      { type: "AreaNodeDTO", fields: ["children"] },
      { type: "LawScreenMapNodeDTO", fields: ["children"] },
      { type: "Organization", fields: ["parent"] },
      { type: "OrganizationListDTO", fields: ["children"] },
    ]);
    expect(domainOf(tags).types.get("ApplicationContext")?.owner).toBe("OAuth2 Social Login");
    // No two types reach each other, so every deferral above is a type reading itself.
    expect(everything.moduleCycles).toEqual([]);
  });
});

describe("generateSchemaFiles produces well-formed TypeScript that runs", () => {
  it("transpiles every emitted module without a syntax diagnostic", () => {
    for (const [path, content] of everything.files) {
      const transpiled = ts.transpileModule(content, { reportDiagnostics: true });
      expect(transpiled.diagnostics ?? [], path).toEqual([]);
    }
  });

  it("evaluates all 646 constants in the order they were emitted", () => {
    // Nothing but the order is under test here: a constant read before its declaration throws
    // `Cannot access … before initialization`, which is exactly the failure an interface cannot
    // have and a zod constant can.
    const schemas = evaluate(everything);
    expect(Object.keys(schemas)).toHaveLength(646);
    expect(schemas.AreaCreateDTOSchema).toBeInstanceOf(z.ZodType);
  });

  it("enforces the constraints it emitted", () => {
    const schemas = evaluate(everything);
    const area = schemas.AreaCreateDTOSchema;
    const valid = {
      siteId: "site-1",
      areaName: "1구역",
      areaKind: { value: "AREA", label: "구역" },
      sortOrder: 1,
      status: { value: "ACTIVE", label: "사용" },
    };
    expect(area.safeParse(valid).success).toBe(true);
    expect(area.safeParse({ ...valid, areaName: "   " }).success).toBe(false);
    expect(area.safeParse({ ...valid, areaName: "x".repeat(201) }).success).toBe(false);
    expect(area.safeParse({ ...valid, sortOrder: 1.5 }).success).toBe(false);
    expect(area.safeParse({ ...valid, areaNameI18n: { ko: "1구역" } }).success).toBe(true);
    expect(area.safeParse({ ...valid, areaKind: "AREA" }).success).toBe(false);

    // A request-only type carries the bare value, which is the other half of the same rule.
    const placement = schemas.FloorPlanPlacementUpdateDTOSchema;
    const placed = {
      targetType: "AREA",
      targetId: "a-1",
      markShape: "PIN",
      horizontalRatio: 50,
      verticalRatio: 50,
      markedUnplaceable: false,
    };
    expect(placement.safeParse(placed).success).toBe(true);
    expect(placement.safeParse({ ...placed, horizontalRatio: 100.5 }).success).toBe(false);

    expect(schemas.ShiftDTOSchema.safeParse({ startTime: "09:30" }).success).toBe(true);
    expect(schemas.ShiftDTOSchema.safeParse({ startTime: "24:30" }).success).toBe(false);
    // The format SimpliX Meta carries is a Java time format, not a regular expression.
    expect(schemas.ShiftDTOSchema.safeParse({ startTime: "HH:mm" }).success).toBe(false);
  });

  it("parses a tree through the deferred reference", () => {
    const schemas = evaluate(everything);
    const parsed = schemas.OrganizationListDTOSchema.safeParse({
      orgId: "root",
      children: [{ orgId: "child", children: [{ orgId: "grandchild" }] }],
    });
    expect(parsed.success).toBe(true);
  });
});

describe("generateSchemaFiles keeps the CRUD scaffolder working", () => {
  it("is found and read by the scaffolder's own search", async () => {
    // A module the search does not open sends the scaffolder to its placeholder field set, which
    // it uses with a spinner and no warning — every migrated domain would appear to succeed.
    const root = await mkdtemp(join(tmpdir(), "meta-schema-gen-"));
    try {
      const generated = generateSchemaFiles(domainOf(["space.Area", "site.AreaZone"]), {
        labeledEnum,
      });
      for (const [path, content] of generated.files) {
        const full = join(root, "packages", "space", "src", "generated", path);
        await mkdir(dirname(full), { recursive: true });
        await writeFile(full, content, "utf-8");
      }

      const found = await findSchemaFile(root, "area");
      expect(found?.path).toMatch(/[/]src[/]generated[/]schema[/]\w+\.schema\.ts$/);

      const fields = parseSchemaFields(found?.content ?? "", "area");
      const named = fields.map((field) => field.name);
      expect(named).toContain("areaName");
      expect(named).toContain("status");
      // An enum written out at the site is what makes a select rather than a text box; a
      // constant holding the same values would leave the scaffolder nothing to read.
      expect(fields.find((field) => field.name === "areaKind")?.options).toEqual(["AREA", "ZONE"]);
      expect(fields.find((field) => field.name === "createdAt")?.formComponent).toBe("DateField");
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("counts the entities whose DTOs are named after something other than their tag", () => {
    // The search is by name — `\w*<entity>\w*[Ss]chema = z.object` — so an entity none of whose
    // DTOs carry its name is found by nothing, whatever the file is called. Seventeen of the 139
    // tags are in that position, `site.AreaZone` among them, and a domain built on one of those
    // scaffolds from placeholders rather than from the capture.
    const emitted = [...everything.files.values()].join("\n");
    const owning = new Set([...domainOf(tags).types.values()].map((type) => type.owner));
    const nameless = tags
      .filter((tag) => owning.has(tag))
      .map(schemaFileBase)
      .filter((base) => {
        const pattern = new RegExp(`\\w*${base}\\w*[Ss]chema\\s*=\\s*(?:z|zod)\\.object`, "i");
        return !pattern.test(emitted);
      });
    expect(nameless).toHaveLength(17);
    expect(nameless).toContain("areaZone");
    expect(nameless).not.toContain("area");
    expect(nameless).not.toContain("organization");
    expect(nameless).not.toContain("userAccount");
  });
});

describe("generateSchemaFiles on what the capture does not carry", () => {
  /** Small enough that every assertion below can be read off the literal. */
  function handBuilt(constraints: DtoMeta["types"]["x"]["fields"][number]["constraints"]): DtoMeta {
    return {
      version: 1,
      enums: {},
      types: {
        Ticket: {
          javaClass: "app.Ticket",
          typeParams: [],
          fields: [
            { name: "note", type: { kind: "string" }, required: true, nullable: false, constraints },
            { name: "photo", type: { kind: "binary" }, required: false, nullable: true },
            {
              name: "tags",
              type: { kind: "container", name: "List", args: [{ kind: "string" }] },
              required: false,
              nullable: true,
              constraints: [{ kind: "minItems", value: 2 }],
            },
            {
              name: "page",
              type: { kind: "container", name: "Page", args: [{ kind: "string" }] },
              required: false,
              nullable: true,
            },
            {
              name: "summary",
              type: { kind: "pick", of: "Ticket", fields: ["note"] },
              required: false,
              nullable: true,
            },
          ],
        },
      },
      operations: [
        {
          id: "getTicket",
          method: "GET",
          path: "/ticket",
          tag: "shop.Ticket",
          access: { kind: "public" },
          response: { kind: "ref", name: "Ticket" },
          request: { query: [], path: [] },
        },
      ],
    };
  }

  function shop(source: DtoMeta): ResolvedDomain {
    const resolved = resolveMeta(source, { domains: { shop: ["shop.Ticket"] }, containerTypes });
    const domain = resolved.domains.get("shop");
    if (!domain) throw new Error("the hand-built domain is missing");
    return domain;
  }

  it("refuses a constraint kind it was never taught, rather than dropping it", () => {
    // The backend's extractor emits a closed vocabulary of seventeen kinds, so an unknown one is
    // a backend change — and silently skipping it is how a constraint stops reaching the client.
    expect(() => generateSchemaFiles(shop(handBuilt([{ kind: "creditCard" }])))).toThrow(
      "Unrecognised constraint kind 'creditCard' on Ticket.note",
    );
  });

  it("names a server-only check in a comment and in the report, and calls nothing", () => {
    const generated = generateSchemaFiles(shop(handBuilt([{ kind: "custom", name: "UniqueCode" }])));
    const content = generated.files.get("schema/ticket.schema.ts") ?? "";
    expect(content).toContain("  // Checked on the server only: UniqueCode.\n  note: z.string(),");
    expect(generated.serverOnlyConstraints).toEqual([
      { type: "Ticket", field: "note", name: "UniqueCode" },
    ]);
  });

  it("asserts a boolean as the literal it is asserted to be", () => {
    const agreed = generateSchemaFiles(shop(handBuilt([{ kind: "assertTrue" }])));
    expect(agreed.files.get("schema/ticket.schema.ts")).toContain("note: z.literal(true),");
    const refused = generateSchemaFiles(shop(handBuilt([{ kind: "assertFalse" }])));
    expect(refused.files.get("schema/ticket.schema.ts")).toContain("note: z.literal(false),");
  });

  it("emits the remaining sign checks and a lower item bound", () => {
    const generated = generateSchemaFiles(
      shop(handBuilt([{ kind: "negative" }, { kind: "nonpositive" }])),
    );
    const content = generated.files.get("schema/ticket.schema.ts") ?? "";
    expect(content).toContain("note: z.string().negative().nonpositive(),");
    expect(content).toContain("tags: z.array(z.string()).min(2).optional(),");
  });

  it("takes a container's factory and its module from the profile", () => {
    const content = generateSchemaFiles(shop(handBuilt([]))).files.get("schema/ticket.schema.ts") ?? "";
    expect(content).toContain(
      "import { pageOf } from '@simplix-react-ext/simplix-boot-auth';",
    );
    expect(content).toContain("page: pageOf(z.string()).optional(),");
  });

  it("subsets a type with pick, and parses a file as a blob", () => {
    const content = generateSchemaFiles(shop(handBuilt([]))).files.get("schema/ticket.schema.ts") ?? "";
    expect(content).toContain("photo: z.instanceof(Blob).optional(),");
    expect(content).toContain("summary: z.lazy(() => TicketSchema).pick({ note: true }).optional(),");
  });

  it("refuses a time format field it cannot turn into a pattern", () => {
    const source = handBuilt([]);
    source.types.Ticket.fields.push({
      name: "at",
      type: { kind: "time", pattern: "hh:mm a" },
      required: false,
      nullable: true,
    });
    expect(() => generateSchemaFiles(shop(source))).toThrow(
      "Unrecognised time format field 'hh' in 'hh:mm a' on Ticket.at",
    );
  });

  it("reports a redeclared field whose shape moved", () => {
    const source: DtoMeta = {
      version: 1,
      enums: {},
      types: {
        Base: {
          javaClass: "app.Base",
          typeParams: [],
          fields: [{ name: "code", type: { kind: "string" }, required: false, nullable: true }],
        },
        Child: {
          javaClass: "app.Child",
          extends: "Base",
          typeParams: [],
          fields: [
            { name: "code", type: { kind: "number", integral: true }, required: true, nullable: false },
          ],
        },
      },
      operations: [
        {
          id: "getChild",
          method: "GET",
          path: "/child",
          tag: "shop.Ticket",
          access: { kind: "public" },
          response: { kind: "ref", name: "Child" },
          request: { query: [], path: [] },
        },
      ],
    };
    const generated = generateSchemaFiles(shop(source));
    expect(generated.divergentOverrides).toEqual([
      { type: "Child", field: "code", inherited: "Base" },
    ]);
    expect(generated.files.get("schema/ticket.schema.ts")).toContain(
      "export const ChildSchema = BaseSchema.extend({\n  code: z.int(),\n});",
    );
  });

  it("spells a colliding tag out, and refuses one that collides even then", () => {
    const twoTags = (left: string, right: string): DtoMeta => ({
      version: 1,
      enums: {},
      types: {
        Ticket: {
          javaClass: "app.Ticket",
          typeParams: [],
          fields: [{ name: "id", type: { kind: "string" }, required: true, nullable: false }],
        },
      },
      operations: [left, right].map((tag, at) => ({
        id: `get${at}`,
        method: "GET" as const,
        path: `/${at}`,
        tag,
        access: { kind: "public" as const },
        response: { kind: "ref" as const, name: "Ticket" },
        request: { query: [], path: [] },
      })),
    });

    const source = twoTags("one.Ticket", "two.Ticket");
    const resolved = resolveMeta(source, {
      domains: { both: ["one.Ticket", "two.Ticket"] },
      containerTypes,
    });
    const generated = generateSchemaFiles(resolved.domains.get("both")!);
    expect([...generated.files.keys()]).toContain("schema/oneTicket.schema.ts");

    const clashing = twoTags("x.Auth Token", "x.AuthToken");
    const both = resolveMeta(clashing, {
      domains: { both: ["x.Auth Token", "x.AuthToken"] },
      containerTypes,
    });
    expect(() => generateSchemaFiles(both.domains.get("both")!)).toThrow(
      "both name the schema module 'xAuthToken'",
    );
  });

  it("refuses a cycle that runs through a heritage clause", () => {
    const source: DtoMeta = {
      version: 1,
      enums: {},
      types: {
        Parent: {
          javaClass: "app.Parent",
          typeParams: [],
          fields: [{ name: "child", type: { kind: "ref", name: "Child" }, required: false, nullable: true }],
        },
        Child: {
          javaClass: "app.Child",
          extends: "Parent",
          typeParams: [],
          fields: [],
        },
      },
      operations: [
        {
          id: "getParent",
          method: "GET",
          path: "/parent",
          tag: "shop.Ticket",
          access: { kind: "public" },
          response: { kind: "ref", name: "Parent" },
          request: { query: [], path: [] },
        },
      ],
    };
    // The field reference is the one deferred, so the heritage clause still reads a built parent.
    const generated = generateSchemaFiles(shop(source));
    expect(generated.recursiveSchemas).toEqual([{ type: "Parent", fields: ["child"] }]);
    const content = generated.files.get("schema/ticket.schema.ts") ?? "";
    expect(content.indexOf("const ParentSchema")).toBeLessThan(content.indexOf("const ChildSchema"));
  });
});

/**
 * Every emitted constant, evaluated against the real zod in the order the modules were written.
 *
 * The imports are dropped and the modules concatenated, so the only thing keeping a constant from
 * reading an unbound name is the order this generator put them in.
 */
function evaluate(generated: SchemaGenResult): Record<string, z.ZodType> {
  const source = generated.order
    .map((base) => generated.files.get(`schema/${base}.schema.ts`) ?? "")
    .join("\n")
    .split("\n")
    .filter((line) => !line.startsWith("import "))
    .map((line) => (line.startsWith("export const ") ? line.slice("export ".length) : line))
    .join("\n");

  const declared = [...source.matchAll(/^const (\w+)/gm)].map((match) => match[1]);
  const compiled = ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2022 },
  }).outputText;

  const build = new Function("z", `${compiled}\nreturn { ${declared.join(", ")} };`);
  return build(z) as Record<string, z.ZodType>;
}
