import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { serverEntityOf, writeEntityLabels } from "../meta/entity-labels.js";
import type { ResolvedDomain } from "../meta/resolve.js";
import type { DtoMeta } from "../meta/types.js";

describe("an entity's name from SimpliX Meta", () => {
  let dir: string;
  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), "entity-labels-"));
    await mkdir(join(dir, "src/locales"), { recursive: true });
    await writeFile(join(dir, "src/locales/en.json"), JSON.stringify({ jobPosition: { fields: { positionName: "Position Name" } } }));
    await writeFile(join(dir, "src/locales/ko.json"), JSON.stringify({}));
  });
  afterEach(async () => rm(dir, { recursive: true, force: true }));

  const domain = { entities: [{ tag: "user.admin.JobPosition", patterns: [], operations: [] }] } as unknown as ResolvedDomain;
  const document = {
    version: 1, enums: {}, types: {}, operations: [],
    entities: { JobPosition: { label: { en: "Job Position" }, plural: { en: "Job Positions", ko: "Positions-ko" }, description: { en: "Ranks and titles." } } },
  } as DtoMeta;

  it("is written beside the field labels, and a locale with no name stays without one", async () => {
    await writeEntityLabels(dir, domain, document, ["en", "ko"]);
    const en = JSON.parse(await readFile(join(dir, "src/locales/en.json"), "utf-8"));
    const ko = JSON.parse(await readFile(join(dir, "src/locales/ko.json"), "utf-8"));
    expect(en.jobPosition).toEqual({ fields: { positionName: "Position Name" }, _label: "Job Position", _plural: "Job Positions", _description: "Ranks and titles." });
    expect(ko.jobPosition).toEqual({ _plural: "Positions-ko" });
  });

  it("names a second surface over an entity after the entity its operations serve", async () => {
    const second = {
      entities: [{ tag: "user.portal.MyJobPosition", patterns: [], operations: [{ id: "a", entity: "JobPosition" }] }],
    } as unknown as ResolvedDomain;
    await writeEntityLabels(dir, second, document, ["en"]);
    const en = JSON.parse(await readFile(join(dir, "src/locales/en.json"), "utf-8"));
    expect(en.myJobPosition).toEqual({ _label: "Job Position", _plural: "Job Positions", _description: "Ranks and titles." });
  });
});

describe("serverEntityOf", () => {
  const known = new Set(["Order", "Line"]);
  it("is the tag's own entity when the document declares it", () => {
    expect(serverEntityOf({ tag: "admin.Order", operations: [] }, known)).toBe("Order");
  });
  it("is the one entity a second surface's operations name", () => {
    const operations = [{ entity: "Order" }, { entity: "Order" }] as never;
    expect(serverEntityOf({ tag: "portal.MyOrder", operations }, known)).toBe("Order");
  });
  it("is undefined when the operations name none, or more than one", () => {
    expect(serverEntityOf({ tag: "portal.Mine", operations: [] }, known)).toBeUndefined();
    const mixed = [{ entity: "Order" }, { entity: "Line" }] as never;
    expect(serverEntityOf({ tag: "portal.Mine", operations: mixed }, known)).toBeUndefined();
  });
});

describe("a field's keyed label from SimpliX Meta", () => {
  let dir: string;
  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), "field-labels-"));
    await mkdir(join(dir, "src/locales"), { recursive: true });
    await writeFile(join(dir, "src/locales/en.json"), JSON.stringify({ backgroundJob: { fields: { count: "Count", status: "Status" } } }));
    await writeFile(join(dir, "src/locales/ko.json"), JSON.stringify({ backgroundJob: { fields: { count: "Count", status: "상태" } } }));
  });
  afterEach(async () => rm(dir, { recursive: true, force: true }));

  const field = (name: string, labels?: Record<string, string>) => ({
    name, type: { kind: "number" }, required: false, nullable: true, ...(labels ? { labelKey: "field.x", labels } : {}),
  });
  const domain = {
    entities: [{ tag: "admin.jobs.BackgroundJob", patterns: [], operations: [] }],
    types: new Map([
      ["StatusCount", { name: "StatusCount", meta: { javaClass: "x.StatusCount" }, ancestors: [], owner: "admin.jobs.BackgroundJob", allFields: [field("count", { en: "Count", ko: "건수" }), field("status")] }],
      ["Other", { name: "Other", meta: { javaClass: "x.Other" }, ancestors: [], owner: "admin.other.Thing", allFields: [field("count", { ko: "다른 건수" })] }],
    ]),
  } as unknown as ResolvedDomain;
  const document = { version: 1, enums: {}, types: {}, operations: [] } as DtoMeta;

  it("is written under fields in every locale it resolves in, even for an entity the server does not name", async () => {
    await writeEntityLabels(dir, domain, document, ["en", "ko"]);
    const ko = JSON.parse(await readFile(join(dir, "src/locales/ko.json"), "utf-8"));
    const en = JSON.parse(await readFile(join(dir, "src/locales/en.json"), "utf-8"));
    expect(ko.backgroundJob).toEqual({ fields: { count: "건수", status: "상태" } });
    expect(en.backgroundJob).toEqual({ fields: { count: "Count", status: "Status" } });
  });

  it("leaves out the labels of another entity a DTO of this one holds as a reference", async () => {
    const holding = {
      ...domain,
      types: new Map([
        ...domain.types,
        ["Job", { name: "Job", meta: { javaClass: "x.Job" }, ancestors: [], owner: "admin.jobs.BackgroundJob", allFields: [field("retries", { en: "Retries", ko: "재시도" })] }],
      ]),
    } as unknown as ResolvedDomain;
    const declaring = { ...document, entities: { Job: { javaClass: "x.Job" } } } as unknown as DtoMeta;
    await writeEntityLabels(dir, holding, declaring, ["ko"]);
    const ko = JSON.parse(await readFile(join(dir, "src/locales/ko.json"), "utf-8"));
    expect(ko.backgroundJob.fields.retries).toBeUndefined();
    expect(ko.backgroundJob.fields.count).toBe("건수");
  });
});
