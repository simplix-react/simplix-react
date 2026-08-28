import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, it, expect } from "vitest";
import type { DtoMeta, OperationMeta, TypeRef } from "../meta/ir-types.js";
import type { ContainerMapping } from "../openapi/orchestration/spec-profile.js";
import { resolveMeta, FRAMEWORK_PACKAGE_PREFIXES } from "../meta/resolve.js";

const fixturePath = fileURLToPath(new URL("../meta/__fixtures__/smart-safety-meta.json", import.meta.url));

function loadFixture(): DtoMeta {
  return JSON.parse(readFileSync(fixturePath, "utf-8"));
}

const meta = loadFixture();

/**
 * What the simplix-boot profile contributes. Only which names are mapped matters here — the
 * TypeScript side of the mapping is the generator's business, not the resolver's.
 */
const containerTypes: Record<string, ContainerMapping> = {
  SimpliXApiResponse: { unwrap: true },
  Page: { ts: "SpringPage", zod: "pageOf", import: "@simplix-react-ext/simplix-boot-auth" },
  List: { ts: "Array", zod: "z.array" },
  Map: { ts: "Record", zod: "z.record", keyType: "string" },
};

/**
 * The application's own 13 domains, copied from its `simplix.config.ts`. `data-io` is a quoted
 * key there; a reader that only accepts bare identifiers drops it and its 44 operations.
 */
const smartSafetyDomains: Record<string, string[]> = {
  "dashboard": [
    "dashboard.Dashboard",
  ],
  "space": [
    "space.Site",
    "space.SiteConfiguration",
    "space.SiteClosure",
    "space.Area",
    "space.Drawing",
    "space.ShiftConfig",
    "space.Equipment",
    "space.EquipmentDisposal",
    "space.NumberedDocumentKind",
  ],
  "site": [
    "site.AreaZone",
    "site.SafetyZonePolicy",
    "site.SiteOnboarding",
    "site.EquipmentInspection",
    "site.EquipmentJudgement",
    "site.LinearAsset",
    "site.WorkPoint",
  ],
  "worker": [
    "party.roster.Worker",
    "party.roster.WorkerCensus",
    "party.roster.WorkerInvitation",
    "party.roster.WorkerExit",
    "party.roster.WorkerProtectedFields",
  ],
  "org": [
    "org.Organization",
    "org.OrgType",
  ],
  "regulation": [
    "regulation.RegulationPack",
    "regulation.LawPackInstallation",
    "regulation.LawPackCensus",
    "regulation.RegulationRegisterEntry",
    "regulation.RegulationDuty",
    "regulation.LawRegisterCensus",
    "regulation.LawScreenMap",
    "regulation.ComplianceCheck",
    "regulation.ComplianceRun",
    "regulation.ObligationApplicability",
    "regulation.ObligationAssessment",
    "regulation.ObligationCensus",
    "regulation.PolicyParameter",
    "regulation.PolicyValueResolution",
    "regulation.PolicyValueCensus",
    "regulation.PolicyWarning",
    "regulation.RetentionPolicy",
    "regulation.RetentionPolicyCensus",
    "regulation.PreAssignmentGate",
    "regulation.GatePolicyCensus",
    "regulation.ContentLanguage",
    "regulation.ContentLanguageCensus",
  ],
  "auth": [
    "common.auth.RoleScopeGrant",
    "common.auth.SecurityPolicy",
    "common.auth.HealthSeparationSetting",
    "common.auth.IdentityProviderConfig",
    "common.auth.AuthSession",
    "public.auth.SignInOption",
    "common.auth.ScopeAxis",
  ],
  "audit": [
    "audit.AuditLog",
    "audit.MasterDataHistory",
    "common.main.audit.AuditEvent",
  ],
  "notification": [
    "notification.Notification",
    "notification.NotificationCentre",
    "notification.NotificationHistoryCensus",
    "notification.NotificationRule",
    "notification.NotificationRuleCensus",
    "notification.NotificationDelivery",
    "notification.MessageChannel",
    "notification.MessageChannelCensus",
    "notification.MessageTemplate",
    "notification.MessageTemplateCensus",
    "notification.MessagePreview",
    "notification.MailConfig",
    "notification.MailConfigCensus",
    "notification.MailTestLog",
    "notification.Notice",
    "notification.NoticeCensus",
    "notification.EmergencyContact",
    "notification.EmergencyContactCensus",
    "notification.OnCallRoster",
    "notification.OnCallRosterCensus",
    "notification.DutyRoster",
  ],
  "approval": [
    "approval.ApprovalInbox",
    "approval.ApprovalRequest",
    "approval.ApprovalLineTemplate",
    "approval.ApprovalLineCensus",
    "approval.ApprovalDelegation",
    "approval.ApprovalDelegationCensus",
    "approval.DelegationPolicy",
    "approval.DelegationPolicyCensus",
  ],
  "data-io": [
    "data-io.ImportJob",
    "data-io.ImportCensus",
    "data-io.ImportRun",
    "data-io.BulkOperation",
    "data-io.BulkCensus",
    "data-io.BulkReversal",
    "data-io.DuplicateCandidate",
    "data-io.DuplicateCensus",
    "data-io.DuplicateMerge",
    "data-io.ExportLedger",
    "data-io.ExportCensus",
  ],
  "system": [
    "common.main.system.SystemSetting",
    "common.main.system.HolidayCalendar",
    "common.main.system.Holiday",
    "system.SiteSettings",
    "system.NotificationSettings",
    "system.ExportJob",
    "system.ExportDownload",
    "system.MailCheck",
    "system.ConsoleNotification",
    "system.NoticeDismissal",
    "common.email.EmailLog",
    "public.system.DeploymentBootstrap",
    "public.system.InstallationSetup",
  ],
  "user": [
    "user.admin.UserAccount",
    "user.admin.UserAvatar",
    "user.admin.UserRole",
    "user.admin.UserSecurityProfile",
    "user.admin.UserNote",
    "user.admin.JobPosition",
    "user.admin.StatutoryAppointmentKind",
    "user.admin.UserAccessLog",
    "user.admin.UserAccountCensus",
    "common.user.CurrentUser",
    "common.user.CurrentUserSession",
    "common.user.CurrentUserAvatar",
    "common.user.CurrentUserPermissions",
    "common.user.MfaChallenge",
    "common.auth.AuthPermission",
    "common.auth.AuthRolePermission",
    "public.user.OperatorLink",
    "public.user.Avatar",
    "public.user.AvatarThumbnail",
    "public.user.Permissions",
  ],
};

