import { readFileSync } from "node:fs";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { parseSchemaFields } from "../commands/scaffold-crud.js";
import type { DtoMeta } from "../meta/types.js";
import type { OpenApiNamingStrategy } from "../openapi/naming/naming-strategy.js";
import type { ContainerMapping } from "../openapi/orchestration/spec-profile.js";
import { registerSpecProfile } from "../openapi/plugin-registry.js";
import { entityNameOf } from "../meta/generation/endpoint-gen.js";
import { resolveMeta, type ResolvedDomain } from "../meta/resolve.js";
import { buildMetaScaffoldSource, type MetaScaffoldSource } from "../meta/scaffold-source.js";
import { smartSafetyDomains } from "../meta/__fixtures__/smart-safety-domains.js";
import { pathExists } from "../utils/fs.js";

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
 * The profile's naming strategy, loaded from the extension it lives in: the roles it resolves are
 * what decides which operation is the list, the reorder and the batch, so a strategy written for
 * the test would prove only that the source can read whatever it is handed.
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

function sourceOf(domain: string, tag: string): MetaScaffoldSource {
  return buildMetaScaffoldSource({ domain: domainOf(domain), tag, naming: simplixBootNaming });
}

/** Every entity of every configured domain, which is what a project scaffolds screens from. */
function everySource(): MetaScaffoldSource[] {
  const sources: MetaScaffoldSource[] = [];
  for (const domain of resolved.domains.values()) {
    for (const entity of domain.entities) {
      sources.push(buildMetaScaffoldSource({ domain, tag: entity.tag, naming: simplixBootNaming }));
    }
  }
  return sources;
}

/** A type's fields with inheritance followed, read from the document rather than the resolver. */
function allFieldsOf(dto: string): string[] {
  const type = meta.types[dto];
  if (!type) throw new Error(`the fixture declares no ${dto}`);
  const merged = type.extends ? [...allFieldsOf(type.extends)] : [];
  for (const field of type.fields) {
    if (!merged.includes(field.name)) merged.push(field.name);
  }
  return merged;
}

