import { mkdtemp, mkdir, rm, readFile, writeFile } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { describe, it, expect } from "vitest";
import type { DtoMeta, FieldMeta, OperationMeta, TypeRef } from "../meta/types.js";
import type { OpenApiNamingStrategy } from "../openapi/naming/naming-strategy.js";
import type { ContainerMapping } from "../openapi/orchestration/spec-profile.js";
import { resolveMeta, type ResolvedDomain } from "../meta/resolve.js";
import { resolveEndpoints } from "../meta/generation/endpoint-gen.js";
import {
  canRegenerateMockEntry,
  generateMockFiles,
  mswPattern,
  MOCK_GENERATED_MARKER,
  MOCK_OVERRIDE_MARKER,
  type MockGenResult,
} from "../meta/generation/mock-gen.js";
import { smartSafetyDomains } from "../meta/__fixtures__/smart-safety-domains.js";

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

/** The other half of what the profile contributes, loaded from the extension it lives in. */
const namingModule = fileURLToPath(
  new URL("../../../../extensions/simplix-boot/packages/cli-plugin/src/naming.ts", import.meta.url),
);
const { simplixBootNaming } = (await import(namingModule)) as {
  simplixBootNaming: OpenApiNamingStrategy;
};

/** What the profile's response adapter wraps a mock body in. */
const envelope = { wrap: "wrapEnvelope", import: "@simplix-react-ext/simplix-boot-auth" };

/** What the boot profile contributes: without it the model declares every enum as its value union,
 *  and a seed row annotated with that type must carry the value rather than the object. */
const LABELED_ENUM = {
  ts: "LabeledEnumValue",
  import: "@simplix-react-ext/simplix-boot-utils",
};

const resolved = resolveMeta(meta, { domains: smartSafetyDomains, containerTypes });

function domainOf(name: string): ResolvedDomain {
  const domain = resolved.domains.get(name);
  if (!domain) throw new Error(`the fixture has no domain named ${name}`);
  return domain;
}

/** Every domain generated once, since almost every census below runs across all thirteen. */
const generated = new Map<string, MockGenResult>(
  [...resolved.domains].map(([name, domain]) => [
    name,
    generateMockFiles(domain, { naming: simplixBootNaming, envelope, labeledEnum: LABELED_ENUM }),
  ]),
);

function handlersOf(domain: string): string {
  const content = generated.get(domain)?.files.get("mock/handlers.ts");
  if (content === undefined) throw new Error(`no handler module was emitted for ${domain}`);
  return content;
}

/** The factory bodies of a module, keyed by the entity each is named for. */
function factoriesOf(content: string): Map<string, string> {
  const bodies = new Map<string, string>();
  // Split on the doc comment each factory opens with, so the next one's comment is not read as
  // part of this one's body.
  for (const block of content.split(/(?=\/\*\* Handlers for )/)) {
    const name = /export function create(\w+)Handlers/.exec(block)?.[1];
    if (name) bodies.set(name, block);
  }
  return bodies;
}

function factoryOf(domain: string, entity: string): string {
  const body = factoriesOf(handlersOf(domain)).get(entity);
  if (body === undefined) throw new Error(`${domain} emitted no factory for ${entity}`);
  return body;
}

/** The MSW patterns of a module, in the order they are registered. */
function patternsOf(content: string): string[] {
  return routesOf(content).map((route) => route.pattern);
}

/** The routes a module registers, method included — two of them can share one pattern. */
function routesOf(content: string): { method: string; pattern: string }[] {
  return [...content.matchAll(/^ {4}http\.([a-z]+)\("([^"]+)"/gm)].map((match) => ({
    method: match[1],
    pattern: match[2],
  }));
}

/**
 * The one line a route's handler is emitted on, or the block it opens.
 *
 * <p>Several methods share one path, so a pattern alone does not name a handler — pass `method`
 * where the route has more than one.
 */
function handlerFor(content: string, pattern: string, method?: string): string {
  const needle = method ? `http.${method.toLowerCase()}("${pattern}"` : `"${pattern}"`;
  const at = content.indexOf(needle);
  if (at === -1) throw new Error(`no handler answers ${method ?? ""} ${pattern}`.trim());
  const start = content.lastIndexOf("\n", at) + 1;
  const end = content.indexOf("\n    http.", at);
  return content.slice(start, end === -1 ? content.indexOf("\n  ];", at) : end);
}

/** The seed rows of one entity's array, as the text between its brackets. */
function seedArrayOf(seeds: string, entity: string): string {
  const opened = new RegExp(`export const ${entity}Seeds: \\w+\\[\\] = \\[`).exec(seeds);
  if (!opened) throw new Error(`the seed file declares no ${entity}Seeds`);
  const start = opened.index + opened[0].length;
  return seeds.slice(start, seeds.indexOf("\n];", start));
}

