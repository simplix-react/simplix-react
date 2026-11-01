import { describe, expect, it } from "vitest";

import { formFieldsOf } from "../utils/form-fields.js";

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