describe("the DTO an entity's screens are built from", () => {
  it("compares bodies by their inherited field count, which inverts two of these three", () => {
    // An `…UpdateDTO` extends its create body and adds the identifier, so it declares one field
    // of its own and is the widest body the entity has. Comparing own counts picks the parent, or
    // ties with it and picks whichever the document declares first.
    const rows: [string, string, string, number[], number[]][] = [
      ["org", "org.Organization", "Organization", [20, 1], [20, 21]],
      ["site", "site.WorkPoint", "WorkPoint", [11, 1], [11, 12]],
      ["site", "site.AreaZone", "AreaZone", [1, 1], [12, 13]],
    ];

    for (const [domain, tag, dto, own, all] of rows) {
      expect(meta.types[`${dto}CreateDTO`].fields, `${dto}CreateDTO own`).toHaveLength(own[0]);
      expect(meta.types[`${dto}UpdateDTO`].fields, `${dto}UpdateDTO own`).toHaveLength(own[1]);
      // Own-field counts never prefer the update body; resolved counts always do.
      expect(own[1], dto).not.toBeGreaterThan(own[0]);
      expect(allFieldsOf(`${dto}CreateDTO`), `${dto}CreateDTO`).toHaveLength(all[0]);
      expect(allFieldsOf(`${dto}UpdateDTO`), `${dto}UpdateDTO`).toHaveLength(all[1]);
      expect(all[1], dto).toBeGreaterThan(all[0]);

      expect(sourceOf(domain, tag).fieldSource, dto).toEqual({
        type: `${dto}UpdateDTO`,
        origin: "request",
      });
    }
  });

  it("carries a parent's fields first and the child's own last", () => {
    // Orval's `OrganizationRestUpdateBody` is flat and in this order; the column ordering pass
    // sorts by category and keeps the arrival order inside each one, so a closure written
    // own-fields-first would move every column of the 104 types that extend another.
    const organization = sourceOf("org", "org.Organization");
    expect(organization.fields.map((one) => one.name)).toEqual([
      "orgCode",
      "orgName",
      "orgNameI18n",
      "orgTypeId",
      "description",
      "descriptionI18n",
      "phone",
      "email",
      "website",
      "address",
      "externalId",
      "lastSyncedAt",
      "managerId",
      "sortOrder",
      "isActive",
      "parentOrgId",
      "path",
      "depth",
      "deleted",
      "deletedTimestamp",
      "orgId",
    ]);
    expect(organization.fields).toHaveLength(21);
  });

  it("reads a read-only entity from the record it answers with", () => {
    // An audit log is written by nothing, so it has no request body at all. The record its detail
    // route answers with is the whole of what a screen can show, and it is the DTO the mock store
    // is typed with — the two are resolved the same way on purpose.
    const auditLog = sourceOf("audit", "audit.AuditLog");
    expect(auditLog.fieldSource).toEqual({ type: "AuditLogDetailDTO", origin: "response" });
    expect(auditLog.fields.length).toBeGreaterThan(0);
    expect(auditLog.listRowType).toBe("AuditLogListDTO");
  });

  it("counts what each source answers for, and names what neither does", () => {
    const sources = everySource();
    // The 13 configured domains claim 126 of the document's 139 tags; the other 13 match no
    // domain and are reported by the resolver rather than scaffolded.
    expect(sources).toHaveLength(126);
    expect(resolved.unmatched).toHaveLength(13);

    const byOrigin = { request: 0, response: 0 };
    const neither: string[] = [];
    for (const source of sources) {
      if (source.fieldSource) byOrigin[source.fieldSource.origin] += 1;
      else neither.push(source.entity);
    }
    expect(byOrigin).toEqual({ request: 74, response: 50 });
    // Both are binary surfaces: an avatar and a download are bytes, and SimpliX Meta states no field a
    // screen could render. They are refused rather than given an invented id/name pair.
    expect(neither.sort()).toEqual(["avatar", "exportDownload"]);
    for (const source of sources) {
      if (source.fieldSource) expect(source.fields.length, source.entity).toBeGreaterThan(0);
      else expect(source.fields, source.entity).toEqual([]);
    }
  });
});