/** The member names one seed row carries. */
function seededMembers(row: string): string[] {
  return [...row.matchAll(/^ {4}(\w+): /gm)].map((match) => match[1]);
}

const HANDLED_ROLES = new Set([
  "list",
  "getAll",
  "search",
  "get",
  "create",
  "update",
  "delete",
  "batchDelete",
  "batchUpdate",
  "multiUpdate",
  "getForEdit",
  "tree",
  "subtree",
  "order",
]);

describe("SimpliX Meta's `{param}` paths become MSW's `:param`, and the conversion precedes the sort", () => {
  it("states every one of the fixture's 311 path parameters in brace form", () => {
    const stated = meta.operations.flatMap((operation) =>
      operation.request.path.map((param) => operation.path.includes(`{${param.name}}`)),
    );
    expect(stated).toHaveLength(311);
    expect(stated.every(Boolean)).toBe(true);
    // Nothing in the document is spelled the way MSW spells it, so a rule keyed on `:` reads
    // every path as parameterless.
    expect(meta.operations.filter((operation) => operation.path.includes(":"))).toEqual([]);
  });

  it("leaves no brace form in any emitted pattern", () => {
    for (const [name, result] of generated) {
      for (const pattern of patternsOf(handlersOf(name))) {
        expect(pattern, `${name} ${pattern}`).not.toMatch(/[{}]/);
      }
      expect(result.files.size).toBe(1);
    }
  });

  it("prefixes the origin and converts each parameter", () => {
    expect(mswPattern("/api/v1/admin/org/{orgId}")).toBe("*/api/v1/admin/org/:orgId");
    expect(mswPattern("/api/v1/admin/site/{siteId}/area/{areaId}")).toBe(
      "*/api/v1/admin/site/:siteId/area/:areaId",
    );
    expect(mswPattern("/api/v1/admin/org/tree")).toBe("*/api/v1/admin/org/tree");
  });

  it("registers `/area-zone/tree` before `/area-zone/{areaId}`, which the document orders the other way", () => {
    const areaZone = domainOf("site").entities.find((one) => one.tag === "site.AreaZone");
    const order = (path: string): number =>
      (areaZone?.operations ?? []).findIndex(
        (operation) => operation.method === "GET" && operation.path === path,
      );
    // The document puts the detail route first, so preserving its order hands the tree request to
    // the handler that reads one record by id — MSW answers with the first match.
    expect(order("/api/v1/admin/area-zone/{areaId}")).toBe(0);
    expect(order("/api/v1/admin/area-zone/tree")).toBeGreaterThan(0);

    const patterns = patternsOf(factoryOf("site", "AreaZone"));
    expect(patterns.indexOf("*/api/v1/admin/area-zone/tree")).toBeLessThan(
      patterns.indexOf("*/api/v1/admin/area-zone/:areaId"),
    );
  });

  it("rescues all 57 routes the document declares behind one that would swallow them", () => {
    const shadowed: string[] = [];
    for (const domain of resolved.domains.values()) {
      for (const entity of domain.entities) {
        entity.operations.forEach((held, at) => {
          if (held.request.path.length === 0) return;
          const matches = new RegExp(`^${held.path.replace(/\{\w+\}/g, "[^/]+")}$`);
          for (const later of entity.operations.slice(at + 1)) {
            if (later.method !== held.method || later.request.path.length > 0) continue;
            if (matches.test(later.path)) shadowed.push(`${later.method} ${later.path}`);
          }
        });
      }
    }
    expect(shadowed).toHaveLength(57);
    expect(shadowed).toContain("GET /api/v1/admin/audit-log/search");

    // Every one of them is registered before the route whose pattern would have answered first.
    for (const [name] of generated) {
      for (const [entity, body] of factoriesOf(handlersOf(name))) {
        const routes = routesOf(body);
        for (const [at, route] of routes.entries()) {
          if (!route.pattern.includes("/:")) continue;
          const matches = new RegExp(
            `^${route.pattern.replace(/:\w+/g, "[^/]+").replace("*", "\\*")}$`,
          );
          for (const later of routes.slice(at + 1)) {
            if (later.method !== route.method) continue;
            expect(
              matches.test(later.pattern),
              `${name}/${entity}: ${route.pattern} shadows ${later.pattern}`,
            ).toBe(false);
          }
        }
      }
    }
  });

  it("puts every parameterless route of an entity before every parameterised one", () => {
    for (const [name] of generated) {
      for (const [entity, body] of factoriesOf(handlersOf(name))) {
        const parameterised = patternsOf(body).map((pattern) => pattern.includes("/:"));
        const first = parameterised.indexOf(true);
        if (first === -1) continue;
        expect(
          parameterised.slice(first).every(Boolean),
          `${name}/${entity} interleaves a parameterless route after a parameterised one`,
        ).toBe(true);
      }
    }
  });
});