/**
 * A second walker, written independently of `resolveMeta`, so a closure is checked against
 * something other than the code that produced it.
 */
function reachableFrom(operations: OperationMeta[]): { types: Set<string>; enums: Set<string> } {
  const types = new Set<string>();
  const enums = new Set<string>();

  const fromRef = (ref: TypeRef): void => {
    if (ref.kind === "ref") {
      fromType(ref.name);
      for (const arg of ref.args ?? []) fromRef(arg);
    } else if (ref.kind === "enum") {
      enums.add(ref.name);
    } else if (ref.kind === "container") {
      for (const arg of ref.args) fromRef(arg);
    } else if (ref.kind === "pick") {
      fromType(ref.of);
    }
  };

  const fromType = (name: string): void => {
    if (types.has(name)) return;
    const type = meta.types[name];
    if (!type) return;
    types.add(name);
    if (type.extends) fromType(type.extends);
    for (const field of type.fields) fromRef(field.type);
  };

  for (const operation of operations) {
    if (operation.response) fromRef(operation.response);
    if (operation.request.body) fromRef(operation.request.body);
    if (operation.request.searchDto) fromType(operation.request.searchDto);
    for (const param of operation.request.query) fromRef(param.type);
    for (const param of operation.request.path) fromRef(param.type);
  }

  return { types, enums };
}

function sorted(values: Iterable<string>): string[] {
  return [...values].sort();
}

/** A hand-built IR, small enough that every assertion about it can be read off the literal. */
function tinyMeta(): DtoMeta {
  return {
    version: 1,
    enums: {
      Colour: { labeled: false, values: [{ name: "RED" }, { name: "BLUE" }] },
      Size: { labeled: true, values: [{ name: "S", labelKey: "size.s" }] },
    },
    types: {
      Base: {
        javaClass: "app.Base",
        typeParams: ["K"],
        fields: [{ name: "id", type: { kind: "param", name: "K" }, required: true, nullable: false }],
      },
      Item: {
        javaClass: "app.Item",
        extends: "Base",
        typeParams: [],
        fields: [
          { name: "id", type: { kind: "string" }, required: true, nullable: false },
          { name: "colour", type: { kind: "enum", name: "Colour" }, required: true, nullable: false },
        ],
      },
      ItemSearch: {
        javaClass: "app.ItemSearch",
        typeParams: [],
        fields: [{ name: "size", type: { kind: "enum", name: "Size" }, required: false, nullable: true }],
      },
      Summary: {
        javaClass: "app.Summary",
        typeParams: [],
        fields: [{ name: "item", type: { kind: "pick", of: "Item", fields: ["id"] }, required: true, nullable: false }],
      },
    },
    operations: [
      {
        id: "listB",
        method: "GET",
        path: "/b",
        tag: "shop.B",
        access: { kind: "public" },
        response: { kind: "container", name: "List", args: [{ kind: "ref", name: "Item" }] },
        request: { query: [], path: [], searchDto: "ItemSearch" },
      },
      {
        id: "getA",
        method: "GET",
        path: "/a",
        tag: "shop.A",
        access: { kind: "public" },
        response: { kind: "ref", name: "Summary" },
        request: { query: [], path: [] },
      },
    ],
  };
}

