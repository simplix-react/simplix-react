import { fileURLToPath } from "node:url";
import { describe, expect, it, vi } from "vitest";

import { formProblems, nameFieldProblems, flatKeyProblems, type ScreenFacts } from "../checks/screen-check.js";
import { factsOf } from "../commands/check-screen.js";
import { formFieldsOf } from "../utils/form-fields.js";
import {
  facetsOf,
  orderAndCategorizeFields,
  pickerImportsOf,
  pickersOf,
  projectRowFields,
  referenceFiltersOf,
  withContractKinds,
  withRequiredInForm,
} from "../commands/scaffold-crud.js";
import { loadMetaScaffoldSource, stringShape, withReferenceNames } from "../meta/scaffold-source.js";
import type { DtoMeta } from "../meta/types.js";
import type { OpenApiNamingStrategy } from "../openapi/naming/naming-strategy.js";
import type { ContainerMapping } from "../openapi/orchestration/spec-profile.js";
import { registerSpecProfile } from "../openapi/plugin-registry.js";

/**
 * A note about an account, as the back office declares it: the create body requires the account's
 * key, the row carries the whole account beside it, and the account entity declares `username` as
 * its name while its type also lists `displayName`, which the serializer leaves out of a nested
 * record.
 */
vi.mock("../config/config-loader.js", async () => {
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const { copyFileSync, mkdtempSync } = await import("node:fs");
  const { fileURLToPath: toPath } = await import("node:url");
  const snapshot = join(mkdtempSync(join(tmpdir(), "references-")), "meta.json");
  copyFileSync(toPath(new URL("../meta/__fixtures__/user-note-meta.json", import.meta.url)), snapshot);
  return {
    loadConfig: vi.fn(async () => ({
      openapi: [{ profile: "references-test", domains: { user: ["user.admin.UserNote"] }, meta: { snapshot } }],
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
registerSpecProfile("references-test", { naming: simplixBootNaming, responseAdapter: "raw", containerTypes });

describe("the name a reference is drawn by", () => {
  it("is the field the referenced entity declares, not the commonest name the nested type lists", async () => {
    const source = await loadMetaScaffoldSource("/unused", "userNote");
    const key = source?.rowFields?.find((one) => one.name === "userId");
    // The nested type lists `displayName`, which the guess would pick; the entity declares `username`.
    expect(key?.referenceNamePath).toBe("user.username");
    expect(key?.referenceNameSource).toBe("declared");
    expect(source?.inferredReferenceNames).toEqual({});
  });

  it("is also the path of the form's key, whose body has no nested record beside it", async () => {
    const source = await loadMetaScaffoldSource("/unused", "userNote");
    const key = source?.fields.find((one) => one.name === "userId");
    expect(key?.referenceNamePath).toBe("user.username");
    expect(key?.referencePeekKind).toBe("userAccount");
  });

  it("stays a marked guess where the referenced entity declares no name field", () => {
    const document = { entities: { UserAccount: {} } } as unknown as DtoMeta;
    const key = { name: "userId", isForeignKey: true, fkEntityField: "user", referencePeekKind: "userAccount", referenceNamePath: "user.displayName" };
    const source = { fields: [], rowFields: [key] } as unknown as Parameters<typeof withReferenceNames>[1];
    expect(withReferenceNames(document, source)).toEqual({ userId: "user.displayName" });
    expect(key).toMatchObject({ referenceNameSource: "inferred" });
  });

  it("is the one the key's own reference states, ahead of the entity's", () => {
    const document = { entities: { UserAccount: { nameFields: ["nativeName"] } } } as unknown as DtoMeta;
    const key = { name: "userId", isForeignKey: true, fkEntityField: "user", referencePeekKind: "userAccount", referenceNamePath: "user.email", referenceNameSource: "declared" };
    const source = { fields: [], rowFields: [key] } as unknown as Parameters<typeof withReferenceNames>[1];
    expect(withReferenceNames(document, source)).toEqual({});
    expect(key.referenceNamePath).toBe("user.email");
  });
});

describe("a form over the create body", () => {
  async function formOf() {
    const source = await loadMetaScaffoldSource("/unused", "userNote");
    if (!source) throw new Error("userNote is not read from Meta");
    const fields = orderAndCategorizeFields(source.fields);
    const byName = new Map(fields.map((one) => [one.name, one]));
    const projected = projectRowFields(source.rowFields ?? [], byName);
    expect(projected.length).toBeGreaterThan(0);
    const kinds = withContractKinds(fields.map(withRequiredInForm), source.rowIdField, {
      peeks: {},
      relationFields: new Set(source.relationFields ?? []),
    });
    return { source, form: formFieldsOf(kinds) };
  }

  it("carries every field the create body requires", async () => {
    const { source, form } = await formOf();
    expect(source.createRequired).toEqual(["userId", "noteType", "content", "pinned"]);
    for (const name of source.createRequired ?? []) expect(form.map((one) => one.name)).toContain(name);
  });

  it("draws the account key as a reference named by the declared field, so it is not left out as an opaque id", async () => {
    const { form } = await formOf();
    expect(form.find((one) => one.name === "userId")).toMatchObject({ contractKind: "reference", nameField: "user.username", peekKind: "userAccount", required: true });
  });

  it("marks what the create body requires", async () => {
    const { form } = await formOf();
    expect(form.filter((one) => one.required).map((one) => one.name).sort()).toEqual(["content", "noteType", "pinned", "userId"]);
  });
});

describe("long text", () => {
  const field = (value: number) => ({ name: "content", type: { kind: "string" as const }, required: true, nullable: false, constraints: [{ kind: "maxLength" as const, value }] });

  it("follows the length the contract allows", () => {
    expect(stringShape(field(4000)).formComponent).toBe("TextareaField");
    expect(stringShape(field(499)).formComponent).toBe("TextField");
  });
});

describe("the picker a form edits a reference through", () => {
  const form = [
    { name: "userId", contractKind: "reference", peekKind: "userAccount" },
    { name: "title", contractKind: "text" },
  ];

  it("is the search hook the project names for the referenced entity", () => {
    const picked = pickersOf(form, { userAccount: { hook: "useUserAccountSearch", from: "@app/identity-ui" } });
    expect(picked).toEqual([{ field: "userId", hook: "useUserAccountSearch", from: "@app/identity-ui" }]);
    expect(pickerImportsOf(picked)).toEqual([{ from: "@app/identity-ui", hooks: "useUserAccountSearch" }]);
  });

  it("is none where the project names no hook, which the check reports", () => {
    expect(pickersOf(form, undefined)).toEqual([]);
    expect(pickersOf(form, { team: { hook: "useTeamSearch", from: "@app/identity-ui" } })).toEqual([]);
  });
});

const facts: ScreenFacts = {
  createRequired: ["userId", "noteType", "content", "pinned"],
  maxLengths: { content: 4000 },
  booleans: new Set(["pinned"]),
  references: [{ key: "userId", nested: "user", path: "user.username", source: "declared" }],
  rowFields: new Set(["noteId", "userId", "noteType"]),
};

const table = (lines: string[]) =>
  `const NoteFormFields: readonly ContractField[] = [\n${lines.map((one) => `  ${one},`).join("\n")}\n];\nconst contract = useRecordContract("note", { searches: { userId } });`;

describe("the check over a form", () => {
  const good = table([
    '{ name: "userId", kind: "reference", peekKind: "userAccount", nameField: "user.username", required: true }',
    '{ name: "noteType", kind: "enum", enumName: "NoteType", options: ["HR"], required: true }',
    '{ name: "content", kind: "longText", sortable: false, required: true }',
    '{ name: "pinned", kind: "boolean", defaultValue: false }',
  ]);

  it("passes the table the generator writes for the create body", () => {
    expect(formProblems("form.tsx", good, facts)).toEqual([]);
  });

  it("reports a required field the table leaves out", () => {
    const text = good.replace(/.*"userId", kind.*\n/, "");
    expect(formProblems("form.tsx", text, facts).map((one) => one.message)).toEqual([expect.stringContaining('requires "userId"')]);
  });

  it("reports a required field that is not marked", () => {
    const text = good.replace('options: ["HR"], required: true', 'options: ["HR"]');
    expect(formProblems("form.tsx", text, facts).map((one) => one.message)).toEqual([expect.stringContaining('"noteType" is required')]);
  });

  it("reports long text drawn on one line", () => {
    const text = good.replace('kind: "longText"', 'kind: "text"');
    expect(formProblems("form.tsx", text, facts).map((one) => one.message)).toEqual([expect.stringContaining("longText")]);
  });

  it("reports a reference the contract is given no search for", () => {
    const text = good.replace(", { searches: { userId } }", "");
    expect(formProblems("form.tsx", text, facts).map((one) => one.message)).toEqual([expect.stringContaining("searches")]);
  });
});

describe("the check over a name path", () => {
  it("reports the path that resolves against the model and is not the declared one", () => {
    const problems = nameFieldProblems("list.tsx", '{ name: "userId", kind: "reference", nameField: "user.displayName" }', facts);
    expect(problems).toHaveLength(1);
    expect(problems[0]).toMatchObject({ severity: "error", message: expect.stringContaining('"user.username"') });
  });

  it("passes the declared path, and says nothing of a flat name that is a field", () => {
    expect(nameFieldProblems("list.tsx", '{ nameField: "user.username" }', facts)).toEqual([]);
    expect(nameFieldProblems("list.tsx", '{ nameField: "noteType" }', facts)).toEqual([]);
  });

  it("reports a nested record no reference carries and a flat name no row has", () => {
    expect(nameFieldProblems("list.tsx", '{ nameField: "owner.name" }', facts)).toHaveLength(1);
    expect(nameFieldProblems("list.tsx", '{ nameField: "ownerName" }', facts)).toHaveLength(1);
  });

  it("warns, without failing, on a path that is only a guess", () => {
    const guessed = { ...facts, references: [{ ...facts.references[0]!, source: "inferred" as const }] };
    expect(nameFieldProblems("list.tsx", '{ nameField: "user.username" }', guessed)).toEqual([expect.objectContaining({ severity: "warning" })]);
  });

  it("reports a sample row that spells the path as one flat key", () => {
    expect(flatKeyProblems("frame.tsx", '{ "user.username": "x" }', facts)).toHaveLength(1);
    expect(flatKeyProblems("frame.tsx", '{ user: { username: "x" } }', facts)).toEqual([]);
  });
});

describe("the facts a screen is judged against", () => {
  it("are what Meta settles for the entity", async () => {
    const source = await loadMetaScaffoldSource("/unused", "userNote");
    if (!source) throw new Error("userNote is not read from Meta");
    const read = factsOf(source);
    expect(read.createRequired).toEqual(["userId", "noteType", "content", "pinned"]);
    expect(read.references).toEqual([{ key: "userId", nested: "user", path: "user.username", source: "declared" }]);
    expect(read.booleans.has("pinned")).toBe(true);
  });
});

describe("the filter over a key of another record", () => {
  const filters = [
    { filterKey: "userId.equals", component: "TextFilter", label: "User", field: "userId", operator: "equals", valueType: "string" as const },
    { filterKey: "content.contains", component: "TextFilter", label: "Content", field: "content", operator: "contains", valueType: "string" as const },
  ];
  const fields = [
    { name: "userId", referencePeekKind: "userAccount" },
    { name: "content" },
  ] as unknown as Parameters<typeof referenceFiltersOf>[1];
  const configured = { userAccount: { hook: "useUserAccountSearch", from: "@app/identity-ui", facet: "useUserIdFacet" } };

  it("replaces the id's text filter with a reference filter where the project names a facet", () => {
    const found = referenceFiltersOf(filters, fields, configured);
    expect(found).toEqual([{ kind: "reference", field: "userId" }]);
    expect(facetsOf(found, fields, configured)).toEqual([{ field: "userId", hook: "useUserIdFacet", from: "@app/identity-ui" }]);
  });

  it("offers none where no facet is named, or for a key that references nothing", () => {
    expect(referenceFiltersOf(filters, fields, undefined)).toEqual([]);
    const withoutFacet = { userAccount: { hook: "useUserAccountSearch", from: "@app/identity-ui" } };
    expect(referenceFiltersOf(filters, fields, withoutFacet)).toEqual([]);
    expect(referenceFiltersOf([filters[1]!], fields, configured)).toEqual([]);
  });
});
