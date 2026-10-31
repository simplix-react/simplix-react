import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { describe, expect, it } from "vitest";

import { checkCycles } from "../checks/import-cycles.js";
import { findMetaRemovals, readSourceTexts } from "../checks/meta-removals.js";
import { resolveMetaSnapshot } from "../commands/meta-removals.js";

interface CycleCase {
  name: string;
  verbatim: boolean;
  files: Record<string, string>;
  links?: Record<string, string>;
  roots?: string[];
  cycles: number;
  unresolved?: number;
}

const CASES: CycleCase[] = [
  {
    name: "a value import back to the importer is a cycle",
    verbatim: true,
    files: { "a/x.ts": 'import { b } from "./y"; export const a = b;', "a/y.ts": 'import { a } from "./x"; export const b = a;' },
    cycles: 1,
  },
  {
    name: "an `import type` back edge is erased and leaves no cycle",
    verbatim: true,
    files: { "a/x.ts": 'import { b } from "./y"; export const a = b;', "a/y.ts": 'import type { a } from "./x"; export const b = 1 as unknown as typeof a;' },
    cycles: 0,
  },
  {
    name: "an inline type-only import is an edge when verbatimModuleSyntax is set",
    verbatim: true,
    files: { "a/x.ts": 'import { b } from "./y"; export const a = b;', "a/y.ts": 'import { type a } from "./x"; export const b = 1 as unknown as typeof a;' },
    cycles: 1,
  },
  {
    name: "an inline type-only import is erased when verbatimModuleSyntax is not set",
    verbatim: false,
    files: { "a/x.ts": 'import { b } from "./y"; export const a = b;', "a/y.ts": 'import { type a } from "./x"; export const b = 1 as unknown as typeof a;' },
    cycles: 0,
  },
  {
    name: "a barrel that re-exports a file importing the barrel is a cycle",
    verbatim: true,
    files: { "a/index.ts": 'export { widget } from "./widget";', "a/widget.ts": 'import { other } from "./index"; export const widget = other;' },
    cycles: 1,
  },
  {
    name: "`export type` re-exports leave no edge",
    verbatim: true,
    files: { "a/index.ts": 'export type { Widget } from "./widget";', "a/widget.ts": 'import { value } from "./index"; export type Widget = typeof value;' },
    cycles: 0,
  },
  {
    name: "a dynamic import back to the importer is a cycle",
    verbatim: true,
    files: { "a/x.ts": 'export const load = () => import("./y");', "a/y.ts": 'import { load } from "./x"; export const b = load;' },
    cycles: 1,
  },
  {
    name: "a cycle through two workspace packages is found at the files",
    verbatim: true,
    files: {
      "p/a/src/index.ts": 'import { b } from "@fx/b"; export const a = b;',
      "p/b/src/index.ts": 'import { a } from "@fx/a"; export const b = a;',
      "p/a/package.json": '{ "name": "@fx/a", "exports": { ".": { "source": "./src/index.ts", "import": "./dist/index.js" } } }',
      "p/b/package.json": '{ "name": "@fx/b", "exports": { ".": { "source": "./src/index.ts", "import": "./dist/index.js" } } }',
    },
    links: { "node_modules/@fx/a": "p/a", "node_modules/@fx/b": "p/b" },
    roots: ["p"],
    cycles: 1,
  },
  {
    name: "a chain with no way back is not a cycle",
    verbatim: true,
    files: { "a/x.ts": 'import { b } from "./y"; export const a = b;', "a/y.ts": 'import { c } from "./z"; export const b = c;', "a/z.ts": "export const c = 1;" },
    cycles: 0,
  },
  {
    name: "a relative import that does not resolve is reported, not skipped",
    verbatim: true,
    files: { "a/x.ts": 'import { missing } from "./gone"; export const a = missing;' },
    cycles: 0,
    unresolved: 1,
  },
];

