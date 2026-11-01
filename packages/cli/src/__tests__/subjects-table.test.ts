import { describe, expect, it } from "vitest";

import { ensureTableEntry } from "../utils/subjects-table.js";

const TABLE = [
  "/** The groups, {@link Subject} reads them. */",
  "export const SUBJECTS = {",
  "  /** Job positions (ranks). */",
  '  jobPosition: "ORG_ADMIN",',
  '  userAccount: "USER_ADMIN", // accounts',
  "} as const;",
  "",
  "export type Subject = (typeof SUBJECTS)[keyof typeof SUBJECTS];",
  "",
].join("\n");

describe("a subjects table entry", () => {
  it("goes before the closing brace, under its doc line, and leaves the rest of the file alone", () => {
    const out = ensureTableEntry(TABLE, "SUBJECTS", "catalogVoice", "SPEECH_ADMIN", "Catalog voices.");
    expect(out).toEqual({
      outcome: "added",
      text: TABLE.replace("} as const;", '  /** Catalog voices. */\n  catalogVoice: "SPEECH_ADMIN",\n} as const;'),
    });
  });

  it("is written without a doc line when none is given", () => {
    const out = ensureTableEntry(TABLE, "SUBJECTS", "catalogVoice", "SPEECH_ADMIN");
    expect(out).toMatchObject({ outcome: "added" });
    expect(out.outcome === "added" && out.text).toContain('  userAccount: "USER_ADMIN", // accounts\n  catalogVoice: "SPEECH_ADMIN",\n} as const;');
  });

  it("is not added a second time, and a key it already has keeps its value", () => {
    expect(ensureTableEntry(TABLE, "SUBJECTS", "jobPosition", "OTHER")).toEqual({ outcome: "present" });
    const added = ensureTableEntry(TABLE, "SUBJECTS", "catalogVoice", "SPEECH_ADMIN");
    if (added.outcome !== "added") throw new Error("expected the entry to be added");
    expect(ensureTableEntry(added.text, "SUBJECTS", "catalogVoice", "SPEECH_ADMIN")).toEqual({ outcome: "present" });
  });

  it("takes a quoted key for the key it names", () => {
    expect(ensureTableEntry('export const SUBJECTS = {\n  "job-position": "A",\n} as const;', "SUBJECTS", "job-position", "B")).toEqual({ outcome: "present" });
  });

  it("does not read a key out of a value, a comment or a nested object", () => {
    const text = [
      "export const SUBJECTS = {",
      '  note: "catalogVoice: later, other: x",',
      "  // catalogVoice: commented out",
      "  nested: { catalogVoice: 1 },",
      "} as const;",
    ].join("\n");
    expect(ensureTableEntry(text, "SUBJECTS", "catalogVoice", "A")).toMatchObject({ outcome: "added" });
  });

  it("gives the property before it the comma it lacks, after the value and not after a trailing comment", () => {
    const text = 'export const SUBJECTS = {\n  a: "A" // last one\n};\n';
    const out = ensureTableEntry(text, "SUBJECTS", "b", "B");
    expect(out).toEqual({ outcome: "added", text: 'export const SUBJECTS = {\n  a: "A", // last one\n  b: "B",\n};\n' });
  });

  it("fills an empty table", () => {
    const out = ensureTableEntry("export const SUBJECTS = {\n} as const;\n", "SUBJECTS", "a", "A");
    expect(out).toEqual({ outcome: "added", text: 'export const SUBJECTS = {\n  a: "A",\n} as const;\n' });
  });

  it("reads a table declared with a type annotation under another name", () => {
    const text = "export const GROUPS: Record<string, string> = {\n};\n";
    expect(ensureTableEntry(text, "GROUPS", "a", "A")).toMatchObject({ outcome: "added" });
    expect(ensureTableEntry(text, "SUBJECTS", "a", "A")).toEqual({ outcome: "no-table" });
  });

  it("reports a table it cannot rewrite instead of rewriting it", () => {
    expect(ensureTableEntry("const SUBJECTS = {};\n", "SUBJECTS", "a", "A")).toEqual({ outcome: "no-table" });
    expect(ensureTableEntry('export const SUBJECTS = { a: "A" };\n', "SUBJECTS", "b", "B")).toEqual({ outcome: "inline-table" });
    expect(ensureTableEntry("export const SUBJECTS = {\n  /* never closed\n", "SUBJECTS", "b", "B")).toEqual({ outcome: "no-table" });
  });
});
