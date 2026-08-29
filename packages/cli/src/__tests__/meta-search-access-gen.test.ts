import { mkdtemp, rm, readFile, mkdir, writeFile } from "node:fs/promises";
import { readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { AccessMeta, DtoMeta, FieldMeta } from "../meta/types.js";
import type { OpenApiNamingStrategy } from "../openapi/naming/naming-strategy.js";
import type { ContainerMapping } from "../openapi/orchestration/spec-profile.js";
import { resolveMeta } from "../meta/resolve.js";
import type { ResolvedDomain } from "../meta/resolve.js";
import {
  deriveFilterFields,
  readSearchFields,
  searchOperatorOf,
  SEARCH_OPERATORS,
  SEARCH_OPERATOR_BY_IR_NAME,
} from "../meta/filter-source.js";
import { generateSearchFiles } from "../meta/generation/search-gen.js";
import { generateAccessFiles } from "../meta/generation/access-gen.js";
import { smartSafetyDomains } from "../meta/__fixtures__/smart-safety-domains.js";

// The scaffold command is driven end to end in one describe below, and it reaches for these the
// way every other scaffold test does.
vi.mock("ora", () => ({
  default: () => ({
    start: vi.fn().mockReturnThis(),
    succeed: vi.fn().mockReturnThis(),
    fail: vi.fn().mockReturnThis(),
    text: "",
  }),
}));
vi.mock("../utils/logger.js", () => ({
  log: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    success: vi.fn(),
    step: vi.fn(),
  },
}));
vi.mock("../config/config-loader.js", () => ({
  loadConfig: vi.fn().mockResolvedValue({ api: { baseUrl: "/api" }, i18n: { locales: ["en"] } }),
}));
vi.mock("../config/crud-config-loader.js", () => ({
  findCrudConfigForEntity: vi.fn().mockResolvedValue(null),
}));
vi.mock("../versions.js", () => ({
  depVersion: vi.fn().mockReturnValue("^19.0.0"),
  withVersions: vi.fn((context: Record<string, unknown>) => context),
}));

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
 * The other half of what the profile contributes, loaded from the extension it lives in. The CLI
 * cannot depend on the extension, which depends on it, so the specifier is built rather than
 * written and the runtime import resolves it.
 */
