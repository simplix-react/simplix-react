import { describe, expect, it } from "vitest";

import { scaffoldRoles } from "../utils/scaffold-roles.js";

describe("the roles a screen is scaffolded from", () => {
  const meta = { list: "listEntries", search: "searchEntries", aggregates: "getEntryAggregates", statusCounts: "getEntryStatusCounts" };

  it("take the figure roles a hand-written entry leaves out from Meta", () => {
    expect(scaffoldRoles({ list: "listEntries", get: "getEntry" }, meta)).toEqual({
      list: "listEntries",
      get: "getEntry",
      aggregates: "getEntryAggregates",
      statusCounts: "getEntryStatusCounts",
    });
  });

  it("keep every role the hand-written entry names, figures included", () => {
    expect(scaffoldRoles({ list: "listOwn", aggregates: "getOwnAggregates" }, meta)).toEqual({
      list: "listOwn",
      aggregates: "getOwnAggregates",
      statusCounts: "getEntryStatusCounts",
    });
  });

  it("never take an operation role from Meta into a hand-written entry", () => {
    expect(scaffoldRoles({ list: "listEntries" }, { ...meta, create: "createEntry" })?.create).toBeUndefined();
  });

  it("read Meta alone where there is no entry", () => {
    expect(scaffoldRoles(undefined, meta)).toEqual(meta);
    expect(scaffoldRoles(undefined, undefined)).toBeNull();
  });
});
