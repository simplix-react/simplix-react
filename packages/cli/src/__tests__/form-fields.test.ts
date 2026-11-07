import { describe, expect, it } from "vitest";

import { formFieldsOf, verbOnlyCreateDefaultsOf } from "../utils/form-fields.js";

describe("the fields a form writes", () => {
  const fields = [
    { name: "voiceId", isIdentifier: true },
    { name: "name" },
    { name: "nameI18n" },
    { name: "plainName", isI18nPair: true },
    { name: "ownerName", isReferenceName: true },
    { name: "createdAt", isAuditField: true },
    { name: "sortOrder" },
  ];

  it("leave out the order a list's drag owns", () => {
    expect(formFieldsOf(fields, "sortOrder").map((f) => f.name)).toEqual(["name", "nameI18n"]);
  });

  it("keep the order field where nothing reorders", () => {
    expect(formFieldsOf(fields).map((f) => f.name)).toEqual(["name", "nameI18n", "sortOrder"]);
  });
});

describe("a field only a verb moves", () => {
  const fields = [
    { name: "displayName", required: true },
    { name: "enabled", verbOnly: true, required: true, defaultLiteral: "true" },
    { name: "note", verbOnly: true },
  ];

  it("is left out of the form, as the order a drag owns is", () => {
    expect(formFieldsOf(fields).map((f) => f.name)).toEqual(["displayName"]);
  });

  it("starts a new record at the default Meta states, where the create body carries it", () => {
    expect(verbOnlyCreateDefaultsOf(fields, ["displayName", "enabled", "note"], ["displayName", "enabled"])).toEqual([{ name: "enabled", defaultLiteral: "true" }]);
    expect(verbOnlyCreateDefaultsOf(fields, ["displayName"], ["displayName"])).toEqual([]);
  });

  it("sends nothing where the entity has no create", () => {
    expect(verbOnlyCreateDefaultsOf(fields, undefined)).toEqual([]);
  });

  it("is refused where the create body requires it and Meta states no default, since every create would be refused", () => {
    expect(() => verbOnlyCreateDefaultsOf(fields, ["note"], ["note"])).toThrow(/note: only a verb moves it.*no defaultValue/);
  });
});
