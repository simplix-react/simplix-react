import { describe, expect, it } from "vitest";

import { formProblems, type ScreenFacts } from "../checks/screen-check.js";
import { detectI18nFieldPairs, withContractKinds, type FieldInfo } from "../commands/scaffold-crud.js";
import { formFieldsOf } from "../utils/form-fields.js";

/**
 * The create body requires the plain half of a multilingual pair (`name`), while the form draws the
 * pair as one entry (`nameI18n`, `plainField: "name"`). The requirement lands on that entry, and the
 * check reads whether the form marks it.
 */
const facts: ScreenFacts = {
  createRequired: ["name"],
  createStructured: [],
  bareKeys: [],
  maxLengths: {},
  booleans: new Set(),
  references: [],
  rowFields: new Set(),
};

const table = (...entries: string[]) => `const PlanFormFields: readonly ContractField[] = [\n${entries.join("\n")}\n];`;

describe("the check over a multilingual entry whose plain half the create body requires", () => {
  it("reports the entry that leaves the requirement unmarked", () => {
    const text = table('  { name: "nameI18n", kind: "i18nText", sortable: false, plainField: "name" },');
    expect(formProblems("form.tsx", text, facts).map((one) => one.message)).toEqual([
      '"nameI18n" is the multilingual entry of "name", which the create body requires, and its entry lacks `required: true`',
    ]);
  });

  it("passes the entry the generator marks", () => {
    const text = table('  { name: "nameI18n", kind: "i18nText", sortable: false, plainField: "name", required: true },');
    expect(formProblems("form.tsx", text, facts)).toEqual([]);
  });

  it("leaves a pair whose plain half the create body does not require", () => {
    const text = table('  { name: "nameI18n", kind: "i18nText", sortable: false, plainField: "name" },');
    expect(formProblems("form.tsx", text, { ...facts, createRequired: [] })).toEqual([]);
  });

  it("still reports a requirement no entry carries", () => {
    const text = table('  { name: "code", kind: "text", required: true },');
    expect(formProblems("form.tsx", text, facts).map((one) => one.message)).toEqual([
      expect.stringContaining('the form\'s field table has no entry for it'),
    ]);
  });
});

const field = (name: string, extra: Partial<FieldInfo> = {}): FieldInfo => ({
  name,
  capitalizedName: name.charAt(0).toUpperCase() + name.slice(1),
  label: name,
  tsType: "string",
  formComponent: "TextField",
  inputType: "text",
  component: "Text",
  options: [],
  defaultValue: '""',
  isForeignKey: false,
  fkEntityField: null,
  isSystemField: false,
  isI18nPair: false,
  baseFieldName: null,
  ...extra,
});

const i18n = (name: string): FieldInfo => field(name, { tsType: "Record<string, string>", formComponent: "I18nTextField", component: "I18nText" });

describe("detectI18nFieldPairs and the requirement", () => {
  it("carries a required plain half to the i18n half", () => {
    const fields = [field("name", { required: true }), i18n("nameI18n")];
    detectI18nFieldPairs(fields);
    expect(fields[1]!.required).toBe(true);
    expect(fields[1]!.baseFieldName).toBe("name");
  });

  it("leaves the i18n half of an optional plain half unmarked", () => {
    const fields = [field("description"), i18n("descriptionI18n")];
    detectI18nFieldPairs(fields);
    expect(fields[1]!.required).toBeUndefined();
  });

  it("marks nothing for an i18n field with no plain half", () => {
    const fields = [i18n("titleI18n"), field("other", { required: true })];
    detectI18nFieldPairs(fields);
    expect(fields[0]!.required).toBeUndefined();
  });
});

describe("the form's field list for a required pair", () => {
  it("keeps the i18n half, marked required, and drops the plain half", () => {
    const fields = [field("planId", { isIdentifier: true } as Partial<FieldInfo>), field("name", { required: true }), i18n("nameI18n")];
    detectI18nFieldPairs(fields);
    const form = formFieldsOf(withContractKinds(fields, "planId"));
    expect(form.map((one) => one.name)).toEqual(["nameI18n"]);
    expect(form[0]).toMatchObject({ contractKind: "i18nText", baseFieldName: "name", required: true });
  });
});
