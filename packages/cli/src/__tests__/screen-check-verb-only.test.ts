import { describe, expect, it } from "vitest";

import { factsOf } from "../commands/check-screen.js";
import { formProblems, type ScreenFacts } from "../checks/screen-check.js";
import type { MetaScaffoldSource } from "../meta/scaffold-source.js";

/**
 * A value only a verb moves (an enable with its confirmation) is never a control in the edit form
 * (frontend invariant #74). The check reads the form's field table against SimpliX Meta's `verbOnly`.
 */
const facts: ScreenFacts = {
  createRequired: ["displayName", "enabled"],
  createStructured: [],
  bareKeys: [],
  maxLengths: {},
  booleans: new Set(["enabled"]),
  references: [],
  rowFields: new Set(),
  verbOnly: new Set(["enabled"]),
};

const table = (...entries: string[]) => `const ConnectionFormFields: readonly ContractField[] = [\n${entries.join("\n")}\n];`;
const name = `  { name: "displayName", kind: "text", required: true },`;

describe("a form and a field only a verb moves", () => {
  it("refuses a form that draws it", () => {
    const text = `${table(name, `  { name: "enabled", kind: "boolean", defaultValue: true },`)}\nconst body = { ...written };`;
    expect(formProblems("form.tsx", text, facts).map((one) => one.message)).toEqual([
      '"enabled" moves only through a verb of the entity, as SimpliX Meta states, and the form draws it; leave it out of the form\'s field table and let the create send its default',
    ]);
  });

  it("leaves a form that sends the create default and draws no control", () => {
    const text = `${table(name)}\nconst body = editing && row ? { ...row, ...written } : { enabled: true, ...written };`;
    expect(formProblems("form.tsx", text, facts)).toEqual([]);
  });

  it("refuses a form that neither draws it nor sends it when the create body requires it", () => {
    const text = `${table(name)}\nconst body = written;`;
    expect(formProblems("form.tsx", text, facts).map((one) => one.message)).toEqual([
      'the create body requires "enabled", which only a verb moves, and the form never sends it; regenerate the form so its create sends the default',
    ]);
  });

  it("judges nothing where Meta marks no field", () => {
    const text = `${table(name, `  { name: "enabled", kind: "boolean" },`)}`;
    expect(formProblems("form.tsx", text, { ...facts, verbOnly: undefined })).toEqual([]);
  });
});

describe("factsOf verbOnly", () => {
  it("takes the names Meta marks on any of the entity's DTOs", () => {
    const source = { fields: [], roles: {}, verbOnly: ["enabled"] } as unknown as MetaScaffoldSource;
    expect([...(factsOf(source).verbOnly ?? [])]).toEqual(["enabled"]);
  });
});