describe("what a template cannot know and SimpliX Meta states", () => {
  const holiday = () => sourceOf("system", "common.main.system.Holiday");

  it("gives a temporal column the format its kind decides", () => {
    const formats: Record<string, number> = {};
    for (const source of everySource()) {
      for (const field of source.fields) {
        if (field.columnFormat) formats[field.columnFormat] = (formats[field.columnFormat] ?? 0) + 1;
      }
    }
    // Every temporal field of every scaffolded entity, which without a format renders as the ISO
    // text the server sent. The document declares ten `time` fields as well, and all ten are on a
    // shift's nested rows — no entity is scaffolded from a DTO that carries one.
    expect(Object.keys(formats).sort()).toEqual(["date", "datetime"]);

    const fields = holiday().fields;
    expect(fields.find((one) => one.name === "holidayDate")).toMatchObject({
      component: "Date",
      columnFormat: "date",
    });
    expect(
      sourceOf("org", "org.Organization").fields.find((one) => one.name === "lastSyncedAt"),
    ).toMatchObject({ columnFormat: "datetime" });
  });

  it("displays a boolean as one", () => {
    const excluded = holiday().fields.find((one) => one.name === "businessDayExcluded");
    expect(excluded).toMatchObject({ component: "Boolean", columnDisplay: "boolean" });
    // Only a boolean carries it: `country` and `phone` are the column's other two displays and
    // SimpliX Meta states nothing that tells either apart from any other string.
    for (const source of everySource()) {
      for (const field of source.fields) {
        if (field.columnDisplay !== undefined) expect(field.tsType, field.name).toBe("boolean");
      }
    }
  });

  it("offers a sort only where the backend implements one", () => {
    const fields = holiday().fields;
    const sortable = (name: string) => fields.find((one) => one.name === name)?.sortable;
    // The name is sorted through three collation columns the DTO declares beside it, so the
    // column itself is not sortable; a header that offered it would send `sort=holidayName.asc`,
    // be ignored, and move the arrow while the rows stayed where they were.
    expect(sortable("holidayName")).toBe(false);
    expect(sortable("businessDayExcluded")).toBe(false);
    expect(sortable("holidayCalendarId")).toBe(true);
    // A field the search DTO does not declare at all cannot be ordered by either.
    expect(sortable("holidayNameI18n")).toBe(false);

    let stated = 0;
    let refused = 0;
    for (const source of everySource()) {
      for (const field of source.fields) {
        if (field.sortable === undefined) continue;
        stated += 1;
        if (!field.sortable) refused += 1;
      }
    }
    expect(refused).toBeGreaterThan(0);
    expect(refused).toBeLessThan(stated);
  });

  it("names a record by the field its translations are paired with", () => {
    // A field with an `…I18n` sibling is the human-facing text by construction. The positional
    // rule it replaces reaches for the first string field, which is usually an identifier — the
    // same on every row, and what the delete confirmation would then name the record by.
    expect(sourceOf("org", "org.Organization").displayNameField).toBe("orgName");
    expect(sourceOf("site", "site.AreaZone").displayNameField).toBe("areaName");
    expect(sourceOf("site", "site.WorkPoint").displayNameField).toBe("pointName");
    expect(holiday().displayNameField).toBe("holidayName");

    // `AreaZoneCreateDTO` declares no pair of its own — `areaName` and `areaNameI18n` are both
    // inherited — so the pairing has to run over the closure or it finds nothing at all.
    expect(meta.types.AreaZoneUpdateDTO.fields.map((one) => one.name)).toEqual(["safetyZoneType"]);

    // Where a DTO carries more than one pair, the first in parent-then-own order is the one shown.
    const organization = sourceOf("org", "org.Organization");
    expect(organization.fields.filter((one) => one.isI18nPair).map((one) => one.name)).toEqual([
      "orgName",
      "description",
    ]);

    let paired = 0;
    let moved = 0;
    for (const source of everySource()) {
      const pairedField = source.fields.find((one) => one.isI18nPair)?.name;
      if (pairedField === undefined) continue;
      paired += 1;
      const positional =
        source.fields.find(
          (one) =>
            ["name", "title", "label", "displayName"].includes(one.name) &&
            one.tsType === "string",
        )?.name ??
        source.fields.find(
          (one) => one.tsType === "string" && one.name !== source.rowIdField,
        )?.name;
      if (positional !== pairedField) moved += 1;
    }
    expect(paired).toBe(20);
    expect(moved).toBe(14);
  });

  it("names an enum column's enum, which is what turns a constant into a label", () => {
    const fields = holiday().fields;
    expect(fields.find((one) => one.name === "holidayKind")).toMatchObject({
      component: "Select",
      enumTypeName: "HolidayKind",
      options: meta.enums.HolidayKind.values.map((one) => one.name),
    });
    expect(fields.find((one) => one.name === "verification")?.enumTypeName).toBe(
      "HolidayVerification",
    );
    // The row type declares the same names, so the column and the badge agree about the enum.
    expect(holiday().rowProperties?.get("holidayKind")).toBe("HolidayKind");
  });

  it("keeps a column only for what the list projection returns", () => {
    const source = holiday();
    // The write body carries the translations; `HolidayListDTO` does not, so no column asks the
    // row for a property it never has.
    expect(source.fields.map((one) => one.name)).toContain("holidayNameI18n");
    expect(source.rowProperties?.has("holidayNameI18n")).toBe(false);
    expect(source.rowProperties?.has("holidayName")).toBe(true);
  });
});

describe("the roles nothing generated reaches", () => {
  it("counts the entities whose batch endpoints no screen sends a request to", () => {
    const counts: Record<string, number> = {};
    let anyUnreachable = 0;
    let order = 0;
    for (const source of everySource()) {
      for (const role of source.unreachableRoles) counts[role] = (counts[role] ?? 0) + 1;
      if (source.unreachableRoles.length > 0) anyUnreachable += 1;
      if (source.roles.order !== undefined) order += 1;
    }
    // No UI template offers a multi-select, so these are reported rather than generated. `order`
    // is not among them: the list template drives a reorder through `hookOrder`.
    expect(counts).toEqual({ batchUpdate: 38, multiUpdate: 34, batchDelete: 28 });
    expect(anyUnreachable).toBe(38);
    expect(order).toBe(11);
  });
});

