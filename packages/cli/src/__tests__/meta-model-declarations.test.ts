import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { describe, expect, it } from "vitest";
import { generateModelFiles, modelFileBase } from "../meta/generation/model-gen.js";
import { resolveMeta, type ResolvedDomain } from "../meta/resolve.js";
import type { DtoMeta, FieldMeta } from "../meta/types.js";

/**
 * What SimpliX Meta declares beyond a type's shape (enum value tones, field formats) is carried
 * into the generated domain as `<Enum>Tones` and `<Type>FieldFormats`, so a reader that is not a
 * generated screen (a dashboard card, a report) reads them from the domain package.
 */

const labeledEnum = { ts: "LabeledEnumValue", import: "@simplix-react-ext/simplix-boot-utils" };

const field = (name: string, extra: Partial<FieldMeta> = {}): FieldMeta => ({
  name,
  type: { kind: "number", integral: true },
  required: true,
  nullable: false,
  ...extra,
});

const declared: DtoMeta = {
  version: 1,
  enums: {
    MailStatus: {
      labeled: true,
      values: [
        { name: "DELIVERED", tone: "success" },
        { name: "FAILED", tone: "danger" },
        { name: "PENDING", tone: "neutral" },
      ],
    },
    AuditAction: {
      labeled: false,
      values: [{ name: "CREATE", tone: "success" }, { name: "READ" }, { name: "DELETE", tone: "danger" }],
    },
    Colour: { labeled: false, values: [{ name: "RED" }, { name: "BLUE" }] },
    Shade: { labeled: false, values: [{ name: "DARK", tone: "info" }] },
  },
  types: {
    CostBase: {
      javaClass: "app.CostBase",
      typeParams: [],
      fields: [
        field("costMicros", { format: "money", money: { currency: "USD", scale: 6 } }),
        field("plain"),
      ],
    },
    UsageRow: {
      javaClass: "app.UsageRow",
      extends: "CostBase",
      typeParams: [],
      fields: [
        field("credits", { format: "credits" }),
        field("amount", { format: "signedCredits" }),
        field("lastError", { type: { kind: "string" }, format: "excerpt" }),
        field("sizeBytes", { format: "bytes" }),
        field("latencyMs", { format: "duration" }),
        field("status", { type: { kind: "enum", name: "MailStatus" } }),
        field("action", { type: { kind: "enum", name: "AuditAction" } }),
        field("colour", { type: { kind: "enum", name: "Colour" } }),
        field("shade", { type: { kind: "enum", name: "Shade" } }),
        field("active", { type: { kind: "boolean" }, tones: { true: "success", false: "neutral" } }),
      ],
    },
    Plain: {
      javaClass: "app.Plain",
      typeParams: [],
      fields: [field("count"), field("code", { type: { kind: "string" }, format: "code" })],
    },
    Bare: { javaClass: "app.Bare", typeParams: [], fields: [field("count")] },
    // A type already exported under the name the Shade table would take.
    ShadeTones: { javaClass: "app.ShadeTones", typeParams: [], fields: [field("count")] },
  },
  operations: [
    {
      id: "listUsage",
      method: "GET",
      path: "/usage",
      tag: "app.Usage",
      access: { kind: "public" },
      response: { kind: "ref", name: "UsageRow" },
      request: { query: [], path: [] },
    },
    {
      id: "getPlain",
      method: "GET",
      path: "/plain",
      tag: "app.Usage",
      access: { kind: "public" },
      response: { kind: "ref", name: "Plain" },
      request: { query: [], path: [] },
    },
    {
      id: "getBare",
      method: "GET",
      path: "/bare",
      tag: "app.Usage",
      access: { kind: "public" },
      response: { kind: "ref", name: "Bare" },
      request: { query: [], path: [] },
    },
    {
      id: "getShadeTones",
      method: "GET",
      path: "/shade-tones",
      tag: "app.Usage",
      access: { kind: "public" },
      response: { kind: "ref", name: "ShadeTones" },
      request: { query: [], path: [] },
    },
  ],
};

