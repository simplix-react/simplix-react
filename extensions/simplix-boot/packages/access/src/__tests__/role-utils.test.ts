import { describe, it, expect } from "vitest";
import { normalizeRoles } from "../role-utils.js";

describe("normalizeRoles", () => {
  it("handles string array input", () => {
    expect(normalizeRoles(["ADMIN", "USER"])).toEqual(["ADMIN", "USER"]);
  });

  it("handles objects with roleCode", () => {
    expect(
      normalizeRoles([{ roleCode: "ADMIN" }, { roleCode: "USER" }]),
    ).toEqual(["ADMIN", "USER"]);
  });

  it("handles objects with roleName", () => {
    expect(
      normalizeRoles([{ roleName: "ADMIN" }, { roleName: "USER" }]),
    ).toEqual(["ADMIN", "USER"]);
  });

  it("handles objects with name", () => {
    expect(normalizeRoles([{ name: "ADMIN" }, { name: "USER" }])).toEqual([
      "ADMIN",
      "USER",
    ]);
  });

  it("handles mixed inputs (strings + objects)", () => {
    expect(
      normalizeRoles(["ADMIN", { roleCode: "USER" }, { name: "MANAGER" }]),
    ).toEqual(["ADMIN", "USER", "MANAGER"]);
  });

  it("filters out empty objects", () => {
    expect(normalizeRoles([{ roleCode: "ADMIN" }, {}, "USER"])).toEqual([
      "ADMIN",
      "USER",
    ]);
  });

  it("prefers roleCode over roleName and name", () => {
    expect(
      normalizeRoles([{ roleCode: "A", roleName: "B", name: "C" }]),
    ).toEqual(["A"]);
  });

  it("falls back to roleName when roleCode is missing", () => {
    expect(normalizeRoles([{ roleName: "B", name: "C" }])).toEqual(["B"]);
  });
});