const namingModule = fileURLToPath(
  new URL(
    "../../../../extensions/simplix-boot/packages/cli-plugin/src/naming.ts",
    import.meta.url,
  ),
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
const orgSearch = generateSearchFiles(org, { naming: simplixBootNaming });
const orgAccess = generateAccessFiles(org, { naming: simplixBootNaming });

function fileOf(files: Map<string, string>, path: string): string {
  const content = files.get(path);
  if (content === undefined) throw new Error(`no module was emitted at ${path}`);
  return content;
}

/** The member names a params type declares, which is what a route accepts. */
function membersOf(content: string): string[] {
  return [...content.matchAll(/^ {2}"?([A-Za-z0-9_.]+)"?\??: /gm)].map((match) => match[1]);
}

/**
 * Every searchable field of a DTO, inherited ones included and in declaration order — read from
 * the document here rather than through the resolver, so the assertions below are held against
 * SimpliX Meta itself.
 */
function searchableFieldsOf(dto: string): FieldMeta[] {
  return allFieldsOf(dto).filter((field) => field.searchable);
}

function allFieldsOf(dto: string): FieldMeta[] {
  const type = meta.types[dto];
  if (!type) throw new Error(`the fixture declares no ${dto}`);
  const merged = type.extends ? [...allFieldsOf(type.extends)] : [];
  const positions = new Map(merged.map((field, at) => [field.name, at]));
  for (const field of type.fields) {
    const at = positions.get(field.name);
    if (at === undefined) {
      positions.set(field.name, merged.length);
      merged.push(field);
    } else {
      merged[at] = field;
    }
  }
  return merged;
}

/** The search DTOs the document's operations name, each one once. */
const searchDtos = [
  ...new Set(
    meta.operations
      .map((operation) => operation.request.searchDto)
      .filter((name): name is string => name !== undefined),
  ),
];

describe("the two operator vocabularies are translated, never matched by suffix", () => {
  it("carries every operator searchable-jpa states, and says which have no framework member", () => {
    // `dev.simplecore.searchable.core.condition.operator.SearchOperator` — all 18 of them. Two
    // have no member on the framework's side, so they are recorded as absent rather than left to
    // a lookup that would substitute an unrelated operator for them.
    expect(Object.keys(SEARCH_OPERATOR_BY_IR_NAME).sort()).toEqual(
      [
        "BETWEEN",
        "CONTAINS",
        "ENDS_WITH",
        "EQUALS",
        "GREATER_THAN",
        "GREATER_THAN_OR_EQUAL_TO",
        "IN",
        "IS_NOT_NULL",
        "IS_NULL",
        "LESS_THAN",
        "LESS_THAN_OR_EQUAL_TO",
        "NOT_BETWEEN",
        "NOT_CONTAINS",
        "NOT_ENDS_WITH",
        "NOT_EQUALS",
        "NOT_IN",
        "NOT_STARTS_WITH",
        "STARTS_WITH",
      ].sort(),
    );
    expect(searchOperatorOf("NOT_STARTS_WITH")).toBeNull();
    expect(searchOperatorOf("NOT_ENDS_WITH")).toBeNull();
    for (const [irName, member] of Object.entries(SEARCH_OPERATOR_BY_IR_NAME)) {
      if (member === null) continue;
      expect(Object.keys(SEARCH_OPERATORS), irName).toContain(member);
    }
  });

  it("keeps the two bounds the suffix would have lost", () => {
    // The backend spells its bounds with a `_TO` the framework's members do not carry, so a table
    // keyed by the name matching itself misses exactly the 254 pairs that are range bounds.
    expect(searchOperatorOf("GREATER_THAN_OR_EQUAL_TO")).toBe("GREATER_THAN_OR_EQUAL");
    expect(searchOperatorOf("LESS_THAN_OR_EQUAL_TO")).toBe("LESS_THAN_OR_EQUAL");
    expect(SEARCH_OPERATORS.GREATER_THAN_OR_EQUAL).toBe("greaterThanOrEqualTo");
    expect(SEARCH_OPERATORS.LESS_THAN_OR_EQUAL).toBe("lessThanOrEqualTo");
    // The value is the suffix, never the key: `orgName.CONTAINS` would be sent verbatim, filter
    // nothing and raise nothing.
    expect(SEARCH_OPERATORS[searchOperatorOf("CONTAINS") ?? "EQUALS"]).toBe("contains");
  });

  it("throws on a name it does not carry rather than substituting one", () => {
    expect(() => searchOperatorOf("SOUNDS_LIKE")).toThrow(/names the search operator 'SOUNDS_LIKE'/);
  });

  it("translates every operator the document's search DTOs state", () => {
    const pairs: Record<string, number> = {};
    for (const dto of searchDtos) {
      for (const field of searchableFieldsOf(dto)) {
        for (const name of field.searchable?.operators ?? []) {
          pairs[name] = (pairs[name] ?? 0) + 1;
          expect(() => searchOperatorOf(name)).not.toThrow();
          expect(searchOperatorOf(name), name).not.toBeNull();
        }
      }
    }
    // Measured over the 57 search DTOs the document's 86 searchable routes name. The four the
    // suffix-matching path could never recover — 222 pairs — are BETWEEN, IS_NULL, IS_NOT_NULL
    // and NOT_IN.
    expect(pairs).toEqual({
      EQUALS: 851,
      CONTAINS: 352,
      IN: 300,
      BETWEEN: 198,
      GREATER_THAN: 194,
      LESS_THAN: 194,
      GREATER_THAN_OR_EQUAL_TO: 127,
      LESS_THAN_OR_EQUAL_TO: 127,
      IS_NULL: 11,
      IS_NOT_NULL: 10,
      NOT_IN: 3,
    });
    expect(pairs.BETWEEN + pairs.IS_NULL + pairs.IS_NOT_NULL + pairs.NOT_IN).toBe(222);
    expect(pairs.GREATER_THAN_OR_EQUAL_TO + pairs.LESS_THAN_OR_EQUAL_TO).toBe(254);
  });
});

describe("a searchable route's params are its filters, its own query and the page window", () => {
  it("derives the fifty members orval derives, and adds the three SimpliX Meta does not carry", () => {
    // Orval's `ListOrganizationsParams`, read off the application's own `domain-org` package. The
    // SimpliX Meta states neither the page window nor the sort, which the backend binds on the controller,
    // so a params type built from the filters alone would be missing all three.
    const orval = [
      "orgId.equals",
      "orgId.in",
      "orgCode.equals",
      "orgCode.contains",
      "orgName.equals",
      "orgName.contains",
      "orgTypeId.equals",
      "orgTypeId.in",
      "description.equals",
      "description.contains",
      "phone.equals",
      "phone.contains",
      "email.equals",
      "email.contains",
      "website.equals",
      "website.contains",
      "address.equals",
      "address.contains",
      "externalId.equals",
      "externalId.contains",
      "lastSyncedAt.between",
      "lastSyncedAt.greaterThan",
      "lastSyncedAt.lessThan",
      "managerId.equals",
      "managerId.contains",
      "sortOrder.equals",
      "sortOrder.greaterThan",
      "sortOrder.lessThan",
      "isActive.equals",
      "parentOrgId.equals",
      "parentOrgId.contains",
      "path.equals",
      "path.contains",
      "depth.equals",
      "depth.greaterThan",
      "depth.lessThan",
      "deleted.equals",
      "deletedTimestamp.equals",
      "deletedTimestamp.greaterThan",
      "deletedTimestamp.lessThan",
      "createdBy.equals",
      "createdBy.contains",
      "createdAt.greaterThanOrEqualTo",
      "createdAt.lessThanOrEqualTo",
      "createdAt.between",
      "updatedBy.equals",
      "updatedBy.contains",
      "updatedAt.greaterThanOrEqualTo",
      "updatedAt.lessThanOrEqualTo",
      "updatedAt.between",
      "page",
      "size",
      "sort",
    ];
    const filters = orval.filter((name) => name.includes("."));
    expect(filters).toHaveLength(50);

    const derived: string[] = [];
    for (const field of searchableFieldsOf("OrganizationSearchDTO")) {
      for (const name of field.searchable?.operators ?? []) {
        const operator = searchOperatorOf(name);
        if (operator === null) continue;
        derived.push(`${field.name}.${SEARCH_OPERATORS[operator]}`);
      }
    }
    // Set equality against orval's own 50: a member that moved names an operator whose
    // translation is wrong, and the difference says which one.
    expect(new Set(derived)).toEqual(new Set(filters));
    expect(derived).toHaveLength(50);

    const emitted = membersOf(fileOf(orgSearch.files, "model/listOrganizationsParams.ts"));
    expect(new Set(emitted)).toEqual(new Set(orval));
    expect(emitted).toHaveLength(53);
    expect(emitted.slice(-3)).toEqual(["page", "size", "sort"]);
  });

  it("types a member by what the operator asks of the field", () => {
    const params = fileOf(orgSearch.files, "model/listOrganizationsParams.ts");
    expect(params).toContain(`  "orgName.contains"?: string;`);
    // Several values reach the wire as one comma-separated field. Both shapes serialise to it —
    // the filter bar commits an array, hand-written code joins it — so naming only the array
    // rejects what module code written against the OpenAPI path already passes.
    expect(params).toContain(`  "orgTypeId.in"?: string | string[];`);
    expect(params).toContain(`  "createdAt.between"?: string | string[];`);
    expect(params).toContain(`  "sortOrder.greaterThan"?: number;`);
    expect(params).toContain(`  "isActive.equals"?: boolean;`);
    // A moment arrives as its ISO text, whichever bound it is on.
    expect(params).toContain(`  "createdAt.greaterThanOrEqualTo"?: string;`);
    expect(params).toContain("  page?: number;");
    expect(params).toContain("  sort?: string[];");
  });

  it("keeps the query parameters the eight dual routes state of their own", () => {
    // Seventy-eight of the 86 searchable routes state an empty query and eight do not. Each of
    // those eight is a control on a screen — the window a census is bucketed over, the tab an
    // inbox is narrowed to — and the list renders without them, so dropping them fails quietly.
    const routes: [string, string, string[]][] = [
      ["data-io", "model/getBulkOperationCountsParams.ts", ["from", "to", "buckets"]],
      ["data-io", "model/getImportJobCountsParams.ts", ["from", "to", "buckets"]],
      ["notification", "model/getNotificationCountsParams.ts", ["from", "to", "buckets"]],
      ["notification", "model/getNotificationCentreCountsParams.ts", ["from", "to", "buckets"]],
      ["audit", "model/getAuditLogCountsParams.ts", ["from", "to", "buckets"]],
      // `AuditEventRest_counts` is the one whose hook the naming strategy calls something else.
      ["audit", "model/getAllAuditEventsParams.ts", ["from", "to", "buckets"]],
      ["approval", "model/listApprovalInboxsParams.ts", ["tab"]],
      ["regulation", "model/listPolicyParametersParams.ts", ["siteId"]],
    ];

    for (const [domain, path, own] of routes) {
      const files = generateSearchFiles(domainOf(domain), { naming: simplixBootNaming }).files;
      const members = membersOf(fileOf(files, path));
      // The route's own parameters come first, as they do in the OpenAPI document.
      expect(members.slice(0, own.length), path).toEqual(own);
      // And the filters are still there beside them.
      expect(members.length, path).toBeGreaterThan(own.length + 3);
    }

    // Requiredness is SimpliX Meta's: seven of the eight state theirs as required, and the enum-typed
    // one is imported rather than widened to a string.
    expect(fileOf(
      generateSearchFiles(domainOf("audit"), { naming: simplixBootNaming }).files,
      "model/getAuditLogCountsParams.ts",
    )).toContain("  from: string;");
    const approval = fileOf(
      generateSearchFiles(domainOf("approval"), { naming: simplixBootNaming }).files,
      "model/listApprovalInboxsParams.ts",
    );
    expect(approval).toContain("  tab: InboxTab;");
    expect(approval).toContain("import type { ApprovalStatus, InboxTab } from './_enums';");
    // `PolicyParameterRest_simpleSearch` is the one whose own parameter is optional.
    expect(fileOf(
      generateSearchFiles(domainOf("regulation"), { naming: simplixBootNaming }).files,
      "model/listPolicyParametersParams.ts",
    )).toContain("  siteId?: string;");
  });

  it("writes one params module per searchable route, and names them for the barrel", () => {
    let modules = 0;
    for (const domain of resolved.domains.values()) {
      const search = generateSearchFiles(domain, { naming: simplixBootNaming });
      modules += search.paramsModules.length;
      for (const module of search.paramsModules) {
        expect(search.files.has(`model/${module}.ts`), module).toBe(true);
      }
    }
    // Every one of the document's 86 searchable routes, and the model barrel is built from the
    // domain's declared types, so these are reported for whoever assembles the package.
    expect(modules).toBe(86);
    expect(orgSearch.paramsModules).toEqual(["listOrganizationsParams"]);
  });
});

describe("a filter's control comes from the field's type, which SimpliX Meta states", () => {
  it("does not open a facet on a field with nothing to put in it", () => {
    // Rule 2c of the OpenAPI path makes any field with an `.in` parameter a faceted filter and
    // fills its options from the entity field's enum, which is undefined unless the field is one.
    // It fires before the type has been looked at, so the operator opens a panel and finds it
    // empty. SimpliX Meta can tell the two apart.
    const equipment = readSearchFields(searchableFieldsOf("EquipmentSearchDTO"), () => undefined);
    const derived = deriveFilterFields(equipment.fields);
    for (const name of ["siteId", "areaId", "equipmentId", "managingOrgId"]) {
      const filter = derived.filters.find((one) => one.field === name);
      expect(filter?.component, name).not.toBe("FacetedFilter");
      expect(derived.unfacetedFields.map((one) => one.field), name).toContain(name);
    }
    // A rerouted field still gets a control the operator can type into.
    expect(derived.filters.find((one) => one.field === "siteId")?.component).toBe("TextFilter");
    for (const one of derived.filters) {
      if (one.component !== "FacetedFilter") continue;
      expect(one.options?.length, one.field).toBeGreaterThan(0);
    }
  });

  it("fills a facet from the enum registry SimpliX Meta carries", () => {
    const approval = domainOf("approval");
    const fields = readSearchFields(searchableFieldsOf("ApprovalRequestSearchDTO"), (name) =>
      approval.enums.get(name)?.meta.values.map((value) => value.name),
    ).fields;
    const status = fields.find((one) => one.name === "approvalStatus");
    expect(status?.kind).toBe("enum");
    // `enums[TypeRef.name].values[].name`, mapped to the `string[]` shape the control reads.
    expect(status?.options).toEqual(meta.enums.ApprovalStatus.values.map((value) => value.name));

    const filter = deriveFilterFields(fields).filters.find(
      (one) => one.field === "approvalStatus",
    );
    expect(filter?.component).toBe("FacetedFilter");
    expect(filter?.operator).toBe("in");
    expect(filter?.options).toEqual(["IN_PROGRESS", "HELD", "APPROVED", "REJECTED", "WITHDRAWN"]);
    // Every one of the document's enum references resolves, so a facet always has its options.
    let enums = 0;
    for (const dto of searchDtos) {
      for (const field of searchableFieldsOf(dto)) {
        if (field.type.kind !== "enum") continue;
        enums += 1;
        expect(meta.enums[field.type.name], `${dto}.${field.name}`).toBeDefined();
      }
    }
    expect(enums).toBe(96);
  });

  it("reads the toggle, the range and the number off the kind rather than off a name", () => {
    const fields = readSearchFields(searchableFieldsOf("OrganizationSearchDTO"), () => undefined)
      .fields;
    const filters = deriveFilterFields(fields).filters;
    const of = (name: string) => filters.find((one) => one.field === name);

    expect(of("isActive")).toMatchObject({ component: "ToggleFilter", filterKey: "isActive.equals" });
    expect(of("createdAt")).toMatchObject({
      component: "DateRangeFilter",
      filterKey: "createdAt.greaterThanOrEqualTo",
      pairedKey: "createdAt.lessThanOrEqualTo",
    });
    expect(of("sortOrder")).toMatchObject({ component: "NumberFilter", valueType: "number" });
    expect(of("orgName")).toMatchObject({ component: "TextFilter", operator: "contains" });
    // A date field the route accepts no bounds on cannot be a range: the control writes both.
    expect(of("lastSyncedAt")).toBeUndefined();
  });

  it("counts the fields the reroute rescues across the whole document", () => {
    let carryIn = 0;
    let nonEnum = 0;
    for (const dto of searchDtos) {
      for (const field of searchableFieldsOf(dto)) {
        if (!(field.searchable?.operators ?? []).includes("IN")) continue;
        carryIn += 1;
        if (field.type.kind !== "enum") nonEnum += 1;
      }
    }
    expect(carryIn).toBe(300);
    expect(nonEnum).toBe(205);

    // Of those 205, all but two — `HolidayCalendarSearchDTO.country` and
    // `RegulationPackSearchDTO.country`, which take the country picker and so never reach the
    // faceted rule at all.
    const rerouted = new Set<string>();
    for (const domain of resolved.domains.values()) {
      for (const one of generateSearchFiles(domain, { naming: simplixBootNaming }).unfacetedFields) {
        rerouted.add(`${one.type}.${one.field}`);
      }
    }
    expect(rerouted.size).toBe(203);
  });

  it("serialises the same filter list the source produced", () => {
    const organization = fileOf(orgSearch.files, "search/organization.ts");
    const fields = readSearchFields(searchableFieldsOf("OrganizationSearchDTO"), () => undefined)
      .fields;
    const filters = deriveFilterFields(fields).filters;

    expect(organization).toContain("export const listOrganizationsFilters: FilterField[] = [");
    for (const filter of filters) {
      expect(organization, filter.filterKey).toContain(`filterKey: ${JSON.stringify(filter.filterKey)}, component: ${JSON.stringify(filter.component)}`);
    }
    // The metadata carries what a column and a label need beside what a control needs.
    expect(organization).toContain(
      `{ name: "orgCode", kind: "string", operators: ["equals", "contains"], sortable: true, labelKey: "entities.Organization.orgCode" }`,
    );
    expect(organization).toContain("import type { FilterField, SearchField } from './_filters';");
    expect(fileOf(orgSearch.files, "search/index.ts")).toContain("export * from './organization';");
    // The audit stamps stay in the params type and are never offered as a control.
    expect(organization).toContain(`{ name: "createdBy",`);
    expect(organization).not.toContain(`field: "createdBy"`);
  });
});

describe("SUFFIX_TO_ENUM_KEY carries the operators SimpliX Meta recovers", () => {
  let tempDir: string;
  let originalCwd: string;
  let originalExit: typeof process.exit;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), "meta-search-suffix-"));
    originalCwd = process.cwd();
    originalExit = process.exit;
    process.exit = vi.fn((code?: number) => {
      throw new Error(`process.exit(${code})`);
    }) as never;
    await writeFile(join(tempDir, "simplix.config.ts"), "export default {};");
    await writeFile(join(tempDir, "package.json"), JSON.stringify({ name: "@test/monorepo" }));
    process.chdir(tempDir);
  });

  afterEach(async () => {
    process.chdir(originalCwd);
    process.exit = originalExit;
    await rm(tempDir, { recursive: true, force: true });
    vi.restoreAllMocks();
  });

  it("writes BETWEEN rather than the upper bound the fallback substitutes", async () => {
    // The map is consulted by suffix and missing entries are not left empty: the number branch
    // falls back to GREATER_THAN_OR_EQUAL, so before `between` was carried this scaffold asked
    // for everything above the value instead of the range.
    const { scaffoldCrudCommand } = await import("../commands/scaffold-crud.js");
    const modDir = join(tempDir, "modules/mymod");
    await mkdir(join(modDir, "src/widgets"), { recursive: true });
    await writeFile(
      join(modDir, "package.json"),
      JSON.stringify({ name: "@test/mymod", dependencies: {} }),
    );
    await writeFile(join(modDir, "src/widgets/index.ts"), "export {};\n");

    const domainDir = join(tempDir, "packages/myapp-domain-device");
    await mkdir(join(domainDir, "src"), { recursive: true });
    await writeFile(
      join(domainDir, "src/schemas.ts"),
      `export const deviceSchema = z.object({ id: z.string(), price: z.number() });`,
    );
    await writeFile(
      join(domainDir, "package.json"),
      JSON.stringify({ name: "@test/myapp-domain-device" }),
    );
    await writeFile(
      join(domainDir, ".openapi-snapshot.json"),
      JSON.stringify({
        version: 2,
        generatedAt: "2024-01-01",
        specSource: "api.json",
        entities: [
          {
            name: "device",
            pascalName: "Device",
            pluralName: "devices",
            path: "/devices",
            fields: [
              { name: "id", snakeName: "id", type: "string", required: true, nullable: false, zodType: "" },
              { name: "price", snakeName: "price", type: "number", format: "double", required: true, nullable: false, zodType: "" },
            ],
            queryParams: [
              { name: "price.between", type: "number" },
              { name: "price.greaterThan", type: "number" },
            ],
            operations: [
              { name: "list", method: "GET", path: "/devices/search", role: "list", hasInput: true, operationId: "searchDevices", queryParams: [] },
              { name: "get", method: "GET", path: "/devices/:id", role: "get", hasInput: false, operationId: "getDevice", queryParams: [] },
            ],
            tags: [],
          },
        ],
      }),
    );

    await scaffoldCrudCommand.parseAsync(["node", "simplix", "device"]);
    const list = await readFile(join(modDir, "src/widgets/device/list.tsx"), "utf-8");
    expect(list).toContain('type: "number", field: "price"');
    expect(list).toContain("SearchOperator.BETWEEN");
    expect(list).not.toContain("SearchOperator.GREATER_THAN_OR_EQUAL");
  });
});

