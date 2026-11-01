import { describe, expect, it } from "vitest";

import { detailFieldsOf, nameFieldsOf, detectI18nFieldPairs, orderAndCategorizeFields, projectRowFields, withRequiredInForm, withStatedLengths, importsSubjects, readsWidgetsNamespace, resolvesFrom, withContractKinds, type FieldInfo } from "../commands/scaffold-crud.js";
import { relationFieldsOf, stringShape } from "../meta/scaffold-source.js";

function field(name: string, tsType = "string"): FieldInfo {
  const isForeignKey = tsType === "string" && name.endsWith("Id") && name !== "id";
  return {
    name,
    capitalizedName: name.charAt(0).toUpperCase() + name.slice(1),
    label: name,
    tsType,
    formComponent: "TextField",
    inputType: "text",
    component: "Input",
    options: [],
    defaultValue: '""',
    isForeignKey,
    fkEntityField: isForeignKey ? name.slice(0, -2) : null,
    isSystemField: false,
    isI18nPair: false,
    baseFieldName: null,
  } as FieldInfo;
}

describe("the record's own key", () => {
  it("is the identifier, never a reference, and leaves the record's name a field of its own", () => {
    const out = withContractKinds([field("positionId"), field("positionName"), field("positionCode")], "positionId");
    const key = out.find((f) => f.name === "positionId");
    const name = out.find((f) => f.name === "positionName");
    expect(key?.contractKind).toBe("text");
    expect(key?.isIdentifier).toBe(true);
    expect(key?.peekKind).toBeUndefined();
    expect(name?.isReferenceName).toBe(false);
  });

  it("still reads another record's key as a reference where its name is beside it", () => {
    const out = withContractKinds([field("accountId"), field("positionId"), field("positionName")], "accountId");
    const reference = out.find((f) => f.name === "positionId");
    expect(reference?.contractKind).toBe("reference");
    expect(reference?.nameField).toBe("positionName");
    expect(out.find((f) => f.name === "positionName")?.isReferenceName).toBe(true);
  });
});

describe("a relation in a list", () => {
  it("is a reference column with its peek where the row carries the referenced name", () => {
    const out = withContractKinds(orderAndCategorizeFields([field("accountId"), field("userId"), field("userName")]), "accountId");
    const reference = out.find((f) => f.name === "userId");
    expect(reference).toMatchObject({ contractKind: "reference", peekKind: "user", nameField: "userName", hideInList: false });
  });

  it("opens the peek the project names for its stem", () => {
    const out = withContractKinds([field("accountId"), field("ownerId"), field("ownerName")], "accountId", { peeks: { owner: "userAccount" } });
    expect(out.find((f) => f.name === "ownerId")?.peekKind).toBe("userAccount");
  });

  it("keeps the row's nested reference where the request body states the same key as text", () => {
    const stated = orderAndCategorizeFields([field("accountId"), field("positionId")]);
    const row = [field("accountId"), { ...field("positionId"), referenceNamePath: "position.positionName", referencePeekKind: "jobPosition" }];
    const out = withContractKinds(projectRowFields(row, new Map(stated.map((f) => [f.name, f]))), "accountId");
    expect(out.find((f) => f.name === "positionId")).toMatchObject({ contractKind: "reference", peekKind: "jobPosition", nameField: "position.positionName", hideInList: false });
  });

  it("opens the peek its kind field picks, over the project's peek for its stem", () => {
    const referenceKinds = { field: "ownerType", kinds: [{ value: "USER", peekKind: "userAccount" }] };
    const out = withContractKinds([field("accountId"), { ...field("ownerId"), referenceKinds }, field("ownerName")], "accountId", { peeks: { owner: "team" } });
    const reference = out.find((f) => f.name === "ownerId");
    expect(reference).toMatchObject({ contractKind: "reference", nameField: "ownerName", peekKinds: referenceKinds });
    expect(reference?.peekKind).toBeUndefined();
  });

  it("keeps a reference by kind where the request body states the key as text", () => {
    const referenceKinds = { field: "ownerType", kinds: [{ value: "USER", peekKind: "userAccount" }] };
    const stated = [field("accountId"), field("ownerId"), field("ownerName")];
    const row = [field("accountId"), { ...field("ownerId"), referenceKinds }, field("ownerName")];
    const out = withContractKinds(projectRowFields(row, new Map(stated.map((f) => [f.name, f]))), "accountId");
    expect(out.find((f) => f.name === "ownerId")?.peekKinds).toEqual(referenceKinds);
  });

  it("stays hidden while it is a bare key with no name beside it", () => {
    const out = withContractKinds(orderAndCategorizeFields([field("accountId"), field("tenantId")]), "accountId");
    expect(out.find((f) => f.name === "tenantId")).toMatchObject({ contractKind: "text", hideInList: true });
  });
});