function domainOf(meta: DtoMeta, patterns: string[]): ResolvedDomain {
  const resolved = resolveMeta(meta, { domains: { one: patterns }, containerTypes: {} });
  const domain = resolved.domains.get("one");
  if (!domain) throw new Error("the domain the fixture was resolved into is missing");
  return domain;
}

/** The exports a generated module evaluates to: its type-only imports vanish in transpiling. */
function evaluate(source: string): Record<string, unknown> {
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  const module = { exports: {} as Record<string, unknown> };
  new Function("module", "exports", "require", outputText)(module, module.exports, () => {
    throw new Error("a declaration table module imports nothing at run time");
  });
  return module.exports;
}

/**
 * The machine check: every enum value tone and every field format SimpliX Meta declares on the
 * domain's closure is present in the generated tables, with nothing extra. Each line names one
 * declaration the output misses or gets wrong.
 */
function missingDeclarations(domain: ResolvedDomain, files: Map<string, string>): string[] {
  const missing: string[] = [];
  const enums = evaluate(files.get("model/_enums.ts") ?? "");
  for (const entry of domain.enums.values()) {
    const expected = Object.fromEntries(
      entry.meta.values.filter((value) => value.tone).map((value) => [value.name, value.tone]),
    );
    const name = `${entry.name}Tones`;
    if (domain.types.has(name)) continue;
    const actual = enums[name];
    if (Object.keys(expected).length === 0) {
      if (actual !== undefined) missing.push(`${name} is written for an enum with no tones`);
      continue;
    }
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      missing.push(`${name} is ${JSON.stringify(actual)}, Meta declares ${JSON.stringify(expected)}`);
    }
  }
  for (const type of domain.types.values()) {
    const expected = Object.fromEntries(
      type.allFields
        .filter((one) => one.format !== undefined || one.money !== undefined)
        .map((one) => [
          one.name,
          { ...(one.format ? { format: one.format } : {}), ...(one.money ? { money: one.money } : {}) },
        ]),
    );
    const name = `${type.name}FieldFormats`;
    const actual = evaluate(files.get(`model/${modelFileBase(type.name)}.ts`) ?? "")[name];
    if (Object.keys(expected).length === 0) {
      if (actual !== undefined) missing.push(`${name} is written for a type with no formats`);
      continue;
    }
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      missing.push(`${name} is ${JSON.stringify(actual)}, Meta declares ${JSON.stringify(expected)}`);
    }
  }
  return missing;
}

const domain = domainOf(declared, ["app.Usage"]);
const generated = generateModelFiles(domain, { labeledEnum });
const enumsFile = generated.files.get("model/_enums.ts") ?? "";
const usageFile = generated.files.get("model/usageRow.ts") ?? "";

describe("generateModelFiles carries enum value tones into the domain", () => {
  it("writes <Enum>Tones beside a toned enum, typed against the framework StatusTone", () => {
    expect(enumsFile).toContain("import type { StatusTone } from '@simplix-react/api';");
    expect(enumsFile).toContain(
      "export const MailStatusTones: Readonly<Partial<Record<MailStatus, StatusTone>>> = {",
    );
    expect(evaluate(enumsFile).MailStatusTones).toEqual({
      DELIVERED: "success",
      FAILED: "danger",
      PENDING: "neutral",
    });
  });

  it("lists only the values that declare a tone", () => {
    expect(evaluate(enumsFile).AuditActionTones).toEqual({ CREATE: "success", DELETE: "danger" });
  });

  it("writes no table for an enum that declares no tone", () => {
    expect(enumsFile).not.toContain("ColourTones");
  });

  it("leaves the enum declarations themselves as they were", () => {
    expect(enumsFile).toContain("export const MailStatus = {\n  DELIVERED: 'DELIVERED',");
    expect(enumsFile).toContain("export type MailStatusLabeled = LabeledEnumValue<MailStatus>;");
  });

  it("imports no StatusTone where no enum declares a tone", () => {
    const untoned = structuredClone(declared);
    for (const entry of Object.values(untoned.enums)) for (const value of entry.values) delete value.tone;
    const files = generateModelFiles(domainOf(untoned, ["app.Usage"]), { labeledEnum }).files;
    expect(files.get("model/_enums.ts")).not.toContain("StatusTone");
  });

  it("refuses a table whose name a type already holds, and reports it", () => {
    expect(evaluate(enumsFile).ShadeTones).toBeUndefined();
    expect(generated.shadowedDeclarations).toEqual([{ name: "ShadeTones", of: "Shade" }]);
  });
});

