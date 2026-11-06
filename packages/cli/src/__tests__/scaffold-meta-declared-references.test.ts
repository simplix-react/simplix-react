import { fileURLToPath } from "node:url";
import ts from "typescript";
import { describe, expect, it, vi } from "vitest";

import { holdersOf, orderAndCategorizeFields, projectRowFields, withContractKinds, type FieldInfo } from "../commands/scaffold-crud.js";
import { loadMetaHolders, loadMetaScaffoldSource, type MetaScaffoldSource } from "../meta/scaffold-source.js";
import type { OpenApiNamingStrategy } from "../openapi/naming/naming-strategy.js";
import type { ContainerMapping } from "../openapi/orchestration/spec-profile.js";
import { registerSpecProfile } from "../openapi/plugin-registry.js";
import { renderTemplate } from "../utils/template.js";

/**
 * A note whose rows carry one reference of every shape SimpliX Meta declares, added to the list and
 * detail DTOs of the note fixture:
 *
 * - `reviewerId` → UserAccount, named by the `reviewerName` sibling (the `<stem>Name` pairing)
 * - `actorUserId` → UserAccount, named by `actorName`, which no stem rule reaches
 * - `approverId` → UserAccount, named by `approvedByName`, which the reference itself states
 * - `accountId` → Ledger, named by `ownerName`, the field the ledger entity declares its name by
 * - `actorId` by kind on `actorType`, named by `actorUsername`, which the reference states
 * - `subjectId` by kind on `subjectType`: RUN → Run, VOICE → Voice, CREW → Crew (not served), and
 *   SYSTEM names nothing; no name field at all, and a `subject` text beside it (a subject line,
 *   which the key's bare stem would wrongly read as the subject record's name)
 * - `holdId` → Hold, an entity declaring no name field, with no sibling naming it
 * - `crewId`, declared nowhere, beside a `crewName` (the older Meta shape)
 * - `ownerAccountId` → UserAccount, named by `owner.nativeName`, a path the reference states through
 *   the nested `owner` record, which does not share the key's stem
 */
vi.mock("../config/config-loader.js", async () => {
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const { mkdtempSync, readFileSync, writeFileSync } = await import("node:fs");
  const { fileURLToPath: toPath } = await import("node:url");
  const document = JSON.parse(readFileSync(toPath(new URL("../meta/__fixtures__/user-note-meta.json", import.meta.url)), "utf-8"));
  const text = (name: string, extra: Record<string, unknown> = {}) => ({ name, type: { kind: "string" }, required: false, nullable: true, ...extra });
  const ref = (entity: string, idField: string, extra: Record<string, unknown> = {}) => ({ reference: { entity, idField, many: false, ...extra } });
  const added = [
    text("reviewerId", ref("UserAccount", "userId")),
    text("reviewerName"),
    text("actorUserId", ref("UserAccount", "userId")),
    text("actorName"),
    text("approverId", ref("UserAccount", "userId", { nameField: "approvedByName" })),
    text("approvedByName"),
    text("accountId", ref("Ledger", "ledgerId")),
    text("ownerName"),
    { name: "actorType", type: { kind: "enum", name: "ActorType" }, required: false, nullable: true },
    text("actorId", { reference: { many: false, kindField: "actorType", kinds: { USER: "UserAccount" }, nameField: "actorUsername" } }),
    text("actorUsername"),
    { name: "subjectType", type: { kind: "enum", name: "SubjectType" }, required: false, nullable: true },
    text("subjectId", { reference: { many: false, kindField: "subjectType", kinds: { RUN: "Run", VOICE: "Voice", CREW: "Crew" } } }),
    text("subject"),
    text("holdId", ref("Hold", "holdId")),
    text("crewId"),
    text("crewName"),
    text("ownerAccountId", ref("UserAccount", "userId", { nameField: "owner.nativeName" })),
    { name: "owner", type: { kind: "ref", name: "UserAccount" }, required: false, nullable: true },
  ];
  document.types.UserNoteListDTO.fields.push(...added);
  document.types.UserNoteDetailDTO.fields.push(...added);
  const values = (names: string[]) => ({ values: names.map((name) => ({ name })) });
  document.enums.ActorType = values(["USER", "SYSTEM"]);
  document.enums.SubjectType = values(["RUN", "VOICE", "CREW", "SYSTEM"]);
  document.entities.Ledger = { idField: "ledgerId", nameFields: ["ownerName"] };
  document.entities.Run = { idField: "runId", nameFields: ["kind"] };
  document.entities.Voice = { idField: "voiceId", nameFields: ["name"] };
  document.entities.Hold = { idField: "holdId" };
  const snapshot = join(mkdtempSync(join(tmpdir(), "declared-references-")), "meta.json");
  writeFileSync(snapshot, JSON.stringify(document));
  return {
    loadConfig: vi.fn(async () => ({
      openapi: [{ profile: "declared-references-test", domains: { user: ["user.admin.UserNote"] }, meta: { snapshot } }],
    })),
  };
});

