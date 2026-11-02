import { describe, expect, it } from "vitest";

import { describeEntity, formatEntityInfo } from "../meta/entity-info.js";
import type { MetaScaffoldSource } from "../meta/scaffold-source.js";

const base = {
  domain: "system",
  tag: "common.email.EmailLog",
  entity: "emailLog",
  fields: [{ name: "recipientEmail" }, { name: "recipientEmailMasked" }, { name: "subject" }],
  operations: { hasList: false, hasGet: true, hasCreate: false, hasUpdate: false, hasDelete: false, hasTree: false },
  roles: { search: "searchEmailLog", get: "getEmailLog" },
  filters: [{ field: "subject", component: "TextFilter" }],
  keywordSearch: false,
  unreachableRoles: [],
  defaultSort: { field: "createdAt" },
} as unknown as MetaScaffoldSource;

const rich = {
  ...base,
  roles: { ...base.roles, statusCounts: "statusCountsPaymentEvent", counts: "countsAuditEvent", export: "exportAuditEvent", reprocess: "reprocessPaymentEvent" },
  statusCounts: ["status"],
  aggregates: [{ field: "amount", op: "sum" }],
  timeBuckets: { field: "occurredAt", fetch: "countsAuditEvent" },
  keywordSearch: true,
} as unknown as MetaScaffoldSource;

describe("describeEntity", () => {
  it("states what a read-only lookup entity does not offer", () => {
    const info = describeEntity(base, undefined);
    expect(info.list.available).toBe(true);
    expect(info.statusCounts).toEqual([]);
    expect(info.timeRange).toBeUndefined();
    expect(info.export).toBe(false);
    expect(info.keywordSearch).toBe(false);
    expect(info.defaultSort).toEqual({ field: "createdAt", direction: "desc" });
    expect(info.unmasked).toEqual([]);
  });
  it("states the capabilities a figure screen reads", () => {
    const info = describeEntity(rich, undefined);
    expect(info.statusCounts).toEqual(["status"]);
    expect(info.aggregates).toEqual([{ field: "amount", op: "sum" }]);
    expect(info.timeRange).toEqual({ field: "occurredAt", counts: "countsAuditEvent" });
    expect(info.export).toBe(true);
    expect(info.keywordSearch).toBe(true);
    expect(info.actions).toEqual(["reprocess"]);
  });
  it("names the fields a screen draws masked once the project names the suffix", () => {
    expect(describeEntity(base, "Masked").unmasked).toEqual(["recipientEmail"]);
  });
});

describe("formatEntityInfo", () => {
  it("prints none for each capability the entity lacks, and the field names where it has them", () => {
    const poor = formatEntityInfo(describeEntity(base, "Masked"));
    expect(poor).toMatch(/status counts   none/);
    expect(poor).toMatch(/export          none/);
    expect(poor).toMatch(/masked twins    recipientEmail/);
    const full = formatEntityInfo(describeEntity(rich, undefined));
    expect(full).toMatch(/status counts   fields status/);
    expect(full).toMatch(/time range      field occurredAt/);
    expect(full).toMatch(/export          yes/);
  });
});