describe("a field SimpliX Meta declares multilingual", () => {
  const map = (name: string): FieldInfo => ({ ...field(name), tsType: "Record<string, string>", formComponent: "I18nTextField", component: "I18nText", isForeignKey: false, fkEntityField: null });

  it("is edited through its map as i18nText, and its plain sibling is not a field of its own", () => {
    const fields = [field("positionName"), map("positionNameI18n")];
    detectI18nFieldPairs(fields);
    const out = withContractKinds(fields);
    expect(out.find((f) => f.name === "positionNameI18n")?.contractKind).toBe("i18nText");
    expect(out.find((f) => f.name === "positionNameI18n")?.baseFieldName).toBe("positionName");
    expect(out.find((f) => f.name === "positionName")?.isI18nPair).toBe(true);
  });

  it("is a multilingual text area where its plain sibling is long text", () => {
    const fields = [{ ...field("description"), formComponent: "TextareaField" }, map("descriptionI18n")];
    detectI18nFieldPairs(fields);
    expect(fields.find((f) => f.name === "descriptionI18n")?.formComponent).toBe("I18nTextareaField");
  });

  it("reads a string allowing paragraphs as long text", () => {
    const long = stringShape({ name: "description", type: { kind: "string" }, required: false, nullable: true, constraints: [{ kind: "maxLength", value: 1000 }] } as never);
    const short = stringShape({ name: "positionCode", type: { kind: "string" }, required: true, nullable: false, constraints: [{ kind: "maxLength", value: 32 }] } as never);
    expect(long.formComponent).toBe("TextareaField");
    expect(short.formComponent).not.toBe("TextareaField");
  });
});

describe("what a scaffold of an existing module touches beside the screen", () => {
  it("lays down the subjects file only for a page that imports it", () => {
    expect(importsSubjects('import { SUBJECTS } from "../../shared/auth/subjects";')).toBe(true);
    expect(importsSubjects('const canCreate = useAllowed(createJobPositionAccess);')).toBe(false);
  });

  it("registers the widgets catalog only where a rendered file reads it", () => {
    expect(readsWidgetsNamespace('const { t } = useTranslation("user-admin/widgets");', "user-admin")).toBe(true);
    expect(readsWidgetsNamespace('const words = useScreenWords("jobPosition");', "user-admin")).toBe(false);
  });
});

describe("a dependency the scaffold would add", () => {
  it("is missing only when it does not resolve from the module", async () => {
    const { mkdtemp, mkdir, writeFile, rm } = await import("node:fs/promises");
    const { tmpdir } = await import("node:os");
    const { join } = await import("node:path");
    const root = await mkdtemp(join(tmpdir(), "resolves-"));
    await mkdir(join(root, "node_modules/@scope/ui"), { recursive: true });
    await writeFile(join(root, "node_modules/@scope/ui/package.json"), "{}");
    await mkdir(join(root, "modules/a"), { recursive: true });
    expect(await resolvesFrom(join(root, "modules/a"), "@scope/ui")).toBe(true);
    expect(await resolvesFrom(join(root, "modules/a"), "@scope/absent")).toBe(false);
    await rm(root, { recursive: true, force: true });
  });
});

describe("a key the contract does not state", () => {
  it("is text the operator enters where the contract allows it longer than a key", () => {
    const out = withContractKinds([field("catalogVoiceId"), { ...field("providerVoiceId"), maxLength: 200 }, { ...field("traceId"), maxLength: 36 }], "catalogVoiceId");
    expect(out.find((f) => f.name === "providerVoiceId")?.isOpaqueId).toBe(false);
    expect(out.find((f) => f.name === "traceId")?.isOpaqueId).toBe(true);
  });

  it("takes the request body's length in a detail whose DTO states none", () => {
    const stated = new Map([["providerVoiceId", { ...field("providerVoiceId"), maxLength: 200 }]]);
    const out = withContractKinds(withStatedLengths([field("catalogVoiceId"), field("providerVoiceId")], stated), "catalogVoiceId");
    expect(out.find((f) => f.name === "providerVoiceId")?.isOpaqueId).toBe(false);
  });

  it("is a key whatever its length where SimpliX Meta states it as a relation", () => {
    const out = withContractKinds([field("accountId"), { ...field("externalRefId"), maxLength: 200 }], "accountId", { relationFields: new Set(["externalRefId"]) });
    expect(out.find((f) => f.name === "externalRefId")?.isOpaqueId).toBe(true);
  });
});

describe("a system field the form's DTO requires", () => {
  it("is in the form", () => {
    expect(withRequiredInForm({ ...field("sortOrder", "number"), isSystemField: true, required: true }).isSystemField).toBe(false);
  });

  it("stays out of the form while it is optional", () => {
    expect(withRequiredInForm({ ...field("sortOrder", "number"), isSystemField: true }).isSystemField).toBe(true);
  });
});

describe("the relations SimpliX Meta states", () => {
  it("are the holders naming the entity and its nested references", () => {
    const document = { entities: { Role: { holders: [{ entity: "UserAccount", field: "roleIds", operators: ["IN"] }] }, Team: { holders: [{ entity: "Other", field: "teamId", operators: ["EQUALS"] }] } } };
    const source = { fields: [{ ...field("positionId"), referenceNamePath: "position.positionName" }, field("providerVoiceId")] };
    expect(relationFieldsOf(document as never, "UserAccount", source as never)).toEqual(["positionId", "roleIds"]);
  });
});

describe("the fields a detail draws", () => {
  it("leaves out the record's own key and keeps the rest in order", () => {
    const fields = [field("releaseArtifactId"), field("artifactName"), field("holderId")];
    expect(detailFieldsOf(fields, "releaseArtifactId").map((f) => f.name)).toEqual(["artifactName", "holderId"]);
  });
});

describe("the fields a record is named by", () => {
  it("follows the order of the names and takes each from the first table stating it", () => {
    const detail = [field("createdAt"), field("jobType")];
    expect(nameFieldsOf(["jobType", "createdAt", "unknown"], [...detail, field("jobType", "number")]).map((f) => [f.name, f.tsType])).toEqual([
      ["jobType", "string"],
      ["createdAt", "string"],
    ]);
  });
});