describe("resolveMeta against the smart-safety capture", () => {
  const resolved = resolveMeta(meta, { domains: smartSafetyDomains, containerTypes });

  it("reaches all 646 types and 133 enums from a catch-all domain", () => {
    const everyTag = [...new Set(meta.operations.map((operation) => operation.tag))];
    const catchAll = resolveMeta(meta, { domains: { all: everyTag }, containerTypes });
    const all = catchAll.domains.get("all");

    expect(all?.entities).toHaveLength(139);
    expect(all?.operations).toHaveLength(694);
    expect(all?.types.size).toBe(646);
    expect(all?.enums.size).toBe(133);
    expect(catchAll.unmatched).toEqual([]);
    expect(catchAll.deadPatterns).toEqual([]);
  });

  it("puts nothing in a domain's closure that its own operations do not reach", () => {
    for (const domain of resolved.domains.values()) {
      const reference = reachableFrom(domain.operations);
      expect(sorted(domain.types.keys())).toEqual(sorted(reference.types));
      expect(sorted(domain.enums.keys())).toEqual(sorted(reference.enums));
    }
  });

  it("resolves every extends edge — 104 of them, none dangling", () => {
    const edges = Object.entries(meta.types).filter(([, type]) => type.extends !== undefined);
    expect(edges).toHaveLength(104);
    for (const [, type] of edges) {
      expect(meta.types[type.extends ?? ""]).toBeDefined();
    }
    expect(resolved.missingTypes).toEqual([]);
    expect(resolved.missingEnums).toEqual([]);
  });

  it("pulls an ancestor into a domain even when only the child is tagged there", () => {
    // AreaZoneUpdateFormDTO is reached only by site.AreaZone; its three ancestors belong to the
    // Area screens in `space` and have to be declared in `site` as well.
    const site = resolved.domains.get("site");
    const space = resolved.domains.get("space");

    expect(site?.types.get("AreaZoneUpdateFormDTO")?.ancestors).toEqual([
      "AreaUpdateFormDTO",
      "AreaUpdateDTO",
      "AreaCreateDTO",
    ]);
    expect(space?.types.has("AreaZoneUpdateFormDTO")).toBe(false);

    for (const ancestor of ["AreaUpdateFormDTO", "AreaUpdateDTO", "AreaCreateDTO"]) {
      expect(site?.types.has(ancestor)).toBe(true);
      expect(space?.types.has(ancestor)).toBe(true);
    }
  });

  it("reports 73 operations across 13 tags that no domain claims", () => {
    const counts = Object.fromEntries(
      resolved.unmatched.map((entry) => [entry.tag, entry.operations.length]),
    );

    expect(counts).toEqual({
      "dev.test.UserPermission": 11,
      "dev.test.Error": 10,
      "dev.test.Response": 9,
      StreamAdminController: 16,
      CurrentUserRestController: 8,
      SseStreamController: 6,
      "Auth Token": 3,
      "OAuth2 Social Login": 3,
      PasswordWebController: 2,
      SimpliXAuthLoginController: 1,
      ScalarController: 2,
      "public.file.Content": 1,
      "dev.backoffice": 1,
    });

    const unmatchedOperations = resolved.unmatched.reduce(
      (total, entry) => total + entry.operations.length,
      0,
    );
    const matchedOperations = [...resolved.domains.values()].reduce(
      (total, domain) => total + domain.operations.length,
      0,
    );
    expect(unmatchedOperations).toBe(73);
    expect(matchedOperations).toBe(621);
    expect(matchedOperations + unmatchedOperations).toBe(meta.operations.length);
  });

  it("names the three configured patterns no tag answers", () => {
    expect(resolved.deadPatterns).toEqual([
      { domain: "user", pattern: "common.user.CurrentUser" },
      { domain: "user", pattern: "common.user.CurrentUserAvatar" },
      { domain: "user", pattern: "public.user.AvatarThumbnail" },
    ]);
  });

  it("lets no framework type into a closure but Comparable", () => {
    expect(resolved.frameworkTypes).toEqual([
      { name: "Comparable", javaClass: "java.lang.Comparable", domain: "user" },
    ]);

    for (const domain of resolved.domains.values()) {
      for (const type of domain.types.values()) {
        const framework = FRAMEWORK_PACKAGE_PREFIXES.some((prefix) =>
          type.meta.javaClass.startsWith(prefix),
        );
        expect(framework && type.name !== "Comparable").toBe(false);
      }
    }
  });

  it("keeps own fields apart from inherited ones", () => {
    const baseEntity = resolved.domains.get("user")?.types.get("BaseEntity");

    expect(baseEntity?.ancestors).toEqual(["SimpliXBaseEntity"]);
    expect(baseEntity?.meta.fields.map((field) => field.name)).toEqual([
      "createdAt",
      "updatedAt",
      "createdBy",
      "updatedBy",
      "version",
      "eventPayloadData",
    ]);
    // `id` is declared by SimpliXBaseEntity and appears only in the merged list.
    expect(baseEntity?.allFields.map((field) => field.name)).toEqual([
      "id",
      "createdAt",
      "updatedAt",
      "createdBy",
      "updatedBy",
      "version",
      "eventPayloadData",
    ]);

    const areaZone = resolved.domains.get("site")?.types.get("AreaZoneUpdateFormDTO");
    expect(areaZone?.meta.fields.map((field) => field.name)).toEqual(["safetyZoneType"]);
    expect(areaZone?.allFields).toHaveLength(17);
    expect(areaZone?.allFields.at(-1)?.name).toBe("safetyZoneType");
  });

  it("carries the type parameters of the three generic types", () => {
    const generic = Object.entries(meta.types)
      .filter(([, type]) => type.typeParams.length > 0)
      .map(([name, type]) => `${name}<${type.typeParams.join(", ")}>`);
    expect(generic.sort()).toEqual(["BaseEntity<K>", "Comparable<T>", "SimpliXBaseEntity<K>"]);

    const user = resolved.domains.get("user");
    expect(user?.types.get("BaseEntity")?.meta.typeParams).toEqual(["K"]);
    expect(user?.types.get("SimpliXBaseEntity")?.meta.typeParams).toEqual(["K"]);
    expect(user?.types.get("Comparable")?.meta.typeParams).toEqual(["T"]);
  });

  it("reports the fourteen declarations two domains both have to emit", () => {
    expect(resolved.sharedDeclarations).toEqual([
      { name: "AreaCreateDTO", kind: "type", domains: ["space", "site"] },
      { name: "AreaDetailDTO", kind: "type", domains: ["space", "site"] },
      { name: "AreaKind", kind: "enum", domains: ["space", "site"] },
      { name: "AreaStatus", kind: "enum", domains: ["space", "site"] },
      { name: "AreaUpdateDTO", kind: "type", domains: ["space", "site"] },
      { name: "AreaUpdateFormDTO", kind: "type", domains: ["space", "site"] },
      { name: "BaseEntity", kind: "type", domains: ["notification", "user"] },
      { name: "EquipmentInstallationForm", kind: "enum", domains: ["space", "site"] },
      { name: "EquipmentListDTO", kind: "type", domains: ["space", "site"] },
      { name: "EquipmentStatus", kind: "enum", domains: ["space", "site"] },
      { name: "ExportFormat", kind: "enum", domains: ["data-io", "system"] },
      { name: "ExportStatus", kind: "enum", domains: ["data-io", "system"] },
      { name: "PolicySource", kind: "enum", domains: ["space", "site"] },
      { name: "SimpliXBaseEntity", kind: "type", domains: ["notification", "user"] },
    ]);
  });

  it("keeps the quoted data-io key, with its 44 operations", () => {
    expect([...resolved.domains.keys()]).toHaveLength(13);
    expect(resolved.domains.get("data-io")?.operations).toHaveLength(44);
  });

  it("gives every type in a closure exactly one owning entity", () => {
    for (const domain of resolved.domains.values()) {
      const tags = new Set(domain.entities.map((entity) => entity.tag));
      for (const type of domain.types.values()) {
        expect(tags.has(type.owner)).toBe(true);
      }
      for (const declared of domain.enums.values()) {
        expect(tags.has(declared.owner)).toBe(true);
      }
    }
  });

  it("maps every container the closures reach", () => {
    expect(resolved.unmappedContainers).toEqual([]);
    for (const domain of resolved.domains.values()) {
      expect(domain.containers.has("SimpliXApiResponse")).toBe(true);
    }
  });
});