const containerTypes: Record<string, ContainerMapping> = {
  SimpliXApiResponse: { unwrap: true },
  Page: { ts: "SpringPage", zod: "pageOf", import: "@simplix-react-ext/simplix-boot-auth" },
  List: { ts: "Array", zod: "z.array" },
  Map: { ts: "Record", zod: "z.record", keyType: "string" },
};

const namingModule = fileURLToPath(
  new URL("../../../../extensions/simplix-boot/packages/cli-plugin/src/naming.ts", import.meta.url),
);
const { simplixBootNaming } = (await import(namingModule)) as { simplixBootNaming: OpenApiNamingStrategy };
registerSpecProfile("declared-references-test", { naming: simplixBootNaming, responseAdapter: "raw", containerTypes });

async function noteSource(): Promise<MetaScaffoldSource> {
  const source = await loadMetaScaffoldSource("/unused", "userNote");
  if (!source) throw new Error("userNote is not read from Meta");
  return source;
}

/** The list's fields as the scaffold stamps them: the row's DTO over the request body's definitions. */
async function listFields(): Promise<FieldInfo[]> {
  const source = await noteSource();
  const fields = orderAndCategorizeFields(source.fields);
  const projected = projectRowFields(source.rowFields ?? [], new Map(fields.map((one) => [one.name, one])));
  return withContractKinds(projected, source.rowIdField, { peeks: { crew: "crew" }, relationFields: new Set(source.relationFields ?? []) });
}

async function detailFields(): Promise<FieldInfo[]> {
  const source = await noteSource();
  return withContractKinds(source.detailFields ?? [], source.rowIdField, { peeks: { crew: "crew" }, relationFields: new Set(source.relationFields ?? []) });
}

const field = (fields: readonly FieldInfo[], name: string) => {
  const found = fields.find((one) => one.name === name);
  if (!found) throw new Error(`no field ${name}`);
  return found;
};

describe("a reference SimpliX Meta declares", () => {
  it("is named by its <stem>Name sibling", async () => {
    const fields = await listFields();
    expect(field(fields, "reviewerId")).toMatchObject({ contractKind: "reference", peekKind: "userAccount", nameField: "reviewerName" });
    expect(field(fields, "reviewerName").isReferenceName).toBe(true);
  });

  it("is named by the sibling the reference states, whatever its name", async () => {
    const fields = await listFields();
    expect(field(fields, "approverId")).toMatchObject({ contractKind: "reference", peekKind: "userAccount", nameField: "approvedByName" });
    expect(field(fields, "approvedByName").isReferenceName).toBe(true);
    const source = await noteSource();
    expect(source.inferredReferenceNameFields?.approverId).toBeUndefined();
  });

  it("is named by the field its target entity declares its name by, where the row carries it", async () => {
    const fields = await listFields();
    expect(field(fields, "accountId")).toMatchObject({ contractKind: "reference", peekKind: "ledger", nameField: "ownerName" });
    expect(field(fields, "ownerName").isReferenceName).toBe(true);
  });

  it("stays a reference drawn by its id where no name is stated or found, never plain text", async () => {
    const fields = await listFields();
    const actor = field(fields, "actorUserId");
    // `actorName` is paired by nothing Meta states: the reference opens its peek and is drawn by its id.
    expect(actor).toMatchObject({ contractKind: "reference", peekKind: "userAccount", isOpaqueId: false });
    expect(actor.nameField).toBeUndefined();
    const hold = field(await detailFields(), "holdId");
    expect(hold).toMatchObject({ contractKind: "reference", peekKind: "hold", isOpaqueId: false });
    expect(hold.nameField).toBeUndefined();
  });

  it("is left out of a list where nothing names it, and drawn in the detail", async () => {
    const list = await listFields();
    expect(field(list, "actorUserId").hideInList).toBe(true);
    expect(field(list, "reviewerId").hideInList).toBe(false);
    const holders = await holdersOf(await loadMetaHolders("/unused", "userAccount"), { packageOf: async () => "@test/domain-user" });
    const notes = holders.find((one) => one.key === "userNoteByUserId");
    expect(notes?.fields.map((one) => one.name)).toEqual(expect.arrayContaining(["reviewerId", "approverId", "actorId"]));
    for (const name of ["actorUserId", "holdId", "subjectId"]) expect(notes?.fields.map((one) => one.name)).not.toContain(name);
  });

  it("reports the name it paired by the target's name field, and not the <stem>Name convention", async () => {
    const source = await noteSource();
    expect(source.inferredReferenceNameFields).toEqual({ accountId: "ownerName" });
  });
});