describe("checkCycles", () => {
  it.each(CASES)("$name", (testCase) => {
    const directory = mkdtempSync(join(tmpdir(), "simplix-cycles-"));
    try {
      writeFileSync(join(directory, "tsconfig.json"), JSON.stringify({ compilerOptions: { verbatimModuleSyntax: testCase.verbatim } }));
      for (const [name, text] of Object.entries(testCase.files)) {
        mkdirSync(dirname(join(directory, name)), { recursive: true });
        writeFileSync(join(directory, name), text);
      }
      for (const [link, target] of Object.entries(testCase.links ?? {})) {
        mkdirSync(dirname(join(directory, link)), { recursive: true });
        symlinkSync(join(directory, target), join(directory, link), "dir");
      }
      const result = checkCycles(directory, testCase.roots ?? ["a"]);
      expect(result.cycles.length).toBe(testCase.cycles);
      expect(result.unresolved.length).toBe(testCase.unresolved ?? 0);
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });
});

describe("findMetaRemovals", () => {
  const before = {
    types: { AuditEventListDTO: { fields: [{ name: "category" }, { name: "details" }] } },
    operations: [{ operationId: "AuditRest_search" }],
    enums: { JobStatus: { values: [{ name: "DEAD" }, { name: "DONE" }] } },
  };
  const reordered = {
    types: { AuditEventListDTO: { fields: [{ name: "details" }, { name: "category" }] } },
    operations: [{ operationId: "AuditRest_search" }],
    enums: { JobStatus: { values: [{ name: "DONE" }, { name: "DEAD" }] } },
  };
  const dropped = {
    types: { AuditEventListDTO: { fields: [{ name: "details" }] } },
    operations: [],
    enums: { JobStatus: { values: [{ name: "DONE" }] } },
  };
  const sources = [{ path: "screen.tsx", text: "row.category; api.AuditRest_search(); status === 'DEAD'" }];

  it("passes a reorder", () => {
    expect(findMetaRemovals(before, reordered, sources, new Set())).toEqual([]);
  });
  it("fails each removal code still names", () => {
    expect(findMetaRemovals(before, dropped, sources, new Set()).map((r) => r.key)).toEqual([
      "field AuditEventListDTO.category",
      "operation AuditRest_search",
      "enumValue JobStatus.DEAD",
    ]);
  });
  it("passes an acknowledged removal", () => {
    const ack = new Set(["field AuditEventListDTO.category", "operation AuditRest_search", "enumValue JobStatus.DEAD"]);
    expect(findMetaRemovals(before, dropped, sources, ack)).toEqual([]);
  });
  it("passes a removal nothing names", () => {
    expect(findMetaRemovals(before, dropped, [{ path: "x.ts", text: "nothing" }], new Set())).toEqual([]);
  });
  it("leaves the snapshot itself out of the sources", () => {
    const directory = mkdtempSync(join(tmpdir(), "simplix-meta-removals-"));
    try {
      mkdirSync(join(directory, "src"));
      writeFileSync(join(directory, "src/meta.json"), "category");
      writeFileSync(join(directory, "src/screen.ts"), "category");
      expect(readSourceTexts(directory, ["src"], new Set(["src/meta.json"])).map((s) => s.path)).toEqual(["src/screen.ts"]);
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });
});

describe("resolveMetaSnapshot", () => {
  it("prefers the named snapshot", () => {
    expect(resolveMetaSnapshot({ checks: { metaRemovals: { snapshot: "a.json" } }, openapi: [{ domains: {}, meta: { snapshot: "b.json" } }] })).toBe("a.json");
  });
  it("takes the one declared meta snapshot", () => {
    expect(resolveMetaSnapshot({ openapi: [{ domains: {}, meta: { snapshot: "b.json" } }] })).toBe("b.json");
  });
  it("refuses to choose between two", () => {
    expect(resolveMetaSnapshot({ openapi: [{ domains: {}, meta: { snapshot: "b.json" } }, { domains: {}, meta: { snapshot: "c.json" } }] })).toBeUndefined();
  });
});