describe("every operation of a domain gets a handler, not only the CRUD roles", () => {
  it("emits one handler per operation, 621 across the thirteen domains", () => {
    let handlers = 0;
    let operations = 0;
    for (const [name, domain] of resolved.domains) {
      const emitted = patternsOf(handlersOf(name)).length;
      expect(emitted, name).toBe(domain.operations.length);
      handlers += emitted;
      operations += domain.operations.length;
    }
    expect(handlers).toBe(621);
    expect(operations).toBe(621);
  });

  it("answers the 138 operations whose role is none of the fourteen", () => {
    let outside = 0;
    for (const domain of resolved.domains.values()) {
      for (const entity of resolveEndpoints(domain, simplixBootNaming)) {
        for (const target of entity.targets) {
          if (!HANDLED_ROLES.has(target.role)) outside += 1;
        }
      }
    }
    expect(outside).toBe(138);

    // A custom action carries no role the switch knows, and a route MSW does not answer is passed
    // through to a server that is not running.
    expect(patternsOf(handlersOf("notification"))).toContain(
      "*/api/v1/admin/notification/:notificationId/escalate",
    );
    expect(patternsOf(handlersOf("auth"))).toContain(
      "*/api/v1/admin/auth/session/:authSessionId/revoke",
    );
    expect(patternsOf(handlersOf("system"))).toContain("*/api/v1/system/notice-dismissals/dismiss");
  });
});

