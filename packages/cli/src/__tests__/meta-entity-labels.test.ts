import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { ownedTypesOf, serverEntityOf, writeEntityLabels } from "../meta/entity-labels.js";
import { resolveMeta, type ResolvedDomain } from "../meta/resolve.js";
import { metaEntities } from "../meta/write.js";
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
      ["StatusCount", { name: "StatusCount", meta: { javaClass: "x.StatusCount" }, ancestors: [], reachedBy: ["admin.jobs.BackgroundJob"], allFields: [field("count", { en: "Count", ko: "건수" }), field("status")] }],
      ["Other", { name: "Other", meta: { javaClass: "x.Other" }, ancestors: [], reachedBy: ["admin.other.Thing"], allFields: [field("count", { ko: "다른 건수" })] }],
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
        ...(domain.types as Map<string, unknown>),
        ["Job", { name: "Job", meta: { javaClass: "x.Job" }, ancestors: [], reachedBy: ["admin.jobs.BackgroundJob"], allFields: [field("retries", { en: "Retries", ko: "재시도" })] }],
      ]),
    } as unknown as ResolvedDomain;
    const declaring = { ...document, entities: { Job: { javaClass: "x.Job" } } } as unknown as DtoMeta;
    await writeEntityLabels(dir, holding, declaring, ["ko"]);
    const ko = JSON.parse(await readFile(join(dir, "src/locales/ko.json"), "utf-8"));
    expect(ko.backgroundJob.fields.retries).toBeUndefined();
    expect(ko.backgroundJob.fields.count).toBe("건수");
  });
});

describe("a DTO two entities reach", () => {
  // Both entities return ActivityDTO (and its nested EventDTO) and CountDTO. CurrentSignIn sorts
  // first, so a resolver that hands a shared type to one entity gives UserAccount none of their
  // labels, and its catalog keeps whatever words another writer left there.
  const text = (name: string, labels?: Record<string, string>) => ({
    name, type: { kind: "string" }, required: false, nullable: true, ...(labels ? { labelKey: `field.${name}`, labels } : {}),
  });
  const ref = (name: string) => ({ kind: "ref", name });
  const list = (name: string) => ({ kind: "container", name: "List", args: [ref(name)] });
  const op = (id: string, tag: string, response: unknown) => ({
    id, method: "GET", path: `/${id}`, tag, access: { kind: "public" }, response, request: { query: [], path: [] },
  });
  const document = {
    version: 1,
    enums: {},
    types: {
      ActivityDTO: { javaClass: "x.ActivityDTO", typeParams: [], fields: [{ ...text("events", { en: "Sign-in events", ko: "로그인 이벤트" }), type: list("EventDTO") }] },
      EventDTO: {
        javaClass: "x.EventDTO",
        typeParams: [],
        fields: [text("ipAddress", { en: "IP address", ko: "IP 주소" }), { ...text("client"), type: ref("Client") }],
      },
      // Another entity's class, held as a reference: its fields are its own catalog's.
      Client: { javaClass: "x.Client", typeParams: [], fields: [text("secret", { en: "Secret", ko: "비밀" })] },
      CountDTO: { javaClass: "x.CountDTO", typeParams: [], fields: [text("status", { en: "Status", ko: "상태" })] },
      UserAccountDTO: { javaClass: "x.UserAccountDTO", typeParams: [], fields: [text("status", { en: "Account status", ko: "계정 상태" })] },
    },
    operations: [
      op("mine", "user.CurrentSignIn", ref("ActivityDTO")),
      op("mineCounts", "user.CurrentSignIn", list("CountDTO")),
      op("account", "user.UserAccount", ref("UserAccountDTO")),
      op("accountSignIn", "user.UserAccount", ref("ActivityDTO")),
      op("accountCounts", "user.UserAccount", list("CountDTO")),
    ],
    entities: { Client: { javaClass: "x.Client" } },
  } as unknown as DtoMeta;
  const domain = resolveMeta(document, {
    domains: { user: ["user.CurrentSignIn", "user.UserAccount"] },
    containerTypes: { List: { ts: "Array", zod: "z.array" } },
  }).domains.get("user")!;
  const account = domain.entities.find((one) => one.tag === "user.UserAccount")!;

  let dir: string;
  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), "shared-labels-"));
    await mkdir(join(dir, "src/locales"), { recursive: true });
    // Humanised words another writer left, beside keys a person wrote that no generator owns.
    const stale = { events: "Events", ipAddress: "Ip Address", note: "Hand note" };
    await writeFile(join(dir, "src/locales/en.json"), JSON.stringify({ userAccount: { hint: "Hand hint", fields: stale } }));
    await writeFile(join(dir, "src/locales/ko.json"), JSON.stringify({ userAccount: { hint: "직접 쓴 안내", fields: { ...stale, note: "직접 쓴 메모" } } }));
  });
  afterEach(async () => rm(dir, { recursive: true, force: true }));

  it("labels the shared fields in the second entity's catalog, in every locale", async () => {
    await writeEntityLabels(dir, domain, document, ["en", "ko"]);
    const en = JSON.parse(await readFile(join(dir, "src/locales/en.json"), "utf-8"));
    const ko = JSON.parse(await readFile(join(dir, "src/locales/ko.json"), "utf-8"));
    expect(ko.userAccount.fields).toMatchObject({ events: "로그인 이벤트", ipAddress: "IP 주소" });
    expect(en.userAccount.fields).toMatchObject({ events: "Sign-in events", ipAddress: "IP address" });
    // The first entity keeps them too: each reaching entity's catalog gets its own copy.
    expect(ko.currentSignIn.fields).toMatchObject({ events: "로그인 이벤트", ipAddress: "IP 주소", status: "상태" });
  });

  it("lets the entity's own DTO decide a field a shared DTO also names", async () => {
    await writeEntityLabels(dir, domain, document, ["ko"]);
    const ko = JSON.parse(await readFile(join(dir, "src/locales/ko.json"), "utf-8"));
    expect(ko.userAccount.fields.status).toBe("계정 상태");
  });

  it("still leaves out another entity's class, and keeps the keys no generator owns", async () => {
    await writeEntityLabels(dir, domain, document, ["ko"]);
    const ko = JSON.parse(await readFile(join(dir, "src/locales/ko.json"), "utf-8"));
    expect(ko.userAccount.fields.secret).toBeUndefined();
    expect(ko.userAccount.fields.note).toBe("직접 쓴 메모");
    expect(ko.userAccount.hint).toBe("직접 쓴 안내");
    const names = ownedTypesOf(domain, account, document).map((one) => one.name);
    expect(names).not.toContain("Client");
    expect(names).toEqual(["ActivityDTO", "CountDTO", "EventDTO", "UserAccountDTO"]);
  });

  it("lists the shared fields for the second entity's locale overlay and server translations", () => {
    const fields = metaEntities(domain, document).find((one) => one.name === "userAccount")?.fields.map((one) => one.name);
    expect(fields).toEqual(expect.arrayContaining(["events", "ipAddress", "status"]));
    expect(fields).not.toContain("secret");
  });
});