describe("a name path a reference states", () => {
  it("starts at the holding row and is taken as it is, never prefixed or replaced by the entity's name field", async () => {
    const owner = field(await listFields(), "ownerAccountId");
    expect(owner).toMatchObject({ contractKind: "reference", peekKind: "userAccount", nameField: "owner.nativeName" });
    const source = await noteSource();
    expect(source.inferredReferenceNames?.ownerAccountId).toBeUndefined();
  });
});

describe("a reference by kind", () => {
  it("carries its kind field and the peek of each served kind, leaving out the kinds that name nothing", async () => {
    const subject = field(await detailFields(), "subjectId");
    expect(subject.contractKind).toBe("reference");
    expect(subject.peekKinds).toEqual({ field: "subjectType", kinds: [{ value: "RUN", peekKind: "run" }, { value: "VOICE", peekKind: "voice" }] });
    expect(subject.nameField).toBeUndefined();
    expect(field(await detailFields(), "subject").isReferenceName).toBe(false);
  });

  it("is named by the sibling the reference states", async () => {
    const actor = field(await listFields(), "actorId");
    expect(actor).toMatchObject({ contractKind: "reference", nameField: "actorUsername", peekKinds: { field: "actorType" } });
    expect(field(await listFields(), "actorUsername").isReferenceName).toBe(true);
  });
});

describe("a key Meta declares nothing for", () => {
  it("is still a reference where the row carries <stem>Name, and is reported as undeclared", async () => {
    const crew = field(await listFields(), "crewId");
    expect(crew).toMatchObject({ contractKind: "reference", peekKind: "crew", nameField: "crewName" });
    expect((await noteSource()).undeclaredReferences).toEqual({ crewId: "crewName" });
  });
});

/**
 * The field line of the console kit's list and detail templates, verbatim, behind the guards the
 * list applies. The kit is a separate checkout; the line is what the generated table holds.
 */
const FIELD_TABLE = [
  "const Fields: readonly ContractField[] = [",
  "{{#each fields}}",
  "{{#unless this.isReferenceName}}{{#unless this.isAuditField}}{{#unless this.isOpaqueId}}{{#unless this.isIdentifier}}",
  '  { name: "{{this.name}}", kind: "{{this.contractKind}}"{{#if this.enumTypeName}}, enumName: "{{this.enumTypeName}}"{{/if}}{{#if this.options.length}}, options: [{{#each this.options}}"{{this}}"{{#unless @last}}, {{/unless}}{{/each}}]{{/if}}{{#if this.peekKind}}, peekKind: "{{this.peekKind}}"{{/if}}{{#if this.peekKinds}}, peekKinds: { field: "{{this.peekKinds.field}}", kinds: { {{#each this.peekKinds.kinds}}{{this.value}}: "{{this.peekKind}}"{{#unless @last}}, {{/unless}}{{/each}} } }{{/if}}{{#if this.nameField}}, nameField: "{{this.nameField}}"{{/if}}{{#if this.peekBy}}, peekBy: "{{this.peekBy}}"{{/if}}{{#if (eq this.sortable true)}}, sortable: true{{/if}}{{#if (eq this.sortable false)}}, sortable: false{{/if}} },',
  "{{/unless}}{{/unless}}{{/unless}}{{/unless}}",
  "{{/each}}",
  "];",
  "export default Fields;",
  "",
].join("\n");