describe("resolveMeta mechanics", () => {
  it("matches a pattern exactly unless it is written as a regex", () => {
    const wildcard = resolveMeta(tinyMeta(), { domains: { shop: ["shop.*"] }, containerTypes });
    expect(wildcard.domains.get("shop")?.entities).toEqual([]);
    expect(wildcard.deadPatterns).toEqual([{ domain: "shop", pattern: "shop.*" }]);
    expect(wildcard.unmatched.map((entry) => entry.tag)).toEqual(["shop.B", "shop.A"]);

    const regex = resolveMeta(tinyMeta(), { domains: { shop: ["/^shop\\./"] }, containerTypes });
    expect(regex.domains.get("shop")?.entities.map((entity) => entity.tag)).toEqual([
      "shop.A",
      "shop.B",
    ]);
    expect(regex.unmatched).toEqual([]);
    expect(regex.deadPatterns).toEqual([]);
  });

  it("assigns a shared type to the alphabetically first entity, not the first in the IR", () => {
    // The IR lists shop.B first and both entities reach Item — through the list response for B
    // and through Summary's `pick` for A. Ownership follows the sorted tag order.
    const resolvedTiny = resolveMeta(tinyMeta(), {
      domains: { shop: ["shop.A", "shop.B"] },
      containerTypes,
    });
    const shop = resolvedTiny.domains.get("shop");

    expect(shop?.entities.map((entity) => entity.tag)).toEqual(["shop.A", "shop.B"]);
    expect(shop?.types.get("Item")?.owner).toBe("shop.A");
    expect(shop?.types.get("Base")?.owner).toBe("shop.A");
    expect(shop?.types.get("ItemSearch")?.owner).toBe("shop.B");
    expect(shop?.enums.get("Colour")?.owner).toBe("shop.A");
    expect(shop?.enums.get("Size")?.owner).toBe("shop.B");
    expect(shop?.entities.map((entity) => entity.patterns)).toEqual([["shop.A"], ["shop.B"]]);
  });

  it("follows a pick to the type it subsets, and a searchDto to its DTO", () => {
    const resolvedTiny = resolveMeta(tinyMeta(), { domains: { shop: ["shop.A"] }, containerTypes });
    const shop = resolvedTiny.domains.get("shop");
    expect(sorted(shop?.types.keys() ?? [])).toEqual(["Base", "Item", "Summary"]);

    const withSearch = resolveMeta(tinyMeta(), { domains: { shop: ["shop.B"] }, containerTypes });
    expect(sorted(withSearch.domains.get("shop")?.types.keys() ?? [])).toEqual([
      "Base",
      "Item",
      "ItemSearch",
    ]);
  });

  it("reports a reference the IR does not declare rather than dropping it", () => {
    const broken = tinyMeta();
    broken.operations[1].response = { kind: "ref", name: "Nowhere" };
    broken.types["Item"].fields.push({
      name: "ghost",
      type: { kind: "enum", name: "NoSuchEnum" },
      required: false,
      nullable: true,
    });

    const resolvedBroken = resolveMeta(broken, { domains: { shop: ["/^shop\\./"] }, containerTypes });
    expect(resolvedBroken.missingTypes).toEqual(["Nowhere"]);
    expect(resolvedBroken.missingEnums).toEqual(["NoSuchEnum"]);
    expect(resolvedBroken.domains.get("shop")?.types.has("Nowhere")).toBe(false);
  });

  it("reports a container the profile does not map", () => {
    const resolvedTiny = resolveMeta(tinyMeta(), {
      domains: { shop: ["shop.B"] },
      containerTypes: {},
    });
    expect(resolvedTiny.unmappedContainers).toEqual(["List"]);
    expect(resolvedTiny.domains.get("shop")?.containers.size).toBe(0);
  });

  it("refuses a circular extends chain rather than looping", () => {
    const looping = tinyMeta();
    looping.types["Base"].extends = "Item";

    expect(() => resolveMeta(looping, { domains: { shop: ["shop.B"] }, containerTypes })).toThrow(
      /Circular extends chain/,
    );
  });
});