// ── Driving the command ──────────────────────────────────────

vi.mock("ora", () => ({
  default: () => ({
    start: vi.fn().mockReturnThis(),
    succeed: vi.fn().mockReturnThis(),
    fail: vi.fn().mockReturnThis(),
    text: "",
  }),
}));
vi.mock("../utils/logger.js", () => ({
  log: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), success: vi.fn(), step: vi.fn() },
}));
vi.mock("../config/crud-config-loader.js", () => ({
  findCrudConfigForEntity: vi.fn().mockResolvedValue(null),
}));
vi.mock("../versions.js", () => ({
  depVersion: vi.fn().mockReturnValue("^19.0.0"),
  withVersions: vi.fn((context: Record<string, unknown>) => context),
}));
// The factory is hoisted above every import, so what it needs it imports itself.
vi.mock("../config/config-loader.js", async () => {
  const { fileURLToPath } = await import("node:url");
  const { smartSafetyDomains: domains } = await import(
    "../meta/__fixtures__/smart-safety-domains.js"
  );
  const snapshot = fileURLToPath(
    new URL("../meta/__fixtures__/smart-safety-meta.json", import.meta.url),
  );
  return {
    loadConfig: vi.fn().mockResolvedValue({
      api: { baseUrl: "/api" },
      i18n: { locales: ["en"] },
      openapi: [
        {
          spec: "openapi/boot.json",
          profile: "meta-scaffold-test",
          domains,
          meta: { snapshot, export: ["system", "user"] },
        },
      ],
    }),
  };
});

/** The two halves of the schema file a meta domain carries, as the schema generator writes them. */
const HOLIDAY_SCHEMA = [
  "import { z } from 'zod';",
  "",
  "export const HolidayCreateDTOSchema = z.object({",
  "  holidayCalendarId: z.string(),",
  "  holidayDate: z.string(),",
  "});",
  "",
  "export const HolidayUpdateDTOSchema = HolidayCreateDTOSchema.extend({",
  "  holidayId: z.string(),",
  "});",
  "",
].join("\n");