/**
 * The kit's `ContractField` as far as a reference reads it; an extra or misshapen property fails.
 * No standard library is loaded, so the global types an array and a literal need are declared here:
 * without `Array` a `readonly ContractField[]` resolves to nothing and checks nothing.
 */
const CONTRACT_FIELD = `
interface Array<T> { readonly length: number; [n: number]: T }
interface ReadonlyArray<T> { readonly length: number; readonly [n: number]: T }
interface Boolean {}
interface CallableFunction {}
interface Function {}
interface IArguments {}
interface NewableFunction {}
interface Number {}
interface Object {}
interface RegExp {}
interface String {}
type Record<K extends keyof any, T> = { [P in K]: T };
type Readonly<T> = { readonly [P in keyof T]: T[P] };
type ContractFieldKind = "text" | "longText" | "email" | "enum" | "boolean" | "date" | "instant" | "time" | "number" | "money" | "reference" | "i18nText" | "secret" | "json" | "credits" | "bytes" | "duration" | "excerpt" | "prose" | "language";
interface ContractField {
  readonly name: string;
  readonly kind: ContractFieldKind;
  readonly enumName?: string;
  readonly options?: readonly string[];
  readonly peekKind?: string;
  readonly peekKinds?: { readonly field: string; readonly kinds: Readonly<Record<string, string>> };
  readonly peekBy?: string;
  readonly nameField?: string;
  readonly sortable?: boolean;
}
`;

function typeErrors(source: string): string[] {
  // The declarations are a script (no import or export), so what they declare is global.
  const files = new Map([
    ["/lib.d.ts", CONTRACT_FIELD],
    ["/fields.ts", source],
  ]);
  const options: ts.CompilerOptions = { strict: true, noEmit: true, target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, types: [], noLib: true };
  const host = ts.createCompilerHost(options);
  host.getSourceFile = (name, version) => {
    const text = files.get(name);
    return text === undefined ? undefined : ts.createSourceFile(name, text, version);
  };
  host.fileExists = (name) => files.has(name);
  host.readFile = (name) => files.get(name);
  const program = ts.createProgram([...files.keys()], options, host);
  return ts
    .getPreEmitDiagnostics(program)
    .filter((one) => one.file === undefined || one.file.fileName === "/fields.ts" || one.file.fileName === "/lib.d.ts")
    .map((one) => `${one.code} ${ts.flattenDiagnosticMessageText(one.messageText, "\n")}`);
}

describe("the generated field table", () => {
  it("draws each declared reference with its peek, its kinds and its name, and type-checks", async () => {
    const rendered = renderTemplate(FIELD_TABLE, { fields: await detailFields() });
    expect(rendered).toContain('{ name: "approverId", kind: "reference", peekKind: "userAccount", nameField: "approvedByName", sortable: false }');
    expect(rendered).toContain('{ name: "accountId", kind: "reference", peekKind: "ledger", nameField: "ownerName", sortable: false }');
    expect(rendered).toContain('{ name: "actorUserId", kind: "reference", peekKind: "userAccount", sortable: false }');
    expect(rendered).toContain('{ name: "holdId", kind: "reference", peekKind: "hold", sortable: false }');
    expect(rendered).toContain('{ name: "subjectId", kind: "reference", peekKinds: { field: "subjectType", kinds: { RUN: "run", VOICE: "voice" } }, sortable: false }');
    expect(rendered).toContain('{ name: "actorId", kind: "reference", peekKinds: { field: "actorType", kinds: { USER: "userAccount" } }, nameField: "actorUsername", sortable: false }');
    // A name a reference draws is not a field of its own.
    for (const name of ["reviewerName", "approvedByName", "ownerName", "actorUsername", "crewName"]) expect(rendered).not.toContain(`name: "${name}"`);
    expect(typeErrors(rendered)).toEqual([]);
  });

  it("fails the check where a kind map holds the entries it is read from rather than the peek kinds", () => {
    const errors = typeErrors('export const Bad: readonly ContractField[] = [{ name: "subjectId", kind: "reference", peekKinds: { field: "t", kinds: { RUN: { value: "RUN", peekKind: "run" } } } }];');
    expect(errors).toEqual([expect.stringMatching(/^2322 /)]);
  });
});