describe("generateAccessFiles states what each operation requires of the caller", () => {
  it("emits a constant per operation, with the permission taken apart", () => {
    const organization = fileOf(orgAccess.files, "access/organization.ts");
    expect(organization).toContain(
      `export const listOrganizationsAccess: AccessRule = { kind: "permission", group: "ORG_ADMIN", action: "list" };`,
    );
    expect(organization).toContain(
      `export const deleteOrganizationAccess: AccessRule = { kind: "permission", group: "ORG_ADMIN", action: "delete" };`,
    );
    expect(organization).toContain("import type { AccessRule } from './_access';");
    // Nothing generated reads them, and the module says so.
    expect(organization).toContain("// Nothing generated reads these:");
    expect(fileOf(orgAccess.files, "access/index.ts")).toContain("export * from './organization';");
    expect(fileOf(orgAccess.files, "access/_access.ts")).toContain(
      "  | { kind: 'permission'; group: string; action: string }",
    );
  });

  it("carries an expression as written, quotes and all", () => {
    const user = generateAccessFiles(domainOf("user"), { naming: simplixBootNaming });
    expect(fileOf(user.files, "access/userAccount.ts")).toContain(
      `{ kind: "expression", raw: "hasPermission('USER_ADMIN', 'view') or @userAccountService.hasOwnerPermission('view', #userId, null)" }`,
    );
    expect(user.expressions.map((one) => one.operation)).toContain("AdminUserAccountRest_get");
  });

  it("tallies the kinds the document states and the kinds the domains reach", () => {
    const document: Record<AccessMeta["kind"], number> = {
      permission: 0,
      authenticated: 0,
      public: 0,
      expression: 0,
    };
    for (const operation of meta.operations) document[operation.access.kind] += 1;
    expect(document).toEqual({ permission: 566, authenticated: 94, public: 29, expression: 5 });

    // The 13 configured domains claim 621 of the document's 694 operations; the other 73 belong
    // to tags no domain matches, which the resolver reports as unmatched.
    const generated: Record<AccessMeta["kind"], number> = {
      permission: 0,
      authenticated: 0,
      public: 0,
      expression: 0,
    };
    for (const domain of resolved.domains.values()) {
      const access = generateAccessFiles(domain, { naming: simplixBootNaming });
      for (const [kind, count] of Object.entries(access.kinds)) {
        generated[kind as AccessMeta["kind"]] += count;
      }
    }
    // One constant fewer than the 621 claimed operations: two operations of `public.user.Avatar`
    // resolve to the same name, and one name is one declaration.
    expect(generated).toEqual({ permission: 547, authenticated: 53, public: 16, expression: 4 });
    const declared = Object.values(generated).reduce((sum, count) => sum + count, 0);
    expect(declared).toBe(620);
    expect(resolved.unmatched.flatMap((one) => one.operations)).toHaveLength(694 - 621);
  });

  it("declares one constant per name where two operations resolve to the same one", () => {
    // A module that declares a name twice does not compile, and it would take the whole package
    // with it rather than the one rule. The endpoint generator reports the collision itself.
    const user = generateAccessFiles(domainOf("user"), { naming: simplixBootNaming });
    const avatar = fileOf(user.files, "access/avatar.ts");
    expect([...avatar.matchAll(/^export const (\w+)/gm)].map((match) => match[1])).toEqual([
      "getAllAvatarsAccess",
    ]);
  });
});

