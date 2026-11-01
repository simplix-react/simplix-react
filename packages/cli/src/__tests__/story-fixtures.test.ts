import { describe, expect, it } from "vitest";

import { fixtureRows } from "../utils/story-fixtures.js";

describe("story fixture rows", () => {
  it("give a json field an object, so the frame draws a structured value as the screen does", () => {
    const [row] = fixtureRows([{ name: "payload", contractKind: "json" }, { name: "note", contractKind: "text" }], "eventId", "event", 1);
    expect(row.payload).toEqual({ id: "payload-1", sequence: 1 });
    expect(row.note).toBe("note 1");
  });
});