describe("a screen scaffolded from SimpliX Meta", () => {
  let tempDir: string;
  let originalCwd: string;
  let originalExit: typeof process.exit;

  beforeEach(async () => {
    registerSpecProfile("meta-scaffold-test", {
      naming: simplixBootNaming,
      responseAdapter: "raw",
      containerTypes,
    });

    tempDir = await mkdtemp(join(tmpdir(), "scaffold-meta-source-"));
    originalCwd = process.cwd();
    originalExit = process.exit;
    process.exit = vi.fn((code?: number) => {
      throw new Error(`process.exit(${code})`);
    }) as never;

    await writeFile(join(tempDir, "simplix.config.ts"), "export default {};");
    await writeFile(join(tempDir, "package.json"), JSON.stringify({ name: "@test/monorepo" }));

    const moduleDir = join(tempDir, "modules/system");
    await mkdir(join(moduleDir, "src/widgets"), { recursive: true });
    await writeFile(
      join(moduleDir, "package.json"),
      JSON.stringify({ name: "@test/system", dependencies: {} }),
    );
    await writeFile(join(moduleDir, "src/widgets/index.ts"), "export {};\n");

    const domainDir = join(tempDir, "packages/domain-system");
    await mkdir(join(domainDir, "src/generated-meta/schema"), { recursive: true });
    await writeFile(
      join(domainDir, "src/generated-meta/schema/holiday.schema.ts"),
      HOLIDAY_SCHEMA,
    );
    await writeFile(
      join(domainDir, "package.json"),
      JSON.stringify({ name: "@test/domain-system" }),
    );

    process.chdir(tempDir);
  });

  afterEach(async () => {
    process.chdir(originalCwd);
    process.exit = originalExit;
    await rm(tempDir, { recursive: true, force: true });
    vi.restoreAllMocks();
  });

  it("writes columns the emitted zod text could not have described", async () => {
    const { scaffoldCrudCommand } = await import("../commands/scaffold-crud.js");
    await scaffoldCrudCommand.parseAsync(["node", "simplix", "holiday"]);

    const widgets = join(tempDir, "modules/system/src/widgets/holiday");
    const list = await readFile(join(widgets, "list.tsx"), "utf-8");

    // The list is wired to the domain package's own hook rather than to an empty array.
    expect(list).toContain('import { useListHolidays } from "@test/domain-system";');
    expect(list).toContain('import type { HolidayListDTO } from "@test/domain-system";');
    expect(list).not.toContain("useMockList");

    // Nothing here is the placeholder id/name pair.
    expect(list).toContain('field="holidayName"');
    expect(list).toContain('field="holidayDate"');
    expect(list).not.toMatch(/field="name"/);

    // The five things the template could not have known.
    expect(list).toContain('format="date"');
    expect(list).toContain('display="boolean"');
    expect(list).toContain('enumName="HolidayKind"');
    expect(list).toContain('enumName="HolidayVerification"');

    // A column the backend cannot order by offers no sort, and one it can still does.
    expect(columnOf(list, "holidayName")).not.toContain("sortable");
    expect(columnOf(list, "businessDayExcluded")).not.toContain("sortable");
    expect(columnOf(list, "holidayDate")).toContain("sortable");

    // The filter bar is the search DTO's, read through the same rules the search metadata uses.
    expect(list).toContain('field: "holidayKind"');
    expect(list).toContain('type: "toggle", field: "businessDayExcluded"');
  });

  it("names the record in the delete confirmation by its translated field", async () => {
    const { scaffoldCrudCommand } = await import("../commands/scaffold-crud.js");
    await scaffoldCrudCommand.parseAsync(["node", "simplix", "holiday"]);

    const page = await readFile(
      join(tempDir, "modules/system/src/pages/holiday/crud-page.tsx"),
      "utf-8",
    );
    expect(page).toContain(
      'requestDelete({ id: row.holidayId!, name: String(row.holidayName ?? "") })',
    );
    // The delete mutation is the domain package's, so the page carries no unwired stub.
    expect(page).not.toContain("TODO: Wire up delete mutation");
    expect(page).toContain("useDeleteHoliday");
  });

  it("reads the fields the same file's zod text cannot show", () => {
    // The scaffolder's OpenAPI path matches `X…Schema = z.object(` against this exact file. The
    // update body is emitted as an extension of the create body, so the pattern sees the parent's
    // own fields and nothing else — and reports success while generating that form.
    expect(parseSchemaFields(HOLIDAY_SCHEMA, "holiday").map((one) => one.name)).toEqual([
      "holidayCalendarId",
      "holidayDate",
    ]);
    expect(sourceOf("system", "common.main.system.Holiday").fields).toHaveLength(11);
  });

  it("refuses an entity SimpliX Meta states nothing renderable for", async () => {
    const { scaffoldCrudCommand } = await import("../commands/scaffold-crud.js");
    const { log } = await import("../utils/logger.js");

    await expect(
      scaffoldCrudCommand.parseAsync(["node", "simplix", "avatar"]),
    ).rejects.toThrow("process.exit(1)");

    expect(vi.mocked(log.error).mock.calls.flat().join(" ")).toContain(
      "states no scalar field",
    );
    expect(await pathExists(join(tempDir, "modules/system/src/widgets/avatar"))).toBe(false);
  });
});

/** One `CrudList.Column` of a generated list, from its `field=` to the tag that closes it. */
function columnOf(list: string, field: string): string {
  const at = list.indexOf(`field="${field}"`);
  if (at === -1) throw new Error(`the generated list has no column for ${field}`);
  const end = list.indexOf("/>", at);
  return list.slice(at, end);
}

/** Guards the entity-name rule the whole lookup rests on: a tag's last segment, initial lowered. */
describe("an entity is its tag's last segment", () => {
  it("finds the tag a scaffold argument names", () => {
    expect(entityNameOf("common.main.system.Holiday")).toBe("holiday");
    expect(entityNameOf("site.AreaZone")).toBe("areaZone");
  });
});