describe("generateModelFiles carries field formats into the domain", () => {
  it("writes <Type>FieldFormats with every declared format, inherited fields included", () => {
    expect(evaluate(usageFile).UsageRowFieldFormats).toEqual({
      costMicros: { format: "money", money: { currency: "USD", scale: 6 } },
      credits: { format: "credits" },
      amount: { format: "signedCredits" },
      lastError: { format: "excerpt" },
      sizeBytes: { format: "bytes" },
      latencyMs: { format: "duration" },
    });
  });

  it("writes the table on the ancestor too, for its own fields", () => {
    expect(evaluate(generated.files.get("model/costBase.ts") ?? "").CostBaseFieldFormats).toEqual({
      costMicros: { format: "money", money: { currency: "USD", scale: 6 } },
    });
  });

  it("writes no table for a type none of whose fields declares a format", () => {
    expect(generated.files.get("model/bare.ts")).not.toContain("FieldFormats");
  });

  it("keeps the interface first and unchanged", () => {
    expect(usageFile).toMatch(/export interface UsageRow extends CostBase \{\n {2}credits: number;/);
    expect(usageFile.indexOf("export interface")).toBeLessThan(usageFile.indexOf("export const"));
  });

  it("transpiles every emitted file without a syntax diagnostic", () => {
    for (const [path, content] of generated.files) {
      const transpiled = ts.transpileModule(content, { reportDiagnostics: true });
      expect(transpiled.diagnostics ?? [], path).toEqual([]);
    }
  });
});

describe("the declaration coverage check", () => {
  it("finds nothing missing in the generated output", () => {
    expect(missingDeclarations(domain, generated.files)).toEqual([]);
  });

  it("names a tone the output lost", () => {
    const files = new Map(generated.files);
    files.set("model/_enums.ts", enumsFile.replace("  FAILED: 'danger',\n", ""));
    expect(missingDeclarations(domain, files)).toEqual([
      'MailStatusTones is {"DELIVERED":"success","PENDING":"neutral"}, Meta declares {"DELIVERED":"success","FAILED":"danger","PENDING":"neutral"}',
    ]);
  });

  it("names a format the output lost", () => {
    const files = new Map(generated.files);
    files.set("model/usageRow.ts", usageFile.replace("  latencyMs: { format: 'duration' },\n", ""));
    const found = missingDeclarations(domain, files);
    expect(found).toHaveLength(1);
    expect(found[0]).toMatch(/^UsageRowFieldFormats is .*Meta declares .*"latencyMs"/);
  });

  it("names a table written for nothing", () => {
    const files = new Map(generated.files);
    files.set("model/bare.ts", `${files.get("model/bare.ts")}export const BareFieldFormats = { count: { format: 'code' } } as const;\n`);
    expect(missingDeclarations(domain, files)).toEqual(["BareFieldFormats is written for a type with no formats"]);
  });

  it("finds nothing missing over the whole captured closure, which declares no tone or format", () => {
    const capture: DtoMeta = JSON.parse(
      readFileSync(fileURLToPath(new URL("../meta/__fixtures__/smart-safety-meta.json", import.meta.url)), "utf-8"),
    );
    const tags = [...new Set(capture.operations.map((operation) => operation.tag))];
    const everything = domainOf(capture, tags);
    const files = generateModelFiles(everything, { labeledEnum }).files;
    expect(missingDeclarations(everything, files)).toEqual([]);
    for (const [path, content] of files) {
      expect(content, path).not.toMatch(/export const \w+(?:Tones|FieldFormats)\b/);
    }
  });
});
