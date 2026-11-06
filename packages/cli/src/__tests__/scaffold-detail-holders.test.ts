import { fileURLToPath } from "node:url";
import ts from "typescript";
import { describe, expect, it, vi } from "vitest";

import { holderImportsOf, holdersOf } from "../commands/scaffold-crud.js";
import { loadMetaHolders } from "../meta/scaffold-source.js";
import type { OpenApiNamingStrategy } from "../openapi/naming/naming-strategy.js";
import type { ContainerMapping } from "../openapi/orchestration/spec-profile.js";
import { registerSpecProfile } from "../openapi/plugin-registry.js";
import { renderTemplate } from "../utils/template.js";

/**
 * An account whose notes point at it twice: once through the note's subject (`userId`) and once
 * through its author (`authorId`). Both holders are the same entity, so their sub-lists read the
 * same list hook and the same access rule.
 */
vi.mock("../config/config-loader.js", async () => {
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const { mkdtempSync, readFileSync, writeFileSync } = await import("node:fs");
  const { fileURLToPath: toPath } = await import("node:url");
  const document = JSON.parse(readFileSync(toPath(new URL("../meta/__fixtures__/user-note-meta.json", import.meta.url)), "utf-8"));
  document.entities.UserAccount.holders.push({ entity: "UserNote", field: "authorId", operators: ["EQUALS"] });
  const snapshot = join(mkdtempSync(join(tmpdir(), "detail-holders-")), "meta.json");
  writeFileSync(snapshot, JSON.stringify(document));
  return {
    loadConfig: vi.fn(async () => ({
      openapi: [{ profile: "detail-holders-test", domains: { user: ["user.admin.UserNote"] }, meta: { snapshot } }],
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
registerSpecProfile("detail-holders-test", { naming: simplixBootNaming, responseAdapter: "raw", containerTypes });

const PACKAGE = "@test/domain-user";

/** The holder context the detail template is handed for the account. */
async function accountContext() {
  const metaHolders = await loadMetaHolders("/unused", "userAccount");
  const holders = await holdersOf(metaHolders, { packageOf: async () => PACKAGE });
  return { holders, holderImports: holderImportsOf(holders) };
}

/** The body a detail template draws per holder: each sub-list names its hook and its access rule. */
const HOLDER_BODY = [
  "export function holderTabs(id: string) {",
  "  return [",
  "{{#each holders}}",
  '    { key: "{{this.key}}", allowed: {{this.accessList}}, list: {{this.hookList}}({ "{{this.filterKey}}": id }) },',
  "{{/each}}",
  "  ];",
  "}",
  "",
].join("\n");

/** The import block the kit template wrote before the grouped imports: one statement per holder. */
const PER_HOLDER_IMPORTS = '{{#each holders}}\nimport { {{this.accessList}}, {{this.hookList}} } from "{{this.packageName}}";\n{{/each}}\n';

/** The import block over the grouped imports. */
const GROUPED_IMPORTS = '{{#each holderImports}}\nimport { {{this.names}} } from "{{this.packageName}}";\n{{/each}}\n';

/**
 * The compiler's diagnostics for one rendered file, every module it imports declared as a module
 * of any shape. Binding errors (a name imported twice, a name used and never imported) are
 * semantic, so `transpileModule` does not report them and a program is built instead.
 */
function typeErrors(source: string): { code: number; text: string }[] {
  const files = new Map([
    ["/detail.tsx", source],
    ["/stubs.d.ts", `declare module "${PACKAGE}";\n`],
  ]);
  const options: ts.CompilerOptions = { strict: true, noEmit: true, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, moduleResolution: ts.ModuleResolutionKind.Bundler, types: [], noLib: true };
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
    // No standard library is loaded, so the global types it would declare are reported missing;
    // what is asked here is only whether the file's own bindings hold.
    .filter((one) => one.file?.fileName === "/detail.tsx")
    .map((one) => ({ code: one.code, text: ts.flattenDiagnosticMessageText(one.messageText, "\n") }));
}

describe("a detail whose record two holders of one entity point at", () => {
  it("has two sub-lists of the same entity, each forced by its own key", async () => {
    const { holders } = await accountContext();
    expect(holders.map((one) => one.key)).toEqual(["userNoteByUserId", "userNoteByAuthorId"]);
    expect(new Set(holders.map((one) => one.hookList)).size).toBe(1);
  });

  it("imports each hook and access rule once, in one statement for the package", async () => {
    const { holderImports } = await accountContext();
    expect(holderImports).toEqual([{ packageName: PACKAGE, names: "listUserNotesAccess, useListUserNotes" }]);
  });

  it("type-checks with the grouped imports", async () => {
    const rendered = renderTemplate(GROUPED_IMPORTS + HOLDER_BODY, await accountContext());
    expect(rendered.match(/^import /gm)).toHaveLength(1);
    expect(typeErrors(rendered)).toEqual([]);
  });

  it("does not type-check with an import per holder, which binds the shared names twice", async () => {
    const rendered = renderTemplate(PER_HOLDER_IMPORTS + HOLDER_BODY, await accountContext());
    expect(typeErrors(rendered).map((one) => one.code)).toContain(2300);
  });
});

describe("the grouped imports of holders across packages", () => {
  const holder = (packageName: string, list: string) => ({ packageName, hookList: `use${list.charAt(0).toUpperCase()}${list.slice(1)}`, accessList: `${list}Access` });

  it("keep the order the packages first come in and sort the names inside each", () => {
    const imports = holderImportsOf([holder("@b/domain", "searchVoice"), holder("@a/domain", "searchNote"), holder("@b/domain", "listClip")]);
    expect(imports).toEqual([
      { packageName: "@b/domain", names: "listClipAccess, searchVoiceAccess, useListClip, useSearchVoice" },
      { packageName: "@a/domain", names: "searchNoteAccess, useSearchNote" },
    ]);
  });

  it("are none for a record no holder points at", () => {
    expect(holderImportsOf([])).toEqual([]);
  });
});
