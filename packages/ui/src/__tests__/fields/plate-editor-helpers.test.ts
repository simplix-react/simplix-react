import { describe, expect, it } from "vitest";

import {
  isPlateEditorEmpty,
  parsePlateI18nFromJson,
  parsePlateValue,
  plainTextToPlateValue,
  plateValueToText,
} from "../../fields/shared/plate-editor-helpers";
import { EMPTY_EDITOR_VALUE } from "../../fields/plate-editor/types";

const RICH_VALUE = [
  { type: "h1", children: [{ text: "Title" }] },
  {
    type: "p",
    children: [{ text: "Hello " }, { text: "world", bold: true }],
  },
  {
    type: "ul",
    children: [
      { type: "li", children: [{ type: "lic", children: [{ text: "item one" }] }] },
      { type: "li", children: [{ type: "lic", children: [{ text: "item two" }] }] },
    ],
  },
];

describe("plainTextToPlateValue", () => {
  it("wraps each line in a paragraph", () => {
    expect(plainTextToPlateValue("line one\nline two")).toEqual([
      { type: "p", children: [{ text: "line one" }] },
      { type: "p", children: [{ text: "line two" }] },
    ]);
  });
});

describe("parsePlateValue", () => {
  it("returns the empty value for null, undefined, and blank strings", () => {
    expect(parsePlateValue(null, EMPTY_EDITOR_VALUE)).toBe(EMPTY_EDITOR_VALUE);
    expect(parsePlateValue(undefined, EMPTY_EDITOR_VALUE)).toBe(EMPTY_EDITOR_VALUE);
    expect(parsePlateValue("   ", EMPTY_EDITOR_VALUE)).toBe(EMPTY_EDITOR_VALUE);
  });

  it("parses the editor's serialized JSON", () => {
    expect(parsePlateValue(JSON.stringify(RICH_VALUE), EMPTY_EDITOR_VALUE)).toEqual(RICH_VALUE);
  });

  it("treats plain text as one paragraph per line", () => {
    expect(parsePlateValue("first\nsecond", EMPTY_EDITOR_VALUE)).toEqual([
      { type: "p", children: [{ text: "first" }] },
      { type: "p", children: [{ text: "second" }] },
    ]);
  });

  it("treats malformed JSON-like text as plain text", () => {
    expect(parsePlateValue("[not json", EMPTY_EDITOR_VALUE)).toEqual([
      { type: "p", children: [{ text: "[not json" }] },
    ]);
  });
});

describe("plateValueToText", () => {
  it("returns empty string for null, undefined, and blank input", () => {
    expect(plateValueToText(null)).toBe("");
    expect(plateValueToText(undefined)).toBe("");
    expect(plateValueToText("  ")).toBe("");
  });

  it("flattens a parsed value including nested lists and marks", () => {
    expect(plateValueToText(RICH_VALUE)).toBe("Title Hello world item one item two");
  });

  it("flattens the serialized JSON string", () => {
    expect(plateValueToText(JSON.stringify(RICH_VALUE))).toBe("Title Hello world item one item two");
  });

  it("passes plain-text strings through unchanged", () => {
    expect(plateValueToText("plain text value")).toBe("plain text value");
  });
});

describe("parsePlateI18nFromJson", () => {
  it("keeps plain-text languages instead of resetting them to empty", () => {
    const parsed = parsePlateI18nFromJson({ ko: "평문 본문", en: JSON.stringify(RICH_VALUE) }, ["ko", "en", "ja"], EMPTY_EDITOR_VALUE);
    expect(parsed.ko).toEqual([{ type: "p", children: [{ text: "평문 본문" }] }]);
    expect(parsed.en).toEqual(RICH_VALUE);
    expect(isPlateEditorEmpty(parsed.ja)).toBe(true);
  });
});