describe("the identifier and its type are read from SimpliX Meta, never guessed from a field name", () => {
  it("stores an audit log under `auditLogId`, which the name heuristic misses", () => {
    // `AuditLogDetailDTO` declares `auditEventId` before `auditLogId`, so the first field ending
    // in `Id` is the wrong key — and a store keyed on it matches no request.
    const fields = domainOf("audit").types.get("AuditLogDetailDTO")?.allFields ?? [];
    const firstIdLike = fields.find((field) => /[A-Za-z]Id$/.test(field.name))?.name;
    expect(firstIdLike).toBe("auditEventId");

    // Nothing deletes an audit log, so the read of one is where the key is stated.
    const auditLogRead = meta.operations.find(
      (operation) => operation.tag === "audit.AuditLog" && operation.path.endsWith("{auditLogId}"),
    );
    expect(auditLogRead?.request.path.at(-1)?.name).toBe("auditLogId");

    const entry = generated.get("audit")?.entry ?? "";
    expect(entry).toContain('createMockEntityStore<AuditLogDetailDTO>(auditLogSeeds, "auditLogId")');
    expect(entry).not.toContain('auditLogSeeds, "auditEventId"');
  });

  it("reads a string parameter as text — all 210 of them, and none as a number", () => {
    let asText = 0;
    for (const [name] of generated) {
      const content = handlersOf(name);
      asText += [...content.matchAll(/String\(params\./g)].length;
      // 310 of the document's 311 path parameters are strings, and `Number("ORG-001")` is `NaN`:
      // the lookup misses and the fallback answers with the first row for every id.
      expect(content, name).not.toContain("Number(params.");
    }
    expect(asText).toBe(210);
  });

  it("reads a numeric parameter as a number when SimpliX Meta says so", () => {
    const numbered = generateMockFiles(handBuiltDomain("shop"), {
      naming: simplixBootNaming,
      labeledEnum: LABELED_ENUM,
      envelope,
    });
    expect(numbered.files.get("mock/handlers.ts")).toContain("Number(params.ticketId)");
  });

  it("reads a singleton's key through a cast, since its DTO declares none", () => {
    // A settings document is read and written whole and carries no identifier; `body.id` against
    // one does not compile.
    const casts = [...handlersOf("system").matchAll(/const key = \(body as \{ (\w+)\?/g)];
    expect(casts.map((match) => match[1])).toEqual(["id"]);

    for (const [name] of generated) {
      for (const [, body] of factoriesOf(handlersOf(name))) {
        const type = /MockEntityStore<(\w+)>/.exec(body)?.[1];
        const direct = /const key = body\.(\w+)!/.exec(body)?.[1];
        if (!type || !direct) continue;
        const declared = fieldsOf(name, type).find((field) => field.name === direct);
        expect(declared?.type.kind, `${type}.${direct}`).toMatch(/^(string|number)$/);
      }
    }
  });
});

describe("a handler filters by a path parameter only when the store's DTO declares it", () => {
  it("names no property the store's own type is missing — all 123 references", () => {
    let references = 0;
    for (const [name] of generated) {
      for (const [entity, body] of factoriesOf(handlersOf(name))) {
        const type = /MockEntityStore<(\w+)>/.exec(body)?.[1];
        if (!type) continue;
        for (const match of body.matchAll(/item\.(\w+)/g)) {
          references += 1;
          expect(
            fieldsOf(name, type).some((field) => field.name === match[1]),
            `${name}/${entity}: ${type} has no ${match[1]}`,
          ).toBe(true);
        }
      }
    }
    expect(references).toBe(123);
  });

  it("answers with the whole list where the parameter names no field of the store", () => {
    // `AuditLogDetailDTO` has no `auditLogId`-shaped child, so a filter on it matches nothing and
    // the `?? list()[0]` behind it shows one arbitrary row for every parent.
    const sameTarget = handlerFor(
      factoryOf("audit", "AuditLog"),
      "*/api/v1/admin/audit-log/:auditLogId/same-target",
    );
    expect(sameTarget).toContain("store.list()");
    expect(sameTarget).not.toContain("item.auditLogId");

    const reported = [...generated.values()].flatMap((one) => one.unmatchableParameters);
    expect(reported).toHaveLength(6);
    expect(reported).toContainEqual({
      tag: "audit.AuditLog",
      operation: "AuditLogRest_sameTarget",
      parameter: "auditLogId",
      storeType: "AuditLogDetailDTO",
    });
  });

  it("filters where the store's DTO does declare the parameter", () => {
    const onCall = handlerFor(
      factoryOf("notification", "EmergencyContact"),
      "*/api/v1/admin/emergency-contact/:emergencyContactId/on-call",
    );
    expect(onCall).toContain(
      "store.filter((item) => String(item.emergencyContactId) === String(params.emergencyContactId))",
    );
    // The route returns a list of cells, so the answer is the matches rather than the first one.
    expect(onCall).not.toContain("?? store.list()[0]");
  });

  it("reads one record by id where the route addresses one", () => {
    const detail = handlerFor(
      factoryOf("site", "WorkPoint"),
      "*/api/v1/admin/work-point/:workPointId",
      "get",
    );
    expect(detail).toContain("store.getById(String(params.workPointId)) ?? store.list()[0]");
  });
});

describe("a reorder writes the field its own body declares", () => {
  it("writes `priority` for a role permission, which no fallback name would have found", () => {
    const order = domainOf("user").types.get("AuthRolePermissionOrderUpdateDTO");
    expect(order?.allFields.map((field) => field.name)).toEqual(["rolePermissionId", "priority"]);
    for (const name of ["displayOrder", "sortOrder", "orderIndex"]) {
      expect(fieldsOf("user", "AuthRolePermissionDetailDTO").some((f) => f.name === name)).toBe(
        false,
      );
    }

    const handler = handlerFor(
      factoryOf("user", "AuthRolePermission"),
      "*/api/v1/admin/auth/role-permission/order",
    );
    expect(handler).toContain(
      "const items = await request.json() as { rolePermissionId: string; priority: number }[];",
    );
    expect(handler).toContain("store.update(item.rolePermissionId, { priority: item.priority })");
    // The store's DTO carries the field, so nothing here is cast past the type checker.
    expect(handler).not.toContain("as never");
    expect(handler).not.toContain("displayOrder");
  });

  it("resolves the field for all eleven reorder entities, and reports none", () => {
    let reorders = 0;
    for (const [name] of generated) {
      reorders += [...handlersOf(name).matchAll(/^ {4}http\.\w+\("[^"]*\/order"/gm)].length;
      expect(generated.get(name)?.unresolvedOrderFields, name).toEqual([]);
    }
    expect(reorders).toBe(11);
  });

  it("reports a reorder body that names no field, rather than writing a literal", () => {
    const result = generateMockFiles(handBuiltDomain("shop"), {
      naming: simplixBootNaming,
      labeledEnum: LABELED_ENUM,
      envelope,
    });
    expect(result.unresolvedOrderFields).toEqual([
      { tag: "shop.Ticket", operation: "reorderTickets" },
    ]);
    const handler = handlerFor(
      result.files.get("mock/handlers.ts") ?? "",
      "*/api/v1/shop/ticket/order",
    );
    expect(handler).toContain("HttpResponse.json(wrapEnvelope({}))");
    expect(handler).not.toContain("displayOrder");
  });
});

describe("the store's DTO is derived from what a response carries", () => {
  it("holds what a list answers with where no route addresses one record", () => {
    // `notification.NotificationCentre` has no `/{id}` read. Its other bare-reference GETs are a
    // sub-resource and a census — different shapes under the same tag — so reading the first of
    // them typed the store by the census while its rows are notifications.
    const factory = factoryOf("notification", "NotificationCentre");
    expect(/MockEntityStore<(\w+)>/.exec(factory)?.[1]).toBe("NotificationListDTO");
  });

  it("lands on the six types the application's own site package uses", () => {
    const site = factoriesOf(handlersOf("site"));
    const typeOf = (entity: string): string | undefined =>
      /MockEntityStore<(\w+)>/.exec(site.get(entity) ?? "")?.[1];

    expect(typeOf("WorkPoint")).toBe("WorkPointDetailDTO");
    expect(typeOf("LinearAsset")).toBe("LinearAssetDetailDTO");
    expect(typeOf("EquipmentInspection")).toBe("EquipmentInspectionDTO");
    expect(typeOf("AreaZone")).toBe("AreaZoneDetailDTO");
    expect(typeOf("SiteOnboarding")).toBe("SiteOnboardingDTO");
    // Its detail is an owned singleton whose route takes a custom role, so no `get` names it and
    // only the response does.
    expect(typeOf("SafetyZonePolicy")).toBe("SafetyZonePolicyDTO");
    expect(
      domainOf("site").entities
        .find((one) => one.tag === "site.SafetyZonePolicy")
        ?.operations.map((one) => one.method),
    ).toEqual(["GET", "PUT"]);
  });

  it("prefers the route that addresses one record over the form that edits it", () => {
    // The document declares `/org/{orgId}/edit` first, and its `OrganizationUpdateFormDTO` is not
    // the record the screens read.
    const first = domainOf("org").entities.find((one) => one.tag === "org.Organization")
      ?.operations[0];
    expect(first?.path).toBe("/api/v1/admin/org/{orgId}/edit");
    expect(/MockEntityStore<(\w+)>/.exec(factoryOf("org", "Organization"))?.[1]).toBe(
      "OrganizationDetailDTO",
    );
  });

  it("types no store `unknown`, and reports the two entities nothing resolved", () => {
    const unresolved = [...generated.values()].flatMap((one) => one.unresolvedStoreTypes);
    expect(unresolved).toEqual([
      { tag: "system.ExportDownload", roles: ["getAll"] },
      { tag: "public.user.Avatar", roles: ["getAll"] },
    ]);

    for (const [name] of generated) {
      expect(handlersOf(name), name).not.toContain("MockEntityStore<unknown>");
      // An entity with no type takes no store at all, and every route of it answers empty.
      for (const [, body] of factoriesOf(handlersOf(name))) {
        if (body.includes("MockEntityStore<")) continue;
        expect(body).not.toContain("store.");
      }
    }
  });
});

describe("a seed row carries the shape the type it is annotated with declares", () => {
  it("writes a `List` as an empty array and leaves a `Map` out", () => {
    let lists = 0;
    let maps = 0;
    for (const [name, domain] of resolved.domains) {
      const seeds = generated.get(name)?.seeds ?? "";
      for (const [entity, body] of factoriesOf(handlersOf(name))) {
        const type = /MockEntityStore<(\w+)>/.exec(body)?.[1];
        if (!type) continue;
        const row = seedArrayOf(seeds, entity.charAt(0).toLowerCase() + entity.slice(1));
        const members = new Set(seededMembers(row));
        for (const field of domain.types.get(type)?.allFields ?? []) {
          if (field.type.kind !== "container") continue;
          if (field.type.name === "Map") {
            maps += 1;
            // A `Map` is `Record<string, string>` in the model, and `[]` against it is a type
            // error in a file the CLI never regenerates.
            expect(members.has(field.name), `${type}.${field.name}`).toBe(false);
          } else {
            lists += 1;
            expect(row, `${type}.${field.name}`).toContain(`${field.name}: []`);
          }
        }
      }
    }
    expect(maps).toBe(6);
    expect(lists).toBeGreaterThan(0);
  });

  it("carries the bare value when no profile states a wrapper, as the model then declares it", () => {
    // The model spells a labeled enum with the profile's wrapper and falls back to the value union
    // without it. A seed row is annotated with that type, so both halves take the same gate — one
    // reading `labeled` while the other read the profile is how the pair stopped compiling.
    const bare = generateMockFiles(handBuiltDomain("shop"), {
      naming: simplixBootNaming,
      envelope,
    });
    expect(bare.seeds).not.toMatch(/\{ value: "[A-Z_]+", label: "[A-Z_]+" \}/);
  });

  it("writes a labeled enum as the object a response carries", () => {
    const seeds = generated.get("space")?.seeds ?? "";
    const first = seedArrayOf(seeds, "area").split("\n  },")[0];
    expect(first).toMatch(/areaKind: \{ value: "\w+", label: "\w+" \}/);
    expect(domainOf("space").enums.get("AreaKind")?.meta.labeled).toBe(true);

    // 122 of the document's 133 enums are labeled, and a bare string against one is a value of
    // the wrong shape in every row of every seed array.
    const labeled = Object.values(meta.enums).filter((one) => one.labeled);
    expect(labeled).toHaveLength(122);
  });

  it("writes a moment, a day and a clock time each as its own text", () => {
    const seeds = generated.get("org")?.seeds ?? "";
    expect(seeds).toMatch(/createdAt: "\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z"/);

    const handBuilt = generateMockFiles(handBuiltDomain("shop"), {
      naming: simplixBootNaming,
      labeledEnum: LABELED_ENUM,
      envelope,
    });
    expect(handBuilt.seeds).toMatch(/openedOn: "\d{4}-\d{2}-\d{2}"/);
    // A `time` matches neither format, and the generic `<entity>-<field>-<n>` a fallback writes
    // is not something a time control can parse.
    expect(handBuilt.seeds).toMatch(/opensAt: "\d{2}:\d{2}"/);
    expect(meta.operations.length).toBeGreaterThan(0);
    expect(timeFieldsOf(meta)).toHaveLength(10);
  });

  it("gives every required field a value, whatever kind it is", () => {
    for (const [name, domain] of resolved.domains) {
      const seeds = generated.get(name)?.seeds ?? "";
      for (const [entity, body] of factoriesOf(handlersOf(name))) {
        const type = /MockEntityStore<(\w+)>/.exec(body)?.[1];
        if (!type) continue;
        const members = new Set(
          seededMembers(seedArrayOf(seeds, entity.charAt(0).toLowerCase() + entity.slice(1))),
        );
        for (const field of domain.types.get(type)?.allFields ?? []) {
          if (!field.required) continue;
          expect(members.has(field.name), `${name}/${type}.${field.name}`).toBe(true);
        }
      }
    }

    // The capture's store DTOs require nothing but numbers, so the kinds a literal cannot stand
    // in for are held against a document that does require them.
    const handBuilt = generateMockFiles(handBuiltDomain("shop"), {
      naming: simplixBootNaming,
      labeledEnum: LABELED_ENUM,
      envelope,
    });
    expect(handBuilt.seeds).toContain("badge: new Blob([])");
    expect(handBuilt.seeds).toContain("labels: {}");
    expect(handBuilt.seeds).toMatch(/owner: \{ ownerId: "\d+" \}/);
    // An optional one carries no invented object.
    expect(handBuilt.seeds).not.toContain("reviewer:");
  });

  it("seeds an identifier as the text the store looks a record up by", () => {
    const rows = seedArrayOf(generated.get("org")?.seeds ?? "", "organization");
    expect(rows).toContain('orgId: "1"');
    expect(rows).toContain('orgId: "20"');
  });
});

describe("the entry carries both markers, and is only rewritten while they are untouched", () => {
  it("emits the override slot and the generated slot", () => {
    for (const [name, result] of generated) {
      expect(result.entry, name).toContain(MOCK_OVERRIDE_MARKER);
      expect(result.entry, name).toContain(MOCK_GENERATED_MARKER);
      // Without them the file is frozen at its first version and never picks up a new entity.
      expect(canRegenerateMockEntry(result.entry), name).toBe(true);
    }
  });

  it("refuses to rewrite an entry holding an override, or missing a marker", () => {
    const entry = generated.get("org")?.entry ?? "";
    const overridden = entry.replace(
      MOCK_OVERRIDE_MARKER,
      `${MOCK_OVERRIDE_MARKER}\n      http.get("*/api/v1/admin/org/mine", () => HttpResponse.json({})),`,
    );
    expect(canRegenerateMockEntry(overridden)).toBe(false);
    expect(canRegenerateMockEntry(entry.replace(MOCK_GENERATED_MARKER, ""))).toBe(false);
    expect(canRegenerateMockEntry(entry.replace(MOCK_OVERRIDE_MARKER, ""))).toBe(false);
    expect(canRegenerateMockEntry("export const handlers = [];")).toBe(false);
  });

  it("wires one store per backed entity, and calls an unbacked factory with nothing", () => {
    const entry = generated.get("site")?.entry ?? "";
    expect(entry).toContain(
      'const workPointStore = createMockEntityStore<WorkPointDetailDTO>(workPointSeeds, "workPointId");',
    );
    expect(entry).toContain("  workPointStore.reset();");
    expect(entry).toContain("...createWorkPointHandlers(workPointStore),");
    expect(entry).toContain("export function createSiteMock(): MockDomainConfig {");

    // `data-io` is a quoted key in the configuration, and the function it names is one identifier.
    expect(generated.get("data-io")?.entry).toContain(
      "export function createDataIoMock(): MockDomainConfig {",
    );
    expect(generated.get("system")?.entry).toContain("...createExportDownloadHandlers(),");
  });
});

describe("the handlers are written from SimpliX Meta alone, never from what is on disk", () => {
  it("seeds a domain whose `src/generated/` was never written", async () => {
    const root = await mkdtemp(join(tmpdir(), "meta-mock-"));
    try {
      const result = generated.get("site");
      if (!result) throw new Error("the site domain generated nothing");

      // The OpenAPI path filters entities by reading `src/generated/model` off the disk. Nothing
      // here reads anything, so a greenfield package generates what a migrated one does.
      expect(existsSync(join(root, "src/generated"))).toBe(false);
      await write(root, result);

      const seeds = await readFile(join(root, "src/mock/seeds.ts"), "utf-8");
      expect(seeds).toContain("export const workPointSeeds: WorkPointDetailDTO[] = [");
      const handlers = await readFile(
        join(root, "src/generated-meta/mock/handlers.ts"),
        "utf-8",
      );
      expect(handlers).toContain("store.");
      expect(handlers.match(/store\./g)?.length ?? 0).toBeGreaterThan(20);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("keeps a seed file that already exists and rewrites the handlers", async () => {
    const root = await mkdtemp(join(tmpdir(), "meta-mock-"));
    try {
      const result = generated.get("site");
      if (!result) throw new Error("the site domain generated nothing");
      await write(root, result);
      await writeFile(join(root, "src/mock/seeds.ts"), "// the domain's own rows\n", "utf-8");
      await writeFile(
        join(root, "src/generated-meta/mock/handlers.ts"),
        "// stale\n",
        "utf-8",
      );

      await write(root, result);
      expect(await readFile(join(root, "src/mock/seeds.ts"), "utf-8")).toBe(
        "// the domain's own rows\n",
      );
      expect(await readFile(join(root, "src/generated-meta/mock/handlers.ts"), "utf-8")).toContain(
        "createWorkPointHandlers",
      );
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("leaves an entry holding an override alone across a rerun", async () => {
    const root = await mkdtemp(join(tmpdir(), "meta-mock-"));
    try {
      const result = generated.get("site");
      if (!result) throw new Error("the site domain generated nothing");
      await write(root, result);

      const mine = (result.entry ?? "").replace(
        MOCK_OVERRIDE_MARKER,
        `${MOCK_OVERRIDE_MARKER}\n      ...mine,`,
      );
      await writeFile(join(root, "src/mock/index.ts"), mine, "utf-8");
      await write(root, result);
      expect(await readFile(join(root, "src/mock/index.ts"), "utf-8")).toBe(mine);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});

describe("nothing assembles a page, and a tree is built by the framework", () => {
  it("answers a list through `listPaged` and never spells a page out", () => {
    for (const [name] of generated) {
      const content = handlersOf(name);
      expect(content, name).not.toContain("totalElements");
      expect(content, name).not.toContain("numberOfElements");
      // `pageOf` is the zod builder the schema generator names, not a runtime factory.
      expect(content, name).not.toContain("pageOf");
    }
    expect(handlerFor(factoryOf("site", "WorkPoint"), "*/api/v1/admin/work-point/search")).toContain(
      "store.listPaged(page, size, sort)",
    );
  });

  it("builds the two trees with `buildEmbeddedTree`, keyed as the DTO names its parent", () => {
    let trees = 0;
    for (const [name] of generated) {
      const content = handlersOf(name);
      const uses = [...content.matchAll(/buildEmbeddedTree\(/g)].length;
      trees += uses;
      if (uses > 0) expect(content).toContain("import { buildEmbeddedTree } from '@simplix-react/mock';");
    }
    expect(trees).toBe(2);
    expect(handlerFor(factoryOf("org", "Organization"), "*/api/v1/admin/org/tree")).toContain(
      'buildEmbeddedTree(store.list(), "orgId", "parentOrgId")',
    );
  });
});

describe("generateMockFiles produces well-formed TypeScript", () => {
  it("transpiles the handlers, the entry and the seeds of all 13 domains", () => {
    let emitted = 0;
    for (const [name, result] of generated) {
      const modules: [string, string][] = [
        ...result.files,
        ["mock/index.ts", result.entry],
        ["mock/seeds.ts", result.seeds],
      ];
      for (const [path, content] of modules) {
        if (content === "") continue;
        emitted += 1;
        const transpiled = ts.transpileModule(content, { reportDiagnostics: true });
        expect(transpiled.diagnostics ?? [], `${name}/${path}`).toEqual([]);
      }
    }
    expect(emitted).toBe(39);
  });

  it("takes each DTO name once, however many entities share it", () => {
    for (const [name] of generated) {
      const imported = /import type \{ ([^}]+) \} from '\.\.\/model'/.exec(handlersOf(name))?.[1];
      const names = (imported ?? "").split(", ").filter((one) => one !== "");
      expect(new Set(names).size, name).toBe(names.length);
    }
  });
})

describe("the same document in another order", () => {
  // A SimpliX Boot backend walks its handler mappings out of a hash map, so the same application
  // serves the same operations in a different order after every restart. Where an entity owns two
  // candidate DTOs the generator then picked a different store type between runs, and
  // `worker.WorkerCensus` typed its store as the roster census one day and the identity census
  // the next — output that does not compile against the seeds preserved beside it.
  const shuffled = resolveMeta(
    { ...meta, operations: [...meta.operations].reverse() },
    { domains: smartSafetyDomains, containerTypes },
  );

  it("generates byte-identical mock modules", () => {
    for (const [name, domain] of shuffled.domains) {
      const again = generateMockFiles(domain, {
        naming: simplixBootNaming,
        envelope,
        labeledEnum: LABELED_ENUM,
      });
      const before = generated.get(name);
      expect(before, `${name} was not generated the first time`).toBeDefined();
      for (const [file, content] of again.files) {
        expect(before!.files.get(file), `${name} ${file}`).toBe(content);
      }
    }
  });
});
;

// ── Helpers ──────────────────────────────────────────────────

/** The fields of a type inside a domain's closure, inherited ones included. */
function fieldsOf(domain: string, type: string): FieldMeta[] {
  return domainOf(domain).types.get(type)?.allFields ?? [];
}

/** Every `time`-kinded field the document declares. */
function timeFieldsOf(document: DtoMeta): string[] {
  const found: string[] = [];
  for (const [name, type] of Object.entries(document.types)) {
    for (const field of type.fields) {
      if (field.type.kind === "time") found.push(`${name}.${field.name}`);
    }
  }
  return found;
}

/** The write policy a caller applies to a generated domain, exercised by the tests above. */
async function write(root: string, result: MockGenResult): Promise<void> {
  for (const [path, content] of result.files) {
    const target = join(root, "src/generated-meta", path);
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, content, "utf-8");
  }

  const seeds = join(root, "src/mock/seeds.ts");
  await mkdir(dirname(seeds), { recursive: true });
  // Written once: whatever rows the domain put there are its own.
  if (!existsSync(seeds) && result.seeds !== "") await writeFile(seeds, result.seeds, "utf-8");

  const entry = join(root, "src/mock/index.ts");
  const held = existsSync(entry) ? await readFile(entry, "utf-8") : undefined;
  if (held === undefined || canRegenerateMockEntry(held)) {
    await writeFile(entry, result.entry, "utf-8");
  }
}

/**
 * A document small enough that every assertion against it can be read off the literal, carrying
 * the field kinds and the shapes the capture's own store DTOs never reach: a numeric path
 * parameter, a clock time, a required file, a required map, a required nested DTO, and a reorder
 * body that names nothing to write.
 */
function handBuiltDomain(name: string): ResolvedDomain {
  const document: DtoMeta = {
    version: 1,
    enums: { Grade: { labeled: false, values: [{ name: "HIGH" }, { name: "LOW" }] } },
    types: {
      Owner: {
        javaClass: "app.Owner",
        typeParams: [],
        fields: [{ name: "ownerId", type: { kind: "string" }, required: true, nullable: false }],
      },
      TicketDTO: {
        javaClass: "app.TicketDTO",
        typeParams: [],
        fields: [
          { name: "ticketId", type: { kind: "number", integral: true }, required: true, nullable: false },
          { name: "grade", type: { kind: "enum", name: "Grade" }, required: false, nullable: true },
          { name: "openedOn", type: { kind: "date" }, required: false, nullable: true },
          { name: "opensAt", type: { kind: "time", pattern: "HH:mm" }, required: false, nullable: true },
          { name: "badge", type: { kind: "binary" }, required: true, nullable: false },
          {
            name: "labels",
            type: { kind: "container", name: "Map", args: [{ kind: "string" }] },
            required: true,
            nullable: false,
          },
          { name: "owner", type: { kind: "ref", name: "Owner" }, required: true, nullable: false },
          { name: "reviewer", type: { kind: "ref", name: "Owner" }, required: false, nullable: true },
        ],
      },
      TicketOrderDTO: {
        javaClass: "app.TicketOrderDTO",
        typeParams: [],
        // Every member is an identifier, so nothing here says what a reorder writes.
        fields: [
          { name: "ticketId", type: { kind: "string" }, required: true, nullable: false },
          { name: "parentId", type: { kind: "string" }, required: false, nullable: true },
        ],
      },
    },
    operations: [
      operation("readTicket", "GET", "/api/v1/shop/ticket/{ticketId}", {
        response: { kind: "ref", name: "TicketDTO" },
        path: [{ name: "ticketId", type: { kind: "number", integral: true }, required: true }],
      }),
      operation("reorderTickets", "PATCH", "/api/v1/shop/ticket/order", {
        body: { kind: "container", name: "List", args: [{ kind: "ref", name: "TicketOrderDTO" }] },
      }),
    ],
  };

  const built = resolveMeta(document, { domains: { [name]: ["shop.Ticket"] }, containerTypes });
  const domain = built.domains.get(name);
  if (!domain) throw new Error("the hand-built domain is missing");
  return domain;
}

function operation(
  id: string,
  method: OperationMeta["method"],
  path: string,
  parts: {
    response?: TypeRef;
    body?: TypeRef;
    path?: { name: string; type: TypeRef; required: boolean }[];
  },
): OperationMeta {
  const built: OperationMeta = {
    id,
    method,
    path,
    tag: "shop.Ticket",
    access: { kind: "authenticated" },
    request: { query: [], path: parts.path ?? [] },
  };
  if (parts.response) built.response = parts.response;
  if (parts.body) built.request.body = parts.body;
  return built;
}