describe("both generators produce well-formed TypeScript", () => {
  it("transpiles every emitted file of all 13 domains without a syntax diagnostic", () => {
    let emitted = 0;
    for (const domain of resolved.domains.values()) {
      const search = generateSearchFiles(domain, { naming: simplixBootNaming });
      const access = generateAccessFiles(domain, { naming: simplixBootNaming });
      for (const [path, content] of [...search.files, ...access.files]) {
        emitted += 1;
        const transpiled = ts.transpileModule(content, { reportDiagnostics: true });
        expect(transpiled.diagnostics ?? [], `${domain.name}/${path}`).toEqual([]);
      }
    }
    expect(emitted).toBe(321);
  });

  it("names no type SimpliX Meta does not declare, and no operator it cannot translate", () => {
    for (const domain of resolved.domains.values()) {
      const search = generateSearchFiles(domain, { naming: simplixBootNaming });
      expect(search.unsupportedOperators, domain.name).toEqual([]);
      for (const [path, content] of search.files) {
        expect(content, `${domain.name}/${path}`).not.toContain("undefined");
      }
    }
  });

  it("sends a value SimpliX Meta names no type for as the text a query string carries", () => {
    // Five fields are a raw Java `List` whose element resolves to the collection's own variable,
    // so nothing in the document says what is inside them.
    const erased = new Set<string>();
    for (const domain of resolved.domains.values()) {
      for (const one of generateSearchFiles(domain, { naming: simplixBootNaming })
        .erasedFilterTypes) {
        erased.add(`${one.site}.${one.field}`);
      }
    }
    expect([...erased].sort()).toEqual([
      "ObligationApplicabilitySearchDTO.appliedRules",
      "ObligationApplicabilitySearchDTO.excludedRules",
      "PolicyParameterSearchDTO.usedByScreenKeys",
      "PreAssignmentGateSearchDTO.notifyRoleCodes",
      "RegulationDutySearchDTO.additionalArticleRefs",
    ]);
  });
});
