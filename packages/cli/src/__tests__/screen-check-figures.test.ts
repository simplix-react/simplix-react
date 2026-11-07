import { describe, expect, it } from "vitest";

import { factsOf, screenFileProblems } from "../commands/check-screen.js";
import { figureKindProblems, type ScreenFacts } from "../checks/screen-check.js";
import type { MetaScaffoldSource } from "../meta/scaffold-source.js";

const facts = (figures: Record<string, { kind: string; signed?: boolean }>): ScreenFacts => ({
  createRequired: [],
  createStructured: [],
  bareKeys: [],
  maxLengths: {},
  booleans: new Set(),
  references: [],
  rowFields: new Set(),
  figures: new Map(Object.entries(figures).map(([name, one]) => [name, { kind: one.kind, signed: one.signed === true }])),
});

const ledger = facts({ amount: { kind: "credits", signed: true }, heldAmount: { kind: "credits" }, lastError: { kind: "excerpt" }, costMicros: { kind: "money" } });

describe("figureKindProblems", () => {
  it("names a credit amount drawn as a bare number", () => {
    const text = `const Fields: readonly ContractField[] = [\n  { name: "heldAmount", kind: "number" },\n];`;
    expect(figureKindProblems("detail.tsx", text, ledger)).toEqual([
      { file: "detail.tsx", severity: "error", message: 'heldAmount is drawn as kind "number", but SimpliX Meta declares it as credits; regenerate the screen or write kind: "credits"' },
    ]);
  });

  it("names a ledger amount drawn without its sign, and leaves one drawn with it", () => {
    expect(figureKindProblems("list.tsx", `  { name: "amount", kind: "credits" },`, ledger).map((one) => one.message)).toEqual([
      "amount is a ledger amount SimpliX Meta declares signed, drawn without signed: true",
    ]);
    expect(figureKindProblems("list.tsx", `  { name: "amount", kind: "credits", signed: true },`, ledger)).toEqual([]);
  });

  it("reads an aggregate figure's field the same way", () => {
    const text = `figures: [{ field: { name: "lastError", kind: "text" }, op: "count" }]`;
    expect(figureKindProblems("crud-page.tsx", text, ledger)).toHaveLength(1);
  });

  it("leaves every entry that agrees with Meta, and fields Meta states no format for", () => {
    const text = [
      `  { name: "heldAmount", kind: "credits" },`,
      `  { name: "lastError", kind: "excerpt" },`,
      `  { name: "costMicros", kind: "money", currency: "USD", scale: 6 },`,
      `  { name: "note", kind: "text" },`,
    ].join("\n");
    expect(figureKindProblems("detail.tsx", text, ledger)).toEqual([]);
  });

  it("judges nothing where Meta states no figures", () => {
    expect(figureKindProblems("list.tsx", `  { name: "heldAmount", kind: "number" },`, facts({}))).toEqual([]);
  });
});

describe("factsOf figures", () => {
  it("takes a figure kind, money and a sign from the entity's own fields", () => {
    const source = {
      fields: [{ name: "amount", figureKind: "credits", signed: true }, { name: "costMicros", money: { currency: "USD", scale: 6 } }, { name: "label" }],
      rowFields: [{ name: "lastError", figureKind: "excerpt" }],
      roles: {},
      rowIdField: "id",
    } as unknown as MetaScaffoldSource;
    expect([...(factsOf(source).figures ?? new Map())]).toEqual([
      ["lastError", { kind: "excerpt", signed: false }],
      ["amount", { kind: "credits", signed: true }],
      ["costMicros", { kind: "money", signed: false }],
    ]);
  });
});

describe("screenFileProblems", () => {
  it("judges the figure kinds of every screen file, whatever its kind", () => {
    for (const name of ["list.tsx", "detail.tsx", "form.tsx", "crud-page.tsx"]) {
      expect(screenFileProblems(name, name, `  { name: "heldAmount", kind: "number" },`, ledger).map((one) => one.severity)).toContain("error");
    }
  });
});
