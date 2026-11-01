import { describe, expect, it } from "vitest";

import { fixtureRows } from "../utils/story-fixtures.js";

describe("story fixture rows", () => {
  it("give a json field an object, so the frame draws a structured value as the screen does", () => {
    const [row] = fixtureRows([{ name: "payload", contractKind: "json" }, { name: "note", contractKind: "text" }], "eventId", "event", 1);
    expect(row.payload).toEqual({ id: "payload-1", sequence: 1 });
    expect(row.note).toBe("note 1");
  });

  it("fill a multilingual field in every shipped language, so the frame draws a translated record", () => {
    const [row] = fixtureRows([{ name: "nameI18n", contractKind: "i18nText", baseFieldName: "name" }, { name: "name", contractKind: "text" }], "planId", "plan", 1, ["en", "ko"]);
    expect(row.nameI18n).toEqual({ en: "name 1", ko: "name 1" });
    expect(row.name).toBe("name 1");
  });

  it("leave a multilingual field to its kind when no language is given", () => {
    const [row] = fixtureRows([{ name: "nameI18n", contractKind: "i18nText", baseFieldName: "name" }], "planId", "plan", 1);
    expect(row.nameI18n).toBe("nameI18n 1");
  });
});
